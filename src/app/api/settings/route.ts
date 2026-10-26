import { existsSync } from "node:fs";
import { resolve } from "node:path";
export const runtime = "nodejs";
export async function GET() {
  return Response.json({
    semgrep: existsSync(
      /* turbopackIgnore: true */
      resolve(
        /* turbopackIgnore: true */ process.env.SEMGREP_BIN ||
          ".venv/bin/semgrep",
      ),
    ),
    gitlab: !!process.env.GITLAB_TOKEN,
    duo: !!(
      process.env.GITLAB_TOKEN &&
      process.env.GITLAB_FLOW_CONSUMER_ID &&
      process.env.GITLAB_PROJECT_ID
    ),
    gitlabUrl: process.env.GITLAB_URL || "https://gitlab.com",
    storage:
      process.env.ANTIBODY_STORE === "firestore"
        ? "Firestore · durable cloud workspace"
        : process.env.ANTIBODY_STORE === "postgres"
          ? "PostgreSQL · durable hosted workspace"
          : "SQLite · local persistent workspace",
    accessProtected: !!process.env.ACCESS_TOKEN,
  });
}
