# Security And Privacy Readiness Audit

Date: 2026-07-08; updated 2026-07-23.

Scope: targeted OSS/grant-readiness audit for secrets, API key storage, local file handling, telemetry, and release hygiene. This is not a full penetration test or exhaustive repository-wide vulnerability scan.

## Summary

- No committed API key pattern or obvious secret was found in the current
  tracked source scan.
- A 2026-07-23 full-history Gitleaks scan found nine provider-credential
  findings in old commits. All writable branches and tags in both Muharrir
  repositories were rewritten and force-pushed; clean-room scans now report no
  leaks in the rewritten history.
- Both repositories are temporarily private and report zero forks. GitHub
  Support must still purge the affected read-only pull-request refs and cached
  commit views before public visibility is restored.
- No default telemetry or analytics integration was found.
- Uploaded PDF, DOCX, text, and markdown files are parsed locally in the browser.
- Muharrir does not proxy prompts or files through a project-owned backend.
- Demo mode avoids external provider calls.
- Debug logging in `src/components/enhancement-form.tsx` previously printed tool arguments; it has been removed because those arguments can include user prompt content.
- Tauri API key storage now fails closed when OS Keychain access fails. Desktop API keys are not persisted to localStorage.

## Commands Run

```powershell
rg -n "console\.(log|error|warn)|apiKey|API_KEY|localStorage|dangerouslySetInnerHTML|innerHTML|eval\(|new Function|token|secret|private key|password" src src-tauri .github docs README.md package.json .gitignore --glob '!node_modules/**' --glob '!out/**' --glob '!.next/**' --glob '!target/**'
rg -n "telemetry|analytics|posthog|sentry|gtag|google-analytics|segment" src package.json docs README.md --glob '!node_modules/**' --glob '!out/**' --glob '!.next/**' --glob '!target/**'
rg -n "proprietary|confidential|all rights reserved|TAURI_SIGNING_PRIVATE_KEY|sk-[A-Za-z0-9]|api[_-]?key\s*[:=]\s*['\"]" . --glob '!node_modules/**' --glob '!out/**' --glob '!.next/**' --glob '!target/**' --glob '!package-lock.json'
git ls-files | rg "(^|/)\.env|\.pem$|\.key$|id_rsa|secrets?|token|\.p12$|\.mobileprovision$"
rg -n "fetch\(|XMLHttpRequest|sendBeacon|navigator\.sendBeacon" src src-tauri --glob '!node_modules/**' --glob '!out/**' --glob '!.next/**' --glob '!target/**'
```

## Findings

### Contained: Historical Provider Credentials

Gitleaks scanned 166 commits and reported nine findings. Several are placeholders,
but multiple distinct values have the length and prefix of real provider keys.
They occur in historical versions of:

- `src/app/[locale]/page.tsx`
- `src/lib/store.ts`
- `quick-test.js`
- `src/components/settings-dialog.tsx`
- `channels.yaml`

Resolution completed on 2026-07-23:

- Removed `channels.yaml` and `quick-test.js` from every historical snapshot.
- Replaced historical `sk-*` values elsewhere with a neutral marker.
- Force-pushed every branch and tag in `3ssiri/muharrir` and
  `3ssiri/interactive-prompt-iterator`.
- Rewrote the local clone and removed the old reachable history.
- Confirmed new full-history Gitleaks scans are clean.
- Made both repositories private while GitHub-side cleanup is pending.
- Confirmed both repositories report zero forks.

Credential validation without exposing values found that most historical
third-party provider credentials now return unauthorized and one endpoint is
unreachable. One historical third-party credential still returns a successful
models response; its account credentials were not found locally or in prior
project sessions, so it still requires owner/provider revocation. Provider
names and endpoints are intentionally omitted from this public report.

GitHub's read-only pull-request refs cannot be overwritten by a force push.
`3ssiri/muharrir` pull request 1 and pull requests 1–4 in the legacy fork still
reference the old history. Keep both repositories private until GitHub Support
has dereferenced those refs, run server-side garbage collection, and removed
cached views.

The values are intentionally not copied into this report.

### Fixed: Prompt Content Debug Logging

`src/components/enhancement-form.tsx` contained `console.log` calls that printed the raw enhancement tool arguments and parsed payload. These logs could expose prompt content or generated prompt structure in a user's browser console.

Resolution: removed the raw argument and parsed payload logs.

### Accepted Tradeoff: Tauri Keychain Fallback

Tauri desktop builds prefer OS Keychain storage through `src-tauri/src/lib.rs` and `src/lib/tauri-bridge.ts`. If the OS Keychain is unavailable, the app fails closed for persistence and does not save the key to localStorage.

Current documentation:

- `README.md`
- `docs/PRIVACY.md`
- `SECURITY.md`
- `docs/oss-grant-readiness/DECISIONS.md`

Release recommendation: before a broad public release, document setup guidance for Linux Secret Service / OS Keychain failures so users understand why a desktop key may not persist.

### Tracked: Upstream Transitive Dependency Advisories

The readiness pass upgraded Next.js from 16.2.10 to 16.2.11, removing the direct
framework advisories reported for versions below 16.2.11, and aligned ESLint
with the Next.js 16 configuration.

`npm audit --omit=dev` still reports advisories through Next.js-pinned
transitive versions of PostCSS and optional Sharp. Muharrir uses static export,
trusted project CSS, `images.unoptimized`, and no server actions or runtime
image optimizer, which limits the current exposure but does not erase the
upstream findings. Monitor Next.js releases and update when patched transitive
versions are available; do not force incompatible overrides.

## Release Gate Recommendation

Before public launch:

1. Report the still-valid historical third-party credential to its provider
   (owner-side only; no account access exists locally).
2. Ask GitHub Support to purge the documented pull-request refs and cached
   commit views.
3. Re-run a clean clone full-history scan after GitHub confirms the purge.
4. Require the Gitleaks CI job and the existing web/Rust checks to pass.
5. Restore public visibility only after the preceding gates are complete.

The current private/grant-readiness path proceeds with fail-closed desktop key storage. The `v0.3.0-beta.1` desktop workflow failure was not a source build failure; the installers built, then updater artifact signing failed because `TAURI_SIGNING_PRIVATE_KEY` was malformed base64. Signed desktop releases remain gated on corrected signing secrets.
