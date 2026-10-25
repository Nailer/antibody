import { randomUUID } from "node:crypto";
import type { Antibody } from "./model";
import { usesCloudStore, updateAntibody } from "./store";
import { RequestError } from "./http";
export function interrupted(a: Antibody) {
  if (a.status !== "running") return false;
  if (!a.run) return true;
  if (Date.now() - Date.parse(a.run.startedAt) > 10 * 60 * 1000) return true;
  if (usesCloudStore()) return false;
  try {
    process.kill(a.run.pid, 0);
    return false;
  } catch {
    return true;
  }
}
export async function recoverRun(a: Antibody) {
  if (!interrupted(a)) return a;
  return updateAntibody(a.id, (x) => {
    if (!interrupted(x)) return;
    x.status = "failed";
    x.error =
      "Validation was interrupted. Your source is saved; run validation again.";
    delete x.run;
    x.events.push({
      at: new Date().toISOString(),
      message: "Interrupted validation recovered. A fresh run is required.",
    });
  });
}
export async function claimRun(id: string) {
  const run = {
    id: randomUUID(),
    pid: process.pid,
    startedAt: new Date().toISOString(),
  };
  const a = await updateAntibody(id, (x) => {
    if (x.status === "approved" || (x.status === "running" && !interrupted(x)))
      throw new RequestError(
        "This antibody is already running or approved.",
        409,
      );
    x.status = "running";
    x.run = run;
    delete x.error;
    x.checks = [];
    x.findings = [];
    x.events.push({
      at: run.startedAt,
      runId: run.id,
      message: "Validation started: bad and fixed fixtures.",
    });
  });
  return { a, run };
}
export async function updateRun(
  id: string,
  runId: string,
  change: (a: Antibody) => void,
) {
  return updateAntibody(id, (x) => {
    if (x.status !== "running" || x.run?.id !== runId)
      throw new RequestError(
        "This validation run is no longer current. Reload the evidence.",
        409,
      );
    change(x);
  });
}
