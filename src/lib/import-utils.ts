/**
 * Favorites import utility
 * Supports importing from both JSON and MD formats
 */

import type { FavoritePrompt } from './db';

/**
 * Import from JSON
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
 * Import from Markdown
 */
export function importFromMarkdown(markdown: string): Omit<FavoritePrompt, 'id'>[] {
  const favorites: Omit<FavoritePrompt, 'id'>[] = [];

  // Split by ## headings
  const sections = markdown.split(/^## /m).filter(s => s.trim());

  for (const section of sections) {
    const lines = section.split('\n');

    // Extract the title (first line, removing numbering)
    const titleLine = lines[0].trim();
    const title = titleLine.replace(/^\d+\.\s*/, '');

    // Extract the tags
    let tags: string[] = [];
    const tagMatch = section.match(/\*\*الوسوم\*\*:\s*(.+)/);
    if (tagMatch) {
      tags = tagMatch[1].split(',').map(t => t.trim().replace(/`/g, ''));
    }

    // Extract the content (inside the code block ```)
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
