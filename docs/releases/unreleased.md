# Unreleased

## Added

- Native Anthropic Claude Messages API support for the built-in Anthropic provider.
- Claude tool-use schema mapping for Muharrir's structured prompt tools.
- Claude streaming parser that converts `content_block_delta` and `tool_use` events into Muharrir's internal UI stream protocol.
- Unit coverage for Anthropic request headers/body shape and streamed tool-use parsing.

## Changed

- Updated provider documentation to distinguish OpenAI-compatible providers from native Anthropic API support.
- Updated Anthropic/OpenAI application materials to reflect the Claude adapter while keeping real-key smoke testing as a submission gate.
