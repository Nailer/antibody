import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { Pool } from "pg";
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
    } finally {
      const cleanup = new Pool({ connectionString: url });
      await cleanup.query("DELETE FROM antibody_records WHERE id=$1", [id]);
      await cleanup.end();
      await closePostgres();
    }
  },
);
