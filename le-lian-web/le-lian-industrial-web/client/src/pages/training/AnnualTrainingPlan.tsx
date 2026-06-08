import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { FileSpreadsheet, Plus, Save, Send, CheckCircle, Clock, Grid3X3 } from 'lucide-react';
import * as XLSX from 'xlsx';

// ── Types ──────────────────────────────────────────────────────────────────────
interface PlanRow {
  id: number;
  name: string;
  cat: string;
  type: string;
  target: string;
  hours: number;
  month: string;
  count: number;
  note: string;
}

// ── Mock Data ──────────────────────────────────────────────────────────────────
const INITIAL_ROWS: PlanRow[] = [
  { id: 1, name: '職業安全衛生法規研習', cat: '法規遵循', type: '外部', target: '全體員工', hours: 3, month: '2月', count: 50, note: '每年必辦' },
  { id: 2, name: '5S推行與現場管理', cat: '現場管理', type: '內部', target: '生產線員工', hours: 6, month: '3月', count: 80, note: '' },
  { id: 3, name: 'iCAP職能評估實務', cat: '職能發展', type: '外部', target: '課長以上', hours: 8, month: '4月', count: 20, note: 'TTQS必要' },
  { id: 4, name: '外籍員工文化融合', cat: '管理能力', type: '內部', target: '全體主管', hours: 4, month: '5月', count: 30, note: '含泰越印尼文' },
  { id: 5, name: '智慧製造導入實務', cat: '技術提升', type: '外部', target: '工程師', hours: 12, month: '6月', count: 15, note: '' },
];

const MONTHLY_DATA = [
  { month: '1月', 計畫: 0, 實際: 0 },
  { month: '2月', 計畫: 3, 實際: 3 },
  { month: '3月', 計畫: 6, 實際: 5 },
  { month: '4月', 計畫: 8, 實際: 7 },
  { month: '5月', 計畫: 4, 實際: 0 },
  { month: '6月', 計畫: 12, 實際: 0 },
  { month: '7月', 計畫: 0, 實際: 0 },
  { month: '8月', 計畫: 6, 實際: 0 },
  { month: '9月', 計畫: 4, 實際: 0 },
  { month: '10月', 計畫: 8, 實際: 0 },
  { month: '11月', 計畫: 3, 實際: 0 },
  { month: '12月', 計畫: 2, 實際: 0 },
];

const COURSE_TRACK = [
  { name: '職業安全衛生法規研習', planned: 3, actual: 3, rate: 100, participants: 48, status: '已完成' },
  { name: '5S推行與現場管理', planned: 6, actual: 5, rate: 83, participants: 72, status: '進行中' },
  { name: 'iCAP職能評估實務', planned: 8, actual: 7, rate: 88, participants: 19, status: '進行中' },
  { name: '外籍員工文化融合', planned: 4, actual: 0, rate: 0, participants: 0, status: '未開始' },
  { name: '智慧製造導入實務', planned: 12, actual: 0, rate: 0, participants: 0, status: '未開始' },
];

// Course map data
type CellStatus = '未規劃' | '規劃中' | '已完成';
interface CourseCell { courses: string[]; status: CellStatus }
type CourseMapData = Record<string, Record<string, CourseCell>>;

const COURSE_MAP: CourseMapData = {
  '一職等\n(技術員/班長)': {
    '核心職能': { courses: ['5S現場管理', '工廠安全'], status: '已完成' },
    '專業技能': { courses: ['衝壓成型基礎'], status: '規劃中' },
    '法規遵循': { courses: ['安全衛生法規'], status: '已完成' },
    '管理能力': { courses: [], status: '未規劃' },
    '安全衛生': { courses: ['危害辨識實務'], status: '規劃中' },
  },
  '二~三職等\n(助理/組長)': {
    '核心職能': { courses: ['溝通協作', '問題解決'], status: '規劃中' },
    '專業技能': { courses: ['生產管理實務'], status: '規劃中' },
    '法規遵循': { courses: ['勞基法研習'], status: '已完成' },
    '管理能力': { courses: ['班組管理'], status: '規劃中' },
    '安全衛生': { courses: ['職安衛基礎'], status: '已完成' },
  },
  '四~六職等\n(工程師/課長)': {
    '核心職能': { courses: ['跨部門協作', '專案管理'], status: '已完成' },
    '專業技能': { courses: ['智慧製造', '品質管制'], status: '規劃中' },
    '法規遵循': { courses: ['iCAP職能評估'], status: '規劃中' },
    '管理能力': { courses: ['中階主管培訓'], status: '規劃中' },
    '安全衛生': { courses: ['安全管理系統'], status: '規劃中' },
  },
  '七~九職等\n(經理以上)': {
    '核心職能': { courses: ['策略管理', '領導力'], status: '規劃中' },
    '專業技能': { courses: ['工業4.0趨勢'], status: '規劃中' },
    '法規遵循': { courses: ['TTQS評核準備'], status: '規劃中' },
    '管理能力': { courses: ['高階主管領導', '企業倫理'], status: '規劃中' },
    '安全衛生': { courses: [], status: '未規劃' },
  },
};

const GRADE_ROWS = Object.keys(COURSE_MAP);
const COMPETENCY_COLS = ['核心職能', '專業技能', '法規遵循', '管理能力', '安全衛生'];

// ── XLSX export functions ──────────────────────────────────────────────────────
function exportAnnualPlan() {
  const wb = XLSX.utils.book_new();
  const data = [
    ['樂聯工業股份有限公司 - 年度教育訓練計畫', '', '', '', '', '', ''],
    ['計畫年度:', '2026年', '', '製作單位:', '人力資源課', '', ''],
    ['', '', '', '', '', '', ''],
    ['序號', '課程名稱', '訓練類別', '訓練類型', '目標對象', '計畫時數', '預定月份', '預計人數', '備註'],
    [1, '職業安全衛生法規研習', '法規遵循', '外部', '全體員工', 3, '2月', 50, '每年必辦'],
    [2, '5S推行與現場管理', '現場管理', '內部', '生產線員工', 6, '3月', 80, ''],
    [3, 'iCAP職能評估實務', '職能發展', '外部', '課長以上', 8, '4月', 20, 'TTQS必要'],
    [4, '外籍員工文化融合', '管理能力', '內部', '全體主管', 4, '5月', 30, '含多語言'],
    [5, '智慧製造導入實務', '技術提升', '外部', '工程師', 12, '6月', 15, ''],
  ];
  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [{ wch: 6 }, { wch: 25 }, { wch: 12 }, { wch: 10 }, { wch: 15 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, ws, '年度訓練計畫');
  XLSX.writeFile(wb, '樂聯工業_年度教育訓練計畫_2026.xlsx');
}

function exportTTQS() {
  const wb = XLSX.utils.book_new();
  const data = [
    ['TTQS人才發展品質管理系統 - 訓練品質評核表'],
    ['企業名稱: 樂聯工業股份有限公司'],
    ['評核年度: 2026年'],
    [''],
    ['評核面向', '評核項目', '評核說明', '文件佐證', '狀態'],
    ['計劃(Plan)', '訓練需求分析', '依SWOT分析及部門需求制定年度訓練需求', '訓練需求調查表', '✅ 完成'],
    ['計劃(Plan)', '年度訓練計畫', '完成次年度教育訓練課程地圖及計畫', '年度訓練計畫表', '✅ 完成'],
    ['設計(Design)', '課程設計', '依職能標準設計課程內容及測驗題庫', '課程大綱/題庫', '✅ 完成'],
    ['執行(Do)', '講師資格', '建立內外部講師檔案及資格認定', '講師名冊', '✅ 完成'],
    ['執行(Do)', '學員管理', '課程報名、簽到、出席管理', '簽到表', '✅ 完成'],
    ['查核(Review)', '訓練成效', '測驗成績、滿意度調查、心得報告', '成績/調查/報告', '✅ 完成'],
    ['改善(Action)', '年度檢討', '彙整訓練成效提報主管會議並改善', '年度成效報告', '⏳ 進行中'],
  ];
  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [{ wch: 15 }, { wch: 20 }, { wch: 35 }, { wch: 20 }, { wch: 10 }];
  XLSX.utils.book_append_sheet(wb, ws, 'TTQS評核表');
  XLSX.writeFile(wb, '樂聯工業_TTQS評核表_2026.xlsx');
}

function exportSignInSheet() {
  const wb = XLSX.utils.book_new();
  const data: (string | number)[][] = [
    ['樂聯工業股份有限公司 教育訓練人員簽到(退)表'],
    ['課程名稱:', '職業安全衛生法規研習', '', '訓練日期:', '2026/03/15'],
    ['講師姓名:', '陳講師', '', '訓練地點:', '會議室A'],
    [''],
    ['序號', '員工姓名', '部門', '職稱', '簽到時間', '簽退時間', '備註'],
    ...Array.from({ length: 20 }, (_, i) => [i + 1, '', '', '', '', '', '']),
  ];
  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [{ wch: 6 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, ws, '簽到表');
  XLSX.writeFile(wb, '樂聯工業_教育訓練簽到表.xlsx');
}

function exportCourseMap() {
  const wb = XLSX.utils.book_new();
  const header = ['職等', ...COMPETENCY_COLS];
  const rows = GRADE_ROWS.map((grade) => {
    const gradeLabel = grade.replace('\n', ' ');
    return [gradeLabel, ...COMPETENCY_COLS.map((col) => {
      const cell = COURSE_MAP[grade][col];
      return `${cell.status}: ${cell.courses.join(', ') || '無'}`;
    })];
  });
  const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
  ws['!cols'] = [{ wch: 20 }, ...COMPETENCY_COLS.map(() => ({ wch: 20 }))];
  XLSX.utils.book_append_sheet(wb, ws, '課程地圖');
  XLSX.writeFile(wb, '樂聯工業_課程地圖_2026.xlsx');
}

// ── Status badge helper ────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    草稿: 'bg-gray-100 text-gray-700 border-gray-300',
    提交: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    核准: 'bg-green-100 text-green-700 border-green-300',
    已完成: 'bg-green-100 text-green-700',
    進行中: 'bg-yellow-100 text-yellow-700',
    未開始: 'bg-gray-100 text-gray-500',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${map[status] || 'bg-gray-100 text-gray-600 border-gray-300'}`}>
      {status}
    </span>
  );
}

function CellStatusColor(status: CellStatus) {
  if (status === '已完成') return 'bg-green-100 border-green-300';
  if (status === '規劃中') return 'bg-yellow-50 border-yellow-300';
  return 'bg-gray-50 border-gray-200';
}

function CellStatusDot(status: CellStatus) {
  if (status === '已完成') return 'bg-green-500';
  if (status === '規劃中') return 'bg-yellow-400';
  return 'bg-gray-300';
}

// ── Quarterly Modal ────────────────────────────────────────────────────────────
const QUARTERLY_COURSES = [
  '職場安全衛生法規實務',
  '5S品質管理管理實踐',
  'ISO 9001 品質管理系統',
  'AI 技術應用與製造業',
  '全車製造業基礎工廠安全生活管理教育',
  '生產線安全意識提升課程',
];

interface QuarterlyModalProps {
  onClose: () => void;
  onConfirm: (year: string, quarter: string, selectedCourses: string[]) => void;
}

function QuarterlyModal({ onClose, onConfirm }: QuarterlyModalProps) {
  const [modalYear, setModalYear] = useState('2026');
  const [quarter, setQuarter] = useState('Q1');
  const [selected, setSelected] = useState<string[]>([...QUARTERLY_COURSES.slice(0, 2)]);

  const toggleCourse = (c: string) => {
    setSelected((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);
  };

  const quarterLabels: Record<string, string> = { Q1: '1-3月', Q2: '4-6月', Q3: '7-9月', Q4: '10-12月' };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">新增季度必修課程計畫</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">年度</label>
              <select
                value={modalYear}
                onChange={(e) => setModalYear(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                {['2025', '2026', '2027'].map((y) => <option key={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">季度</label>
              <div className="flex gap-1">
                {['Q1', 'Q2', 'Q3', 'Q4'].map((q) => (
                  <button
                    key={q}
                    onClick={() => setQuarter(q)}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                      quarter === q ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:border-blue-300'
                    }`}
                  >
                    {q}
                    <span className="block text-[10px] font-normal opacity-70">{quarterLabels[q]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">必修課程</label>
            <div className="space-y-2 max-h-52 overflow-y-auto">
              {QUARTERLY_COURSES.map((c) => (
                <div key={c} className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors">
                  <span className="text-sm text-gray-700 flex-1 min-w-0 truncate">{c}</span>
                  {selected.includes(c) ? (
                    <button
                      onClick={() => toggleCourse(c)}
                      className="ml-2 text-xs px-2 py-1 bg-red-100 text-red-600 hover:bg-red-200 rounded-md transition-colors shrink-0"
                    >
                      刪
                    </button>
                  ) : (
                    <button
                      onClick={() => toggleCourse(c)}
                      className="ml-2 text-xs px-2 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md transition-colors shrink-0"
                    >
                      加入
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
              取消
            </button>
            <button
              onClick={() => { onConfirm(modalYear, quarter, selected); onClose(); }}
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700"
            >
              確認新增
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function AnnualTrainingPlan() {
  const [activeTab, setActiveTab] = useState(0);
  const [year, setYear] = useState('2026');
  const [department, setDepartment] = useState('生產部');
  const [planStatus, setPlanStatus] = useState<'草稿' | '提交' | '核准'>('草稿');
  const [rows, setRows] = useState<PlanRow[]>(INITIAL_ROWS);
  const [savedMsg, setSavedMsg] = useState('');
  const [showQuarterlyModal, setShowQuarterlyModal] = useState(false);

  const tabs = ['年度計畫制定', '課程地圖', 'TTQS執行追蹤', '匯出報表'];

  const totalPlanned = rows.reduce((s, r) => s + r.hours, 0);
  const totalActual = COURSE_TRACK.reduce((s, r) => s + r.actual, 0);
  const completionRate = totalPlanned > 0 ? Math.round((totalActual / totalPlanned) * 100) : 0;
  const totalParticipants = COURSE_TRACK.reduce((s, r) => s + r.participants, 0);

  function handleAddRow() {
    const newId = Math.max(...rows.map((r) => r.id)) + 1;
    setRows((prev) => [...prev, { id: newId, name: '', cat: '', type: '內部', target: '', hours: 0, month: '1月', count: 0, note: '' }]);
  }

  function handleSave() {
    setSavedMsg('已儲存草稿');
    setTimeout(() => setSavedMsg(''), 2000);
  }

  function handleSubmit() {
    setPlanStatus('提交');
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page title */}
      <div className="flex items-center gap-3 flex-wrap">
        <Grid3X3 size={28} className="text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">年度教育訓練計畫</h1>
        <span className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold border border-orange-200">
          TTQS 品質系統
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === i ? 'bg-white text-blue-700 shadow-sm font-semibold' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Tab 1: 年度計畫制定 ── */}
      {activeTab === 0 && (
        <div className="space-y-4">
          {/* Header controls */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">計畫年度：</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="pl-3 pr-8 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="2025">2025年</option>
                  <option value="2026">2026年</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">部門：</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="pl-3 pr-8 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {['生產部', '品保部', '工程部', '業務部', '人資部'].map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">狀態：</label>
                <StatusBadge status={planStatus} />
              </div>
              <div className="ml-auto flex items-center gap-2 flex-wrap">
                {savedMsg && <span className="text-sm text-green-600 font-medium">{savedMsg}</span>}
                <button onClick={() => setShowQuarterlyModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
                  <Plus size={15} /> 新增季度必修課程
                </button>
                <button onClick={handleAddRow} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-sm font-medium transition-colors">
                  <Plus size={15} /> 新增課程
                </button>
                <button onClick={handleSave} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 rounded-lg text-sm font-medium transition-colors">
                  <Save size={15} /> 儲存草稿
                </button>
                <button onClick={handleSubmit} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm">
                  <Send size={15} /> 提交審核
                </button>
              </div>
            </div>
          </div>

          {/* Approval flow */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">審核流程</p>
            <div className="flex items-center gap-2 flex-wrap">
              {['人資確認', '部門主管', '總經理核准'].map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                    planStatus === '草稿' ? 'bg-gray-100 text-gray-400 border-gray-200' :
                    planStatus === '提交' && i === 0 ? 'bg-blue-100 text-blue-700 border-blue-300' :
                    planStatus === '核准' ? 'bg-green-100 text-green-700 border-green-300' :
                    'bg-gray-100 text-gray-400 border-gray-200'
                  }`}>
                    {planStatus === '核准' ? <CheckCircle size={12} /> : <Clock size={12} />}
                    {step}
                  </div>
                  {i < 2 && <span className="text-gray-300">→</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['#', '課程名稱', '類別', '訓練類型', '目標對象', '時數', '預定月份', '預計人數', '備註'].map((h) => (
                      <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2.5 text-gray-400 text-xs">{row.id}</td>
                      <td className="px-3 py-2.5 font-medium text-gray-900 min-w-[160px]">{row.name}</td>
                      <td className="px-3 py-2.5">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{row.cat}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`px-2 py-0.5 rounded text-xs ${row.type === '外部' ? 'bg-purple-50 text-purple-700' : 'bg-green-50 text-green-700'}`}>
                          {row.type}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{row.target}</td>
                      <td className="px-3 py-2.5 text-center font-semibold text-gray-800">{row.hours}h</td>
                      <td className="px-3 py-2.5 text-gray-600">{row.month}</td>
                      <td className="px-3 py-2.5 text-center text-gray-600">{row.count}</td>
                      <td className="px-3 py-2.5 text-xs text-gray-400">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 2: 課程地圖 ── */}
      {activeTab === 1 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-base font-semibold text-gray-800">課程地圖矩陣</h2>
            <div className="flex items-center gap-3 text-xs">
              {(['未規劃', '規劃中', '已完成'] as CellStatus[]).map((s) => (
                <span key={s} className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${CellStatusDot(s)}`} />
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 min-w-[120px]">職等</th>
                  {COMPETENCY_COLS.map((col) => (
                    <th key={col} className="px-4 py-3 text-center text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 min-w-[140px]">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {GRADE_ROWS.map((grade) => (
                  <tr key={grade}>
                    <td className="px-4 py-3 font-semibold text-xs text-gray-700 bg-gray-50 border border-gray-200 whitespace-pre-line leading-relaxed">{grade}</td>
                    {COMPETENCY_COLS.map((col) => {
                      const cell = COURSE_MAP[grade][col];
                      return (
                        <td key={col} className={`px-3 py-2.5 border border-gray-200 ${CellStatusColor(cell.status)}`}>
                          <div className="flex items-center gap-1 mb-1">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${CellStatusDot(cell.status)}`} />
                            <span className="text-xs font-medium text-gray-600">{cell.status}</span>
                          </div>
                          {cell.courses.length > 0 ? (
                            <div className="space-y-0.5">
                              {cell.courses.map((c) => (
                                <div key={c} className="text-xs text-gray-700 leading-tight">{c}</div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-xs text-gray-400 italic">尚未規劃</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Tab 3: TTQS執行追蹤 ── */}
      {activeTab === 2 && (
        <div className="space-y-5">
          {/* Summary stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: '計畫總時數', value: `${totalPlanned}h`, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: '已完成時數', value: `${totalActual}h`, color: 'text-green-600', bg: 'bg-green-50' },
              { label: '完成率', value: `${completionRate}%`, color: 'text-orange-600', bg: 'bg-orange-50' },
              { label: '參訓總人次', value: totalParticipants, color: 'text-purple-600', bg: 'bg-purple-50' },
            ].map((stat) => (
              <div key={stat.label} className={`${stat.bg} rounded-2xl border border-transparent p-5 text-center`}>
                <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Bar chart */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4">月份訓練時數對比（計畫 vs 實際）</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={MONTHLY_DATA} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="計畫" fill="#93c5fd" radius={[4, 4, 0, 0]} />
                <Bar dataKey="實際" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Course tracking table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-800">課程執行追蹤明細</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['課程名稱', '計畫時數', '實際時數', '完成率', '參訓人數', '狀態'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {COURSE_TRACK.map((row) => (
                    <tr key={row.name} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{row.name}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{row.planned}h</td>
                      <td className="px-4 py-3 text-center text-gray-600">{row.actual}h</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${row.rate >= 80 ? 'bg-green-500' : row.rate > 0 ? 'bg-yellow-500' : 'bg-gray-300'}`}
                              style={{ width: `${row.rate}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-gray-700 w-8 text-right">{row.rate}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600">{row.participants}</td>
                      <td className="px-4 py-3"><StatusBadge status={row.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 4: 匯出報表 ── */}
      {activeTab === 3 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
          <h2 className="text-base font-semibold text-gray-800 border-b border-gray-100 pb-3">匯出 Excel 報表</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                label: '年度教育訓練計畫表',
                desc: '匯出完整年度計畫，含課程清單、時數、月份與人數規劃',
                action: exportAnnualPlan,
                color: 'bg-blue-600 hover:bg-blue-700',
              },
              {
                label: 'TTQS評核表',
                desc: '匯出TTQS人才發展品質管理系統評核表，含PDRA各面向說明',
                action: exportTTQS,
                color: 'bg-purple-600 hover:bg-purple-700',
              },
              {
                label: '教育訓練簽到表',
                desc: '匯出空白簽到(退)表，可列印供課程現場使用',
                action: exportSignInSheet,
                color: 'bg-green-600 hover:bg-green-700',
              },
              {
                label: '課程地圖矩陣',
                desc: '匯出各職等 × 職能類別的課程地圖矩陣表',
                action: exportCourseMap,
                color: 'bg-orange-600 hover:bg-orange-700',
              },
            ].map((btn) => (
              <button
                key={btn.label}
                onClick={btn.action}
                className={`${btn.color} text-white rounded-xl p-5 text-left transition-colors shadow-sm hover:shadow-md`}
              >
                <div className="flex items-start gap-3">
                  <FileSpreadsheet size={24} className="shrink-0 mt-0.5 opacity-90" />
                  <div>
                    <div className="font-semibold text-sm">{btn.label}</div>
                    <div className="text-xs opacity-80 mt-1 leading-relaxed">{btn.desc}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700">
            <strong>注意：</strong>匯出的 Excel 文件符合勞動部 TTQS 及 iCAP 職能發展平台規格，可直接用於評核申請。
          </div>
        </div>
      )}

      {/* Quarterly Modal */}
      {showQuarterlyModal && (
        <QuarterlyModal
          onClose={() => setShowQuarterlyModal(false)}
          onConfirm={(yr, q, courses) => {
            const newRows = courses.map((c, i) => ({
              id: Math.max(...rows.map((r) => r.id)) + i + 1,
              name: c,
              cat: '法規遵循',
              type: '內部',
              target: '全體員工',
              hours: 3,
              month: q === 'Q1' ? '3月' : q === 'Q2' ? '6月' : q === 'Q3' ? '9月' : '12月',
              count: 50,
              note: `${yr}年${q}必修`,
            }));
            setRows((prev) => [...prev, ...newRows]);
            setSavedMsg(`已新增 ${courses.length} 門季度必修課程`);
            setTimeout(() => setSavedMsg(''), 2500);
          }}
        />
      )}
    </div>
  );
}
