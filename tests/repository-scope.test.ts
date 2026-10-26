import { test } from "node:test";
import assert from "node:assert/strict";
import { GET } from "../src/app/api/repositories/route";

test("scoped hosting discovers its configured project without an account-wide API request", async () => {
  const saved = { ...process.env };
  const original = globalThis.fetch;
  const paths: string[] = [];
  process.env.GITLAB_TOKEN = "test-scoped-token";
  process.env.GITLAB_URL = "https://gitlab.com";
  process.env.GITLAB_PROJECT_ID = "88074697";
  process.env.GITLAB_PROJECT_SCOPE = "configured";
  globalThis.fetch = async (input) => {
    paths.push(String(input));
    return Response.json({
      id: 88074697,
      path_with_namespace: "team/showcase",
      default_branch: "main",
    });
  };
  try {
    const found = await GET(
      new Request("https://workspace.example/api/repositories?search=SHOWCASE"),
    );
    assert.equal(found.status, 200);
    assert.deepEqual((await found.json()).projects, [
      { id: 88074697, path: "team/showcase", defaultBranch: "main" },
    ]);
    const absent = await GET(
      new Request(
        "https://workspace.example/api/repositories?search=unrelated",
      ),
    );
    assert.deepEqual((await absent.json()).projects, []);
    assert.ok(
      paths.every(
        (path) => path === "https://gitlab.com/api/v4/projects/88074697",
      ),
    );
  } finally {
    globalThis.fetch = original;
    for (const key of Object.keys(process.env))
      if (!(key in saved)) delete process.env[key];
    Object.assign(process.env, saved);
  }
});
