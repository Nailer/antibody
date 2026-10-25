# Release evidence and remaining external gates

Updated 25 October 2026. This is a release checklist, not a claim that every gate is complete.

## Local release checks

- [x] Real known-bad/known-fixed Semgrep execution and enforcement-command exit codes.
- [x] GitLab repository fetch at a pinned revision and live controlled exposure finding.
- [x] Independent draft revisions; approved evidence retained.
- [x] Additional positive/negative fixture checks and overmatching rejection test.
- [x] Transactional run ownership, interrupted-run recovery and stale-write rejection tests.
- [x] Desktop/mobile browser flow, refresh restoration and revision/import flow.
- [x] SQLite backup and restore exercised against real persisted records.
- [x] Production build, 21 backend/scanner tests, three browser workflows and desktop/mobile visual review passed for this increment.

## External gates

- [x] Hosted GitLab CI runs in the provisioned project.
- [x] Contributor onboarding provides the authorized public showcase project.
- [x] Custom flow enabled; session 10020831 produced the actual detector and fixtures.
- [x] Actual generated prevention job failed on the unsafe commit and passed on the correction; rollout merged after success.
- [x] Public GitLab source with MIT license and run instructions is available.
- [ ] Final demo video recorded and published publicly on YouTube; under three minutes.
- [ ] Devpost entry, team information, category and required links checked and submitted.

Duo and CI access are now verified in the approved hackathon namespace. Project merge-policy editing returns 403 with the assigned Developer role; do not claim merge blocking until a Maintainer enables the policy.

## Submission fit

Target Path A: Start Fresh. Deployment is optional, so Google Cloud remains deferred. Autonomy category must describe the final demonstrated behavior; do not claim unattended operation while proposal review and approval remain human checkpoints. Explain only lifecycle stages actually implemented.

The official deadline is 27 October 2026 at 13:00 UTC / 14:00 WAT. Confirm final entry details against [official rules](https://gitlab-transcend.devpost.com/rules) and [resources](https://gitlab-transcend.devpost.com/resources). The resources describe the mandatory Duo integration and contributor onboarding at https://contributors.gitlab.com/transcend-hackathon/ .
