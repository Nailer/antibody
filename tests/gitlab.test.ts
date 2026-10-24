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
