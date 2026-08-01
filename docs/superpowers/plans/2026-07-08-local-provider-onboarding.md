# Local Provider Onboarding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking. **Status: SHIPPED on master** (plan checkboxes closed after landing).

**Goal:** Make Muharrir clearly detect and use local Ollama/LM Studio providers without an API key, while explaining fallback behavior when a local model does not call tools.

**Architecture:** Keep the app local-first and static-export compatible. Detect local OpenAI-compatible providers from the browser using `/models`, update Zustand settings through existing setters, and keep all UX text in `src/i18n/locales/*.json`. Add fallback behavior in `src/lib/chat-client.ts` so text-only local model responses do not leave the user confused.

**Tech Stack:** Next.js 14, React 18, Zustand, next-intl, Vitest, Playwright, OpenAI-compatible `/v1/models` and `/v1/chat/completions`.

---

## Files And Responsibilities

- `src/app/[locale]/page.tsx`: Detect Ollama, show onboarding buttons, apply local provider settings, and show provider status.
- `src/lib/providers.ts`: Keep URL helpers for local providers.
- `src/lib/chat-client.ts`: Allow local providers without keys and emit a readable fallback when a model responds with text instead of tool calls.
- `src/i18n/locales/ar.json`: Arabic UX strings for local provider onboarding and fallback.
- `src/i18n/locales/en.json`: English UX strings for local provider onboarding and fallback.
- `src/lib/__tests__/chat-client.test.ts`: Unit coverage for local provider no-key behavior and fallback event.
- `tests/ui-optimization.spec.js`: Browser coverage for the visible local provider onboarding controls.

## Task 1: Ollama Detection And One-Click Use

**Files:**
- Modify: `src/app/[locale]/page.tsx`
- Modify: `src/i18n/locales/ar.json`
- Modify: `src/i18n/locales/en.json`
- Test: `tests/ui-optimization.spec.js`

- [x] **Step 1: Add local provider detection state**

Add state for detected Ollama models:

```ts
const [ollamaModels, setOllamaModels] = useState<string[]>([])
const [isCheckingOllama, setIsCheckingOllama] = useState(false)
```

- [x] **Step 2: Detect Ollama from the browser**

Fetch `http://localhost:11434/v1/models`, parse `data[].id`, and store sorted model ids. Swallow errors because Ollama may not be installed.

- [x] **Step 3: Add a one-click Ollama button**

When models exist and no API key is configured, show `welcome.ollamaDetected`, `welcome.useOllama`, and `welcome.checkingOllama` in the welcome panel. Clicking it sets:

```ts
setApiKey('')
setBaseUrl('http://localhost:11434/v1')
setAvailableModels(ollamaModels)
setModel(selectPreferredLocalChatModel(ollamaModels))
```

Implementation note: the actual implementation now chooses a preferred chat model with `selectPreferredLocalChatModel` so embedding/OCR/vision models are not selected first just because they sort earlier alphabetically.

- [x] **Step 4: Verify**

Run:

```bash
npm run typecheck
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3111 npm test -- --workers=1
```

Expected: TypeScript passes and Playwright sees the local provider onboarding button when Ollama is available.

## Task 2: Provider Status Badge

**Files:**
- Modify: `src/app/[locale]/page.tsx`
- Modify: `src/i18n/locales/ar.json`
- Modify: `src/i18n/locales/en.json`

- [x] **Step 1: Add a compact status label**

Show one small badge in the header:

```ts
apiKey === 'demo' -> Demo
isLocalProviderBaseUrl(baseUrl) -> Ollama / Local
apiKey -> Provider configured
else -> No provider
```

- [x] **Step 2: Verify visually**

Open `http://127.0.0.1:3111/ar/` and confirm the badge changes after enabling demo or Ollama.

## Task 3: Local Model Text Fallback

**Files:**
- Modify: `src/lib/chat-client.ts`
- Modify: `src/lib/__tests__/chat-client.test.ts`

- [x] **Step 1: Track whether the provider emitted tool calls**

Inside the stream adapter, track:

```ts
let emittedToolCall = false
let emittedText = ''
```

- [x] **Step 2: Emit fallback notice for local text-only replies**

If the provider is local, emitted text exists, and no tool call was emitted, append a short text message explaining that the local model replied normally instead of using Muharrir tools and suggesting another tool-capable model.

- [x] **Step 3: Add unit test**

Mock `fetch` to stream text chunks without tool calls, call `streamChat` with `baseUrl: 'http://localhost:11434/v1'`, and assert the consumed content contains the fallback explanation.

- [x] **Step 4: Verify**

Run:

```bash
npm run test:unit -- src/lib/__tests__/chat-client.test.ts
```

Expected: chat-client tests pass.

## Task 4: Final Verification And Commit

**Files:**
- Read: changed files

- [x] **Step 1: Run full checks**

```bash
npm run lint
npm run typecheck
npm run test:unit
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3111 npm test -- --workers=1
```

- [x] **Step 2: Commit**

```bash
git add src/app/[locale]/page.tsx src/lib/chat-client.ts src/i18n/locales/ar.json src/i18n/locales/en.json src/lib/__tests__/chat-client.test.ts tests/ui-optimization.spec.js docs/superpowers/plans/2026-07-08-local-provider-onboarding.md
git commit -m "feat: improve local provider onboarding"
```

## Self-Review

- Spec coverage: Ollama detection, one-click setup, status visibility, no-key local provider support, and text fallback are covered.
- Placeholder scan: no TODO/TBD placeholders.
- Type consistency: uses existing Zustand setters and existing `isLocalProviderBaseUrl` helper.
