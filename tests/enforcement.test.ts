import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { parse } from "yaml";
import { preventionJob } from "../src/lib/gitlab";
import { starterRule, starterBad, starterFixed } from "../src/lib/model";
const execute = promisify(execFile);
test("the exported CI command blocks a reintroduced defect and accepts its fix", async () => {
  const root = await mkdtemp(join(tmpdir(), "antibody-enforcement-"));
  const binary = resolve(".venv/bin/semgrep");
  try {
    await mkdir(join(root, ".antibody"));
    await writeFile(join(root, ".antibody/check.yml"), starterRule);
    await writeFile(join(root, "service.py"), starterBad);
    const job = Object.values(parse(preventionJob("check")))[0] as {
      script: string[];
    };
    const args = job.script[0].split(" ").slice(1);
    await assert.rejects(
      () => execute(binary, args, { cwd: root, timeout: 60000 }),
      (e: unknown) =>
        typeof e === "object" && e !== null && "code" in e && e.code === 1,
    );
    await writeFile(join(root, "service.py"), starterFixed);
    await execute(binary, args, { cwd: root, timeout: 60000 });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
