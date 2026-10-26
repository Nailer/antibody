import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import { DatabaseSync } from "node:sqlite";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { saveAntibody, getAntibody, updateAntibody } from "../src/lib/store";
import { closePostgres } from "../src/lib/postgres";
import { claimRun, updateRun } from "../src/lib/runs";
import { RequestError } from "../src/lib/http";
import {
  starterRule,
  starterBad,
  starterFixed,
  type Antibody,
} from "../src/lib/model";
const url = process.env.ANTIBODY_TEST_DATABASE_URL;

test(
  "PostgreSQL preserves records, serializes concurrent changes and rejects stale validation writers",
  { skip: !url },
  async () => {
    process.env.ANTIBODY_STORE = "postgres";
    process.env.DATABASE_URL = url;
    const now = new Date().toISOString();
    const id = randomUUID();
    const migratedId = randomUUID();
    const folder = await mkdtemp(join(tmpdir(), "antibody-migration-"));
    const a: Antibody = {
      id,
      title: "Postgres transaction test",
      incident: "A controlled store integration fixture.",
      badCode: starterBad,
      fixedCode: starterFixed,
      rule: starterRule,
      files: [],
      createdAt: now,
      updatedAt: now,
      status: "draft",
      checks: [],
      findings: [],
      events: [],
    };
    try {
      await saveAntibody(a);
      assert.equal((await getAntibody(id))?.title, a.title);
      await Promise.all(
        Array.from({ length: 8 }, (_, n) =>
          updateAntibody(id, (x) => {
            x.events.push({ at: now, message: `Concurrent change ${n}` });
          }),
        ),
      );
      assert.equal((await getAntibody(id))?.events.length, 8);
      await assert.rejects(
        updateAntibody(id, (x) => {
          x.title = "This must roll back";
          throw new RequestError("Controlled rejection", 409);
        }),
        /Controlled rejection/,
      );
      assert.equal((await getAntibody(id))?.title, a.title);
      const claims = await Promise.allSettled([claimRun(id), claimRun(id)]);
      assert.equal(claims.filter((r) => r.status === "fulfilled").length, 1);
      await assert.rejects(
        updateRun(id, "stale-run-id", (x) => {
          x.status = "approved";
        }),
        /no longer current/,
      );
      assert.equal((await getAntibody(id))?.status, "running");
      const backup = join(folder, "backup.sqlite");
      const sqlite = new DatabaseSync(backup);
      sqlite.exec(
        "CREATE TABLE antibodies (id TEXT PRIMARY KEY, body TEXT NOT NULL)",
      );
      const preserved = {
        ...a,
        id: migratedId,
        title: "Preserved migration fixture",
        status: "approved",
        approvedAt: now,
      };
      for (const record of [a, preserved])
        sqlite
          .prepare("INSERT INTO antibodies VALUES (?,?)")
          .run(record.id, JSON.stringify(record));
      sqlite.close();
      const migrate = () =>
        execFileSync(
          process.execPath,
          [resolve("scripts/migrate-postgres.mjs"), backup],
          { env: { ...process.env, DATABASE_URL: url }, encoding: "utf8" },
        );
      assert.match(migrate(), /Imported 1 records; preserved 1 existing/);
      assert.equal((await getAntibody(migratedId))?.status, "approved");
      assert.equal((await getAntibody(migratedId))?.approvedAt, now);
      assert.equal((await getAntibody(id))?.status, "running");
      assert.match(migrate(), /Imported 0 records; preserved 2 existing/);
    } finally {
      const cleanup = new Pool({ connectionString: url });
      await cleanup.query(
        "DELETE FROM antibody_records WHERE id=ANY($1::text[])",
        [[id, migratedId]],
      );
      await cleanup.end();
      await closePostgres();
      await rm(folder, { recursive: true, force: true });
    }
  },
);
