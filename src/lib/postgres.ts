import { Pool, type PoolClient } from "pg";
import type { Antibody } from "./model";
import { RequestError } from "./http";
let pool: Pool | undefined;
let ready: Promise<void> | undefined;

async function database() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString || !/^postgres(?:ql)?:\/\//.test(connectionString))
      throw new RequestError("The hosted database is not configured.", 503);
    pool = new Pool({
      connectionString,
      max: 3,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 15000,
      query_timeout: 20000,
    });
    pool.on("error", () => {
      console.error(
        "An idle database connection closed; the pool will reconnect.",
      );
    });
  }
  ready ??= pool
    .query(
      "CREATE TABLE IF NOT EXISTS antibody_records (id TEXT PRIMARY KEY, body JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL)",
    )
    .then(() => undefined)
    .catch(() => {
      ready = undefined;
      throw new RequestError(
        "The hosted database is unavailable. Try again shortly.",
        503,
      );
    });
  await ready;
  return pool;
}

async function connection<T>(work: (client: PoolClient) => Promise<T>) {
  let client: PoolClient | undefined;
  try {
    client = await (await database()).connect();
    return await work(client);
  } catch (error) {
    if (error instanceof RequestError) throw error;
    throw new RequestError(
      "The hosted database is unavailable. Try again shortly.",
      503,
    );
  } finally {
    client?.release();
  }
}

function encode(a: Antibody) {
  const body = JSON.stringify(a);
  if (Buffer.byteLength(body, "utf8") > 750 * 1024)
    throw new RequestError(
      "This workspace accepts at most 750 KB per antibody.",
      400,
    );
  return body;
}

export function postgresList(): Promise<Antibody[]> {
  return connection(async (client) => {
    const result = await client.query(
      "SELECT body FROM antibody_records ORDER BY created_at DESC, id",
    );
    return result.rows.map((row) => row.body);
  });
}
export function postgresGet(id: string): Promise<Antibody | undefined> {
  return connection(async (client) => {
    const result = await client.query(
      "SELECT body FROM antibody_records WHERE id=$1",
      [id],
    );
    return result.rows[0]?.body;
  });
}
export function postgresSave(a: Antibody): Promise<Antibody> {
  return connection(async (client) => {
    await client.query(
      "INSERT INTO antibody_records (id,body,created_at) VALUES ($1,$2::jsonb,$3) ON CONFLICT(id) DO UPDATE SET body=EXCLUDED.body",
      [a.id, encode(a), a.createdAt],
    );
    return a;
  });
}
export function postgresUpdate(
  id: string,
  change: (a: Antibody) => void,
): Promise<Antibody> {
  return connection(async (client) => {
    await client.query("BEGIN");
    try {
      const result = await client.query(
        "SELECT body FROM antibody_records WHERE id=$1 FOR UPDATE",
        [id],
      );
      const a: Antibody | undefined = result.rows[0]?.body;
      if (!a) throw new RequestError("Antibody not found.", 404);
      change(a);
      a.updatedAt = new Date().toISOString();
      await client.query(
        "UPDATE antibody_records SET body=$2::jsonb WHERE id=$1",
        [id, encode(a)],
      );
      await client.query("COMMIT");
      return a;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  });
}

export async function closePostgres() {
  await pool?.end();
  pool = undefined;
  ready = undefined;
}
