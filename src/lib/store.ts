import {
  postgresList,
  postgresGet,
  postgresSave,
  postgresUpdate,
} from "./postgres";
import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import type { Antibody } from "./model";
import type { Firestore } from "@google-cloud/firestore";
let db: DatabaseSync;
let cloud: Promise<Firestore> | undefined;
const collection = "antibody_records";
export const usesCloudStore = () => process.env.ANTIBODY_STORE === "firestore";
export const usesPostgresStore = () =>
  process.env.ANTIBODY_STORE === "postgres";
export const usesSharedStore = () => usesCloudStore() || usesPostgresStore();
function database() {
  if (!db) {
    const dir = resolve(
      /* turbopackIgnore: true */ process.env.ANTIBODY_DATA_DIR || ".data",
    );
    mkdirSync(dir, { recursive: true, mode: 0o700 });
    db = new DatabaseSync(resolve(dir, "antibody.sqlite"));
    db.exec(
      "PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; CREATE TABLE IF NOT EXISTS antibodies (id TEXT PRIMARY KEY, body TEXT NOT NULL)",
    );
  }
  return db;
}
async function firestore() {
  cloud ??= import("@google-cloud/firestore").then(
    ({ Firestore }) =>
      new Firestore({
        projectId: process.env.GOOGLE_CLOUD_PROJECT,
        databaseId: process.env.FIRESTORE_DATABASE_ID || "antibody",
      }),
  );
  return cloud;
}
function encode(a: Antibody) {
  const body = JSON.stringify(a);
  if (Buffer.byteLength(body, "utf8") > 750 * 1024)
    throw new Error(
      "This cloud workspace accepts at most 750 KB of incident and source data per antibody. Upload a smaller selection of files.",
    );
  return { body, createdAt: a.createdAt };
}
export async function listAntibodies(): Promise<Antibody[]> {
  if (usesPostgresStore()) return postgresList();
  if (usesCloudStore()) {
    const result = await (
      await firestore()
    )
      .collection(collection)
      .orderBy("createdAt", "desc")
      .get();
    return result.docs.map((d) => JSON.parse(d.get("body")));
  }
  return (
    database()
      .prepare("SELECT body FROM antibodies ORDER BY rowid DESC")
      .all() as { body: string }[]
  ).map((r) => JSON.parse(r.body));
}
export async function getAntibody(id: string): Promise<Antibody | undefined> {
  if (usesPostgresStore()) return postgresGet(id);
  if (usesCloudStore()) {
    const d = await (await firestore()).collection(collection).doc(id).get();
    return d.exists ? JSON.parse(d.get("body")) : undefined;
  }
  const row = database()
    .prepare("SELECT body FROM antibodies WHERE id=?")
    .get(id) as { body: string } | undefined;
  return row ? JSON.parse(row.body) : undefined;
}
export async function saveAntibody(a: Antibody): Promise<Antibody> {
  a.updatedAt = new Date().toISOString();
  if (usesPostgresStore()) return postgresSave(a);
  if (usesCloudStore())
    await (await firestore()).collection(collection).doc(a.id).set(encode(a));
  else
    database()
      .prepare(
        "INSERT INTO antibodies (id,body) VALUES (?,?) ON CONFLICT(id) DO UPDATE SET body=excluded.body",
      )
      .run(a.id, JSON.stringify(a));
  return a;
}
export async function updateAntibody(
  id: string,
  fn: (a: Antibody) => void,
): Promise<Antibody> {
  if (usesPostgresStore()) return postgresUpdate(id, fn);
  if (usesCloudStore()) {
    const client = await firestore();
    const ref = client.collection(collection).doc(id);
    return client.runTransaction(async (tx) => {
      const d = await tx.get(ref);
      if (!d.exists) throw new Error("Antibody not found");
      const a: Antibody = JSON.parse(d.get("body"));
      fn(a);
      a.updatedAt = new Date().toISOString();
      tx.set(ref, encode(a));
      return a;
    });
  }
  const sql = database();
  sql.exec("BEGIN IMMEDIATE");
  try {
    const row = sql
      .prepare("SELECT body FROM antibodies WHERE id=?")
      .get(id) as { body: string } | undefined;
    if (!row) throw new Error("Antibody not found");
    const a: Antibody = JSON.parse(row.body);
    fn(a);
    a.updatedAt = new Date().toISOString();
    sql
      .prepare("UPDATE antibodies SET body=? WHERE id=?")
      .run(JSON.stringify(a), id);
    sql.exec("COMMIT");
    return a;
  } catch (error) {
    sql.exec("ROLLBACK");
    throw error;
  }
}
