# Test the hosted Antibody workspace

Open **https://antibody-workspace.onrender.com/app**. The browser asks for HTTP Basic sign-in: username `antibody`, and the private workspace password provided separately to the owner. Do not paste credentials into incidents or source files.

This service runs on Render Free with Neon Free PostgreSQL. Your computer can be off. After inactivity, allow about a minute for the free server to wake; refresh once if the initial request times out. The hostname stays the same. Free hosting has resource limits and no paid uptime guarantee.

## 1. Inspect the existing evidence

Open an approved pack in the history. Check its fixture results, findings and activity history. Original records retain their IDs and approvals after migration. Uploaded source and fixtures are scanned, never executed.

## 2. Create your own controlled incident

1. Select **New antibody**, then **Use TLS example**. Give it a recognizable title, such as “My hosted TLS test”. The example fills editable incident text, unsafe/fixed Python and a maintained Semgrep rule. It is not AI-generated output.
2. For a source finding, save this as `unsafe_client.py` on your computer and upload it in the draft form:

   ```python
   import requests

   requests.get("https://example.com", verify=False)
   ```

3. Select **Create draft antibody**. A draft is saved before scanning.
4. Select **Run validation**. Wait for the real scanner; the free CPU can take tens of seconds. The unsafe fixture should be detected, the fixed fixture accepted, and the uploaded file should produce a finding.
5. Inspect the results, then select **Approve prevention pack**. Approval is blocked until the fixture checks pass.
6. Download the rule, CI job and evidence. Reload the page and confirm the approved record is still present.

To check failure recovery, create a separate draft whose detector fails to match the unsafe example. Validation should fail and approval should remain unavailable. Revise into a new draft with a corrected detector and validate again; the original evidence stays in history.

## 3. Test GitLab source and Duo

The hosted credential is restricted to the configured Antibody showcase project. In a new draft, use the GitLab repository source option, search `showcase`, and choose its branch. Antibody fetches a bounded snapshot pinned to an actual commit. Review included and skipped files; this is not an organization-wide coverage claim.

From an incident, select **Start Duo session**. Open the actual GitLab session or use **Refresh Duo result** to retrieve progress and output. A proposal is not automatically trusted: review its YAML and fixtures, create a revised draft, and run Semgrep before approving it.

## 4. Test rollout deliberately

For an approved pack, **Create rollout MR** writes the detector and CI include on a new GitLab branch and opens a reviewable merge request. Inspect the diff and pipeline in GitLab. Antibody does not merge it automatically. Avoid repeatedly creating equivalent checks in the same project; exports are enough for a normal product walkthrough.

A passing prevention job and an enforced merge policy are separate controls. Project-wide “Pipelines must succeed” remains a Maintainer-controlled setting; inspect the reported policy before relying on it.

## Troubleshooting

- **Sign-in repeats:** use username `antibody` and the exact private workspace password.
- **First load is slow:** allow the free instance to wake, then refresh.
- **Validation fails:** inspect the check results; both known failure and fix must behave correctly before approval.
- **GitLab refuses access:** check token expiry and project permissions. The hosted token expires on **25 November 2026** and must be replaced privately in Render.
- **Database temporarily unavailable:** retry shortly. A web-container restart does not erase PostgreSQL records.
