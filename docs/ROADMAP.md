# Roadmap

This roadmap tracks the next practical milestones for Muharrir after its public
open-source beta. It is intentionally conservative: priorities may change based
on contributor feedback and real usage.

## Shipped

- MIT licensing and OSS governance documentation.
- Arabic/English UI with RTL support.
- Guided clarification, enhancement, and final prompt-proposal workflow.
- Demo mode that works without an API key or external provider call.
- Native Claude Messages API, OpenAI-compatible providers, and local Ollama.
- Browser-side PDF/DOCX parsing and local IndexedDB history.
- Shared Next.js/Tauri web and desktop codebase with OS Keychain integration.
- Lint, typecheck, unit, Playwright, static-export, and Rust CI checks.
- Arabic-first prompt proposal templates, a localized demo mode, and persona
  prompt packs for developers, educators, researchers, and creators.
- Provider `/models` fixtures and a browser CORS troubleshooting guide.
- All four eslint-config-next 16 React Compiler rules enabled, with violations fixed.
- Expanded keyboard and screen-reader accessibility coverage, including a
  Playwright accessibility spec.

## Now

- Welcome public beta users and turn feedback into reproducible issues.
- Publish contributor-friendly issues, including small documentation and test tasks.
- Smoke-test native Claude and one OpenAI-compatible provider with real keys.
- Keep dependencies current and triage remaining transitive security advisories.
- After `v0.3.0-beta.2`: fix Tauri signing secrets and cut a signed stable release.

## Next

- Publish a signed multi-platform Tauri release (runbook and signing-secret
  preflight are in place; awaiting valid CI signing secrets) and verify updater
  artifacts on real devices.

## Later

- Prompt evaluation, versioning, and comparison improvements.
- Offline PWA support with a reviewed cache and privacy design.
- More local-model presets and diagnostics.
- Optional community template sharing without requiring centralized prompt storage.
- Browser-extension research after the main app and contribution flow are stable.

## Non-Goals

- A project-owned backend proxy for provider calls.
- Cloud accounts or hosted prompt storage by default.
- Team collaboration that requires centralized user data.
- Claims that Muharrir replaces provider privacy policies or compliance review.
