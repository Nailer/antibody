import { test } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { proxy } from "../src/proxy";
test("remote access gate challenges missing credentials and accepts configured Basic auth", () => {
  const old = process.env.ACCESS_TOKEN;
  process.env.ACCESS_TOKEN = "test-only-value";
  try {
    const r = new NextRequest("http://127.0.0.1:3100/api/antibodies", {
      headers: { host: "127.0.0.1:3100" },
    });
    assert.equal(proxy(r).status, 401);
    const authorized = new NextRequest("http://127.0.0.1:3100/api/antibodies", {
      headers: {
        host: "127.0.0.1:3100",
        authorization: "Basic " + btoa("antibody:test-only-value"),
      },
    });
    assert.equal(proxy(authorized).status, 200);
  } finally {
    if (old) process.env.ACCESS_TOKEN = old;
    else delete process.env.ACCESS_TOKEN;
  }
});
test("cross-origin mutations are refused", () => {
  const req = new NextRequest("http://127.0.0.1:3100/api/antibodies", {
    method: "POST",
    headers: { host: "127.0.0.1:3100", origin: "https://untrusted.example" },
  });
  assert.equal(proxy(req).status, 403);
});
