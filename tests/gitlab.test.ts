import { test } from "node:test";
import assert from "node:assert/strict";
import { parse } from "yaml";
import { preventionJob, gitlab } from "../src/lib/gitlab";
test("prevention jobs fail pipelines on matches and use unique job names", () => {
  const a = parse(preventionJob("one"));
  const b = parse(preventionJob("two"));
  assert.notEqual(Object.keys(a)[0], Object.keys(b)[0]);
  const job = Object.values(a)[0] as {
    allow_failure: boolean;
    script: string[];
  };
  assert.equal(job.allow_failure, false);
  assert.match(job.script[0], /--error/);
});
test("unconfigured GitLab fails without claiming connection success", async () => {
  const old = process.env.GITLAB_TOKEN;
  delete process.env.GITLAB_TOKEN;
  try {
    await assert.rejects(() => gitlab("/user"), /not connected/);
  } finally {
    if (old) process.env.GITLAB_TOKEN = old;
  }
});
test("rollout preserves existing CI and adds its required stage", async () => {
  const { createRollout } = await import("../src/lib/gitlab");
  const previousFetch = global.fetch;
  const previousToken = process.env.GITLAB_TOKEN;
  const previousProject = process.env.GITLAB_PROJECT_ID;
  process.env.GITLAB_TOKEN = "test-token";
  process.env.GITLAB_PROJECT_ID = "test/project";
  let commit: { actions: { file_path: string; content: string }[] } | undefined;
  global.fetch = (async (url, options) => {
    const path = String(url);
    if (path.includes("repository/branches/"))
      return Response.json({ message: "missing" }, { status: 404 });
    if (path.includes("merge_requests?")) return Response.json([]);
    if (path.includes("repository/files/"))
      return Response.json({
        content: Buffer.from(
          "stages: [verify]\ninclude: {local: existing.yml}\n",
        ).toString("base64"),
      });
    if (path.endsWith("repository/commits")) {
      commit = JSON.parse(options?.body as string);
      return Response.json({ id: "commit" });
    }
    if (path.endsWith("merge_requests"))
      return Response.json({
        web_url: "https://gitlab.com/test/project/-/merge_requests/1",
      });
    return Response.json({ default_branch: "main" });
  }) as typeof fetch;
  try {
    await createRollout({
      id: "unit-stage",
      status: "approved",
      title: "test rollout",
      incident: "confirmed incident",
      rule: "rules: []",
      files: [],
      findings: [],
    } as unknown as import("../src/lib/model").Antibody);
    const config = parse(
      commit!.actions.find((a) => a.file_path === ".gitlab-ci.yml")!.content,
    );
    assert.deepEqual(config.stages, ["verify", "test"]);
    assert.deepEqual(config.include, [
      { local: "existing.yml" },
      { local: ".antibody/unit-stage-ci.yml" },
    ]);
  } finally {
    global.fetch = previousFetch;
    if (previousToken === undefined) delete process.env.GITLAB_TOKEN;
    else process.env.GITLAB_TOKEN = previousToken;
    if (previousProject === undefined) delete process.env.GITLAB_PROJECT_ID;
    else process.env.GITLAB_PROJECT_ID = previousProject;
  }
});

test("retrying rollout reuses its open MR without writing another commit", async () => {
  const { createRollout } = await import("../src/lib/gitlab");
  const priorFetch = global.fetch;
  const priorToken = process.env.GITLAB_TOKEN;
  const priorProject = process.env.GITLAB_PROJECT_ID;
  process.env.GITLAB_TOKEN = "test-token";
  process.env.GITLAB_PROJECT_ID = "test/project";
  const methods: string[] = [];
  global.fetch = (async (url, options) => {
    methods.push(options?.method || "GET");
    if (String(url).includes("merge_requests?"))
      return Response.json([
        { web_url: "https://gitlab.com/test/project/-/merge_requests/4" },
      ]);
    return Response.json({ default_branch: "main" });
  }) as typeof fetch;
  try {
    const result = await createRollout({
      id: "retry",
      status: "approved",
    } as import("../src/lib/model").Antibody);
    assert.equal(
      result.url,
      "https://gitlab.com/test/project/-/merge_requests/4",
    );
    assert.deepEqual(methods, ["GET", "GET"]);
  } finally {
    global.fetch = priorFetch;
    if (priorToken === undefined) delete process.env.GITLAB_TOKEN;
    else process.env.GITLAB_TOKEN = priorToken;
    if (priorProject === undefined) delete process.env.GITLAB_PROJECT_ID;
    else process.env.GITLAB_PROJECT_ID = priorProject;
  }
});
test("rollout recovers an orphan branch only when rule, job and include match", async () => {
  const { createRollout, preventionJob } = await import("../src/lib/gitlab");
  const original = global.fetch,
    priorToken = process.env.GITLAB_TOKEN,
    priorProject = process.env.GITLAB_PROJECT_ID;
  process.env.GITLAB_TOKEN = "test";
  process.env.GITLAB_PROJECT_ID = "test/project";
  const id = "orphan";
  let commits = 0,
    mrs = 0;
  global.fetch = (async (url, options) => {
    const path = String(url);
    if (path.includes("merge_requests?")) return Response.json([]);
    if (path.includes("/repository/branches/"))
      return Response.json({ name: `antibody/${id}` });
    if (path.includes("/repository/files/")) {
      const filePath = decodeURIComponent(
        path.split("/repository/files/")[1].split("?")[0],
      );
      const content =
        filePath === ".gitlab-ci.yml"
          ? `include:\n  - local: .antibody/${id}-ci.yml\n`
          : filePath.endsWith("-ci.yml")
            ? preventionJob(id)
            : "rules: []";
      return Response.json({
        content: Buffer.from(content).toString("base64"),
      });
    }
    if (path.endsWith("/repository/commits")) commits++;
    if (path.endsWith("/merge_requests") && options?.method === "POST") {
      mrs++;
      return Response.json({
        web_url: "https://gitlab.com/test/project/-/merge_requests/5",
      });
    }
    return Response.json({ default_branch: "main" });
  }) as typeof fetch;
  try {
    await createRollout({
      id,
      status: "approved",
      rule: "rules: []",
      title: "controlled",
      incident: "controlled",
      files: [],
      findings: [],
    } as unknown as import("../src/lib/model").Antibody);
    assert.equal(commits, 0);
    assert.equal(mrs, 1);
  } finally {
    global.fetch = original;
    if (priorToken === undefined) delete process.env.GITLAB_TOKEN;
    else process.env.GITLAB_TOKEN = priorToken;
    if (priorProject === undefined) delete process.env.GITLAB_PROJECT_ID;
    else process.env.GITLAB_PROJECT_ID = priorProject;
  }
});
test("Duo progress includes actual agent messages even when the role field is null", async () => {
  const { getDuoSession } = await import("../src/lib/gitlab");
  const original = global.fetch,
    token = process.env.GITLAB_TOKEN;
  process.env.GITLAB_TOKEN = "test";
  global.fetch = (async () =>
    Response.json({
      data: {
        duoWorkflowWorkflows: {
          nodes: [
            {
              humanStatus: "finished",
              webUrl:
                "https://gitlab.com/team/project/-/automate/agent-sessions/42",
              latestCheckpoint: {
                errors: [],
                duoMessages: [
                  { role: null, messageType: "tool", content: "starting" },
                  {
                    role: null,
                    messageType: "agent",
                    content: "Proposed detector and limits",
                  },
                ],
              },
            },
          ],
        },
      },
    })) as typeof fetch;
  try {
    const result = await getDuoSession(42);
    assert.equal(result.status, "finished");
    assert.equal(result.output, "Proposed detector and limits");
  } finally {
    global.fetch = original;
    if (token === undefined) delete process.env.GITLAB_TOKEN;
    else process.env.GITLAB_TOKEN = token;
  }
});
