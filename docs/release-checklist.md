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
- [x] Production build, 23 backend/scanner tests, three browser workflows and desktop/mobile visual review passed for this increment.

## External gates

- [x] Hosted GitLab CI runs in the provisioned project.
- [x] Contributor onboarding provides the authorized public showcase project.
- [x] Custom flow enabled; session 10020831 produced the actual detector and fixtures.
- [x] Actual generated prevention job failed on the unsafe commit and passed on the correction; rollout merged after success.
- [x] Public GitLab source with MIT license and run instructions is available.
- [x] Narrated demo recorded and decoded successfully: 2:17, with English captions.
- [ ] Demo uploaded to the agreed YouTube channel, public or unlisted with no password.
- [ ] Devpost entry, team information, category and required links checked and submitted.

Duo and CI access are now verified in the approved hackathon namespace. Project merge-policy editing returns 403 with the assigned Developer role. [Maintainer request #2](https://gitlab.com/gitlab-ai-hackathon/transcend-october-2026/43693041/showcase/-/work_items/2) was sent to the official contributor-success team with user authorization. Do not claim merge blocking until the policy and failed-MR rejection are verified. See [integration handoff](integration-handoff.md).

## Submission fit

Target Path A: Start Fresh. Deployment is optional, so Google Cloud remains deferred. Autonomy category must describe the final demonstrated behavior; do not claim unattended operation while proposal review and approval remain human checkpoints. Explain only lifecycle stages actually implemented.

The official deadline is 27 October 2026 at 13:00 UTC / 14:00 WAT. Confirm final entry details against [official rules](https://gitlab-transcend.devpost.com/rules) and [resources](https://gitlab-transcend.devpost.com/resources). The resources describe the mandatory Duo integration and contributor onboarding at https://contributors.gitlab.com/transcend-hackathon/ .
