/**
 * File parser (client-side)
 * Replacement for the /api/parse-file server route so it works with static
 * export and Tauri. Parses PDF and DOCX files directly in the browser:
 *   - PDF: via pdfjs-dist
 *   - DOCX: via mammoth
 * Same interface: takes a File and returns { text }.
 */

export interface ParsedFile {
  text: string;
  pages?: number;
}

/**
 * Parse a PDF file and extract the text of all its pages.
 */
async function parsePdf(file: File): Promise<ParsedFile> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfjs = await import('pdfjs-dist');

  // Set the worker from the static file in the public folder
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
 * Parse a DOCX file and extract its raw text.
 */
async function parseDocx(file: File): Promise<ParsedFile> {
  const arrayBuffer = await file.arrayBuffer();
  const mammoth = await import('mammoth');
  const result = await mammoth.extractRawText({ arrayBuffer });
  return { text: result.value };
}

/**
 * Main function: parses the file according to its type and returns its text.
 * Throws an error for unsupported file types.
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
