import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
const dir = mkdtempSync(join(tmpdir(), "antibody-api-test-"));
process.env.ANTIBODY_DATA_DIR = dir;
const { POST: create } = await import("../src/app/api/antibodies/route");
const { POST: act, GET: download } =
  await import("../src/app/api/antibodies/[id]/[action]/route");
const { starterBad, starterFixed, starterRule } =
  await import("../src/lib/model");
const { updateAntibody } = await import("../src/lib/store");
after(() => rmSync(dir, { recursive: true, force: true }));
const payload = {
  title: "API state machine test",
  incident: "A confirmed certificate verification bypass was repaired.",
  badCode: starterBad,
  fixedCode: starterFixed,
  rule: starterRule,
  files: [],
};
test("unvalidated evidence cannot be approved or exported, and approved packs cannot rerun", async () => {
  const created = await create(
    new Request("http://localhost/api/antibodies", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  );
  assert.equal(created.status, 201);
  const a = await created.json();
  const ctx = (action: string) => ({
    params: Promise.resolve({ id: a.id, action }),
  });
  assert.equal(
    (
      await act(
        new Request("http://localhost", { method: "POST" }),
        ctx("approve"),
      )
    ).status,
    409,
  );
  assert.equal(
    (await download(new Request("http://localhost"), ctx("rule"))).status,
    409,
  );
  await updateAntibody(a.id, (x) => {
    x.status = "validated";
    x.checks = [
      { name: "bad", passed: true, detail: "executed" },
      { name: "fixed", passed: true, detail: "executed" },
    ];
  });
  assert.equal(
    (
      await act(
        new Request("http://localhost", { method: "POST" }),
        ctx("approve"),
      )
    ).status,
    200,
  );
  assert.equal(
    (
      await act(
        new Request("http://localhost", { method: "POST" }),
        ctx("validate"),
      )
    ).status,
    409,
  );
  assert.equal(
    (await download(new Request("http://localhost"), ctx("rule"))).status,
    200,
  );
});
test("unknown records and malformed input return useful errors", async () => {
  assert.equal(
    (
      await create(
        new Request("http://localhost", { method: "POST", body: "not json" }),
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await act(new Request("http://localhost", { method: "POST" }), {
        params: Promise.resolve({ id: "missing", action: "approve" }),
      })
    ).status,
    404,
  );
});
test("revising evidence produces a separate unvalidated draft", async () => {
  const original = await (
    await create(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    )
  ).json();
  await updateAntibody(original.id, (x) => {
    x.status = "approved";
  });
  const result = await act(
    new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ ...payload, title: "Reviewed proposal revision" }),
    }),
    { params: Promise.resolve({ id: original.id, action: "revise" }) },
  );
  assert.equal(result.status, 201);
  const revised = await result.json();
  assert.notEqual(revised.id, original.id);
  assert.equal(revised.status, "draft");
  assert.equal(revised.derivedFrom, original.id);
  assert.deepEqual(revised.checks, []);
});
