# Security Policy

linearly is a fully static site: no server code, no database, no accounts, no cookies, no
analytics, and no form submissions. That keeps the attack surface small, but not zero. Things
worth reporting:

- Cross-site scripting through any content path (MDX, search, slide viewer, interactives)
- Dependency vulnerabilities that affect the built site (not just dev tooling)
- Anything in the build pipeline or GitHub Actions workflows that could compromise the
  deployed site
- Links on the site that have started redirecting somewhere harmful

## Reporting

Please report privately, not in a public issue. On GitHub, use "Report a vulnerability"
(Security → Advisories) on this repository.

You will get a human reply. If the report is valid, the fix ships as fast as the build runs,
and you will be credited in the fix's commit message unless you prefer otherwise.

## Scope notes

The site intentionally has no external runtime dependencies: fonts are self-hosted, and there
are no CDNs, trackers, or third-party scripts. A PR that introduces any of these will be
declined, so point your report at the PR that tried.
