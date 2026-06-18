import { useState, useEffect, useRef, useMemo } from 'react';
import { ClipboardList, Plus, Trash2, FileSpreadsheet, CheckCircle, Clock, AlertCircle, Edit3, X, Save, Image, Users, BookOpen, TrendingUp, Star, Award, FileText, ClipboardCheck, Printer } from 'lucide-react';
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTrainingAuth } from '../../context/TrainingAuthContext';
import {
  type PhysicalRecord, type RoutineCourse, type CourseDesign, type EffectivenessTracking, TTQS_PHASES,
  loadRecords, saveRecords, loadRoutine, saveRoutine,
} from '../../lib/physicalTrainingStorage';

const NEED_SOURCES = ['年度教育訓練計畫', '稽核缺失改善', '客訴改善', '工安事故改善', '主管需求', '法規要求', '其他'];
const COMPETENCY_OPTIONS = ['專業知識', '設備操作', '品質意識', '工安意識', '問題分析', '溝通能力', '管理能力', '其他'];
const TEACHING_METHOD_OPTIONS = ['講授', '實作', '案例研討', '影片教學', '測驗', '分組討論'];
const COURSE_CATEGORY_OPTIONS = ['新人', '專業', '管理', '工安', '其他'] as const;
const JUDGMENT_OPTIONS = ['成效顯著', '符合預期', '部分達成', '需再訓練'] as const;

const EMPTY_DESIGN: CourseDesign = {
  category: '專業',
  targetAudience: '',
  needSources: [],
  purpose: '',
  competencies: [],
  syllabus: [{ unit: '', content: '', hours: 0 }],
  teachingMethods: [],
  expectedBenefits: { qualityIssueReduction: 0, complaintReduction: 0, safetyViolationReduction: 0, efficiencyImprovement: 0 },
  signOff: {},
};

const EMPTY_EFFECTIVENESS: EffectivenessTracking = {
  trackingDate: '',
  learningOutcome: { attendanceRate: 0, quizAvgScore: 0, passRate: 0, satisfaction: 0 },
  managerEvaluation: { efficiencyImprovement: 3, qualityImprovement: 3, safetyAwarenessImprovement: 3, problemAnalysisImprovement: 3, attitudeImprovement: 3 },
  kpiBefore: { qualityIssues: 0, complaints: 0, safetyViolations: 0, equipmentAnomalies: 0 },
  kpiAfter30Days: { qualityIssues: 0, complaints: 0, safetyViolations: 0, equipmentAnomalies: 0 },
  judgment: '符合預期',
  suggestion: '',
  filledBy: '',
};

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function toggleInArray(arr: string[], value: string): string[] {
  return arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
}

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

function printForm(title: string, bodyHtml: string) {
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <meta charset="utf-8" />
        <style>
          body { font-family: 'Microsoft JhengHei', sans-serif; padding: 24px; color: #1f2937; }
          h1 { font-size: 18px; text-align: center; margin-bottom: 4px; }
          h2 { font-size: 13px; margin: 16px 0 6px; border-left: 4px solid #4f46e5; padding-left: 8px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 8px; font-size: 12px; }
          th, td { border: 1px solid #d1d5db; padding: 6px 8px; text-align: left; }
          th { background: #f3f4f6; width: 140px; }
          .checks span { display: inline-block; margin-right: 14px; }
          .signrow { display: flex; gap: 12px; margin-top: 8px; }
          .signbox { flex: 1; border: 1px solid #d1d5db; border-radius: 6px; padding: 8px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>${bodyHtml}</body>
    </html>
  `);
  win.document.close();
  win.onload = () => win.print();
}

function checkLine(options: string[], selected: string[]): string {
  return `<div class="checks">${options.map(o => `<span>${selected.includes(o) ? '☑' : '☐'} ${o}</span>`).join('')}</div>`;
}

function exportDesignForm(rc: RoutineCourse, d: CourseDesign) {
  const syllabusRows = d.syllabus.map(u => `<tr><td>${u.unit}</td><td>${u.content}</td><td>${u.hours}</td></tr>`).join('');
  const sign = (label: string, s?: { name: string; date: string }) =>
    `<div class="signbox"><div>${label}</div><div>${s ? `${s.name}<br/>${s.date}` : '（未簽核）'}</div></div>`;
  const html = `
    <h1>樂聯工業股份有限公司 教育訓練課程大綱表</h1>
    <table>
      <tr><th>課程名稱</th><td>${rc.courseName}</td><th>課程類別</th><td>${d.category}</td></tr>
      <tr><th>申請部門</th><td>${rc.department}</td><th>講師</th><td>${rc.instructor}</td></tr>
      <tr><th>課程時數</th><td>${rc.hours}</td><th>上課日期</th><td>${rc.date}</td></tr>
      <tr><th>參訓對象</th><td colspan="3">${d.targetAudience}</td></tr>
    </table>
    <h2>課程需求來源</h2>${checkLine(NEED_SOURCES, d.needSources)}
    <h2>課程目的</h2><p>${d.purpose || '（未填寫）'}</p>
    <h2>職能對應</h2>${checkLine(COMPETENCY_OPTIONS, d.competencies)}
    <h2>課程大綱</h2>
    <table><tr><th>單元</th><th>內容</th><th>時數</th></tr>${syllabusRows}</table>
    <h2>教學方式</h2>${checkLine(TEACHING_METHOD_OPTIONS, d.teachingMethods)}
    <h2>預期效益</h2>
    <table>
      <tr><th>品質異常降低</th><td>${d.expectedBenefits.qualityIssueReduction}%</td><th>客訴降低</th><td>${d.expectedBenefits.complaintReduction}%</td></tr>
      <tr><th>工安違規降低</th><td>${d.expectedBenefits.safetyViolationReduction}%</td><th>工作效率提升</th><td>${d.expectedBenefits.efficiencyImprovement}%</td></tr>
    </table>
    <h2>簽核</h2>
    <div class="signrow">
      ${sign('申請人', d.signOff.applicant)}
      ${sign('部門主管', d.signOff.deptManager)}
      ${sign('HR', d.signOff.hr)}
      ${sign('副總', d.signOff.vp)}
    </div>
  `;
  printForm(`課程大綱表-${rc.courseName}`, html);
}

function exportEffectivenessForm(rc: RoutineCourse, e: EffectivenessTracking) {
  const html = `
    <h1>樂聯工業股份有限公司 教育訓練成效追蹤表</h1>
    <table>
      <tr><th>課程名稱</th><td>${rc.courseName}</td><th>上課日期</th><td>${rc.date}</td></tr>
      <tr><th>講師</th><td>${rc.instructor}</td><th>受訓人數</th><td>${rc.participants.length}</td></tr>
      <tr><th>追蹤日期</th><td colspan="3">${e.trackingDate}</td></tr>
    </table>
    <h2>學習成果</h2>
    <table>
      <tr><th>出席率</th><td>${e.learningOutcome.attendanceRate}%</td><th>測驗平均分數</th><td>${e.learningOutcome.quizAvgScore}</td></tr>
      <tr><th>合格率</th><td>${e.learningOutcome.passRate}%</td><th>滿意度</th><td>${e.learningOutcome.satisfaction} / 5</td></tr>
    </table>
    <h2>主管成效評估（1~5分）</h2>
    <table>
      <tr><th>工作效率提升</th><td>${e.managerEvaluation.efficiencyImprovement}</td><th>品質改善</th><td>${e.managerEvaluation.qualityImprovement}</td></tr>
      <tr><th>工安意識提升</th><td>${e.managerEvaluation.safetyAwarenessImprovement}</td><th>問題分析能力提升</th><td>${e.managerEvaluation.problemAnalysisImprovement}</td></tr>
      <tr><th>工作態度改善</th><td>${e.managerEvaluation.attitudeImprovement}</td><td></td><td></td></tr>
    </table>
    <h2>KPI改善追蹤</h2>
    <table>
      <tr><th></th><th>品質異常</th><th>客訴件數</th><th>工安違規</th><th>設備異常</th></tr>
      <tr><th>課前</th><td>${e.kpiBefore.qualityIssues}</td><td>${e.kpiBefore.complaints}</td><td>${e.kpiBefore.safetyViolations}</td><td>${e.kpiBefore.equipmentAnomalies}</td></tr>
      <tr><th>課後30天</th><td>${e.kpiAfter30Days.qualityIssues}</td><td>${e.kpiAfter30Days.complaints}</td><td>${e.kpiAfter30Days.safetyViolations}</td><td>${e.kpiAfter30Days.equipmentAnomalies}</td></tr>
    </table>
    <h2>成效判定</h2>${checkLine([...JUDGMENT_OPTIONS], [e.judgment])}
    <h2>改善建議</h2><p>${e.suggestion || '（未填寫）'}</p>
    <p style="margin-top:16px;font-size:12px;">填寫人：${e.filledBy}</p>
  `;
  printForm(`成效追蹤表-${rc.courseName}`, html);
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
  const { enrollments, courses, users, currentUser } = useTrainingAuth();
  const [records, setRecords] = useState<PhysicalRecord[]>(() => loadRecords());
  const [routineCourses, setRoutineCourses] = useState<RoutineCourse[]>(() => loadRoutine());
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'participants' | 'routine' | 'ttqs' | 'analysis'>('list');
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

  // 課程設計表（表單一）與成效追蹤表（表單二）
  const [designModalFor, setDesignModalFor] = useState<string | null>(null);
  const [designForm, setDesignForm] = useState<CourseDesign>({ ...EMPTY_DESIGN });
  const [effModalFor, setEffModalFor] = useState<string | null>(null);
  const [effForm, setEffForm] = useState<EffectivenessTracking>({ ...EMPTY_EFFECTIVENESS });

  const role = currentUser?.role || '';
  const canSignDeptManager = role === 'manager' || role === 'admin';
  const canSignHr = role === 'hr' || role === 'admin';
  const canSignVp = role === 'vp' || role === 'admin';
  const canFillEffectiveness = role === 'manager' || role === 'admin' || role === 'hr' || role === 'vp';

  function openDesignModal(rc: RoutineCourse) {
    setDesignForm(rc.design ? { ...rc.design } : { ...EMPTY_DESIGN, targetAudience: rc.department });
    setDesignModalFor(rc.id);
  }

  function saveDesign() {
    if (!designModalFor) return;
    setRoutineCourses(prev => prev.map(r => r.id === designModalFor ? { ...r, design: designForm } : r));
    showToast('課程大綱表已儲存');
    setDesignModalFor(null);
  }

  function signDesign(stage: keyof CourseDesign['signOff']) {
    setDesignForm(f => ({
      ...f,
      signOff: { ...f.signOff, [stage]: { name: currentUser?.name || '', date: new Date().toISOString().split('T')[0] } },
    }));
  }

  function openEffModal(rc: RoutineCourse) {
    setEffForm(rc.effectiveness ? { ...rc.effectiveness } : {
      ...EMPTY_EFFECTIVENESS,
      trackingDate: new Date().toISOString().split('T')[0],
      filledBy: currentUser?.name || '',
    });
    setEffModalFor(rc.id);
  }

  function saveEffectiveness() {
    if (!effModalFor) return;
    setRoutineCourses(prev => prev.map(r => r.id === effModalFor ? { ...r, effectiveness: effForm } : r));
    showToast('成效追蹤表已儲存');
    setEffModalFor(null);
  }

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

  // ── 滿意度與測驗分析：線上課程（Kirkpatrick L1 / L2） ──
  const onlineCourseAnalysis = useMemo(() => {
    return courses.map(c => {
      const ces = enrollments.filter(e => e.courseId === c.id);
      const surveyEnrs = ces.filter(e => e.surveyData?.overall);
      const quizEnrs = ces.filter(e => e.quizScore !== null);
      const avgSatisfaction = surveyEnrs.length
        ? surveyEnrs.reduce((s, e) => s + Number(e.surveyData?.overall || 0), 0) / surveyEnrs.length
        : null;
      const avgQuiz = quizEnrs.length
        ? quizEnrs.reduce((s, e) => s + (e.quizScore || 0), 0) / quizEnrs.length
        : null;
      const passCount = quizEnrs.filter(e => (e.quizScore || 0) >= c.passingScore).length;
      const passRate = quizEnrs.length ? (passCount / quizEnrs.length) * 100 : null;
      return {
        id: c.id, title: c.title, category: c.category,
        enrolledCount: ces.length, surveyCount: surveyEnrs.length, quizCount: quizEnrs.length,
        avgSatisfaction, avgQuiz, passRate,
      };
    });
  }, [courses, enrollments]);

  const onlineSatChartData = useMemo(() => onlineCourseAnalysis
    .filter(d => d.avgSatisfaction !== null)
    .map(d => ({ name: d.title.length > 8 ? d.title.slice(0, 8) + '…' : d.title, 滿意度: parseFloat((d.avgSatisfaction as number).toFixed(1)) })),
  [onlineCourseAnalysis]);

  const onlineQuizChartData = useMemo(() => onlineCourseAnalysis
    .filter(d => d.avgQuiz !== null)
    .map(d => ({
      name: d.title.length > 8 ? d.title.slice(0, 8) + '…' : d.title,
      平均分數: Math.round(d.avgQuiz as number),
      及格率: d.passRate !== null ? Math.round(d.passRate) : 0,
    })),
  [onlineCourseAnalysis]);

  const overallOnlineSat = (() => {
    const all = enrollments.filter(e => e.surveyData?.overall);
    return all.length ? all.reduce((s, e) => s + Number(e.surveyData?.overall || 0), 0) / all.length : null;
  })();
  const overallOnlineQuiz = (() => {
    const all = enrollments.filter(e => e.quizScore !== null);
    return all.length ? all.reduce((s, e) => s + (e.quizScore || 0), 0) / all.length : null;
  })();
  const overallOnlinePassRate = (() => {
    const all = enrollments.filter(e => e.quizScore !== null);
    if (!all.length) return null;
    const passCount = all.filter(e => {
      const c = courses.find(c => c.id === e.courseId);
      return c && (e.quizScore || 0) >= c.passingScore;
    }).length;
    return (passCount / all.length) * 100;
  })();
  const onlineCoursesWithSurvey = onlineCourseAnalysis.filter(d => d.surveyCount > 0).length;
  const onlineCoursesWithQuiz = onlineCourseAnalysis.filter(d => d.quizCount > 0).length;

  // ── 滿意度與測驗分析：實體訓練記錄 ──
  const physicalWithSat = records.filter(r => r.satisfactionScore !== undefined && r.satisfactionScore !== null);
  const physicalWithQuiz = records.filter(r => r.quizAvgScore !== undefined && r.quizAvgScore !== null);
  const avgPhysicalSat = physicalWithSat.length
    ? physicalWithSat.reduce((s, r) => s + (r.satisfactionScore || 0), 0) / physicalWithSat.length
    : null;
  const avgPhysicalQuiz = physicalWithQuiz.length
    ? physicalWithQuiz.reduce((s, r) => s + (r.quizAvgScore || 0), 0) / physicalWithQuiz.length
    : null;
  const avgPhysicalPassRate = physicalWithQuiz.length
    ? physicalWithQuiz.reduce((s, r) => s + (r.quizPassRate || 0), 0) / physicalWithQuiz.length
    : null;

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
          ['analysis', '滿意度與測驗分析'],
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

            {/* 滿意度與測驗成效（選填） */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="md:col-span-3 text-xs font-semibold text-gray-600 -mb-1">滿意度與測驗成效（選填，用於「滿意度與測驗分析」統計）</div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">平均滿意度（1-5）</label>
                <input
                  type="number" min="0" max="5" step="0.1"
                  value={form.satisfactionScore ?? ''}
                  onChange={e => setForm(f => ({ ...f, satisfactionScore: e.target.value === '' ? undefined : Number(e.target.value) }))}
                  placeholder="例如 4.5"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">平均測驗分數（0-100）</label>
                <input
                  type="number" min="0" max="100" step="1"
                  value={form.quizAvgScore ?? ''}
                  onChange={e => setForm(f => ({ ...f, quizAvgScore: e.target.value === '' ? undefined : Number(e.target.value) }))}
                  placeholder="例如 85"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">測驗及格率（%）</label>
                <input
                  type="number" min="0" max="100" step="1"
                  value={form.quizPassRate ?? ''}
                  onChange={e => setForm(f => ({ ...f, quizPassRate: e.target.value === '' ? undefined : Number(e.target.value) }))}
                  placeholder="例如 92"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
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
              const effDueDate = rc.status === 'completed' && rc.date ? addDays(rc.date, 30) : null;
              const effOverdue = !!effDueDate && !rc.effectiveness && new Date() > new Date(effDueDate);
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
                          {rc.design && <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-purple-100 text-purple-700">已有課程大綱</span>}
                          {rc.effectiveness ? (
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-teal-100 text-teal-700">已完成成效追蹤</span>
                          ) : effDueDate ? (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${effOverdue ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                              {effOverdue ? '成效追蹤逾期' : `成效追蹤截止 ${effDueDate}`}
                            </span>
                          ) : null}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{rc.date} · {rc.hours}h · {rc.department} · 講師：{rc.instructor}</p>
                        <p className="text-xs text-gray-400 mt-0.5">學員：{rc.participants.join('、') || '尚未設定'}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {rc.photos && rc.photos.length > 0 && (
                          <span className="text-xs text-indigo-500 flex items-center gap-1"><Image size={12} />{rc.photos.length}張</span>
                        )}
                        <button
                          onClick={e => { e.stopPropagation(); openDesignModal(rc); }}
                          className="text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 px-2.5 py-1 rounded-lg flex items-center gap-1 border border-purple-200"
                          title="課程大綱表（表單一）"
                        >
                          <FileText size={12} />課程大綱表
                        </button>
                        {rc.status === 'completed' && (
                          <button
                            onClick={e => { e.stopPropagation(); openEffModal(rc); }}
                            className="text-xs bg-teal-50 hover:bg-teal-100 text-teal-700 px-2.5 py-1 rounded-lg flex items-center gap-1 border border-teal-200"
                            title="成效追蹤表（表單二）"
                          >
                            <ClipboardCheck size={12} />成效追蹤表
                          </button>
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

          {/* 課程大綱表（表單一）modal */}
          {designModalFor && (() => {
            const rc = routineCourses.find(r => r.id === designModalFor);
            if (!rc) return null;
            return (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
                  <div className="p-5 border-b border-gray-100 flex items-center justify-between shrink-0">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2"><FileText size={18} className="text-purple-600" />課程大綱表 — {rc.courseName}</h3>
                    <button onClick={() => setDesignModalFor(null)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} className="text-gray-500" /></button>
                  </div>
                  <div className="p-5 space-y-5 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">課程類別</label>
                        <div className="flex gap-1.5 flex-wrap">
                          {COURSE_CATEGORY_OPTIONS.map(c => (
                            <button key={c} onClick={() => setDesignForm(f => ({ ...f, category: c }))} className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${designForm.category === c ? 'bg-purple-600 text-white border-purple-600' : 'border-gray-200 text-gray-600 hover:border-purple-300'}`}>{c}</button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">參訓對象</label>
                        <input type="text" value={designForm.targetAudience} onChange={e => setDesignForm(f => ({ ...f, targetAudience: e.target.value }))} placeholder="例如：製造課全體員工" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">課程需求來源</label>
                      <div className="flex flex-wrap gap-2">
                        {NEED_SOURCES.map(s => (
                          <button key={s} onClick={() => setDesignForm(f => ({ ...f, needSources: toggleInArray(f.needSources, s) }))} className={`px-2.5 py-1 text-xs rounded-lg border ${designForm.needSources.includes(s) ? 'bg-purple-100 text-purple-700 border-purple-300' : 'border-gray-200 text-gray-500 hover:border-purple-300'}`}>{s}</button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">課程目的</label>
                      <textarea value={designForm.purpose} onChange={e => setDesignForm(f => ({ ...f, purpose: e.target.value }))} rows={2} placeholder="說明本課程希望解決什麼問題，例如降低生產品質異常/提升主管管理能力/降低工安風險" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none" />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">職能對應</label>
                      <div className="flex flex-wrap gap-2">
                        {COMPETENCY_OPTIONS.map(c => (
                          <button key={c} onClick={() => setDesignForm(f => ({ ...f, competencies: toggleInArray(f.competencies, c) }))} className={`px-2.5 py-1 text-xs rounded-lg border ${designForm.competencies.includes(c) ? 'bg-purple-100 text-purple-700 border-purple-300' : 'border-gray-200 text-gray-500 hover:border-purple-300'}`}>{c}</button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-medium text-gray-600">課程大綱（單元 / 內容 / 時數）</label>
                        <button onClick={() => setDesignForm(f => ({ ...f, syllabus: [...f.syllabus, { unit: '', content: '', hours: 0 }] }))} className="text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1"><Plus size={12} />新增單元</button>
                      </div>
                      <div className="space-y-2">
                        {designForm.syllabus.map((u, idx) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <input type="text" value={u.unit} onChange={e => setDesignForm(f => ({ ...f, syllabus: f.syllabus.map((row, i) => i === idx ? { ...row, unit: e.target.value } : row) }))} placeholder="單元" className="w-28 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-300" />
                            <input type="text" value={u.content} onChange={e => setDesignForm(f => ({ ...f, syllabus: f.syllabus.map((row, i) => i === idx ? { ...row, content: e.target.value } : row) }))} placeholder="內容" className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-300" />
                            <input type="number" min={0} value={u.hours} onChange={e => setDesignForm(f => ({ ...f, syllabus: f.syllabus.map((row, i) => i === idx ? { ...row, hours: Number(e.target.value) } : row) }))} placeholder="時數" className="w-16 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-300" />
                            <button onClick={() => setDesignForm(f => ({ ...f, syllabus: f.syllabus.filter((_, i) => i !== idx) }))} className="p-1 text-gray-400 hover:text-red-500"><Trash2 size={13} /></button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">教學方式</label>
                      <div className="flex flex-wrap gap-2">
                        {TEACHING_METHOD_OPTIONS.map(m => (
                          <button key={m} onClick={() => setDesignForm(f => ({ ...f, teachingMethods: toggleInArray(f.teachingMethods, m) }))} className={`px-2.5 py-1 text-xs rounded-lg border ${designForm.teachingMethods.includes(m) ? 'bg-purple-100 text-purple-700 border-purple-300' : 'border-gray-200 text-gray-500 hover:border-purple-300'}`}>{m}</button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">預期效益</label>
                      <div className="grid grid-cols-2 gap-3">
                        {([
                          ['qualityIssueReduction', '品質異常降低 (%)'],
                          ['complaintReduction', '客訴降低 (%)'],
                          ['safetyViolationReduction', '工安違規降低 (%)'],
                          ['efficiencyImprovement', '工作效率提升 (%)'],
                        ] as const).map(([key, label]) => (
                          <div key={key}>
                            <label className="block text-xs text-gray-500 mb-1">{label}</label>
                            <input type="number" min={0} max={100} value={designForm.expectedBenefits[key]} onChange={e => setDesignForm(f => ({ ...f, expectedBenefits: { ...f.expectedBenefits, [key]: Number(e.target.value) } }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">簽核</label>
                      <div className="grid grid-cols-4 gap-2">
                        {([
                          ['applicant', '申請人', true],
                          ['deptManager', '部門主管', canSignDeptManager],
                          ['hr', 'HR', canSignHr],
                          ['vp', '副總', canSignVp],
                        ] as const).map(([key, label, canSign]) => {
                          const signed = designForm.signOff[key];
                          return (
                            <div key={key} className="border border-gray-200 rounded-xl p-2 text-center">
                              <p className="text-xs font-semibold text-gray-600 mb-1">{label}</p>
                              {signed ? (
                                <p className="text-xs text-green-600">✓ {signed.name}<br />{signed.date}</p>
                              ) : canSign ? (
                                <button onClick={() => signDesign(key)} className="text-xs text-purple-600 hover:underline">點擊簽核</button>
                              ) : (
                                <p className="text-xs text-gray-300">未簽核</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="p-5 border-t border-gray-100 flex gap-3 shrink-0">
                    <button onClick={() => setDesignModalFor(null)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-medium text-gray-700">取消</button>
                    <button onClick={() => exportDesignForm(rc, designForm)} className="px-4 border border-gray-200 rounded-xl py-2.5 text-sm font-medium text-gray-700 flex items-center gap-1.5"><Printer size={15} />列印</button>
                    <button onClick={saveDesign} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"><Save size={15} />儲存</button>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* 成效追蹤表（表單二）modal */}
          {effModalFor && (() => {
            const rc = routineCourses.find(r => r.id === effModalFor);
            if (!rc) return null;
            return (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
                  <div className="p-5 border-b border-gray-100 flex items-center justify-between shrink-0">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2"><ClipboardCheck size={18} className="text-teal-600" />成效追蹤表 — {rc.courseName}</h3>
                    <button onClick={() => setEffModalFor(null)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} className="text-gray-500" /></button>
                  </div>
                  <div className="p-5 space-y-5 overflow-y-auto">
                    {!canFillEffectiveness && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">此表單建議由主管填寫，您目前以檢視模式開啟。</div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">追蹤日期（建議課後30天）</label>
                        <input type="date" disabled={!canFillEffectiveness} value={effForm.trackingDate} onChange={e => setEffForm(f => ({ ...f, trackingDate: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 disabled:bg-gray-50" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">填寫人</label>
                        <input type="text" disabled={!canFillEffectiveness} value={effForm.filledBy} onChange={e => setEffForm(f => ({ ...f, filledBy: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 disabled:bg-gray-50" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">學習成果</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {([
                          ['attendanceRate', '出席率 (%)'],
                          ['quizAvgScore', '測驗平均分數'],
                          ['passRate', '合格率 (%)'],
                          ['satisfaction', '滿意度 (1-5)'],
                        ] as const).map(([key, label]) => (
                          <div key={key}>
                            <label className="block text-xs text-gray-500 mb-1">{label}</label>
                            <input type="number" disabled={!canFillEffectiveness} value={effForm.learningOutcome[key]} onChange={e => setEffForm(f => ({ ...f, learningOutcome: { ...f.learningOutcome, [key]: Number(e.target.value) } }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 disabled:bg-gray-50" />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">主管成效評估（1~5分）</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {([
                          ['efficiencyImprovement', '工作效率提升'],
                          ['qualityImprovement', '品質改善'],
                          ['safetyAwarenessImprovement', '工安意識提升'],
                          ['problemAnalysisImprovement', '問題分析能力提升'],
                          ['attitudeImprovement', '工作態度改善'],
                        ] as const).map(([key, label]) => (
                          <div key={key}>
                            <label className="block text-xs text-gray-500 mb-1">{label}</label>
                            <select disabled={!canFillEffectiveness} value={effForm.managerEvaluation[key]} onChange={e => setEffForm(f => ({ ...f, managerEvaluation: { ...f.managerEvaluation, [key]: Number(e.target.value) } }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 disabled:bg-gray-50 bg-white">
                              {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">KPI改善追蹤</label>
                      <div className="grid grid-cols-2 gap-4">
                        {([['kpiBefore', '課前'], ['kpiAfter30Days', '課後30天']] as const).map(([groupKey, groupLabel]) => (
                          <div key={groupKey} className="border border-gray-200 rounded-xl p-3 space-y-2">
                            <p className="text-xs font-semibold text-gray-500">{groupLabel}</p>
                            {([
                              ['qualityIssues', '品質異常'],
                              ['complaints', '客訴件數'],
                              ['safetyViolations', '工安違規'],
                              ['equipmentAnomalies', '設備異常'],
                            ] as const).map(([key, label]) => (
                              <div key={key} className="flex items-center justify-between gap-2">
                                <label className="text-xs text-gray-500">{label}</label>
                                <input type="number" min={0} disabled={!canFillEffectiveness} value={effForm[groupKey][key]} onChange={e => setEffForm(f => ({ ...f, [groupKey]: { ...f[groupKey], [key]: Number(e.target.value) } }))} className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-xs text-right focus:outline-none focus:ring-2 focus:ring-teal-300 disabled:bg-gray-50" />
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">成效判定</label>
                      <div className="flex flex-wrap gap-2">
                        {JUDGMENT_OPTIONS.map(j => (
                          <button key={j} disabled={!canFillEffectiveness} onClick={() => setEffForm(f => ({ ...f, judgment: j }))} className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors disabled:opacity-50 ${effForm.judgment === j ? 'bg-teal-600 text-white border-teal-600' : 'border-gray-200 text-gray-500 hover:border-teal-300'}`}>{j}</button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">改善建議（主管填寫）</label>
                      <textarea disabled={!canFillEffectiveness} value={effForm.suggestion} onChange={e => setEffForm(f => ({ ...f, suggestion: e.target.value }))} rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 resize-none disabled:bg-gray-50" />
                    </div>
                  </div>
                  <div className="p-5 border-t border-gray-100 flex gap-3 shrink-0">
                    <button onClick={() => setEffModalFor(null)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-medium text-gray-700">取消</button>
                    <button onClick={() => exportEffectivenessForm(rc, effForm)} className="px-4 border border-gray-200 rounded-xl py-2.5 text-sm font-medium text-gray-700 flex items-center gap-1.5"><Printer size={15} />列印</button>
                    {canFillEffectiveness && (
                      <button onClick={saveEffectiveness} className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"><Save size={15} />儲存</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
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

      {/* ── 滿意度與測驗分析 ── */}
      {activeTab === 'analysis' && (
        <div className="space-y-5">
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-sm text-indigo-800">
            <p className="font-semibold mb-1 flex items-center gap-2"><TrendingUp size={16} />滿意度與測驗成效綜合分析</p>
            <p>整合「實體教育訓練記錄」與「線上課程」之滿意度問卷（Kirkpatrick L1）及測驗成績（L2）資料，協助掌握整體訓練成效。</p>
          </div>

          {/* Overview KPI cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: '線上課程平均滿意度', value: overallOnlineSat !== null ? `${overallOnlineSat.toFixed(1)} ★` : '—', sub: '/ 5.0 分', color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: '線上課程平均測驗分數', value: overallOnlineQuiz !== null ? overallOnlineQuiz.toFixed(0) : '—', sub: '/ 100 分', color: 'text-purple-600', bg: 'bg-purple-50' },
              { label: '線上課程測驗及格率', value: overallOnlinePassRate !== null ? `${overallOnlinePassRate.toFixed(0)}%` : '—', sub: `${onlineCoursesWithQuiz}/${courses.length} 門課程有資料`, color: 'text-green-600', bg: 'bg-green-50' },
              { label: '實體訓練平均滿意度', value: avgPhysicalSat !== null ? `${avgPhysicalSat.toFixed(1)} ★` : '—', sub: '/ 5.0 分', color: 'text-orange-600', bg: 'bg-orange-50' },
              { label: '實體訓練平均測驗分數', value: avgPhysicalQuiz !== null ? avgPhysicalQuiz.toFixed(0) : '—', sub: '/ 100 分', color: 'text-pink-600', bg: 'bg-pink-50' },
              { label: '實體訓練測驗及格率', value: avgPhysicalPassRate !== null ? `${avgPhysicalPassRate.toFixed(0)}%` : '—', sub: `${physicalWithQuiz.length}/${records.length} 筆有資料`, color: 'text-teal-600', bg: 'bg-teal-50' },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-2xl p-4 text-center`}>
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-gray-500 mt-1">{s.sub}</div>
                <div className="text-xs text-gray-600 mt-1 font-medium">{s.label}</div>
              </div>
            ))}
          </div>

          {/* 線上課程 L1 滿意度 */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-1 flex items-center gap-2"><Star size={16} className="text-blue-500" />線上課程滿意度分析（L1 反應層）</h2>
            <p className="text-xs text-gray-400 mb-4">已收集問卷之課程，共 {onlineCoursesWithSurvey}/{courses.length} 門課程</p>
            {onlineSatChartData.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm">尚無線上課程滿意度問卷資料</div>
            ) : (
              <ResponsiveContainer width="100%" height={Math.max(220, onlineSatChartData.length * 32)}>
                <BarChart data={onlineSatChartData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 5]} />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="滿意度" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* 線上課程 L2 測驗成效 */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-1 flex items-center gap-2"><Award size={16} className="text-purple-500" />線上課程測驗成效分析（L2 學習層）</h2>
            <p className="text-xs text-gray-400 mb-4">已有測驗成績之課程，共 {onlineCoursesWithQuiz}/{courses.length} 門課程</p>
            {onlineQuizChartData.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm">尚無線上課程測驗成績資料</div>
            ) : (
              <ResponsiveContainer width="100%" height={Math.max(220, onlineQuizChartData.length * 32)}>
                <BarChart data={onlineQuizChartData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="平均分數" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="及格率" fill="#a855f7" radius={[0, 4, 4, 0]} fillOpacity={0.5} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* 全部線上課程明細表 */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-semibold text-gray-800">全部線上課程滿意度與測驗明細（共 {courses.length} 門）</h3>
            </div>
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100 sticky top-0">
                  <tr>
                    {['課程名稱', '類別', '報名人數', '問卷回覆', '平均滿意度', '測驗人數', '平均分數', '及格率'].map(h => (
                      <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {onlineCourseAnalysis.map(d => (
                    <tr key={d.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium text-gray-900 min-w-[160px]">{d.title}</td>
                      <td className="px-3 py-2 text-xs text-gray-500 whitespace-nowrap">{d.category}</td>
                      <td className="px-3 py-2 text-center text-gray-600">{d.enrolledCount}</td>
                      <td className="px-3 py-2 text-center text-gray-600">{d.surveyCount}</td>
                      <td className="px-3 py-2 text-center">
                        {d.avgSatisfaction !== null ? <span className="font-semibold text-blue-600">{d.avgSatisfaction.toFixed(1)} ★</span> : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-3 py-2 text-center text-gray-600">{d.quizCount}</td>
                      <td className="px-3 py-2 text-center">
                        {d.avgQuiz !== null ? <span className="font-semibold text-purple-600">{d.avgQuiz.toFixed(0)}</span> : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {d.passRate !== null ? <span className={`font-semibold ${d.passRate >= 70 ? 'text-green-600' : 'text-red-500'}`}>{d.passRate.toFixed(0)}%</span> : <span className="text-gray-300">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 實體訓練滿意度與測驗成效 */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between flex-wrap gap-2">
              <h3 className="font-semibold text-gray-800">實體訓練滿意度與測驗成效（共 {records.length} 筆）</h3>
              <span className="text-xs text-gray-400">已填寫滿意度 {physicalWithSat.length} 筆 · 已填寫測驗成效 {physicalWithQuiz.length} 筆</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['課程名稱', '日期', '訓練類型', '平均滿意度', '平均測驗分數', '及格率', '操作'].map(h => (
                      <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {records.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-sm">尚無實體訓練記錄</td></tr>
                  ) : records.map(r => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium text-gray-900 min-w-[160px]">{r.courseName}</td>
                      <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{r.date}</td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${r.trainingType === '外訓' ? 'bg-purple-50 text-purple-700' : 'bg-green-50 text-green-700'}`}>{r.trainingType}</span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        {r.satisfactionScore != null ? <span className="font-semibold text-orange-600">{r.satisfactionScore.toFixed(1)} ★</span> : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {r.quizAvgScore != null ? <span className="font-semibold text-pink-600">{r.quizAvgScore.toFixed(0)}</span> : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {r.quizPassRate != null ? <span className={`font-semibold ${r.quizPassRate >= 70 ? 'text-green-600' : 'text-red-500'}`}>{r.quizPassRate.toFixed(0)}%</span> : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-3 py-2">
                        <button onClick={() => handleEdit(r)} className="text-xs px-2 py-1 text-blue-600 hover:bg-blue-50 rounded-lg font-medium">補充資料</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 bg-amber-50 border-t border-amber-100 text-xs text-amber-700">
              <strong>提示：</strong>實體訓練的滿意度問卷與測驗成績統計後，可於「編輯記錄」中填入平均滿意度、平均測驗分數與及格率，即可納入上方總覽分析。
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
