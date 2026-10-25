import { gitlab, gitlabResponse } from "./gitlab";
import type { RepositorySnapshot } from "./model";

const maxFiles = 30,
  maxFileBytes = 100000,
  maxTotalBytes = 400000,
  maxEntries = 1000;
export async function snapshotRepository(projectId: string, ref: string) {
  const started = Date.now();
  const p = encodeURIComponent(projectId);
  const project = await gitlab(`/projects/${p}`);
  const commit = await gitlab(
    `/projects/${p}/repository/commits/${encodeURIComponent(ref)}`,
  );
  if (!/^[a-f0-9]{40,64}$/.test(commit.id))
    throw new Error("GitLab did not return a valid immutable commit.");
  const files: { path: string; content: string }[] = [];
  const skipped: RepositorySnapshot["skipped"] = [];
  let token: string | undefined,
    entries = 0,
    bytes = 0,
    treeTruncated = false;
  do {
    if (Date.now() - started > 80000)
      throw new Error(
        "Repository fetch timed out. Try a smaller repository. No draft was saved.",
      );
    const query = new URLSearchParams({
      ref: commit.id,
      recursive: "true",
      per_page: "100",
      pagination: "keyset",
    });
    if (token) query.set("page_token", token);
    const response = await gitlabResponse(
      `/projects/${p}/repository/tree?${query}`,
    );
    const tree = (await response.json()) as {
      path: string;
      type: string;
      mode: string;
    }[];
    if (!Array.isArray(tree) || tree.length > 100)
      throw new Error("Unexpected repository tree response.");
    for (const entry of tree) {
      entries++;
      if (entry.type !== "blob" || !entry.path.endsWith(".py")) continue;
      if (
        entry.mode === "120000" ||
        entry.path.startsWith("/") ||
        entry.path.split("/").some((x) => x === ".." || x === "") ||
        !/^[a-zA-Z0-9_./-]+$/.test(entry.path) ||
        entry.path.length > 180
      ) {
        skipped.push({
          path: entry.path,
          reason: "Unsupported path or symbolic link",
        });
        continue;
      }
      if (files.length >= maxFiles) {
        skipped.push({ path: entry.path, reason: "30-file limit" });
        continue;
      }
      if (Date.now() - started > 80000)
        throw new Error("Repository fetch timed out. No draft was saved.");
      const file = await gitlab(
        `/projects/${p}/repository/files/${encodeURIComponent(entry.path)}?ref=${commit.id}`,
      );
      if (file.size > maxFileBytes) {
        skipped.push({ path: entry.path, reason: "File exceeds 100 KB" });
        continue;
      }
      if (file.encoding !== "base64" || typeof file.content !== "string")
        throw new Error("Unsupported GitLab source encoding.");
      const buffer = Buffer.from(file.content, "base64");
      if (
        buffer.length > maxFileBytes ||
        bytes + buffer.length > maxTotalBytes
      ) {
        skipped.push({ path: entry.path, reason: "Source size limit" });
        continue;
      }
      if (buffer.includes(0)) {
        skipped.push({ path: entry.path, reason: "Binary source" });
        continue;
      }
      files.push({ path: entry.path, content: buffer.toString("utf8") });
      bytes += buffer.length;
    }
    const next = response.headers
      .get("link")
      ?.split(",")
      .find((link) => /rel="next"/.test(link))
      ?.match(/<([^>]+)>/)?.[1];
    token = next
      ? new URL(next).searchParams.get("page_token") || undefined
      : undefined;
    if (next && !token)
      throw new Error("GitLab did not return a supported pagination cursor.");
    if (entries >= maxEntries && token) {
      treeTruncated = true;
      break;
    }
  } while (token);
  if (!files.length)
    throw new Error(
      "No supported Python files were fetched. Check the revision and file limits.",
    );
  const repository: RepositorySnapshot = {
    projectId: project.id,
    projectPath: project.path_with_namespace,
    webUrl: project.web_url,
    ref,
    commit: commit.id,
    fetchedAt: new Date().toISOString(),
    scannedFiles: files.length,
    complete: !treeTruncated && !skipped.length,
    skipped,
    treeTruncated,
  };
  return { files, repository };
}
export function sourceLink(
  repository: RepositorySnapshot,
  path: string,
  line: number,
) {
  return `${repository.webUrl}/-/blob/${repository.commit}/${path.split("/").map(encodeURIComponent).join("/")}#L${line}`;
}
