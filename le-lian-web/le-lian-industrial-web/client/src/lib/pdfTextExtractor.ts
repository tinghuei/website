// PDF 教材文字擷取工具
// 使用 pdfjs-dist 在瀏覽器端解析 PDF 檔案，擷取文字內容供測驗出題參考。

import * as pdfjsLib from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

const MAX_PAGES = 25;

function isPdfFile(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

/**
 * 擷取 PDF 檔案的文字內容（最多前 25 頁），失敗或非 PDF 檔案則回傳空字串。
 */
export async function extractPdfText(file: File): Promise<string> {
  if (!isPdfFile(file)) return '';

  try {
    const buffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    const pageCount = Math.min(pdf.numPages, MAX_PAGES);
    const pageTexts: string[] = [];

    for (let i = 1; i <= pageCount; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' ');
      if (pageText.trim()) pageTexts.push(pageText);
    }

    return pageTexts.join('\n');
  } catch (error) {
    console.error('PDF 文字擷取失敗：', error);
    return '';
  }
}
