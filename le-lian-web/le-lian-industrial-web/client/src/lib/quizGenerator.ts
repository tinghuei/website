// AI 測驗草稿生成器
// 依課程類別與描述，產生「待人工確認」的測驗題目草稿，協助講師/管理員快速建立測驗，
// 確認學員是否吸收課程內容。產生結果僅為草稿，發布前應由人工檢查並調整。

import type { QuizQuestion } from '../data/trainingMockData';

interface QuizTemplate {
  question: string; // 可包含 {title} 佔位字串，會替換為課程名稱
  options: string[];
  answerIndex: number;
}

const CATEGORY_QUIZ_BANK: Record<string, QuizTemplate[]> = {
  '安全衛生': [
    {
      question: '完成「{title}」課程後，若在作業現場發現潛在危害，應優先採取的行動是？',
      options: ['先完成手邊工作再處理', '立即排除或回報並標示警示，避免他人誤觸', '自行判斷風險不大可忽略', '等候下次安全會議再提出'],
      answerIndex: 1,
    },
    {
      question: '依「{title}」課程內容，個人防護具（PPE）的使用原則為？',
      options: ['視個人習慣決定是否佩戴', '依作業風險評估結果，全程正確佩戴規定之防護具', '僅在主管巡視時佩戴', '防護具損壞仍可繼續使用，待方便時再更換'],
      answerIndex: 1,
    },
    {
      question: '發生職業災害事故時，依「{title}」課程說明，應優先採取的步驟是？',
      options: ['先釐清責任歸屬', '立即急救、通報並保持現場以利後續調查', '私下協調避免影響紀錄', '等傷者自行就醫即可'],
      answerIndex: 1,
    },
  ],
  '法令規範課程': [
    {
      question: '依「{title}」課程說明，員工對於課程中提及之相關法規，應有的態度是？',
      options: ['只要不被發現違反也無妨', '理解規範內容並落實於日常工作中', '法規與自己工作無關可不理會', '由主管負責即可，員工不需了解'],
      answerIndex: 1,
    },
    {
      question: '若對「{title}」課程所涉及之法規有疑問，正確做法是？',
      options: ['自行猜測後執行', '透過人資或相關權責單位確認後再執行', '詢問同事的個人看法並直接採用', '忽略不處理'],
      answerIndex: 1,
    },
  ],
  '職能發展課程': [
    {
      question: '完成「{title}」課程後，將所學應用於工作的較佳方式是？',
      options: ['僅作為知識儲備，不需實際應用', '結合實際工作情境，逐步練習並請教主管回饋', '等公司要求才開始嘗試', '與課程內容無關，可直接忽略'],
      answerIndex: 1,
    },
    {
      question: '依「{title}」課程內容，持續提升個人職能的關鍵是？',
      options: ['一次性學習即可終身受用', '定期複習、實作練習並尋求回饋持續精進', '只需取得證書，不需實際運用', '依賴他人完成即可'],
      answerIndex: 1,
    },
  ],
  '管理發展課程': [
    {
      question: '身為主管，完成「{title}」課程後，面對部屬績效不如預期時，較適當的做法是？',
      options: ['直接給予負面評價並要求改善', '了解原因、提供具體輔導與資源並設定改善目標', '忽略問題，等待自然改善', '直接調整職務但不予溝通'],
      answerIndex: 1,
    },
    {
      question: '依「{title}」課程內容，建立有效的團隊溝通應該？',
      options: ['僅透過書面公告單向傳達', '建立雙向溝通管道，主動了解部屬意見並適時回饋', '僅在績效考核時溝通一次', '由主管全權決定，不需討論'],
      answerIndex: 1,
    },
  ],
  '生產管理': [
    {
      question: '依「{title}」課程內容，當生產線發現異常時，標準做法是？',
      options: ['先持續生產，下班再處理', '立即停線確認原因，並依標準程序處理及記錄', '自行調整參數，不必通報', '交由下一班處理即可'],
      answerIndex: 1,
    },
    {
      question: '「{title}」課程中提到，生產排程調整應綜合考量的因素包含？',
      options: ['僅考量交期，不需考慮產能與品質', '交期、產能、物料與品質要求等多項因素', '依個人經驗隨意安排', '由業務單位單方面決定即可'],
      answerIndex: 1,
    },
  ],
  '品質管理': [
    {
      question: '依「{title}」課程內容，發現產品品質異常時的正確處理流程為？',
      options: ['自行判斷在可接受範圍內即放行', '立即標示隔離、記錄並依品質異常處理程序通報', '丟棄處理不留記錄', '交由客戶自行檢驗'],
      answerIndex: 1,
    },
    {
      question: '「{title}」課程提到，品質紀錄與文件管理的重要性在於？',
      options: ['僅為應付稽核之用', '可追溯問題原因、確保產品一致性並符合法規要求', '增加作業負擔，能省則省', '與產品品質無直接關係'],
      answerIndex: 1,
    },
  ],
  '職場技能': [
    {
      question: '依「{title}」課程內容，與同事意見不一致時，較合適的處理方式是？',
      options: ['堅持己見不退讓', '理性表達想法，傾聽對方意見並尋求共識', '直接向主管投訴對方', '不再與對方溝通'],
      answerIndex: 1,
    },
    {
      question: '「{title}」課程中提到，有效的時間管理應該？',
      options: ['同時處理所有任務以節省時間', '依重要性與緊急程度排序，並預留緩衝時間', '完全依照他人指示安排', '不需規劃，臨時應對即可'],
      answerIndex: 1,
    },
  ],
  '行政職能課程': [
    {
      question: '依「{title}」課程內容，處理行政文件時應注意？',
      options: ['速度優先，正確性其次', '確認內容正確、依規定流程辦理並妥善留存紀錄', '可省略簽核流程以加快進度', '文件內容可事後再補齊'],
      answerIndex: 1,
    },
    {
      question: '「{title}」課程說明，遇到跨部門協辦事項應如何處理？',
      options: ['各自處理不需溝通協調', '主動聯繫相關單位確認權責與時程，共同完成', '等對方主動聯繫才回應', '直接呈報高層裁示即可'],
      answerIndex: 1,
    },
  ],
};

const GENERIC_QUIZ_BANK: QuizTemplate[] = [
  {
    question: '若對「{title}」課程內容有不理解之處，建議的做法是？',
    options: ['直接跳過該部分', '於討論區提出問題或請教講師/主管', '自行猜測答案', '等測驗時再思考'],
    answerIndex: 1,
  },
  {
    question: '完成「{title}」課程的測驗後，若分數未達及格標準，應該？',
    options: ['不需理會，視為已完成', '重新複習課程內容並再次測驗，以達學習目標', '請他人代為作答', '向主管反映測驗不公'],
    answerIndex: 1,
  },
];

/** 取課程描述的第一句，做為「課程主旨」題目的正確選項 */
function buildDescriptionQuestion(course: { title: string; description?: string }): QuizTemplate | null {
  const desc = course.description?.trim();
  if (!desc) return null;
  const firstSentence = desc.split(/[。！？]/)[0]?.trim();
  if (!firstSentence) return null;
  return {
    question: `關於「${course.title}」課程的主旨，下列描述最符合的是？`,
    options: [
      firstSentence + '。',
      '本課程內容與目前職務完全無關，可不必參加',
      '本課程僅為娛樂性質，無需通過測驗',
      '本課程內容由學員自行決定是否學習',
    ],
    answerIndex: 0,
  };
}

/**
 * 依課程類別、標題與描述產生測驗題目草稿。
 * 注意：產生結果僅根據課程類別、名稱與「課程描述」文字組合而成的固定範本，
 * 並未讀取影片或教材檔案內容；產生結果為 AI 草稿，請人工確認題目與正確答案是否合適後再發布。
 *
 * @param existing 已存在的題目，用於避免重複產生相同題目（題庫範本有限，重複呼叫時會略過已產生過的題目）
 */
export function generateDraftQuiz(
  course: { title: string; category: string; description?: string },
  count = 5,
  existing: QuizQuestion[] = []
): QuizQuestion[] {
  const fill = (s: string) => s.replace(/\{title\}/g, course.title);
  const existingTexts = new Set(existing.map((q) => q.question));

  const templates: QuizTemplate[] = [];
  const descQ = buildDescriptionQuestion(course);
  if (descQ) templates.push(descQ);
  templates.push(...(CATEGORY_QUIZ_BANK[course.category] || []));
  templates.push(...GENERIC_QUIZ_BANK);

  const freshTemplates = templates.filter((t) => !existingTexts.has(fill(t.question)));

  return freshTemplates.slice(0, count).map((t, i) => ({
    id: `aiq${Date.now()}_${i}`,
    question: fill(t.question),
    options: [...t.options],
    answerIndex: t.answerIndex,
  }));
}
