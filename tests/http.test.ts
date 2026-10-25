import { test } from "node:test";
import assert from "node:assert/strict";
import { readJson, RequestError } from "../src/lib/http";
test("JSON body limit rejects streamed bodies without trusting content-length", async () => {
  const request = new Request("http://localhost", {
    method: "POST",
    body: "x".repeat(100),
  });
  await assert.rejects(
    () => readJson(request, 10),
    (error: unknown) => error instanceof RequestError && error.status === 413,
  );
});
