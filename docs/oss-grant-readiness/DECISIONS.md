# Muharrir OSS Readiness Decisions

This log records project-readiness decisions that should stay visible while Muharrir is prepared for a later public OSS release and grant application.

## Status

Muharrir completed its private OSS readiness pass. On 2026-07-23 the owner
authorized the final CI repair, public visibility, and Codex for Open Source
submission preparation.

## Decisions

| Date | Decision | Rationale | Status |
|---|---|---|---|
| 2026-07-08 | Prepare privately before opening the repository. | Reduces risk from license, privacy, and documentation gaps. | Accepted |
| 2026-07-08 | Use MIT as the target public license. | Maximizes adoption and keeps contribution expectations simple. | Accepted |
| 2026-07-08 | Keep `private: true` in `package.json` for now. | Prevents accidental npm publication; GitHub visibility can still change later. | Accepted |
| 2026-07-08 | Use `muharrir` as the package name and `Muharrir` as the public display name. | Keeps the npm-style package identity simple while preserving the readable brand. | Accepted |
| 2026-07-08 | Defer a polished desktop release until the release gate is otherwise ready. | Desktop signing and release notes are valuable, but license, docs, CI, and demo trust come first. | Accepted |
| 2026-07-08 | Use local setup plus screenshots/GIFs before considering a hosted demo URL. | The app is local-first and provider-based; a hosted demo can be evaluated after the no-key demo flow is stronger. | Accepted |
| 2026-07-08 | Preserve the current icon and visual identity for the first OSS readiness pass. | The current assets are usable; readiness risk is higher in licensing, trust, docs, and CI. | Accepted |
| 2026-07-08 | Preserve the local-first static-export architecture. | Public readiness must not introduce a backend or cloud dependency. | Accepted |
| 2026-07-08 | Remove Tauri localStorage fallback for API keys. | Public readiness should fail closed when OS Keychain access fails instead of persisting desktop API keys in localStorage. | Accepted |
| 2026-07-09 | Treat `v0.3.0-beta.1` as a source/demo prerelease, not a signed desktop release. | The failed desktop workflow was caused by a malformed `TAURI_SIGNING_PRIVATE_KEY`; signed installers require corrected secrets and a stable release workflow run. | Accepted |
| 2026-07-23 | Publish the repository and prepare a Codex for Open Source application. | The license, trust documentation, demo mode, automated tests, and contribution path satisfy the public-readiness gate; public visibility is an explicit form requirement. | Accepted |

## Release Gate

Do not make the repository public until these checks are true:

- `LICENSE`, `README.md`, and `package.json` agree on MIT.
- `npm run lint`, `npm run typecheck`, `npm run test:unit`, and `npm run build` pass without API secrets.
- `CONTRIBUTING.md`, `SECURITY.md`, `docs/PRIVACY.md`, and `docs/ROADMAP.md` exist.
- `GOVERNANCE.md` and root `PRIVACY.md` exist for public community-health entry points.
- README explains quick start, demo mode, privacy, Web vs Desktop behavior, and contribution path.
- Demo mode is understandable for a first-time user without a real provider key.
- No active source or root documentation claims the project is proprietary or confidential.
- GitHub repository visibility is public, if the target grant requires a public OSS URL.
