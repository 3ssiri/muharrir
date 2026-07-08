# Summary

Describe what changed and why.

## Verification

Check every command you ran:

- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm run test:unit`
- [ ] `npm run build`
- [ ] Playwright/manual check, if UI behavior changed

## Privacy And Security

- [ ] This change does not log API keys, private prompts, uploaded files, or provider secrets.
- [ ] This change does not add telemetry or a backend dependency.
- [ ] API key behavior is documented if it changed.

## i18n And UI

- [ ] Visible UI text is localized in Arabic and English.
- [ ] RTL behavior was considered for Arabic.
- [ ] Screenshots or GIFs are attached for visible UI changes.

## Static Export And Tauri

- [ ] No API route, middleware, or server-only Next.js feature was added.
- [ ] Tauri-specific code is guarded and has a browser fallback.
