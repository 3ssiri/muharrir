# Desktop Release Runbook

How to cut a signed multi-platform desktop release of Muharrir. Web/static-export
releases do not need this runbook — this covers only the Tauri installers and the
signed auto-updater artifacts.

## Prerequisites (one-time, GitHub repo settings)

The release workflow needs two secrets (Settings → Secrets and variables → Actions):

- `TAURI_SIGNING_PRIVATE_KEY` — the **full contents** of the Tauri `.key` file,
  copied as plain text (no BOM, no hidden characters, no extra whitespace lines).
- `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` — the key password (may be empty only if the
  key was generated without one).

If you regenerate the keypair (`npm run tauri signer generate`), you MUST also update
`plugins.updater.pubkey` in `src-tauri/tauri.conf.json` to the new public key —
otherwise already-installed apps will reject every future update signature.

The workflow runs a preflight (`scripts/tests/validate-signing-secret.js`) that fails
fast on a missing, hidden-character, or undecodable key — before any desktop build
starts. You can run the same check locally:

```bash
TAURI_SIGNING_PRIVATE_KEY="$(cat path/to/keyfile)" node scripts/tests/validate-signing-secret.js
```

## Cutting a release

1. Make sure `master` is green on CI (`ci.yml`: lint, typecheck, unit tests, static
   export, Playwright smoke, `cargo check`).
2. Update `CHANGELOG.md` and `docs/releases/` notes; make sure
   `src-tauri/tauri.conf.json` `version` matches the tag you will push.
3. Push a **stable** tag (no prerelease suffix), e.g.:

   ```bash
   git tag v0.3.0
   git push origin v0.3.0
   ```

   Tags containing `-` (e.g. `v0.3.0-beta.1`) are skipped by the desktop workflow on
   purpose — they are for GitHub prereleases without signed updater artifacts.
   You can also run **Build Desktop** manually via workflow dispatch.
4. Wait for the matrix (Windows / macOS universal / Linux) to finish. The workflow
   creates a **draft** GitHub Release named `Muharrir <tag>`.

## Expected artifacts

| Platform | Installers | Updater signatures |
|---|---|---|
| Windows | `.msi` (WiX), `.exe` (NSIS) | `.sig` per artifact |
| macOS | `.dmg` (universal: Intel + Apple Silicon) | `.sig` |
| Linux | `.AppImage`, `.deb`, `.rpm` | `.sig` |

Plus `latest.json` at
`https://github.com/3ssiri/muharrir/releases/latest/download/latest.json` — the
endpoint configured in `src-tauri/tauri.conf.json` that the in-app updater polls.

If any `.sig` file or `latest.json` is missing, the updater will not work; check the
workflow log for the signing step before publishing the draft release.

## Post-release smoke test (on real devices)

- Window opens with Arabic RTL intact.
- System tray show/hide/quit works; left-click toggles the window.
- `Ctrl+Shift+K` toggles the window globally.
- API key persistence uses the OS keychain (restart the app; the key survives).
- Provider connection test works from desktop mode (runs through Rust, no CORS).
- The updater detects the new release from a previous install (install the older
  version first, then launch and check for updates).

## Notes

- Local `npm run tauri build` ends with a signing error (`no private key`) because
  `createUpdaterArtifacts` requires the CI secret — the installers produced before
  that error are valid; only updater artifacts are missing. Signed releases must go
  through the workflow.
- Do not claim signed desktop installers in public materials until a workflow run
  has produced verified artifacts.
