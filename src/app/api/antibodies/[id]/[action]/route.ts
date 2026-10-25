import { getAntibody, updateAntibody } from "@/lib/store";
import { validateAntibody } from "@/lib/engine";
import { stringify } from "yaml";
export const runtime = "nodejs";
export const maxDuration = 180;
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string; action: string }> },
) {
  const { id, action } = await params;
  const a = await getAntibody(id);
  if (!a)
    return Response.json({ error: "Antibody not found" }, { status: 404 });
  if (action === "validate") {
    if (a.status === "running" || a.status === "approved")
      return Response.json(
        { error: "This antibody cannot be validated in its current state." },
        { status: 409 },
      );
    return Response.json(await validateAntibody(id));
  }
  if (action === "approve") {
    if (
      a.status !== "validated" ||
      a.checks.length < 2 ||
      !a.checks.every((c) => c.passed)
    )
      return Response.json(
        { error: "Successful validation is required before approval." },
        { status: 409 },
      );
    return Response.json(
      await updateAntibody(id, (x) => {
        x.status = "approved";
        x.approvedAt = new Date().toISOString();
        x.events.push({
          at: x.approvedAt,
          message:
            "Operator approved this validated prevention pack. Export is available; rollout is not automatic.",
        });
      }),
    );
  }
  return Response.json({ error: "Unknown action" }, { status: 404 });
}
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string; action: string }> },
) {
  const { id, action } = await params;
  const a = await getAntibody(id);
  if (!a) return Response.json({ error: "Not found" }, { status: 404 });
  if (a.status !== "approved")
    return Response.json(
      { error: "Approve validated evidence before exporting." },
      { status: 409 },
    );
  if (action === "rule")
    return new Response(a.rule, {
      headers: {
        "Content-Type": "application/yaml",
        "Content-Disposition": `attachment; filename="antibody-${id}.yml"`,
      },
    });
  if (action === "evidence")
    return new Response(
      JSON.stringify(
        {
          id: a.id,
          title: a.title,
          approvedAt: a.approvedAt,
          checks: a.checks,
          repository: a.repository,
          findings: a.findings,
          events: a.events,
          limitations:
            "Validation covers supplied fixtures only. Scan findings require review; no organization-wide false-positive rate is established.",
        },
        null,
        2,
      ),
      {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="antibody-${id}-evidence.json"`,
        },
      },
    );
  if (action === "ci")
    return new Response(
      stringify({
        antibody: {
          image: "semgrep/semgrep:1.182.1",
          stage: "test",
          script: [
            `semgrep scan --config .antibody/${id}.yml --error --metrics=off .`,
          ],
          allow_failure: false,
        },
      }),
      {
        headers: {
          "Content-Type": "application/yaml",
          "Content-Disposition": 'attachment; filename="antibody-ci.yml"',
        },
      },
    );
  return Response.json({ error: "Not found" }, { status: 404 });
}
