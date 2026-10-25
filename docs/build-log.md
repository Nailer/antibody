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
