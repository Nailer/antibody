import { readJson } from "@/lib/http";
import { getAntibody, updateAntibody } from "@/lib/store";
import { createRollout, synthesize, gitlab, getDuoSession } from "@/lib/gitlab";
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
    const { action } = await readJson(req, 1000);
    if (action !== "rollout" && action !== "synthesize")
      return Response.json(
        { error: "Unsupported GitLab action" },
        { status: 400 },
      );
    if (action === "synthesize" && a.synthesis)
      return Response.json(a.synthesis);
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
    await updateAntibody(id, (x) => {
      if (action === "synthesize" && "id" in result)
        x.synthesis = {
          id: result.id,
          url: result.url,
          status: result.status,
          startedAt: new Date().toISOString(),
        };
      x.events.push({
        at: new Date().toISOString(),
        message: `${action === "rollout" ? "GitLab rollout MR created" : "Duo synthesis session started"}: ${result.url}`,
      });
    });
    return Response.json(result);
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 502 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const a = await getAntibody(id);
  if (!a)
    return Response.json({ error: "Antibody not found" }, { status: 404 });
  if (new URL(req.url).searchParams.get("action") === "synthesis") {
    if (!a.synthesis)
      return Response.json(
        { error: "Start a Duo session first." },
        { status: 409 },
      );
    try {
      const result = await getDuoSession(a.synthesis.id);
      await updateAntibody(id, (x) => {
        if (x.synthesis?.id === a.synthesis!.id)
          x.synthesis = { ...x.synthesis, ...result };
      });
      return Response.json(result);
    } catch (error) {
      return Response.json(
        { error: (error as Error).message },
        { status: 502 },
      );
    }
  }
  const url = a.events
    .find((e) => e.message.startsWith("GitLab rollout MR created: "))
    ?.message.slice("GitLab rollout MR created: ".length);
  const iid = url?.match(/\/-\/merge_requests\/(\d+)$/)?.[1];
  if (!iid)
    return Response.json(
      { error: "Create a rollout merge request first." },
      { status: 409 },
    );
  try {
    const project = a.repository
      ? String(a.repository.projectId)
      : process.env.GITLAB_PROJECT_ID;
    if (!project) throw Error("GitLab project is not configured.");
    const p = encodeURIComponent(project);
    const [mr, info, pipelines] = await Promise.all([
      gitlab(`/projects/${p}/merge_requests/${iid}`),
      gitlab(`/projects/${p}`),
      gitlab(`/projects/${p}/merge_requests/${iid}/pipelines?per_page=5`),
    ]);
    return Response.json({
      state: mr.state,
      history: pipelines.map(
        (pipeline: {
          id: number;
          status: string;
          sha: string;
          web_url: string;
        }) => ({
          id: pipeline.id,
          status: pipeline.status,
          sha: pipeline.sha,
          url: pipeline.web_url,
        }),
      ),
      pipeline: mr.head_pipeline
        ? { status: mr.head_pipeline.status, url: mr.head_pipeline.web_url }
        : null,
      requiresSuccessfulPipeline:
        info.only_allow_merge_if_pipeline_succeeds === true,
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 502 });
  }
}
