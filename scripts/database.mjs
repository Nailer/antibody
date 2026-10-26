import { DatabaseSync, backup } from "node:sqlite";
import {
  existsSync,
  mkdirSync,
  openSync,
  closeSync,
  unlinkSync,
  chmodSync,
} from "node:fs";
import { resolve, dirname, join } from "node:path";
process.umask(0o077);
const [action, arg, target] = process.argv.slice(2);
if (existsSync(".env.local")) process.loadEnvFile(".env.local");
if (["firestore", "postgres"].includes(process.env.ANTIBODY_STORE)) {
  console.error(
    "This tool backs up local SQLite only. Select the intended local database explicitly.",
  );
  process.exit(1);
}
let source, destination;
if (action === "backup") {
  source = resolve(process.env.ANTIBODY_DATA_DIR || ".data", "antibody.sqlite");
  destination = resolve(
    arg || join(".data", "backups", `antibody-${Date.now()}.sqlite`),
  );
} else if (action === "restore" && arg && target) {
  source = resolve(arg);
  destination = resolve(target, "antibody.sqlite");
} else {
  console.error(
    "Usage: node scripts/database.mjs backup [NEW_BACKUP_FILE]\n       node scripts/database.mjs restore BACKUP_FILE NEW_DATA_DIRECTORY",
  );
  process.exit(1);
}
if (!existsSync(source) || existsSync(destination) || source === destination) {
  console.error(
    "Source must exist and destination must be new. Existing databases are never overwritten.",
  );
  process.exit(1);
}
const db = new DatabaseSync(source, { readOnly: true });
let created = false;
try {
  const check = db.prepare("PRAGMA integrity_check").get();
  if (check.integrity_check !== "ok")
    throw Error("SQLite integrity check failed.");
  const records = db.prepare("SELECT body FROM antibodies").all();
  for (const row of records) {
    const a = JSON.parse(row.body);
    if (typeof a.id !== "string" || !Array.isArray(a.events))
      throw Error("Unrecognized Antibody backup format.");
  }
  mkdirSync(dirname(destination), { recursive: true, mode: 0o700 });
  closeSync(openSync(destination, "wx", 0o600));
  created = true;
  await backup(db, destination);
  chmodSync(destination, 0o600);
  console.log(
    `${action === "backup" ? "Backup" : "Restored copy"} verified: ${records.length} records\n${destination}`,
  );
  if (action === "restore")
    console.log(
      `Start a separate local instance with ANTIBODY_DATA_DIR=${dirname(destination)}. Keep the original database until you verify the restored history.`,
    );
} catch (error) {
  if (created) unlinkSync(destination);
  console.error(error.message);
  process.exitCode = 1;
} finally {
  db.close();
}
