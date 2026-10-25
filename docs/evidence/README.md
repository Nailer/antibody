# Real integration evidence

All examples here are controlled verification fixtures, not customer incidents. Source snippets were scanned, never executed.

- Public project: https://gitlab.com/gitlab-ai-hackathon/transcend-october-2026/43693041/showcase
- Custom flow: https://gitlab.com/gitlab-ai-hackathon/transcend-october-2026/43693041/showcase/-/automate/flows/1019702
- Real completed session: https://gitlab.com/gitlab-ai-hackathon/transcend-october-2026/43693041/showcase/-/automate/agent-sessions/10020831
- Source import pipeline (passed): https://gitlab.com/gitlab-ai-hackathon/transcend-october-2026/43693041/showcase/-/pipelines/2986882289
- Generated detector rollout: https://gitlab.com/gitlab-ai-hackathon/transcend-october-2026/43693041/showcase/-/merge_requests/2
- Actual unsafe-code rejection: https://gitlab.com/gitlab-ai-hackathon/transcend-october-2026/43693041/showcase/-/jobs/17450487967
- Unsafe commit: `d4dfb26f1758ab30086df26a2a8d7c80c7a76711`
- Corrected commit: `84bd63395c1a953dcea51f58b345a0f4b1a54f13`

`duo-proposal-10020831.md` is the actual agent output, retrieved from the session checkpoint. It correctly labels the proposal as unvalidated. `duo-generated-rule.yml` is its proposed YAML. `duo-validation-evidence.json` is the application's subsequent real validation/approval export: six checks passed and one controlled source match was found. Those later checks do not turn the proposal into an accuracy guarantee.

The unsafe pipeline must fail because of its prevention finding. The corrected pipeline must pass before the prevention rollout is accepted. The corrected pipeline passed: https://gitlab.com/gitlab-ai-hackathon/transcend-october-2026/43693041/showcase/-/pipelines/2986896165 . Its actual prevention job passed with no findings: https://gitlab.com/gitlab-ai-hackathon/transcend-october-2026/43693041/showcase/-/jobs/17450507327 . The reviewed rollout MR was merged after that successful pipeline. Project merge-policy settings require Maintainer access and are not enabled by this verification.

A second session was started through the application, using only read-only agent privileges, and finished successfully: https://gitlab.com/gitlab-ai-hackathon/transcend-october-2026/43693041/showcase/-/automate/agent-sessions/10020978 . Its actual proposal is retrievable through the application’s authenticated progress endpoint.
