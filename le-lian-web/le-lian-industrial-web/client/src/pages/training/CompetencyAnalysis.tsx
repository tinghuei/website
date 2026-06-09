import { useState, useRef } from 'react';
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
import { Target, ChevronDown, CheckCircle, AlertCircle, XCircle, RefreshCw, Upload, FileText, Sparkles, X, ArrowRight } from 'lucide-react';
import { useTrainingAuth } from '../../context/TrainingAuthContext';

// ── Types ──────────────────────────────────────────────────────────────────────
interface CompetencyScores {
  technical: number;
  communication: number;
  leadership: number;
  problem: number;
  teamwork: number;
  safety: number;
}

type JobTitle = '技術員/班長' | '助理專員/組長' | '工程師/課長' | '副理/經理以上';

// ── iCAP Standards ─────────────────────────────────────────────────────────────
const ICAP_STANDARDS: Record<JobTitle, CompetencyScores> = {
  '技術員/班長':    { technical: 65, communication: 55, leadership: 45, problem: 60, teamwork: 70, safety: 85 },
  '助理專員/組長':  { technical: 70, communication: 65, leadership: 55, problem: 65, teamwork: 70, safety: 80 },
  '工程師/課長':    { technical: 80, communication: 72, leadership: 68, problem: 75, teamwork: 75, safety: 78 },
  '副理/經理以上':  { technical: 72, communication: 82, leadership: 88, problem: 82, teamwork: 80, safety: 72 },
};

// Mock manager assessment
const MANAGER_ASSESSMENT: CompetencyScores = {
  technical: 72, communication: 68, leadership: 55, problem: 70, teamwork: 75, safety: 80,
};

// Dimension metadata
const DIMENSIONS: { key: keyof CompetencyScores; label: string; course: string }[] = [
  { key: 'technical',      label: '專業技能',   course: '衝壓成型技術進階' },
  { key: 'communication',  label: '溝通協作',   course: '職場溝通與跨部門協作' },
  { key: 'leadership',     label: '領導管理',   course: '基層主管管理能力提升' },
  { key: 'problem',        label: '問題解決',   course: '品質問題分析與改善' },
  { key: 'teamwork',       label: '團隊合作',   course: '5S推行與現場管理實務' },
  { key: 'safety',         label: '安全意識',   course: '職業安全衛生法規研習' },
];

// Random initial self-scores in 50-85 range
function randomScore(min = 50, max = 85) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const INITIAL_SCORES: CompetencyScores = {
  technical:     randomScore(),
  communication: randomScore(),
  leadership:    randomScore(),
  problem:       randomScore(),
  teamwork:      randomScore(),
  safety:        randomScore(),
};

// ── Target departments for rotation analysis ───────────────────────────────────
const TARGET_DEPARTMENTS = ['品保課', '製造課', '研發課', '業務課', '人資安全組', '財務部', '廠務部', '總務課'];

// ── AI-recognized result type ──────────────────────────────────────────────────
interface RecognizedDoc {
  fileName: string;
  jobTitle: JobTitle;
  competencies: CompetencyScores;
  description: string;
  extractedItems: string[];
}

// Simulate AI recognition for different file names / content
function simulateRecognition(fileName: string): RecognizedDoc {
  let jobTitle: JobTitle = '工程師/課長';
  if (/班長|技術員|operator|作業員|生產線/i.test(fileName))  jobTitle = '技術員/班長';
  if (/組長|專員|specialist|助理|副|lead/i.test(fileName)) jobTitle = '助理專員/組長';
  if (/副理|經理|manager|主任|協理|總監/i.test(fileName))    jobTitle = '副理/經理以上';
  if (/課長|工程師|engineer|品保|品管|研發/i.test(fileName))  jobTitle = '工程師/課長';

  const base = ICAP_STANDARDS[jobTitle];
  const vary = (v: number) => Math.min(100, Math.max(40, v + Math.round((Math.random() - 0.4) * 12)));

  // Extract department context from filename
  const deptMap: Record<string, string> = {
    '品保|品管|QA|QC|IATF|ISO': '品保課',
    '製造|生產|沖床|焊接|塗裝|加工': '製造課',
    '研發|設計|RD|模具': '研發課',
    '業務|銷售|客服|營業': '業務課',
    '人資|HR|人事|招募': '人資安全組',
    '財務|會計|成本|採購': '財務部',
    '廠務|設備|維修|TPM': '廠務部',
  };
  let dept = '管理部';
  for (const [pattern, deptName] of Object.entries(deptMap)) {
    if (new RegExp(pattern, 'i').test(fileName)) { dept = deptName; break; }
  }

  // Derive key responsibilities from job title
  const responsibilityMap: Record<JobTitle, string[]> = {
    '技術員/班長': [
      '依 SOP 執行生產作業，確保製程品質與產出數量',
      '執行5S整理整頓，維持工作現場安全衛生',
      '異常狀況即時通報，配合品保課進行首件確認',
      '協助新進人員現場作業訓練與指導',
    ],
    '助理專員/組長': [
      '帶領班組達成日/月生產目標，協調人機料法環',
      '主導現場改善提案（IE/QCC），降低製程損耗',
      '執行跨班交接、問題追蹤與異常處理回報',
      '協助課長推行教育訓練計畫，擔任內部講師',
    ],
    '工程師/課長': [
      '負責課別目標管理、預算規劃與績效考核',
      '主導製程標準化、SOP建立及技術文件維護',
      '跨部門溝通協調（品保/研發/業務），處理客訴與改善',
      '規劃部屬職能發展，提報年度訓練需求',
    ],
    '副理/經理以上': [
      '制定部門策略目標，確保與公司整體方向一致',
      '統籌跨部門資源整合，推動組織效能提升',
      '對外代表公司與客戶、供應商進行高層談判',
      '建立人才梯隊，實施接班人計畫與績效管理制度',
    ],
  };

  const skills: Record<JobTitle, string[]> = {
    '技術員/班長':   ['機械操作技能', '品質基礎知識(外觀/尺寸檢驗)', '職業安全衛生法規(6小時)'],
    '助理專員/組長': ['生產管理基礎(效率/稼動率)', '問題分析與解決(QCC/8D)', '勞動法令基礎'],
    '工程師/課長':   ['ISO 9001/IATF 16949品質系統', '專案管理(PDCA/FMEA)', '財務報表解讀與成本分析'],
    '副理/經理以上': ['策略規劃與組織管理', '財務管控與預算管理', '法律風險與勞動關係'],
  };

  return {
    fileName,
    jobTitle,
    competencies: {
      technical:     vary(base.technical),
      communication: vary(base.communication),
      leadership:    vary(base.leadership),
      problem:       vary(base.problem),
      teamwork:      vary(base.teamwork),
      safety:        vary(base.safety),
    },
    description: `AI 已成功辨識「${fileName}」為【${jobTitle}】職級工作說明書，適用部門：${dept}。已依 iCAP 職能基準自動對應各職能向度標準分數，並提取主要工作職責與必要技能。`,
    extractedItems: [
      `📋 職稱等級：${jobTitle}`,
      `🏢 適用部門：${dept}`,
      `📌 主要職責：${responsibilityMap[jobTitle][0]}`,
      `📌 工作項目：${responsibilityMap[jobTitle][1]}`,
      `🎯 必要技能：${skills[jobTitle][0]}`,
      `🎯 進階技能：${skills[jobTitle][1]}`,
      `⚖️ 法規遵循：${skills[jobTitle][2]}`,
      `📊 TTQS對應：計劃(Plan)—訓練需求評估 / 設計(Design)—職能課程規劃`,
    ],
  };
}

// ── Competency Gap Quiz Data ───────────────────────────────────────────────────
interface GapQuizQuestion {
  id: string;
  dimension: keyof CompetencyScores;
  question: string;
  options: string[];
  answerIndex: number;
}

const GAP_QUIZ_BANK: Record<JobTitle, GapQuizQuestion[]> = {
  '技術員/班長': [
    { id: 'tq1', dimension: 'technical', question: '執行作業前，應優先確認下列哪項？', options: ['確認作業速度最大化', '確認SOP標準作業程序及安全防護', '先完成作業再查閱SOP', '依個人習慣作業'], answerIndex: 1 },
    { id: 'tq2', dimension: 'technical', question: '發現品質異常時，正確的處理步驟是？', options: ['繼續生產直到數量達標', '立即停機並通報班長/品保', '將不良品混入良品中', '等班次結束後再報告'], answerIndex: 1 },
    { id: 'tq3', dimension: 'safety', question: '進入作業區前，下列哪項是必要的安全措施？', options: ['只有新人需要穿戴PPE', '視情況決定是否穿戴防護裝備', '依規定穿戴所有必要防護裝備（安全帽/護目鏡/耳塞）', '確認沒有主管在場再穿戴'], answerIndex: 2 },
    { id: 'tq4', dimension: 'safety', question: '發現機台洩漏異常油液時，應如何處理？', options: ['繼續生產，下班後再報告', '立即停機、設置警示標誌並通報設備人員', '用抹布擦拭後繼續使用', '等油液增多再處理'], answerIndex: 1 },
    { id: 'tq5', dimension: 'communication', question: '班次交接時，最重要的是？', options: ['快速交班，節省時間', '詳細說明異常狀況、生產進度及待處理事項', '只告知生產數量', '口頭隨意說明即可'], answerIndex: 1 },
    { id: 'tq6', dimension: 'teamwork', question: '同事作業遇到困難時，你應該？', options: ['這是他的工作，不需介入', '只告知主管，不直接幫忙', '主動提供協助，並在完成後回報班長', '等他自己解決'], answerIndex: 2 },
    { id: 'tq7', dimension: 'problem', question: '生產線突發停機，你的首要處置是？', options: ['等待主管指示，不需主動處置', '立即確認原因、評估影響並通報相關人員', '先紀錄停機時間再通報', '聯繫廠商直接修理'], answerIndex: 1 },
    { id: 'tq8', dimension: 'leadership', question: '班長在帶領班組時，最重要的責任是？', options: ['只需監督員工不遲到', '確保生產目標、品質標準及人員安全同時達成', '只管生產數量', '等主管指示再行動'], answerIndex: 1 },
  ],
  '助理專員/組長': [
    { id: 'aq1', dimension: 'technical', question: '稼動率（OEE）的計算包含下列哪三個要素？', options: ['品質率 × 效率 × 可用率', '品質 × 速度 × 成本', '人員出勤率 × 生產量 × 良品率', '計劃產出 × 實際產出 × 品質'], answerIndex: 0 },
    { id: 'aq2', dimension: 'problem', question: 'QCC品管圈活動的PDCA中，「C」代表？', options: ['Create（創造）', 'Check（查核/確認效果）', 'Cost（成本）', 'Control（控制人員）'], answerIndex: 1 },
    { id: 'aq3', dimension: 'leadership', question: '帶領組員完成改善提案時，組長應？', options: ['獨立完成，不需組員參與', '引導組員參與分析與對策提出，培養問題解決能力', '只有表現好的組員才參與', '由上級決定所有對策'], answerIndex: 1 },
    { id: 'aq4', dimension: 'communication', question: '跨班異常交接時，必須填寫哪些資料？', options: ['只填當班姓名', '異常發生時間、位置、原因、已採取措施及後續追蹤', '只記錄生產數量', '口頭說明即可，不需書面記錄'], answerIndex: 1 },
    { id: 'aq5', dimension: 'safety', question: '危險物品（化學品）使用前，必須查閱？', options: ['網路搜尋用途', '安全資料表（SDS/MSDS）並確認防護措施', '問同事如何使用', '按個人經驗處理'], answerIndex: 1 },
    { id: 'aq6', dimension: 'teamwork', question: '遇到跨部門資源協調困難時，組長應？', options: ['放棄協調，報告無法完成', '透過主管或正式溝通管道協調，並尋求共識', '直接要求對方部門配合', '繞過對方，自行解決'], answerIndex: 1 },
    { id: 'aq7', dimension: 'problem', question: '8D問題解決方法中，「D4」代表？', options: ['找到問題擁有者', '確認並驗證根本原因', '建立應急措施', '執行永久對策'], answerIndex: 1 },
  ],
  '工程師/課長': [
    { id: 'eq1', dimension: 'technical', question: 'IATF 16949 中的APQP（先期產品品質規劃）包含幾個階段？', options: ['3個階段', '4個階段', '5個階段', '6個階段'], answerIndex: 2 },
    { id: 'eq2', dimension: 'technical', question: 'FMEA（失效模式及效應分析）的RPN值計算公式為？', options: ['嚴重度 + 發生率 + 偵測度', '嚴重度 × 發生率 × 偵測度', '嚴重度 × 發生率 ÷ 偵測度', '（嚴重度 + 發生率）× 偵測度'], answerIndex: 1 },
    { id: 'eq3', dimension: 'problem', question: '客訴處理的8D報告中，D8代表？', options: ['根本原因確認', '永久對策實施', '恭賀團隊並標準化預防再發', '應急措施確認'], answerIndex: 2 },
    { id: 'eq4', dimension: 'leadership', question: '課長在進行年度績效考核時，應注意避免？', options: ['過於關注員工的缺點', '月暈效應（以單一突出表現影響整體評價）', '設定明確的SMART目標', '進行雙向溝通'], answerIndex: 1 },
    { id: 'eq5', dimension: 'communication', question: '面對客戶提出的緊急設計變更需求，課長的標準處理流程是？', options: ['直接拒絕，維持現有設計', '評估可行性、確認成本影響、通過ECR程序正式變更', '口頭承諾後再通知工廠', '由業務全權處理，工程不需介入'], answerIndex: 1 },
    { id: 'eq6', dimension: 'problem', question: 'SPC管制圖中，出現「連續9點在中心線同側」屬於？', options: ['正常波動，無需處理', '製程失控警訊（特殊原因變異），需立即調查', '表示製程能力提升', '只需記錄，不需行動'], answerIndex: 1 },
    { id: 'eq7', dimension: 'safety', question: '工廠進行設備維修時，必須執行下列哪項安全程序？', options: ['確認主管授權後直接作業', '執行LOTO（鎖定/掛牌程序）確保能源隔離', '關閉電源開關即可', '設備商自行負責安全'], answerIndex: 1 },
  ],
  '副理/經理以上': [
    { id: 'mq1', dimension: 'leadership', question: '推動組織變革時，領導者最重要的任務是？', options: ['強制執行，確保速度', '清楚溝通願景、取得關鍵人員支持、管理阻力並建立信任', '只需提出計畫，由下屬執行', '等待完美時機再推動'], answerIndex: 1 },
    { id: 'mq2', dimension: 'technical', question: '損益表中，「毛利率」的計算公式為？', options: ['（淨利 ÷ 營收）× 100%', '（營收 - 銷貨成本）÷ 營收 × 100%', '（營收 - 所有費用）÷ 營收 × 100%', '（EBIT ÷ 總資產）× 100%'], answerIndex: 1 },
    { id: 'mq3', dimension: 'communication', question: '在高層會議中進行策略提案，最有效的簡報結構為？', options: ['從詳細數據開始，逐步說明', '先提出結論與建議，再佐證數據與執行方案（金字塔原則）', '依照時間順序說明過程', '只提問題，不提解決方案'], answerIndex: 1 },
    { id: 'mq4', dimension: 'problem', question: '面對多項高優先度問題，主管應如何分配資源？', options: ['依問題發生的先後順序處理', '依影響程度 × 緊急程度矩陣（艾森豪矩陣）排定優先順序', '全部同時處理', '只處理自己擅長的問題'], answerIndex: 1 },
    { id: 'mq5', dimension: 'leadership', question: '人才培育的最佳實踐是？', options: ['僅提供外部訓練課程', 'OJT（在職訓練）+ 教練輔導 + 正式課程三者並行', '等員工主動要求再培訓', '只培育表現最好的員工'], answerIndex: 1 },
    { id: 'mq6', dimension: 'communication', question: '勞動爭議發生時，主管應首先？', options: ['立即解僱以示立場', '了解事實、保持中立、諮詢人資法規，依法定程序處理', '完全交由HR處理，不需介入', '公開討論以警示其他員工'], answerIndex: 1 },
    { id: 'mq7', dimension: 'problem', question: '公司面臨主要客戶訂單大幅縮減的危機，經理應？', options: ['等待情況自動恢復', '分析原因、緊急啟動多元客戶開發計畫、優化成本結構並加強現有客戶關係', '立即大量裁員降低成本', '只向上層反映，等待指示'], answerIndex: 1 },
  ],
};

// Generate quiz from gap dimensions
function generateGapQuiz(jobTitle: JobTitle, selfScores: CompetencyScores, standards: CompetencyScores): GapQuizQuestion[] {
  // Sort dimensions by gap size (largest gap first)
  const gapDims = DIMENSIONS
    .map(d => ({ ...d, gap: standards[d.key] - selfScores[d.key] }))
    .filter(d => d.gap > 0)
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 4); // take top 4 gap dimensions

  const bank = GAP_QUIZ_BANK[jobTitle] || GAP_QUIZ_BANK['工程師/課長'];
  const questions: GapQuizQuestion[] = [];

  gapDims.forEach(dim => {
    const dimQs = bank.filter(q => q.dimension === dim.key);
    if (dimQs.length > 0) {
      // Pick 1-2 questions per gap dimension
      questions.push(dimQs[0]);
      if (dimQs.length > 1 && dim.gap > 15) questions.push(dimQs[1]);
    }
  });

  // Fill up to 6 questions if needed
  if (questions.length < 4) {
    const extras = bank.filter(q => !questions.find(pq => pq.id === q.id));
    questions.push(...extras.slice(0, 4 - questions.length));
  }

  return questions.slice(0, 8);
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function CompetencyAnalysis() {
  const { currentUser } = useTrainingAuth();
  const [jobTitle, setJobTitle] = useState<JobTitle>('工程師/課長');
  const [selfScores, setSelfScores] = useState<CompetencyScores>({ ...INITIAL_SCORES });
  const [submitted, setSubmitted] = useState(false);
  const [showManager, setShowManager] = useState(false);
  const [targetDept, setTargetDept] = useState('品保部');
  const [fitScore, setFitScore] = useState<number | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Competency gap quiz states
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<GapQuizQuestion[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  function startQuiz() {
    const qs = generateGapQuiz(jobTitle, selfScores, standards);
    setQuizQuestions(qs);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizStarted(true);
  }

  function submitQuiz() {
    setQuizSubmitted(true);
  }

  const quizScore = quizSubmitted
    ? Math.round((quizQuestions.filter(q => quizAnswers[q.id] === q.answerIndex).length / quizQuestions.length) * 100)
    : 0;

  // Document upload states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docDragging, setDocDragging] = useState(false);
  const [docProcessing, setDocProcessing] = useState(false);
  const [docStep, setDocStep] = useState(0);
  const [docResult, setDocResult] = useState<RecognizedDoc | null>(null);
  const [docApplied, setDocApplied] = useState(false);
  const [customStandards, setCustomStandards] = useState<CompetencyScores | null>(null);

  const standards = customStandards ?? ICAP_STANDARDS[jobTitle];

  // Build radar data
  const radarData = DIMENSIONS.map(({ key, label }) => ({
    dimension: label,
    自評:   selfScores[key],
    標準:   standards[key],
    ...(showManager ? { 主管評估: MANAGER_ASSESSMENT[key] } : {}),
  }));

  // Gap analysis helpers
  function getGapColor(gap: number) {
    if (gap <= 0)  return 'bg-green-100 border-green-300 text-green-800';
    if (gap <= 15) return 'bg-yellow-100 border-yellow-300 text-yellow-800';
    return 'bg-red-100 border-red-300 text-red-800';
  }
  function getGapIcon(gap: number) {
    if (gap <= 0)  return <CheckCircle size={16} className="text-green-600" />;
    if (gap <= 15) return <AlertCircle size={16} className="text-yellow-600" />;
    return <XCircle size={16} className="text-red-600" />;
  }

  function handleSubmit() {
    setSubmitted(true);
    // Mock: manager has assessed this user
    setShowManager(true);
  }

  function handleDocUpload(file: File) {
    setDocFile(file);
    setDocResult(null);
    setDocApplied(false);
    setDocProcessing(true);
    setDocStep(0);
    const steps = [1, 2, 3, 4];
    steps.forEach((s, i) => {
      setTimeout(() => {
        setDocStep(s);
        if (s === 4) {
          setTimeout(() => {
            setDocResult(simulateRecognition(file.name));
            setDocProcessing(false);
          }, 600);
        }
      }, (i + 1) * 900);
    });
  }

  function handleApplyDoc() {
    if (!docResult) return;
    setJobTitle(docResult.jobTitle);
    setCustomStandards(docResult.competencies);
    setDocApplied(true);
  }

  function handleClearDoc() {
    setDocFile(null);
    setDocResult(null);
    setDocApplied(false);
    setDocProcessing(false);
    setDocStep(0);
    setCustomStandards(null);
  }

  function handleAnalyzeFit() {
    setAnalyzing(true);
    setFitScore(null);
    setTimeout(() => {
      // Compute a mock fit score based on average gap from standard
      const totalGap = DIMENSIONS.reduce((sum, { key }) => sum + Math.abs(standards[key] - selfScores[key]), 0);
      const avgGap = totalGap / DIMENSIONS.length;
      const score = Math.max(40, Math.round(100 - avgGap * 0.8 + Math.random() * 10 - 5));
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
        {currentUser && (
          <span className="ml-auto text-sm text-gray-500">
            員工：{currentUser.name}｜{currentUser.department}
          </span>
        )}
      </div>

      {/* ── Job Competency Document Upload ── */}
      <div className={`rounded-2xl border-2 ${docApplied ? 'border-green-300 bg-green-50' : 'border-dashed border-blue-300 bg-blue-50/40'} p-5 transition-colors`}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <FileText size={18} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">上傳工作職能書</h2>
            <p className="text-xs text-gray-500">AI 辨識後自動更新職能標準基準值（支援 PDF、DOCX、TXT）</p>
          </div>
          {docFile && (
            <button onClick={handleClearDoc} className="ml-auto p-1.5 hover:bg-red-100 rounded-lg text-gray-400 hover:text-red-500 transition-colors">
              <X size={16} />
            </button>
          )}
        </div>

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
                  '辨識職稱等級',
                  '提取各職能向度要求分數',
                  '對應 iCAP 職能基準框架',
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
                <div className="grid grid-cols-3 gap-2">
                  {DIMENSIONS.map(({ key, label }) => {
                    const extracted = docResult.competencies[key];
                    const original = ICAP_STANDARDS[docResult.jobTitle][key];
                    const diff = extracted - original;
                    return (
                      <div key={key} className="bg-blue-50 rounded-lg p-2 text-center">
                        <p className="text-xs text-gray-500 mb-1">{label}</p>
                        <p className="text-base font-bold text-blue-700">{extracted}</p>
                        {diff !== 0 && (
                          <p className={`text-xs font-medium ${diff > 0 ? 'text-green-600' : 'text-red-500'}`}>
                            {diff > 0 ? `+${diff}` : diff}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

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
                    職能標準已更新！雷達圖基準值已套用「{docResult.jobTitle}」職能書數據
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Job title selector ── */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">職稱等級：</label>
        <div className="relative">
          <select
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value as JobTitle)}
            className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {(Object.keys(ICAP_STANDARDS) as JobTitle[]).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* ── Main two-column section ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* LEFT: Self assessment sliders */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
          <h2 className="text-base font-semibold text-gray-800 border-b border-gray-100 pb-3">
            📝 員工自評
          </h2>
          {DIMENSIONS.map(({ key, label }) => (
            <div key={key} className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">{label}</span>
                <span className="font-bold text-blue-600 tabular-nums">{selfScores[key]}</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={selfScores[key]}
                onChange={(e) =>
                  setSelfScores((prev) => ({ ...prev, [key]: Number(e.target.value) }))
                }
                className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>0</span>
                <span className="text-gray-500">職能標準：{standards[key]}</span>
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
          {DIMENSIONS.map(({ key, label, course }) => {
            const gap = standards[key] - selfScores[key];
            return (
              <div
                key={key}
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
              <strong>職稱：{jobTitle}</strong> · 根據落差最大的職能向度自動生成 {quizQuestions.length} 道測驗題
            </div>

            {quizQuestions.map((q, qi) => {
              const dimLabel = DIMENSIONS.find(d => d.key === q.dimension)?.label || q.dimension;
              const answered = quizAnswers[q.id] !== undefined;
              const isCorrect = quizSubmitted && quizAnswers[q.id] === q.answerIndex;
              const isWrong = quizSubmitted && answered && quizAnswers[q.id] !== q.answerIndex;

              return (
                <div key={q.id} className={`rounded-xl border p-4 space-y-3 ${quizSubmitted ? (isCorrect ? 'bg-green-50 border-green-300' : isWrong ? 'bg-red-50 border-red-300' : 'bg-gray-50 border-gray-200') : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full shrink-0 mt-0.5">{dimLabel}</span>
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
                {DIMENSIONS.map(({ key, label }) => {
                  const diff = selfScores[key] - MANAGER_ASSESSMENT[key];
                  return (
                    <tr key={key} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2 font-medium border border-gray-200">{label}</td>
                      <td className="px-3 py-2 text-center tabular-nums border border-gray-200 text-blue-700 font-semibold">{selfScores[key]}</td>
                      <td className="px-3 py-2 text-center tabular-nums border border-gray-200 text-green-700 font-semibold">{MANAGER_ASSESSMENT[key]}</td>
                      <td className="px-3 py-2 text-center tabular-nums border border-gray-200 text-red-700 font-semibold">{standards[key]}</td>
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
                {TARGET_DEPARTMENTS.map((d) => (
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
