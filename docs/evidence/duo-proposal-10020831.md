# Proposed Semgrep rule: Requests calls with TLS verification disabled

**Status: proposed and not validated.** I haven't been given any Semgrep results, and I didn't run any code. I didn't use any tools, because the supplied pair was enough. Nothing has been merged, deployed, or commented on.

## Failure pattern

A call to a `requests` module-level HTTP function passes the literal keyword argument `verify=False`. This turns off TLS certificate validation for that request.

## Proposed rule (`antibody.python.requests-verify-false.yaml`)

```yaml
rules:
  - id: antibody.python.requests-verify-false
    languages: [python]
    severity: ERROR
    message: >-
      A Requests call passes verify=False, which disables TLS certificate
      verification and allows machine-in-the-middle attacks. Use the default
      verification (verify=True or omit the argument). For a private CA, pass
      verify="/path/to/ca-bundle.pem".
    metadata:
      category: security
      cwe: "CWE-295: Improper Certificate Validation"
      confidence: MEDIUM
      status: proposed-unvalidated
    patterns:
      - pattern: requests.$FUNC(..., verify=False, ...)
      - metavariable-regex:
          metavariable: $FUNC
          regex: ^(get|post|put|patch|delete|head|options|request)$
```

## Positive fixture (should match)

`fixtures/requests_verify_false_positive.py`

```python
import requests

# ruleid: antibody.python.requests-verify-false
requests.get("https://example.invalid", verify=False)

# ruleid: antibody.python.requests-verify-false
requests.post("https://example.invalid/api", json={"k": "v"}, verify=False)

# ruleid: antibody.python.requests-verify-false
requests.request("GET", "https://example.invalid", timeout=5, verify=False)
```

## Negative fixture (should not match)

`fixtures/requests_verify_false_negative.py`

```python
import requests

# ok: antibody.python.requests-verify-false
requests.get("https://example.invalid", verify=True)

# ok: antibody.python.requests-verify-false
requests.get("https://example.invalid")

# Safe custom CA example
# ok: antibody.python.requests-verify-false
requests.post("https://example.invalid/api", json={"k": "v"}, verify="/etc/ssl/certs/internal-ca.pem")
```

## Why the fixed fixture should not match

The rule requires the keyword argument `verify` to be the literal `False`. The fixed fixture passes `verify=True`, so the argument pattern doesn't unify. The default call (no `verify`) and the custom CA path call (`verify="..."`) also have no `verify=False`. This is expected behavior from the pattern semantics. It still needs confirmation by running `semgrep --test`.

## Detection limits

- **Not detected:**
  - `session.verify = False`, and calls through a `requests.Session()` or `Session.get(..., verify=False)`. Session calls could be a follow-up rule.
  - `verify=` set through `**kwargs` or a dict.
  - Non-literal values, such as `verify=flag` or `verify=0`. Whether Semgrep's constant propagation catches `VERIFY = False; ...verify=VERIFY` is unverified.
  - Other libraries: `httpx`, `urllib3`, `aiohttp`, and `ssl._create_unverified_context`.
  - Environment-level weakening, such as a `CURL_CA_BUNDLE=""` workaround or a patched `requests` adapter.
- **Unresolved ambiguity:**
  - Alias handling (`import requests as r`, `from requests import get`) is not covered by the supplied fixtures. The `from requests import get` form likely isn't matched by this pattern. Add fixtures and check before relying on either.
  - Test code that disables verification on purpose against local servers will match. The rule can't tell intent, so some findings may be acceptable and need triage.
  - A local function or class named `requests` would also match, because the rule is syntactic.
- **Matching is on the call expression only.** The rule doesn't check whether the target URL is `https`.

## Suggested next step for the operator

Run `semgrep --test` against the two fixture files (or merged into one test file) and supply the output. Until then the rule remains unvalidated.
