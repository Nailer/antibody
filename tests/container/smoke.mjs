import assert from "node:assert/strict";
const base = "http://127.0.0.1:8080";
const auth =
  "Basic " +
  Buffer.from("antibody:" + process.env.ACCESS_TOKEN).toString("base64");
for (let attempt = 0; ; attempt++) {
  try {
    const health = await fetch(base + "/health");
    if (health.ok) break;
  } catch {}
  if (attempt >= 40) throw Error("Container did not become ready");
  await new Promise((r) => setTimeout(r, 1000));
}
const anonymous = await fetch(base + "/api/antibodies");
assert.equal(anonymous.status, 401);
async function api(path, body) {
  const response = await fetch(base + path, {
    method: body === undefined ? "GET" : "POST",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(180000),
  });
  const value = await response.json();
  assert.equal(response.ok, true, JSON.stringify(value));
  return value;
}
if (process.argv.includes("--persisted")) {
  const records = await api("/api/antibodies");
  assert.ok(
    records.some(
      (a) =>
        a.title === "Container persistence proof" && a.status === "validated",
    ),
  );
  console.log("Saved validation survived the container restart.");
} else {
  const unsafe =
    'import requests\nrequests.get("https://example.com", verify=False)\n';
  const safe = unsafe.replace("verify=False", "verify=True");
  const draft = await api("/api/antibodies", {
    title: "Container persistence proof",
    incident:
      "Controlled container integration test for disabled TLS verification; supplied Python is scanned, never executed.",
    badCode: unsafe,
    fixedCode: safe,
    rule: "rules:\n  - id: container.tls\n    languages: [python]\n    severity: ERROR\n    message: Disabled TLS verification\n    pattern: requests.get(..., verify=False, ...)\n",
    files: [{ path: "unsafe.py", content: unsafe }],
  });
  const blocked = await fetch(base + `/api/antibodies/${draft.id}/approve`, {
    method: "POST",
    headers: { Authorization: auth },
  });
  assert.equal(blocked.status, 409);
  const validated = await api(`/api/antibodies/${draft.id}/validate`, {});
  assert.equal(validated.status, "validated", validated.error);
  assert.equal(validated.findings.length, 1);
  console.log("Protected container ran real Semgrep validation successfully.");
}
