# Next Steps

This file tracks the remaining release-gate work for Muharrir after the OSS/grant-readiness pass.

## Current State

- The local grant-readiness branch passes lint, typecheck, unit tests, Playwright,
  static export, and `cargo check`.
- A CI-equivalent Ubuntu 22.04 run on 2026-07-29 passed `npm ci`, lint,
  typecheck, 57 unit tests, Next.js 16.2.11 static export, and all 9 Playwright
  smoke tests with Node 20.20.2/npm 10.8.2.
- Local Ollama discovery and completion were smoke-tested on 2026-07-29 with
  `qwen2.5:3b`; broader local-model tool-calling quality remains model-specific.
- `v0.3.0-beta.1` exists as a prerelease with demo media assets.
- `3ssiri/muharrir` is public; the legacy fork remains private and is not part
  of the grant submission.
- The app is MIT licensed and the README/package/Tauri metadata use the Muharrir identity.
- The application demo was refreshed with the Muharrir identity and visually
  checked for obvious keys, personal data, and private documents.
- All writable branches and tags were history-rewritten and force-pushed after
  removing historical credentials. Full-history scans of the rewritten
  repositories are clean.
- The public repository, README, license, maintainer profile, and grant-readiness
  CI run were verified without authentication on 2026-07-29.
- Grant-readiness CI is green:
  https://github.com/3ssiri/muharrir/actions/runs/30404651528
- Desktop updater signing is not ready yet. The failed `Build Desktop` run for `v0.3.0-beta.1` built installers, then failed while decoding `TAURI_SIGNING_PRIVATE_KEY` because the secret had an invalid hidden/BOM prefix.
- Post-`v0.3.0-beta.1` work on `master` (not yet tagged): native Claude adapter, Arabic prompt templates, persona packs, React Compiler lint rules, provider `/models` fixtures, a11y Playwright coverage, and the desktop release runbook/signing preflight.

## Before Grant Submission

1. Review the current Codex for Open Source terms and confirm the application
   attestations as the applicant.
2. Copy the verified private applicant fields from the ignored local submission
   file into the form; do not commit them.
3. Submit the Codex for Open Source form using
   `docs/applications/codex-for-open-source.md`. Evaluate the separate Codex
   Open Source Fund form in `docs/applications/codex-open-source-fund.md` only
   if it is confirmed to be a non-duplicative alternative under the current
   terms.

The applicant name, ChatGPT email, OpenAI Organization ID, and OpenAI Project ID
were recovered from the authenticated accounts and stored only in the ignored
local private submission file.

Real-key OpenAI-compatible and Claude smoke tests remain gates for provider
startup applications, not for Codex for Open Source.

## Signed Desktop Release

Signed desktop installers are a separate gate from the source/demo beta. The full
runbook (secrets, key regeneration caveats, tag push, artifact verification, smoke
tests) lives in [RELEASING.md](RELEASING.md).

1. Regenerate or re-copy the Tauri signing key as plain text.
2. Update GitHub Actions secrets:
   - `TAURI_SIGNING_PRIVATE_KEY`
   - `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`
3. Run `Build Desktop` manually or push a stable tag without a prerelease suffix.
4. Verify the release contains Windows, macOS, and Linux artifacts plus updater signatures.
5. Smoke test on real devices:
   - Window opens with Arabic RTL intact.
   - System tray show/hide/quit works.
   - `Ctrl+Shift+K` toggles the window.
   - API key persistence uses OS Keychain.
   - Provider connection test works from desktop mode.

Do not claim signed desktop installers in grant materials until this workflow produces artifacts successfully.
