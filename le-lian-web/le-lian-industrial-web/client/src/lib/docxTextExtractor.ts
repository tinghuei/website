// DOCX 文字擷取工具
// 使用 mammoth 在瀏覽器端解析 DOCX 檔案，擷取純文字內容供工作說明書欄位辨識使用。

import * as mammoth from 'mammoth';

function isDocxFile(file: File): boolean {
  return file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    || file.name.toLowerCase().endsWith('.docx');
}

/** 擷取 DOCX 檔案的純文字內容，失敗或非 DOCX 檔案則回傳空字串。 */
export async function extractDocxText(file: File): Promise<string> {
  if (!isDocxFile(file)) return '';

  try {
    const buffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    return result.value;
  } catch (error) {
    console.error('DOCX 文字擷取失敗：', error);
    return '';
  }
}
