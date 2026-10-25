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

- [ ] GitLab account verification permits CI jobs to run.
- [ ] Hackathon contributor onboarding provides the authorized Duo namespace/project.
- [ ] Custom flow is created/enabled and produces a real detector proposal.
- [ ] Real generated prevention pipeline fails for bad code and passes for corrected code.
- [ ] Public GitLab source visibility confirmed, with MIT license and final run instructions.
- [ ] Final demo video recorded and published publicly on YouTube; under three minutes.
- [ ] Devpost entry, team information, category and required links checked and submitted.

The last live check reports account verification blocking GitLab pipelines and a permission/resource error on Duo catalog creation. These gates cannot be represented by GitHub CI or a mock Duo response.

## Submission fit

Target Path A: Start Fresh. Deployment is optional, so Google Cloud remains deferred. Autonomy category must describe the final demonstrated behavior; do not claim unattended operation while proposal review and approval remain human checkpoints. Explain only lifecycle stages actually implemented.

The official deadline is 27 October 2026 at 13:00 UTC / 14:00 WAT. Confirm final entry details against [official rules](https://gitlab-transcend.devpost.com/rules) and [resources](https://gitlab-transcend.devpost.com/resources). The resources describe the mandatory Duo integration and contributor onboarding at https://contributors.gitlab.com/transcend-hackathon/ .
