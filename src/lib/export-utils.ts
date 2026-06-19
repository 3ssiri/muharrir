/**
 * Favorites export utility
 * Supports exporting in MD, JSON, and DOCX formats
 */

import type { FavoritePrompt } from './db';

/**
 * Export as Markdown
 */
export function exportToMarkdown(favorites: FavoritePrompt[]): string {
  let markdown = '# الموجّهات المفضّلة\n\n';
  markdown += `> وقت التصدير: ${new Date().toLocaleString('ar')}\n\n`;
  markdown += `> الإجمالي: ${favorites.length} عنصرًا مفضّلًا\n\n`;
  markdown += '---\n\n';

  favorites.forEach((fav, index) => {
    markdown += `## ${index + 1}. ${fav.title}\n\n`;

    if (fav.tags && fav.tags.length > 0) {
      markdown += `**الوسوم**: ${fav.tags.map(tag => `\`${tag}\``).join(', ')}\n\n`;
    }

    markdown += `**تاريخ الإنشاء**: ${new Date(fav.createdAt).toLocaleString('ar')}\n\n`;
    markdown += `**تاريخ التحديث**: ${new Date(fav.updatedAt).toLocaleString('ar')}\n\n`;
    markdown += '**المحتوى**:\n\n';
    markdown += '```\n';
    markdown += fav.content;
    markdown += '\n```\n\n';
    markdown += '---\n\n';
  });

  return markdown;
}

/**
 * Export as JSON
 */
export function exportToJSON(favorites: FavoritePrompt[]): string {
  const exportData = {
    version: '1.0',
    exportTime: new Date().toISOString(),
    count: favorites.length,
    favorites: favorites.map(fav => ({
      title: fav.title,
      content: fav.content,
      tags: fav.tags || [],
      createdAt: fav.createdAt,
      updatedAt: fav.updatedAt
    }))
  };

  return JSON.stringify(exportData, null, 2);
}
