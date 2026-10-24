import { getAntibody, updateAntibody } from "@/lib/store";
import { createRollout, synthesize } from "@/lib/gitlab";
export const runtime = "nodejs";
export const maxDuration = 120;
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const a = await getAntibody(id);
  if (!a) return Response.json({ error: "Not found" }, { status: 404 });
  try {
    const { action } = await req.json();
    if (action !== "rollout" && action !== "synthesize")
      return Response.json(
        { error: "Unsupported GitLab action" },
        { status: 400 },
      );
    const prior =
      action === "rollout"
        ? a.events.find((e) =>
            e.message.startsWith("GitLab rollout MR created: "),
          )
        : undefined;
    if (prior)
      return Response.json({
        url: prior.message.slice("GitLab rollout MR created: ".length),
      });
    const result =
      action === "rollout" ? await createRollout(a) : await synthesize(a);
    await updateAntibody(id, (x) =>
      x.events.push({
        at: new Date().toISOString(),
        message: `${action === "rollout" ? "GitLab rollout MR created" : "Duo synthesis session started"}: ${result.url}`,
      }),
    );
    return Response.json(result);
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 502 });
  }
}
