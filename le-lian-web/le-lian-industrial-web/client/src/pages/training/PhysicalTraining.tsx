import { useState, useEffect, useRef } from 'react';
import { ClipboardList, Plus, Trash2, FileSpreadsheet, CheckCircle, Clock, AlertCircle, Edit3, X, Save, Image, Users, BookOpen } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useTrainingAuth } from '../../context/TrainingAuthContext';

// ── Types ──────────────────────────────────────────────────────────────────────
interface PhysicalRecord {
  id: string;
  courseName: string;
  trainingType: '內訓' | '外訓';
  date: string;
  hours: number;
  venue: string;
  instructor: string;
  department: string;
  participants: number;
  ttqsPhase: 'Plan' | 'Design' | 'Do' | 'Review' | 'Action';
  outcome: string;
  evidence: string;
  status: '待審核' | '已審核' | '已存檔';
  photos?: string[];
}

interface RoutineCourse {
  id: string;
  courseName: string;
  instructor: string;
  date: string;
  hours: number;
  department: string;
  participants: string[];
  outline: string;
  status: 'draft' | 'submitted' | 'approved' | 'completed';
  submittedBy: string;
  photos?: string[];
}

const TTQS_PHASES = [
  { value: 'Plan',   label: '計劃 (Plan)',   color: 'bg-blue-100 text-blue-700 border-blue-300' },
  { value: 'Design', label: '設計 (Design)', color: 'bg-purple-100 text-purple-700 border-purple-300' },
  { value: 'Do',     label: '執行 (Do)',     color: 'bg-green-100 text-green-700 border-green-300' },
  { value: 'Review', label: '查核 (Review)', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  { value: 'Action', label: '改善 (Action)', color: 'bg-orange-100 text-orange-700 border-orange-300' },
] as const;

const DEPARTMENTS = [
  '總經理室', '品保課', '管理部', '總務課', '營業部', '業務課', '研發課',
  '廠務部', '廠務室', '製造課', '組一組', '組二組', '組三組', '沖床組',
  '塗裝組', '加工組', '財務部', '庶務組', '人資安全組', '全體員工',
];

const SAMPLE_COURSE_NAMES = [
  '防災研習--消防演練', '性別平等教育', '資訊安全教育(防毒防駭)', '一般安全衛生教育訓練',
  '新進員工職前訓練', '勞動法令與人資管理實務', '危險物品與化學品管理', '品質意識與客戶滿意',
  '文件管理與記錄控制', '企業全流程認識ERP管理需求', '沖壓作業安全與品質管理',
  '焊接技術與安全操作', 'AI超能主管班：從溝通到帶人決策全方位',
];

const LS_KEY = 'physical_training_records_v1';
const LS_ROUTINE_KEY = 'routine_courses_v1';

function loadRecords(): PhysicalRecord[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : getInitialRecords();
  } catch { return getInitialRecords(); }
}

function saveRecords(records: PhysicalRecord[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(records));
}

function loadRoutine(): RoutineCourse[] {
  try {
    const raw = localStorage.getItem(LS_ROUTINE_KEY);
    return raw ? JSON.parse(raw) : getInitialRoutine();
  } catch { return getInitialRoutine(); }
}

function saveRoutine(list: RoutineCourse[]) {
  localStorage.setItem(LS_ROUTINE_KEY, JSON.stringify(list));
}

function getInitialRecords(): PhysicalRecord[] {
  return [
    {
      id: 'pt1', courseName: '防災研習--消防演練', trainingType: '內訓',
      date: '2026-01-15', hours: 2, venue: '廠區集合廣場', instructor: '消防隊員 / 陳安全',
      department: '全體員工', participants: 118,
      ttqsPhase: 'Do', outcome: '全體員工完成演練，緊急疏散時間縮短至3分鐘以內',
      evidence: '簽到表、現場照片、演練記錄表', status: '已審核', photos: [],
    },
    {
      id: 'pt2', courseName: '性別平等教育', trainingType: '外訓',
      date: '2026-01-22', hours: 3, venue: '會議室A', instructor: '外部講師',
      department: '全體員工', participants: 120,
      ttqsPhase: 'Do', outcome: '員工對性騷擾防治及申訴程序瞭解度提升',
      evidence: '簽到表、測驗成績單、滿意度調查表', status: '已審核', photos: [],
    },
    {
      id: 'pt3', courseName: '一般安全衛生教育訓練', trainingType: '外訓',
      date: '2026-01-28', hours: 6, venue: '會議室B', instructor: '勞動部認可訓練機構',
      department: '全體員工', participants: 120,
      ttqsPhase: 'Do', outcome: '達成法定6小時安衛訓練要求，測驗平均通過率92%',
      evidence: '簽到表、測驗成績單、結訓證書、機構訓練合格文件', status: '已審核', photos: [],
    },
  ];
}

function getInitialRoutine(): RoutineCourse[] {
  return [
    {
      id: 'rc1', courseName: '新進員工職前訓練', instructor: '人資安全組',
      date: '2026-01-08', hours: 8, department: '全體員工',
      participants: ['王小明', '陳美玲'], outline: '公司規定、安全衛生、基本作業流程介紹',
      status: 'completed', submittedBy: '人資安全組', photos: [],
    },
    {
      id: 'rc2', courseName: '品質管理基礎訓練', instructor: '品保課 張品管',
      date: '2026-02-10', hours: 3, department: '品保課',
      participants: ['陳小芳', '林志偉', '黃品質'],
      outline: '品質管理基本概念、ISO 9001要求、不合格品處理',
      status: 'approved', submittedBy: '張品管', photos: [],
    },
  ];
}

const EMPTY_FORM: Omit<PhysicalRecord, 'id' | 'photos'> = {
  courseName: '', trainingType: '內訓', date: '', hours: 3, venue: '', instructor: '',
  department: '全體員工', participants: 0, ttqsPhase: 'Do', outcome: '', evidence: '', status: '待審核',
};

function TtqsBadge({ phase }: { phase: PhysicalRecord['ttqsPhase'] }) {
  const info = TTQS_PHASES.find(p => p.value === phase);
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${info?.color || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
      {info?.label || phase}
    </span>
  );
}

function StatusBadge({ status }: { status: PhysicalRecord['status'] }) {
  const map: Record<string, string> = {
    '待審核': 'bg-yellow-100 text-yellow-700 border-yellow-300',
    '已審核': 'bg-green-100 text-green-700 border-green-300',
    '已存檔': 'bg-gray-100 text-gray-600 border-gray-200',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${map[status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
      {status}
    </span>
  );
}

function exportToExcel(records: PhysicalRecord[]) {
  const wb = XLSX.utils.book_new();
  const header = ['序號', '課程名稱', '訓練類型', '訓練日期', '時數', '訓練地點', '講師', '部門', '參訓人數', 'TTQS面向', '訓練成效', '佐證文件', '審核狀態'];
  const rows = records.map((r, i) => [
    i + 1, r.courseName, r.trainingType, r.date, r.hours, r.venue, r.instructor,
    r.department, r.participants,
    TTQS_PHASES.find(p => p.value === r.ttqsPhase)?.label || r.ttqsPhase,
    r.outcome, r.evidence, r.status,
  ]);
  const data = [
    ['樂聯工業股份有限公司 - 實體教育訓練記錄表'],
    ['年度: 2026年', '', '', '製作單位: 人資安全組'],
    [''],
    header,
    ...rows,
  ];
  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [{ wch: 5 }, { wch: 30 }, { wch: 8 }, { wch: 12 }, { wch: 6 }, { wch: 16 }, { wch: 14 }, { wch: 14 }, { wch: 8 }, { wch: 16 }, { wch: 30 }, { wch: 25 }, { wch: 8 }];
  XLSX.utils.book_append_sheet(wb, ws, '實體訓練記錄');
  XLSX.writeFile(wb, '樂聯工業_實體訓練記錄_2026.xlsx');
}

// ── Photo Upload helper ────────────────────────────────────────────────────────
function PhotoUploadArea({ photos, onAdd, onRemove }: {
  photos: string[];
  onAdd: (dataUrl: string) => void;
  onRemove: (idx: number) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        if (ev.target?.result) onAdd(ev.target.result as string);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  }
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {photos.map((src, i) => (
          <div key={i} className="relative w-20 h-20 group">
            <img src={src} alt="" className="w-full h-full object-cover rounded-lg border border-gray-200" />
            <button
              onClick={() => onRemove(i)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={10} />
            </button>
          </div>
        ))}
        <button
          onClick={() => fileRef.current?.click()}
          className="w-20 h-20 border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-lg flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-blue-500 transition-colors"
        >
          <Image size={20} />
          <span className="text-xs">上傳照片</span>
        </button>
      </div>
      <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFile} />
      <p className="text-xs text-gray-400">上傳訓練現場照片作為佐證（可多張）</p>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function PhysicalTraining() {
  const { enrollments, courses, users } = useTrainingAuth();
  const [records, setRecords] = useState<PhysicalRecord[]>(() => loadRecords());
  const [routineCourses, setRoutineCourses] = useState<RoutineCourse[]>(() => loadRoutine());
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'participants' | 'routine' | 'ttqs'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<PhysicalRecord, 'id' | 'photos'>>({ ...EMPTY_FORM });
  const [formPhotos, setFormPhotos] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<'全部' | '內訓' | '外訓'>('全部');
  const [filterPhase, setFilterPhase] = useState('全部');
  const [toast, setToast] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<string | null>(null);

  // Routine course state
  const [showAddRoutine, setShowAddRoutine] = useState(false);
  const [expandedRoutine, setExpandedRoutine] = useState<string | null>(null);
  const [routineForm, setRoutineForm] = useState({ courseName: '', instructor: '', date: '', hours: '', department: '', participants: '', outline: '' });
  const [routinePhotos, setRoutinePhotos] = useState<string[]>([]);

  useEffect(() => { saveRecords(records); }, [records]);
  useEffect(() => { saveRoutine(routineCourses); }, [routineCourses]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  function handleSave() {
    if (!form.courseName || !form.date) {
      showToast('請填寫課程名稱和訓練日期');
      return;
    }
    if (editingId) {
      setRecords(prev => prev.map(r => r.id === editingId ? { ...form, id: editingId, photos: formPhotos } : r));
      showToast('已更新訓練記錄');
      setEditingId(null);
    } else {
      setRecords(prev => [...prev, { ...form, id: `pt${Date.now()}`, photos: formPhotos }]);
      showToast('已新增訓練記錄');
    }
    setForm({ ...EMPTY_FORM });
    setFormPhotos([]);
    setActiveTab('list');
  }

  function handleEdit(record: PhysicalRecord) {
    const { id, photos, ...rest } = record;
    setEditingId(id);
    setForm(rest);
    setFormPhotos(photos || []);
    setActiveTab('add');
  }

  function handleDelete(id: string) {
    setRecords(prev => prev.filter(r => r.id !== id));
    showToast('已刪除記錄');
  }

  function handleApprove(id: string) {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status: '已審核' } : r));
    showToast('已審核確認');
  }

  const filtered = records.filter(r => {
    if (filterType !== '全部' && r.trainingType !== filterType) return false;
    if (filterPhase !== '全部' && r.ttqsPhase !== filterPhase) return false;
    return true;
  });

  const totalHours = records.reduce((s, r) => s + r.hours, 0);
  const totalParticipants = records.reduce((s, r) => s + r.participants, 0);
  const approvedCount = records.filter(r => r.status === '已審核').length;

  // Participants tab: get enrollment data for a selected course
  const selectedRecordObj = records.find(r => r.id === selectedRecord);
  const matchingCourse = selectedRecordObj ? courses.find(c =>
    c.title.toLowerCase().includes(selectedRecordObj.courseName.slice(0, 8).toLowerCase()) ||
    selectedRecordObj.courseName.toLowerCase().includes(c.title.slice(0, 8).toLowerCase())
  ) : null;
  const courseEnrollments = matchingCourse
    ? enrollments.filter(e => e.courseId === matchingCourse.id)
    : [];

  const ROUTINE_STATUS_LABELS: Record<RoutineCourse['status'], { label: string; color: string }> = {
    draft: { label: '草稿', color: 'bg-gray-100 text-gray-600' },
    submitted: { label: '待審核', color: 'bg-yellow-100 text-yellow-700' },
    approved: { label: '人資核可', color: 'bg-blue-100 text-blue-700' },
    completed: { label: '已完成', color: 'bg-green-100 text-green-700' },
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <ClipboardList size={28} className="text-indigo-600" />
        <h1 className="text-2xl font-bold text-gray-900">實體教育訓練記錄</h1>
        <span className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold border border-indigo-200">外訓 / 內訓 稽核</span>
        <span className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold border border-orange-200">TTQS 符規</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: '訓練記錄筆數', value: records.length, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: '累計訓練時數', value: `${totalHours}h`, color: 'text-green-600', bg: 'bg-green-50' },
          { label: '累計參訓人次', value: totalParticipants, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: '已審核筆數', value: approvedCount, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-5 text-center`}>
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-sm text-gray-600 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit flex-wrap">
        {([
          ['list', '記錄列表'],
          ['add', editingId ? '編輯記錄' : '新增記錄'],
          ['participants', '參訓人員分析'],
          ['routine', '例行課程'],
          ['ttqs', 'TTQS統計'],
        ] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => { setActiveTab(id); if (id !== 'add') { setEditingId(null); setForm({ ...EMPTY_FORM }); setFormPhotos([]); } }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === id ? 'bg-white text-indigo-700 shadow-sm font-semibold' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── 記錄列表 ── */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500">訓練類型</label>
              <select value={filterType} onChange={e => setFilterType(e.target.value as typeof filterType)} className="pl-2 pr-6 py-1 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {['全部', '內訓', '外訓'].map(v => <option key={v}>{v}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500">TTQS面向</label>
              <select value={filterPhase} onChange={e => setFilterPhase(e.target.value)} className="pl-2 pr-6 py-1 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="全部">全部</option>
                {TTQS_PHASES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <span className="text-xs text-gray-400">共 {filtered.length} 筆記錄</span>
            <div className="ml-auto flex gap-2">
              <button onClick={() => { setActiveTab('add'); setEditingId(null); setForm({ ...EMPTY_FORM }); setFormPhotos([]); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm">
                <Plus size={15} /> 新增記錄
              </button>
              <button onClick={() => exportToExcel(records)} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium shadow-sm">
                <FileSpreadsheet size={15} /> 匯出Excel
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['課程名稱', '類型', '日期', '時數', '講師/地點', '部門', '人數', 'TTQS面向', '照片', '審核狀態', '操作'].map(h => (
                      <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.length === 0 ? (
                    <tr><td colSpan={11} className="px-4 py-12 text-center text-gray-400 text-sm">尚無記錄，請點選「新增記錄」</td></tr>
                  ) : filtered.map(r => (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-3 font-medium text-gray-900 min-w-[160px]">{r.courseName}</td>
                      <td className="px-3 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${r.trainingType === '外訓' ? 'bg-purple-50 text-purple-700' : 'bg-green-50 text-green-700'}`}>{r.trainingType}</span>
                      </td>
                      <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{r.date}</td>
                      <td className="px-3 py-3 text-center font-semibold text-gray-800">{r.hours}h</td>
                      <td className="px-3 py-3 text-xs text-gray-500">
                        <div>{r.instructor}</div>
                        <div className="text-gray-400">{r.venue}</div>
                      </td>
                      <td className="px-3 py-3 text-gray-600 text-xs">{r.department}</td>
                      <td className="px-3 py-3 text-center text-gray-600">{r.participants}</td>
                      <td className="px-3 py-3"><TtqsBadge phase={r.ttqsPhase} /></td>
                      <td className="px-3 py-3">
                        {r.photos && r.photos.length > 0 ? (
                          <div className="flex gap-1">
                            {r.photos.slice(0, 3).map((src, i) => (
                              <img key={i} src={src} alt="" className="w-8 h-8 object-cover rounded border border-gray-200" />
                            ))}
                            {r.photos.length > 3 && <span className="text-xs text-gray-400 self-center">+{r.photos.length - 3}</span>}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3"><StatusBadge status={r.status} /></td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1">
                          {r.status === '待審核' && (
                            <button onClick={() => handleApprove(r.id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg" title="審核通過">
                              <CheckCircle size={15} />
                            </button>
                          )}
                          <button onClick={() => handleEdit(r)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg" title="編輯">
                            <Edit3 size={15} />
                          </button>
                          <button onClick={() => handleDelete(r.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg" title="刪除">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
            <strong>TTQS稽核提醒：</strong>每筆訓練記錄應備妥佐證文件（簽到表、測驗成績、滿意度調查、照片等），並確認對應的TTQS執行面向。可使用「匯出Excel」功能準備稽核文件。
          </div>
        </div>
      )}

      {/* ── 新增/編輯記錄 ── */}
      {activeTab === 'add' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-800">{editingId ? '編輯訓練記錄' : '新增實體訓練記錄'}</h2>
            <button onClick={() => { setActiveTab('list'); setEditingId(null); setForm({ ...EMPTY_FORM }); setFormPhotos([]); }} className="p-1.5 hover:bg-gray-100 rounded-lg">
              <X size={18} className="text-gray-500" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">課程名稱 *</label>
              <input list="course-names" value={form.courseName} onChange={e => setForm(f => ({ ...f, courseName: e.target.value }))} placeholder="輸入或選擇課程名稱" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              <datalist id="course-names">{SAMPLE_COURSE_NAMES.map(n => <option key={n} value={n} />)}</datalist>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">訓練類型</label>
              <div className="flex gap-2">
                {(['內訓', '外訓'] as const).map(t => (
                  <button key={t} onClick={() => setForm(f => ({ ...f, trainingType: t }))} className={`flex-1 py-2 text-sm font-semibold rounded-lg border transition-colors ${form.trainingType === t ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 text-gray-600 hover:border-indigo-300'}`}>{t}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">訓練日期 *</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">訓練時數</label>
              <input type="number" min="1" max="40" value={form.hours} onChange={e => setForm(f => ({ ...f, hours: Number(e.target.value) }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">訓練地點</label>
              <input value={form.venue} onChange={e => setForm(f => ({ ...f, venue: e.target.value }))} placeholder="e.g. 會議室A / 廠區廣場" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">講師姓名</label>
              <input value={form.instructor} onChange={e => setForm(f => ({ ...f, instructor: e.target.value }))} placeholder="e.g. 張講師 / 外部訓練機構" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">目標部門</label>
              <select value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">實際參訓人數</label>
              <input type="number" min="0" value={form.participants} onChange={e => setForm(f => ({ ...f, participants: Number(e.target.value) }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">TTQS 執行面向</label>
              <div className="flex gap-2 flex-wrap">
                {TTQS_PHASES.map(p => (
                  <button key={p.value} onClick={() => setForm(f => ({ ...f, ttqsPhase: p.value }))} className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${form.ttqsPhase === p.value ? p.color : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">訓練成效說明</label>
              <textarea value={form.outcome} onChange={e => setForm(f => ({ ...f, outcome: e.target.value }))} rows={2} placeholder="描述訓練成效、員工回饋、達成目標等" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">佐證文件清單（TTQS稽核用）</label>
              <textarea value={form.evidence} onChange={e => setForm(f => ({ ...f, evidence: e.target.value }))} rows={2} placeholder="e.g. 簽到表、測驗成績單、結訓證書、滿意度調查表、現場照片" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none" />
            </div>

            {/* Photo Upload */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Image size={14} /> 訓練現場照片
              </label>
              <PhotoUploadArea
                photos={formPhotos}
                onAdd={dataUrl => setFormPhotos(prev => [...prev, dataUrl])}
                onRemove={idx => setFormPhotos(prev => prev.filter((_, i) => i !== idx))}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">審核狀態</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as PhysicalRecord['status'] }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
                {(['待審核', '已審核', '已存檔'] as const).map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={() => { setActiveTab('list'); setEditingId(null); setForm({ ...EMPTY_FORM }); setFormPhotos([]); }} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">取消</button>
            <button onClick={handleSave} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 flex items-center justify-center gap-2">
              <Save size={16} />{editingId ? '更新記錄' : '儲存記錄'}
            </button>
          </div>
        </div>
      )}

      {/* ── 參訓人員分析 ── */}
      {activeTab === 'participants' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <h2 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2"><Users size={18} />選擇訓練記錄查看參訓員工資料</h2>
            <select
              value={selectedRecord || ''}
              onChange={e => setSelectedRecord(e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
            >
              <option value="">— 請選擇訓練記錄 —</option>
              {records.map(r => <option key={r.id} value={r.id}>{r.courseName} ({r.date})</option>)}
            </select>
          </div>

          {selectedRecord && (
            <div className="space-y-5">
              {/* Record details */}
              {selectedRecordObj && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div><p className="text-xs text-indigo-500">課程名稱</p><p className="font-semibold text-indigo-900">{selectedRecordObj.courseName}</p></div>
                    <div><p className="text-xs text-indigo-500">訓練日期</p><p className="font-semibold text-indigo-900">{selectedRecordObj.date}</p></div>
                    <div><p className="text-xs text-indigo-500">實際參訓人數</p><p className="font-semibold text-indigo-900">{selectedRecordObj.participants} 人</p></div>
                    <div><p className="text-xs text-indigo-500">訓練時數</p><p className="font-semibold text-indigo-900">{selectedRecordObj.hours} 小時</p></div>
                  </div>
                  {selectedRecordObj.photos && selectedRecordObj.photos.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs text-indigo-500 mb-2">訓練現場照片</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedRecordObj.photos.map((src, i) => (
                          <img key={i} src={src} alt="" className="h-20 w-auto rounded-lg border border-indigo-200 object-cover" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Online enrollment data for matching course */}
              {matchingCourse ? (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                      <BookOpen size={16} />線上課程「{matchingCourse.title}」參訓記錄（{courseEnrollments.length} 人）
                    </h3>
                  </div>
                  {courseEnrollments.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm">尚無員工在線上課程系統中報名此課程</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                          <tr>
                            {['員工姓名', '部門', '學習進度', '心得報告', '滿意度調查', '測驗分數', '狀態'].map(h => (
                              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {courseEnrollments.map(enr => {
                            const user = users.find(u => u.id === enr.userId);
                            return (
                              <tr key={enr.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium text-gray-900">{user?.name || enr.userId}</td>
                                <td className="px-4 py-3 text-xs text-gray-500">{user?.department || '—'}</td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <div className="bg-gray-100 rounded-full h-1.5 w-20">
                                      <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${enr.progressPercent}%` }} />
                                    </div>
                                    <span className="text-xs text-gray-500">{enr.progressPercent}%</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  {enr.reportSubmitted ? (
                                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">已提交</span>
                                  ) : (
                                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">未提交</span>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  {enr.surveySubmitted ? (
                                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">已完成</span>
                                  ) : (
                                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">未完成</span>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  {enr.quizScore !== null ? (
                                    <span className={`text-sm font-bold ${enr.quizScore >= 70 ? 'text-green-700' : 'text-red-600'}`}>{enr.quizScore}分</span>
                                  ) : (
                                    <span className="text-xs text-gray-400">—</span>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  {enr.status === 'completed' ? (
                                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">已完成</span>
                                  ) : enr.status === 'pending_review' ? (
                                    <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full font-medium">待審核</span>
                                  ) : (
                                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">進行中</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm">
                  <BookOpen size={32} className="mx-auto mb-3 opacity-30" />
                  <p>此實體訓練記錄未找到對應的線上課程資料</p>
                  <p className="text-xs mt-1">如需追蹤員工數位學習資料，請在課程庫建立對應的線上課程</p>
                </div>
              )}
            </div>
          )}

          {!selectedRecord && (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
              <Users size={40} className="mx-auto mb-3 opacity-30" />
              <p>請選擇上方的訓練記錄</p>
              <p className="text-xs mt-1">查看對應員工的學習進度、心得報告及滿意度調查</p>
            </div>
          )}
        </div>
      )}

      {/* ── 例行課程 ── */}
      {activeTab === 'routine' && (
        <div className="space-y-5">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
            <p className="font-semibold mb-1">例行課程工作流程</p>
            <p>授課人員建立課程資料 / 課程大綱 / 上課照片 / 上課名單 → 送簽人資單位 → 人資審核後建立簽到表 → 收集心得報告與滿意度調查</p>
          </div>

          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">例行課程清單（{routineCourses.length} 筆）</h2>
            <button onClick={() => { setShowAddRoutine(true); setRoutinePhotos([]); }} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
              <Plus size={15} /> 新增例行課程
            </button>
          </div>

          <div className="space-y-3">
            {routineCourses.map(rc => {
              const s = ROUTINE_STATUS_LABELS[rc.status];
              return (
                <div key={rc.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedRoutine(expandedRoutine === rc.id ? null : rc.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-900 text-sm">{rc.courseName}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.color}`}>{s.label}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{rc.date} · {rc.hours}h · {rc.department} · 講師：{rc.instructor}</p>
                        <p className="text-xs text-gray-400 mt-0.5">學員：{rc.participants.join('、') || '尚未設定'}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {rc.photos && rc.photos.length > 0 && (
                          <span className="text-xs text-indigo-500 flex items-center gap-1"><Image size={12} />{rc.photos.length}張</span>
                        )}
                        {rc.status === 'draft' && (
                          <button
                            onClick={e => { e.stopPropagation(); setRoutineCourses(prev => prev.map(r => r.id === rc.id ? { ...r, status: 'submitted' } : r)); showToast('已送簽人資'); }}
                            className="text-xs bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-lg"
                          >
                            送簽人資
                          </button>
                        )}
                        {rc.status === 'submitted' && (
                          <button
                            onClick={e => { e.stopPropagation(); setRoutineCourses(prev => prev.map(r => r.id === rc.id ? { ...r, status: 'approved' } : r)); showToast('人資已核可'); }}
                            className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg"
                          >
                            人資核可
                          </button>
                        )}
                        {rc.status === 'approved' && (
                          <button
                            onClick={e => { e.stopPropagation(); setRoutineCourses(prev => prev.map(r => r.id === rc.id ? { ...r, status: 'completed' } : r)); showToast('課程已完成'); }}
                            className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg"
                          >
                            標記完成
                          </button>
                        )}
                        <button
                          onClick={e => { e.stopPropagation(); setRoutineCourses(prev => prev.filter(r => r.id !== rc.id)); showToast('已刪除'); }}
                          className="p-1 text-gray-400 hover:text-red-500 rounded"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {expandedRoutine === rc.id && (
                    <div className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-3 bg-gray-50">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1">課程大綱</p>
                        <p className="text-sm text-gray-700">{rc.outline || '（未填寫）'}</p>
                      </div>
                      {rc.photos && rc.photos.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-2">上課照片</p>
                          <div className="flex flex-wrap gap-2">
                            {rc.photos.map((src, i) => (
                              <img key={i} src={src} alt="" className="h-20 w-auto rounded-lg border border-gray-200 object-cover" />
                            ))}
                          </div>
                        </div>
                      )}
                      <p className="text-xs text-gray-400">建立者：{rc.submittedBy}</p>
                    </div>
                  )}
                </div>
              );
            })}

            {routineCourses.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <ClipboardList size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">尚無例行課程記錄</p>
              </div>
            )}
          </div>

          {/* Add routine course modal */}
          {showAddRoutine && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">新增例行課程記錄</h3>
                  <button onClick={() => setShowAddRoutine(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} className="text-gray-500" /></button>
                </div>
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">課程名稱 *</label>
                      <input type="text" value={routineForm.courseName} onChange={e => setRoutineForm(f => ({ ...f, courseName: e.target.value }))} placeholder="請輸入課程名稱" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">講師</label>
                      <input type="text" value={routineForm.instructor} onChange={e => setRoutineForm(f => ({ ...f, instructor: e.target.value }))} placeholder="講師姓名" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">訓練日期</label>
                      <input type="date" value={routineForm.date} onChange={e => setRoutineForm(f => ({ ...f, date: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">訓練時數</label>
                      <input type="number" value={routineForm.hours} onChange={e => setRoutineForm(f => ({ ...f, hours: e.target.value }))} placeholder="2" min={1} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">部門</label>
                      <input type="text" value={routineForm.department} onChange={e => setRoutineForm(f => ({ ...f, department: e.target.value }))} placeholder="受訓部門" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">學員名單（逗號分隔）</label>
                      <input type="text" value={routineForm.participants} onChange={e => setRoutineForm(f => ({ ...f, participants: e.target.value }))} placeholder="王小明,陳美玲,林志偉" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">課程大綱</label>
                      <textarea value={routineForm.outline} onChange={e => setRoutineForm(f => ({ ...f, outline: e.target.value }))} placeholder="課程內容概要..." rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1.5 flex items-center gap-1.5"><Image size={13} />上課照片</label>
                      <PhotoUploadArea
                        photos={routinePhotos}
                        onAdd={d => setRoutinePhotos(prev => [...prev, d])}
                        onRemove={idx => setRoutinePhotos(prev => prev.filter((_, i) => i !== idx))}
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setShowAddRoutine(false)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-medium text-gray-700">取消</button>
                    <button
                      onClick={() => {
                        if (!routineForm.courseName) return;
                        const newRc: RoutineCourse = {
                          id: `rc${Date.now()}`,
                          courseName: routineForm.courseName,
                          instructor: routineForm.instructor,
                          date: routineForm.date,
                          hours: parseInt(routineForm.hours) || 1,
                          department: routineForm.department,
                          participants: routineForm.participants.split(',').map(s => s.trim()).filter(Boolean),
                          outline: routineForm.outline,
                          status: 'draft',
                          submittedBy: '講師',
                          photos: routinePhotos,
                        };
                        setRoutineCourses(prev => [newRc, ...prev]);
                        setRoutineForm({ courseName: '', instructor: '', date: '', hours: '', department: '', participants: '', outline: '' });
                        setRoutinePhotos([]);
                        setShowAddRoutine(false);
                        showToast('例行課程記錄已建立');
                      }}
                      disabled={!routineForm.courseName}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-semibold"
                    >
                      建立記錄
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TTQS統計 ── */}
      {activeTab === 'ttqs' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4">TTQS PDCA 執行進度</h2>
            <div className="space-y-4">
              {TTQS_PHASES.map(p => {
                const phaseRecords = records.filter(r => r.ttqsPhase === p.value);
                const hrs = phaseRecords.reduce((s, r) => s + r.hours, 0);
                const ppl = phaseRecords.reduce((s, r) => s + r.participants, 0);
                return (
                  <div key={p.value} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="w-28 shrink-0"><span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold border ${p.color}`}>{p.label}</span></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-4 text-sm text-gray-700">
                        <span><strong>{phaseRecords.length}</strong> 筆記錄</span>
                        <span><strong>{hrs}</strong> 小時</span>
                        <span><strong>{ppl}</strong> 人次</span>
                      </div>
                      {phaseRecords.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {phaseRecords.slice(0, 3).map(r => (
                            <div key={r.id} className="text-xs text-gray-500 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full shrink-0" />
                              <span>{r.courseName}</span>
                              <span className="text-gray-400">({r.date})</span>
                              <StatusBadge status={r.status} />
                            </div>
                          ))}
                          {phaseRecords.length > 3 && <div className="text-xs text-gray-400">...還有 {phaseRecords.length - 3} 筆</div>}
                        </div>
                      )}
                      {phaseRecords.length === 0 && <div className="mt-1 text-xs text-gray-400 flex items-center gap-1"><AlertCircle size={12} />尚無記錄，建議補充此面向的訓練佐證</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-800">稽核準備狀態</h2>
              <button onClick={() => exportToExcel(records)} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium">
                <FileSpreadsheet size={15} /> 匯出稽核文件
              </button>
            </div>
            <div className="space-y-3">
              {[
                { label: '年度訓練計畫已制定', done: true },
                { label: '訓練記錄筆數 ≥ 10 筆', done: records.length >= 10 },
                { label: 'PDCA 五面向均有記錄', done: TTQS_PHASES.every(p => records.some(r => r.ttqsPhase === p.value)) },
                { label: '所有記錄均已審核確認', done: records.every(r => r.status !== '待審核') },
                { label: '佐證文件清單已填寫', done: records.filter(r => r.evidence.trim()).length >= records.length * 0.8 },
              ].map(item => (
                <div key={item.label} className={`flex items-center gap-3 p-3 rounded-xl border ${item.done ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                  {item.done ? <CheckCircle size={16} className="text-green-600 shrink-0" /> : <Clock size={16} className="text-amber-500 shrink-0" />}
                  <span className={`text-sm font-medium ${item.done ? 'text-green-800' : 'text-amber-700'}`}>{item.label}</span>
                  <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full ${item.done ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{item.done ? '✓ 符合' : '待完善'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-lg">
          <CheckCircle size={16} className="text-green-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
