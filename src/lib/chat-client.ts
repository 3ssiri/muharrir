/**
 * عميل المحادثة (client-side)
 * بديل عن مسار الخادم /api/chat ليعمل مع static export وTauri.
 * يرسل الطلب مباشرةً من المتصفح إلى مزوّد الذكاء الاصطناعي ({baseUrl}/chat/completions)
 * ويُعيد استجابة ببثّ بنفس البروتوكول المستخدَم سابقًا:
 *   0:"نص"        المحتوى النصّي
 *   9:{...}        استدعاء أداة { toolCallId, toolName, args }
 *   a:{...}        نتيجة أداة
 *   e:{...}        خطأ / حالة تصحيح
 *
 * ملاحظة: في متصفح الويب العادي قد يفشل الطلب بسبب CORS، لكن داخل Tauri
 * (الهدف من التحويل) يعمل الاتصال المباشر بالمزوّد بشكل طبيعي.
 */

import { validateToolCall, correctFormat } from '@/lib/format-validator';

export interface StreamChatParams {
  messages: any[];
  model?: string;
  systemPrompt?: string;
  apiKey: string;
  baseUrl: string;
  signal?: AbortSignal;
}

// موجّه النظام الافتراضي عند عدم توفّر موجّه من المستخدم
const DEFAULT_SYSTEM_PROMPT = `# من أنت

أنت **مساعد تحسين الموجّهات العام**، خبير محترف في هندسة الموجّهات (Prompt Engineering).

مهمتك الوحيدة هي: **مساعدة المستخدم في تصميم الموجّهات وتحسينها**، وليس تنفيذ المهمة التي يصفها الموجّه.

## حدود الدور

✅ ما ينبغي عليك فعله: فهم هدف المستخدم ← **استدعاء أداة suggest_enhancements فورًا** لعرض جدول تفاعلي ← إنشاء موجّه منظّم

❌ ما لا ينبغي عليك فعله: تنفيذ المهمة مباشرةً، إنتاج المخرجات النهائية للمهمة، القيام بالعمل نيابةً عن المستخدم، **الاكتفاء باقتراحات نصّية دون استدعاء الأداة**

# سير العمل

## المرحلة 1: فهم سريع (دون إخراج نص)
- التعرّف بسرعة على نوع المهمة (كتابة، تحليل، إنشاء، ترجمة، تفويض، إدارة، إلخ)
- **لا تُخرِج نصّ تحليل، انتقل مباشرةً إلى المرحلة 2**

## المرحلة 2: استدعاء الأداة فورًا لعرض جدول تفاعلي
**الأهم: يجب استدعاء أداة \`suggest_enhancements\` فورًا، لا تكتفِ بالوصف النصّي**

## المرحلة 3: إنشاء الموجّه
**يجب استدعاء الأداة**: \`propose_prompt\` لإنشاء الموجّه المنظّم النهائي.

# مبادئ مهمة
1. **الاستدعاء الإلزامي للأداة**: بعد استلام إدخال المستخدم، استدعِ أداة suggest_enhancements فورًا.
2. **الالتزام بالدور**: أنت مساعد تحسين موجّهات، ولست منفّذًا للمهام.
3. **لا تحليل نصّي**: لا تُخرِج عبارات مثل "فهمت" أو "دعني أحلّل"، بل استدعِ الأداة مباشرةً.
4. **ضمان الجودة**: يجب أن يكون الموجّه المُنشأ واضحًا ومنظّمًا وقابلًا للاستخدام مباشرةً.`;

// نص الوضع التجريبي
const DEMO_TEXT = "【الوضع التجريبي】\n\nهذا ردّ تجريبي محاكى. في الوضع الحقيقي، سأستدعي الأدوات لإنشاء موجّه منظّم. وبما أنه لم يُضبط مفتاح API حقيقي حاليًا، يُعرض تأثير بثّ النص فقط.\n\nيمكنك إدخال مفتاح OpenAI أو DeepSeek في الإعدادات لتجربة الميزات الكاملة.";

// تعريفات الأدوات بصيغة دوال OpenAI (نفس الأدوات الثلاث)
const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'ask_questions',
      description: 'استدعِ هذه الأداة لطرح أسئلة على المستخدم عندما يكون طلبه غير واضح.',
      parameters: {
        type: 'object',
        properties: {
          questions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                text: { type: 'string', description: 'The question to ask the user' },
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
      description: 'Phase 1: تقديم اقتراحات تحسين متعدّدة الأبعاد ليختار منها المستخدم.',
      parameters: {
        type: 'object',
        properties: {
          dimensions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                key: { type: 'string' },
                title: { type: 'string', description: 'عنوان البُعد، مثل "أسلوب النبرة"' },
                options: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      label: { type: 'string' },
                      value: { type: 'string' },
                      description: { type: 'string' },
                    },
                    required: ['label', 'value'],
                  },
                  description: 'خيارات جاهزة ينقر عليها المستخدم',
                },
                allowCustom: { type: 'boolean', description: 'هل يُسمح للمستخدم بإدخال متطلب مخصّص' },
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
      description: 'Phase 2: إنشاء الموجّه المنظّم النهائي بناءً على اختيار المستخدم.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'عنوان الموجّه' },
          role: { type: 'string', description: 'تعريف الدور' },
          objective: { type: 'string', description: 'الهدف الأساسي' },
          context: { type: 'string', description: 'معلومات الخلفية' },
          constraints: { type: 'array', items: { type: 'string' }, description: 'قائمة القيود' },
          workflow: { type: 'array', items: { type: 'string' }, description: 'خطوات سير العمل' },
          outputFormat: { type: 'string', description: 'متطلبات صيغة الإخراج' },
          finalPrompt: { type: 'string', description: 'الموجّه النهائي الكامل' },
        },
        required: ['title', 'role', 'objective', 'constraints', 'finalPrompt'],
      },
    },
  },
];

// تطبيع الـ Base URL (إزالة الشرطة المائلة النهائية)
function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
}

// تحويل رسائل التطبيق إلى صيغة المزوّد (role + content فقط)
function toProviderMessages(messages: any[]): Array<{ role: string; content: string }> {
  return messages
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant' || m.role === 'system'))
    .map((m) => ({
      role: m.role,
      content: typeof m.content === 'string' ? m.content : '',
    }));
}

// تحويل رمز/رسالة الخطأ إلى رسالة مفهومة (نفس منطق المعالجة السابق)
function mapError(status: number, raw: string, modelId?: string): string {
  if (status === 401 || /unauthorized|invalid api key/i.test(raw)) {
    return 'Authentication Failed: Invalid API Key. Please check your API Key in Settings.';
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
  return raw || `AI Error: request failed with status ${status}`;
}

// بثّ الوضع التجريبي
function buildDemoResponse(): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      for (let i = 0; i < DEMO_TEXT.length; i++) {
        controller.enqueue(encoder.encode('0:' + JSON.stringify(DEMO_TEXT[i]) + '\n'));
        await new Promise((r) => setTimeout(r, 20));
      }
      controller.close();
    },
  });
  return new Response(stream, { headers: { 'Content-Type': 'text/x-unknown; charset=utf-8' } });
}

/**
 * الدالة الرئيسية: تُرسل الطلب وتُعيد Response ببثّ بنفس البروتوكول.
 * صُمّمت لتكون بديلاً مباشرًا عن fetch('/api/chat', ...) في الواجهة.
 */
export async function streamChat(params: StreamChatParams): Promise<Response> {
  const { messages, model, systemPrompt, apiKey, baseUrl, signal } = params;

  // الوضع التجريبي
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
      // تجميع استدعاءات الأدوات حسب الفهرس (تصل أجزاؤها تدريجيًا)
      const toolAcc: Record<number, { id: string; name: string; args: string }> = {};
      let buffer = '';

      // إصدار استدعاءات الأدوات المتراكمة بعد التحقّق/التصحيح
      const flushToolCalls = async () => {
        for (const idx of Object.keys(toolAcc)) {
          const tc = toolAcc[Number(idx)];
          if (!tc || !tc.name) continue;

          let parsed: any = {};
          try {
            parsed = tc.args ? JSON.parse(tc.args) : {};
          } catch {
            parsed = tc.args; // غير صالح؛ سيُكتشف في التحقّق
          }

          // التحقّق من الصيغة، ومحاولة التصحيح عند الفشل (حتى 3 مرّات)
          const validation = validateToolCall(tc.name, parsed);
          if (!validation.valid) {
            controller.enqueue(encoder.encode(`e:{"type":"correction","status":"correcting"}\n`));
            let corrected = false;
            for (let i = 0; i < 3; i++) {
              const correction = await correctFormat(tc.name, parsed, apiKey, normalizeBaseUrl(baseUrl));
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

            // المحتوى النصّي
            if (typeof delta.content === 'string' && delta.content.length > 0) {
              controller.enqueue(encoder.encode(`0:${JSON.stringify(delta.content)}\n`));
            }

            // أجزاء استدعاءات الأدوات
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

        // إصدار أي استدعاءات أدوات متراكمة عند انتهاء البثّ
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
