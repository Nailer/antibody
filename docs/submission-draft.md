# Antibody submission draft — not ready to submit

The mandatory live Duo and GitLab CI evidence is still missing. Replace this status only after the real integration gates pass; do not describe the prepared adapter as a completed agent run.

## Tagline

Turn one incident into tested prevention across GitLab.

## Problem

A team can repair a bug in one service while the same pattern remains elsewhere. The incident's lesson needs a reviewable, executable check, with evidence that it detects the failure and accepts the correction.

## Product

Antibody records the confirmed failure and fix, accepts a reviewed Semgrep detector, tests it against positive and negative examples, and scans supplied or GitLab-hosted Python source. Repository findings retain the exact commit and source links. A maintainer approves evidence before Antibody proposes a GitLab CI prevention check in a merge request.

## GitLab integration — current evidence

- Authenticated project/revision selection and repository source retrieval work.
- Controlled real repository scanning found the expected unsafe example at commit `b47ae455277b3bad4f06b51ee4410b4265164ea0`.
- Real rollout creation is demonstrated by [MR !1](https://gitlab.com/antibody-group1/Antibody-project/-/merge_requests/1).
- Live MR, pipeline and merge-policy inspection work. The existing pipeline is failed because the GitLab account is unverified; no successful hosted execution is claimed.
- The custom Duo flow definition and API adapter exist, with structured session storage and a reviewed draft-import flow. Catalog creation is permission-blocked; no live generated proposal is claimed.

## What makes the evidence useful

Additional negative examples challenge overly broad rules. Separate revisions preserve original evidence. Source limits and skipped files are disclosed. Approval, proposed rollout and pipeline results remain separate states. Interrupted runs recover to a retryable failure, and stale writers cannot replace newer evidence.

## Built with

TypeScript, Next.js, React, SQLite, Semgrep, GitLab repository/merge-request/pipeline APIs and a prepared GitLab Duo custom flow integration. Firestore/Cloud Run preparation is optional and has not been deployed.

## Demonstration and links still required

- Actual Duo session URL and reviewed generated detector.
- Actual GitLab pipeline fail/pass URLs.
- Public GitLab repository with MIT license and reproducible instructions.
- Public YouTube video under three minutes showing the automation working.
- Confirmed team and final autonomy category consistent with demonstrated behavior.

Deployment is deferred for the intended Start Fresh path. Final compliance is checked against https://gitlab-transcend.devpost.com/ and its official rules/resources.
