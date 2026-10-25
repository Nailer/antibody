export class RequestError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export async function readJson(req: Request, maxBytes = 650000) {
  if (Number(req.headers.get("content-length") || 0) > maxBytes)
    throw new RequestError(
      "Request is too large. Reduce the incident/source selection.",
      413,
    );
  const reader = req.body?.getReader();
  if (!reader) throw new RequestError("A JSON request body is required.");
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > maxBytes)
        throw new RequestError(
          "Request is too large. Reduce the incident/source selection.",
          413,
        );
      chunks.push(value);
    }
  } finally {
    await reader.cancel();
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new RequestError("Invalid JSON request.");
  }
}
