# Hackathon release readiness — 26 October 2026

This distinguishes working product evidence from submission delivery. Do not call the entry submitted until Devpost confirms submission.

## Verified product and source

- [x] Public canonical GitLab project 88074697; MIT License detected and visibly linked in project information.
- [x] Main release e0678560 passed pipeline 2991281022; 27 backend/scanner/PostgreSQL tests passed in feature verification.
- [x] Production container passed actual Semgrep execution at 512 MB and restart persistence checks.
- [x] Public landing page and protected hosted workspace are live on Render Free with Neon PostgreSQL.
- [x] Original 27 records migrated; hosted test evidence and saved approval survived restart/redeployment. Current workspace contains 29 records.
- [x] Latest hosted audit: readiness, anonymous API denial, scoped project discovery, repository branches, actual completed Duo output and saved approved record all passed.
- [x] Real custom Duo flow 1019702 / enabled consumer 13153303. Hosted-started session 10077907 finished with actual output.
- [x] Reviewed generated detector passed six fixture checks and found one controlled source match.
- [x] Prevention job 17450487967 rejected the controlled unsafe revision; job 17450507327 passed the correction.
- [x] Draft revisions, additional safe/unsafe examples, approval gating, exports and source scope/provenance are implemented.
- [x] Landing tabs/keyboard/FAQ and 320/390/768 px responsive layouts reviewed; workspace browser workflows were previously verified.

## Fixes from this audit

- [x] Reconciled README and submission copy with actual Render/Neon deployment and completed Duo/CI integration.
- [x] Removed stale Supervised positioning. Recommended entry is **Start Fresh: Assisted**.
- [x] Corrected video visibility guidance: use Public on YouTube, under three minutes, following official rules rather than the form's less strict unlisted hint.
- [x] Prepared private judge testing instructions locally without putting credentials in Git or public text.

## Required delivery gates — still open

- [ ] Owner authorizes workspace credential sharing in Devpost's private judge-only testing field; save and verify those instructions.
- [ ] Confirm country, legal adulthood, eligibility/conflict facts and final team membership; enter them accurately.
- [ ] Complete the existing Devpost draft 1259399: story, built-with tags, source/try-it links, category and supported lifecycle selections. It was still 2/5 complete during this audit.
- [ ] Record the final current-product demo, strictly under three minutes; label historical CI/session evidence accurately.
- [ ] Upload the approved video publicly to YouTube, verify playback/access, and enter the actual URL.
- [ ] Review screenshots and final preview; owner approves submission/required attestations and Devpost confirms submitted status.

## Limits that must remain honest

Project policy `only_allow_merge_if_pipeline_succeeds` is still false. Maintainer request #2 remains open with no reply. CI failure is proved; merge blocking is not. This is not required to portray an Assisted review-and-propose workflow, so do not delay the entire submission awaiting a Maintainer or claim it works.

The hosted GitLab token expires 25 November 2026, after the published judging period. The free host can sleep and has usage limits; keep credentials valid and provide cold-start instructions. Do not remove authentication to make the demo easier. There is no Google Cloud deployment or quantified sustainability claim.

## Deadline and stopping point

Official deadline: **27 October 2026, 13:00 UTC / 14:00 WAT**. Sources: [rules](https://gitlab-transcend.devpost.com/rules), [overview](https://gitlab-transcend.devpost.com/), [resources](https://gitlab-transcend.devpost.com/resources).

Freeze features once these release fixes pass. Before filming, rehearse one incident → actual Duo proposal → reviewed draft → real validation → approval → rollout evidence. After the final video and submission are verified, stop feature work and retain the working release for judges. Community extras, new languages, Google Cloud and account-system expansion are outside this freeze.
