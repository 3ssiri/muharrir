# Security And Privacy Readiness Audit

Date: 2026-07-08

Scope: targeted OSS/grant-readiness audit for secrets, API key storage, local file handling, telemetry, and release hygiene. This is not a full penetration test or exhaustive repository-wide vulnerability scan.

## Summary

- No committed API key pattern or obvious secret was found in the current tracked source scan.
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

### Fixed: Prompt Content Debug Logging

`src/components/enhancement-form.tsx` contained `console.log` calls that printed the raw enhancement tool arguments and parsed payload. These logs could expose prompt content or generated prompt structure in a user's browser console.

Resolution: removed the raw argument and parsed payload logs.

### Accepted Tradeoff: Tauri Keychain Fallback

Tauri desktop builds prefer OS Keychain storage through `src-tauri/src/lib.rs` and `src/lib/tauri-bridge.ts`. If the OS Keychain is unavailable, the app currently falls back to localStorage so users can continue using the desktop app.

Current documentation:

- `README.md`
- `docs/PRIVACY.md`
- `SECURITY.md`
- `docs/oss-grant-readiness/DECISIONS.md`

Release recommendation: before a broad public release, document setup guidance for Linux Secret Service / OS Keychain failures so users understand why a desktop key may not persist.

## Release Gate Recommendation

Before public launch, complete one of these:

The current private/grant-readiness path proceeds with fail-closed desktop key storage.
