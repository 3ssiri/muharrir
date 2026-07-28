/**
 * Preset mode configurations
 * Built on decorator combinations from prompt-decorators.
 *
 * Names, descriptions and starter seeds are localized — see the `presets`
 * namespace in src/i18n/locales/{ar,en}.json, keyed by the mode `id`.
 */

import { DecoratorConfig } from './decorator-engine';

export interface PresetMode {
  id: string;
  icon: string;
  decorators: DecoratorConfig;
}

export const PRESET_MODES: Record<string, PresetMode> = {
  // — Writing & content —
  creative: { id: 'creative', icon: '✨', decorators: { thinking_depth: 'none', tone: 'creative', output_format: 'markdown', evaluation: ['refine'] } },
  summarize: { id: 'summarize', icon: '📝', decorators: { thinking_depth: 'reasoning', tone: 'formal', output_format: 'structured' } },
  translate: { id: 'translate', icon: '🌐', decorators: { thinking_depth: 'none', tone: 'formal', output_format: 'plain' } },
  proofreading: { id: 'proofreading', icon: '✒️', decorators: { thinking_depth: 'none', tone: 'formal', output_format: 'plain', evaluation: ['refine'] } },

  // — Business & marketing —
  marketing: { id: 'marketing', icon: '📣', decorators: { thinking_depth: 'none', tone: 'friendly', output_format: 'markdown', evaluation: ['refine'] } },
  email: { id: 'email', icon: '📧', decorators: { thinking_depth: 'none', tone: 'formal', output_format: 'plain', evaluation: ['refine'] } },
  social_media: { id: 'social_media', icon: '📱', decorators: { thinking_depth: 'none', tone: 'casual', output_format: 'markdown', evaluation: ['refine'] } },
  product: { id: 'product', icon: '🛍️', decorators: { thinking_depth: 'none', tone: 'friendly', output_format: 'markdown' } },
  customer_support: { id: 'customer_support', icon: '🎧', decorators: { thinking_depth: 'none', tone: 'friendly', output_format: 'plain' } },
  business_plan: { id: 'business_plan', icon: '📈', decorators: { thinking_depth: 'reasoning', tone: 'formal', output_format: 'structured', evaluation: ['critique'] } },
  presentation: { id: 'presentation', icon: '🖥️', decorators: { thinking_depth: 'reasoning', tone: 'formal', output_format: 'structured' } },
  resume: { id: 'resume', icon: '📄', decorators: { thinking_depth: 'none', tone: 'formal', output_format: 'structured', evaluation: ['refine'] } },

  // — Code & data —
  coding: { id: 'coding', icon: '💻', decorators: { thinking_depth: 'step_by_step', tone: 'technical', output_format: 'code', evaluation: ['critique'] } },
  debugging: { id: 'debugging', icon: '🐞', decorators: { thinking_depth: 'step_by_step', tone: 'technical', output_format: 'code', evaluation: ['critique'] } },
  sql: { id: 'sql', icon: '🗄️', decorators: { thinking_depth: 'none', tone: 'technical', output_format: 'code' } },
  data_analysis: { id: 'data_analysis', icon: '📊', decorators: { thinking_depth: 'reasoning', tone: 'technical', output_format: 'structured', evaluation: ['critique'], validation: ['fact_check'] } },

  // — Learning & research —
  academic: { id: 'academic', icon: '🎓', decorators: { thinking_depth: 'reasoning', tone: 'formal', output_format: 'structured', validation: ['fact_check', 'cite_sources'] } },
  teaching: { id: 'teaching', icon: '👩‍🏫', decorators: { thinking_depth: 'step_by_step', tone: 'friendly', output_format: 'structured' } },
  brainstorm: { id: 'brainstorm', icon: '💡', decorators: { thinking_depth: 'debate', tone: 'creative', output_format: 'markdown' } },

  // — Persona packs —
  code_review: { id: 'code_review', icon: '🔍', decorators: { thinking_depth: 'step_by_step', tone: 'technical', output_format: 'code', evaluation: ['critique'] } },
  lesson_plan: { id: 'lesson_plan', icon: '📚', decorators: { thinking_depth: 'step_by_step', tone: 'friendly', output_format: 'structured' } },
  paper_summary: { id: 'paper_summary', icon: '📑', decorators: { thinking_depth: 'reasoning', tone: 'formal', output_format: 'structured', validation: ['cite_sources'] } },
  video_script: { id: 'video_script', icon: '🎬', decorators: { thinking_depth: 'none', tone: 'creative', output_format: 'markdown', evaluation: ['refine'] } },
};
