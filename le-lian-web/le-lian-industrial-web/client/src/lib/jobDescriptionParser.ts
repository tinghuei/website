// 工作說明書文字擷取與欄位辨識工具
// 供「職能落差分析」頁面的「上傳工作職能書」功能使用：
// 從 PDF / TXT 檔案擷取文字內容，辨識「所屬單位」「職位」「工作摘要」
// 及「本職位之工作職能及相關技能要求」（專業能力／教育訓練需求）等欄位。

import { extractPdfText } from './pdfTextExtractor';

export interface ParsedJobDescription {
  department: string | null;
  positionTitle: string | null;
  jobSummary: string | null;
  professionalSkills: string[];
  trainingNeeds: string[];
}

function isTextFile(file: File): boolean {
  return file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt');
}

/** 擷取上傳檔案的純文字內容（支援 PDF、TXT；其他格式回傳空字串）。 */
export async function extractFileText(file: File): Promise<string> {
  if (isTextFile(file)) {
    try {
      return await file.text();
    } catch {
      return '';
    }
  }
  return extractPdfText(file);
}

// PDF 文字擷取常將中文逐字拆成獨立片段並插入空白（例如「所 屬 單 位」），
// 將連續中文字之間的空白移除，還原成連續文字以利欄位比對。
function despaceChinese(text: string): string {
  let prev = text;
  let next = prev.replace(/([一-鿿])\s+(?=[一-鿿])/g, '$1');
  while (next !== prev) {
    prev = next;
    next = prev.replace(/([一-鿿])\s+(?=[一-鿿])/g, '$1');
  }
  return next;
}

function trimValue(value: string): string {
  return value.replace(/^[\s　]+|[\s　]+$/g, '');
}

// 從「標籤：內容」或「標籤 內容」格式中取出內容
function extractLabelValue(text: string, label: string): string | null {
  const re = new RegExp(`${label}[\\s:：]*([^\\s□■\\n]{1,12})`);
  const m = text.match(re);
  return m ? trimValue(m[1]) : null;
}

// 擷取「職位」欄位中以「■」勾選的選項文字（介於「職位」與「工作摘要」之間）
function extractCheckedPosition(text: string): string | null {
  const section = text.match(/職\s*位([\s\S]*?)(?:工作摘要|工作地點|$)/);
  const scope = section ? section[1] : text;
  const checked = Array.from(scope.matchAll(/■\s*([一-鿿\/／]{1,16})/g)).map((m) => trimValue(m[1]));
  return checked.length ? checked.join('、') : null;
}

// 擷取「五、本職位之工作職能及相關技能要求」表格中，指定列（如「專業能力」「教育訓練需求」）的項目清單
function extractListSection(text: string, label: string, nextLabels: string[]): string[] {
  const nextPattern = nextLabels.length ? `(?:${nextLabels.join('|')})` : '$';
  const re = new RegExp(`${label}[\\s\\S]{0,400}?(?=${nextPattern})`);
  const m = text.match(re) ?? (nextLabels.length ? null : text.match(new RegExp(`${label}[\\s\\S]{0,400}`)));
  if (!m) return [];
  const segment = m[0];
  // 逐項擷取「1. xxx」「2. xxx」格式的項目名稱
  return Array.from(segment.matchAll(/\d+[.、]\s*([^\d]+?)(?=\s*\d+[.、]|$)/g))
    .map((mm) => trimValue(mm[1]))
    .filter((s) => s.length > 0 && s.length < 30 && !new RegExp(label).test(s));
}

/** 解析工作說明書文字內容，辨識所屬單位、職位、工作摘要與職能技能要求。 */
export function parseJobDescriptionText(text: string): ParsedJobDescription {
  const normalized = despaceChinese(text);

  return {
    department: extractLabelValue(normalized, '所屬單位'),
    jobSummary: extractLabelValue(normalized, '工作摘要'),
    positionTitle: extractCheckedPosition(normalized),
    professionalSkills: extractListSection(normalized, '專業能力', ['教育訓練需求']),
    trainingNeeds: extractListSection(normalized, '教育訓練需求', []),
  };
}
