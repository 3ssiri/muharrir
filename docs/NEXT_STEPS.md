# Next Steps

This file tracks the remaining release-gate work for Muharrir after the OSS/grant-readiness pass.

## Current State

- Main CI is enabled and green on `master`.
- `v0.3.0-beta.1` exists as a prerelease with demo media assets.
- The repository is still private on GitHub.
- The app is MIT licensed and the README/package/Tauri metadata use the Muharrir identity.
- Desktop updater signing is not ready yet. The failed `Build Desktop` run for `v0.3.0-beta.1` built installers, then failed while decoding `TAURI_SIGNING_PRIVATE_KEY` because the secret had an invalid hidden/BOM prefix.

## Before Public Grant Submission

1. Switch the GitHub repository visibility to public, or confirm the grant program accepts a private review link.
2. Run a real-key smoke test for one OpenAI-compatible provider.
3. Run a real-key smoke test for native Claude Messages API support.
4. Confirm screenshots and videos contain no API keys, private prompts, personal data, or private documents.
5. Fill private submission fields locally; do not commit account emails, organization IDs, referral codes, funding details, or traction numbers unless they are intentionally public.

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
