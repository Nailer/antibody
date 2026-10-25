# Antibody execution backlog

Updated: 25 October 2026. Google Cloud is deferred. Continue with the local single-operator product and GitLab integration.

## Current verified baseline

- Local SQLite history, real Semgrep validation, approval gates and exports work.
- Real GitLab rollout MR creation and existing-MR recovery work.
- 23 backend/scanner tests, three browser tests and the production build passed on the latest increment.
- Hosted CI now runs successfully in the provisioned public hackathon project.
- Real Duo session 10020831 completed; the generated detector passed six Semgrep fixture checks.

## P0 — complete the core product loop

### T01 — unblock GitLab CI and Duo access

Status: completed in the provisioned hackathon project. The public custom flow is enabled and the first actual session completed.

- Recheck account verification, project permissions and Duo catalog eligibility using the signed-in account.
- Validate the flow definition against the live platform and correct any schema or tool errors.
- Register and enable the incident-to-rule flow in the authorized namespace.
- Store the consumer ID in local configuration and run one real session.
- If access still fails, report the exact account action required; do not simulate success.

Done when: a real GitLab pipeline runs and a Duo session produces a reviewable detector. Account/payment/identity verification remains a user action when GitLab requires it.

### T02 — complete detector proposal review and import

Status: completed and live-verified. Reviewed generated output was imported into a separate draft; live observed status and agent output are available in the application.

- Persist a structured synthesis session ID, URL and state rather than relying on event text.
- Show session progress, failures and a direct return link.
- Provide explicit import and review of proposed YAML and fixtures into a new draft.
- Preserve the original incident and proposal provenance; never overwrite an approved pack.
- Keep execution of Semgrep and human approval mandatory after import.

Done when: one real incident moves through Duo proposal → reviewed draft → real validation → approval without recreating the incident manually. Automatic retrieval is conditional on supported platform APIs; an explicit import is an acceptable first release.

### T03 — scan an authorized GitLab repository

Status: implemented; live controlled repository fetch verified. Pinned-source and request-limit checks passed.

- Let the operator select an accessible project and branch/commit.
- Fetch bounded Python source through the authenticated GitLab API; do not execute repository code.
- Apply file-count, total-size and timeout limits; disclose skipped files and partial coverage.
- Persist project, commit SHA and file provenance with results.
- Link findings to the matching GitLab source revision.

Done when: the operator can scan a real repository at a pinned commit without manually uploading files, and permission/rate-limit/size failures have useful recovery paths.

### T04 — verify prevention in an actual GitLab pipeline

Status: real unsafe-revision failure and corrected-revision success verified in GitLab CI. Rollout MR merged after success. Merge-policy configuration still requires Maintainer access. [Request #2](https://gitlab.com/gitlab-ai-hackathon/transcend-october-2026/43693041/showcase/-/work_items/2) has been sent to the official contributor-success team with user authorization.

- Test in a controlled repository with safe bad/fixed fixtures.
- Run the generated prevention job against both revisions.
- Confirm the defective revision fails and the corrected revision passes.
- Check merge settings before claiming a failed check blocks merging.
- Display MR and pipeline state separately from approval state.
- Recover an orphaned rollout branch if commit creation succeeds but MR creation fails.

Done when: real pipeline URLs prove fail/pass behavior and the UI distinguishes proposed, installed and verified enforcement. No automatic merge is required.

## P1 — reliability and usable workflows

### T05 — recover interrupted and concurrent validations

Status: implemented and tested: transactional claiming, interrupted-run recovery and stale-writer rejection.

- Prevent duplicate validation starts for the same record.
- Identify interrupted runs after a restart; offer a safe retry.
- Ensure stale work cannot overwrite newer results or approval.
- Persist useful run identifiers and timestamps.

Done when: restart and duplicate-request tests demonstrate records cannot remain misleadingly Running or be overwritten by stale results.

### T06 — broaden detector evidence

Status: implemented and tested, including rejection of an overmatching safe example.

- Support multiple positive and negative fixtures per detector.
- Include meaningful safe variants and known unsupported cases.
- Show each fixture's observed result and explain coverage limits.
- Avoid accuracy percentages based on a tiny fixture set.

Done when: approval evaluates every supplied fixture, including negative cases, with regression tests covering a detector that overmatches.

### T07 — finish navigation and error recovery

Status: core navigation, refresh, separate revisions and tab-local unfinished-text recovery implemented. Final visual/error QA continues.

- Add stable detail URLs, refresh restoration and browser back navigation.
- Preserve unfinished incident input after recoverable errors.
- Add draft revision or duplication so corrections do not require starting over.
- Provide actionable expired-credential, permission, scanner and network errors.
- Review keyboard focus, mobile evidence layouts and reduced motion.

Done when: a user can recover from a failed scan/API request, share a local detail URL and return to the same record after refresh.

## P2 — readiness and delivery

### T08 — local operation and security hardening

Status: local backup/restore verified; streamed request limits and reduced scanner subprocess credentials implemented. Final review continues.

- Document SQLite backup/restore and test a recovery.
- Verify payload and resource limits at API boundaries, including oversized requests.
- Review credential redaction, source-code retention and export contents.
- Confirm cloud dependencies remain optional for local execution.

Done when: a fresh local setup can run the core flow without Google Cloud and recover persisted history from a backup.

### T09 — final integrated product QA

Status: local release checks passed (23 backend/scanner tests, three browser workflows, production build and visual review). Live Duo, actual unsafe-code rejection and corrected-code acceptance are verified.

- Run core tests and browser checks after the last feature changes.
- Exercise empty, loading, failed, interrupted, approved and rolled-out states.
- Inspect desktop/mobile screenshots and keyboard interaction.
- Review real integration evidence and unresolved limitations.

Done when: the release checklist contains evidence for every claimed working integration and no known blocking core-flow defects.

### T10 — hackathon submission and reproducibility

Status: official rules reviewed; release checklist, demo script and honest submission draft prepared. Public MIT source and live Duo/CI proof are verified; a narrated 2:17 demo is recorded. YouTube publication and final submission remain open.

- Reconcile implemented features with organizer requirements and eligible prize tracks.
- Check repository visibility, license, required artifacts and submission deadline.
- Update README with actual setup, architecture, sponsor integration and limitations.
- Prepare a reproducible demonstration using controlled, clearly identified fixtures and real execution.
- Record the required demo video and prepare submission copy with verified links.
- Choose reviewer access compatible with the rules; a loopback-only URL is not remotely accessible.

Done when: another developer can run the product and judges can inspect every required artifact. Public publishing/submission should use the agreed final materials.

## Execution order

1. Recheck T01 immediately; continue independent work if external access remains blocked.
2. Implement T03, then T02's review/import flow; use T05 to harden execution as these are added.
3. Complete T04 as soon as GitLab CI is available.
4. Add T06 and T07 around the end-to-end flow, then T08–T10.

Google Cloud provisioning, billing repair, multi-tenant SaaS, organization-wide policy enforcement and unrelated language expansion are outside this release backlog.
