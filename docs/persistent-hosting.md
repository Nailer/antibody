# Persistent hosting

The Cloudflare preview runs on a workstation and is not a hosted deployment. For an independent service, use the Docker image with an external PostgreSQL database, one replica, HTTPS and a private access password.

## Free hosted deployment

`render.yaml` describes a free Docker web service using external PostgreSQL. The user requires free hosting only. Render's free web service cannot attach a persistent disk and loses local SQLite data on restart; hosted records must therefore use PostgreSQL. Neon's free database stores hosted records independently of the web container. Free web services can sleep while idle; cold starts can take roughly a minute. Their address remains independent of the workstation.

The container refuses to start without an ACCESS_TOKEN of at least 24 characters. Its entrypoint initializes the volume directory, then drops root privileges before starting Node. `/health` returns only a readiness status after checking scanner availability and a database read. It does not expose credentials, records or configuration, and does not establish live GitLab connectivity.

Configure private runtime secrets in the hosting dashboard:

- DATABASE_URL: private TLS PostgreSQL connection string. Set ANTIBODY_STORE=postgres; do not use ephemeral SQLite for hosted records.
- ACCESS_TOKEN: the workspace password; HTTP Basic username `antibody`.
- GITLAB_TOKEN: an authorized API credential that can access the approved showcase project and enabled flow. Use a dedicated, expiring credential and a rotation plan. A desktop OAuth access token alone is unsuitable for unattended operation because it expires.

The configured project is 88074697 and Duo flow consumer is 13153303. No Google Cloud resources are required.

## Release verification

1. Confirm `/health` becomes ready and anonymous `/app` and `/api/antibodies` requests return 401.
2. Sign in and create a controlled incident. Run actual Semgrep validation; verify safe/unsafe outcomes and approval gating.
3. Exercise real Duo output retrieval and GitLab repository fetching using the hosted credential.
4. Download approved rule, CI and evidence exports.
5. Restart the hosted service and verify the saved record remains. Do not claim persistence before this check passes.
6. Migrate existing records through an owner-only consistent backup and an authenticated transfer; never publish the SQLite file or place it in the container image.
7. Verify the public HTTPS address from a separate client. Confirm available memory during validation; upgrade only within the user's approved budget.

The service is `antibody-workspace` on Render Free in Oregon, paired with Neon Free in the same region. No persistent disk or paid plan is used. Release acceptance results are recorded below after the live checks complete.

## Migrating approved evidence

After explicit permission to transfer incident source/evidence, take a consistent SQLite backup and run `node scripts/migrate-postgres.mjs /private/path/backup.sqlite` with the destination DATABASE_URL privately supplied through the process environment. The migration preserves original IDs, statuses, checks and approval history. It imports transactionally and never overwrites existing destination records; retrying is safe. Never place the connection string in a shell command, commit, log or browser-visible URL.

## Credentials and maintenance

The hosted GitLab credential expires on **25 November 2026**. It uses fine-grained permissions restricted to showcase project **88074697** for project/repository/pipeline reads, branch and commit creation, and merge request creation/read. User-level Duo Workflow create/read supports agent sessions. It cannot merge requests or modify project policies. Before expiry, replace the private `GITLAB_TOKEN` value in Render and verify repository reads, Duo output and rollout creation. The workspace access password is stored only as a private runtime secret; do not put it in documentation or a URL.

Render's free service sleeps after inactivity. Expect a cold-start wait of about a minute. Its hostname does not depend on a developer's Mac or a tunnel process. Free resource limits can still interrupt availability; this is not a paid uptime guarantee. Saved records live in PostgreSQL and remain after a container restart.
