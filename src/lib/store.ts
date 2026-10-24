import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import type { Antibody } from "./model";
let db: DatabaseSync;
function database() {
  if (!db) {
    const dir = resolve(process.env.ANTIBODY_DATA_DIR || ".data");
    mkdirSync(dir, { recursive: true, mode: 0o700 });
    db = new DatabaseSync(resolve(dir, "antibody.sqlite"));
    db.exec(
      "PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; CREATE TABLE IF NOT EXISTS antibodies (id TEXT PRIMARY KEY, body TEXT NOT NULL)",
    );
  }
  return db;
}
export function listAntibodies(): Antibody[] {
  return (
    database()
      .prepare("SELECT body FROM antibodies ORDER BY rowid DESC")
      .all() as { body: string }[]
  ).map((r) => JSON.parse(r.body));
}
export function getAntibody(id: string): Antibody | undefined {
  const row = database()
    .prepare("SELECT body FROM antibodies WHERE id=?")
    .get(id) as { body: string } | undefined;
  return row ? JSON.parse(row.body) : undefined;
}
export function saveAntibody(a: Antibody) {
  a.updatedAt = new Date().toISOString();
  database()
    .prepare(
      "INSERT INTO antibodies (id,body) VALUES (?,?) ON CONFLICT(id) DO UPDATE SET body=excluded.body",
    )
    .run(a.id, JSON.stringify(a));
  return a;
}
export function updateAntibody(id: string, fn: (a: Antibody) => void) {
  const a = getAntibody(id);
  if (!a) throw new Error("Antibody not found");
  fn(a);
  return saveAntibody(a);
}
