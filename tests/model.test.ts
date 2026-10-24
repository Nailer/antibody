import { test } from "node:test";
import assert from "node:assert/strict";
import {
  incidentInput,
  starterRule,
  starterBad,
  starterFixed,
} from "../src/lib/model";
import { validateRuleText, runSemgrep } from "../src/lib/engine";
test("rejects traversal and absolute source paths", () => {
  for (const path of ["../secret.py", "/tmp/a.py", "x/../../a.py"])
    assert.equal(
      incidentInput.safeParse({
        title: "Incident",
        incident: "A confirmed TLS incident occurred.",
        badCode: starterBad,
        fixedCode: starterFixed,
        rule: starterRule,
        files: [{ path, content: "" }],
      }).success,
      false,
    );
});
test("rejects rewriting rules", () =>
  assert.throws(() =>
    validateRuleText(
      "rules:\n - id: bad\n   languages: [python]\n   fix: unsafe",
    ),
  ));
test("Semgrep detects the unsafe fixture and accepts corrected code", async () => {
  assert.equal(
    (await runSemgrep(starterRule, [{ path: "bad.py", content: starterBad }]))
      .length,
    1,
  );
  assert.equal(
    (
      await runSemgrep(starterRule, [
        { path: "fixed.py", content: starterFixed },
      ])
    ).length,
    0,
  );
});
test("a safe custom CA and unrelated verify keyword are accepted", async () => {
  assert.equal(
    (
      await runSemgrep(starterRule, [
        {
          path: "safe.py",
          content:
            'import requests\nrequests.get("https://example.com", verify="ca.pem")\nother.get(verify=False)',
        },
      ])
    ).length,
    0,
  );
});
