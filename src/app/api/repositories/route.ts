import { gitlab } from "@/lib/gitlab";
export const runtime = "nodejs";
export async function GET(req: Request) {
  try {
    const query = new URL(req.url).searchParams;
    const project = query.get("project");
    if (project) {
      if (project.length > 200)
        return Response.json({ error: "Invalid project" }, { status: 400 });
      const branches = await gitlab(
        `/projects/${encodeURIComponent(project)}/repository/branches?per_page=100`,
      );
      return Response.json({
        branches: branches.map((b: { name: string }) => b.name),
        limited: branches.length === 100,
      });
    }
    const search = (query.get("search") || "").slice(0, 100);
    if (process.env.GITLAB_PROJECT_SCOPE === "configured") {
      const configured = process.env.GITLAB_PROJECT_ID;
      if (!configured)
        throw new Error("The workspace project is not configured.");
      const p = await gitlab(`/projects/${encodeURIComponent(configured)}`);
      const matches = String(p.path_with_namespace)
        .toLowerCase()
        .includes(search.toLowerCase());
      return Response.json({
        projects: matches
          ? [
              {
                id: p.id,
                path: p.path_with_namespace,
                defaultBranch: p.default_branch,
              },
            ]
          : [],
        limited: false,
        scope: "configured",
      });
    }
    const projects = await gitlab(
      `/projects?membership=true&archived=false&per_page=50&simple=true&search=${encodeURIComponent(search)}`,
    );
    return Response.json({
      projects: projects.map(
        (p: {
          id: number;
          path_with_namespace: string;
          default_branch: string;
        }) => ({
          id: p.id,
          path: p.path_with_namespace,
          defaultBranch: p.default_branch,
        }),
      ),
      limited: projects.length === 50,
    });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 502 });
  }
}
