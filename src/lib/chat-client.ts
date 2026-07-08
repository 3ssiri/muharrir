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

export interface StreamChatParams {
  messages: any[];
  model?: string;
  systemPrompt?: string;
  apiKey: string;
  baseUrl: string;
  // Model used by the format-correction loop (configurable in Settings)
  correctionModel?: string;
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

const DEMO_INTRO =
  "Demo Mode\n\nThis is a local simulated run. No external AI provider is called.\n\nPick a direction from the enhancement table, then review the sample structured prompt below.";

const DEMO_ENHANCEMENTS = {
  dimensions: [
    {
      key: 'audience',
      title: 'Audience / الجمهور',
      options: [
        {
          label: 'Developers',
          value: 'developers',
          description: 'Use technical language, constraints, and implementation details.',
        },
        {
          label: 'Educators',
          value: 'educators',
          description: 'Use learning goals, examples, and assessment criteria.',
        },
        {
          label: 'Product teams',
          value: 'product-teams',
          description: 'Use goals, trade-offs, acceptance criteria, and user impact.',
        },
      ],
      allowCustom: true,
    },
    {
      key: 'output_style',
      title: 'Output style / نمط المخرجات',
      options: [
        {
          label: 'Structured brief',
          value: 'structured-brief',
          description: 'Concise sections with context, task, constraints, and output format.',
        },
        {
          label: 'Agent instructions',
          value: 'agent-instructions',
          description: 'Step-by-step instructions suitable for coding or research agents.',
        },
        {
          label: 'Arabic-first',
          value: 'arabic-first',
          description: 'Arabic phrasing with clear RTL-friendly structure.',
        },
      ],
      allowCustom: true,
    },
    {
      key: 'quality_bar',
      title: 'Quality bar / معيار الجودة',
      options: [
        {
          label: 'Fast draft',
          value: 'fast-draft',
          description: 'Prioritize a usable first version.',
        },
        {
          label: 'Review-ready',
          value: 'review-ready',
          description: 'Include assumptions, risks, and verification steps.',
        },
        {
          label: 'Production-grade',
          value: 'production-grade',
          description: 'Add strict constraints, examples, and acceptance checks.',
        },
      ],
      allowCustom: true,
    },
  ],
};

const DEMO_PROMPT = {
  title: 'Document-to-Prompt Assistant',
  role: 'You are a bilingual Arabic/English prompt engineering assistant.',
  objective: 'Turn a vague user idea or uploaded document summary into a clear, reusable AI prompt.',
  context:
    'The user may be a developer, educator, writer, or product builder. They need guidance without sending data to a Muharrir server.',
  constraints: [
    'Ask only essential clarification questions.',
    'Preserve Arabic RTL readability when the user writes in Arabic.',
    'State assumptions explicitly.',
    'Return a prompt the user can copy directly.',
  ],
  workflow: [
    'Identify the user goal and missing context.',
    'Offer enhancement choices for audience, output style, and quality bar.',
    'Generate a final prompt with role, task, constraints, and output format.',
  ],
  outputFormat:
    'Markdown with sections: Role, Objective, Context, Constraints, Workflow, Output Format, and Final Prompt.',
  finalPrompt:
    'You are a bilingual prompt engineering assistant. Help me transform the following rough idea into a structured AI prompt. Ask up to three clarification questions if needed, then produce a copy-ready prompt with Role, Objective, Context, Constraints, Workflow, and Output Format. Preserve Arabic readability when Arabic is used. Rough idea: {{user_idea}}',
};

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
function buildDemoResponse(): Response {
  const encoder = new TextEncoder();
  const chunks = [
    `0:${JSON.stringify(DEMO_INTRO)}\n`,
    `9:${JSON.stringify({ toolCallId: 'demo_enhancements', toolName: 'suggest_enhancements', args: DEMO_ENHANCEMENTS })}\n`,
    `9:${JSON.stringify({ toolCallId: 'demo_prompt', toolName: 'propose_prompt', args: DEMO_PROMPT })}\n`,
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
    return buildDemoResponse();
  }

  if (!apiKey) {
    return new Response('Configuration Error: Missing API Key. Please configure it in Settings.', { status: 401 });
  }

  const url = `${normalizeBaseUrl(baseUrl)}/chat/completions`;
  const modelId = model || 'gpt-4-turbo';

  const providerMessages = [
    { role: 'system', content: systemPrompt || DEFAULT_SYSTEM_PROMPT },
    ...toProviderMessages(messages),
  ];

  let upstream: Response;
  try {
    upstream = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
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
