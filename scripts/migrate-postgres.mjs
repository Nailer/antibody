import { DatabaseSync } from "node:sqlite";
import { statSync } from "node:fs";
import { Pool } from "pg";

// Run only against the expressly selected source and destination. Secrets stay in the environment.
const source = process.argv[2];
if (!source || !process.env.DATABASE_URL) {
  console.error("Usage: DATABASE_URL=<private connection> node scripts/migrate-postgres.mjs SQLITE_BACKUP");
  process.exit(1);
}
if (!statSync(source).isFile()) throw Error("Choose a consistent SQLite backup file.");
const sql = new DatabaseSync(source, { readOnly: true });
const rows = sql.prepare("SELECT body FROM antibodies").all();
sql.close();
const records = rows.map((row) => {
  const a = JSON.parse(row.body);
  if (typeof a.id !== "string" || !Number.isFinite(Date.parse(a.createdAt)) || !Array.isArray(a.events) || Buffer.byteLength(row.body) > 750 * 1024)
    throw Error("Source contains an invalid or oversized record; no records were imported.");
  return a;
});
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1, connectionTimeoutMillis: 15000 });
let client;
try {
  client = await pool.connect();
  await client.query("BEGIN");
  await client.query("CREATE TABLE IF NOT EXISTS antibody_records (id TEXT PRIMARY KEY, body JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL)");
  let inserted = 0;
  for (const a of records) {
    const result = await client.query("INSERT INTO antibody_records (id,body,created_at) VALUES ($1,$2::jsonb,$3) ON CONFLICT(id) DO NOTHING", [a.id, JSON.stringify(a), a.createdAt]);
    inserted += result.rowCount;
  }
  await client.query("COMMIT");
  console.log(`Imported ${inserted} records; preserved ${records.length - inserted} existing destination records. Source unchanged.`);
} catch {
  if (client) await client.query("ROLLBACK").catch(() => undefined);
  console.error("Database migration failed. No partial import was committed; credentials were not logged.");
  process.exitCode = 1;
} finally {
  client?.release();
  await pool.end();
}
