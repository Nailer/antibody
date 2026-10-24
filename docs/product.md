# Product model

## Thesis
A fixed incident should become an executable prevention check that can be reused across projects.

## User and core action
An application security engineer or platform maintainer creates an incident-derived detector, reviews its actual validation evidence and exposure results, and approves an exportable CI prevention pack.

## Loop
Incident → draft detector → validate → scan → review → approve → enforce in GitLab → observe future findings.

## Scope
Local single-operator workstation deployment first. No claim of production multi-user authentication. Next.js application, durable SQLite store, Semgrep subprocess runner, GitLab REST integration and Duo custom flow definition. Cloud Run deployment is documented with a durable-storage caveat; SQLite deployment targets a persistent single instance.

## First supported pattern
Python Requests calls with TLS verification explicitly disabled. A maintained deterministic rule pack provides a reproducible starting point. This is labelled built-in generation, never passed off as AI synthesis. Custom Semgrep YAML can be supplied. GitLab Duo can be started with incident context when credentials and a catalog flow are configured.

## Essential flow
First visit explains the product → application empty state → create incident with bad/fixed fixtures → validation progress → findings/evidence → approval → download prevention pack → history and integration settings.

## Quality and safety
Only explicit code uploads or configured local workspaces are scanned. No arbitrary server paths or remote clone URLs accepted through HTTP. Fixtures are scanned, never executed. No approval if validation fails. Reports expose bounded/redacted diagnostics, not credentials. State is derived from persisted runner results. No fabricated metrics, fake scans, or fabricated integration success.

## Design
Ink and warm paper, signal-green accents, restrained borders, compact evidence tables. Typography: system sans with monospace for identifiers. Spacing 4/8/12/16/24/32/48, radii 4/8/12, 44px mobile targets, visible focus and reduced motion. Navigation: overview, antibodies, integrations. Primary action: create antibody. Results prioritize validation and evidence over decorative charts.
