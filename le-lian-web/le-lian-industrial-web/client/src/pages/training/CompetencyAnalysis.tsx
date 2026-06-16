import { useState, useRef, useMemo, useEffect } from 'react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { Target, ChevronDown, CheckCircle, AlertCircle, XCircle, RefreshCw, Upload, FileText, Sparkles, X, ArrowRight, Users } from 'lucide-react';
import { useTrainingAuth } from '../../context/TrainingAuthContext';
import { DETAILED_COMPETENCY_FRAMEWORK, type PositionData, type CompetencyCategory } from '../../data/competencyFramework';
import { extractFileText, parseJobDescriptionText, type ParsedJobDescription } from '../../lib/jobDescriptionParser';
import { loadOverrides, saveOverrides, type PositionCompetencyOverride } from '../../lib/competencyOverrides';
import { loadEmployeeJDs, saveEmployeeJDs, type EmployeeJDRecord } from '../../lib/employeeJobDescriptions';

// ── Types ──────────────────────────────────────────────────────────────────────
// 職能分數以「職能類別 id」為鍵（例如 cm-1, cm-2...），各職位的類別數量與名稱皆不同（約 2～6 項）
type CompetencyScores = Record<string, number>;

interface DimensionMeta {
  id: string;
  label: string;
  course: string;
}

// ── 職位／部門資料（依共用職能框架取得，共 38 個職位） ───────────────────────────
const POSITION_NAMES = Object.keys(DETAILED_COMPETENCY_FRAMEWORK);

const POSITIONS_BY_DEPT: Record<string, string[]> = {};
POSITION_NAMES.forEach((name) => {
  const dept = DETAILED_COMPETENCY_FRAMEWORK[name].category;
  (POSITIONS_BY_DEPT[dept] ??= []).push(name);
});
const DEPARTMENTS = Object.keys(POSITIONS_BY_DEPT);

// 依職能類別名稱，對應建議進修的課程分類（與課程庫課程分類一致）
function recommendCourseCategory(categoryName: string): string {
  if (/安全|衛生|危害|防護/.test(categoryName)) return '安全衛生';
  if (/品質|品檢/.test(categoryName)) return '品質管理';
  if (/生產|製程|機械設備操作|物料|倉庫|物流|採購|計畫與協調|生產計畫/.test(categoryName)) return '生產管理';
  if (/領導與管理|領導與管理能力|成本控制|人力資源|行政管理|管理能力|財務|預算|會計|法令|法規|公司法|專案|目標管理|績效管理/.test(categoryName)) return '管理發展課程';
  if (/溝通|協調|客戶|業務|銷售|市場/.test(categoryName)) return '職場技能';
  if (/技術|創新|研發|文檔|設備管理|廠房|改善/.test(categoryName)) return '職能發展課程';
  if (/庶務|清潔|文件管理|行政協助|行政執行/.test(categoryName)) return '行政職能課程';
  return '職能發展課程';
}

// ── 分數計算工具 ─────────────────────────────────────────────────────────────────
function randomScore(min = 50, max = 85) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildInitialScores(position: PositionData): CompetencyScores {
  const scores: CompetencyScores = {};
  position.competencies.forEach((c) => { scores[c.id] = randomScore(); });
  return scores;
}

// 依職位「要求等級」（0-5）換算為 0-100 的職能標準分數
function buildStandardScores(position: PositionData): CompetencyScores {
  const target = Math.min(100, position.requiredLevel * 20);
  const scores: CompetencyScores = {};
  position.competencies.forEach((c) => { scores[c.id] = target; });
  return scores;
}

// 模擬主管評估分數（於標準值附近隨機波動）
function buildManagerScores(position: PositionData): CompetencyScores {
  const target = Math.min(100, position.requiredLevel * 20);
  const scores: CompetencyScores = {};
  position.competencies.forEach((c) => {
    scores[c.id] = Math.min(100, Math.max(30, target + Math.round((Math.random() - 0.4) * 20)));
  });
  return scores;
}

function getDimensions(position: PositionData): DimensionMeta[] {
  return position.competencies.map((c) => ({
    id: c.id,
    label: c.category,
    course: recommendCourseCategory(c.category),
  }));
}

// ── AI 辨識結果型別 ────────────────────────────────────────────────────────────
// source: 'content' 表示已從文件內容辨識出工作說明書欄位；'filename' 表示僅能依檔名推測職位（備援方案）
interface RecognizedDoc {
  fileName: string;
  positionName: string;
  source: 'content' | 'filename';
  department: string | null;
  jobSummary: string | null;
  professionalSkills: string[];
  trainingNeeds: string[];
  description: string;
  extractedItems: string[];
}

// 依職位的職能評分標準覆寫資料，計算「有效」職位資料：若該職位已有自訂覆寫，以覆寫的職能類別取代框架預設值
function getEffectivePosition(name: string, overridesMap: Record<string, PositionCompetencyOverride>): PositionData {
  const base = DETAILED_COMPETENCY_FRAMEWORK[name];
  const override = overridesMap[name];
  return override ? { ...base, competencies: override.competencies } : base;
}

// 依檔名長度由長到短比對職位名稱，避免「組長」誤判蓋掉「副組長」等較長的職位名稱
const POSITION_NAMES_BY_LENGTH = [...POSITION_NAMES].sort((a, b) => b.length - a.length);

// 常見職稱關鍵字 → 對應職位（當檔名/職位欄未直接包含完整職位名稱、且無法依部門比對時的最終備援）
const POSITION_ALIASES: Record<string, string> = {
  '操作員': '技術員',
  '作業員': '技術員',
  '現場員工': '技術員',
  '線上作業員': '技術員',
  '經理': '廠務經理',
  '副理': '廠務副理',
  '工程師': '設備工程師',
  '課長': '製造課長',
  '副課長': '製造副課長',
  '專員': '業務專員',
  '助理': '總務助理',
  '秘書': '總經理室秘書',
};

// 工作說明書「所屬單位」常見填寫方式 → 對應職能框架部門類別（POSITIONS_BY_DEPT 的鍵）。
// 用於將「所屬單位」與「職位」勾選欄組合比對到該部門下最相符的職位，
// 避免不同部門相同的職稱（如「專員」「助理」「課長」）被誤套用到固定的單一職位。
const DEPARTMENT_TO_CATEGORY: Record<string, string> = {
  '總經理室': '營運部',
  '文管': '營運部',
  '營運部': '營運部',
  '營業部': '營業部',
  '業務課': '業務部',
  '業務部': '業務部',
  '研發課': '研發部',
  '研發部': '研發部',
  '品保課': '品質部',
  '品保部': '品質部',
  '品管': '品質部',
  '品質部': '品質部',
  '管理部': '總務部',
  '總務課': '總務部',
  '總務部': '總務部',
  '人資': '總務部',
  '庶務': '總務部',
  '資材課': '資材部',
  '資材部': '資材部',
  '採購': '資材部',
  '物管': '資材部',
  '成倉': '資材部',
  '製造課': '製造部',
  '製造部': '製造部',
  '生管': '製造部',
  '沖床': '製造部',
  '加工': '製造部',
  '塗裝': '製造部',
  '組一': '製造部',
  '組二': '製造部',
  '組三': '製造部',
  '廠務室': '廠務部',
  '廠務部': '廠務部',
};

// 依「所屬單位」文字比對對應的職能框架部門類別
function matchDepartmentCategory(department: string): string | null {
  for (const [key, category] of Object.entries(DEPARTMENT_TO_CATEGORY)) {
    if (department.includes(key)) return category;
  }
  return null;
}

// 在候選職位名稱中，找出以指定職稱（title）為字尾的職位。
// 若有多個符合（例如「課長」同時符合「資材課長」與「資材副課長」），
// 優先選擇移除字尾後前綴不以「副」「代理」結尾者，避免一般職稱被誤判為較高層級的職位。
function chooseBySuffix(candidates: string[], title: string): string | null {
  const matches = candidates.filter((name) => name.endsWith(title));
  if (matches.length <= 1) return matches[0] ?? null;
  if (/^[副代]/.test(title)) return matches[0];
  const primary = matches.filter((name) => !/[副代]$/.test(name.slice(0, name.length - title.length)));
  return primary[0] ?? matches[0];
}

function detectPosition(fileName: string): string {
  const normalized = normalizeVariantChars(fileName);
  for (const name of POSITION_NAMES_BY_LENGTH) {
    if (normalized.includes(name)) return name;
  }
  for (const [kw, name] of Object.entries(POSITION_ALIASES)) {
    if (normalized.includes(kw)) return name;
  }
  return '技術員';
}

// 統一異體字（例如「祕書」→「秘書」），避免因字形差異導致職位比對失敗
function normalizeVariantChars(text: string): string {
  return text.replace(/祕/g, '秘');
}

// 依工作說明書解析結果（所屬單位、職位勾選欄）比對對應的職位；無法比對時改用檔名推測
function matchPositionFromParsed(parsed: ParsedJobDescription, fileName: string): string {
  const title = parsed.positionTitle ? normalizeVariantChars(parsed.positionTitle) : '';
  const department = parsed.department ? normalizeVariantChars(parsed.department) : '';

  if (title) {
    // 1. 職位欄已包含完整職位名稱（例如勾選欄直接列出職位全名）
    for (const name of POSITION_NAMES_BY_LENGTH) {
      if (title.includes(name)) return name;
    }

    // 2. 依「所屬單位」對應的部門類別，於該部門候選職位中比對職稱字尾
    const deptCategory = matchDepartmentCategory(department);
    if (deptCategory) {
      const bySuffix = chooseBySuffix(POSITIONS_BY_DEPT[deptCategory] ?? [], title);
      if (bySuffix) return bySuffix;
    }

    // 3. 全體職位中比對職稱字尾（所屬單位未對應到部門類別，或該部門內無符合職稱者）
    const byAnySuffix = chooseBySuffix(POSITION_NAMES, title);
    if (byAnySuffix) return byAnySuffix;

    // 4. 常見職稱關鍵字對應表（最後備援）
    for (const [kw, name] of Object.entries(POSITION_ALIASES)) {
      if (title.includes(kw)) return name;
    }
  }

  return detectPosition(fileName);
}

// 內容辨識成功：依解析出的所屬單位／職位／職能與技能要求，比對職位並建立辨識結果
function buildRecognizedDocFromParsed(fileName: string, positionName: string, parsed: ParsedJobDescription): RecognizedDoc {
  const position = DETAILED_COMPETENCY_FRAMEWORK[positionName];
  const skillCount = parsed.professionalSkills.length + (parsed.trainingNeeds.length ? 1 : 0);

  const extractedItems: string[] = [];
  if (parsed.department) extractedItems.push(`🏢 所屬單位：${parsed.department}`);
  extractedItems.push(`📋 比對職位：${positionName}（${position.category}・${position.level}）`);
  if (parsed.jobSummary) extractedItems.push(`📝 工作摘要：${parsed.jobSummary}`);
  if (parsed.professionalSkills.length) extractedItems.push(`📌 專業能力要求：${parsed.professionalSkills.join('、')}`);
  if (parsed.trainingNeeds.length) extractedItems.push(`🎓 教育訓練需求：${parsed.trainingNeeds.join('、')}`);

  return {
    fileName,
    positionName,
    source: 'content',
    department: parsed.department,
    jobSummary: parsed.jobSummary,
    professionalSkills: parsed.professionalSkills,
    trainingNeeds: parsed.trainingNeeds,
    description: skillCount > 0
      ? `已從「${fileName}」內容辨識出工作說明書欄位，比對為【${positionName}】（${position.category}・${position.level}）。套用後將整合該職位現有的 ${position.competencies.length} 項 iCAP 職能類別，並依「本職位之工作職能及相關技能要求」新增 ${skillCount} 項專屬評分標準，共 ${position.competencies.length + skillCount} 項職能向度，僅影響此職位，不影響共用 iCAP 框架或其他職位。`
      : `已從「${fileName}」內容辨識出所屬單位與職位，比對為【${positionName}】（${position.category}・${position.level}），但未擷取到第五項「本職位之工作職能及相關技能要求」，套用後將沿用該職位現有的 iCAP 職能基準分數。`,
    extractedItems,
  };
}

// 內容辨識失敗（例如圖片掃描檔或非標準格式）時的備援方案：僅依檔名推測對應職位，並沿用框架現有的標準分數
function simulateRecognitionFromFileName(fileName: string): RecognizedDoc {
  const positionName = detectPosition(fileName);
  const position = DETAILED_COMPETENCY_FRAMEWORK[positionName];

  return {
    fileName,
    positionName,
    source: 'filename',
    department: null,
    jobSummary: null,
    professionalSkills: [],
    trainingNeeds: [],
    description: `未能從「${fileName}」內容中辨識出工作說明書欄位（可能為圖片掃描檔或非標準格式），已改依檔名推測對應職位為【${positionName}】（${position.category}・${position.level}），並沿用該職位現有的 ${position.competencies.length} 項 iCAP 職能向度標準分數，建議於下方確認或修正職位。`,
    extractedItems: [
      `📋 職位（依檔名推測）：${positionName}（${position.category}）`,
      `🏷️ 職級：${position.level}（要求等級 ${position.requiredLevel}/5）`,
      ...position.competencies.map((c) => `📌 ${c.category}：${c.items.map((i) => i.name).join('、')}`),
    ],
  };
}

// ── 職能缺口測驗 ───────────────────────────────────────────────────────────────
interface GapQuizQuestion {
  id: string;
  dimensionId: string;
  dimensionLabel: string;
  question: string;
  options: string[];
  answerIndex: number;
}

// 所有職位的職能項目（含所屬類別），作為測驗選項的干擾項來源
const ITEM_POOL: { categoryName: string; name: string; description: string }[] = Object.values(DETAILED_COMPETENCY_FRAMEWORK).flatMap((p) =>
  p.competencies.flatMap((c) => c.items.map((i) => ({ categoryName: c.category, name: i.name, description: i.description })))
);

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 依職能類別自動生成測驗題：以該類別職能項目的說明為正解，干擾項取自其他類別的職能項目說明
function buildCategoryQuestions(category: CompetencyCategory): GapQuizQuestion[] {
  const ownNames = new Set(category.items.map((i) => i.name));
  const distractorPool = ITEM_POOL.filter((i) => i.categoryName !== category.category && !ownNames.has(i.name));

  return category.items.map((item, idx) => {
    const distractors = shuffle(distractorPool.filter((d) => d.description !== item.description)).slice(0, 3);
    const optionItems = shuffle([
      { text: item.description, correct: true },
      ...distractors.map((d) => ({ text: d.description, correct: false })),
    ]);
    return {
      id: `${category.id}-${idx}`,
      dimensionId: category.id,
      dimensionLabel: category.category,
      question: `關於「${category.category}」職能中的「${item.name}」，其主要工作內容說明為下列何者？`,
      options: optionItems.map((o) => o.text),
      answerIndex: optionItems.findIndex((o) => o.correct),
    };
  });
}

// 依職能落差，從落差最大的職能向度自動生成測驗題
function generateGapQuiz(position: PositionData, selfScores: CompetencyScores, standards: CompetencyScores): GapQuizQuestion[] {
  const ranked = [...position.competencies].sort((a, b) => {
    const gapA = (standards[a.id] ?? 0) - (selfScores[a.id] ?? 0);
    const gapB = (standards[b.id] ?? 0) - (selfScores[b.id] ?? 0);
    return gapB - gapA;
  });

  const questions: GapQuizQuestion[] = [];
  for (const category of ranked) {
    const gap = (standards[category.id] ?? 0) - (selfScores[category.id] ?? 0);
    const qs = buildCategoryQuestions(category);
    const take = gap > 15 ? Math.min(2, qs.length) : Math.min(1, qs.length);
    questions.push(...qs.slice(0, take));
    if (questions.length >= 8) break;
    if (questions.length >= 4 && gap <= 0) break;
  }
  return questions.slice(0, 8);
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function CompetencyAnalysis() {
  const { currentUser } = useTrainingAuth();

  const [positionName, setPositionName] = useState<string>(POSITION_NAMES[0]);

  // 各職位的職能評分標準覆寫資料（依工作說明書辨識結果建立），以職位名稱為鍵獨立儲存於 localStorage
  const [overrides, setOverrides] = useState<Record<string, PositionCompetencyOverride>>(() => loadOverrides());
  useEffect(() => { saveOverrides(overrides); }, [overrides]);

  // 每位員工的工作說明書記錄（以員工姓名為鍵，持久化至 localStorage）
  const [employeeJDs, setEmployeeJDs] = useState<Record<string, EmployeeJDRecord>>(() => loadEmployeeJDs());
  useEffect(() => { saveEmployeeJDs(employeeJDs); }, [employeeJDs]);

  // 管理員／人資查看特定員工資料時，暫時覆寫職位職能標準（不影響職位共用的 overrides）
  const [viewingEmployeeName, setViewingEmployeeName] = useState<string | null>(null);
  const [empOverride, setEmpOverride] = useState<PositionCompetencyOverride | null>(null);

  const position = useMemo(() => {
    const base = DETAILED_COMPETENCY_FRAMEWORK[positionName];
    const over = empOverride ?? overrides[positionName];
    return over ? { ...base, competencies: over.competencies } : base;
  }, [positionName, overrides, empOverride]);
  const dimensions = useMemo(() => getDimensions(position), [position]);

  const [selfScores, setSelfScores] = useState<CompetencyScores>(() => buildInitialScores(position));
  const [managerScores, setManagerScores] = useState<CompetencyScores>(() => buildManagerScores(position));
  const [submitted, setSubmitted] = useState(false);
  const [showManager, setShowManager] = useState(false);
  const [targetDept, setTargetDept] = useState(DEPARTMENTS[0]);
  const [fitScore, setFitScore] = useState<number | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const standards = (empOverride ?? overrides[positionName])?.standards ?? buildStandardScores(position);

  // Competency gap quiz states
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<GapQuizQuestion[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // 切換職位：重置自評、主管評估、提交狀態與測驗，避免沿用舊職位的職能維度
  function handlePositionChange(name: string) {
    setEmpOverride(null);
    setViewingEmployeeName(null);
    const next = getEffectivePosition(name, overrides);
    setPositionName(name);
    setSelfScores(buildInitialScores(next));
    setManagerScores(buildManagerScores(next));
    setSubmitted(false);
    setShowManager(false);
    setFitScore(null);
    setQuizStarted(false);
    setQuizQuestions([]);
    setQuizAnswers({});
    setQuizSubmitted(false);
  }

  function startQuiz() {
    const qs = generateGapQuiz(position, selfScores, standards);
    setQuizQuestions(qs);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizStarted(true);
  }

  function submitQuiz() {
    setQuizSubmitted(true);
  }

  const quizScore = quizSubmitted
    ? Math.round((quizQuestions.filter((q) => quizAnswers[q.id] === q.answerIndex).length / quizQuestions.length) * 100)
    : 0;

  // Document upload states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docDragging, setDocDragging] = useState(false);
  const [docProcessing, setDocProcessing] = useState(false);
  const [docStep, setDocStep] = useState(0);
  const [docResult, setDocResult] = useState<RecognizedDoc | null>(null);
  const [docApplied, setDocApplied] = useState(false);
  const [correctedPositionName, setCorrectedPositionName] = useState<string>(POSITION_NAMES[0]);

  // Build radar data
  const radarData = dimensions.map(({ id, label }) => ({
    dimension: label,
    自評: selfScores[id] ?? 0,
    標準: standards[id] ?? 0,
    ...(showManager ? { 主管評估: managerScores[id] ?? 0 } : {}),
  }));

  // Gap analysis helpers
  function getGapColor(gap: number) {
    if (gap <= 0) return 'bg-green-100 border-green-300 text-green-800';
    if (gap <= 15) return 'bg-yellow-100 border-yellow-300 text-yellow-800';
    return 'bg-red-100 border-red-300 text-red-800';
  }
  function getGapIcon(gap: number) {
    if (gap <= 0) return <CheckCircle size={16} className="text-green-600" />;
    if (gap <= 15) return <AlertCircle size={16} className="text-yellow-600" />;
    return <XCircle size={16} className="text-red-600" />;
  }

  function handleSubmit() {
    setSubmitted(true);
    // Mock: manager has assessed this user
    setShowManager(true);
  }

  async function handleDocUpload(file: File) {
    setDocFile(file);
    setDocResult(null);
    setDocApplied(false);
    setDocProcessing(true);
    setDocStep(0);

    const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

    await wait(500);
    setDocStep(1);

    const text = await extractFileText(file);
    const parsed = parseJobDescriptionText(text);

    await wait(700);
    setDocStep(2);

    await wait(700);
    setDocStep(3);

    await wait(700);
    setDocStep(4);
    await wait(400);

    const hasParsedContent = !!(
      parsed.positionTitle || parsed.department || parsed.jobSummary ||
      parsed.professionalSkills.length > 0 || parsed.trainingNeeds.length > 0
    );
    const result = hasParsedContent
      ? buildRecognizedDocFromParsed(file.name, matchPositionFromParsed(parsed, file.name), parsed)
      : simulateRecognitionFromFileName(file.name);

    setDocResult(result);
    setCorrectedPositionName(result.positionName);
    setDocProcessing(false);
  }

  // 套用職能書辨識結果：依「本職位之工作職能及相關技能要求」建立該職位專屬的職能評分標準，
  // 以 overrides（按職位名稱獨立儲存）持久化，僅影響所選職位，不影響共用 iCAP 框架或其他職位
  function handleApplyDoc() {
    if (!docResult) return;
    const target = DETAILED_COMPETENCY_FRAMEWORK[correctedPositionName];

    let competencies: CompetencyCategory[];
    const standards: CompetencyScores = {};

    if (docResult.source === 'content' && docResult.professionalSkills.length > 0) {
      const supplementaryScore = Math.min(100, target.requiredLevel * 20 + 10);
      const supplementary: CompetencyCategory[] = docResult.professionalSkills.map((skill, i) => ({
        id: `doc-skill-${i + 1}`,
        category: skill,
        items: [{
          id: `doc-skill-${i + 1}-1`,
          name: skill,
          description: `${skill}：依工作說明書「${docResult.fileName}」列為本職位應具備之專業能力要求`,
        }],
      }));
      if (docResult.trainingNeeds.length > 0) {
        supplementary.push({
          id: 'doc-training',
          category: '教育訓練需求',
          items: docResult.trainingNeeds.map((need, i) => ({
            id: `doc-training-${i + 1}`,
            name: need,
            description: `${need}：依工作說明書「${docResult.fileName}」列為本職位之教育訓練需求`,
          })),
        });
      }

      // 整合該職位現有的 iCAP 職能類別（標準分數依要求等級），加上工作說明書專屬要求（標準分數略高 10 分）
      const base = buildStandardScores(target);
      competencies = [...target.competencies, ...supplementary];
      target.competencies.forEach((c) => { standards[c.id] = base[c.id]; });
      supplementary.forEach((c) => { standards[c.id] = supplementaryScore; });
    } else {
      const base = buildStandardScores(target);
      const vary = (v: number) => Math.min(100, Math.max(40, v + Math.round((Math.random() - 0.4) * 12)));
      competencies = target.competencies;
      competencies.forEach((c) => { standards[c.id] = vary(base[c.id]); });
    }

    const override: PositionCompetencyOverride = {
      department: docResult.department ?? '',
      jobSummary: docResult.jobSummary ?? '',
      competencies,
      standards,
      trainingNeeds: docResult.trainingNeeds,
      sourceFileName: docResult.fileName,
      updatedAt: new Date().toISOString(),
    };

    const nextOverrides = { ...overrides, [correctedPositionName]: override };
    setOverrides(nextOverrides);

    // 同步儲存至員工個人說明書記錄，供管理員／人資在「檔案庫」查閱
    if (currentUser) {
      const empRecord: EmployeeJDRecord = {
        employeeName: currentUser.name,
        userId: currentUser.id,
        positionName: correctedPositionName,
        department: override.department,
        jobSummary: override.jobSummary,
        professionalSkills: docResult.professionalSkills,
        trainingNeeds: override.trainingNeeds,
        competencies: override.competencies,
        standards: override.standards,
        sourceFileName: override.sourceFileName,
        uploadedAt: override.updatedAt,
      };
      setEmployeeJDs((prev) => ({ ...prev, [currentUser.name]: empRecord }));
    }
    setEmpOverride(null);
    setViewingEmployeeName(null);

    const nextPosition = getEffectivePosition(correctedPositionName, nextOverrides);
    setPositionName(correctedPositionName);
    setSelfScores(buildInitialScores(nextPosition));
    setManagerScores(buildManagerScores(nextPosition));
    setSubmitted(false);
    setShowManager(false);
    setFitScore(null);
    setQuizStarted(false);
    setQuizQuestions([]);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setDocApplied(true);
  }

  // 還原所選職位為共用 iCAP 職能基準（移除該職位的職能書自訂標準）
  function handleResetOverride() {
    const nextOverrides = { ...overrides };
    delete nextOverrides[positionName];
    setOverrides(nextOverrides);

    const nextPosition = getEffectivePosition(positionName, nextOverrides);
    setSelfScores(buildInitialScores(nextPosition));
    setManagerScores(buildManagerScores(nextPosition));
    setSubmitted(false);
    setShowManager(false);
    setFitScore(null);
    setQuizStarted(false);
    setQuizQuestions([]);
    setQuizAnswers({});
    setQuizSubmitted(false);
  }

  function handleClearDoc() {
    setDocFile(null);
    setDocResult(null);
    setDocApplied(false);
    setDocProcessing(false);
    setDocStep(0);
  }

  // 載入指定員工的說明書記錄：暫時套用其職能標準（不覆寫職位共用的 overrides）
  function handleLoadEmployee(employeeName: string) {
    const record = employeeJDs[employeeName];
    if (!record) return;
    const over: PositionCompetencyOverride = {
      department: record.department,
      jobSummary: record.jobSummary,
      competencies: record.competencies,
      standards: record.standards,
      trainingNeeds: record.trainingNeeds,
      sourceFileName: record.sourceFileName,
      updatedAt: record.uploadedAt,
    };
    setEmpOverride(over);
    setPositionName(record.positionName);
    setViewingEmployeeName(employeeName);
    const nextPos = { ...DETAILED_COMPETENCY_FRAMEWORK[record.positionName], competencies: over.competencies };
    setSelfScores(buildInitialScores(nextPos));
    setManagerScores(buildManagerScores(nextPos));
    setSubmitted(false);
    setShowManager(false);
    setFitScore(null);
    setQuizStarted(false);
    setQuizQuestions([]);
    setQuizAnswers({});
    setQuizSubmitted(false);
    handleClearDoc();
  }

  function handleDeleteEmployeeJD(employeeName: string) {
    setEmployeeJDs((prev) => {
      const next = { ...prev };
      delete next[employeeName];
      return next;
    });
    if (viewingEmployeeName === employeeName) {
      setEmpOverride(null);
      setViewingEmployeeName(null);
    }
  }

  function handleAnalyzeFit() {
    setAnalyzing(true);
    setFitScore(null);
    setTimeout(() => {
      // Compute a mock fit score based on average gap from standard
      const totalGap = dimensions.reduce((sum, { id }) => sum + Math.abs((standards[id] ?? 0) - (selfScores[id] ?? 0)), 0);
      const avgGap = totalGap / dimensions.length;
      const deptBonus = targetDept === position.category ? 10 : 0;
      const score = Math.max(40, Math.min(100, Math.round(100 - avgGap * 0.8 + deptBonus + Math.random() * 10 - 5)));
      setFitScore(score);
      setAnalyzing(false);
    }, 1200);
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* ── Page title ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <Target size={28} className="text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">職能落差分析</h1>
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold border border-purple-200">
          iCAP 職能基準
        </span>
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold border border-blue-200">
          {position.category}・{positionName}（{position.level}）
        </span>
        {currentUser && (
          <span className="ml-auto text-sm text-gray-500">
            員工：{currentUser.name}｜{currentUser.department}
          </span>
        )}
      </div>

      {/* ── 員工職能說明書檔案庫（管理員／人資／主管可見）── */}
      {(currentUser?.role === 'admin' || currentUser?.role === 'hr' || currentUser?.role === 'manager') && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Users size={18} className="text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-bold text-gray-900">員工工作職能說明書檔案庫</h2>
              <p className="text-xs text-gray-500">
                {Object.keys(employeeJDs).length > 0
                  ? `共 ${Object.keys(employeeJDs).length} 位員工已上傳工作說明書，點擊「查看」可載入個別員工的職能分析`
                  : '尚無員工上傳工作說明書；員工上傳並套用後，記錄將自動儲存於此'}
              </p>
            </div>
          </div>
          {Object.keys(employeeJDs).length > 0 && (
            <div className="space-y-2">
              {Object.values(employeeJDs).map((rec) => (
                <div
                  key={rec.employeeName}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
                    viewingEmployeeName === rec.employeeName
                      ? 'border-indigo-400 bg-indigo-50'
                      : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-900">{rec.employeeName}</span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{rec.positionName}</span>
                      {rec.department && <span className="text-xs text-gray-500">{rec.department}</span>}
                      {rec.professionalSkills.length > 0 && (
                        <span className="text-xs text-purple-600">{rec.professionalSkills.length} 項專業能力</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                      {rec.sourceFileName}・{new Date(rec.uploadedAt).toLocaleDateString('zh-TW')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleLoadEmployee(rec.employeeName)}
                      className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
                    >
                      查看
                    </button>
                    <button
                      onClick={() => handleDeleteEmployeeJD(rec.employeeName)}
                      className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1.5 rounded-lg transition-colors"
                    >
                      刪除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Job Competency Document Upload ── */}
      <div className={`rounded-2xl border-2 ${docApplied ? 'border-green-300 bg-green-50' : 'border-dashed border-blue-300 bg-blue-50/40'} p-5 transition-colors`}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <FileText size={18} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">上傳工作職能書</h2>
            <p className="text-xs text-gray-500">
              上傳 PDF／TXT 工作說明書，自動擷取「所屬單位」「職位」與「本職位之工作職能及相關技能要求」，建立該職位專屬的職能評分標準；DOCX／圖片檔僅能依檔名推測職位
            </p>
          </div>
          {docFile && (
            <button onClick={handleClearDoc} className="ml-auto p-1.5 hover:bg-red-100 rounded-lg text-gray-400 hover:text-red-500 transition-colors">
              <X size={16} />
            </button>
          )}
        </div>

        {/* 員工已儲存說明書的提示（未上傳新檔案時顯示） */}
        {currentUser && employeeJDs[currentUser.name] && !docFile && (
          <div className="flex items-center gap-3 bg-teal-50 border border-teal-200 rounded-xl px-4 py-2.5 mb-3">
            <CheckCircle size={15} className="text-teal-500 flex-shrink-0" />
            <div className="flex-1 min-w-0 text-xs text-teal-700">
              <span className="font-medium">您的說明書記錄已儲存</span>
              <span className="text-teal-600">（{employeeJDs[currentUser.name].positionName}・{employeeJDs[currentUser.name].sourceFileName}・{new Date(employeeJDs[currentUser.name].uploadedAt).toLocaleDateString('zh-TW')}）</span>
            </div>
            <button
              onClick={() => handleLoadEmployee(currentUser.name)}
              className="text-xs font-medium text-teal-700 hover:text-teal-900 bg-teal-100 hover:bg-teal-200 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
            >
              載入我的職能標準
            </button>
          </div>
        )}

        {!docFile ? (
          <div
            className={`border-2 border-dashed ${docDragging ? 'border-blue-500 bg-blue-100' : 'border-blue-200 bg-white'} rounded-xl p-6 text-center cursor-pointer transition-colors`}
            onDragOver={(e) => { e.preventDefault(); setDocDragging(true); }}
            onDragLeave={() => setDocDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDocDragging(false); const f = e.dataTransfer.files[0]; if (f) handleDocUpload(f); }}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={32} className="text-blue-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700 mb-1">拖曳工作職能書或點擊上傳</p>
            <p className="text-xs text-gray-400">PDF / DOCX / TXT，最大 20MB</p>
            <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.docx,.doc,.txt"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleDocUpload(f); }} />
          </div>
        ) : (
          <div className="space-y-3">
            {/* File info */}
            <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-gray-200">
              <FileText size={20} className="text-blue-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{docFile.name}</p>
                <p className="text-xs text-gray-400">{(docFile.size / 1024).toFixed(1)} KB</p>
              </div>
              {docApplied && <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium flex-shrink-0">已套用</span>}
            </div>

            {/* AI processing steps */}
            {(docProcessing || docResult) && (
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={16} className="text-purple-500" />
                  <span className="text-sm font-semibold text-gray-800">AI 職能書辨識</span>
                  {docProcessing && <div className="w-4 h-4 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin ml-1" />}
                </div>
                {[
                  '讀取文件內容',
                  '辨識職位與部門',
                  '提取各職能向度要求分數',
                  '對應職能基準框架',
                ].map((label, i) => (
                  <div key={i} className={`flex items-center gap-2 text-xs py-1 transition-opacity ${docStep > i ? 'opacity-100' : 'opacity-30'}`}>
                    {docStep > i
                      ? <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                      : <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300 flex-shrink-0" />}
                    <span className={docStep > i ? 'text-gray-800 font-medium' : 'text-gray-400'}>{label}</span>
                    {docStep === i + 1 && docProcessing && <span className="text-purple-500 ml-auto animate-pulse">處理中...</span>}
                  </div>
                ))}
              </div>
            )}

            {/* Result card */}
            {docResult && !docProcessing && (
              <div className="bg-white rounded-xl border border-blue-200 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <span className="text-sm font-bold text-gray-900">辨識完成</span>
                </div>
                <p className="text-xs text-gray-500">{docResult.description}</p>

                {/* Position confirmation / correction */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-800">確認職位</span>
                    {correctedPositionName !== docResult.positionName && (
                      <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">已修正</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-gray-500">AI辨識：</span>
                    <span className="text-xs font-semibold text-gray-800 bg-gray-100 px-2 py-0.5 rounded">
                      {docResult.positionName}（{DETAILED_COMPETENCY_FRAMEWORK[docResult.positionName].category}）
                    </span>
                    <ArrowRight size={12} className="text-gray-400" />
                    <select
                      value={correctedPositionName}
                      onChange={(e) => setCorrectedPositionName(e.target.value)}
                      className="text-xs border border-amber-300 rounded-lg px-2 py-1.5 bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-amber-400"
                    >
                      {DEPARTMENTS.map((dept) => (
                        <optgroup key={dept} label={dept}>
                          {POSITIONS_BY_DEPT[dept].map((name) => (
                            <option key={name} value={name}>{name}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    若 AI 辨識的職位與實際職稱不符，可於上方下拉選單手動修正部門與職位。
                  </p>
                </div>

                {/* Extracted items */}
                <div className="bg-gray-50 rounded-lg p-3 space-y-1.5">
                  {docResult.extractedItems.map((item, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-xs">
                      <span className="text-blue-500 mt-0.5 flex-shrink-0">▸</span>
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>

                {/* Competency values preview */}
                {docResult.source === 'content' ? (
                  docResult.professionalSkills.length > 0 ? (
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs font-semibold text-gray-600 mb-1.5">iCAP 既有職能類別（依職位要求等級）</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {DETAILED_COMPETENCY_FRAMEWORK[correctedPositionName].competencies.map((c) => (
                            <div key={c.id} className="bg-blue-50 rounded-lg p-2 text-center">
                              <p className="text-xs text-gray-500 mb-1">{c.category}</p>
                              <p className="text-base font-bold text-blue-700">
                                {Math.min(100, DETAILED_COMPETENCY_FRAMEWORK[correctedPositionName].requiredLevel * 20)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 mb-1.5">本說明書專屬要求（新增職能向度）</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {docResult.professionalSkills.map((skill, i) => (
                            <div key={i} className="bg-purple-50 rounded-lg p-2 text-center">
                              <p className="text-xs text-gray-500 mb-1 break-words">{skill}</p>
                              <p className="text-base font-bold text-purple-700">
                                {Math.min(100, DETAILED_COMPETENCY_FRAMEWORK[correctedPositionName].requiredLevel * 20 + 10)}
                              </p>
                            </div>
                          ))}
                          {docResult.trainingNeeds.length > 0 && (
                            <div className="bg-purple-50 rounded-lg p-2 text-center col-span-2 md:col-span-1">
                              <p className="text-xs text-gray-500 mb-1 break-words">教育訓練需求：{docResult.trainingNeeds.join('、')}</p>
                              <p className="text-base font-bold text-purple-700">
                                {Math.min(100, DETAILED_COMPETENCY_FRAMEWORK[correctedPositionName].requiredLevel * 20 + 10)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">未擷取到「本職位之工作職能及相關技能要求」，套用後將沿用該職位現有的 iCAP 職能基準分數。</p>
                  )
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {DETAILED_COMPETENCY_FRAMEWORK[docResult.positionName].competencies.map((c) => (
                      <div key={c.id} className="bg-blue-50 rounded-lg p-2 text-center">
                        <p className="text-xs text-gray-500 mb-1">{c.category}</p>
                        <p className="text-base font-bold text-blue-700">
                          {Math.min(100, DETAILED_COMPETENCY_FRAMEWORK[docResult.positionName].requiredLevel * 20)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {!docApplied ? (
                  <button
                    onClick={handleApplyDoc}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors"
                  >
                    <ArrowRight size={16} />
                    套用職能書更新分析基準
                  </button>
                ) : (
                  <div className="flex items-center gap-2 text-green-700 text-sm font-medium bg-green-50 rounded-lg px-3 py-2">
                    <CheckCircle size={16} />
                    已建立並儲存「{correctedPositionName}」專屬職能評分標準，僅套用於此職位，不影響共用 iCAP 框架或其他職位
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Department / position selector ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">部門：</label>
        <div className="relative">
          <select
            value={position.category}
            onChange={(e) => handlePositionChange(POSITIONS_BY_DEPT[e.target.value][0])}
            className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>

        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">職位：</label>
        <div className="relative">
          <select
            value={positionName}
            onChange={(e) => handlePositionChange(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {POSITIONS_BY_DEPT[position.category].map((name) => (
              <option key={name} value={name}>{name}（{DETAILED_COMPETENCY_FRAMEWORK[name].level}）</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>

        <span className="text-xs text-gray-400">本職位共 {dimensions.length} 項職能向度，要求等級 {position.requiredLevel}/5</span>
      </div>

      {/* ── Position-specific override badge（員工查看自己說明書記錄時不重複顯示）── */}
      {overrides[positionName] && !empOverride && (
        <div
          className="flex items-center gap-2 flex-wrap bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-2.5 text-xs text-indigo-700"
          title={`所屬單位：${overrides[positionName].department || '未提供'}｜工作摘要：${overrides[positionName].jobSummary || '未提供'}`}
        >
          <Sparkles size={14} className="flex-shrink-0" />
          <span>
            已套用「{positionName}」專屬職能評分標準（依工作說明書「{overrides[positionName].sourceFileName}」於 {new Date(overrides[positionName].updatedAt).toLocaleDateString('zh-TW')} 建立）
          </span>
          <button
            onClick={handleResetOverride}
            className="ml-auto text-indigo-600 hover:text-indigo-800 underline font-medium flex-shrink-0"
          >
            還原為共用 iCAP 標準
          </button>
        </div>
      )}

      {/* ── 目前查看的員工說明書提示 ── */}
      {viewingEmployeeName && (
        <div className="flex items-center gap-2 flex-wrap bg-teal-50 border border-teal-200 rounded-xl px-4 py-2.5 text-xs text-teal-700">
          <Users size={14} className="flex-shrink-0" />
          {viewingEmployeeName === currentUser?.name ? (
            <span>目前顯示您（<strong>{viewingEmployeeName}</strong>）已儲存的說明書職能標準（{positionName}・{empOverride?.sourceFileName}）</span>
          ) : (
            <span>目前檢視：<strong>{viewingEmployeeName}</strong> 的工作說明書職能資料（{positionName}）</span>
          )}
          <button
            onClick={() => { setEmpOverride(null); setViewingEmployeeName(null); }}
            className="ml-auto text-teal-600 hover:text-teal-800 underline font-medium flex-shrink-0"
          >
            {viewingEmployeeName === currentUser?.name ? '切換為職位共用標準' : '返回職位共用標準'}
          </button>
        </div>
      )}

      {/* ── Main two-column section ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* LEFT: Self assessment sliders */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
          <h2 className="text-base font-semibold text-gray-800 border-b border-gray-100 pb-3">
            📝 員工自評
          </h2>
          {dimensions.map(({ id, label }) => (
            <div key={id} className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">{label}</span>
                <span className="font-bold text-blue-600 tabular-nums">{selfScores[id] ?? 0}</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={selfScores[id] ?? 0}
                onChange={(e) =>
                  setSelfScores((prev) => ({ ...prev, [id]: Number(e.target.value) }))
                }
                className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>0</span>
                <span className="text-gray-500">職能標準：{standards[id] ?? 0}</span>
                <span>100</span>
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT: Radar chart */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-800 border-b border-gray-100 pb-3 mb-4">
            📊 職能雷達圖
          </h2>
          <ResponsiveContainer width="100%" height={340}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 12, fill: '#374151' }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
                formatter={(val: number) => [`${val}`, '']}
              />
              <Radar name="員工自評" dataKey="自評" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} strokeWidth={2} />
              <Radar name="職能標準" dataKey="標準" stroke="#ef4444" fill="none" strokeDasharray="5 3" strokeWidth={2} />
              {showManager && (
                <Radar name="主管評估" dataKey="主管評估" stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeDasharray="3 2" strokeWidth={2} />
              )}
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
            </RadarChart>
          </ResponsiveContainer>
          {!showManager && (
            <p className="text-xs text-gray-400 text-center mt-2">主管評估尚未完成，提交自評後可查看對比</p>
          )}
        </div>
      </div>

      {/* ── Gap analysis cards ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-800 border-b border-gray-100 pb-3 mb-4">
          🔍 各維度落差分析
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {dimensions.map(({ id, label, course }) => {
            const gap = (standards[id] ?? 0) - (selfScores[id] ?? 0);
            return (
              <div
                key={id}
                className={`rounded-xl border p-3 space-y-2 ${getGapColor(gap)}`}
              >
                <div className="flex items-center gap-1.5">
                  {getGapIcon(gap)}
                  <span className="text-xs font-semibold">{label}</span>
                </div>
                <div className="text-lg font-bold tabular-nums">
                  {gap > 0 ? `+${gap}` : gap}
                </div>
                <div className="text-xs opacity-75">
                  {gap <= 0 ? '已達標準' : `落差 ${gap} 分`}
                </div>
                {gap > 0 && (
                  <span className="inline-block text-xs px-1.5 py-0.5 bg-white bg-opacity-60 rounded-md border border-current border-opacity-30 leading-tight">
                    建議：{course}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Competency Gap Quiz ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h2 className="text-base font-semibold text-gray-800">📝 職能缺口測驗</h2>
          {!quizStarted && (
            <button
              onClick={startQuiz}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
            >
              <Sparkles size={15} /> 生成缺口測驗
            </button>
          )}
          {quizStarted && !quizSubmitted && (
            <button
              onClick={() => { setQuizStarted(false); setQuizAnswers({}); setQuizSubmitted(false); }}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {!quizStarted && (
          <div className="text-center py-8 text-gray-400">
            <Target size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">根據您的職能落差，AI 自動生成針對性測驗題目</p>
            <p className="text-xs mt-1">建議先完成自評後，再生成個人化測驗</p>
          </div>
        )}

        {quizStarted && (
          <div className="space-y-5">
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-sm text-purple-700">
              <strong>職位：{positionName}</strong> · 根據落差最大的職能向度自動生成 {quizQuestions.length} 道測驗題
            </div>

            {quizQuestions.map((q, qi) => {
              const answered = quizAnswers[q.id] !== undefined;
              const isCorrect = quizSubmitted && quizAnswers[q.id] === q.answerIndex;
              const isWrong = quizSubmitted && answered && quizAnswers[q.id] !== q.answerIndex;

              return (
                <div key={q.id} className={`rounded-xl border p-4 space-y-3 ${quizSubmitted ? (isCorrect ? 'bg-green-50 border-green-300' : isWrong ? 'bg-red-50 border-red-300' : 'bg-gray-50 border-gray-200') : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full shrink-0 mt-0.5">{q.dimensionLabel}</span>
                    <p className="text-sm font-medium text-gray-800">Q{qi + 1}. {q.question}</p>
                  </div>
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => {
                      const isSelected = quizAnswers[q.id] === oi;
                      const isAnswer = q.answerIndex === oi;
                      let cls = 'border-gray-200 bg-white text-gray-700 hover:border-purple-300 hover:bg-purple-50';
                      if (quizSubmitted) {
                        if (isAnswer) cls = 'border-green-400 bg-green-100 text-green-800 font-semibold';
                        else if (isSelected && !isAnswer) cls = 'border-red-400 bg-red-100 text-red-700';
                        else cls = 'border-gray-200 bg-white text-gray-400';
                      } else if (isSelected) {
                        cls = 'border-purple-500 bg-purple-50 text-purple-900 font-medium';
                      }
                      return (
                        <button
                          key={oi}
                          onClick={() => !quizSubmitted && setQuizAnswers(prev => ({ ...prev, [q.id]: oi }))}
                          disabled={quizSubmitted}
                          className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors ${cls}`}
                        >
                          {String.fromCharCode(65 + oi)}. {opt}
                        </button>
                      );
                    })}
                  </div>
                  {quizSubmitted && isWrong && (
                    <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                      ✅ 正確答案：{q.options[q.answerIndex]}
                    </p>
                  )}
                </div>
              );
            })}

            {!quizSubmitted ? (
              <button
                onClick={submitQuiz}
                disabled={Object.keys(quizAnswers).length < quizQuestions.length}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold"
              >
                提交測驗（已作答 {Object.keys(quizAnswers).length}/{quizQuestions.length} 題）
              </button>
            ) : (
              <div className={`rounded-xl border p-5 space-y-3 ${quizScore >= 70 ? 'bg-green-50 border-green-300' : quizScore >= 50 ? 'bg-yellow-50 border-yellow-300' : 'bg-red-50 border-red-300'}`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-800">測驗結果</h3>
                  <span className={`text-2xl font-bold ${quizScore >= 70 ? 'text-green-700' : quizScore >= 50 ? 'text-yellow-700' : 'text-red-700'}`}>{quizScore}分</span>
                </div>
                <p className="text-sm text-gray-600">
                  共 {quizQuestions.length} 題，答對 {quizQuestions.filter(q => quizAnswers[q.id] === q.answerIndex).length} 題。
                  {quizScore >= 70 ? ' 職能知識掌握良好！' : quizScore >= 50 ? ' 建議加強落差較大的職能向度。' : ' 建議優先完成建議課程後再次測驗。'}
                </p>
                <button
                  onClick={() => { setQuizStarted(false); setQuizAnswers({}); setQuizSubmitted(false); }}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium underline"
                >
                  重新生成測驗
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Submit & manager comparison ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
        <h2 className="text-base font-semibold text-gray-800 border-b border-gray-100 pb-3">
          ✅ 提交自評 & 主管比對
        </h2>

        {!submitted ? (
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
          >
            提交自評
          </button>
        ) : (
          <div className="flex items-center gap-2 text-green-700 font-medium text-sm">
            <CheckCircle size={18} />
            自評已提交，已收到主管評估結果
          </div>
        )}

        {/* Comparison table after submit */}
        {submitted && showManager && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-3 py-2 font-semibold text-gray-600 border border-gray-200">職能維度</th>
                  <th className="px-3 py-2 font-semibold text-blue-600 border border-gray-200">員工自評</th>
                  <th className="px-3 py-2 font-semibold text-green-600 border border-gray-200">主管評估</th>
                  <th className="px-3 py-2 font-semibold text-red-600 border border-gray-200">職能標準</th>
                  <th className="px-3 py-2 font-semibold text-gray-600 border border-gray-200">差距</th>
                </tr>
              </thead>
              <tbody>
                {dimensions.map(({ id, label }) => {
                  const diff = (selfScores[id] ?? 0) - (managerScores[id] ?? 0);
                  return (
                    <tr key={id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2 font-medium border border-gray-200">{label}</td>
                      <td className="px-3 py-2 text-center tabular-nums border border-gray-200 text-blue-700 font-semibold">{selfScores[id] ?? 0}</td>
                      <td className="px-3 py-2 text-center tabular-nums border border-gray-200 text-green-700 font-semibold">{managerScores[id] ?? 0}</td>
                      <td className="px-3 py-2 text-center tabular-nums border border-gray-200 text-red-700 font-semibold">{standards[id] ?? 0}</td>
                      <td className={`px-3 py-2 text-center tabular-nums border border-gray-200 font-semibold ${diff > 0 ? 'text-yellow-600' : diff < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {diff > 0 ? `+${diff}` : diff}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Department rotation suitability */}
        <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-800">🔄 部門輪調適合度分析</h3>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <select
                value={targetDept}
                onChange={(e) => { setTargetDept(e.target.value); setFitScore(null); }}
                className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <button
              onClick={handleAnalyzeFit}
              disabled={analyzing}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              {analyzing ? <RefreshCw size={14} className="animate-spin" /> : null}
              {analyzing ? '分析中...' : '分析適合度'}
            </button>
          </div>

          {fitScore !== null && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">
                  輪調至「{targetDept}」適合度
                </span>
                <span className={`font-bold text-lg tabular-nums ${fitScore >= 70 ? 'text-green-600' : fitScore >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {fitScore} / 100
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-700 ${fitScore >= 70 ? 'bg-green-500' : fitScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${fitScore}%` }}
                />
              </div>
              <p className="text-xs text-gray-600">
                {fitScore >= 70
                  ? `✅ 建議：職能適配度高，可安排輪調至${targetDept}，建議補充相關部門專業知識。`
                  : fitScore >= 50
                  ? `⚠️ 建議：需加強部分職能後再考慮輪調至${targetDept}，建議先完成相關課程。`
                  : `❌ 建議：目前職能與${targetDept}需求差距較大，建議優先強化核心職能再行輪調。`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
