# Contributing to Muharrir

Thanks for helping improve Muharrir. The project is being prepared for a public OSS release, so contributions should keep the app easy to run locally, safe for users, and friendly to Arabic and English workflows.

## Local Setup

```bash
npm ci
npm run dev
```

Open http://localhost:3000. The app is a static-export Next.js app and must keep working without a project backend.

## Verification

Run the relevant checks before opening a pull request:

```bash
npm run lint
npm run typecheck
npm run test:unit
npm run build
```

Playwright tests require a dev server on port 3000 because `webServer` is disabled in `playwright.config.js`:

```bash
npm run dev
npm test
```

## Development Rules

- Keep the app local-first. Do not add API routes, middleware, telemetry, or cloud storage without an accepted design decision.
- Preserve static export compatibility. Avoid server-only Next.js features.
- Any Tauri-specific code must guard runtime access with `isTauriApp()` and provide a browser fallback.
- Use `log.*` from `src/lib/logger.ts` instead of `console.*`.
- Do not log API keys, prompts that may contain private data, uploaded file contents, or provider responses that include secrets.
- Keep visible UI text localized through `src/i18n/locales/ar.json` and `src/i18n/locales/en.json`.
- When adding a provider preset, update the provider catalog and document any browser CORS limitations.
- Demo mode must not call external providers.

## Pull Requests

Each PR should include:

- A short summary of the user-facing change.
- Verification commands that were run.
- Notes for privacy, i18n, static export, or Tauri behavior when relevant.
- Screenshots or a short GIF for visible UI changes.

Never paste API keys, private prompts, or user documents into issues, pull requests, screenshots, or test fixtures.
