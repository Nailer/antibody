import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn, spawnSync } from "node:child_process";

const root = fileURLToPath(new URL("../", import.meta.url));
process.chdir(root);
if (Number(process.versions.node.split(".")[0]) < 24) {
  console.error("Antibody requires Node.js 24 or newer.");
  process.exit(1);
}
if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const env = {
  ...process.env,
  ANTIBODY_STORE: "sqlite",
  NEXT_TELEMETRY_DISABLED: "1",
};
const scanner = resolve(env.SEMGREP_BIN || ".venv/bin/semgrep");
if (!existsSync(scanner)) {
  console.error(
    "Semgrep is missing. Run scripts/setup.sh before starting Antibody.",
  );
  process.exit(1);
}
env.SEMGREP_BIN = scanner;
// Credentials remain in process memory; never print or write them to the repository.
// An explicit environment token takes precedence over the optional credential helper.
if (!env.GITLAB_TOKEN && env.GITLAB_PROJECT_ID) {
  const host = new URL(env.GITLAB_URL || "https://gitlab.com").host;
  const credential = spawnSync("git", ["credential", "fill"], {
    input: `protocol=https\nhost=${host}\n\n`,
    encoding: "utf8",
    timeout: 10000,
    env: { ...env, GIT_TERMINAL_PROMPT: "0" },
  });
  if (credential.status === 0) {
    env.GITLAB_TOKEN = credential.stdout
      .split("\n")
      .find((line) => line.startsWith("password="))
      ?.slice("password=".length);
  }
}
const port = env.PORT || "3100";
if (!/^\d+$/.test(port) || Number(port) < 1024 || Number(port) > 65535) {
  console.error("Choose a PORT between 1024 and 65535.");
  process.exit(1);
}
console.log(`Antibody: http://127.0.0.1:${port}/app`);
console.log("Storage: local SQLite. Google Cloud is not required.");
console.log(
  env.GITLAB_TOKEN
    ? "GitLab credential loaded; access is checked when you use GitLab."
    : "GitLab is not connected. Local validation and exports remain available.",
);
const child = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "dev",
    "--hostname",
    "127.0.0.1",
    "--port",
    port,
  ],
  { env, stdio: "inherit" },
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => child.kill(signal));
child.on("error", () => {
  console.error(
    "Could not start the local application. Run npm ci and try again.",
  );
  process.exitCode = 1;
});
child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});
