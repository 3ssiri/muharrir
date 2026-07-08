/**
 * Format validation and correction utility
 * Used to validate the format of tool calls in model output, and correct it when needed
 */

import { z } from 'zod';

// Define the schema for tool calls
const SuggestEnhancementsSchema = z.object({
  dimensions: z.array(z.object({
    key: z.string(),
    title: z.string(),
    options: z.array(z.object({
      label: z.string(),
      value: z.string(),
      description: z.string().optional()
    })),
    allowCustom: z.boolean().optional()
  }))
});

const ProposePromptSchema = z.object({
  title: z.string(),
  role: z.string(),
  objective: z.string(),
  context: z.string().optional(),
  constraints: z.array(z.string()),
  workflow: z.array(z.string()).optional(),
  outputFormat: z.string().optional(),
  finalPrompt: z.string()
});

/**
 * Validate the format of a tool call
 */
export function validateToolCall(toolName: string, args: any): { valid: boolean; error?: string } {
  try {
    if (toolName === 'suggest_enhancements') {
      SuggestEnhancementsSchema.parse(args);
      return { valid: true };
    } else if (toolName === 'propose_prompt') {
      ProposePromptSchema.parse(args);
      return { valid: true };
    }
    return { valid: true }; // Other tools are not validated currently
  } catch (error: any) {
    return {
      valid: false,
      error: error.message || 'فشل التحقّق من الصيغة'
    };
  }
}

/**
 * Call grok-beta-fast to correct the format
 */
export async function correctFormat(
  toolName: string,
  invalidArgs: any,
  apiKey: string,
  baseUrl: string,
  correctionModel: string = 'grok-beta-fast'
): Promise<{ success: boolean; correctedArgs?: any; error?: string }> {
  try {
    const correctionPrompt = `أنت خبير في تصحيح الصيغ. مهمتك هي إصلاح أخطاء صيغة JSON دون تعديل أو حذف أو إضافة أي معلومة دلالية.

اسم الأداة: ${toolName}
الـ JSON الخاطئ: ${JSON.stringify(invalidArgs, null, 2)}

المتطلبات:
1. أصلح أخطاء صيغة JSON فقط (مثل علامات الاقتباس أو الفواصل أو الأقواس المفقودة)
2. لا تعدّل قيمة أي حقل أو معناه
3. لا تحذف أي حقل
4. لا تضِف أي حقل جديد
5. أخرِج JSON المصحّح مباشرةً دون أي نص آخر

JSON المصحّح:`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (apiKey) {
      headers.Authorization = `Bearer ${apiKey}`;
    }

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: correctionModel || 'grok-beta-fast',
        messages: [
          { role: 'user', content: correctionPrompt }
        ],
        temperature: 0
      })
    });

    if (!response.ok) {
      throw new Error(`فشل طلب التصحيح: ${response.status}`);
    }

    const data = await response.json();
    const correctedText = data.choices[0]?.message?.content?.trim();

    if (!correctedText) {
      throw new Error('أعاد نموذج التصحيح محتوى فارغًا');
    }

    // Attempt to parse the JSON after correction
    const correctedArgs = JSON.parse(correctedText);

    return { success: true, correctedArgs };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'فشل تصحيح الصيغة'
    };
  }
}
