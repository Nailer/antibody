import { access, constants } from "node:fs/promises";
import { resolve } from "node:path";
import { getAntibody } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await access(
      resolve(process.env.SEMGREP_BIN || ".venv/bin/semgrep"),
      constants.X_OK,
    );
    await getAntibody("__readiness_check__");
    return Response.json(
      { status: "ready" },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      { status: "unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
