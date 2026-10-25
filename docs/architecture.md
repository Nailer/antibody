# Architecture and operational limits

## Boundaries

The browser supplies explicit incident data, Python snippets, and optional source files. It never receives GitLab tokens. The Node.js server validates input and persists records in SQLite locally or the dedicated Firestore database on Cloud Run. Semgrep runs in a temporary directory through execFile with argument arrays, a fixed locally installed scanner, time limits and bounded output. Uploaded code is never executed. Temporary files are removed after scanning.

The UI is split into workspace navigation, incident form and shared presentation components. Domain models, persistence, scanner execution and GitLab adapters are separate modules.

## State machine

Draft → Running → Validated or Failed → Approved. A failed scan can be retried. An approved antibody is immutable. Approval requires actual successful checks against both known-bad and known-fixed fixtures. Approved does not mean deployed. GitLab MR creation and Duo session creation record an event only on successful API responses.

## Evidence limits

Two fixture checks are a minimal validation, not an accuracy estimate. Upload scanning reports matches rather than confirmed vulnerabilities. No unlabelled organization-wide corpus is used to assert a false-positive rate. The starter detector is deterministic, maintained and explicitly labelled; it is not AI-generated. Real Duo synthesis uses a configured flow and returns a reviewable GitLab session. The approved hackathon namespace has completed a real proposal run; live GraphQL checkpoints provide observed status and agent output. Operator review remains explicit. The revision/import form preserves the original record and requires new validation and approval.

## GitLab rollout

An approved pack can create a branch with a detector, a CI include and an update to root CI includes, followed by a merge request. Existing root CI keys are preserved semantically. This is a project-level check, not a group pipeline execution policy. A failed scan only blocks merging if the target project's merge and pipeline settings enforce it. GitLab token permissions and Duo namespace access remain environment-specific.

## Authentication

Local development binds to loopback. For a network deployment, ACCESS_TOKEN enables HTTP Basic authentication on /app and /api (username antibody). Use HTTPS, a strong token and a trusted reverse proxy. This is a single-operator access gate, not multi-user SaaS authorization. Incident source is sensitive; do not expose this app unauthenticated on a public interface.

## Persistence and execution

SQLite uses WAL with a busy timeout. Persist .data on a local disk. Validations run in the request process; this version does not have a durable job queue or multi-instance execution coordination. Runs are claimed transactionally. Local abandoned runs are detected by owner-process liveness or a ten-minute lease limit and become retryable failures. Run identifiers prevent late work from replacing newer evidence. Firestore uses lease expiry rather than host-local PID checks. Production multi-tenant operation needs a durable database, job queue, tenant isolation, audit principals and repository-scoped credentials.

## Cloud Run

A Firestore storage adapter is now available through `ANTIBODY_STORE=firestore`, using the runtime service account and transactional record updates. Local SQLite remains the default. Cloud records are limited to 750 KB so oversized incident/source uploads fail before the Firestore document limit. Live Firestore persistence still needs verification in the selected project.

The container can run on Cloud Run, but the bundled SQLite file is ephemeral there. Cloud Run deployment with durable history must use the Firestore adapter and be verified after deployment. Do not mount SQLite WAL onto an object-store filesystem. Local Docker with a persistent volume is the supported durable deployment in this version. No cloud resources are created by setup.

GitLab OAuth credentials are suitable for validating this integration. An unattended deployment requires a managed credential rotation strategy; copying a desktop OAuth access token does not provide automatic refresh in Cloud Run.

## Repository source and revisions

Repository source is retrieved through GitLab APIs at an immutable commit SHA, with a 30-file, 100 KB/file, 400 KB/source and 1,000-tree-entry ceiling. Partial coverage is explicit. Source links reference that same commit. No repository code is executed. A reviewed revision always starts as a new draft; validation and approval do not transfer. For repository-backed revisions, the original pinned source is retained.

The scanner subprocess receives only runtime/path/certificate settings, not GitLab or application access tokens. Source and fixtures are stored locally in the operator database; unsaved text is temporarily stored in the browser tab's session storage. Closing the tab removes that unsaved text. Approved evidence exports contain findings and provenance rather than the whole uploaded source corpus.
