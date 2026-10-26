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

TypeScript, Next.js, React, Node.js 24, PostgreSQL (Neon), SQLite for local development, Semgrep, Docker, Render, GitLab CI/CD, GitLab repository/merge-request/pipeline APIs and a real GitLab Duo custom flow. Google Cloud is not deployed.

## Verified artifacts and final submission gates

- Verified Duo session and detector: see the evidence links above and `docs/evidence/`.
- Verified GitLab fail/pass job URLs: see above.
- [Public MIT-licensed source and setup instructions](https://gitlab.com/gitlab-ai-hackathon/transcend-october-2026/43693041/showcase).
- Narrated 2:17 video is recorded; upload to the agreed YouTube channel remains. The form mentions public or unlisted, but the official rules require publicly visible YouTube footage. Use Public, under three minutes.
- Team and eligibility facts still require owner confirmation. Recommended category: Start Fresh: Assisted, matching explicit human review/import and approval.

Live deployment: https://antibody-workspace.onrender.com/ (landing) and /app (protected workspace). Provide credentials only in Devpost’s private judge testing field after owner authorization. Path A does not require Google Cloud. Final compliance is checked against https://gitlab-transcend.devpost.com/ and its official rules/resources.

The existing entry is [Antibody](https://devpost.com/software/antibody-ahd7om), submission 1259399 for Life After Code. It was inspected on 25 October and remains a draft with 2/5 steps complete. Do not create a duplicate.

## Submission field guidance

- Path/autonomy: Start Fresh: Assisted.
- Lifecycle stages with direct evidence: Verify (positive/negative fixture tests), Secure (Semgrep findings), Configure (generated detector/job/root CI configuration). Do not select unrelated stages merely because the application has a dashboard or is hosted.
- Public try-it links: hosted landing page and canonical GitLab repository.
- Judge instructions: private instructions prepared locally; password must never go into public story, screenshots or README.
- Environmentally Impactful prize: do not opt in without measured, defensible sustainability evidence.
- Team, age, jurisdiction and conflicts: complete only from confirmed facts. Do not finalize or accept terms automatically.

## Inspiration

Fixing an incident in one file does not turn the postmortem into a reusable check. Antibody keeps the original failure, the correction, and the evidence behind a prevention rule connected.

## How we built it

A Next.js/TypeScript workspace stores incident history and runs bounded Semgrep scans without executing supplied source. GitLab Duo's custom flow proposes a detector and fixtures. A person reviews/imports the proposal, validates both unsafe and safe examples, then approves an export or reviewable GitLab MR. The hosted release uses transactional PostgreSQL; credentials remain server-side.

## Challenges and lessons

AI output is not validation. We kept proposal, validation, human approval and rollout as separate states. Positive/negative examples challenge overly broad detectors; repository snapshots retain exact commits and disclose skipped files. Real GitLab jobs established unsafe-code rejection and corrected-code acceptance, while live project policy remains separately reported rather than assumed.

## Accomplishments

Real Duo sessions, generated-rule validation with six passing examples and a controlled finding, actual CI fail/pass proof, a reviewed rollout, durable free hosting, and a public product explanation. Current main passed 27 backend/scanner/PostgreSQL checks and a production build; container validation/restart checks also passed.

## What's next

Expand carefully to more representative rule packs and languages, add stronger evaluation datasets, and improve team access and orchestration. These are future work, not current demo claims.
