/**
 * إعدادات الأوضاع الجاهزة
 * مبنية على تركيبات المُزخرِفات من prompt-decorators
 */

import { DecoratorConfig } from './decorator-engine';

export interface PresetMode {
  id: string;
  name: string;
  icon: string;
  description: string;
  decorators: DecoratorConfig;
}

export const PRESET_MODES: Record<string, PresetMode> = {
  academic: {
    id: 'academic',
    name: 'البحث الأكاديمي',
    icon: '🎓',
    description: 'مناسب لمراجعة الأدبيات وتصميم منهجية البحث',
    decorators: {
      thinking_depth: 'reasoning',
      tone: 'formal',
      output_format: 'structured',
      validation: ['fact_check', 'cite_sources']
    }
  },

  coding: {
    id: 'coding',
    name: 'تطوير الشيفرة',
    icon: '💻',
    description: 'مناسب لإنشاء الشيفرة ومراجعتها',
    decorators: {
      thinking_depth: 'step_by_step',
      tone: 'technical',
      output_format: 'code',
      evaluation: ['critique']
    }
  },

  creative: {
    id: 'creative',
    name: 'الكتابة الإبداعية',
    icon: '✨',
    description: 'مناسب لكتابة المحتوى وتأليف القصص',
    decorators: {
      thinking_depth: 'none',
      tone: 'creative',
      output_format: 'markdown',
      evaluation: ['refine']
    }
  },

  data_analysis: {
    id: 'data_analysis',
    name: 'تحليل البيانات',
    icon: '📊',
    description: 'مناسب لتفسير البيانات وتحليل الاتجاهات',
    decorators: {
      thinking_depth: 'reasoning',
      tone: 'technical',
      output_format: 'structured',
      evaluation: ['critique'],
      validation: ['fact_check']
    }
  }
};
