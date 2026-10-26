# Remaining integration gates

Re-audited 26 October 2026 against live GitLab settings, hosted app and existing Devpost draft.

## Working integrations

- Public MIT showcase project: GitLab project 88074697.
- Custom Duo flow 1019702, enabled consumer 13153303; actual completed sessions 10020831 and 10020978 (the second started through Antibody).
- Generated rule: six real fixture checks passed. The installed CI job rejected unsafe code and accepted its correction.
- Main pipeline 2991281022 succeeded on release e0678560bcadda9e3f73a7b0b588c8cb07dcde38 before the documentation audit.
- Hosted landing: https://antibody-workspace.onrender.com/ . Protected app: /app. PostgreSQL records, completed Duo output, scoped repository search, approval/exports and restart persistence are verified. Google Cloud is not deployed or required.

## Merge enforcement — awaiting Maintainer

[Request #2](https://gitlab.com/gitlab-ai-hackathon/transcend-october-2026/43693041/showcase/-/work_items/2) was sent to the official contributor-success team after explicit user authorization. Current access is Developer (30); changing the setting returns HTTP 403.

Requested action: enable **Settings → Merge requests → Merge checks → Pipelines must succeed** (`only_allow_merge_if_pipeline_succeeds=true`), leaving skipped-pipeline merging disabled.

After the Maintainer responds:

1. Read project settings again and confirm the policy is enabled.
2. Open a clearly labelled controlled MR containing the known unsafe fixture on a temporary branch, without changing main.
3. Wait for the actual prevention job to fail.
4. Verify GitLab reports the MR blocked by the failed pipeline; if using the merge API, only attempt it after the enabled policy and failed head pipeline are both confirmed. Never attempt an unsafe merge while policy is disabled.
5. Correct the fixture and verify the head pipeline passes. Close the controlled MR and remove its temporary branch; the test does not require merging it.
6. Record URLs and observed status. Distinguish protection of MR merges from direct pushes permitted by existing branch rules.

## Submission delivery — separate from runtime integration

Existing [Devpost draft](https://devpost.com/submit-to/31503-life-after-code/manage/submissions/1259399-antibody/project_details/edit): 2/5 steps complete. Project story, built-with tags, source links and YouTube URL remain to be completed. Additional info requires source URL, technology explanation, Path/autonomy level, lifecycle selection and submitter eligibility details.

The narrated demo is `.data/demo/antibody-demo-draft.mp4` (2:17); captions are `.data/demo/captions.srt`. These local ignored artifacts are intentionally absent from Git. Choose the user's intended YouTube channel before uploading. The Devpost form permits unlisted, but the official rules specify publicly visible YouTube footage. Use Public, under three minutes.

Recommended truthful category: **Start Fresh: Assisted**. Detector proposal import and approval remain explicit human checkpoints. Verify, Secure and Configure are supported by actual implemented workflows. Do not claim the environmental prize without measured sustainability evidence.

Do not submit eligibility attestations on the user's behalf without confirmed facts. Final submission and video publishing remain pending. No Google Cloud billing repair is needed. The free hosted release is already deployed; preserve its credentials privately and keep it available during judging.
