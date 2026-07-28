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

## Changed

- Updated provider documentation to distinguish OpenAI-compatible providers from native Anthropic API support.
- Updated Anthropic/OpenAI application materials to reflect the Claude adapter while keeping real-key smoke testing as a submission gate.
- Demo mode content moved from hardcoded strings into the `demo` i18n namespace; Playwright demo assertions now match the Arabic sample.
