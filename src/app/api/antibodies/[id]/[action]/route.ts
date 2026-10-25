import { snapshotRepository } from "@/lib/repository";
import { RequestError, readJson } from "@/lib/http";
import { incidentInput } from "@/lib/model";
import { randomUUID } from "node:crypto";
import { saveAntibody } from "@/lib/store";
import { validateRuleText } from "@/lib/engine";
import { getAntibody, updateAntibody } from "@/lib/store";
import { validateAntibody } from "@/lib/engine";
import { stringify } from "yaml";
export const runtime = "nodejs";
export const maxDuration = 300;
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string; action: string }> },
) {
  const { id, action } = await params;
  const a = await getAntibody(id);
  if (!a)
    return Response.json({ error: "Antibody not found" }, { status: 404 });
  try {
    if (action === "revise") {
      const input = incidentInput.parse(await readJson(req));
      validateRuleText(input.rule);
      const { repositorySource, ...draft } = input;
      const snapshot = repositorySource
        ? await snapshotRepository(
            repositorySource.projectId,
            repositorySource.ref,
          )
        : a.repository
          ? { files: a.files, repository: a.repository }
          : { files: input.files };
      const now = new Date().toISOString();
      const revised = await saveAntibody({
        ...draft,
        ...snapshot,
        id: randomUUID(),
        createdAt: now,
        updatedAt: now,
        status: "draft",
        checks: [],
        findings: [],
        derivedFrom: a.id,
        events: [
          {
            at: now,
            message: `New draft derived from ${a.id}${a.synthesis ? `; reviewed proposal from Duo session ${a.synthesis.id}` : ""}. Validation is required.`,
          },
        ],
      });
      return Response.json(revised, { status: 201 });
    }
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
          if (
            x.status !== "validated" ||
            x.checks.length < 2 ||
            !x.checks.every((c) => c.passed)
          )
            throw new RequestError(
              "Fresh successful validation is required.",
              409,
            );
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
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Action failed" },
      { status: error instanceof RequestError ? error.status : 400 },
    );
  }
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
          derivedFrom: a.derivedFrom,
          synthesis: a.synthesis,
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
