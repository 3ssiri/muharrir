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

## Changed

- Updated provider documentation to distinguish OpenAI-compatible providers from native Anthropic API support.
- Updated Anthropic/OpenAI application materials to reflect the Claude adapter while keeping real-key smoke testing as a submission gate.
- Demo mode content moved from hardcoded strings into the `demo` i18n namespace; Playwright demo assertions now match the Arabic sample.
- Settings connection check now parses model lists via the shared `parseModelsResponse` helper, and its malformed-response error is localized (`settings.unexpectedResponseFormat`) instead of a hardcoded Arabic string.
- Adopted the four React Compiler ESLint rules shipped with eslint-config-next 16 (`react-hooks/refs`, `preserve-manual-memoization`, `set-state-in-effect`, `static-components`): hydration-safe `useSyncExternalStore` mount flags, render-derived search filtering, adjust-state-during-render resets, and no components created during render.
