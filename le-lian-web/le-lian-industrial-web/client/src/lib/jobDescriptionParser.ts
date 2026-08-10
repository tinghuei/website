// 工作說明書文字擷取與欄位辨識工具
// 供「職能落差分析」頁面的「上傳工作職能書」功能使用：
// 從 PDF / DOCX / TXT 檔案擷取文字內容，辨識「所屬單位」「職位」「工作摘要」
// 及「本職位之工作職能及相關技能要求」（專業能力／教育訓練需求）等欄位。

import { extractPdfText } from './pdfTextExtractor';
import { extractDocxText } from './docxTextExtractor';

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

function isDocxFile(file: File): boolean {
  return file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    || file.name.toLowerCase().endsWith('.docx');
}

/** 擷取上傳檔案的純文字內容（支援 PDF、DOCX、TXT；其他格式回傳空字串）。 */
export async function extractFileText(file: File): Promise<string> {
  if (isTextFile(file)) {
    try {
      return await file.text();
    } catch {
      return '';
    }
  }
  if (isDocxFile(file)) {
    return extractDocxText(file);
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

// 常見「專業能力」區塊的各種標題用法（依比對優先序排列）
const SKILL_LABELS = [
  '專業能力',
  '本職位之工作職能及相關技能要求',
  '工作職能及相關技能要求',
  '工作職能',
  '職能要求',
  '技能要求',
  '專業技能',
  '核心職能',
  '職能及技能',
  '工作技能',
];

// 常見「教育訓練需求」區塊的各種標題用法
const TRAINING_LABELS = [
  '教育訓練需求',
  '訓練需求',
  '教育訓練',
  '培訓需求',
];

// 擷取工作說明書中指定區段的項目清單；支援多種編號與條列格式
function extractListSection(text: string, label: string, stopLabels: string[]): string[] {
  const stopPattern = stopLabels.length ? `(?:${stopLabels.join('|')})` : null;
  const re = stopPattern
    ? new RegExp(`${label}[\\s\\S]{0,1200}?(?=${stopPattern})`)
    : new RegExp(`${label}[\\s\\S]{0,1200}`);
  const m = text.match(re);
  if (!m) return [];
  const segment = m[0];
  // 支援多種編號格式：「1. xxx」「1、xxx」「（一）xxx」「• xxx」「- xxx」「□ xxx」
  const numericItems = Array.from(segment.matchAll(/\d+[.、)）]\s*([^\n\d]{2,60})/g))
    .map((mm) => trimValue(mm[1]));
  const chineseItems = Array.from(segment.matchAll(/[（(][一二三四五六七八九十百][)）]\s*([^\n]{2,60})/g))
    .map((mm) => trimValue(mm[1]));
  const bulletItems = Array.from(segment.matchAll(/(?:^|[\n\r])\s*[•·▪▸\-\*＊□■◆]\s+([^\n]{2,60})/gm))
    .map((mm) => trimValue(mm[1]));
  const all = [...numericItems, ...chineseItems, ...bulletItems];
  const seen = new Set<string>();
  return all.filter((s) => {
    if (s.length < 2 || s.length > 60 || new RegExp(label).test(s)) return false;
    if (seen.has(s)) return false;
    seen.add(s);
    return true;
  });
}

// 依優先序逐一嘗試各種標籤，回傳第一個成功擷取到項目的結果
function extractListSectionMulti(text: string, labels: string[], stopLabels: string[]): string[] {
  for (const label of labels) {
    const items = extractListSection(text, label, stopLabels);
    if (items.length > 0) return items;
  }
  return [];
}

/** 解析工作說明書文字內容，辨識所屬單位、職位、工作摘要與職能技能要求。 */
export function parseJobDescriptionText(text: string): ParsedJobDescription {
  const normalized = despaceChinese(text);
  const allStopLabels = [...SKILL_LABELS, ...TRAINING_LABELS];

  return {
    department: extractLabelValue(normalized, '所屬單位'),
    jobSummary: extractLabelValue(normalized, '工作摘要'),
    positionTitle: extractCheckedPosition(normalized),
    professionalSkills: extractListSectionMulti(normalized, SKILL_LABELS, TRAINING_LABELS),
    trainingNeeds: extractListSectionMulti(normalized, TRAINING_LABELS, allStopLabels.filter((l) => !TRAINING_LABELS.includes(l))),
  };
}
