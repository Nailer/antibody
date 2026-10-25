import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
process.env.ANTIBODY_DATA_DIR = mkdtempSync(join(tmpdir(), "antibody-runs-"));
const { saveAntibody, getAntibody, updateAntibody } =
  await import("../src/lib/store");
const { claimRun, updateRun, recoverRun } = await import("../src/lib/runs");
const { starterBad, starterFixed, starterRule } =
  await import("../src/lib/model");
after(() =>
  rmSync(process.env.ANTIBODY_DATA_DIR!, { recursive: true, force: true }),
);
async function record(id: string) {
  const now = new Date().toISOString();
  return saveAntibody({
    id,
    title: "Concurrency check",
    incident: "Controlled incident fixture for run ownership checks.",
    badCode: starterBad,
    fixedCode: starterFixed,
    rule: starterRule,
    files: [],
    createdAt: now,
    updatedAt: now,
    status: "draft",
    checks: [],
    findings: [],
    events: [],
  });
}
test("only one concurrent request can claim a run and stale writers cannot replace evidence", async () => {
  await record("concurrent");
  const results = await Promise.allSettled([
    claimRun("concurrent"),
    claimRun("concurrent"),
  ]);
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
  await assert.rejects(
    () =>
      updateRun("concurrent", "stale", (x) => {
        x.status = "validated";
      }),
    /no longer current/,
  );
  assert.equal((await getAntibody("concurrent"))?.status, "running");
});
test("expired runs recover to retryable failure and reject late completion", async () => {
  await record("expired");
  const { run } = await claimRun("expired");
  await updateAntibody("expired", (x) => {
    x.run!.startedAt = new Date(Date.now() - 11 * 60000).toISOString();
  });
  const recovered = await recoverRun((await getAntibody("expired"))!);
  assert.equal(recovered.status, "failed");
  assert.match(recovered.error!, /interrupted/);
  await assert.rejects(
    () =>
      updateRun("expired", run.id, (x) => {
        x.status = "validated";
      }),
    /no longer current/,
  );
  assert.equal((await claimRun("expired")).a.status, "running");
});
test("a detector that overmatches an additional safe example cannot validate", async () => {
  const a = await record("overmatch");
  await updateAntibody(a.id, (x) => {
    x.extraFixtures = [
      {
        name: "Unsafe example labelled safe to challenge the gate",
        code: starterBad,
        expectMatch: false,
      },
    ];
  });
  const { validateAntibody } = await import("../src/lib/engine");
  const result = await validateAntibody(a.id);
  assert.equal(result.status, "failed");
  assert.equal(result.checks.length, 3);
  assert.equal(result.checks[2].passed, false);
});
