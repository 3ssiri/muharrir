/**
 * Chat client (client-side)
 * Replacement for the /api/chat server route so the app works with static
 * export and Tauri. It sends the request straight from the browser to the AI
 * provider ({baseUrl}/chat/completions) and returns a streamed response using
 * the same protocol the app already parses:
 *   0:"text"     text content
 *   9:{...}      tool call { toolCallId, toolName, args }
 *   a:{...}      tool result
 *   e:{...}      error / correction status
 *
 * Note: in a regular web browser the direct provider request may fail due to
 * CORS, but inside Tauri (the conversion target) the direct call works fine.
 */

import { validateToolCall, correctFormat } from '@/lib/format-validator';
import { getProviderApiFormat, isLocalProviderBaseUrl } from '@/lib/providers';
import arMessages from '@/i18n/locales/ar.json';
import enMessages from '@/i18n/locales/en.json';

export interface StreamChatParams {
  messages: any[];
  model?: string;
  systemPrompt?: string;
  apiKey: string;
  baseUrl: string;
  // Model used by the format-correction loop (configurable in Settings)
  correctionModel?: string;
  // UI locale — selects the localized demo-mode sample ('ar' or 'en')
  locale?: string;
  signal?: AbortSignal;
}

// Default system prompt used when the user has not provided one
const DEFAULT_SYSTEM_PROMPT = `# Who you are

You are the **general prompt optimization assistant**, a professional Prompt Engineering expert.

Your only job is to **help the user design and optimize prompts**, not to perform the task the prompt describes.

## Role boundaries

✅ What you should do: understand the user's goal -> **immediately call the suggest_enhancements tool** to show an interactive table -> generate a structured prompt

❌ What you should not do: perform the task directly, produce the task's final output, do the work on the user's behalf, or **settle for text-only suggestions without calling the tool**

# Workflow

## Phase 1: Quick understanding (no text output)
- Quickly identify the task type (writing, analysis, generation, translation, authorization, management, etc.)
- **Do not output analysis text; go straight to Phase 2**

## Phase 2: Immediately call the tool to show an interactive table
**Most important: you must call the \`suggest_enhancements\` tool immediately; do not settle for a text description**
- Use 3-5 dimensions at most.
- Each dimension should use plain user-facing labels, not internal jargon.
- Each option description should explain the practical difference in one short sentence.

## Phase 3: Generate the prompt
**You must call the tool**: \`propose_prompt\` to generate the final structured prompt.
- The final prompt should be copy-ready and include role, objective, context, constraints, workflow, and output format when relevant.
- If the user's request is too vague to create useful enhancement choices, call \`ask_questions\` first with at most three essential questions.

# Important principles
1. **Mandatory tool call**: after receiving the user's input, call the suggest_enhancements tool immediately.
2. **Stay in role**: you are a prompt optimization assistant, not a task executor.
3. **No text analysis**: do not output phrases like "I understand" or "let me analyze"; call the tool directly.
4. **Quality assurance**: the generated prompt must be clear, structured, and ready to use directly.
5. **Bilingual care**: when the user writes Arabic, preserve natural Arabic phrasing and RTL-friendly structure.`;

// Demo-mode content is localized — see the `demo` namespace in
// src/i18n/locales/{ar,en}.json. Unknown locales fall back to English.
function getDemoContent(locale?: string) {
  return (locale === 'ar' ? arMessages : enMessages).demo;
}

// Tool definitions in OpenAI function format (the same three tools)
const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'ask_questions',
      description: 'Ask up to three essential clarification questions only when the request is too vague to produce useful enhancement choices.',
      parameters: {
        type: 'object',
        properties: {
          questions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                text: { type: 'string', description: 'A concise, user-facing question with no more than one idea' },
                type: { type: 'string', enum: ['text', 'select', 'checkbox'], description: 'Type of input required' },
                options: { type: 'array', items: { type: 'string' }, description: 'Options for select/checkbox' },
              },
              required: ['id', 'text', 'type'],
            },
          },
        },
        required: ['questions'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'suggest_enhancements',
      description: 'Phase 1: provide 3-5 clear, user-facing optimization dimensions with practical choices the user can understand quickly.',
      parameters: {
        type: 'object',
        properties: {
          dimensions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                key: { type: 'string' },
                title: { type: 'string', description: 'Short dimension title, e.g. "Audience", "Output style", or "Quality bar"' },
                options: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      label: { type: 'string' },
                      value: { type: 'string' },
                      description: { type: 'string', description: 'One short sentence explaining when to choose this option' },
                    },
                    required: ['label', 'value'],
                  },
                  description: 'Preset options the user can click',
                },
                allowCustom: { type: 'boolean', description: 'Whether the user is allowed to enter a custom requirement' },
              },
              required: ['key', 'title', 'options'],
            },
          },
        },
        required: ['dimensions'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'propose_prompt',
      description: 'Phase 2: generate a copy-ready structured prompt based on the user selections, preserving Arabic readability when relevant.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Prompt title' },
          role: { type: 'string', description: 'Role definition' },
          objective: { type: 'string', description: 'Core objective' },
          context: { type: 'string', description: 'Background information' },
          constraints: { type: 'array', items: { type: 'string' }, description: 'List of constraints' },
          workflow: { type: 'array', items: { type: 'string' }, description: 'Workflow steps' },
          outputFormat: { type: 'string', description: 'Output format requirements' },
          finalPrompt: { type: 'string', description: 'The complete final prompt' },
        },
        required: ['title', 'role', 'objective', 'constraints', 'finalPrompt'],
      },
    },
  },
];

const ANTHROPIC_VERSION = '2023-06-01';

// Normalize the Base URL (remove a trailing slash)
function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
}

// Convert app messages to the provider format (role + content only)
function toProviderMessages(messages: any[]): Array<{ role: string; content: string }> {
  return messages
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant' || m.role === 'system'))
    .map((m) => ({
      role: m.role,
      content: typeof m.content === 'string' ? m.content : '',
    }));
}

function toAnthropicMessages(messages: any[]): Array<{ role: 'user' | 'assistant'; content: string }> {
  return messages
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant'))
    .map((m) => ({
      role: m.role,
      content: typeof m.content === 'string' ? m.content : '',
    }))
    .filter((m) => m.content.trim().length > 0);
}

function toAnthropicTools() {
  return TOOLS.map((tool) => ({
    name: tool.function.name,
    description: tool.function.description,
    input_schema: tool.function.parameters,
  }));
}

// Cap on how much of a raw provider error we surface to the UI. Some providers
// (e.g. OpenRouter) return very long JSON bodies that previously leaked verbatim
// into the chat as a giant error message.
const MAX_ERROR_LEN = 300;

/**
 * Pull a human-readable message out of a provider error body. Provider errors
 * are usually `{"error":{"message":"..."}}`; fall back to the raw text when the
 * body is not JSON.
 */
export function extractProviderMessage(raw: string): string {
  if (!raw) return '';
  try {
    const parsed = JSON.parse(raw);
    const msg = parsed?.error?.message ?? parsed?.error ?? parsed?.message;
    if (typeof msg === 'string' && msg.trim()) return msg.trim();
  } catch {
    // Not JSON — fall through and return the raw text.
  }
  return raw;
}

/** Trim stray whitespace/newlines a pasted key often carries. */
export function normalizeApiKey(key: string): string {
  return (key ?? '').trim();
}

function truncate(text: string, max = MAX_ERROR_LEN): string {
  return text.length > max ? text.slice(0, max) + '…' : text;
}

// Map a status code / error message to a clear message (same handling logic as before)
export function mapError(status: number, raw: string, modelId?: string): string {
  if (status === 401 || /unauthorized|invalid api key|authentication fail/i.test(raw)) {
    return 'Authentication Failed: Invalid API Key. Please check your API Key in Settings.';
  }
  if (status === 402 || /insufficient (balance|credits|quota|funds)|requires more credits|more credits/i.test(raw)) {
    return 'Insufficient Balance: Your provider account has no remaining credits or quota. Please top up your account.';
  }
  if (status === 404 || /not found|model_not_found/i.test(raw)) {
    return `Model Not Found: The model '${modelId}' does not exist on this provider. Please select a valid model.`;
  }
  if (status === 429 || /rate limit/i.test(raw)) {
    return 'Rate Limit Exceeded: Too many requests or insufficient quota. Please try again later.';
  }
  if (status === 503 || /service unavailable/i.test(raw)) {
    return 'Service Unavailable: The API provider is temporarily unavailable. Please try again later.';
  }
  if (status >= 500) {
    return 'Server Error: The API provider is experiencing issues. Please try again later.';
  }
  // Unmapped status: surface the provider's own message, parsed and length-capped.
  return truncate(extractProviderMessage(raw)) || `AI Error: request failed with status ${status}`;
}

// Demo mode stream
function buildDemoResponse(locale?: string): Response {
  const demo = getDemoContent(locale);
  const encoder = new TextEncoder();
  const chunks = [
    `0:${JSON.stringify(demo.intro)}\n`,
    `9:${JSON.stringify({ toolCallId: 'demo_enhancements', toolName: 'suggest_enhancements', args: demo.enhancements })}\n`,
    `9:${JSON.stringify({ toolCallId: 'demo_prompt', toolName: 'propose_prompt', args: demo.prompt })}\n`,
  ];
  const stream = new ReadableStream({
    async start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
      }
      controller.close();
    },
  });
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Vercel-AI-Data-Stream': 'v1',
    },
  });
}

async function streamAnthropicChat(params: StreamChatParams, apiKey: string): Promise<Response> {
  const { messages, model, systemPrompt, baseUrl, signal } = params;
  const modelId = model || 'claude-sonnet-5';

  let upstream: Response;
  try {
    upstream = await fetch(`${normalizeBaseUrl(baseUrl)}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: modelId,
        max_tokens: 4096,
        system: systemPrompt || DEFAULT_SYSTEM_PROMPT,
        messages: toAnthropicMessages(messages),
        tools: toAnthropicTools(),
        tool_choice: { type: 'any' },
        stream: true,
      }),
      signal,
    });
  } catch {
    return new Response(`Connection Failed: Could not reach ${baseUrl}. Please check your Base URL settings.`, { status: 504 });
  }

  if (!upstream.ok || !upstream.body) {
    let raw = '';
    try { raw = await upstream.text(); } catch {}
    return new Response(mapError(upstream.status, raw, modelId), { status: upstream.status || 502 });
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const stream = new ReadableStream({
    async start(controller) {
      const toolAcc: Record<number, { id: string; name: string; args: string; emitted: boolean }> = {};
      let buffer = '';

      const flushToolCall = (idx: number) => {
        const tc = toolAcc[idx];
        if (!tc || tc.emitted || !tc.name) return;

        let parsed: unknown = {};
        try {
          parsed = tc.args ? JSON.parse(tc.args) : {};
        } catch {
          parsed = tc.args;
        }

        const validation = validateToolCall(tc.name, parsed);
        if (!validation.valid) {
          controller.enqueue(encoder.encode(`e:{"type":"correction","status":"failed"}\n`));
        }

        const toolData = { toolCallId: tc.id || `call_${idx}`, toolName: tc.name, args: parsed };
        controller.enqueue(encoder.encode(`9:${JSON.stringify(toolData)}\n`));
        tc.emitted = true;
      };

      try {
        const reader = upstream.body!.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data:')) continue;

            let json: any;
            try {
              json = JSON.parse(trimmed.slice(5).trim());
            } catch {
              continue;
            }

            const index = typeof json.index === 'number' ? json.index : 0;

            if (json.type === 'content_block_start' && json.content_block?.type === 'tool_use') {
              toolAcc[index] = {
                id: json.content_block.id || `call_${index}`,
                name: json.content_block.name || '',
                args: json.content_block.input && Object.keys(json.content_block.input).length > 0
                  ? JSON.stringify(json.content_block.input)
                  : '',
                emitted: false,
              };
            }

            if (json.type === 'content_block_delta' && json.delta?.type === 'text_delta') {
              const text = json.delta.text;
              if (typeof text === 'string' && text.length > 0) {
                controller.enqueue(encoder.encode(`0:${JSON.stringify(text)}\n`));
              }
            }

            if (json.type === 'content_block_delta' && json.delta?.type === 'input_json_delta') {
              if (!toolAcc[index]) toolAcc[index] = { id: `call_${index}`, name: '', args: '', emitted: false };
              if (typeof json.delta.partial_json === 'string') {
                toolAcc[index].args += json.delta.partial_json;
              }
            }

            if (json.type === 'content_block_stop') {
              flushToolCall(index);
            }
          }
        }

        Object.keys(toolAcc).forEach((idx) => flushToolCall(Number(idx)));
        controller.close();
      } catch (streamError: any) {
        if (streamError?.name === 'AbortError') {
          controller.close();
          return;
        }
        const errorData = {
          type: 'error',
          message: streamError?.message || 'Unknown streaming error',
        };
        controller.enqueue(encoder.encode(`e:${JSON.stringify(errorData)}\n`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Vercel-AI-Data-Stream': 'v1',
    },
  });
}

/**
 * Main function: sends the request and returns a streamed Response using the
 * same protocol. Designed as a drop-in replacement for fetch('/api/chat', ...)
 * in the UI.
 */
export async function streamChat(params: StreamChatParams): Promise<Response> {
  const { messages, model, systemPrompt, baseUrl, correctionModel, signal } = params;
  // Normalize the key up front: stray whitespace/newlines from a pasted key are
  // a common cause of mysterious 401s. An all-whitespace key becomes '' below.
  const apiKey = normalizeApiKey(params.apiKey);

  // Demo mode
  if (apiKey === 'demo') {
    return buildDemoResponse(params.locale);
  }

  const isLocalProvider = isLocalProviderBaseUrl(baseUrl);

  if (!apiKey && !isLocalProvider) {
    return new Response('Configuration Error: Missing API Key. Please configure it in Settings.', { status: 401 });
  }

  if (getProviderApiFormat(baseUrl) === 'anthropic') {
    return streamAnthropicChat(params, apiKey);
  }

  const url = `${normalizeBaseUrl(baseUrl)}/chat/completions`;
  const modelId = model || 'gpt-4-turbo';

  const providerMessages = [
    { role: 'system', content: systemPrompt || DEFAULT_SYSTEM_PROMPT },
    ...toProviderMessages(messages),
  ];

  let upstream: Response;
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (apiKey) {
      headers.Authorization = `Bearer ${apiKey}`;
    }

    upstream = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: modelId,
        messages: providerMessages,
        tools: TOOLS,
        tool_choice: 'auto',
        stream: true,
      }),
      signal,
    });
  } catch (err: any) {
    return new Response(`Connection Failed: Could not reach ${baseUrl}. Please check your Base URL settings.`, { status: 504 });
  }

  if (!upstream.ok || !upstream.body) {
    let raw = '';
    try { raw = await upstream.text(); } catch {}
    return new Response(mapError(upstream.status, raw, modelId), { status: upstream.status || 502 });
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Accumulate tool calls by index (their parts arrive incrementally)
      const toolAcc: Record<number, { id: string; name: string; args: string }> = {};
      let buffer = '';
      let emittedText = '';
      let emittedToolCall = false;

      // Emit the accumulated tool calls after validation/correction
      const flushToolCalls = async () => {
        for (const idx of Object.keys(toolAcc)) {
          const tc = toolAcc[Number(idx)];
          if (!tc || !tc.name) continue;

          let parsed: any = {};
          try {
            parsed = tc.args ? JSON.parse(tc.args) : {};
          } catch {
            parsed = tc.args; // invalid; will be caught during validation
          }

          // Validate the format, and try to correct it on failure (up to 3 times)
          const validation = validateToolCall(tc.name, parsed);
          if (!validation.valid) {
            controller.enqueue(encoder.encode(`e:{"type":"correction","status":"correcting"}\n`));
            let corrected = false;
            for (let i = 0; i < 3; i++) {
              // Fall back to the main chat model when no dedicated correction
              // model is configured — a hard-coded model like 'grok-beta-fast'
              // does not exist on most providers and would make correction
              // always fail.
              const correction = await correctFormat(tc.name, parsed, apiKey, normalizeBaseUrl(baseUrl), correctionModel || modelId);
              if (correction.success) {
                const revalidation = validateToolCall(tc.name, correction.correctedArgs);
                if (revalidation.valid) {
                  parsed = correction.correctedArgs;
                  corrected = true;
                  controller.enqueue(encoder.encode(`e:{"type":"correction","status":"success"}\n`));
                  break;
                }
              }
            }
            if (!corrected) {
              controller.enqueue(encoder.encode(`e:{"type":"correction","status":"failed"}\n`));
            }
          }

          const toolData = { toolCallId: tc.id || `call_${idx}`, toolName: tc.name, args: parsed };
          controller.enqueue(encoder.encode(`9:${JSON.stringify(toolData)}\n`));
          emittedToolCall = true;
        }
      };

      try {
        const reader = upstream.body!.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data:')) continue;
            const data = trimmed.slice(5).trim();
            if (data === '[DONE]') continue;

            let json: any;
            try {
              json = JSON.parse(data);
            } catch {
              continue;
            }

            const delta = json?.choices?.[0]?.delta;
            if (!delta) continue;

            // Text content
            if (typeof delta.content === 'string' && delta.content.length > 0) {
              controller.enqueue(encoder.encode(`0:${JSON.stringify(delta.content)}\n`));
              emittedText += delta.content;
            }

            // Tool call fragments
            if (Array.isArray(delta.tool_calls)) {
              for (const part of delta.tool_calls) {
                const idx = part.index ?? 0;
                if (!toolAcc[idx]) toolAcc[idx] = { id: '', name: '', args: '' };
                if (part.id) toolAcc[idx].id = part.id;
                if (part.function?.name) toolAcc[idx].name = part.function.name;
                if (part.function?.arguments) toolAcc[idx].args += part.function.arguments;
              }
            }
          }
        }

        // Emit any accumulated tool calls when the stream ends
        await flushToolCalls();
        if (isLocalProvider && emittedText.trim() && !emittedToolCall) {
          const fallbackNotice =
            '\n\n[Ollama] النموذج المحلي رد كنص عادي بدل استدعاء أدوات محرر، لذلك لم يتم إنشاء جدول التحسينات التفاعلي. جرّب نموذجًا يدعم الأدوات مثل qwen2.5:7b، أو استخدم وضع Demo لمعاينة التجربة الكاملة.\n\n[Ollama] The local model replied with plain text instead of calling Muharrir tools, so the interactive enhancement table was not generated. Try a tool-capable model such as qwen2.5:7b, or use Demo mode to preview the full workflow.';
          controller.enqueue(encoder.encode(`0:${JSON.stringify(fallbackNotice)}\n`));
        }
        controller.close();
      } catch (streamError: any) {
        if (streamError?.name === 'AbortError') {
          controller.close();
          return;
        }
        const errorData = {
          type: 'error',
          message: streamError?.message || 'Unknown streaming error',
        };
        controller.enqueue(encoder.encode(`e:${JSON.stringify(errorData)}\n`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Vercel-AI-Data-Stream': 'v1',
    },
  });
}
