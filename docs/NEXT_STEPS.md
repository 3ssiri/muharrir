# Next Steps

This file tracks the remaining release-gate work for Muharrir after the OSS/grant-readiness pass.

## Current State

- The local grant-readiness branch passes lint, typecheck, unit tests, Playwright,
  static export, and `cargo check`.
- `v0.3.0-beta.1` exists as a prerelease with demo media assets.
- Both `3ssiri/muharrir` and the legacy fork are temporarily private on GitHub.
- The app is MIT licensed and the README/package/Tauri metadata use the Muharrir identity.
- The application demo was refreshed with the Muharrir identity and visually
  checked for obvious keys, personal data, and private documents.
- All writable branches and tags were history-rewritten and force-pushed after
  removing historical credentials. Full-history scans of the rewritten
  repositories are clean.
- GitHub-side pull-request refs and cached commit views still need Support
  purging before public visibility is restored.
- Most historical credentials are already unauthorized; one Huan API
  credential remains valid and must be revoked or reported to the provider.
- Desktop updater signing is not ready yet. The failed `Build Desktop` run for `v0.3.0-beta.1` built installers, then failed while decoding `TAURI_SIGNING_PRIVATE_KEY` because the secret had an invalid hidden/BOM prefix.

## Before Public Grant Submission

1. Revoke or report the still-valid Huan API credential and resolve the
   unreachable Gala endpoint.
2. Submit the prepared GitHub Support request to purge affected pull-request
   refs, cached commit views, and unreachable objects.
3. After Support confirms the purge, clone and scan the remote repositories
   again and require a clean result.
4. Merge the post-cleanup Gitleaks CI hardening and confirm all checks are green.
5. Switch the main GitHub repository visibility to public; the legacy fork can
   remain private.
6. Refresh public repository metrics.
7. Submit the Codex for Open Source form using
   `docs/applications/codex-for-open-source.md`.

The applicant name, ChatGPT email, OpenAI Organization ID, and OpenAI Project ID
were recovered from the authenticated accounts and stored only in the ignored
local private submission file.

Real-key OpenAI-compatible and Claude smoke tests remain gates for provider
startup applications, not for Codex for Open Source.

## Signed Desktop Release

Signed desktop installers are a separate gate from the source/demo beta.

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
