# Next Steps

This file tracks the remaining release-gate work for Muharrir after the OSS/grant-readiness pass.

## Current State

- The local grant-readiness branch passes lint, typecheck, unit tests, Playwright,
  static export, and `cargo check`.
- `v0.3.0-beta.1` exists as a prerelease with demo media assets.
- The repository is still private on GitHub.
- The app is MIT licensed and the README/package/Tauri metadata use the Muharrir identity.
- The application demo was refreshed with the Muharrir identity and visually
  checked for obvious keys, personal data, and private documents.
- A full-history Gitleaks scan found likely provider credentials in old commits.
  Public visibility is blocked until those credentials are rotated and the
  history is sanitized.
- Desktop updater signing is not ready yet. The failed `Build Desktop` run for `v0.3.0-beta.1` built installers, then failed while decoding `TAURI_SIGNING_PRIVATE_KEY` because the secret had an invalid hidden/BOM prefix.

## Before Public Grant Submission

1. Revoke or rotate every provider credential found in historical commits.
2. Rewrite the affected Git history, force-push the sanitized history, and rerun
   Gitleaks across all commits.
3. Merge the grant-readiness changes and confirm default-branch CI is green.
4. Switch the GitHub repository visibility to public.
5. Open the prepared contributor issues and refresh public repository metrics.
6. Fill private submission fields locally; do not commit account emails,
   organization IDs, referral codes, funding details, or traction numbers.
7. Submit the Codex for Open Source form using
   `docs/applications/codex-for-open-source.md`.

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
