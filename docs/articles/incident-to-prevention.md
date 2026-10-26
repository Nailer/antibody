# From one TLS incident to a tested GitLab CI prevention check

A fixed incident can leave the same mistake in another service. A useful follow-up is to turn the incident's lesson into a small, testable detector, then propose that detector as a CI check. This walkthrough uses Antibody's controlled Python Requests example and links to actual GitLab execution evidence.

## Start with a confirmed failure and correction

The failure disables HTTPS certificate verification:

```python
import requests
requests.get("https://example.com", verify=False)
```

The correction restores verification:

```python
import requests
requests.get("https://example.com", verify=True)
```

These examples are static scanning fixtures. The scanner never executes their Python or makes the HTTP request.

## Ask Duo for a bounded detector

Antibody uses a custom GitLab Duo Agent Platform flow to propose Semgrep YAML, positive and negative fixtures, and detection limitations. The enabled flow's tools are read-only. Generated output remains a proposal: an operator reviews it and imports it into a separate draft.

[Session 10020831](https://gitlab.com/gitlab-ai-hackathon/transcend-october-2026/43693041/showcase/-/automate/agent-sessions/10020831) produced the detector used in this example. [Session 10020978](https://gitlab.com/gitlab-ai-hackathon/transcend-october-2026/43693041/showcase/-/automate/agent-sessions/10020978) separately verified that Antibody itself can start the live flow and retrieve its output. Session pages may require GitLab sign-in.

The generated proposal detects literal `verify=False` in selected Requests calls. It is not a general proof of TLS safety: aliases, dynamically constructed keyword arguments and session-level settings require separate coverage.

## Test what should match and what should pass

A detector that catches the incident but also flags the correction is unsuitable for prevention. Antibody runs actual Semgrep checks against both, with optional additional named examples.

For this pack, six fixture checks passed: three unsafe variants and three safe variants. Safe examples included certificate verification enabled, a trusted CA bundle, and default certificate verification. The reviewed rule also found one match in a controlled source file.

[The exported evidence](../evidence/duo-validation-evidence.json) records those observations. Six passing fixtures establish evidence for those cases; they do not establish an organization-wide accuracy rate.

Repository scans fetch bounded Python files at an immutable GitLab commit, retain source links and disclose skipped files. They do not clone arbitrary URLs or execute repository code.

## Review and propose installation

Approval freezes the validated pack. It does not automatically install it. A separate rollout action opens a GitLab merge request containing the detector and a CI include, while preserving existing root CI configuration.

The prevention command uses a pinned Semgrep image and returns a nonzero exit status on findings:

```yaml
incident_prevention:
  image: semgrep/semgrep:1.182.1
  stage: test
  script:
    - semgrep scan --config .antibody/8a30e277-dac5-4e49-b57b-75c2d8b8913d.yml --error --metrics=off .
  allow_failure: false
```

The rule file must exist at that path. Include the job in the project's CI configuration, and use a stage present in its stage list. [Rollout MR !2](https://gitlab.com/gitlab-ai-hackathon/transcend-october-2026/43693041/showcase/-/merge_requests/2) contains the actual generated integration.

## Prove rejection and acceptance in hosted CI

We used an explicitly controlled source file to verify the installed job:

- [Unsafe-revision job 17450487967](https://gitlab.com/gitlab-ai-hackathon/transcend-october-2026/43693041/showcase/-/jobs/17450487967) completed its scan, reported one blocking finding and failed with exit code 1.
- [Corrected-revision job 17450507327](https://gitlab.com/gitlab-ai-hackathon/transcend-october-2026/43693041/showcase/-/jobs/17450507327) passed after restoring verification.

The rollout merged after the passing revision. A failed pipeline is separate from enforced merge blocking: the project must require successful pipelines before merging. Our Developer account cannot change that setting, so Antibody reports its observed policy separately and a Maintainer request is open. Direct pushes have separate branch protections.

## Try the workflow

The [public MIT-licensed repository](https://gitlab.com/gitlab-ai-hackathon/transcend-october-2026/43693041/showcase) includes local setup instructions. The local SQLite workflow needs no Google Cloud account. GitLab credentials and an enabled Duo flow are needed for the live GitLab actions.

The result is a reviewable chain: confirmed incident, generated proposal, tested detector, approved evidence, proposed CI installation, and observed pipeline behavior. The human checkpoints are explicit; the product does not claim unattended repair or universal detection.
