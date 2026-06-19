/**
 * محرّك المُزخرِفات - مبني على مشروع prompt-decorators
 * يُستخدم للتحكّم في أسلوب إجابات الذكاء الاصطناعي وشكلها
 */

export interface DecoratorConfig {
  // عمق التفكير
  thinking_depth?: 'step_by_step' | 'debate' | 'socratic' | 'reasoning' | 'none';

  // أسلوب النبرة
  tone?: 'formal' | 'casual' | 'creative' | 'technical' | 'friendly';

  // صيغة الإخراج
  output_format?: 'markdown' | 'json' | 'code' | 'structured' | 'plain';

  // التقييم والتحسين
  evaluation?: ('critique' | 'refine')[];

  // التحقّق
  validation?: ('fact_check' | 'cite_sources')[];

  // مُزخرِفات مخصّصة
  custom?: string[];
}

/**
 * بناء بادئة المُزخرِفات
 */
export function buildDecoratorPrefix(config: DecoratorConfig): string {
  const decorators: string[] = [];

  // 1. مُزخرِف عمق التفكير
  if (config.thinking_depth && config.thinking_depth !== 'none') {
    const thinkingMap: Record<string, string> = {
      'step_by_step': '+++StepByStep',
      'debate': '+++Debate',
      'socratic': '+++Socratic',
      'reasoning': '+++Reasoning'
    };
    const decorator = thinkingMap[config.thinking_depth];
    if (decorator) decorators.push(decorator);
  }

  // 2. مُزخرِف النبرة
  if (config.tone) {
    decorators.push(`+++Tone(style=${config.tone})`);
  }

  // 3. مُزخرِف صيغة الإخراج
  if (config.output_format) {
    decorators.push(`+++OutputFormat(format=${config.output_format})`);
  }

  // 4. مُزخرِف التقييم والتحسين
  if (config.evaluation) {
    if (config.evaluation.includes('critique')) {
      decorators.push('+++Critique');
    }
    if (config.evaluation.includes('refine')) {
      decorators.push('+++Refine(iterations=2)');
    }
  }

  // 5. مُزخرِف التحقّق
  if (config.validation) {
    if (config.validation.includes('fact_check')) {
      decorators.push('+++FactCheck');
    }
    if (config.validation.includes('cite_sources')) {
      decorators.push('+++CiteSources');
    }
  }

  // 6. المُزخرِفات المخصّصة
  if (config.custom && config.custom.length > 0) {
    decorators.push(...config.custom);
  }

  return decorators.filter(Boolean).join('\n');
}

/**
 * تطبيق المُزخرِفات على الموجّه
 */
export function applyDecorators(prompt: string, config: DecoratorConfig): string {
  const decoratorPrefix = buildDecoratorPrefix(config);

  if (!decoratorPrefix) {
    return prompt;
  }

  return `${decoratorPrefix}\n\n${prompt}`;
}
