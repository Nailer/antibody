# Antibody demo plan

Target length: 2 minutes 40 seconds. Record only real operations. Do not publish the final hackathon demo until Duo and GitLab CI are demonstrated. The fixtures below are controlled examples, not customer incidents.

1. 0:00–0:20 — Explain: a repaired incident should become a tested prevention check. Show the incident, unsafe Requests call and corrected call.
2. 0:20–0:50 — Start the real Duo session. Show the actual session and detector proposal; explain that the maintainer reviews the proposal. Use concise editing to omit waiting, without implying the flow ran faster than it did.
3. 0:50–1:10 — Import the reviewed proposal into a separate draft. Add a safe variant so a broad detector cannot silently pass.
4. 1:10–1:40 — Select an authorized GitLab repository/revision. Run validation and show the known failure detected, corrected/safe fixtures accepted and a finding linked to the pinned commit. Disclose partial coverage if present.
5. 1:40–2:10 — Approve evidence and create the real rollout MR. Show detector, CI include and human review boundary. Approval is not installation.
6. 2:10–2:35 — Show actual failed/passed GitLab pipeline URLs and merge policy state. Distinguish CI execution from merge blocking.
7. 2:35–2:40 — Close with the concrete result: one incident now has a reviewed, executable prevention check with traceable evidence.

Capture checklist: hide credentials and personal account details; use legible zoom; narrate the incident and outcome; no invented statistics, customer claims or AI output. The final video must follow the organizer's content requirements and be publicly accessible at the submission URL. Record actual Duo/CI failures honestly if they remain blocked; such a recording does not satisfy the missing integration gates.
