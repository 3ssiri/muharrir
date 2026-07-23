# Security And Privacy Readiness Audit

Date: 2026-07-08; updated 2026-07-23.

Scope: targeted OSS/grant-readiness audit for secrets, API key storage, local file handling, telemetry, and release hygiene. This is not a full penetration test or exhaustive repository-wide vulnerability scan.

## Summary

- No committed API key pattern or obvious secret was found in the current
  tracked source scan.
- A 2026-07-23 full-history Gitleaks scan found likely provider credentials in
  old commits. This is a public-release blocker even though the values are not
  present in the current tree.
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

### Blocking: Likely Provider Credentials In Git History

Gitleaks scanned 166 commits and reported nine findings. Several are placeholders,
but multiple distinct values have the length and prefix of real provider keys.
They occur in historical versions of:

- `src/app/[locale]/page.tsx`
- `src/lib/store.ts`
- `quick-test.js`
- `src/components/settings-dialog.tsx`
- `channels.yaml`

Do not publish the repository until the owner has rotated the affected
credentials, the Git history has been sanitized, the rewritten history has been
force-pushed, and a new full-history scan reports no unsuppressed findings.

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

1. Rotate historical provider credentials.
2. Rewrite and force-push the affected Git history.
3. Run Gitleaks against all commits and require a clean result.
4. Rerun lint, typecheck, unit, Playwright, build, and Rust checks.

The current private/grant-readiness path proceeds with fail-closed desktop key storage. The `v0.3.0-beta.1` desktop workflow failure was not a source build failure; the installers built, then updater artifact signing failed because `TAURI_SIGNING_PRIVATE_KEY` was malformed base64. Signed desktop releases remain gated on corrected signing secrets.
