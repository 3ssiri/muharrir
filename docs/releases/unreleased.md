# Unreleased

## Added

- Native Anthropic Claude Messages API support for the built-in Anthropic provider.
- Claude tool-use schema mapping for Muharrir's structured prompt tools.
- Claude streaming parser that converts `content_block_delta` and `tool_use` events into Muharrir's internal UI stream protocol.
- Unit coverage for Anthropic request headers/body shape and streamed tool-use parsing.
- Arabic prompt structure template in the default system prompt (fixed Arabic section headers, phrasing rules, and a mini example for `propose_prompt`).
- Localized demo mode: a full Arabic sample when the UI locale is Arabic, English otherwise (content now lives in the `demo` i18n namespace).
- Persona prompt packs in the preset gallery: code review (developers), lesson planning (educators), paper summarization (researchers), and video scripting (creators).
- Unit coverage for locale-aware demo content, the Arabic system-prompt section, and preset-mode locale parity.
- Provider `/models` response fixtures (OpenAI, Anthropic, Ollama, and malformed payloads) with unit coverage for the new `parseModelsResponse` helper.
- Expanded browser CORS troubleshooting guide in `docs/providers.md`: symptoms, CORS vs auth/quota/rate-limit failures, and workarounds.
- Desktop release runbook (`docs/RELEASING.md`) covering signing secrets, key regeneration caveats, tag-driven builds, artifact verification, and the post-release smoke test.
- `scripts/tests/validate-signing-secret.js` signing-secret preflight (missing key, hidden/BOM characters, undecodable base64 payload), now wired into the desktop release workflow ahead of the build matrix.
- Accessibility coverage for icon-only controls: accessible names (localized `aria-label`s) added to the theme toggle, settings trigger, sidebar collapse/expand toggle, mobile sidebar trigger, session delete buttons, favorites copy/edit/remove buttons, file upload/remove buttons, prompt-card fullscreen/close buttons, and the header update-check and clear-chat buttons.
- Keyboard operability for sidebar session items: `role="button"`, `tabIndex`, Enter/Space activation, and a visible focus ring.
- New Playwright spec `tests/accessibility.spec.js`: `lang`/`dir` per locale, accessible-name sweep over visible buttons, Tab focus order, Enter-to-submit, settings dialog focus trap with Escape focus return, and keyboard activation of sidebar sessions.

## Changed

- Updated provider documentation to distinguish OpenAI-compatible providers from native Anthropic API support.
- Updated Anthropic/OpenAI application materials to reflect the Claude adapter while keeping real-key smoke testing as a submission gate.
- Demo mode content moved from hardcoded strings into the `demo` i18n namespace; Playwright demo assertions now match the Arabic sample.
- Settings dialog trigger's screen-reader text is localized (`header.settings`) instead of a hardcoded English "Settings".
- Settings connection check now parses model lists via the shared `parseModelsResponse` helper, and its malformed-response error is localized (`settings.unexpectedResponseFormat`) instead of a hardcoded Arabic string.
- Adopted the four React Compiler ESLint rules shipped with eslint-config-next 16 (`react-hooks/refs`, `preserve-manual-memoization`, `set-state-in-effect`, `static-components`): hydration-safe `useSyncExternalStore` mount flags, render-derived search filtering, adjust-state-during-render resets, and no components created during render.
