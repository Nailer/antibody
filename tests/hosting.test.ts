import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { GET } from "../src/app/health/route";

test("readiness checks scanner and storage without exposing configuration", async () => {
  const saved = { ...process.env };
  const dir = await mkdtemp(join(tmpdir(), "antibody-readiness-"));
  try {
    process.env.ANTIBODY_STORE = "sqlite";
    process.env.ANTIBODY_DATA_DIR = dir;
    process.env.SEMGREP_BIN = resolve(".venv/bin/semgrep");
    process.env.GITLAB_TOKEN = "private-health-test-sentinel";
    const ready = await GET();
    assert.equal(ready.status, 200);
    assert.deepEqual(await ready.json(), { status: "ready" });
    assert.equal(ready.headers.get("cache-control"), "no-store");
    process.env.SEMGREP_BIN = join(dir, "missing-scanner");
    const unavailable = await GET();
    assert.equal(unavailable.status, 503);
    assert.deepEqual(await unavailable.json(), { status: "unavailable" });
  } finally {
    for (const key of Object.keys(process.env)) {
      if (!(key in saved)) delete process.env[key];
    }
    Object.assign(process.env, saved);
    await rm(dir, { recursive: true, force: true });
  }
});

test("container refuses to expose a workspace without a strong access password", () => {
  for (const password of ["", "short"]) {
    const result = spawnSync(
      "sh",
      ["scripts/container-entrypoint.sh", "true"],
      {
        env: { ...process.env, ACCESS_TOKEN: password },
        encoding: "utf8",
      },
    );
    assert.equal(result.status, 1);
    assert.match(result.stderr, /at least 24 characters/);
  }
});
