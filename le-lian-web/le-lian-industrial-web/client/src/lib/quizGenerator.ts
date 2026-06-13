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
  '核心提升課程': [
    {
      question: '「{title}」屬於核心職能提升課程，完成後對個人發展的主要幫助是？',
      options: ['增強跨職務通用的基礎職能，提升整體工作表現與適應力', '僅對特定職務有用，與個人整體發展無關', '完成後即不需再參加任何訓練', '主要目的為取得學分，內容不需深入理解'],
      answerIndex: 0,
    },
    {
      question: '依「{title}」課程內容，運用所學提升個人核心職能的有效方式是？',
      options: ['反覆練習並結合實際案例檢視自己的應用情況', '僅閱讀講義一次即足夠', '等主管指派任務時才開始學習', '與工作內容無關，不需應用'],
      answerIndex: 0,
    },
    {
      question: '「{title}」課程提到，核心職能的提升應該是？',
      options: ['一次性活動，完成課程即代表具備該職能', '持續性的過程，需透過學習、實踐與回饋不斷精進', '僅限新進員工需要', '由公司決定即可，個人不需主動參與'],
      answerIndex: 1,
    },
  ],
  '專業領域課程': [
    {
      question: '「{title}」為專業領域課程，學習時應特別注意？',
      options: ['理解專業知識背後的原理，並確認如何應用於實際職務中', '僅需記憶專業術語，不需理解原理', '與日常工作無關，純粹增加學歷', '內容過於專業，可直接跳過'],
      answerIndex: 0,
    },
    {
      question: '依「{title}」課程內容，遇到專業知識與實務操作有差異時，應如何處理？',
      options: ['依過去習慣操作，不需理會新知識', '進一步確認原因，必要時請教專業人員或主管釐清正確做法', '自行判斷哪個方便就採用哪個', '向他人隱瞞差異，避免被認為能力不足'],
      answerIndex: 1,
    },
    {
      question: '「{title}」課程說明，專業領域知識的更新應該？',
      options: ['定期關注產業新知與法規/技術變化，持續更新專業能力', '取得證照後即不需再更新知識', '由公司統一安排，個人不需主動關注', '僅在發生問題後才補充相關知識'],
      answerIndex: 0,
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
  {
    question: '完成「{title}」課程後，建議的學習延伸做法是？',
    options: ['課程結束即代表學習完成，不需再複習', '將課程重點記錄下來，並於日常工作中持續應用與複習', '僅記住測驗會考的內容即可', '等公司強制要求才再次學習'],
    answerIndex: 1,
  },
  {
    question: '「{title}」課程中提到，與其他部門合作時，較適當的做法是？',
    options: ['各部門僅關注自身績效，不需配合他部門', '主動了解相關部門的需求與限制，建立互信協作關係', '遇到分工不明確時，互相推諉責任', '僅依書面公文往來，避免直接溝通'],
    answerIndex: 1,
  },
  {
    question: '依「{title}」課程內容，發現工作流程有改善空間時，應該？',
    options: ['提出改善建議並與相關人員討論可行性，逐步落實', '認為現狀已經足夠，不需改變', '自行更改流程，不需告知他人', '等他人提出後再跟進即可'],
    answerIndex: 0,
  },
  {
    question: '「{title}」課程提到，工作過程中相關紀錄與文件應如何處理？',
    options: ['依規定格式如實填寫並妥善保存，以利日後查核與追蹤', '為節省時間可省略部分紀錄', '紀錄內容可事後憑記憶補寫', '紀錄僅供個人參考，不需留存'],
    answerIndex: 0,
  },
  {
    question: '依「{title}」課程內容，處理同事或客戶的個人資料時，應注意？',
    options: ['僅在工作所需範圍內使用，並妥善保密、避免外洩', '可自由分享給其他同事參考', '為方便記憶可記錄在私人筆記本上', '離職時可一併攜走作為個人資料'],
    answerIndex: 0,
  },
  {
    question: '「{title}」課程中強調，員工於職場上應秉持的基本態度是？',
    options: ['只要不被發現，違反規定也無妨', '誠實守信，依公司規範與職業道德執行工作', '以個人利益優先於公司與團隊', '對於不合理指示一律照做，不需反映'],
    answerIndex: 1,
  },
  {
    question: '依「{title}」課程內容，面對多項待辦工作時，建議的處理方式是？',
    options: ['依任務的重要性與緊急程度排定優先順序，並適時與主管溝通', '依個人喜好決定處理順序', '全部同時處理，不分先後', '留到期限前一天再一次處理'],
    answerIndex: 0,
  },
  {
    question: '「{title}」課程說明，工作中發現異常狀況時，正確的處理態度是？',
    options: ['先觀察一段時間，確定問題嚴重才回報', '即時依規定程序回報並記錄，避免影響擴大', '自行處理完畢即可，不需讓他人知道', '等例行會議時再一併提出'],
    answerIndex: 1,
  },
  {
    question: '完成「{title}」課程後，下列哪一種做法最能將所學轉化為實際效益？',
    options: ['將課程內容應用於實際工作情境，並與主管或同事討論執行成效', '將上課講義收藏，待需要時再翻閱', '僅口頭轉述給同事，自己不需練習', '等下次同樣課程開課時再學一次'],
    answerIndex: 0,
  },
  {
    question: '依「{title}」課程內容，員工規劃個人職能發展時，應該？',
    options: ['依職務需求與自身落差，訂定具體可行的學習計畫並逐步執行', '僅依公司安排，自己不需規劃', '等績效考核出現問題才開始準備', '學習計畫訂定後不需檢討調整'],
    answerIndex: 0,
  },
  {
    question: '「{title}」課程中提到，團隊合作的核心精神是？',
    options: ['各自完成自己份內工作即可，不需關心團隊整體目標', '互相支援、共同承擔責任，以達成團隊共同目標', '競爭優於合作，個人表現最重要', '團隊成員意見不需被尊重，由少數人決定即可'],
    answerIndex: 1,
  },
  {
    question: '依「{title}」課程內容，面對內部或外部客戶的需求與抱怨時，應該？',
    options: ['積極傾聽、確認問題並依流程妥善處理及回覆', '認為與自己部門無關即可不予理會', '先強調公司立場，避免承擔責任', '拖延回覆，等對方放棄追問'],
    answerIndex: 0,
  },
  {
    question: '「{title}」課程中提到，落實環境保護與節能減碳，員工可從哪方面做起？',
    options: ['養成隨手關閉不需使用的設備、做好資源分類與節約使用習慣', '環保是公司政策部門的責任，與個人無關', '只要產量達標，資源使用不需在意', '等設備老舊損壞才考慮更換為節能設備'],
    answerIndex: 0,
  },
  {
    question: '依「{title}」課程內容，使用公司資訊系統與設備時，應注意？',
    options: ['帳號密碼可與同事共用以方便作業', '妥善保管帳號密碼，不外洩公司機密資料，並依規定使用系統', '下載來源不明的檔案或程式無妨，只要方便就好', '離開座位時設備可不需上鎖或登出'],
    answerIndex: 1,
  },
  {
    question: '「{title}」課程強調，在多元化的職場環境中，員工應秉持的態度是？',
    options: ['尊重不同背景、文化與意見的同事，營造友善包容的工作氛圍', '僅與相似背景的同事互動即可', '對不同意見一律否定，堅持己見', '將個人偏好強加於團隊決策上'],
    answerIndex: 0,
  },
  {
    question: '依「{title}」課程內容，當公司推動新制度或流程改變時，員工適當的態度是？',
    options: ['一律抗拒改變，維持原有做法', '保持開放心態，了解改變原因並配合調整、提出建設性意見', '表面配合，實際上仍依舊方式執行', '等其他同事都改變後自己再考慮'],
    answerIndex: 1,
  },
  {
    question: '「{title}」課程說明，執行標準作業程序（SOP）時應注意？',
    options: ['依規定步驟執行，如發現SOP與實際不符應回報並建議修訂，不可自行省略步驟', 'SOP僅供參考，實際操作可依個人經驗調整', '資深員工不需遵循SOP', 'SOP內容一旦制定即不可修改'],
    answerIndex: 0,
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

/** 與課程教材內容明顯無關的敘述，作為「是非題」的錯誤選項來源 */
const FALSE_STATEMENT_POOL: string[] = [
  '本課程內容與公司業務完全無關，員工不需要學習',
  '完成本課程後即可永久免除所有相關安全衛生責任',
  '本課程教材內容由學員自行編寫，公司不負責審核',
  '本課程測驗成績不會影響任何訓練紀錄或證書發放',
  '本課程教材表示員工可自行決定是否遵守公司規範',
  '本課程教材內容主張公司各項作業流程永遠不需要改善',
  '本課程教材說明設備或工具發生異常時不需要回報',
  '本課程教材表示個人資料可任意提供給無關第三方使用',
  '本課程教材建議員工遇到問題時應隱瞞不報，不需處理',
  '本課程教材說明品質紀錄與文件可依個人喜好隨意修改',
  '本課程教材主張團隊合作並非職場中重要的能力',
  '本課程僅為娛樂性質，內容真偽不需確認',
];

/**
 * 將文字切分為適合出題的「關鍵句」清單：依換行與標點切句，
 * 過濾過短/過長及不含中文字的片段，並去除重複。
 */
export function extractKeySentences(text: string, max = 12): string[] {
  if (!text) return [];

  const seen = new Set<string>();
  const sentences: string[] = [];
  for (const raw of text.split(/[\n\r。！？;；]+/)) {
    const s = raw.trim();
    if (s.length < 6 || s.length > 60) continue;
    if (!/[一-鿿]/.test(s)) continue;
    if (seen.has(s)) continue;
    seen.add(s);
    sentences.push(s);
    if (sentences.length >= max) break;
  }
  return sentences;
}

/**
 * 依課程教材（PDF）擷取出的文字內容，產生「是非題」測驗草稿。
 * 奇數題使用教材中實際出現的句子（答案為「正確」），偶數題使用與教材內容無關的敘述
 * （答案為「錯誤」），用於檢驗學員是否確實閱讀教材內容。產生結果仍為 AI 草稿，請人工確認後再發布。
 *
 * @param existing 已存在的題目，用於避免重複產生相同題目
 */
export function generateContentQuiz(
  course: { title: string },
  materialText: string,
  count: number,
  existing: QuizQuestion[] = []
): QuizQuestion[] {
  const sentences = extractKeySentences(materialText, count * 2);
  if (sentences.length === 0) return [];

  const existingTexts = new Set(existing.map((q) => q.question));
  const options = ['正確，教材中有此描述', '錯誤，教材中並無此描述'];

  const drafts: QuizQuestion[] = [];
  let falseIdx = 0;

  for (let i = 0; i < sentences.length && drafts.length < count; i++) {
    let statement: string;
    let answerIndex: number;
    if (i % 2 === 0) {
      statement = sentences[i];
      answerIndex = 0;
    } else {
      statement = FALSE_STATEMENT_POOL[falseIdx % FALSE_STATEMENT_POOL.length];
      falseIdx++;
      answerIndex = 1;
    }

    const question = `依「${course.title}」課程教材內容，下列敘述是否正確：「${statement}」？`;
    if (existingTexts.has(question)) continue;
    existingTexts.add(question);

    drafts.push({
      id: `aiq${Date.now()}_c${drafts.length}`,
      question,
      options: [...options],
      answerIndex,
    });
  }

  return drafts;
}
