# Governance

Muharrir is currently maintained by Ali Assiri as a benevolent-maintainer open-source project.

## Maintainer Responsibilities

- Keep the MIT license, README, package metadata, and release notes consistent.
- Review issues and pull requests for privacy, static-export compatibility, Arabic/English UX, and local-first behavior.
- Avoid adding a project backend, telemetry, or cloud storage without a documented architecture decision.
- Keep grant and application materials honest: no invented traction, funding, partnerships, or provider guarantees.

## Decision Process

Small fixes can be merged by the maintainer after normal review. Larger changes should include an issue or proposal first, especially when they affect:

- API key storage or provider request handling.
- Tauri desktop packaging, signing, updater behavior, or OS integration.
- Data storage, import/export, file parsing, or privacy boundaries.
- New AI providers, prompt workflows, telemetry, or any networked service.
- Public roadmap or grant/application claims.

Important decisions should be recorded in `docs/oss-grant-readiness/DECISIONS.md` or a future architecture decision record.

## Release Policy

- Web and CI releases must pass lint, typecheck, unit tests, static export, and smoke tests without API secrets.
- Desktop updater releases require valid Tauri signing secrets and should not be claimed as ready until signed artifacts are produced.
- Beta releases may include demo media and source tags without signed desktop installers if the release notes say that clearly.

## Community Standards

Participation is governed by `CODE_OF_CONDUCT.md`. Contributions should follow `CONTRIBUTING.md`, and security issues should follow `SECURITY.md`.
