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
