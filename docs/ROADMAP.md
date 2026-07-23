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

## Now

- Welcome public beta users and turn feedback into reproducible issues.
- Publish contributor-friendly issues, including small documentation and test tasks.
- Refresh the application demo so every frame uses the Muharrir name.
- Smoke-test native Claude and one OpenAI-compatible provider with real keys.
- Keep dependencies current and triage remaining transitive security advisories.

## Next

- Improve Arabic-first prompt proposal templates and examples.
- Add provider fixtures and clearer browser CORS troubleshooting.
- Adopt the stricter React Compiler lint rules incrementally.
- Expand accessibility coverage for keyboard and screen-reader workflows.
- Prepare a signed multi-platform Tauri release and verify updater artifacts.
- Add prompt packs for developers, educators, researchers, and creators.

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
