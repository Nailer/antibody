# Antibody submission draft — not ready to submit

The real Duo proposal and unsafe-revision CI rejection are verified. Corrected-revision CI also passed. Public video and final submission review remain.

## Tagline

Turn one incident into tested prevention across GitLab.

## Problem

A team can repair a bug in one service while the same pattern remains elsewhere. The incident's lesson needs a reviewable, executable check, with evidence that it detects the failure and accepts the correction.

## Product

Antibody records the confirmed failure and fix, accepts a reviewed Semgrep detector, tests it against positive and negative examples, and scans supplied or GitLab-hosted Python source. Repository findings retain the exact commit and source links. A maintainer approves evidence before Antibody proposes a GitLab CI prevention check in a merge request.

## GitLab integration — current evidence

- [Real completed custom Duo session](https://gitlab.com/gitlab-ai-hackathon/transcend-october-2026/43693041/showcase/-/automate/agent-sessions/10020831) generated a bounded detector, fixtures and detection limits.
- The reviewed output passed six actual Semgrep fixture checks and found one controlled source match.
- [Rollout MR !2](https://gitlab.com/gitlab-ai-hackathon/transcend-october-2026/43693041/showcase/-/merge_requests/2) proposes the generated rule and CI job.
- [Real prevention job](https://gitlab.com/gitlab-ai-hackathon/transcend-october-2026/43693041/showcase/-/jobs/17450487967) rejected the unsafe fixture with one finding and exit code 1.
- Hosted application verification and the [corrected-revision prevention job](https://gitlab.com/gitlab-ai-hackathon/transcend-october-2026/43693041/showcase/-/jobs/17450507327) passed.
- The application reports pipeline state and the absence of a merge-blocking policy separately.

## What makes the evidence useful

Additional negative examples challenge overly broad rules. Separate revisions preserve original evidence. Source limits and skipped files are disclosed. Approval, proposed rollout and pipeline results remain separate states. Interrupted runs recover to a retryable failure, and stale writers cannot replace newer evidence.

## Built with

TypeScript, Next.js, React, SQLite, Semgrep, GitLab repository/merge-request/pipeline APIs and a real GitLab Duo custom flow integration. Firestore/Cloud Run preparation is optional and has not been deployed.

## Verified artifacts and final submission gates

- Verified Duo session and detector: see the evidence links above and `docs/evidence/`.
- Verified GitLab fail/pass job URLs: see above.
- [Public MIT-licensed source and setup instructions](https://gitlab.com/gitlab-ai-hackathon/transcend-october-2026/43693041/showcase).
- Narrated 2:17 video is recorded; upload to the agreed YouTube channel remains. The entry accepts public or unlisted visibility with no password.
- Confirmed team and final autonomy category consistent with demonstrated behavior.

Deployment is deferred for the intended Start Fresh path. Final compliance is checked against https://gitlab-transcend.devpost.com/ and its official rules/resources.

The existing entry is [Antibody](https://devpost.com/software/antibody-ahd7om), submission 1259399 for Life After Code. It was inspected on 25 October and remains a draft with 2/5 steps complete. Do not create a duplicate.
