/**
 * أداة استيراد المفضّلة
 * تدعم الاستيراد من صيغتي JSON وMD
 */

import type { FavoritePrompt } from './db';

/**
 * الاستيراد من JSON
 */
export function importFromJSON(jsonString: string): Omit<FavoritePrompt, 'id'>[] {
  try {
    const data = JSON.parse(jsonString);

    if (!data.favorites || !Array.isArray(data.favorites)) {
      throw new Error('صيغة JSON غير صالحة: مصفوفة favorites مفقودة');
    }

    return data.favorites.map((fav: any) => ({
      title: fav.title || 'بدون عنوان',
      content: fav.content || '',
      tags: fav.tags || [],
      createdAt: fav.createdAt ? new Date(fav.createdAt) : new Date(),
      updatedAt: fav.updatedAt ? new Date(fav.updatedAt) : new Date()
    }));
  } catch (error: any) {
    throw new Error(`فشل تحليل JSON: ${error.message}`);
  }
}

/**
 * الاستيراد من Markdown
 */
export function importFromMarkdown(markdown: string): Omit<FavoritePrompt, 'id'>[] {
  const favorites: Omit<FavoritePrompt, 'id'>[] = [];

  // التقسيم حسب العناوين ##
  const sections = markdown.split(/^## /m).filter(s => s.trim());

  for (const section of sections) {
    const lines = section.split('\n');

    // استخراج العنوان (السطر الأول، مع إزالة الترقيم)
    const titleLine = lines[0].trim();
    const title = titleLine.replace(/^\d+\.\s*/, '');

    // استخراج الوسوم
    let tags: string[] = [];
    const tagMatch = section.match(/\*\*الوسوم\*\*:\s*(.+)/);
    if (tagMatch) {
      tags = tagMatch[1].split(',').map(t => t.trim().replace(/`/g, ''));
    }

    // استخراج المحتوى (داخل كتلة الشيفرة ```)
    const contentMatch = section.match(/```\n([\s\S]*?)\n```/);
    const content = contentMatch ? contentMatch[1].trim() : '';

    if (title && content) {
      favorites.push({
        title,
        content,
        tags,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  }

  return favorites;
}
