# Provider Configuration And CORS

Muharrir talks to provider APIs directly from the client. It does not proxy prompts through a Muharrir server.

## Built-in Providers

The built-in provider list lives in `src/lib/providers.ts`. Each preset includes:

- `id`: stable internal identifier.
- `name`: display name.
- `baseUrl`: API base URL.
- `models`: suggested starting models.
- `docsUrl`: where users can create or manage API keys.
- `isLocal`: true for local runtimes such as Ollama and LM Studio.
- `apiFormat`: optional API format override. Defaults to `openai-compatible`; Anthropic uses `anthropic`.

The list currently includes OpenAI, Anthropic, Google Gemini, DeepSeek, xAI, OpenRouter, Hugging Face Router, NVIDIA NIM, Groq, Mistral, Qwen, Moonshot, Zhipu, Ollama, and LM Studio.

## API Formats

Most providers use OpenAI-compatible chat completions:

- Chat endpoint: `{baseUrl}/chat/completions`
- Auth header: `Authorization: Bearer <key>`
- Tools format: OpenAI `tools: [{ type: "function", function: ... }]`

Anthropic is handled as a native Claude Messages API provider:

- Messages endpoint: `{baseUrl}/messages`
- Auth headers: `x-api-key: <key>` and `anthropic-version: 2023-06-01`
- Tools format: Claude `tools: [{ name, description, input_schema }]`
- Streaming parser: Claude `content_block_delta` events are converted into Muharrir's internal stream protocol.

## Adding A Provider

1. Add a preset to `BUILTIN_PROVIDERS` in `src/lib/providers.ts`.
2. Use a stable lowercase `id`.
3. Set `baseUrl` to the provider API endpoint, not a dashboard URL.
4. Set `apiFormat` only when the provider is not OpenAI-compatible.
5. Add at least two useful default models when the provider is remote.
6. Add `docsUrl` for key creation.
7. If the provider's `/models` response is not OpenAI-shaped (`{ data: [{ id }] }`), extend `parseModelsResponse` and add a sample payload to `src/lib/__tests__/fixtures/provider-models.ts`.
8. Run `npm run test:unit`.

## Browser CORS Troubleshooting

Some providers reject browser-originated requests even when the API key and model are valid. This is a provider CORS policy, not a Muharrir backend error.

### Symptoms

- The settings dialog shows "Connection failed" followed by the browser CORS hint.
- The browser console shows `Access to fetch at '...' from origin '...' has been blocked by CORS policy`.
- The JavaScript error is typically `TypeError: Failed to fetch` with no HTTP status code, because the browser never lets the response through.

### CORS vs other failures

| What you see | Likely cause |
|---|---|
| `TypeError: Failed to fetch`, no status code, CORS message in console | Provider blocks browser origins (CORS) |
| `HTTP 401` / `authentication_error` | Invalid or malformed API key — check for stray spaces or newlines |
| `HTTP 402` / "insufficient credits" | Provider balance or quota exhausted |
| `HTTP 404` | Wrong base URL — use the API endpoint, not a dashboard URL |
| `HTTP 429` | Rate limited — retry later |
| Unexpected response format (missing `data` array) | The provider's `/models` endpoint is not OpenAI-shaped |

### Why it happens

Browsers enforce cross-origin rules: every provider decides whether to send `Access-Control-Allow-Origin` headers for browser-hosted apps. Desktop (Tauri/Rust) and server-to-server calls are not subject to browser CORS, which is why the same key can work in the desktop app and fail in the browser.

### What users can try

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
