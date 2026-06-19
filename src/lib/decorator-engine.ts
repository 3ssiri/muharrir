/**
 * Decorator engine - built on the prompt-decorators project
 * Used to control the style and form of AI responses
 */

export interface DecoratorConfig {
  // Thinking depth
  thinking_depth?: 'step_by_step' | 'debate' | 'socratic' | 'reasoning' | 'none';

  // Tone style
  tone?: 'formal' | 'casual' | 'creative' | 'technical' | 'friendly';

  // Output format
  output_format?: 'markdown' | 'json' | 'code' | 'structured' | 'plain';

  // Evaluation and refinement
  evaluation?: ('critique' | 'refine')[];

  // Validation
  validation?: ('fact_check' | 'cite_sources')[];

  // Custom decorators
  custom?: string[];
}

/**
 * Build the decorator prefix
 */
export function buildDecoratorPrefix(config: DecoratorConfig): string {
  const decorators: string[] = [];

  // 1. Thinking depth decorator
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

  // 2. Tone decorator
  if (config.tone) {
    decorators.push(`+++Tone(style=${config.tone})`);
  }

  // 3. Output format decorator
  if (config.output_format) {
    decorators.push(`+++OutputFormat(format=${config.output_format})`);
  }

  // 4. Evaluation and refinement decorator
  if (config.evaluation) {
    if (config.evaluation.includes('critique')) {
      decorators.push('+++Critique');
    }
    if (config.evaluation.includes('refine')) {
      decorators.push('+++Refine(iterations=2)');
    }
  }

  // 5. Validation decorator
  if (config.validation) {
    if (config.validation.includes('fact_check')) {
      decorators.push('+++FactCheck');
    }
    if (config.validation.includes('cite_sources')) {
      decorators.push('+++CiteSources');
    }
  }

  // 6. Custom decorators
  if (config.custom && config.custom.length > 0) {
    decorators.push(...config.custom);
  }

  return decorators.filter(Boolean).join('\n');
}

/**
 * Apply the decorators to the prompt
 */
export function applyDecorators(prompt: string, config: DecoratorConfig): string {
  const decoratorPrefix = buildDecoratorPrefix(config);

  if (!decoratorPrefix) {
    return prompt;
  }

  return `${decoratorPrefix}\n\n${prompt}`;
}
