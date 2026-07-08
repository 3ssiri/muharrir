# Provider Configuration And CORS

Muharrir talks to OpenAI-compatible chat completion APIs directly from the client. It does not proxy prompts through a Muharrir server.

## Built-in Providers

The built-in provider list lives in `src/lib/providers.ts`. Each preset includes:

- `id`: stable internal identifier.
- `name`: display name.
- `baseUrl`: OpenAI-compatible API base URL.
- `models`: suggested starting models.
- `docsUrl`: where users can create or manage API keys.
- `isLocal`: true for local runtimes such as Ollama and LM Studio.

The list currently includes OpenAI, Anthropic, Google Gemini, DeepSeek, xAI, OpenRouter, Hugging Face Router, NVIDIA NIM, Groq, Mistral, Qwen, Moonshot, Zhipu, Ollama, and LM Studio.

## Adding A Provider

1. Add a preset to `BUILTIN_PROVIDERS` in `src/lib/providers.ts`.
2. Use a stable lowercase `id`.
3. Set `baseUrl` to the provider's OpenAI-compatible endpoint, not a dashboard URL.
4. Add at least two useful default models when the provider is remote.
5. Add `docsUrl` for key creation.
6. Run `npm run test:unit`.

## Browser CORS

Some providers reject browser-originated requests even when the API key and model are valid. This is a provider CORS policy, not a Muharrir backend error.

What users can try:

- Use the Tauri desktop app, where connection tests run through Rust and avoid browser CORS limits.
- Use a provider that permits direct browser requests.
- Use a local provider such as Ollama or LM Studio.
- Keep using `demo` mode to test the workflow without an external provider.

Muharrir should not add a backend proxy just to hide CORS. A proxy would change the local-first privacy model and would need a separate security design.

## OpenRouter Notes

OpenRouter is included as a built-in preset:

- Base URL: `https://openrouter.ai/api/v1`
- Example models: `openai/gpt-4o`, `anthropic/claude-sonnet-4`, `google/gemini-2.5-pro`
- API keys: `https://openrouter.ai/keys`

OpenRouter model names often include the upstream provider prefix. Keep that prefix in user-facing examples.

