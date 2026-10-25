# Build log

- Established product model, operational boundaries, initial rule scope and design direction.
- Initialized independent repository without modifying the existing workspace product.

## Working product increment

- Implemented SQLite persistence and evidence-based approval state machine.
- Installed pinned Semgrep and verified actual detection against bad, fixed and safe variants.
- Built responsive landing, workspace, incident form, evidence review, approval and export.
- Added server-side GitLab rollout MR and Duo session adapters, with explicit unconfigured states.
- Added a registry-v1 custom flow definition; live namespace execution remains unverified.
- Fixed browser-origin handling after a real end-to-end test caught rejected local submissions.
- Passed eleven unit/integration tests and two browser workflow/responsive tests.
- Production build and TypeScript passed; reviewed desktop and mobile screenshots.
- Added installation, security, architecture, Docker and deployment-boundary documentation.

- Verified the actual exported CI command exits 1 for a reintroduced defect and exits 0 for the corrected code.
- Verified access-token challenges and cross-origin mutation rejection.
- GitHub verification passed on the hardening increment.

## Cloud integration preparation

- Connected local GitLab remote to antibody-group1/Antibody-project; GitHub origin retained.
- Installed official GitLab and Google Cloud CLIs. Google Cloud sign-in succeeded.
- Supplied project number 88036897 is inaccessible in Google Cloud; requested the intended accessible project before creating resources.
- Added a Firestore storage adapter and explicit-project Cloud Run deployment script. Live cloud validation is pending.

## Live integration checks (24 October 2026)

- Google Cloud project `gather-483dd` selected and accessible; billing is disabled, so no cloud resources were provisioned.
- GitLab owner authentication verified and existing main history pushed to project 88036897.
- GitLab Duo catalog flow creation currently returns a permission/resource error; no successful Duo run is claimed.
- Added dedicated named Firestore database configuration and database-scoped runtime IAM in deployment preparation.
- Eleven tests passed after asynchronous storage migration; production build passed.
- Fixed rollout compatibility with projects that define a custom CI stage list and support OAuth bearer credentials.

- Live bearer-authenticated GitLab API and rollout MR creation succeeded (MR !1); the proposed check remains unmerged.
- GitLab CI lint passed. Pipeline failure reason is account verification, before any jobs could start.

## Local-first continuation (25 October 2026)

- Deferred Google Cloud deployment at the user's request; no billing or cloud resource changes made.
- Added a loopback-only local launcher with persistent SQLite, scanner checks and optional Git credential-helper integration.
- Removed the copied OAuth token from the ignored local environment file; the launcher now loads the credential from the existing OS-backed GitLab sign-in.
- Added recovery for retries when a rollout MR already exists remotely but the local event was not recorded.
- Added a regression test proving retries reuse the MR without creating another commit.

- Verified the local API recovers the original live GitLab rollout MR and records its link.
- Browser testing exposed Turbopack watching mutable runtime files; excluded configured scanner/data paths from build tracing to stop repeated full-page reloads.
- Thirteen backend/scanner tests and TypeScript checks passed.

## Repository integration (25 October 2026)

- Rechecked GitLab: CI remains blocked by account verification; Duo catalog creation still returns a permission/resource error.
- Added project search, revision selection and bounded Python repository fetches at immutable commit SHAs.
- Repository evidence includes file limits, skipped files, coverage and source links; arbitrary clone URLs and execution are not accepted.
- Live GitLab fetch successfully retrieved two labelled controlled fixtures from `antibody/controlled-scan-fixtures`, commit `b47ae455277b3bad4f06b51ee4410b4265164ea0`.
- Sixteen tests passed, including pinned-source, skipped-source and streamed request-size checks.

## Evidence lifecycle and recovery

- Added transactional run claiming, stale-writer rejection and recovery of interrupted local validations.
- Added up to eight named positive/negative examples; approval depends on all observed fixture outcomes.
- Added separate draft revisions for reviewed proposal imports; originals retain their evidence and approval.
- Detail URLs now survive refresh and browser history. Unfinished form text is retained in the current tab with an explicit retention notice.
- Duo session ID, URL and initial status are stored structurally; unavailable live progress is not fabricated.

- Added recovery of matching orphaned rollout branches and live MR/pipeline/merge-policy inspection. The real existing MR is open, its pipeline is failed, and merge blocking is not configured; the UI reports these separately.
- Verified owner-only SQLite backup and restore with seven actual local records, without overwriting the source.
- Prepared a release checklist, honest submission draft and demo script; final publishing remains gated on real Duo/CI evidence.

- Final local verification: 21 backend/scanner tests passed; three browser workflows passed including invalid-detector recovery. Production build, TypeScript and formatting passed.
- Reviewed repository evidence/source links at desktop and mobile widths; fixed off-screen mobile-navigation visibility and added Escape/expanded-state semantics.

## Approved hackathon integration

- Discovered the provisioned public showcase project 88074697 and preserved its original README/history through a reviewed source import MR.
- Corrected live flow schema requirements: inline prompt unit primitives, input/template agreement and failure-event spelling. Removed the unused write-capable note tool.
- Created catalog flow 1019702 and enabled consumer 13153303. Real session 10020831 completed; its executor job succeeded.
- Added authenticated, bounded GraphQL retrieval of real agent output and observed progress. Agent messages with null roles are covered by a regression test.
- Reviewed the actual generated rule and passed six Semgrep fixture checks; created rollout MR !2.
- Proved actual GitLab CI rejection of the controlled unsafe revision (job 17450487967). Corrected revision is now in CI.
- Maintainer-only project merge-policy change returned 403; no automatic merge-blocking claim is made.

- Corrected commit 84bd63395c1a953dcea51f58b345a0f4b1a54f13 passed pipeline 2986896165 and prevention job 17450507327. Rollout MR !2 merged only after success.

- Verified a second real session (10020978) started through the application itself with read-only agent privileges; observed finished state and actual proposal output through the new API/UI.

## Remaining integration gate handoff — 25 October

- Rechecked canonical main: pipeline 2986935030 passed; live policy remains disabled with Developer-only access.
- With explicit user permission, sent Maintainer request #2 to the official contributor-success team.
- Located the existing Antibody Devpost draft (1259399), inspected required fields and confirmed YouTube accepts public or unlisted visibility. No duplicate entry or eligibility attestations were submitted.
- Updated stale release counts and separated recorded demo completion from pending publication. Added a concrete post-Maintainer verification procedure.
