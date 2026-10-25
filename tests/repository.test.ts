import { test } from "node:test";
import assert from "node:assert/strict";
import { snapshotRepository } from "../src/lib/repository";
const sha = "a".repeat(40);
test("repository fetch pins files to a commit and discloses skipped source", async () => {
  const original = global.fetch,
    token = process.env.GITLAB_TOKEN;
  process.env.GITLAB_TOKEN = "test";
  const urls: string[] = [];
  global.fetch = (async (url) => {
    const path = String(url);
    urls.push(path);
    if (path.includes("/commits/")) return Response.json({ id: sha });
    if (path.includes("/tree?"))
      return Response.json([
        { path: "service.py", type: "blob", mode: "100644" },
        { path: "large.py", type: "blob", mode: "100644" },
        { path: "linked.py", type: "blob", mode: "120000" },
        { path: "readme.md", type: "blob", mode: "100644" },
      ]);
    if (path.includes("large.py")) return Response.json({ size: 100001 });
    if (path.includes("/files/"))
      return Response.json({
        size: 12,
        encoding: "base64",
        content: Buffer.from('print("ok")').toString("base64"),
      });
    return Response.json({
      id: 7,
      path_with_namespace: "team/project",
      web_url: "https://gitlab.com/team/project",
    });
  }) as typeof fetch;
  try {
    const result = await snapshotRepository("7", "main");
    assert.equal(result.files.length, 1);
    assert.equal(result.repository.commit, sha);
    assert.equal(result.repository.complete, false);
    assert.equal(result.repository.skipped.length, 2);
    assert.ok(
      urls
        .filter((x) => x.includes("/files/"))
        .every((x) => x.endsWith(`ref=${sha}`)),
    );
  } finally {
    global.fetch = original;
    if (token === undefined) delete process.env.GITLAB_TOKEN;
    else process.env.GITLAB_TOKEN = token;
  }
});
test("repository fetch rejects an empty or unsupported source instead of claiming coverage", async () => {
  const original = global.fetch,
    token = process.env.GITLAB_TOKEN;
  process.env.GITLAB_TOKEN = "test";
  global.fetch = (async (url) =>
    String(url).includes("/commits/")
      ? Response.json({ id: sha })
      : String(url).includes("/tree?")
        ? Response.json([])
        : Response.json({ id: 7 })) as typeof fetch;
  try {
    await assert.rejects(
      () => snapshotRepository("7", "main"),
      /No supported Python/,
    );
  } finally {
    global.fetch = original;
    if (token === undefined) delete process.env.GITLAB_TOKEN;
    else process.env.GITLAB_TOKEN = token;
  }
});
