# Draft demo narration

This narration accompanies an actual local product recording. All incidents and source examples are controlled verification fixtures.

Antibody turns the lesson from one confirmed bug into tested prevention. A fix in one service should not leave the same mistake elsewhere, or let it return in the next release. These are controlled verification examples, not customer incidents.

This is an actual completed GitLab Duo session. Our custom incident-to-rule flow received the unsafe and corrected Python examples, then proposed a Semgrep detector, additional fixtures, and detection limits. Antibody retrieves that real output from GitLab. The proposal does not claim to be validated. The maintainer reviews it and imports it into a separate draft. The agent does not merge, deploy, or execute the supplied Python code.

Here is the reviewed detector. Semgrep actually executed six checks: the original failure, its correction, two additional unsafe Requests calls, a trusted certificate bundle, and default verification. All six behaved as expected. Approval remains a separate human checkpoint. Revisions preserve the original record and require fresh evidence. This small fixture set is useful evidence, not a general accuracy guarantee.

The same detector also found the controlled unsafe example in supplied source. Findings require investigation. Antibody can also retrieve bounded Python source from an accessible GitLab repository, pin the exact commit, disclose skipped files, and link matches to that revision. It never executes the submitted source.

The approved pack created a real GitLab merge request containing the detector and its CI check. The pipeline evidence shows the unsafe revision failing, then the corrected revision passing. We merged the rollout only after that success. Pipeline failure is distinct from merge blocking: a GitLab Maintainer must enable the project policy before we can claim the merge button is protected.

The result is a traceable path from incident, through a real Duo proposal and independent validation, to a working GitLab prevention check. The source and verification evidence are public. Antibody runs locally with persistent history, and Google Cloud is not required for this workflow.
