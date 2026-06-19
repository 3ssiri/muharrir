import { createOpenAI } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { validateToolCall, correctFormat } from '@/lib/format-validator';

export const maxDuration = 30;

export async function POST(req: Request) {
    let body;
    try {
        body = await req.json();
    } catch (error) {
        return new Response('Invalid JSON in request body', { status: 400 });
    }

    const { messages, model: modelId, systemPrompt } = body;

    if (!messages || !Array.isArray(messages)) {
        return new Response('Missing or invalid messages array', { status: 400 });
    }

    const apiKey = req.headers.get('x-api-key');
    let baseUrl = req.headers.get('x-base-url') || 'https://api.openai.com/v1';

    // Normalize Base URL: Ensure it doesn't end with a slash for consistency
    if (baseUrl.endsWith('/')) {
        baseUrl = baseUrl.slice(0, -1);
    }
    // Note: User might input 'https://api.deepseek.com' which needs '/v1' appended,
    // or they might input 'https://api.deepseek.com/v1' directly.
    // To be safe, if it doesn't end in /v1 and isn't openai, we might want to warn or try both?
    // For now, we trust the settings dialog to normalize, but we handle connection errors gracefully.

    // Demo Mode
    if (apiKey === 'demo') {
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                const text = "【الوضع التجريبي】\n\nهذا ردّ تجريبي محاكى. في الوضع الحقيقي، سأستدعي الأدوات لإنشاء موجّه منظّم. وبما أنه لم يُضبط مفتاح API حقيقي حاليًا، يُعرض تأثير بثّ النص فقط.\n\nيمكنك إدخال مفتاح OpenAI أو DeepSeek في الإعدادات لتجربة الميزات الكاملة.";

                for (let i = 0; i < text.length; i++) {
                    const chunk = '0:' + JSON.stringify(text[i]) + '\n';
                    controller.enqueue(encoder.encode(chunk));
                    await new Promise(r => setTimeout(r, 20)); // Simulate typing delay
                }
                controller.close();
            }
        });
        return new Response(stream, {
            headers: { 'Content-Type': 'text/x-unknown; charset=utf-8' }
        });
    }

    if (!apiKey) {
        return new Response('Configuration Error: Missing API Key. Please configure it in Settings.', { status: 401 });
    }

    const openai = createOpenAI({
        baseURL: baseUrl,
        apiKey: apiKey,
    });

    try {
        // استخدام موجّه النظام الذي ضبطه المستخدم، وإلا استخدام الافتراضي
        const defaultSystemPrompt = `# من أنت

أنت **مساعد تحسين الموجّهات العام**، خبير محترف في هندسة الموجّهات (Prompt Engineering).

مهمتك الوحيدة هي: **مساعدة المستخدم في تصميم الموجّهات وتحسينها**، وليس تنفيذ المهمة التي يصفها الموجّه.

## حدود الدور

✅ ما ينبغي عليك فعله: فهم هدف المستخدم ← **استدعاء أداة suggest_enhancements فورًا** لعرض جدول تفاعلي ← إنشاء موجّه منظّم

❌ ما لا ينبغي عليك فعله: تنفيذ المهمة مباشرةً، إنتاج المخرجات النهائية للمهمة، القيام بالعمل نيابةً عن المستخدم، **الاكتفاء باقتراحات نصّية دون استدعاء الأداة**

## أمثلة

| إدخال المستخدم | ❌ ردّ خاطئ | ✅ ردّ صحيح |
|---------|--------|--------|
| "ساعدني في كتابة مقال عن الذكاء الاصطناعي" | كتابة المقال مباشرةً | **استدعاء الأداة فورًا** لعرض خيارات الدور/الأسلوب/الصيغة |
| "أنشئ مخطط عرض تقديمي" | إنشاء المخطط مباشرةً | **استدعاء الأداة فورًا** لعرض خيارات البنية/مستوى التفصيل/الأسلوب |
| "ترجم هذا النص" | الترجمة مباشرةً | **استدعاء الأداة فورًا** لعرض خيارات اللغة/الأسلوب/مستوى الاحترافية |
| "عملية تفويض" | اقتراح نصّي فقط | **استدعاء الأداة فورًا** لعرض خيارات نوع التفويض/طريقة المعالجة/متطلبات التوثيق |

---

# سير العمل

## المرحلة 1: فهم سريع (دون إخراج نص)
- التعرّف بسرعة على نوع المهمة (كتابة، تحليل، إنشاء، ترجمة، تفويض، إدارة، إلخ)
- **لا تُخرِج نصّ تحليل، انتقل مباشرةً إلى المرحلة 2**

## المرحلة 2: استدعاء الأداة فورًا لعرض جدول تفاعلي
**الأهم: يجب استدعاء أداة \`suggest_enhancements\` فورًا، لا تكتفِ بالوصف النصّي**

اختر 3-5 أبعاد أكثر صلة بناءً على نوع المهمة:
- **نوع الكتابة**: تعريف الدور، أسلوب النبرة، مستوى التفصيل، صيغة الإخراج
- **نوع التحليل**: عمق التحليل، مستوى الاحترافية، متطلبات البنية، صيغة الإخراج
- **نوع العمليات** (مثل التفويض والإعداد): نوع العملية، طريقة المعالجة، متطلبات التوثيق، مستوى الأمان
- **نوع الإنشاء**: مستوى الإبداع، متطلبات البنية، مستوى التفصيل، الجمهور المستهدف

قدّم 2-4 خيارات محدّدة لكل بُعد، مع السماح للمستخدم بالتخصيص.

## المرحلة 3: إنشاء الموجّه
**يجب استدعاء الأداة**: \`propose_prompt\`

يجب أن يتضمّن المحتوى المُنشأ:
1. عنوان الموجّه
2. تعريف الدور
3. الهدف الأساسي
4. معلومات الخلفية
5. قائمة القيود
6. سير العمل (اختياري)
7. متطلبات صيغة الإخراج
8. **الموجّه النهائي الكامل** (قابل للنسخ والاستخدام مباشرةً)

---

# مبادئ مهمة

1. **الاستدعاء الإلزامي للأداة**: بعد استلام إدخال المستخدم، **يجب استدعاء أداة suggest_enhancements فورًا**، لا تكتفِ بالوصف النصّي
2. **الالتزام بالدور**: تذكّر دائمًا أنك مساعد تحسين موجّهات، ولست منفّذًا للمهام
3. **لا تحليل نصّي**: لا تُخرِج عبارات مثل "فهمت" أو "دعني أحلّل"، بل استدعِ الأداة مباشرةً
4. **العمومية**: ادعم جميع أنواع المهام (كتابة، تحليل، عمليات، إعداد، تفويض، إلخ)
5. **ضمان الجودة**: يجب أن يكون الموجّه المُنشأ واضحًا ومنظّمًا وقابلًا للاستخدام مباشرةً

---

# أمثلة على استدعاء الأدوات (One-Shot Examples)

## ⚠️ قاعدة المنع المطلق

**قبل استدعاء الأداة، يُمنع منعًا باتًا إخراج أي محتوى نصّي!**

❌ سلوكيات ممنوعة:
- "فهمت احتياجك..."
- "دعني أحلّل لك..."
- "## 📝 أسلوب الكتابة"
- أي شكل من أشكال التحليل أو الشرح أو العناوين النصّية

✅ السلوك الصحيح:
- بعد استلام إدخال المستخدم، **استدعِ أداة suggest_enhancements فورًا**
- **بلا إخراج نصّي**، انتقل مباشرةً إلى استدعاء الأداة

---

## المثال 1: مهمة كتابة (سير كامل)

### الجولة 1 من المحادثة

**إدخال المستخدم**:
"ساعدني في كتابة مقال عن الذكاء الاصطناعي"

**سلوك المساعد**:
[لا يُخرِج أي نص، يستدعي أداة suggest_enhancements فورًا]

**استدعاء الأداة**:
\`\`\`json
{
  "toolName": "suggest_enhancements",
  "args": {
    "dimensions": [
      {
        "key": "role",
        "title": "تعريف الدور",
        "options": [
          { "label": "كاتب تقني خبير", "value": "tech_writer", "description": "مهارات كتابة تقنية احترافية" },
          { "label": "خبير أبحاث ذكاء اصطناعي", "value": "ai_expert", "description": "معرفة عميقة بالذكاء الاصطناعي" },
          { "label": "مبسّط علمي", "value": "science_writer", "description": "تعبير سهل ومفهوم" }
        ],
        "allowCustom": true
      },
      {
        "key": "tone",
        "title": "أسلوب النبرة",
        "options": [
          { "label": "احترافي ورسمي", "value": "formal" },
          { "label": "سلس وسهل القراءة", "value": "casual" },
          { "label": "أكاديمي ودقيق", "value": "academic" }
        ],
        "allowCustom": true
      },
      {
        "key": "detail_level",
        "title": "مستوى التفصيل",
        "options": [
          { "label": "تحليل معمّق", "value": "detailed" },
          { "label": "متوسّط", "value": "moderate" },
          { "label": "نظرة عامة موجزة", "value": "brief" }
        ],
        "allowCustom": true
      }
    ]
  }
}
\`\`\`

**عرض الواجهة الأمامية**:
[يُعرض الجدول التفاعلي تلقائيًا، ويمكن للمستخدم النقر على الخيارات أو إدخال متطلبات مخصّصة]

### الجولة 2 من المحادثة

**اختيار المستخدم**:
"تعريف الدور: خبير أبحاث ذكاء اصطناعي، أسلوب النبرة: أكاديمي ودقيق، مستوى التفصيل: تحليل معمّق"

**سلوك المساعد**:
[بعد استلام اختيار المستخدم، يستدعي أداة propose_prompt فورًا لإنشاء الموجّه النهائي]

**استدعاء الأداة**:
\`\`\`json
{
  "toolName": "propose_prompt",
  "args": {
    "title": "موجّه مقال تحليل معمّق لاتجاهات تطوّر الذكاء الاصطناعي",
    "role": "أنت خبير لديه أكثر من 10 سنوات خبرة بحثية في مجال الذكاء الاصطناعي، متخصّص في تطوّر تقنيات الذكاء الاصطناعي وتطبيقاتها الصناعية وتحليل اتجاهاتها المستقبلية.",
    "objective": "كتابة مقال تحليل معمّق عن اتجاهات تطوّر الذكاء الاصطناعي، يتّسم بالدقّة الأكاديمية وكفاية الأدلّة ووضوح المنطق.",
    "context": "تشهد تقنيات الذكاء الاصطناعي حاليًا مرحلة تطوّر سريع، مع تقدّم جوهري في مجالات النماذج اللغوية الكبيرة والذكاء الاصطناعي متعدّد الوسائط والذكاء المجسّد.",
    "constraints": [
      "يجب الاستشهاد بأوراق بحثية وبيانات موثوقة لدعم الآراء",
      "استخدام أسلوب لغوي أكاديمي وتجنّب التعبيرات العامية",
      "تحليل عميق للمبادئ التقنية وحالات الاستخدام والتأثيرات المحتملة",
      "تقييم موضوعي للحدود التقنية والمخاطر الأخلاقية",
      "عدد الكلمات المطلوب: 3000-5000 كلمة"
    ],
    "workflow": [
      "تحليل نقاط الاختراق الأساسية في تقنيات الذكاء الاصطناعي الحالية",
      "استعراض حالات الاستخدام والبيانات في مختلف المجالات",
      "توقّع اتجاهات التطوّر خلال 3-5 سنوات قادمة",
      "تقييم التحدّيات التقنية والتأثيرات المجتمعية",
      "التلخيص وتقديم توصيات بنّاءة"
    ],
    "outputFormat": "صيغة Markdown، تتضمّن العنوان والملخّص والمتن (عناوين متعدّدة المستويات) والمراجع",
    "finalPrompt": "أنت خبير لديه أكثر من 10 سنوات خبرة بحثية في مجال الذكاء الاصطناعي. اكتب مقال تحليل معمّق عن اتجاهات تطوّر الذكاء الاصطناعي.\n\nالمتطلبات:\n1. الاستشهاد بأوراق بحثية وبيانات موثوقة لدعم الآراء\n2. استخدام أسلوب لغوي أكاديمي\n3. تحليل عميق للمبادئ التقنية وحالات الاستخدام والتأثيرات المحتملة\n4. تقييم موضوعي للحدود التقنية والمخاطر الأخلاقية\n5. عدد الكلمات: 3000-5000 كلمة\n\nبنية المقال:\n1. الملخّص\n2. تحليل نقاط الاختراق الأساسية في تقنيات الذكاء الاصطناعي الحالية\n3. استعراض حالات الاستخدام والبيانات في مختلف المجالات\n4. توقّع اتجاهات التطوّر خلال 3-5 سنوات قادمة\n5. تقييم التحدّيات التقنية والتأثيرات المجتمعية\n6. التلخيص والتوصيات\n7. المراجع\n\nأخرِج المحتوى بصيغة Markdown."
  }
}
\`\`\`

**عرض الواجهة الأمامية**:
[تُعرض بطاقة الموجّه المنظّم، ويمكن للمستخدم نسخها واستخدامها]

---

## 🚨 آلية الإنفاذ الإلزامية

إذا أخرجت أي نص قبل استدعاء الأداة، فسيقوم النظام بـ:
1. تجاهل المحتوى النصّي تلقائيًا
2. الإبقاء على جزء استدعاء الأداة فقط
3. عرض الجدول التفاعلي فقط في الواجهة الأمامية

**تذكّر**: قيمتك تكمن في إنشاء جداول تفاعلية منظّمة، لا في الشرح النصّي.`;

        const result = streamText({
            model: openai.chat(modelId || 'gpt-4-turbo'),
            messages,
            system: systemPrompt || defaultSystemPrompt,
            tools: {
                ask_questions: tool({
                    description: 'استدعِ هذه الأداة لطرح أسئلة على المستخدم عندما يكون طلبه غير واضح.',
                    inputSchema: z.object({
                        questions: z.array(z.object({
                            id: z.string(),
                            text: z.string().describe('The question to ask the user'),
                            type: z.enum(['text', 'select', 'checkbox']).describe('Type of input required'),
                            options: z.array(z.string()).optional().describe('Options for select/checkbox')
                        }))
                    }),
                    execute: async () => 'User interaction required'
                }),
                suggest_enhancements: tool({
                    description: 'Phase 1: تقديم اقتراحات تحسين متعدّدة الأبعاد ليختار منها المستخدم.',
                    inputSchema: z.object({
                        dimensions: z.array(z.object({
                            key: z.string(),
                            title: z.string().describe('عنوان البُعد، مثل "أسلوب النبرة"'),
                            options: z.array(z.object({
                                label: z.string(),
                                value: z.string(),
                                description: z.string().optional()
                            })).describe('خيارات جاهزة ينقر عليها المستخدم'),
                            allowCustom: z.boolean().default(true).describe('هل يُسمح للمستخدم بإدخال متطلب مخصّص')
                        }))
                    }),
                    execute: async () => 'Optimization options presented to user'
                }),
                propose_prompt: tool({
                    description: 'Phase 2: إنشاء الموجّه المنظّم النهائي بناءً على اختيار المستخدم.',
                    inputSchema: z.object({
                        title: z.string().describe('عنوان الموجّه'),
                        role: z.string().describe('تعريف الدور'),
                        objective: z.string().describe('الهدف الأساسي'),
                        context: z.string().optional().describe('معلومات الخلفية'),
                        constraints: z.array(z.string()).describe('قائمة القيود'),
                        workflow: z.array(z.string()).optional().describe('خطوات سير العمل'),
                        outputFormat: z.string().optional().describe('متطلبات صيغة الإخراج'),
                        finalPrompt: z.string().describe('الموجّه النهائي الكامل')
                    }),
                    execute: async () => 'Prompt proposal generated'
                })
            },
        });

        // استخدام fullStream لبناء استجابة تتضمّن استدعاءات الأدوات يدويًا
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const part of result.fullStream) {
                        console.log('Stream part type:', part.type, part);

                        if (part.type === 'error') {
                            // نوع الخطأ
                            console.error('Stream error detected:', part);
                            const errorData = {
                                type: 'stream_error',
                                message: (part as any).error?.message || 'Stream processing error'
                            };
                            const errorChunk = `e:${JSON.stringify(errorData)}\n`;
                            controller.enqueue(encoder.encode(errorChunk));
                            controller.close();
                            return;
                        } else if (part.type === 'text-delta') {
                            // المحتوى النصّي: باستخدام البادئة "0:"
                            if (part.text !== undefined && part.text !== null) {
                                const chunk = `0:${JSON.stringify(part.text)}\n`;
                                controller.enqueue(encoder.encode(chunk));
                            }
                        } else if (part.type === 'tool-call') {
                            // استدعاء الأداة: باستخدام البادئة "9:"
                            console.log('🔧 تم استلام استدعاء أداة:', part.toolName);
                            console.log('🔧 معامِلات الأداة:', JSON.stringify(part.input, null, 2));
                            let finalArgs = part.input;

                            // التحقّق من الصيغة
                            const validation = validateToolCall(part.toolName, part.input);
                            console.log('✅ نتيجة التحقّق من الصيغة:', validation.valid ? 'ناجح' : 'فاشل', validation.error || '');

                            if (!validation.valid) {
                                console.log('فشل التحقّق من الصيغة:', validation.error);

                                // إرسال حالة التصحيح
                                controller.enqueue(encoder.encode(`e:{"type":"correction","status":"correcting"}\n`));

                                // محاولة التصحيح، 3 مرّات كحدّ أقصى
                                let corrected = false;
                                for (let i = 0; i < 3; i++) {
                                    const correction = await correctFormat(
                                        part.toolName,
                                        finalArgs,
                                        apiKey,
                                        baseUrl
                                    );

                                    if (correction.success) {
                                        // إعادة التحقّق من النتيجة بعد التصحيح
                                        const revalidation = validateToolCall(part.toolName, correction.correctedArgs);
                                        if (revalidation.valid) {
                                            finalArgs = correction.correctedArgs;
                                            corrected = true;
                                            console.log(`نجح تصحيح الصيغة (المحاولة رقم ${i + 1})`);
                                            controller.enqueue(encoder.encode(`e:{"type":"correction","status":"success"}\n`));
                                            break;
                                        }
                                    }
                                }

                                if (!corrected) {
                                    console.log('فشل تصحيح الصيغة، سيتم استخدام المعامِلات الأصلية');
                                    controller.enqueue(encoder.encode(`e:{"type":"correction","status":"failed"}\n`));
                                }
                            }

                            const toolData = {
                                toolCallId: part.toolCallId,
                                toolName: part.toolName,
                                args: finalArgs
                            };
                            const chunk = `9:${JSON.stringify(toolData)}\n`;
                            controller.enqueue(encoder.encode(chunk));
                        } else if (part.type === 'tool-result') {
                            // نتيجة الأداة
                            console.log('Tool result:', JSON.stringify(part, null, 2));
                            const resultData = {
                                toolCallId: part.toolCallId,
                                toolName: part.toolName,
                                result: 'result' in part ? part.result : undefined
                            };
                            const chunk = `a:${JSON.stringify(resultData)}\n`;
                            controller.enqueue(encoder.encode(chunk));
                        }
                    }
                    controller.close();
                } catch (streamError: any) {
                    // خطأ أثناء معالجة البثّ
                    console.error('Stream processing error:', streamError);

                    // بناء معلومات خطأ مفصّلة
                    let errorMessage = streamError.message || 'Unknown streaming error';
                    let errorType = 'error';

                    // التعرّف على نوع الخطأ المحدّد
                    if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
                        errorType = 'auth_error';
                        errorMessage = `Authentication Failed: Invalid API Key. Please check your API Key in Settings.`;
                    } else if (errorMessage.includes('404') || errorMessage.includes('not found')) {
                        errorType = 'model_error';
                        errorMessage = `Model Not Found: The model '${modelId}' does not exist on this provider. Please select a valid model.`;
                    } else if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
                        errorType = 'quota_error';
                        errorMessage = `Rate Limit Exceeded: Too many requests or insufficient quota. Please try again later.`;
                    } else if (errorMessage.includes('500') || errorMessage.includes('502') || errorMessage.includes('503')) {
                        errorType = 'server_error';
                        errorMessage = `Server Error: The API provider is experiencing issues. Please try again later.`;
                    } else if (errorMessage.includes('timeout')) {
                        errorType = 'timeout_error';
                        errorMessage = `Request Timeout: The request took too long to complete. Please try again.`;
                    }

                    // إرسال معلومات الخطأ إلى الواجهة الأمامية
                    const errorData = {
                        type: errorType,
                        message: errorMessage,
                        originalError: streamError.message
                    };
                    const errorChunk = `e:${JSON.stringify(errorData)}\n`;
                    controller.enqueue(encoder.encode(errorChunk));
                    controller.close();
                }
            }
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'X-Vercel-AI-Data-Stream': 'v1'
            }
        });
    } catch (error: any) {
        console.error("Chat API Error:", error);
        const errorMessage = error.message || 'Unknown network error';

        // تعزيز التعرّف على الأخطاء
        if (errorMessage.includes('model_not_found') || errorMessage.includes('model not found')) {
            return new Response(`Model Not Found: The model '${modelId}' does not exist on this provider. Please select a valid model.`, { status: 404 });
        }
        if (errorMessage.includes('fetch failed')) {
            return new Response(`Connection Failed: Could not reach ${baseUrl}. Please check your Base URL settings.`, { status: 504 });
        }
        if (errorMessage.includes('401') || errorMessage.includes('Unauthorized') || errorMessage.includes('Invalid API key')) {
            return new Response(`Authentication Failed: Invalid API Key. Please check your API Key in Settings.`, { status: 401 });
        }
        if (errorMessage.includes('404')) {
            return new Response(`Model Not Found: The model '${modelId}' does not exist on this provider, or the Base URL path is incorrect.`, { status: 404 });
        }
        if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
            return new Response(`Rate Limit Exceeded: Too many requests or insufficient quota. Please try again later.`, { status: 429 });
        }
        if (errorMessage.includes('503') || errorMessage.includes('Service Unavailable')) {
            return new Response(`Service Unavailable: The API provider is temporarily unavailable. Please try again later.`, { status: 503 });
        }

        return new Response(`AI Error: ${errorMessage}`, { status: 500 });
    }
}
