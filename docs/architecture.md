# Architecture and operational limits

## Boundaries

The browser supplies explicit incident data, Python snippets, and optional source files. It never receives GitLab tokens. The Node.js server validates input and persists records in SQLite locally or the dedicated Firestore database on Cloud Run. Semgrep runs in a temporary directory through execFile with argument arrays, a fixed locally installed scanner, time limits and bounded output. Uploaded code is never executed. Temporary files are removed after scanning.

The UI is split into workspace navigation, incident form and shared presentation components. Domain models, persistence, scanner execution and GitLab adapters are separate modules.

## State machine

Draft → Running → Validated or Failed → Approved. A failed scan can be retried. An approved antibody is immutable. Approval requires actual successful checks against both known-bad and known-fixed fixtures. Approved does not mean deployed. GitLab MR creation and Duo session creation record an event only on successful API responses.

## Evidence limits

Two fixture checks are a minimal validation, not an accuracy estimate. Upload scanning reports matches rather than confirmed vulnerabilities. No unlabelled organization-wide corpus is used to assert a false-positive rate. The starter detector is deterministic, maintained and explicitly labelled; it is not AI-generated. Real Duo synthesis requires a configured flow and returns a reviewable GitLab session. Operator review and importing the resulting YAML into a new draft are currently manual.

## GitLab rollout

An approved pack can create a branch with a detector, a CI include and an update to root CI includes, followed by a merge request. Existing root CI keys are preserved semantically. This is a project-level check, not a group pipeline execution policy. A failed scan only blocks merging if the target project's merge and pipeline settings enforce it. GitLab token permissions and Duo namespace access remain environment-specific.

## Authentication

Local development binds to loopback. For a network deployment, ACCESS_TOKEN enables HTTP Basic authentication on /app and /api (username antibody). Use HTTPS, a strong token and a trusted reverse proxy. This is a single-operator access gate, not multi-user SaaS authorization. Incident source is sensitive; do not expose this app unauthenticated on a public interface.

## Persistence and execution

SQLite uses WAL with a busy timeout. Persist .data on a local disk. Validations run in the request process; this version does not have a durable job queue or multi-instance execution coordination. A process crash can leave a record Running and requires operator recovery. Production multi-tenant operation needs a durable database, job queue, tenant isolation, audit principals and repository-scoped credentials.

## Cloud Run

A Firestore storage adapter is now available through `ANTIBODY_STORE=firestore`, using the runtime service account and transactional record updates. Local SQLite remains the default. Cloud records are limited to 750 KB so oversized incident/source uploads fail before the Firestore document limit. Live Firestore persistence still needs verification in the selected project.

The container can run on Cloud Run, but the bundled SQLite file is ephemeral there. Cloud Run deployment with durable history must use the Firestore adapter and be verified after deployment. Do not mount SQLite WAL onto an object-store filesystem. Local Docker with a persistent volume is the supported durable deployment in this version. No cloud resources are created by setup.

GitLab OAuth credentials are suitable for validating this integration. An unattended deployment requires a managed credential rotation strategy; copying a desktop OAuth access token does not provide automatic refresh in Cloud Run.
