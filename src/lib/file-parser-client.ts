/**
 * مُحلّل الملفات (client-side)
 * بديل عن مسار الخادم /api/parse-file ليعمل مع static export وTauri.
 * يحلّل ملفات PDF وDOCX مباشرةً في المتصفح:
 *   - PDF: عبر pdfjs-dist
 *   - DOCX: عبر mammoth
 * الواجهة نفسها: يأخذ File ويُعيد { text }.
 */

export interface ParsedFile {
  text: string;
  pages?: number;
}

/**
 * تحليل ملف PDF واستخراج نصّ جميع صفحاته.
 */
async function parsePdf(file: File): Promise<ParsedFile> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfjs = await import('pdfjs-dist');

  // ضبط الـ worker من الملف الثابت في مجلد public
  if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
  }

  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => ('str' in item ? item.str : ''))
      .join(' ');
    fullText += pageText + '\n';
  }

  return { text: fullText, pages: pdf.numPages };
}

/**
 * تحليل ملف DOCX واستخراج نصّه الخام.
 */
async function parseDocx(file: File): Promise<ParsedFile> {
  const arrayBuffer = await file.arrayBuffer();
  const mammoth = await import('mammoth');
  const result = await mammoth.extractRawText({ arrayBuffer });
  return { text: result.value };
}

/**
 * الدالة الرئيسية: تحلّل الملف حسب نوعه وتُعيد نصّه.
 * ترمي خطأً لأنواع الملفات غير المدعومة.
 */
export async function parseFile(file: File): Promise<ParsedFile> {
  if (file.type === 'application/pdf') {
    return parsePdf(file);
  }
  if (
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.name.endsWith('.docx')
  ) {
    return parseDocx(file);
  }
  if (file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
    const text = await file.text();
    return { text };
  }
  throw new Error('نوع الملف غير مدعوم');
}
