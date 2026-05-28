import { useState, useEffect, useRef } from 'react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Map, Target, ClipboardList, BrainCircuit, ChevronRight, CheckCircle, AlertCircle, XCircle, Send } from 'lucide-react';
import { useTrainingAuth } from '../../context/TrainingAuthContext';

// ── Data ────────────────────────────────────────────────────────────────────────

const CAREER_LADDER = [
  { title: '技術員', level: 1, minScore: 0, color: 'bg-gray-200 text-gray-700' },
  { title: '班長', level: 2, minScore: 65, color: 'bg-green-100 text-green-700' },
  { title: '副組長', level: 3, minScore: 70, color: 'bg-teal-100 text-teal-700' },
  { title: '組長', level: 4, minScore: 75, color: 'bg-blue-100 text-blue-700' },
  { title: '副課長', level: 5, minScore: 78, color: 'bg-indigo-100 text-indigo-700' },
  { title: '課長', level: 6, minScore: 82, color: 'bg-purple-100 text-purple-700' },
  { title: '副理', level: 7, minScore: 85, color: 'bg-orange-100 text-orange-700' },
  { title: '經理', level: 8, minScore: 90, color: 'bg-red-100 text-red-700' },
];

const CURRENT_POSITION_TITLE = '技術員';
const CURRENT_LEVEL = 1;

const DEPARTMENTS = [
  '組裝一線', '組裝二線', '品保課', '工程課', '生管課',
  '採購課', '資材課', '模具課', '設備課', '總務課', '人資課', '財務課',
];

const ROTATION_QUESTIONS = [
  '您對該部門的工作內容有基本了解',
  '您具備該部門所需的基本技術技能',
  '您能適應不同的工作環境和節奏',
  '您有意願學習新的工作技能',
  '您能接受短期績效下降的過渡期',
  '您的溝通協作能力可在新部門發揮',
  '您對跨部門合作有正面的經驗',
  '您在壓力下能保持穩定的工作品質',
  '您的主管支持您進行部門輪調',
  '您已完成相關部門的基礎訓練課程',
];

const SCORE_LABELS: Record<number, string> = {
  1: '非常不同意',
  2: '不同意',
  3: '普通',
  4: '同意',
  5: '非常同意',
};

const TARGET_POSITION_COURSES: Record<string, string[]> = {
  '班長': ['基層主管管理技能', '5S推行與現場管理實務', '溝通與表達技巧'],
  '副組長': ['基層主管管理技能', '生產排程與效率管理', '問題解決與改善技術'],
  '組長': ['中階管理能力提升', '績效管理與目標設定', '跨部門溝通協作'],
  '副課長': ['中階管理能力提升', '品質管理系統', '財務基礎概念'],
  '課長': ['高階管理領導力', '策略規劃與執行', '部門預算管理'],
  '副理': ['高階主管領導力', '人才發展與培育', '企業策略管理'],
  '經理': ['企業高階領導力', '組織文化建設', '業務發展策略'],
};

// Mock competency data for radar
const COMPETENCY_DATA = [
  { subject: '專業技能', self: 72, required: 65 },
  { subject: '溝通協作', self: 55, required: 55 },
  { subject: '領導管理', self: 45, required: 45 },
  { subject: '問題解決', self: 70, required: 60 },
  { subject: '團隊合作', self: 75, required: 70 },
  { subject: '安全意識', self: 85, required: 85 },
];

const AI_ADVICE_TEXT = `根據您目前在組裝一線技術員的職位，以及您的職能評估結果：

✅ 優勢：安全意識(85分)、團隊合作(75分)表現優異
⚠️ 待加強：領導管理(45分)、溝通協作(55分)與目標職位有差距

建議職涯路徑：技術員 → 班長（預計18個月）
建議課程：
• 基層主管管理技能（必修）
• 溝通與表達技巧
• 5S推行與現場管理實務

輪調機會：品保課 - 您的技術背景適合品質管理工作`;

// ── Section 1: Career Ladder ────────────────────────────────────────────────────

function CareerLadderSection() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
          <Map size={18} className="text-blue-600" />
        </div>
        <div>
          <h2 className="font-bold text-gray-900 text-lg">我的職涯路徑</h2>
          <p className="text-xs text-gray-500">點亮您的成長軌跡</p>
        </div>
      </div>

      {/* Ladder Steps */}
      <div className="overflow-x-auto pb-2">
        <div className="flex items-center gap-2 min-w-max">
          {CAREER_LADDER.map((step, idx) => {
            const isCurrent = step.title === CURRENT_POSITION_TITLE;
            const isPassed = step.level < CURRENT_LEVEL;
            const isNext = step.level === CURRENT_LEVEL + 1;
            return (
              <div key={step.title} className="flex items-center">
                <div
                  className={`relative flex flex-col items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all min-w-[90px] ${
                    isCurrent
                      ? 'border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-200'
                      : isPassed
                      ? 'border-green-300 bg-green-50 text-green-700'
                      : isNext
                      ? 'border-dashed border-blue-300 bg-blue-50/60 text-blue-600'
                      : 'border-gray-200 bg-gray-50 text-gray-400'
                  }`}
                >
                  {isCurrent && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full font-semibold whitespace-nowrap">
                      目前職位
                    </span>
                  )}
                  {isNext && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-semibold whitespace-nowrap">
                      下一目標
                    </span>
                  )}
                  <span className={`text-sm font-bold ${isCurrent ? 'text-white' : ''}`}>{step.title}</span>
                  <span className={`text-xs ${isCurrent ? 'text-blue-200' : 'text-gray-400'}`}>
                    Lv.{step.level}
                  </span>
                  {!isCurrent && !isPassed && (
                    <span className={`text-xs ${isNext ? 'text-blue-500' : 'text-gray-400'}`}>
                      需達 {step.minScore}分
                    </span>
                  )}
                  {isPassed && <CheckCircle size={14} className="text-green-500" />}
                </div>
                {idx < CAREER_LADDER.length - 1 && (
                  <ChevronRight size={18} className={`mx-1 ${idx < CURRENT_LEVEL - 1 ? 'text-green-400' : 'text-gray-300'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Gap to promotion */}
      <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
        <p className="text-sm font-semibold text-blue-800 mb-2">距離晉升「班長」所需條件</p>
        <div className="space-y-2">
          {[
            { label: '職能評估', current: 68, required: 65, unit: '分' },
            { label: '訓練時數', current: 42, required: 60, unit: '小時' },
            { label: '必修課程', current: 3, required: 5, unit: '門' },
          ].map(({ label, current, required, unit }) => {
            const pct = Math.min(100, Math.round((current / required) * 100));
            const met = current >= required;
            return (
              <div key={label}>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span className="font-medium">{label}</span>
                  <span className={met ? 'text-green-600 font-semibold' : 'text-orange-500'}>
                    {current}/{required} {unit} {met ? '✅' : `(差 ${required - current} ${unit})`}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all ${met ? 'bg-green-400' : 'bg-blue-400'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Section 2: Goal Setting ─────────────────────────────────────────────────────

function GoalSettingSection() {
  const [targetPosition, setTargetPosition] = useState('班長');
  const [targetDate, setTargetDate] = useState('2027-12-31');

  const courses = TARGET_POSITION_COURSES[targetPosition] || [];
  const radarData = COMPETENCY_DATA;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center">
          <Target size={18} className="text-purple-600" />
        </div>
        <div>
          <h2 className="font-bold text-gray-900 text-lg">職涯目標設定</h2>
          <p className="text-xs text-gray-500">規劃您的成長目標</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: selectors + courses */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">目標職位</label>
            <select
              value={targetPosition}
              onChange={(e) => setTargetPosition(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {CAREER_LADDER.filter((s) => s.level > CURRENT_LEVEL).map((s) => (
                <option key={s.title} value={s.title}>{s.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">目標達成日期</label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">達成目標所需課程</label>
            <div className="space-y-2">
              {courses.map((course, i) => (
                <div key={i} className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold shrink-0">
                    {i + 1}
                  </div>
                  <span className="text-sm text-blue-800 font-medium">{course}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: radar chart */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">職能差距視覺化</p>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9, fill: '#9ca3af' }} />
              <Radar name="目前能力" dataKey="self" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} />
              <Radar name="目標需求" dataKey="required" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} strokeDasharray="5 3" />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 text-xs text-gray-500 mt-1">
            <span className="flex items-center gap-1.5"><span className="w-3 h-1 bg-blue-500 rounded inline-block" /> 目前能力</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-1 bg-amber-400 rounded inline-block" style={{ border: '1px dashed' }} /> 目標需求</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Section 3: Rotation Assessment ─────────────────────────────────────────────

interface RotationResult {
  score: number;
  recommendation: string;
  level: 'excellent' | 'good' | 'warn' | 'no';
  courses: string[];
}

function RotationAssessmentSection() {
  const [targetDept, setTargetDept] = useState(DEPARTMENTS[2]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<RotationResult | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    const total = Object.values(answers).reduce((s, v) => s + v, 0);
    let recommendation = '';
    let level: RotationResult['level'] = 'no';
    let courses: string[] = [];

    if (total >= 40) {
      recommendation = '✅ 非常適合輪調，建議申請';
      level = 'excellent';
      courses = [];
    } else if (total >= 30) {
      recommendation = '✅ 適合輪調，可進一步了解';
      level = 'good';
      courses = ['跨部門業務概論'];
    } else if (total >= 20) {
      recommendation = '⚠️ 建議先完成相關訓練課程';
      level = 'warn';
      courses = ['跨部門業務概論', '溝通與表達技巧', `${targetDept}基礎作業訓練`];
    } else {
      recommendation = '❌ 目前尚不適合，請繼續累積技能';
      level = 'no';
      courses = ['跨部門業務概論', '溝通與表達技巧', `${targetDept}基礎作業訓練`, '職場適應力培訓'];
    }

    setResult({ score: total, recommendation, level, courses });
    setSubmitted(true);
  };

  const allAnswered = Object.keys(answers).length === ROTATION_QUESTIONS.length;

  const resultColors: Record<RotationResult['level'], string> = {
    excellent: 'bg-green-50 border-green-200 text-green-800',
    good: 'bg-blue-50 border-blue-200 text-blue-800',
    warn: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    no: 'bg-red-50 border-red-200 text-red-800',
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center">
          <ClipboardList size={18} className="text-green-600" />
        </div>
        <div>
          <h2 className="font-bold text-gray-900 text-lg">部門輪調適合度評估</h2>
          <p className="text-xs text-gray-500">評估您對目標部門的適合度</p>
        </div>
      </div>

      {/* Dept selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">選擇目標輪調部門</label>
        <select
          value={targetDept}
          onChange={(e) => { setTargetDept(e.target.value); setSubmitted(false); setResult(null); setAnswers({}); }}
          className="w-full sm:w-64 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {/* Questions */}
      {!submitted && (
        <div className="space-y-5">
          {ROTATION_QUESTIONS.map((q, idx) => (
            <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-sm font-medium text-gray-800 mb-3">
                <span className="text-blue-600 font-bold mr-2">{idx + 1}.</span>
                {q}
              </p>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((score) => (
                  <button
                    key={score}
                    onClick={() => setAnswers((prev) => ({ ...prev, [idx]: score }))}
                    className={`flex-1 min-w-[60px] py-1.5 px-2 rounded-lg text-xs font-medium border transition-all ${
                      answers[idx] === score
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                    }`}
                  >
                    {score} {SCORE_LABELS[score]}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <button
            onClick={handleSubmit}
            disabled={!allAnswered}
            className={`w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              allAnswered
                ? 'bg-green-600 text-white hover:bg-green-700 shadow-sm'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send size={16} />
            提交評估
          </button>
        </div>
      )}

      {/* Result */}
      {submitted && result && (
        <div className="space-y-4">
          <div className={`p-5 rounded-xl border ${resultColors[result.level]}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-bold text-lg mb-1">{result.recommendation}</p>
                <p className="text-sm opacity-80">目標部門：{targetDept}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">{result.score}</p>
                <p className="text-xs opacity-70">/ 50 分</p>
              </div>
            </div>
            <div className="w-full bg-white/60 rounded-full h-3 mt-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  result.level === 'excellent' ? 'bg-green-500' :
                  result.level === 'good' ? 'bg-blue-500' :
                  result.level === 'warn' ? 'bg-yellow-500' : 'bg-red-400'
                }`}
                style={{ width: `${(result.score / 50) * 100}%` }}
              />
            </div>
          </div>

          {result.courses.length > 0 && (
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
              <p className="text-sm font-semibold text-amber-800 mb-2">建議補修課程</p>
              <ul className="space-y-1">
                {result.courses.map((c, i) => (
                  <li key={i} className="text-sm text-amber-700 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => { setSubmitted(false); setResult(null); setAnswers({}); }}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              重新評估
            </button>
            <button className="flex-1 py-2.5 bg-blue-600 rounded-xl text-sm font-bold text-white hover:bg-blue-700 flex items-center justify-center gap-2">
              <Send size={14} />
              提交評估結果給主管
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Section 4: AI Career Advice ─────────────────────────────────────────────────

function AICareerAdviceSection() {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [started, setStarted] = useState(false);
  const indexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startTyping = () => {
    setStarted(true);
    setIsTyping(true);
    setDisplayedText('');
    indexRef.current = 0;

    const typeNext = () => {
      if (indexRef.current < AI_ADVICE_TEXT.length) {
        setDisplayedText(AI_ADVICE_TEXT.slice(0, indexRef.current + 1));
        indexRef.current++;
        timerRef.current = setTimeout(typeNext, 18);
      } else {
        setIsTyping(false);
      }
    };

    timerRef.current = setTimeout(typeNext, 200);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
          <BrainCircuit size={18} className="text-indigo-600" />
        </div>
        <div>
          <h2 className="font-bold text-gray-900 text-lg">AI 職涯建議</h2>
          <p className="text-xs text-gray-500">基於您的職能評估與課程完成記錄</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 rounded-full border border-indigo-100">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          <span className="text-xs text-indigo-600 font-medium">AI 分析</span>
        </div>
      </div>

      {/* Context pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {['職位：技術員', '部門：組裝一線', '職能分數：68分', '完成課程：3門'].map((tag) => (
          <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{tag}</span>
        ))}
      </div>

      {/* Advice text area */}
      <div className="min-h-[200px] bg-gray-50 rounded-xl border border-gray-100 p-5 text-sm text-gray-800 leading-relaxed font-mono">
        {!started ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <BrainCircuit size={32} className="mb-3 text-gray-300" />
            <p className="text-sm mb-3">點擊下方按鈕，生成個人化職涯建議</p>
          </div>
        ) : (
          <span>
            {displayedText}
            {isTyping && <span className="animate-pulse text-indigo-500 font-bold">|</span>}
          </span>
        )}
      </div>

      <div className="mt-4 flex gap-3">
        <button
          onClick={startTyping}
          disabled={isTyping}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            isTyping
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          <BrainCircuit size={16} />
          {isTyping ? '分析中...' : started ? '重新生成建議' : '生成 AI 職涯建議'}
        </button>
        {started && !isTyping && (
          <button className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
            <Send size={14} />
            傳送給主管
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────────

const SECTIONS = [
  { id: 'ladder', label: '職涯路徑', icon: Map },
  { id: 'goal', label: '目標設定', icon: Target },
  { id: 'rotation', label: '輪調評估', icon: ClipboardList },
  { id: 'ai', label: 'AI 建議', icon: BrainCircuit },
] as const;

type SectionId = typeof SECTIONS[number]['id'];

export default function CareerPlanning() {
  const { currentUser } = useTrainingAuth();
  const [activeSection, setActiveSection] = useState<SectionId>('ladder');

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Map size={22} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">職涯規劃中心</h1>
            <p className="text-sm text-gray-500">{currentUser?.name} · {currentUser?.department}</p>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-1">探索您的成長路徑，設定目標，評估輪調適合度，獲取 AI 個人化建議</p>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 overflow-x-auto">
        {SECTIONS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id)}
            className={`flex-1 min-w-max flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeSection === id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon size={15} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Section content */}
      {activeSection === 'ladder' && <CareerLadderSection />}
      {activeSection === 'goal' && <GoalSettingSection />}
      {activeSection === 'rotation' && <RotationAssessmentSection />}
      {activeSection === 'ai' && <AICareerAdviceSection />}
    </div>
  );
}
