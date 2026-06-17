import { Fragment, useState, useMemo, useEffect } from 'react';
import { TrendingUp, CheckCircle, Clock, AlertCircle, ChevronDown, X, Plus, Paperclip, ThumbsUp, ThumbsDown, ShieldCheck, Upload, Bell } from 'lucide-react';
import { useTrainingAuth } from '../../context/TrainingAuthContext';
import type { User } from '../../data/trainingMockData';
import { BarChart, Bar, LineChart, Line, ReferenceLine, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface L3Attachment {
  id: string;
  name: string;
  dataUrl: string;
}

interface L3ApprovalStep {
  by: string;
  at: string;
  decision: 'approved' | 'rejected';
  comment?: string;
}

interface L3Confirmation {
  id: string;
  enrollmentId: string;
  userId: string;
  courseId: string;
  courseName: string;
  userName: string;
  quarter: string; // e.g. "2026-Q2"
  applicationContent: string; // 實際應用內容
  confirmedAt: string | null;
  // not_due：尚未到填寫期限／pending：已到期待員工填寫／submitted_manager：待主管簽核／
  // submitted_depthead：待部門最高主管簽核／confirmed：已簽核完成並送人資留存／rejected：被退回待補正／overdue：逾期未填
  status: 'not_due' | 'pending' | 'submitted_manager' | 'submitted_depthead' | 'confirmed' | 'rejected' | 'overdue';
  kpiNote: string;
  dueDate?: string; // 完訓日期 + 3 個月，到期才需填寫
  attachments?: L3Attachment[];
  submittedAt?: string;
  managerApproval?: L3ApprovalStep;
  deptHeadApproval?: L3ApprovalStep;
}

interface L4QuarterEntry {
  quarter: string; // e.g. "2026-Q2"，可跨年度
  actualValue: number;
  note?: string;
  reportedBy: string;
  reportedAt: string;
}

interface L4Campaign {
  id: string;
  courseId: string;
  courseName: string;
  department: string;
  kpiType: string;
  unit: string; // 例如 %、件/月、分鐘
  baselineValue: number; // 訓前基準值
  targetValue: number; // 課程原訂預期目標 KPI
  higherIsBetter: boolean; // true：數值越高越好；false：數值越低越好（如事故率、不良率）
  entries: L4QuarterEntry[]; // 最多 4 個季度，由主管/HR逐季填寫
  createdBy: string;
  createdAt: string;
}

const currentQuarter = (() => {
  const now = new Date();
  const q = Math.ceil((now.getMonth() + 1) / 3);
  return `${now.getFullYear()}-Q${q}`;
})();

function addMonths(dateStr: string, months: number): string {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split('T')[0];
}

function quarterOf(dateStr: string): string {
  const d = new Date(dateStr);
  const q = Math.ceil((d.getMonth() + 1) / 3);
  return `${d.getFullYear()}-Q${q}`;
}

// 可跨年度選擇的季度清單（去年至明年）
const QUARTER_OPTIONS = (() => {
  const thisYear = new Date().getFullYear();
  const list: string[] = [];
  for (let y = thisYear - 1; y <= thisYear + 1; y++) {
    for (let q = 1; q <= 4; q++) list.push(`${y}-Q${q}`);
  }
  return list;
})();

// L3 mock 種子資料的 userId 與實際登入帳號 id 對應不上時，以 userName 作為備援比對（沿用既有 myL3 的比對邏輯）
function resolveEmployee(r: { userId: string; userName: string }, allUsers: User[]): User | undefined {
  return allUsers.find(u => u.id === r.userId) || allUsers.find(u => u.name === r.userName);
}

// 員工 → 直屬主管 → 部門最高主管（沿 managerId 鏈往上找；若無更上層主管，直屬主管即視為最終簽核者）
function getApprovalChain(employee: User | undefined, allUsers: User[]) {
  const directManager = employee?.managerId ? allUsers.find(u => u.id === employee.managerId) || null : null;
  const deptHeadRaw = directManager?.managerId ? allUsers.find(u => u.id === directManager.managerId) || null : null;
  const deptHead = deptHeadRaw && deptHeadRaw.id !== directManager?.id ? deptHeadRaw : null;
  return { directManager, deptHead };
}

// 依到期日／逾期天數即時換算顯示狀態：not_due→到期轉pending；pending超過14天未填→overdue
function derivedL3Status(r: L3Confirmation): L3Confirmation['status'] {
  if (!r.dueDate) return r.status;
  const today = new Date();
  if (r.status === 'not_due' && new Date(r.dueDate) <= today) {
    const daysLate = (today.getTime() - new Date(r.dueDate).getTime()) / 86400000;
    return daysLate > 14 ? 'overdue' : 'pending';
  }
  if (r.status === 'pending') {
    const daysLate = (today.getTime() - new Date(r.dueDate).getTime()) / 86400000;
    if (daysLate > 14) return 'overdue';
  }
  return r.status;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const INITIAL_L3: L3Confirmation[] = [
  { id: 'l3-1', enrollmentId: 'enr1', userId: 'u2', courseId: 'c1', courseName: '職業安全衛生法規研習', userName: '王小明', quarter: '2026-Q2', applicationContent: '在工作中主動確認個人防護裝備的使用，並提醒同事注意安全規範', confirmedAt: '2026-04-15', status: 'confirmed', kpiNote: '本季零工傷事故', dueDate: '2026-04-15', submittedAt: '2026-04-14', managerApproval: { by: '李主管', at: '2026-04-15', decision: 'approved' }, attachments: [] },
  { id: 'l3-2', enrollmentId: 'enr2', userId: 'u3', courseId: 'c2', courseName: '5S推行與現場管理', userName: '陳美玲', quarter: '2026-Q2', applicationContent: '', confirmedAt: null, status: 'pending', kpiNote: '', dueDate: '2026-06-20' },
  { id: 'l3-3', enrollmentId: 'enr3', userId: 'u4', courseId: 'c3', courseName: 'ISO 9001 品質管理系統', userName: '林志偉', quarter: '2026-Q1', applicationContent: '協助部門完成ISO內部稽核，運用課程學到的稽核技巧找出3個改善點', confirmedAt: '2026-03-20', status: 'confirmed', kpiNote: '不合格品率降低 2%', dueDate: '2026-03-20', submittedAt: '2026-03-18', managerApproval: { by: '李主管', at: '2026-03-20', decision: 'approved' }, attachments: [] },
  { id: 'l3-4', enrollmentId: 'enr4', userId: 'u5', courseId: 'c4', courseName: '精實生產與浪費消除', userName: '黃雅婷', quarter: '2026-Q2', applicationContent: '', confirmedAt: null, status: 'overdue', kpiNote: '', dueDate: '2026-05-01' },
  { id: 'l3-5', enrollmentId: 'enr5', userId: 'u2', courseId: 'c2', courseName: '5S推行與現場管理', userName: '王小明', quarter: '2026-Q1', applicationContent: '帶領小組完成工作區域整理整頓，減少尋找工具時間約15分鐘/天', confirmedAt: '2026-03-10', status: 'confirmed', kpiNote: '作業效率提升 8%', dueDate: '2026-03-10', submittedAt: '2026-03-08', managerApproval: { by: '李主管', at: '2026-03-10', decision: 'approved' }, attachments: [] },
];

const INITIAL_L4: L4Campaign[] = [
  { id: 'l4-1', courseId: 'c1', courseName: '職業安全衛生法規研習', department: '管理部', kpiType: '工安事故率', unit: '件/月', baselineValue: 2, targetValue: 0, higherIsBetter: false, entries: [{ quarter: '2026-Q1', actualValue: 0, reportedBy: '李主管', reportedAt: '2026-04-01' }], createdBy: '李主管', createdAt: '2026-01-05' },
  { id: 'l4-2', courseId: 'c3', courseName: 'ISO 9001 品質管理系統', department: '品保課', kpiType: '不合格品率', unit: '%', baselineValue: 3.2, targetValue: 2.0, higherIsBetter: false, entries: [{ quarter: '2026-Q1', actualValue: 1.8, reportedBy: '品保主管', reportedAt: '2026-04-05' }], createdBy: '品保主管', createdAt: '2026-01-05' },
];

const QUARTERS = ['2026-Q1', '2026-Q2', '2026-Q3', '2026-Q4', '2025-Q4'];
const DEPARTMENTS = ['全部', '品保課', '管理部', '工程課', '生管課', '製造課'];

const L3_STATUS_LABEL: Record<L3Confirmation['status'], string> = {
  not_due: '尚未到期',
  pending: '待填寫',
  submitted_manager: '待主管簽核',
  submitted_depthead: '待部門最高主管簽核',
  confirmed: '已完成',
  rejected: '已退回',
  overdue: '逾期未填',
};
const L3_STATUS_COLOR: Record<L3Confirmation['status'], string> = {
  not_due: 'bg-gray-100 text-gray-500',
  pending: 'bg-orange-100 text-orange-700',
  submitted_manager: 'bg-blue-100 text-blue-700',
  submitted_depthead: 'bg-indigo-100 text-indigo-700',
  confirmed: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-600',
  overdue: 'bg-red-100 text-red-600',
};

type TabId = 'overview' | 'l1' | 'l2' | 'l3' | 'l4';

export default function PerformanceTracking() {
  const { currentUser, enrollments, users, courses, addNotification } = useTrainingAuth();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [l3Records, setL3Records] = useState<L3Confirmation[]>(INITIAL_L3);
  const [l4Campaigns, setL4Campaigns] = useState<L4Campaign[]>(INITIAL_L4);
  const [quarterFilter, setQuarterFilter] = useState(currentQuarter);
  const [deptFilter, setDeptFilter] = useState('全部');
  const [selectedL3, setSelectedL3] = useState<string | null>(null);
  const [applicationText, setApplicationText] = useState('');
  const [kpiNote, setKpiNote] = useState('');
  const [pendingAttachments, setPendingAttachments] = useState<L3Attachment[]>([]);
  const [approvalComment, setApprovalComment] = useState('');
  const [showAddL4, setShowAddL4] = useState(false);
  const [l4Form, setL4Form] = useState({ courseId: '', department: '', kpiType: '', unit: '', baselineValue: '', targetValue: '', higherIsBetter: 'false' });
  const [addEntryFor, setAddEntryFor] = useState<string | null>(null);
  const [entryForm, setEntryForm] = useState({ quarter: currentQuarter, actualValue: '', note: '' });
  const [expandedL3, setExpandedL3] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const isHRAdmin = currentUser && ['admin', 'hr', 'manager'].includes(currentUser.role);
  const isEmployee = currentUser?.role === 'employee';
  const isManagerRole = currentUser?.role === 'manager';

  // 依完訓紀錄自動產生 L3 應用追蹤項目：完訓日期 + 3 個月即為填寫期限，尚未到期前不會要求填寫
  useEffect(() => {
    const completed = enrollments.filter(e => e.status === 'completed' && e.completedAt);
    const today = new Date();
    setL3Records(prev => {
      const existingEnrollmentIds = new Set(prev.map(r => r.enrollmentId));
      const additions: L3Confirmation[] = [];
      completed.forEach(e => {
        if (existingEnrollmentIds.has(e.id)) return;
        const u = users.find(u => u.id === e.userId);
        const c = courses.find(c => c.id === e.courseId);
        if (!u || !c || !e.completedAt) return;
        const dueDate = addMonths(e.completedAt, 3);
        const due = new Date(dueDate) <= today;
        additions.push({
          id: `l3-auto-${e.id}`,
          enrollmentId: e.id,
          userId: u.id,
          courseId: c.id,
          courseName: c.title,
          userName: u.name,
          quarter: quarterOf(dueDate),
          applicationContent: '',
          confirmedAt: null,
          status: due ? 'pending' : 'not_due',
          kpiNote: '',
          dueDate,
          attachments: [],
        });
      });
      return additions.length ? [...prev, ...additions] : prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enrollments, users, courses]);

  // My L3 items (for employee view) — 即時依到期日／逾期天數換算顯示狀態，不直接改動原始狀態
  const myL3 = useMemo(() =>
    l3Records
      .filter(r => r.userId === currentUser?.id || r.userName === currentUser?.name)
      .map(r => ({ ...r, status: derivedL3Status(r) })),
    [l3Records, currentUser]
  );

  // All L3 filtered (for hr/admin)，已套用即時狀態換算，並排除尚未到期項目（避免表格被未來項目淹沒）
  const filteredL3 = useMemo(() => {
    return l3Records
      .map(r => ({ ...r, status: derivedL3Status(r) }))
      .filter(r => r.status !== 'not_due')
      .filter(r => (quarterFilter === 'all' || r.quarter === quarterFilter));
  }, [l3Records, quarterFilter]);

  // 待我（主管）簽核：員工已提交，且我是其直屬主管
  const pendingMyManagerApproval = useMemo(() => {
    if (!currentUser) return [];
    return l3Records.filter(r => {
      if (r.status !== 'submitted_manager') return false;
      const employee = resolveEmployee(r, users);
      const { directManager } = getApprovalChain(employee, users);
      return directManager?.id === currentUser.id;
    });
  }, [l3Records, users, currentUser]);

  // 待我（部門最高主管）簽核：主管已核准，且我是該員工的部門最高主管
  const pendingMyDeptHeadApproval = useMemo(() => {
    if (!currentUser) return [];
    return l3Records.filter(r => {
      if (r.status !== 'submitted_depthead') return false;
      const employee = resolveEmployee(r, users);
      const { deptHead } = getApprovalChain(employee, users);
      return deptHead?.id === currentUser.id;
    });
  }, [l3Records, users, currentUser]);

  // L1: satisfaction from enrollments
  const l1Data = useMemo(() => {
    const surveyEnrs = enrollments.filter(e => e.surveyData);
    const avgPerCourse = courses.slice(0, 8).map(c => {
      const ces = surveyEnrs.filter(e => e.courseId === c.id);
      const avgOverall = ces.length ? ces.reduce((s, e) => s + Number(e.surveyData?.overall || 0), 0) / ces.length : 0;
      return { name: c.title.length > 10 ? c.title.slice(0, 10) + '…' : c.title, 滿意度: parseFloat(avgOverall.toFixed(1)), 回覆數: ces.length };
    }).filter(d => d.回覆數 > 0);
    return avgPerCourse;
  }, [enrollments, courses]);

  // L2: quiz scores
  const l2Data = useMemo(() => {
    const scored = enrollments.filter(e => e.quizScore !== null);
    const avgPerCourse = courses.slice(0, 8).map(c => {
      const ces = scored.filter(e => e.courseId === c.id);
      const avgScore = ces.length ? ces.reduce((s, e) => s + (e.quizScore || 0), 0) / ces.length : 0;
      return { name: c.title.length > 10 ? c.title.slice(0, 10) + '…' : c.title, 平均分數: parseFloat(avgScore.toFixed(0)), 人數: ces.length };
    }).filter(d => d.人數 > 0);
    return avgPerCourse;
  }, [enrollments, courses]);

  // Overview stats（套用即時狀態換算）
  const l3Derived = useMemo(() => l3Records.map(r => derivedL3Status(r)), [l3Records]);
  const l3ConfirmedCount = l3Derived.filter(s => s === 'confirmed').length;
  const l3PendingCount = l3Derived.filter(s => s === 'pending' || s === 'submitted_manager' || s === 'submitted_depthead').length;
  const l3OverdueCount = l3Derived.filter(s => s === 'overdue').length;
  const overallSat = enrollments.filter(e => e.surveyData?.overall).length > 0
    ? (enrollments.reduce((s, e) => s + Number(e.surveyData?.overall || 0), 0) / enrollments.filter(e => e.surveyData?.overall).length).toFixed(1)
    : '-';
  const avgScore = enrollments.filter(e => e.quizScore).length > 0
    ? Math.round(enrollments.reduce((s, e) => s + (e.quizScore || 0), 0) / enrollments.filter(e => e.quizScore).length)
    : 0;
  const l4EntryCount = l4Campaigns.reduce((sum, c) => sum + c.entries.length, 0);

  const handleAddAttachments = async (files: FileList | null) => {
    if (!files || !files.length) return;
    const newOnes: L3Attachment[] = [];
    for (const file of Array.from(files)) {
      const dataUrl = await fileToDataUrl(file);
      newOnes.push({ id: `att-${Date.now()}-${file.name}`, name: file.name, dataUrl });
    }
    setPendingAttachments(prev => [...prev, ...newOnes]);
  };

  const handleSubmitL3 = (id: string) => {
    if (!applicationText.trim() || pendingAttachments.length === 0) return;
    const now = new Date().toLocaleDateString('zh-TW');
    setL3Records(prev => prev.map(r =>
      r.id === id
        ? { ...r, applicationContent: applicationText, kpiNote, attachments: pendingAttachments, submittedAt: now, status: 'submitted_manager' as const, managerApproval: undefined, deptHeadApproval: undefined }
        : r
    ));
    setSelectedL3(null);
    setApplicationText('');
    setKpiNote('');
    setPendingAttachments([]);
    showToast('✓ 已送出，等待主管簽核');
  };

  const handleManagerDecision = (record: L3Confirmation, decision: 'approved' | 'rejected') => {
    const operator = currentUser?.name || '主管';
    const now = new Date().toLocaleDateString('zh-TW');
    const employee = resolveEmployee(record, users);
    const { deptHead } = getApprovalChain(employee, users);
    setL3Records(prev => prev.map(r => {
      if (r.id !== record.id) return r;
      const managerApproval: L3ApprovalStep = { by: operator, at: now, decision, comment: approvalComment || undefined };
      if (decision === 'rejected') return { ...r, managerApproval, status: 'rejected' as const };
      if (deptHead) return { ...r, managerApproval, status: 'submitted_depthead' as const };
      return { ...r, managerApproval, status: 'confirmed' as const, confirmedAt: now };
    }));
    setApprovalComment('');
    showToast(decision === 'approved' ? '✓ 已核准，' + (deptHead ? '轉送部門最高主管簽核' : '已送人資留存') : '已退回員工補正');
  };

  const handleDeptHeadDecision = (record: L3Confirmation, decision: 'approved' | 'rejected') => {
    const operator = currentUser?.name || '部門最高主管';
    const now = new Date().toLocaleDateString('zh-TW');
    setL3Records(prev => prev.map(r => {
      if (r.id !== record.id) return r;
      const deptHeadApproval: L3ApprovalStep = { by: operator, at: now, decision, comment: approvalComment || undefined };
      if (decision === 'rejected') return { ...r, deptHeadApproval, status: 'rejected' as const };
      return { ...r, deptHeadApproval, status: 'confirmed' as const, confirmedAt: now };
    }));
    setApprovalComment('');
    showToast(decision === 'approved' ? '✓ 已核准，送人資單位留存紀錄' : '已退回員工補正');
  };

  const handleAddL4 = () => {
    if (!l4Form.courseId || !l4Form.kpiType || !l4Form.targetValue) return;
    const course = courses.find(c => c.id === l4Form.courseId);
    setL4Campaigns(prev => [...prev, {
      id: `l4-${Date.now()}`,
      courseId: l4Form.courseId,
      courseName: course?.title || '',
      department: l4Form.department,
      kpiType: l4Form.kpiType,
      unit: l4Form.unit,
      baselineValue: parseFloat(l4Form.baselineValue) || 0,
      targetValue: parseFloat(l4Form.targetValue) || 0,
      higherIsBetter: l4Form.higherIsBetter === 'true',
      entries: [],
      createdBy: currentUser?.name || '系統',
      createdAt: new Date().toISOString().split('T')[0],
    }]);
    setL4Form({ courseId: '', department: '', kpiType: '', unit: '', baselineValue: '', targetValue: '', higherIsBetter: 'false' });
    setShowAddL4(false);
    showToast('L4 成果評估計畫已建立，可開始填寫每季實際數值');
  };

  const handleAddL4Entry = (campaignId: string) => {
    const actual = parseFloat(entryForm.actualValue);
    if (Number.isNaN(actual)) return;
    setL4Campaigns(prev => prev.map(c => {
      if (c.id !== campaignId || c.entries.length >= 4) return c;
      const filtered = c.entries.filter(e => e.quarter !== entryForm.quarter);
      return {
        ...c,
        entries: [...filtered, { quarter: entryForm.quarter, actualValue: actual, note: entryForm.note || undefined, reportedBy: currentUser?.name || '系統', reportedAt: new Date().toISOString().split('T')[0] }]
          .sort((a, b) => a.quarter.localeCompare(b.quarter)),
      };
    }));
    setAddEntryFor(null);
    setEntryForm({ quarter: currentQuarter, actualValue: '', note: '' });
    showToast('已新增本季實際 KPI 數值');
  };

  const isKpiMet = (campaign: L4Campaign, actual: number) =>
    campaign.higherIsBetter ? actual >= campaign.targetValue : actual <= campaign.targetValue;

  // 尚未填寫 L3（待填寫／逾期）：人資／管理員可逐一或一鍵發送推播提醒
  const unfilledL3 = useMemo(() => filteredL3.filter(r => r.status === 'pending' || r.status === 'overdue'), [filteredL3]);

  const handleSendL3Reminder = (r: L3Confirmation) => {
    const employee = resolveEmployee(r, users);
    if (!employee) { showToast('找不到對應的員工帳號，無法發送提醒'); return; }
    addNotification(employee.id, 'l3_reminder', `提醒您填寫「${r.courseName}」${r.quarter} 季度的在職應用確認，請儘快完成填寫`);
    showToast(`✓ 已發送提醒給 ${r.userName}`);
  };

  const handleSendAllL3Reminders = () => {
    if (unfilledL3.length === 0) { showToast('目前沒有待填寫或逾期的項目'); return; }
    const notifiedEmployeeIds = new Set<string>();
    unfilledL3.forEach(r => {
      const employee = resolveEmployee(r, users);
      if (!employee || notifiedEmployeeIds.has(employee.id)) return;
      notifiedEmployeeIds.add(employee.id);
      addNotification(employee.id, 'l3_reminder', `提醒您填寫「${r.courseName}」${r.quarter} 季度的在職應用確認，請儘快完成填寫`);
    });
    showToast(`✓ 已發送提醒給 ${notifiedEmployeeIds.size} 位員工`);
  };

  // 依部門找出該 L4 計畫負責填報的主管
  const resolveL4Manager = (c: L4Campaign) => users.find(u => u.role === 'manager' && u.department === c.department);

  // 本季尚未填報實際數值的 L4 計畫
  const currentQuarterMissingL4 = useMemo(
    () => l4Campaigns.filter(c => !c.entries.some(e => e.quarter === currentQuarter)),
    [l4Campaigns]
  );

  const handleSendL4Reminder = (c: L4Campaign) => {
    const manager = resolveL4Manager(c);
    if (!manager) { showToast(`找不到「${c.department}」對應的主管帳號，無法發送提醒`); return; }
    addNotification(manager.id, 'l4_reminder', `提醒您填寫「${c.courseName}」（${c.kpiType}）${currentQuarter} 季度的實際 KPI 數值`);
    showToast(`✓ 已發送提醒給 ${manager.name}`);
  };

  const handleSendAllL4Reminders = () => {
    if (currentQuarterMissingL4.length === 0) { showToast('本季 L4 成果評估皆已填報'); return; }
    const notifiedManagerIds = new Set<string>();
    currentQuarterMissingL4.forEach(c => {
      const manager = resolveL4Manager(c);
      if (!manager || notifiedManagerIds.has(manager.id)) return;
      notifiedManagerIds.add(manager.id);
      addNotification(manager.id, 'l4_reminder', `提醒您填寫「${c.courseName}」（${c.kpiType}）${currentQuarter} 季度的實際 KPI 數值`);
    });
    showToast(`✓ 已發送提醒給 ${notifiedManagerIds.size} 位主管`);
  };

  const TABS: { id: TabId; label: string; color: string }[] = [
    { id: 'overview', label: '總覽', color: 'gray' },
    { id: 'l1', label: 'L1 反應評估', color: 'blue' },
    { id: 'l2', label: 'L2 學習評估', color: 'green' },
    { id: 'l3', label: 'L3 行為評估', color: 'orange' },
    { id: 'l4', label: 'L4 成果評估', color: 'purple' },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-lg flex items-center gap-2">
          <span className="text-green-400">✓</span>{toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
          <TrendingUp size={22} className="text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">訓練績效追蹤</h1>
          <p className="text-sm text-gray-500">Kirkpatrick 四層次評估模型 · L1 反應 / L2 學習 / L3 行為 / L4 成果</p>
        </div>
      </div>

      {/* Kirkpatrick explanation */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { level: 'L1', label: '反應評估', desc: '學員滿意度調查', color: 'blue', icon: '😊' },
          { level: 'L2', label: '學習評估', desc: '課程測驗成績', color: 'green', icon: '📝' },
          { level: 'L3', label: '行為評估', desc: '每季工作應用確認', color: 'orange', icon: '⚙️' },
          { level: 'L4', label: '成果評估', desc: '業績/KPI改善成效', color: 'purple', icon: '📈' },
        ].map(({ level, label, desc, color, icon }) => (
          <div key={level} className={`bg-white rounded-xl border border-${color}-100 shadow-sm p-4 text-center`}>
            <div className="text-2xl mb-1">{icon}</div>
            <div className={`text-xs font-bold text-${color}-600 mb-0.5`}>{level}</div>
            <p className="text-sm font-semibold text-gray-800">{label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 overflow-x-auto">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap px-3 ${activeTab === id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'L1 平均滿意度', value: `${overallSat} ★`, sub: '/ 5.0 分', color: 'blue' },
              { label: 'L2 平均測驗分', value: `${avgScore} 分`, sub: `${enrollments.filter(e => e.quizScore).length} 人作答`, color: 'green' },
              { label: 'L3 已確認', value: `${l3ConfirmedCount}`, sub: `待確認 ${l3PendingCount} · 逾期 ${l3OverdueCount}`, color: 'orange' },
              { label: 'L4 成果評估', value: `${l4Campaigns.length}`, sub: `${l4EntryCount} 筆季度數值`, color: 'purple' },
            ].map(({ label, value, sub, color }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center">
                <p className={`text-3xl font-bold text-${color}-600 mb-1`}>{value}</p>
                <p className="text-sm font-medium text-gray-700">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
              </div>
            ))}
          </div>

          {/* L3 Status summary */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-800 mb-4">L3 本季在職應用確認狀態（{currentQuarter}）</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center bg-green-50 rounded-xl p-4">
                <p className="text-2xl font-bold text-green-600">{l3ConfirmedCount}</p>
                <p className="text-sm text-green-700 font-medium mt-1">已確認</p>
              </div>
              <div className="text-center bg-yellow-50 rounded-xl p-4">
                <p className="text-2xl font-bold text-yellow-600">{l3PendingCount}</p>
                <p className="text-sm text-yellow-700 font-medium mt-1">待確認</p>
              </div>
              <div className="text-center bg-red-50 rounded-xl p-4">
                <p className="text-2xl font-bold text-red-600">{l3OverdueCount}</p>
                <p className="text-sm text-red-700 font-medium mt-1">逾期未確認</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* L1: Satisfaction */}
      {activeTab === 'l1' && (
        <div className="space-y-5">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
            <p className="font-semibold mb-1">L1 反應評估 — 學員滿意度調查</p>
            <p>測量學員對課程的即時反應，包含課程內容、授課講師、教材品質及實用性，由完訓後的滿意度調查收集。</p>
          </div>
          {l1Data.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">
              <p>尚無滿意度資料。員工完訓並提交調查後，資料將在此顯示。</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-800 mb-4">各課程整體滿意度評分</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={l1Data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => [`${v} ★`, '滿意度']} />
                  <Bar dataKey="滿意度" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* L2: Learning */}
      {activeTab === 'l2' && (
        <div className="space-y-5">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
            <p className="font-semibold mb-1">L2 學習評估 — 知識測驗成績</p>
            <p>透過課程結束後的測驗評量學員的知識吸收程度，及格分數為 70 分，反映學習成效。</p>
          </div>
          {l2Data.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">
              <p>尚無測驗資料。員工完成課程測驗後，資料將在此顯示。</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-800 mb-4">各課程平均測驗分數</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={l2Data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="平均分數" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Score table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">測驗成績明細</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['員工', '課程', '測驗分數', '狀態'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {enrollments.filter(e => e.quizScore !== null).map(e => {
                    const u = users.find(u => u.id === e.userId);
                    const c = courses.find(c => c.id === e.courseId);
                    return (
                      <tr key={e.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium text-gray-800">{u?.name || '-'}</td>
                        <td className="px-4 py-2 text-gray-600 max-w-[180px] truncate">{c?.title || '-'}</td>
                        <td className="px-4 py-2">
                          <span className={`text-sm font-bold ${(e.quizScore || 0) >= 70 ? 'text-green-600' : 'text-red-500'}`}>{e.quizScore} 分</span>
                        </td>
                        <td className="px-4 py-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${(e.quizScore || 0) >= 70 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                            {(e.quizScore || 0) >= 70 ? '及格' : '不及格'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* L3: Behavior - Quarterly Confirmation */}
      {activeTab === 'l3' && (
        <div className="space-y-5">
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-orange-800">
            <p className="font-semibold mb-1">L3 行為評估 — 在職應用確認</p>
            <p>每位完成訓練的員工，系統會自動以「完訓日期 + 3 個月」計算填寫期限，到期後須填寫實際應用情形並上傳佐證資料，
              依序送直屬主管簽核、部門最高主管簽核，最終由人資留存紀錄。此項目為 TTQS 評核重點，請員工認真填寫。</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <select value={quarterFilter} onChange={e => setQuarterFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white">
              <option value="all">全部季度</option>
              {QUARTERS.map(q => <option key={q} value={q}>{q}</option>)}
            </select>
            <span className="text-sm text-gray-500">{isEmployee ? `我的確認項目：${myL3.filter(r => r.status !== 'not_due').length} 項` : `共 ${filteredL3.length} 筆`}</span>
          </div>

          {/* 待我簽核：直屬主管 */}
          {pendingMyManagerApproval.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-blue-200 flex items-center gap-2">
                <ShieldCheck size={16} className="text-blue-600" />
                <h3 className="font-semibold text-blue-800 text-sm">待我簽核（直屬主管）— {pendingMyManagerApproval.length} 筆</h3>
              </div>
              <div className="divide-y divide-blue-100">
                {pendingMyManagerApproval.map(r => (
                  <div key={r.id} className="p-4">
                    <p className="text-sm font-semibold text-gray-900">{r.userName} · {r.courseName}（{r.quarter}）</p>
                    <p className="text-sm text-gray-700 mt-1.5 whitespace-pre-wrap">{r.applicationContent}</p>
                    {r.kpiNote && <p className="text-xs text-gray-500 mt-1">績效指標：{r.kpiNote}</p>}
                    {!!r.attachments?.length && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {r.attachments.map(a => (
                          <a key={a.id} href={a.dataUrl} download={a.name} className="flex items-center gap-1 text-xs bg-white border border-blue-200 text-blue-700 px-2 py-1 rounded-full hover:bg-blue-100">
                            <Paperclip size={11} />{a.name}
                          </a>
                        ))}
                      </div>
                    )}
                    <textarea value={approvalComment} onChange={e => setApprovalComment(e.target.value)} placeholder="簽核意見（退回時請填寫原因）" rows={2}
                      className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm mt-3 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none" />
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => handleManagerDecision(r, 'rejected')} className="flex-1 flex items-center justify-center gap-1.5 border border-red-200 text-red-600 py-2 rounded-lg text-sm font-medium hover:bg-red-50">
                        <ThumbsDown size={14} /> 退回補正
                      </button>
                      <button onClick={() => handleManagerDecision(r, 'approved')} className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-semibold">
                        <ThumbsUp size={14} /> 核准
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 待我簽核：部門最高主管 */}
          {pendingMyDeptHeadApproval.length > 0 && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-indigo-200 flex items-center gap-2">
                <ShieldCheck size={16} className="text-indigo-600" />
                <h3 className="font-semibold text-indigo-800 text-sm">待我簽核（部門最高主管）— {pendingMyDeptHeadApproval.length} 筆</h3>
              </div>
              <div className="divide-y divide-indigo-100">
                {pendingMyDeptHeadApproval.map(r => (
                  <div key={r.id} className="p-4">
                    <p className="text-sm font-semibold text-gray-900">{r.userName} · {r.courseName}（{r.quarter}）</p>
                    <p className="text-sm text-gray-700 mt-1.5 whitespace-pre-wrap">{r.applicationContent}</p>
                    {r.managerApproval && <p className="text-xs text-gray-500 mt-1">直屬主管 {r.managerApproval.by} 已於 {r.managerApproval.at} 核准</p>}
                    {!!r.attachments?.length && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {r.attachments.map(a => (
                          <a key={a.id} href={a.dataUrl} download={a.name} className="flex items-center gap-1 text-xs bg-white border border-indigo-200 text-indigo-700 px-2 py-1 rounded-full hover:bg-indigo-100">
                            <Paperclip size={11} />{a.name}
                          </a>
                        ))}
                      </div>
                    )}
                    <textarea value={approvalComment} onChange={e => setApprovalComment(e.target.value)} placeholder="簽核意見（退回時請填寫原因）" rows={2}
                      className="w-full border border-indigo-200 rounded-lg px-3 py-2 text-sm mt-3 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none" />
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => handleDeptHeadDecision(r, 'rejected')} className="flex-1 flex items-center justify-center gap-1.5 border border-red-200 text-red-600 py-2 rounded-lg text-sm font-medium hover:bg-red-50">
                        <ThumbsDown size={14} /> 退回補正
                      </button>
                      <button onClick={() => handleDeptHeadDecision(r, 'approved')} className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-semibold">
                        <ThumbsUp size={14} /> 核准並送人資留存
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Employee view: my items to confirm */}
          {isEmployee && (
            <div className="space-y-3">
              {myL3.filter(r => r.status !== 'not_due').length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">
                  <p>目前沒有需要確認的在職應用項目</p>
                </div>
              ) : myL3.filter(r => r.status !== 'not_due').map(r => (
                <div key={r.id} className={`bg-white rounded-xl border shadow-sm overflow-hidden ${r.status === 'overdue' || r.status === 'rejected' ? 'border-red-200' : r.status === 'confirmed' ? 'border-green-200' : 'border-orange-200'}`}>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{r.courseName}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{r.quarter} 季度確認 · 期限 {r.dueDate}</p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${L3_STATUS_COLOR[r.status]}`}>
                        {L3_STATUS_LABEL[r.status]}
                      </span>
                    </div>

                    {r.status === 'confirmed' ? (
                      <div className="bg-green-50 rounded-lg p-3 mt-2">
                        <p className="text-xs font-semibold text-green-700 mb-1">應用內容</p>
                        <p className="text-sm text-green-800 whitespace-pre-wrap">{r.applicationContent}</p>
                        {r.kpiNote && <p className="text-xs text-green-600 mt-1">績效指標：{r.kpiNote}</p>}
                        {!!r.attachments?.length && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {r.attachments.map(a => (
                              <a key={a.id} href={a.dataUrl} download={a.name} className="flex items-center gap-1 text-xs bg-white border border-green-200 text-green-700 px-2 py-1 rounded-full hover:bg-green-100">
                                <Paperclip size={11} />{a.name}
                              </a>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-green-500 mt-2 flex items-center gap-1"><ShieldCheck size={12} /> 已完成簽核並送人資留存：{r.confirmedAt}</p>
                      </div>
                    ) : r.status === 'submitted_manager' || r.status === 'submitted_depthead' ? (
                      <div className="bg-blue-50 rounded-lg p-3 mt-2">
                        <p className="text-xs font-semibold text-blue-700 mb-1">已送出，{r.status === 'submitted_manager' ? '等待直屬主管簽核' : '已通過直屬主管，等待部門最高主管簽核'}</p>
                        <p className="text-sm text-blue-800 whitespace-pre-wrap">{r.applicationContent}</p>
                        <p className="text-xs text-blue-500 mt-1.5 flex items-center gap-1"><Clock size={12} /> 送出時間：{r.submittedAt}</p>
                      </div>
                    ) : (
                      <>
                        {r.status === 'rejected' && (
                          <div className="bg-red-50 rounded-lg p-3 mt-2 mb-3">
                            <p className="text-xs font-semibold text-red-700 mb-1 flex items-center gap-1"><AlertCircle size={12} /> 已被退回，請補正後重新送出</p>
                            <p className="text-xs text-red-600">{r.deptHeadApproval?.comment || r.managerApproval?.comment || '請補充更具體的應用情形或佐證資料'}</p>
                          </div>
                        )}
                        {selectedL3 === r.id ? (
                          <div className="mt-3 space-y-3">
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                請描述您如何將「{r.courseName}」的訓練內容應用於實際工作 *
                              </label>
                              <textarea
                                value={applicationText}
                                onChange={e => setApplicationText(e.target.value)}
                                placeholder="例如：在工作中使用了課程中學到的...，並因此改善了..."
                                rows={3}
                                className="w-full border border-orange-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1.5">績效改善指標（選填）</label>
                              <input
                                type="text"
                                value={kpiNote}
                                onChange={e => setKpiNote(e.target.value)}
                                placeholder="例如：不良率降低 X%、作業時間縮短 X 分鐘..."
                                className="w-full border border-orange-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1.5">佐證資料附件 *（至少 1 份，如報告、照片、紀錄表單）</label>
                              <label className="flex items-center justify-center gap-2 border border-dashed border-orange-300 rounded-lg py-3 text-sm text-orange-600 cursor-pointer hover:bg-orange-50">
                                <Upload size={15} /> 選擇檔案上傳
                                <input type="file" multiple className="hidden" onChange={e => { handleAddAttachments(e.target.files); e.target.value = ''; }} />
                              </label>
                              {pendingAttachments.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {pendingAttachments.map(a => (
                                    <span key={a.id} className="flex items-center gap-1 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                                      <Paperclip size={11} />{a.name}
                                      <button onClick={() => setPendingAttachments(prev => prev.filter(x => x.id !== a.id))} className="ml-1 hover:text-orange-900">
                                        <X size={11} />
                                      </button>
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => { setSelectedL3(null); setApplicationText(''); setKpiNote(''); setPendingAttachments([]); }} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">取消</button>
                              <button
                                onClick={() => handleSubmitL3(r.id)}
                                disabled={!applicationText.trim() || pendingAttachments.length === 0}
                                className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-semibold transition-colors"
                              >
                                送出，提交主管簽核
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setSelectedL3(r.id); setApplicationText(r.applicationContent || ''); setKpiNote(r.kpiNote || ''); setPendingAttachments(r.attachments || []); }}
                            className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            <CheckCircle size={15} />
                            {r.status === 'rejected' ? '補正並重新送出' : '填寫在職應用確認'}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* HR/Admin view: all records */}
          {!isEmployee && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
                <h3 className="font-semibold text-gray-800">L3 在職應用確認總覽</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">已完成 {l3ConfirmedCount}</span>
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full font-medium">處理中 {l3PendingCount}</span>
                  <span className="text-xs bg-red-100 text-red-600 px-2.5 py-1 rounded-full font-medium">逾期 {l3OverdueCount}</span>
                  {unfilledL3.length > 0 && (
                    <button onClick={handleSendAllL3Reminders} className="flex items-center gap-1.5 text-xs bg-orange-500 hover:bg-orange-600 text-white px-2.5 py-1.5 rounded-full font-medium transition-colors">
                      <Bell size={12} /> 一鍵提醒未填寫（{unfilledL3.length}）
                    </button>
                  )}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {['員工', '課程名稱', '季度', '應用內容', '附件', '簽核進度', '狀態', ''].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredL3.map(r => (
                      <Fragment key={r.id}>
                        <tr className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-800">{r.userName}</td>
                          <td className="px-4 py-3 text-gray-600 max-w-[140px] truncate">{r.courseName}</td>
                          <td className="px-4 py-3 text-xs text-gray-500">{r.quarter}</td>
                          <td className="px-4 py-3 max-w-[200px]">
                            {r.applicationContent ? (
                              <p className="text-xs text-gray-700 line-clamp-2">{r.applicationContent}</p>
                            ) : <span className="text-xs text-gray-400">（未填寫）</span>}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500">{r.attachments?.length ? `${r.attachments.length} 份` : '-'}</td>
                          <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                            {r.managerApproval?.decision === 'approved' ? '主管✓' : r.status === 'submitted_manager' ? '待主管' : '-'}
                            {' / '}
                            {r.deptHeadApproval?.decision === 'approved' ? '部門✓' : r.status === 'submitted_depthead' ? '待部門' : '-'}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${L3_STATUS_COLOR[r.status]}`}>
                              {L3_STATUS_LABEL[r.status]}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {(r.status === 'pending' || r.status === 'overdue') && (
                                <button onClick={() => handleSendL3Reminder(r)} title="發送填寫提醒" className="text-orange-500 hover:text-orange-700">
                                  <Bell size={15} />
                                </button>
                              )}
                              <button onClick={() => setExpandedL3(expandedL3 === r.id ? null : r.id)} className="text-gray-400 hover:text-gray-700">
                                <ChevronDown size={15} className={`transition-transform ${expandedL3 === r.id ? 'rotate-180' : ''}`} />
                              </button>
                            </div>
                          </td>
                        </tr>
                        {expandedL3 === r.id && (
                          <tr>
                            <td colSpan={8} className="px-4 py-3 bg-gray-50 text-xs text-gray-600 space-y-1.5">
                              <p>績效指標：{r.kpiNote || '-'}</p>
                              <p>到期日：{r.dueDate || '-'} · 送出時間：{r.submittedAt || '-'}</p>
                              {r.managerApproval && <p>直屬主管 {r.managerApproval.by}：{r.managerApproval.decision === 'approved' ? '核准' : '退回'}（{r.managerApproval.at}）{r.managerApproval.comment ? ` — ${r.managerApproval.comment}` : ''}</p>}
                              {r.deptHeadApproval && <p>部門最高主管 {r.deptHeadApproval.by}：{r.deptHeadApproval.decision === 'approved' ? '核准' : '退回'}（{r.deptHeadApproval.at}）{r.deptHeadApproval.comment ? ` — ${r.deptHeadApproval.comment}` : ''}</p>}
                              {!!r.attachments?.length && (
                                <div className="flex flex-wrap gap-2 pt-1">
                                  {r.attachments.map(a => (
                                    <a key={a.id} href={a.dataUrl} download={a.name} className="flex items-center gap-1 text-xs bg-white border border-gray-200 text-gray-700 px-2 py-1 rounded-full hover:bg-gray-100">
                                      <Paperclip size={11} />{a.name}
                                    </a>
                                  ))}
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* L4: Results */}
      {activeTab === 'l4' && (
        <div className="space-y-5">
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-sm text-purple-800">
            <p className="font-semibold mb-1">L4 成果評估 — 業績與 KPI 改善</p>
            <p>依課程原訂的預期目標 KPI，由主管或 HR 每季填寫實際數值，最多可累積 4 個季度（可跨年度），
              系統將自動比對並以圖表清楚顯示該季是否達標。此層次最難量化，但對於證明訓練投資效益最為重要。</p>
          </div>

          {isHRAdmin && (
            <div className="flex justify-end">
              <button onClick={() => setShowAddL4(true)} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <Plus size={15} /> 新增 L4 成果評估計畫
              </button>
            </div>
          )}

          {/* 本季尚未填報的主管：人資／管理員可逐一或一鍵發送推播提醒 */}
          {isHRAdmin && currentQuarterMissingL4.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-red-200 flex items-center justify-between flex-wrap gap-2">
                <h3 className="font-semibold text-red-800 text-sm flex items-center gap-2">
                  <AlertCircle size={16} /> 本季（{currentQuarter}）尚未填報 — {currentQuarterMissingL4.length} 項
                </h3>
                <button onClick={handleSendAllL4Reminders} className="flex items-center gap-1.5 text-xs bg-red-600 hover:bg-red-700 text-white px-2.5 py-1.5 rounded-full font-medium transition-colors">
                  <Bell size={12} /> 一鍵提醒所有主管
                </button>
              </div>
              <div className="divide-y divide-red-100">
                {currentQuarterMissingL4.map(c => {
                  const manager = resolveL4Manager(c);
                  return (
                    <div key={c.id} className="px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{c.courseName} · {c.kpiType}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{c.department}{manager ? ` · 負責主管：${manager.name}` : ' · 找不到對應主管帳號'}</p>
                      </div>
                      <button onClick={() => handleSendL4Reminder(c)} className="flex items-center gap-1.5 text-xs border border-red-300 text-red-600 hover:bg-red-100 px-2.5 py-1.5 rounded-full font-medium transition-colors">
                        <Bell size={12} /> 發送提醒
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-4">
            {l4Campaigns.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">
                <p>尚無 L4 成果評估計畫</p>
                <p className="text-xs mt-1">由 HR 或主管針對課程設定預期目標 KPI 後，資料將在此顯示</p>
              </div>
            ) : l4Campaigns.map(c => {
              const lastEntry = c.entries[c.entries.length - 1];
              const chartData = c.entries.map(e => ({ quarter: e.quarter, 實際值: e.actualValue }));
              const usedQuarters = new Set(c.entries.map(e => e.quarter));
              return (
                <div key={c.id} className="bg-white rounded-xl border border-purple-100 shadow-sm p-5">
                  <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                    <div>
                      <p className="font-semibold text-gray-900">{c.courseName}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{c.department} · {c.kpiType} · 建立：{c.createdBy}（{c.createdAt}）</p>
                    </div>
                    {lastEntry && (
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 ${isKpiMet(c, lastEntry.actualValue) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {isKpiMet(c, lastEntry.actualValue) ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                        最新季度 {isKpiMet(c, lastEntry.actualValue) ? '已達標' : '未達標'}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">訓前基準值</p>
                      <p className="text-sm font-semibold text-gray-800">{c.baselineValue} {c.unit}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                      <p className="text-xs text-purple-600 mb-1">預期目標 KPI</p>
                      <p className="text-sm font-bold text-purple-700">{c.higherIsBetter ? '≥' : '≤'} {c.targetValue} {c.unit}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">已填報季度</p>
                      <p className="text-sm font-semibold text-gray-800">{c.entries.length} / 4</p>
                    </div>
                  </div>

                  {c.entries.length > 0 && (
                    <div className="mb-4">
                      <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="quarter" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
                          <Tooltip formatter={(v: number) => [`${v} ${c.unit}`, '實際值']} />
                          <Legend />
                          <ReferenceLine y={c.targetValue} stroke="#9333ea" strokeDasharray="4 4" label={{ value: `目標 ${c.targetValue}`, fontSize: 11, fill: '#9333ea' }} />
                          <Line type="monotone" dataKey="實際值" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {c.entries.length > 0 && (
                    <div className="overflow-x-auto mb-3">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-xs text-gray-500">
                            <th className="text-left py-1.5 font-medium">季度</th>
                            <th className="text-left py-1.5 font-medium">實際值</th>
                            <th className="text-left py-1.5 font-medium">是否達標</th>
                            <th className="text-left py-1.5 font-medium">備註</th>
                            <th className="text-left py-1.5 font-medium">填報人</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {c.entries.map(e => (
                            <tr key={e.quarter}>
                              <td className="py-1.5 text-gray-700">{e.quarter}</td>
                              <td className="py-1.5 text-gray-800 font-medium">{e.actualValue} {c.unit}</td>
                              <td className="py-1.5">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isKpiMet(c, e.actualValue) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                  {isKpiMet(c, e.actualValue) ? '達標' : '未達標'}
                                </span>
                              </td>
                              <td className="py-1.5 text-gray-500">{e.note || '-'}</td>
                              <td className="py-1.5 text-gray-400">{e.reportedBy}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {isHRAdmin && c.entries.length < 4 && (
                    addEntryFor === c.id ? (
                      <div className="bg-gray-50 rounded-lg p-3 space-y-2.5">
                        <div className="grid grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">季度</label>
                            <select value={entryForm.quarter} onChange={e => setEntryForm(f => ({ ...f, quarter: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm bg-white">
                              {QUARTER_OPTIONS.filter(q => !usedQuarters.has(q)).map(q => <option key={q} value={q}>{q}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">實際值 *</label>
                            <input type="number" step="any" value={entryForm.actualValue} onChange={e => setEntryForm(f => ({ ...f, actualValue: e.target.value }))} placeholder={`例如 ${c.targetValue}`} className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm" />
                          </div>
                        </div>
                        <input type="text" value={entryForm.note} onChange={e => setEntryForm(f => ({ ...f, note: e.target.value }))} placeholder="備註（選填）" className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm" />
                        <div className="flex gap-2">
                          <button onClick={() => { setAddEntryFor(null); setEntryForm({ quarter: currentQuarter, actualValue: '', note: '' }); }} className="flex-1 border border-gray-200 text-gray-600 py-1.5 rounded-lg text-sm hover:bg-white">取消</button>
                          <button onClick={() => handleAddL4Entry(c.id)} disabled={!entryForm.actualValue} className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-1.5 rounded-lg text-sm font-medium">儲存本季數值</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => { setAddEntryFor(c.id); setEntryForm({ quarter: QUARTER_OPTIONS.find(q => !usedQuarters.has(q)) || currentQuarter, actualValue: '', note: '' }); }} className="flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-800 font-medium">
                        <Plus size={14} /> 填寫本季實際數值
                      </button>
                    )
                  )}
                </div>
              );
            })}
          </div>

          {/* Add L4 Campaign Modal */}
          {showAddL4 && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">新增 L4 成果評估計畫</h3>
                  <button onClick={() => setShowAddL4(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} className="text-gray-500" /></button>
                </div>
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">相關課程 *</label>
                      <select value={l4Form.courseId} onChange={e => setL4Form(f => ({ ...f, courseId: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white">
                        <option value="">請選擇課程</option>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">部門</label>
                      <input type="text" value={l4Form.department} onChange={e => setL4Form(f => ({ ...f, department: e.target.value }))} placeholder="品保課" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">單位</label>
                      <input type="text" value={l4Form.unit} onChange={e => setL4Form(f => ({ ...f, unit: e.target.value }))} placeholder="% / 件/月 / 分鐘" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">KPI 指標名稱 *</label>
                      <input type="text" value={l4Form.kpiType} onChange={e => setL4Form(f => ({ ...f, kpiType: e.target.value }))} placeholder="不合格品率 / 工安事故數 / 作業效率" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">訓前基準值</label>
                      <input type="number" step="any" value={l4Form.baselineValue} onChange={e => setL4Form(f => ({ ...f, baselineValue: e.target.value }))} placeholder="3.2" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">預期目標 KPI *</label>
                      <input type="number" step="any" value={l4Form.targetValue} onChange={e => setL4Form(f => ({ ...f, targetValue: e.target.value }))} placeholder="2.0" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">達標方向</label>
                      <select value={l4Form.higherIsBetter} onChange={e => setL4Form(f => ({ ...f, higherIsBetter: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white">
                        <option value="false">數值越低越好（如事故率、不良率）</option>
                        <option value="true">數值越高越好（如效率、滿意度）</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t border-gray-100 flex gap-3">
                  <button onClick={() => setShowAddL4(false)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">取消</button>
                  <button onClick={handleAddL4} disabled={!l4Form.courseId || !l4Form.kpiType || !l4Form.targetValue} className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors">
                    建立評估計畫
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
