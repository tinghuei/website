import { useState, useRef, useEffect } from 'react';
import { useTrainingAuth } from '../../context/TrainingAuthContext';
import {
  BookOpen,
  Users,
  Upload,
  FileText,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  CheckCircle,
  Sparkles,
  Clock,
  Shield,
  X,
  Eye,
  EyeOff,
  Send,
  BarChart3,
  ClipboardList,
  Lock,
  ChevronDown,
  ChevronRight,
  Plus,
  Building2,
  Flag,
  Tag,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';
import type { Course } from '../../data/trainingMockData';
import OrgChart from './OrgChart';
import { type JobTitleCategory, JOB_TITLE_CATEGORY_OPTIONS, loadJobTitles, saveJobTitles } from '../../lib/jobTitleStorage';
import { loadAdminRoutineCourses, saveAdminRoutineCourses } from '../../lib/adminRoutineCourseStorage';
import { loadPermissionMatrix, savePermissionMatrix } from '../../lib/permissionMatrixStorage';

const ADMIN_TABS = [
  { id: 'courses', label: '課程管理', icon: BookOpen, roles: ['admin'] },
  { id: 'users', label: '人員管理', icon: Users, roles: ['admin'] },
  { id: 'upload', label: '上傳教材', icon: Upload, roles: ['admin'] },
  { id: 'audit', label: '稽核日誌', icon: FileText, roles: ['admin'] },
  { id: 'dispatch', label: '課程派發', icon: Send, roles: ['admin'] },
  { id: 'dual-review', label: '雙重審核', icon: CheckCircle, roles: ['admin'] },
  { id: 'satisfaction', label: '滿意度分析', icon: BarChart3, roles: ['admin'] },
  { id: 'routine', label: '例行課程管理', icon: ClipboardList, roles: ['admin'] },
  { id: 'jobtitles', label: '職稱類別管理', icon: Tag, roles: ['admin', 'hr'] },
  { id: 'orgchart', label: '組織架構圖', icon: Building2, roles: ['admin'] },
  { id: 'question-reports', label: '測驗題目回報', icon: Flag, roles: ['admin'] },
  { id: 'permissions', label: '權限管理', icon: Lock, roles: ['admin'] },
];

// Feature permission matrix (F-001 to F-020)
interface Feature { id: string; name: string; group: string; }
const FEATURES: Feature[] = [
  { id: 'F-001', name: '查看課程庫', group: '課程學習' },
  { id: 'F-002', name: '報名課程', group: '課程學習' },
  { id: 'F-003', name: '查看我的課程', group: '課程學習' },
  { id: 'F-004', name: '提交心得報告', group: '課程學習' },
  { id: 'F-005', name: '參加測驗', group: '課程學習' },
  { id: 'F-006', name: '查看免費課程', group: '課程學習' },
  { id: 'F-007', name: '查看職能分析', group: '職能發展' },
  { id: 'F-008', name: '查看成就獎勵', group: '職能發展' },
  { id: 'F-009', name: '查看職涯規劃', group: '職能發展' },
  { id: 'F-010', name: '查看通知中心', group: '通知系統' },
  { id: 'F-011', name: '發布公告', group: '通知系統' },
  { id: 'F-012', name: '查看年度訓練計畫', group: '管理功能' },
  { id: 'F-013', name: '編輯年度訓練計畫', group: '管理功能' },
  { id: 'F-014', name: '查看管理報表', group: '管理功能' },
  { id: 'F-015', name: '課程審核', group: '管理功能' },
  { id: 'F-016', name: '查看費用訓練同意書', group: '管理功能' },
  { id: 'F-017', name: '發送費用訓練同意書', group: '管理功能' },
  { id: 'F-018', name: '管理實體訓練記錄', group: '管理功能' },
  { id: 'F-019', name: '課程派發', group: '管理功能' },
  { id: 'F-020', name: '系統管理', group: '管理功能' },
];

const ROLES = ['employee', 'manager', 'hr', 'admin'] as const;
type Role = typeof ROLES[number];
const ROLE_LABELS: Record<Role, string> = { employee: '員工', manager: '主管', hr: '人資', admin: '管理員' };

type PermMatrix = Record<string, Record<Role, boolean>>;

function initPermissions(): PermMatrix {
  const defaults: Record<string, Role[]> = {
    'F-001': ['employee', 'manager', 'hr', 'admin'],
    'F-002': ['employee', 'manager', 'hr', 'admin'],
    'F-003': ['employee'],
    'F-004': ['employee', 'manager', 'hr', 'admin'],
    'F-005': ['employee', 'manager', 'hr', 'admin'],
    'F-006': ['employee', 'manager', 'hr', 'admin'],
    'F-007': ['employee', 'manager', 'hr', 'admin'],
    'F-008': ['employee', 'manager', 'hr', 'admin'],
    'F-009': ['employee', 'manager', 'hr', 'admin'],
    'F-010': ['employee', 'manager', 'hr', 'admin'],
    'F-011': ['manager', 'hr', 'admin'],
    'F-012': ['manager', 'hr', 'admin'],
    'F-013': ['manager', 'hr', 'admin'],
    'F-014': ['manager', 'hr', 'admin'],
    'F-015': ['manager', 'admin'],
    'F-016': ['manager', 'hr', 'admin'],
    'F-017': ['hr', 'admin'],
    'F-018': ['manager', 'hr', 'admin'],
    'F-019': ['manager', 'hr', 'admin'],
    'F-020': ['admin'],
  };
  const matrix: PermMatrix = {};
  for (const f of FEATURES) {
    matrix[f.id] = { employee: false, manager: false, hr: false, admin: false };
    for (const role of (defaults[f.id] || [])) {
      matrix[f.id][role] = true;
    }
  }
  return matrix;
}

// Routine course types
interface RoutineCourse {
  id: string;
  courseName: string;
  instructor: string;
  date: string;
  hours: number;
  department: string;
  participants: string[];
  outline: string;
  status: 'draft' | 'pending_hr' | 'hr_approved' | 'sign_in_sent' | 'completed';
  submittedBy: string;
  submittedAt: string;
  hrComment?: string;
  signedParticipants?: string[];
  surveyCount?: number;
}

const INITIAL_ROUTINE: RoutineCourse[] = [
  { id: 'rc1', courseName: '新進人員安全教育訓練', instructor: '林志明', date: '2026-06-05', hours: 3, department: '管理部', participants: ['王小明', '陳美玲', '林志偉'], outline: '公司安全規定、緊急疏散程序、個人防護裝備使用', status: 'hr_approved', submittedBy: '林志明', submittedAt: '2026-06-01', signedParticipants: ['王小明', '陳美玲'] },
  { id: 'rc2', courseName: '5S現場改善技法', instructor: '品保課李主管', date: '2026-06-10', hours: 2, department: '品保課', participants: ['李大明', '黃雅婷'], outline: '5S定義與推行方法、實際案例演練、改善成果追蹤', status: 'pending_hr', submittedBy: '李主管', submittedAt: '2026-06-03' },
  { id: 'rc3', courseName: '設備保養SOP講習', instructor: '工程課王工程師', date: '2026-06-15', hours: 4, department: '工程課', participants: ['王小華', '劉俊達', '蔡建志'], outline: '設備保養週期說明、潤滑油更換規範、異常處理程序', status: 'draft', submittedBy: '王工程師', submittedAt: '2026-06-04' },
];

const roleLabel: Record<string, string> = { admin: '系統管理員', manager: '部門主管', hr: '人資', employee: '員工' };
const roleColor: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700',
  manager: 'bg-blue-100 text-blue-700',
  hr: 'bg-orange-100 text-orange-700',
  employee: 'bg-green-100 text-green-700',
};

export default function TrainingAdminPanel() {
  const { courses, users, auditLogs, enrollments, assignments, questionReports, toggleCourseStatus, deleteCourse, addCourse, currentUser, setUserRole, setUserManager, addUser, setUserStatus, deleteUser, assignCourse, revokeAssignment, approveAsManager, approveAsHR, resolveQuestionReport, updateUserProfile, sendPasswordResetEmail } = useTrainingAuth();
  const isHrOnly = currentUser?.role === 'hr';
  const visibleTabs = ADMIN_TABS.filter(t => !currentUser || t.roles.includes(currentUser.role));
  const [activeTab, setActiveTab] = useState(isHrOnly ? 'jobtitles' : 'courses');
  const [jobTitles, setJobTitles] = useState<JobTitleCategory[]>([]);
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobTitleCategory, setNewJobTitleCategory] = useState(JOB_TITLE_CATEGORY_OPTIONS[0]);
  const [jobTitlesSaved, setJobTitlesSaved] = useState(false);

  useEffect(() => {
    loadJobTitles().then(setJobTitles);
  }, []);

  function updateJobTitleCategory(id: string, category: string) {
    setJobTitles(prev => {
      const next = prev.map(jt => jt.id === id ? { ...jt, category } : jt);
      saveJobTitles(next);
      return next;
    });
  }

  function renameJobTitle(id: string, title: string) {
    setJobTitles(prev => {
      const next = prev.map(jt => jt.id === id ? { ...jt, title } : jt);
      saveJobTitles(next);
      return next;
    });
  }

  function deleteJobTitle(id: string) {
    setJobTitles(prev => {
      const next = prev.filter(jt => jt.id !== id);
      saveJobTitles(next);
      return next;
    });
  }

  function addJobTitle() {
    if (!newJobTitle.trim()) return;
    setJobTitles(prev => {
      const next = [...prev, { id: `jt${Date.now()}`, title: newJobTitle.trim(), category: newJobTitleCategory }];
      saveJobTitles(next);
      return next;
    });
    setNewJobTitle('');
    setJobTitlesSaved(true);
    setTimeout(() => setJobTitlesSaved(false), 2500);
  }
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [aiDone, setAiDone] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    category: '',
    instructor: '',
    duration: '',
    mandatory: false,
    description: '',
    file: null as File | null,
  });
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [editingCourse, setEditingCourse] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [editingUserRole, setEditingUserRole] = useState<string | null>(null);
  const [editingUserManager, setEditingUserManager] = useState<string | null>(null);
  const [editProfileUser, setEditProfileUser] = useState<{ id: string; name: string; employeeId: string; department: string; title: string; joinDate: string; email: string; resetMsg: string } | null>(null);
  const [deleteUserStep, setDeleteUserStep] = useState<{ id: string; step: 1 | 2 } | null>(null);
  const [confirmStatusUser, setConfirmStatusUser] = useState<string | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [addUserForm, setAddUserForm] = useState({ name: '', email: '', department: '', role: 'employee' as 'employee' | 'manager' | 'hr' | 'admin' });
  const [addUserSuccess, setAddUserSuccess] = useState(false);
  const [uploadDragging, setUploadDragging] = useState(false);
  const uploadFileRef = useRef<HTMLInputElement>(null);
  const [aiProgress, setAiProgress] = useState(0);
  const [aiCurrentStep, setAiCurrentStep] = useState(-1);
  interface QuizPreviewItem { id: string; question: string; options: string[]; answerIndex: number; enabled: boolean; }
  const [quizPreview, setQuizPreview] = useState<QuizPreviewItem[]>([]);
  const [showQuizPreview, setShowQuizPreview] = useState(false);
  const [published, setPublished] = useState(false);

  // Dispatch tab state
  const [dispatchUserId, setDispatchUserId] = useState('');
  const [dispatchCourseId, setDispatchCourseId] = useState('');
  const [dispatchDueDate, setDispatchDueDate] = useState('');
  const [dispatchNote, setDispatchNote] = useState('');
  const [dispatchSuccess, setDispatchSuccess] = useState(false);
  const [reviewComment, setReviewComment] = useState('');

  // Satisfaction analysis state
  const [satCourseFilter, setSatCourseFilter] = useState('all');

  // Routine course state
  const [routineCourses, setRoutineCourses] = useState<RoutineCourse[]>([]);
  const [selectedRoutine, setSelectedRoutine] = useState<string | null>(null);
  const [showAddRoutine, setShowAddRoutine] = useState(false);
  const [routineForm, setRoutineForm] = useState({ courseName: '', instructor: '', date: '', hours: '', department: '', participants: '', outline: '' });
  const [expandedRoutine, setExpandedRoutine] = useState<string | null>(null);

  useEffect(() => {
    loadAdminRoutineCourses().then((list) => {
      if (list.length) setRoutineCourses(list);
      else saveAdminRoutineCourses(INITIAL_ROUTINE);
    });
  }, []);

  function updateRoutineCourses(updater: (prev: RoutineCourse[]) => RoutineCourse[]) {
    setRoutineCourses(prev => {
      const next = updater(prev);
      saveAdminRoutineCourses(next);
      return next;
    });
  }

  // Permission matrix state
  const [permissions, setPermissions] = useState<PermMatrix>(() => initPermissions());
  const [expandedGroup, setExpandedGroup] = useState<string | null>('課程學習');
  const [permSaved, setPermSaved] = useState(false);

  useEffect(() => {
    loadPermissionMatrix().then((matrix) => {
      if (matrix) setPermissions(matrix);
    });
  }, []);

  const handleAiToggle = () => {
    setAiEnabled(!aiEnabled);
    if (!aiEnabled) setAiDone(false);
  };

  function generateQuizForCategory(title: string, category: string): QuizPreviewItem[] {
    const catQs: Record<string, Array<{q: string; opts: string[]; ans: number}>> = {
      '安全衛生': [
        { q: '依職業安全衛生法，雇主應提供勞工哪項基本保護？', opts: ['個人防護裝備', '額外加班費', '定期調薪', '彈性上班時間'], ans: 0 },
        { q: '發現工作場所有立即危險時，勞工應？', opts: ['繼續工作', '立即撤離並通報', '等待主管指示再決定', '自行排除危險'], ans: 1 },
        { q: '以下何者不屬於5S活動的內容？', opts: ['整理', '整頓', '清潔', '加班'], ans: 3 },
        { q: '化學品安全資料表 (SDS) 的主要用途是？', opts: ['記錄採購成本', '提供化學品安全資訊', '計算生產效率', '追蹤出貨狀態'], ans: 1 },
      ],
      '生產管理': [
        { q: '看板 (Kanban) 系統主要用於？', opts: ['人員排班', '控制生產流程與庫存', '財務管理', '客戶服務'], ans: 1 },
        { q: '製程能力指數 Cpk ≥ 1.33 代表？', opts: ['製程能力不足', '製程能力尚可', '製程能力優良', '需要立即改善'], ans: 2 },
        { q: 'OEE（設備綜合效率）由哪三項指標組成？', opts: ['品質、成本、交期', '可用率、效能率、品質率', '人員、機器、材料', '計畫、執行、查核'], ans: 1 },
        { q: '精實生產 (Lean) 的核心目標是？', opts: ['增加庫存', '消除浪費', '擴大人員編制', '提高售價'], ans: 1 },
      ],
      '品質管理': [
        { q: 'PDCA 循環中 "C" 代表？', opts: ['計畫', '執行', '查核', '行動'], ans: 2 },
        { q: '魚骨圖 (石川圖) 主要用於分析？', opts: ['銷售趨勢', '問題根本原因', '人員績效', '財務報表'], ans: 1 },
        { q: '品質管制七大手法中，管制圖的主要功能是？', opts: ['找出根本原因', '監控製程穩定性', '計算不良率', '排列優先順序'], ans: 1 },
        { q: 'ISO 9001 是關於哪方面的國際標準？', opts: ['環境管理', '品質管理系統', '資訊安全', '職業安全'], ans: 1 },
      ],
    };
    const defaults = [
      { q: `關於「${title}」的核心概念，下列何者最為正確？`, opts: ['以安全為最優先考量', '以速度為最優先考量', '以成本為最優先考量', '以美觀為最優先考量'], ans: 0 },
      { q: `「${category}」課程主要培養員工哪方面的能力？`, opts: ['財務分析', '專業技術與作業安全', '行銷推廣', '法律知識'], ans: 1 },
      { q: `完成本課程訓練後，員工應能達到哪項基本要求？`, opts: ['獨立完成標準作業程序', '管理整個部門', '自行設計生產線', '負責客戶開發'], ans: 0 },
      { q: `在「${category}」作業中，發現設備異常時應採取什麼措施？`, opts: ['繼續操作直到換班', '立即停機並通報主管', '自行維修後繼續', '等待設備自動修復'], ans: 1 },
    ];
    const pool = catQs[category] || defaults;
    const extra = [
      { q: `「${title}」課程中，員工完成學習後須通過幾分以上的測驗才算合格？`, opts: ['50分', '60分', '70分', '80分'], ans: 2 },
      { q: `若員工無法在規定時間內完成「${category}」訓練，應如何處理？`, opts: ['視為自動放棄', '向主管報備延期原因', '直接補考', '不需特別處理'], ans: 1 },
      { q: `訓練成效評估 (Kirkpatrick Model) 第一層評估的是？`, opts: ['學習成效', '行為改變', '結果產出', '學員反應'], ans: 3 },
      { q: `TTQS 評核中，「計劃 (Plan)」面向主要審查企業的？`, opts: ['訓練實施紀錄', '訓練需求分析與計畫品質', '績效改善成果', '預算執行率'], ans: 1 },
      { q: `「在職訓練 (OJT)」最大的特色是？`, opts: ['脫離工作崗位學習', '由工作中邊做邊學', '需要出差受訓', '由外部講師授課'], ans: 1 },
      { q: `依據樂聯工業教育訓練管理辦法，訓練後的心得報告應於完訓後幾日內繳交？`, opts: ['3日', '7日', '14日', '30日'], ans: 1 },
    ];
    const all = [...pool, ...extra];
    return all.slice(0, 10).map((item, i) => ({
      id: `q${i + 1}`,
      question: item.q,
      options: item.opts,
      answerIndex: item.ans,
      enabled: true,
    }));
  }

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.title || !uploadForm.category) return;
    setUploadLoading(true);
    setPublished(false);
    setShowQuizPreview(false);
    setQuizPreview([]);

    if (aiEnabled) {
      setAiProcessing(true);
      setAiCurrentStep(0);
      setAiProgress(0);

      const stepDurations = [1000, 1200, 1400, 1100, 1000];
      let elapsed = 0;
      stepDurations.forEach((dur, idx) => {
        elapsed += dur;
        setTimeout(() => {
          setAiCurrentStep(idx + 1);
          setAiProgress(Math.round(((idx + 1) / stepDurations.length) * 100));
        }, elapsed);
      });

      setTimeout(() => {
        const quiz = generateQuizForCategory(uploadForm.title, uploadForm.category);
        setQuizPreview(quiz);
        setAiProcessing(false);
        setAiDone(true);
        setShowQuizPreview(true);
        setUploadLoading(false);
      }, elapsed + 400);
    } else {
      setTimeout(() => {
        addCourse({
          ...uploadForm,
          duration: parseInt(uploadForm.duration) || 60,
          thumbnail: 'bg-gray-500',
          passingScore: 70,
          quizQuestions: [],
        } as Partial<Course>);
        setUploadLoading(false);
        setUploadSuccess(true);
        setUploadForm({ title: '', category: '', instructor: '', duration: '', mandatory: false, description: '', file: null });
        setTimeout(() => setUploadSuccess(false), 3000);
      }, 1000);
    }
  };

  const handlePublishCourse = () => {
    const enabledQs = quizPreview.filter(q => q.enabled).map(q => ({
      id: q.id,
      question: q.question,
      options: q.options,
      answerIndex: q.answerIndex,
    }));
    addCourse({
      ...uploadForm,
      duration: parseInt(uploadForm.duration) || 60,
      thumbnail: 'bg-purple-500',
      passingScore: 70,
      quizQuestions: enabledQs,
    } as Partial<Course>);
    setPublished(true);
    setShowQuizPreview(false);
    setUploadSuccess(true);
    setUploadForm({ title: '', category: '', instructor: '', duration: '', mandatory: false, description: '', file: null });
    setAiEnabled(false);
    setAiDone(false);
    setAiCurrentStep(-1);
    setAiProgress(0);
    setQuizPreview([]);
    setTimeout(() => setUploadSuccess(false), 4000);
  };

  const aiSteps = [
    { label: '讀取教材檔案', done: aiProcessing || aiDone },
    { label: '分析課程內容', done: aiProcessing || aiDone },
    { label: '生成測驗題目', done: aiDone },
    { label: '建立課程資料', done: aiDone },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{isHrOnly ? '人資管理' : '系統管理'}</h1>
        <p className="text-gray-500 mt-1 text-sm">{isHrOnly ? '管理職稱類別等人資相關設定' : '管理課程、人員、教材及系統稽核紀錄'}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 overflow-x-auto">
        {visibleTabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* 課程管理 */}
      {activeTab === 'courses' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">課程列表（{courses.length} 門）</h2>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">課程名稱</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">類別</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">講師</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">時長</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">必修</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">狀態</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900 max-w-xs truncate">{course.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">建立：{course.createdAt}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">{course.category}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{course.instructor}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{course.duration} 分</td>
                    <td className="px-4 py-3">
                      {course.mandatory ? (
                        <span className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full">必修</span>
                      ) : (
                        <span className="text-xs text-gray-400">選修</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        course.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {course.status === 'active' ? '啟用' : '停用'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleCourseStatus(course.id)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-blue-600"
                          title={course.status === 'active' ? '停用課程' : '啟用課程'}
                        >
                          {course.status === 'active' ? <ToggleRight size={18} className="text-green-500" /> : <ToggleLeft size={18} />}
                        </button>
                        <button
                          onClick={() => setEditingCourse(course.id)}
                          className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors text-gray-400 hover:text-blue-600"
                          title="編輯"
                        >
                          <Edit size={15} />
                        </button>
                        {!course.videoId && !course.localVideo && (
                          <button
                            onClick={() => setConfirmDelete(course.id)}
                            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-gray-400 hover:text-red-500"
                            title="刪除（僅限尚未上傳線上影片的課程）"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {editingCourse && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
                <h3 className="font-bold text-gray-900 mb-3">編輯課程</h3>
                <p className="text-gray-500 text-sm mb-4">完整的課程編輯功能開發中</p>
                <button onClick={() => setEditingCourse(null)} className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700">關閉</button>
              </div>
            </div>
          )}
          {confirmDelete && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
                <h3 className="font-bold text-gray-900 mb-2">確認刪除</h3>
                <p className="text-gray-500 text-sm mb-4">此操作無法復原，確定要刪除此課程嗎？</p>
                <div className="flex gap-3">
                  <button onClick={() => setConfirmDelete(null)} className="flex-1 border border-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">取消</button>
                  <button
                    onClick={() => {
                      if (confirmDelete) deleteCourse(confirmDelete);
                      setConfirmDelete(null);
                    }}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700"
                  >
                    刪除
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 人員管理 */}
      {activeTab === 'users' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-gray-900">人員與權限管理（{users.length} 人）</h2>
              <p className="text-xs text-gray-400 mt-0.5">可設定每位使用者的系統角色，管理員角色擁有完整權限</p>
            </div>
            <button
              onClick={() => setShowAddUser(true)}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Shield size={14} />
              新增使用者
            </button>
          </div>

          {/* Role legend */}
          <div className="flex items-center gap-4 mb-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-xs text-gray-500 font-medium">角色說明：</span>
            <span className="text-xs bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full font-medium">系統管理員</span>
            <span className="text-xs text-gray-400">完整管理權限、可設定他人角色</span>
            <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium ml-2">部門主管</span>
            <span className="text-xs text-gray-400">可審核下屬訓練報告</span>
            <span className="text-xs bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full font-medium ml-2">人資</span>
            <span className="text-xs text-gray-400">可審核訓練紀錄與職稱管理</span>
            <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium ml-2">員工</span>
            <span className="text-xs text-gray-400">基本訓練功能</span>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 text-left bg-gray-50">
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">員工</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">電子郵件</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">部門</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">入職日期</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">直屬主管</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">角色設定</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">帳號狀態</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((user) => {
                  const isSelf = user.id === currentUser?.id;
                  const isResigned = user.status === 'resigned';
                  return (
                  <tr key={user.id} className={`hover:bg-gray-50 transition-colors ${isSelf ? 'bg-blue-50/30' : ''} ${isResigned ? 'opacity-60' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${
                          user.role === 'admin' ? 'bg-purple-500' : user.role === 'manager' ? 'bg-blue-500' : 'bg-green-500'
                        }`}>
                          {user.avatar || user.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {user.name}
                            {isSelf && <span className="ml-1.5 text-xs text-blue-500">（你）</span>}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{user.department || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{user.joinDate || '-'}</td>
                    <td className="px-4 py-3">
                      {editingUserManager === user.id ? (
                        <div className="flex items-center gap-2">
                          <select
                            defaultValue={user.managerId || ''}
                            onChange={(e) => {
                              setUserManager(user.id, e.target.value || null);
                              setEditingUserManager(null);
                            }}
                            className="text-sm border border-blue-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            autoFocus
                          >
                            <option value="">（無）</option>
                            {users.filter(u => u.id !== user.id && (u.role === 'manager' || u.role === 'admin' || u.role === 'hr')).map(u => (
                              <option key={u.id} value={u.id}>{u.name}（{roleLabel[u.role]}）</option>
                            ))}
                          </select>
                          <button onClick={() => setEditingUserManager(null)} className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1">取消</button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">
                            {user.managerId ? (users.find(u => u.id === user.managerId)?.name || '-') : '-'}
                          </span>
                          <button onClick={() => setEditingUserManager(user.id)} className="text-xs text-gray-400 hover:text-blue-600 underline transition-colors">變更</button>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingUserRole === user.id ? (
                        <div className="flex items-center gap-2">
                          <select
                            defaultValue={user.role}
                            onChange={(e) => {
                              setUserRole(user.id, e.target.value as 'employee' | 'manager' | 'admin');
                              setEditingUserRole(null);
                            }}
                            className="text-sm border border-blue-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            autoFocus
                          >
                            <option value="employee">員工</option>
                            <option value="manager">部門主管</option>
                            <option value="hr">人資</option>
                            <option value="admin">系統管理員</option>
                          </select>
                          <button
                            onClick={() => setEditingUserRole(null)}
                            className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1"
                          >
                            取消
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${roleColor[user.role]}`}>
                            {roleLabel[user.role]}
                          </span>
                          <button
                            onClick={() => setEditingUserRole(user.id)}
                            className="text-xs text-gray-400 hover:text-blue-600 underline transition-colors"
                          >
                            變更
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${isResigned ? 'bg-gray-200 text-gray-600' : 'bg-emerald-100 text-emerald-700'}`}>
                        {isResigned ? '已離職（無法登入）' : '在職'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {(currentUser?.role === 'hr' || currentUser?.role === 'admin') && (
                          <button
                            onClick={() => setEditProfileUser({ id: user.id, name: user.name, employeeId: user.employeeId || '', department: user.department || '', title: user.title || '', joinDate: user.joinDate || '', email: user.email || '', resetMsg: '' })}
                            title="編輯基本資料"
                            className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors text-gray-400 hover:text-blue-500"
                          >
                            <Edit size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => setConfirmStatusUser(user.id)}
                          disabled={isSelf}
                          title={isSelf ? '無法停用自己的帳號' : isResigned ? '恢復在職' : '標記為已離職'}
                          className="text-xs text-gray-400 hover:text-amber-600 underline transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:no-underline"
                        >
                          {isResigned ? '恢復在職' : '標記已離職'}
                        </button>
                        <button
                          onClick={() => setDeleteUserStep({ id: user.id, step: 1 })}
                          disabled={isSelf}
                          title={isSelf ? '無法刪除自己的帳號' : '刪除帳號'}
                          className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 編輯員工基本資料 modal（人資/管理員） */}
          {editProfileUser && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">編輯員工基本資料</h3>
                  <button onClick={() => setEditProfileUser(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">姓名</label>
                    <input
                      type="text"
                      value={editProfileUser.name}
                      onChange={(e) => setEditProfileUser((p) => p ? { ...p, name: e.target.value } : p)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">工號</label>
                    <input
                      type="text"
                      value={editProfileUser.employeeId}
                      onChange={(e) => setEditProfileUser((p) => p ? { ...p, employeeId: e.target.value } : p)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">入職日期</label>
                    <input
                      type="date"
                      value={editProfileUser.joinDate}
                      onChange={(e) => setEditProfileUser((p) => p ? { ...p, joinDate: e.target.value } : p)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">部門</label>
                    <select
                      value={editProfileUser.department}
                      onChange={(e) => setEditProfileUser((p) => p ? { ...p, department: e.target.value } : p)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="">（未設定）</option>
                      {['總經理室','品保課','管理部','總務課','營業部','業務課','研發課','廠務部','廠務室','製造課','組一組','組二組','組三組','沖床組','塗裝組','加工組','財務部','庶務組','人資安全組'].map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">職稱</label>
                    <input
                      type="text"
                      value={editProfileUser.title}
                      onChange={(e) => setEditProfileUser((p) => p ? { ...p, title: e.target.value } : p)}
                      placeholder="請輸入職稱"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="pt-1 border-t border-gray-100">
                    <label className="block text-xs font-medium text-gray-600 mb-1">帳號（登入信箱）</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editProfileUser.email}
                        readOnly
                        className="flex-1 border border-gray-100 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-500"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">信箱變更請至 Supabase Dashboard → Authentication 操作</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">密碼</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={async () => {
                          await sendPasswordResetEmail(editProfileUser.email);
                          setEditProfileUser((p) => p ? { ...p, resetMsg: `已寄出重設密碼信至 ${editProfileUser.email}` } : p);
                        }}
                        className="text-sm border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        發送重設密碼信
                      </button>
                      {editProfileUser.resetMsg && <span className="text-xs text-emerald-600">{editProfileUser.resetMsg}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-5">
                  <button onClick={() => setEditProfileUser(null)} className="flex-1 border border-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">取消</button>
                  <button
                    onClick={async () => {
                      await updateUserProfile(editProfileUser.id, {
                        name: editProfileUser.name,
                        employeeId: editProfileUser.employeeId,
                        department: editProfileUser.department,
                        title: editProfileUser.title,
                        joinDate: editProfileUser.joinDate,
                      });
                      setEditProfileUser(null);
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium"
                  >
                    儲存
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Status toggle confirmation（標記已離職 / 恢復在職） */}
          {confirmStatusUser && (() => {
            const target = users.find((u) => u.id === confirmStatusUser);
            if (!target) return null;
            const willResign = target.status !== 'resigned';
            return (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
                  <h3 className="font-bold text-gray-900 mb-2">{willResign ? '標記為已離職' : '恢復在職'}</h3>
                  <p className="text-gray-500 text-sm mb-4">
                    {willResign
                      ? `確定要將「${target.name}」標記為已離職嗎？標記後該帳號將無法登入系統，但會保留其課程紀錄與稽核資料。`
                      : `確定要恢復「${target.name}」的在職狀態嗎？恢復後該帳號將可再次登入系統。`}
                  </p>
                  <div className="flex gap-3">
                    <button onClick={() => setConfirmStatusUser(null)} className="flex-1 border border-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">取消</button>
                    <button
                      onClick={() => { setUserStatus(target.id, willResign ? 'resigned' : 'active'); setConfirmStatusUser(null); }}
                      className={`flex-1 text-white py-2 rounded-lg text-sm font-medium ${willResign ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                    >
                      {willResign ? '確定標記' : '確定恢復'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* 刪除使用者帳號：兩段式確認，避免誤刪 */}
          {deleteUserStep && (() => {
            const target = users.find((u) => u.id === deleteUserStep.id);
            if (!target) return null;
            return (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
                  {deleteUserStep.step === 1 ? (
                    <>
                      <h3 className="font-bold text-gray-900 mb-2">刪除使用者帳號</h3>
                      <p className="text-gray-500 text-sm mb-4">
                        確定要刪除「{target.name}」（{target.email}）的帳號嗎？此操作無法復原，所有登入權限將立即失效。
                      </p>
                      <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
                        提示：若只是該員工離職，建議改用「標記已離職」以保留歷史訓練紀錄。
                      </p>
                      <div className="flex gap-3">
                        <button onClick={() => setDeleteUserStep(null)} className="flex-1 border border-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">取消</button>
                        <button onClick={() => setDeleteUserStep({ id: target.id, step: 2 })} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-medium">繼續</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="font-bold text-red-700 mb-2">再次確認刪除</h3>
                      <p className="text-gray-500 text-sm mb-4">
                        這是刪除前的最後確認：「{target.name}」的帳號將被永久刪除，且無法復原。確定要繼續嗎？
                      </p>
                      <div className="flex gap-3">
                        <button onClick={() => setDeleteUserStep(null)} className="flex-1 border border-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">取消</button>
                        <button
                          onClick={() => { deleteUser(target.id); setDeleteUserStep(null); }}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-semibold"
                        >
                          確定永久刪除
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Add user modal */}
          {showAddUser && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
                <h3 className="font-bold text-gray-900 mb-1">新增使用者</h3>
                <p className="text-xs text-gray-400 mb-4">建立邀請，待該員工以此信箱完成首次登入後自動套用角色與部門</p>
                {addUserSuccess && (
                  <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                    <CheckCircle size={15} className="text-green-500" />
                    <p className="text-sm text-green-700">邀請已建立，待該員工自行註冊後生效！</p>
                  </div>
                )}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">姓名 *</label>
                    <input
                      type="text"
                      value={addUserForm.name}
                      onChange={(e) => setAddUserForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="請輸入姓名"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">電子郵件 *</label>
                    <input
                      type="email"
                      value={addUserForm.email}
                      onChange={(e) => setAddUserForm(p => ({ ...p, email: e.target.value }))}
                      placeholder="example@company.com"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">部門</label>
                    <input
                      type="text"
                      value={addUserForm.department}
                      onChange={(e) => setAddUserForm(p => ({ ...p, department: e.target.value }))}
                      placeholder="請輸入部門"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">初始角色</label>
                    <select
                      value={addUserForm.role}
                      onChange={(e) => setAddUserForm(p => ({ ...p, role: e.target.value as 'employee' | 'manager' | 'hr' | 'admin' }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="employee">員工</option>
                      <option value="manager">部門主管</option>
                      <option value="hr">人資</option>
                      <option value="admin">系統管理員</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 mt-5">
                  <button
                    onClick={() => { setShowAddUser(false); setAddUserForm({ name: '', email: '', department: '', role: 'employee' }); setAddUserSuccess(false); }}
                    className="flex-1 border border-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
                  >
                    取消
                  </button>
                  <button
                    onClick={() => {
                      if (!addUserForm.name || !addUserForm.email) return;
                      addUser({ name: addUserForm.name, email: addUserForm.email, department: addUserForm.department, role: addUserForm.role });
                      setAddUserSuccess(true);
                      setAddUserForm({ name: '', email: '', department: '', role: 'employee' });
                      setTimeout(() => { setAddUserSuccess(false); setShowAddUser(false); }, 1500);
                    }}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                  >
                    新增
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 上傳教材 */}
      {activeTab === 'upload' && (
        <div className="max-w-3xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-gray-900">上傳訓練教材</h2>
              <p className="text-xs text-gray-400 mt-0.5">上傳教材後可啟用 AI 自動分析內容並生成測驗題目</p>
            </div>
          </div>
          {uploadSuccess && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
              <CheckCircle size={18} className="text-green-500" />
              <p className="text-sm text-green-700 font-medium">{published ? 'AI 生成測驗課程已成功發布！' : '課程已成功建立！'}</p>
            </div>
          )}
          <form onSubmit={handleUploadSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
            {/* Drag & drop zone */}
            <div
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${uploadDragging ? 'border-blue-500 bg-blue-50' : uploadForm.file ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/40'}`}
              onDragOver={(e) => { e.preventDefault(); setUploadDragging(true); }}
              onDragLeave={() => setUploadDragging(false)}
              onDrop={(e) => { e.preventDefault(); setUploadDragging(false); const f = e.dataTransfer.files[0]; if (f) setUploadForm(p => ({ ...p, file: f })); }}
              onClick={() => uploadFileRef.current?.click()}
            >
              <input ref={uploadFileRef} type="file" className="hidden" accept=".pdf,.mp4,.ppt,.pptx,.docx"
                onChange={(e) => setUploadForm(p => ({ ...p, file: e.target.files?.[0] || null }))} />
              {uploadForm.file ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <FileText size={20} className="text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-green-700">{uploadForm.file.name}</p>
                    <p className="text-xs text-green-500">{(uploadForm.file.size / 1024 / 1024).toFixed(2)} MB · 點擊更換檔案</p>
                  </div>
                  <button type="button" onClick={(e) => { e.stopPropagation(); setUploadForm(p => ({ ...p, file: null })); }}
                    className="ml-auto p-1 hover:bg-red-100 rounded text-gray-400 hover:text-red-500">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Upload size={24} className="text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-700 mb-1">拖曳教材檔案至此，或點擊選擇</p>
                  <p className="text-xs text-gray-400">支援 PDF、MP4、PPT、DOCX（最大 500MB）</p>
                </>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">課程名稱 *</label>
                <input
                  type="text"
                  required
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="請輸入課程名稱"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">課程類別 *</label>
                <select
                  required
                  value={uploadForm.category}
                  onChange={(e) => setUploadForm((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">選擇類別</option>
                  {['安全衛生', '生產管理', '品質管理', '職場技能', '技術維護', '軟技能'].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">講師</label>
                <input
                  type="text"
                  value={uploadForm.instructor}
                  onChange={(e) => setUploadForm((prev) => ({ ...prev, instructor: e.target.value }))}
                  placeholder="講師姓名"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">課程時長（分鐘）</label>
                <input
                  type="number"
                  value={uploadForm.duration}
                  onChange={(e) => setUploadForm((prev) => ({ ...prev, duration: e.target.value }))}
                  placeholder="60"
                  min="1"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="mandatory"
                  checked={uploadForm.mandatory}
                  onChange={(e) => setUploadForm((prev) => ({ ...prev, mandatory: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="mandatory" className="text-sm text-gray-700 font-medium">設為必修課程</label>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">課程簡介</label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="請輸入課程說明..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-24"
                />
              </div>
            </div>

            {/* AI toggle */}
            <div className={`rounded-xl p-4 border-2 transition-all ${aiEnabled ? 'border-purple-300 bg-purple-50' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className={aiEnabled ? 'text-purple-600' : 'text-gray-400'} />
                  <span className={`text-sm font-semibold ${aiEnabled ? 'text-purple-800' : 'text-gray-700'}`}>AI 自動分析教材並生成測驗</span>
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">Beta</span>
                </div>
                <button type="button" onClick={handleAiToggle}
                  className={`w-12 h-6 rounded-full transition-all relative ${aiEnabled ? 'bg-purple-600' : 'bg-gray-300'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow ${aiEnabled ? 'left-6' : 'left-0.5'}`} />
                </button>
              </div>
              <p className={`text-xs ${aiEnabled ? 'text-purple-600' : 'text-gray-500'}`}>
                {aiEnabled ? '啟用後，AI 將自動解析教材內容，生成 10 題選擇題測驗供您審核後發布' : '開啟此功能以使用 AI 自動分析教材並生成課程測驗題目'}
              </p>

              {/* AI Progress */}
              {aiProcessing && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between text-xs text-purple-700 font-medium">
                    <span>AI 分析進度</span>
                    <span>{aiProgress}%</span>
                  </div>
                  <div className="w-full bg-purple-100 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full transition-all duration-500" style={{ width: `${aiProgress}%` }} />
                  </div>
                  <div className="space-y-2">
                    {['解析教材文件格式', '提取關鍵知識點', '建立題目知識庫', '生成選擇題選項', '驗證答案正確性'].map((label, idx) => (
                      <div key={idx} className={`flex items-center gap-2 transition-opacity ${aiCurrentStep > idx ? 'opacity-100' : 'opacity-30'}`}>
                        {aiCurrentStep > idx
                          ? <CheckCircle size={14} className="text-purple-500 flex-shrink-0" />
                          : aiCurrentStep === idx
                          ? <div className="w-3.5 h-3.5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                          : <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300 flex-shrink-0" />}
                        <span className={`text-xs ${aiCurrentStep > idx ? 'text-purple-700 font-medium' : 'text-gray-400'}`}>{label}</span>
                        {aiCurrentStep === idx + 1 && aiProcessing && <span className="ml-auto text-xs text-purple-500 animate-pulse">處理中...</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button type="submit"
              disabled={uploadLoading || !uploadForm.title || !uploadForm.category || showQuizPreview}
              className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 ${
                uploadLoading || !uploadForm.title || !uploadForm.category || showQuizPreview
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : aiEnabled ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-200'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}>
              {uploadLoading
                ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />{aiEnabled ? 'AI 分析中...' : '建立課程中...'}</>
                : aiEnabled
                ? <><Sparkles size={16} />AI 分析教材並生成測驗</>
                : <><Upload size={16} />建立課程</>}
            </button>
          </form>

          {/* Quiz Preview Panel */}
          {showQuizPreview && quizPreview.length > 0 && (
            <div className="mt-6 bg-white rounded-xl shadow-sm border border-purple-200">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Sparkles size={16} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">AI 生成測驗預覽</p>
                    <p className="text-xs text-gray-400">共 {quizPreview.length} 題 · 可切換是否啟用各題目 · 審核後點擊發布</p>
                  </div>
                </div>
                <span className="text-xs bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full font-medium">
                  已啟用 {quizPreview.filter(q => q.enabled).length}/{quizPreview.length} 題
                </span>
              </div>

              <div className="divide-y divide-gray-50">
                {quizPreview.map((q, idx) => (
                  <div key={q.id} className={`p-4 transition-colors ${q.enabled ? 'bg-white' : 'bg-gray-50 opacity-50'}`}>
                    <div className="flex items-start gap-3">
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${q.enabled ? 'bg-purple-100 text-purple-700' : 'bg-gray-200 text-gray-400'}`}>
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 mb-2">{q.question}</p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {q.options.map((opt, oi) => (
                            <div key={oi} className={`text-xs px-2.5 py-1.5 rounded-lg border ${oi === q.answerIndex ? 'bg-green-50 border-green-300 text-green-700 font-semibold' : 'border-gray-200 text-gray-600'}`}>
                              {String.fromCharCode(65 + oi)}. {opt}
                              {oi === q.answerIndex && <span className="ml-1 text-green-600">✓</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                      <button type="button"
                        onClick={() => setQuizPreview(prev => prev.map(item => item.id === q.id ? { ...item, enabled: !item.enabled } : item))}
                        className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${q.enabled ? 'hover:bg-red-50 text-gray-400 hover:text-red-500' : 'hover:bg-green-50 text-gray-300 hover:text-green-500'}`}
                        title={q.enabled ? '停用此題' : '啟用此題'}>
                        {q.enabled ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-gray-100 flex gap-3">
                <button type="button" onClick={() => { setShowQuizPreview(false); setAiDone(false); setAiCurrentStep(-1); setAiProgress(0); setQuizPreview([]); }}
                  className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                  重新生成
                </button>
                <button type="button" onClick={handlePublishCourse}
                  disabled={quizPreview.filter(q => q.enabled).length === 0}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-purple-200">
                  <Send size={15} />
                  發布課程（{quizPreview.filter(q => q.enabled).length} 題）
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 稽核日誌 */}
      {activeTab === 'audit' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">稽核日誌（{auditLogs.length} 筆）</h2>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Shield size={14} />
              <span>所有操作均已記錄</span>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="divide-y divide-gray-50">
              {auditLogs.map((log, idx) => (
                <div key={log.id} className="flex gap-4 p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col items-center shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      log.action.includes('通過') ? 'bg-green-100 text-green-700' :
                      log.action.includes('退回') ? 'bg-red-100 text-red-700' :
                      log.action.includes('新增') ? 'bg-blue-100 text-blue-700' :
                      log.action.includes('AI') ? 'bg-purple-100 text-purple-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {log.userName?.[0] || '?'}
                    </div>
                    {idx < auditLogs.length - 1 && <div className="w-px h-full bg-gray-100 mt-2" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-gray-900">{log.userName}</span>
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                            log.action.includes('通過') ? 'bg-green-100 text-green-700' :
                            log.action.includes('退回') ? 'bg-red-100 text-red-700' :
                            log.action.includes('新增') ? 'bg-blue-100 text-blue-700' :
                            log.action.includes('AI') ? 'bg-purple-100 text-purple-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {log.action}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-0.5">{log.target}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{log.details}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock size={11} />{log.timestamp}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 課程派發 */}
      {activeTab === 'dispatch' && (
        <div className="space-y-6">
          {/* Assign course form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Send size={18} className="text-blue-600" /> 派發課程給員工
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">選擇員工</label>
                <select value={dispatchUserId} onChange={e => setDispatchUserId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200">
                  <option value="">-- 請選擇員工 --</option>
                  {users.filter(u => u.role === 'employee').map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.department})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">選擇課程</label>
                <select value={dispatchCourseId} onChange={e => setDispatchCourseId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200">
                  <option value="">-- 請選擇課程 --</option>
                  {courses.filter(c => c.status === 'active').map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">截止日期（選填）</label>
                <input type="date" value={dispatchDueDate} onChange={e => setDispatchDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">備註說明（選填）</label>
                <input type="text" value={dispatchNote} onChange={e => setDispatchNote(e.target.value)}
                  placeholder="如：法定必修、部門專業培訓…"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
            </div>
            <button
              onClick={() => {
                if (!dispatchUserId || !dispatchCourseId) return;
                assignCourse(dispatchUserId, dispatchCourseId, dispatchDueDate || undefined, dispatchNote || undefined);
                setDispatchUserId(''); setDispatchCourseId(''); setDispatchDueDate(''); setDispatchNote('');
                setDispatchSuccess(true);
                setTimeout(() => setDispatchSuccess(false), 3000);
              }}
              disabled={!dispatchUserId || !dispatchCourseId}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={15} /> 確認派發
            </button>
            {dispatchSuccess && <p className="mt-2 text-sm text-green-600 font-medium">✓ 課程派發成功，已通知員工！</p>}
          </div>

          {/* All assignments table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">目前派發清單（{assignments.length} 筆）</h2>
            </div>
            {assignments.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <Send size={32} className="mx-auto mb-3 opacity-30" />
                <p>尚未派發任何課程</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-left">
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">員工</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">課程</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">派發者</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">截止日</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">觀影進度</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">完成狀態</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {assignments.map(asgn => {
                    const user = users.find(u => u.id === asgn.userId);
                    const course = courses.find(c => c.id === asgn.courseId);
                    const enr = enrollments.find(e => e.userId === asgn.userId && e.courseId === asgn.courseId);
                    const isOverdue = asgn.dueDate && new Date(asgn.dueDate) < new Date() && !enr?.certificateIssued;
                    return (
                      <tr key={asgn.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {user?.avatar || user?.name?.[0]}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                              <p className="text-xs text-gray-400">{user?.department}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-800 max-w-[200px] truncate">{course?.title}</p>
                          {asgn.note && <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">{asgn.note}</p>}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{asgn.assignedByName}</td>
                        <td className="px-4 py-3">
                          {asgn.dueDate ? (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isOverdue ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                              {isOverdue ? '⚠ ' : ''}{asgn.dueDate}
                            </span>
                          ) : <span className="text-xs text-gray-400">無截止</span>}
                        </td>
                        <td className="px-4 py-3">
                          {enr ? (
                            <div className="w-24">
                              <div className="bg-gray-100 rounded-full h-2">
                                <div className={`h-2 rounded-full ${enr.progressPercent >= 80 ? 'bg-green-500' : 'bg-blue-500'}`}
                                  style={{ width: `${enr.progressPercent}%` }} />
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5">{Math.round(enr.progressPercent)}%</p>
                            </div>
                          ) : <span className="text-xs text-gray-400">未開始</span>}
                        </td>
                        <td className="px-4 py-3">
                          {enr?.certificateIssued ? (
                            <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">✓ 已完成</span>
                          ) : enr?.status === 'pending_review' ? (
                            <span className="text-xs bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full font-medium">審核中</span>
                          ) : enr ? (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium">進行中</span>
                          ) : (
                            <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">未報名</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => revokeAssignment(asgn.id)}
                            className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors">
                            取消派發
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* 滿意度分析 */}
      {activeTab === 'satisfaction' && (() => {
        const surveyEnrollments = enrollments.filter(e => e.surveyData && Object.keys(e.surveyData).length > 0);
        const courseOptions = Array.from(new Set(surveyEnrollments.map(e => e.courseId))).map(cid => courses.find(c => c.id === cid)).filter(Boolean) as Course[];
        const filteredEnr = satCourseFilter === 'all' ? surveyEnrollments : surveyEnrollments.filter(e => e.courseId === satCourseFilter);

        const avg = (key: string) => {
          const vals = filteredEnr.map(e => Number(e.surveyData?.[key] || 0)).filter(v => v > 0);
          return vals.length ? (vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(1) : '0.0';
        };

        const radarData = [
          { subject: '課程內容', value: parseFloat(avg('content')), fullMark: 5 },
          { subject: '授課講師', value: parseFloat(avg('instructor')), fullMark: 5 },
          { subject: '教材品質', value: parseFloat(avg('materials')), fullMark: 5 },
          { subject: '實用性', value: parseFloat(avg('practical')), fullMark: 5 },
          { subject: '整體滿意', value: parseFloat(avg('overall')), fullMark: 5 },
        ];

        const barData = courseOptions.slice(0, 10).map(c => {
          const ces = surveyEnrollments.filter(e => e.courseId === c.id);
          const avgOverall = ces.length ? (ces.reduce((s, e) => s + Number(e.surveyData?.overall || 0), 0) / ces.length) : 0;
          return { name: c.title.length > 12 ? c.title.slice(0, 12) + '…' : c.title, 整體滿意度: parseFloat(avgOverall.toFixed(1)), 回覆人數: ces.length };
        });

        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <select
                value={satCourseFilter}
                onChange={e => setSatCourseFilter(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
              >
                <option value="all">全部課程</option>
                {courseOptions.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
              <span className="text-sm text-gray-500">共 {filteredEnr.length} 份滿意度調查</span>
            </div>

            {filteredEnr.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">
                <BarChart3 size={32} className="mx-auto mb-3 opacity-30" />
                <p>尚無滿意度調查資料</p>
                <p className="text-xs mt-1">員工提交心得報告後，滿意度資料將在此顯示</p>
              </div>
            ) : (
              <>
                {/* Summary cards */}
                <div className="grid grid-cols-5 gap-3">
                  {[
                    { key: 'content', label: '課程內容' },
                    { key: 'instructor', label: '授課講師' },
                    { key: 'materials', label: '教材品質' },
                    { key: 'practical', label: '實用性' },
                    { key: 'overall', label: '整體滿意' },
                  ].map(({ key, label }) => (
                    <div key={key} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
                      <p className="text-2xl font-bold text-blue-600">{avg(key)}</p>
                      <p className="text-xs text-gray-500 mt-1">{label}</p>
                      <div className="mt-2 bg-gray-100 rounded-full h-1.5">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${(parseFloat(avg(key)) / 5) * 100}%` }} />
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">/ 5.0</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {/* Radar chart */}
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <h3 className="font-semibold text-gray-800 mb-4">各面向平均評分（雷達圖）</h3>
                    <ResponsiveContainer width="100%" height={260}>
                      <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                        <Radar name="平均" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Bar chart */}
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <h3 className="font-semibold text-gray-800 mb-4">各課程整體滿意度</h3>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={barData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 11 }} />
                        <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="整體滿意度" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Detailed table */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-800">填寫明細</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          {['員工', '課程', '內容', '講師', '教材', '實用', '整體', '建議'].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filteredEnr.map(e => {
                          const u = users.find(u => u.id === e.userId);
                          const c = courses.find(c => c.id === e.courseId);
                          return (
                            <tr key={e.id} className="hover:bg-gray-50">
                              <td className="px-4 py-2 font-medium text-gray-800">{u?.name || '-'}</td>
                              <td className="px-4 py-2 text-gray-600 max-w-[140px] truncate">{c?.title || '-'}</td>
                              {['content', 'instructor', 'materials', 'practical', 'overall'].map(k => (
                                <td key={k} className="px-4 py-2 text-center">
                                  <span className={`text-xs font-bold ${Number(e.surveyData?.[k] || 0) >= 4 ? 'text-green-600' : Number(e.surveyData?.[k] || 0) >= 3 ? 'text-yellow-600' : 'text-red-500'}`}>
                                    {e.surveyData?.[k] ? `${e.surveyData[k]}★` : '-'}
                                  </span>
                                </td>
                              ))}
                              <td className="px-4 py-2 text-gray-400 text-xs max-w-[150px] truncate">{String(e.surveyData?.suggestions || '') || '-'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        );
      })()}

      {/* 例行課程管理 */}
      {activeTab === 'routine' && (
        <div className="space-y-5">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
            <p className="font-semibold mb-1">例行課程工作流程</p>
            <p>授課人員建立課程資料 → 送簽人資單位 → 人資審核後建立簽到表 → 傳送給學員線上簽名 → 收集心得報告與滿意度調查</p>
          </div>

          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">例行課程清單（{routineCourses.length} 筆）</h2>
            <button
              onClick={() => setShowAddRoutine(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus size={15} /> 新增例行課程
            </button>
          </div>

          <div className="space-y-3">
            {routineCourses.map(rc => {
              const statusColors: Record<string, string> = {
                draft: 'bg-gray-100 text-gray-600',
                pending_hr: 'bg-yellow-100 text-yellow-700',
                hr_approved: 'bg-blue-100 text-blue-700',
                sign_in_sent: 'bg-purple-100 text-purple-700',
                completed: 'bg-green-100 text-green-700',
              };
              const statusLabels: Record<string, string> = {
                draft: '草稿',
                pending_hr: '待人資審核',
                hr_approved: '人資已核准',
                sign_in_sent: '簽到表已傳送',
                completed: '已完成',
              };
              const isExpanded = expandedRoutine === rc.id;
              return (
                <div key={rc.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div
                    className="p-4 flex items-start justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedRoutine(isExpanded ? null : rc.id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusColors[rc.status]}`}>{statusLabels[rc.status]}</span>
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{rc.department}</span>
                        <span className="text-xs text-gray-400">{rc.date}</span>
                      </div>
                      <p className="font-semibold text-gray-900">{rc.courseName}</p>
                      <p className="text-sm text-gray-500 mt-0.5">講師：{rc.instructor} · {rc.hours}小時 · {rc.participants.length}人</p>
                    </div>
                    <ChevronRight size={16} className={`text-gray-400 mt-1 shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1">課程大綱</p>
                        <p className="text-sm text-gray-700">{rc.outline || '（未填寫）'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1">學員名單（{rc.participants.length} 人）</p>
                        <div className="flex flex-wrap gap-1.5">
                          {rc.participants.map(p => (
                            <span key={p} className={`text-xs px-2 py-0.5 rounded-full border ${rc.signedParticipants?.includes(p) ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                              {p} {rc.signedParticipants?.includes(p) ? '✓' : '（待簽）'}
                            </span>
                          ))}
                        </div>
                      </div>
                      {rc.hrComment && (
                        <div className="bg-blue-50 rounded-lg p-3">
                          <p className="text-xs font-semibold text-blue-700 mb-0.5">人資意見</p>
                          <p className="text-sm text-blue-800">{rc.hrComment}</p>
                        </div>
                      )}
                      {/* Action buttons based on status */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {rc.status === 'draft' && (
                          <button
                            onClick={() => updateRoutineCourses(prev => prev.map(r => r.id === rc.id ? { ...r, status: 'pending_hr' } : r))}
                            className="text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                          >
                            送簽人資審核
                          </button>
                        )}
                        {rc.status === 'pending_hr' && (currentUser?.role === 'admin' || currentUser?.role === 'hr') && (
                          <>
                            <button
                              onClick={() => updateRoutineCourses(prev => prev.map(r => r.id === rc.id ? { ...r, status: 'hr_approved', hrComment: '已審核通過，請傳送簽到表' } : r))}
                              className="text-sm px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                            >
                              ✓ 人資審核通過
                            </button>
                            <button
                              onClick={() => updateRoutineCourses(prev => prev.map(r => r.id === rc.id ? { ...r, status: 'draft', hrComment: '需補充資料後重新提交' } : r))}
                              className="text-sm px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-medium transition-colors"
                            >
                              退回修正
                            </button>
                          </>
                        )}
                        {rc.status === 'hr_approved' && (
                          <button
                            onClick={() => updateRoutineCourses(prev => prev.map(r => r.id === rc.id ? { ...r, status: 'sign_in_sent' } : r))}
                            className="text-sm px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
                          >
                            傳送簽到表給學員
                          </button>
                        )}
                        {rc.status === 'sign_in_sent' && (
                          <button
                            onClick={() => updateRoutineCourses(prev => prev.map(r => r.id === rc.id ? { ...r, status: 'completed', surveyCount: (r.surveyCount || 0) + r.participants.length, signedParticipants: r.participants } : r))}
                            className="text-sm px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                          >
                            完成課程
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
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
                  </div>
                </div>
                <div className="p-4 border-t border-gray-100 flex gap-3">
                  <button onClick={() => setShowAddRoutine(false)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">取消</button>
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
                        submittedBy: currentUser?.name || '系統',
                        submittedAt: new Date().toISOString().split('T')[0],
                      };
                      updateRoutineCourses(prev => [newRc, ...prev]);
                      setRoutineForm({ courseName: '', instructor: '', date: '', hours: '', department: '', participants: '', outline: '' });
                      setShowAddRoutine(false);
                    }}
                    disabled={!routineForm.courseName}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
                  >
                    儲存草稿
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 組織架構圖 */}
      {activeTab === 'orgchart' && <OrgChart />}

      {/* 測驗題目回報 */}
      {activeTab === 'question-reports' && (
        <div>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="font-semibold text-gray-900">測驗題目回報（{questionReports.length} 筆）</h2>
            <div className="flex gap-2">
              <span className="text-xs bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full font-medium">待處理 {questionReports.filter(r => r.status === 'open').length}</span>
              <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">已處理 {questionReports.filter(r => r.status !== 'open').length}</span>
            </div>
          </div>
          {questionReports.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">
              <p>目前沒有員工回報的測驗題目問題</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
              {questionReports.map((r) => (
                <div key={r.id} className="p-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-900">{r.courseName}</span>
                        <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full font-medium">{r.reason}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          r.status === 'open' ? 'bg-yellow-100 text-yellow-700' : r.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {r.status === 'open' ? '待處理' : r.status === 'resolved' ? '已處理' : '已忽略'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mt-1.5">題目：{r.questionText}</p>
                      {r.comment && <p className="text-xs text-gray-500 mt-1">補充說明：{r.comment}</p>}
                      <p className="text-xs text-gray-400 mt-1">回報人：{r.userName} · {r.createdAt}</p>
                      {r.status !== 'open' && <p className="text-xs text-gray-400 mt-0.5">處理人：{r.resolvedBy} · {r.resolvedAt}</p>}
                    </div>
                    {r.status === 'open' && (
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => resolveQuestionReport(r.id, 'dismissed')} className="text-xs border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50">忽略</button>
                        <button onClick={() => resolveQuestionReport(r.id, 'resolved')} className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-medium">標記已處理</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 權限管理 */}
      {activeTab === 'permissions' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            <p className="font-semibold mb-1">功能權限矩陣</p>
            <p>每個功能項目均有獨立編號（F-001 起），可為每個角色分別開啟或關閉各項功能。管理員角色的核心權限（F-020）不建議調整。</p>
          </div>

          {permSaved && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700 flex items-center gap-2">
              <CheckCircle size={16} /> 權限設定已儲存
            </div>
          )}

          {Array.from(new Set(FEATURES.map(f => f.group))).map(group => (
            <div key={group} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <button
                className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedGroup(expandedGroup === group ? null : group)}
              >
                <span className="font-semibold text-gray-800">{group}</span>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${expandedGroup === group ? 'rotate-180' : ''}`} />
              </button>

              {expandedGroup === group && (
                <div className="border-t border-gray-100">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 w-20">編號</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">功能名稱</th>
                        {ROLES.map(r => (
                          <th key={r} className="px-4 py-2 text-center text-xs font-medium text-gray-500 w-20">{ROLE_LABELS[r]}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {FEATURES.filter(f => f.group === group).map(feat => (
                        <tr key={feat.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-2.5">
                            <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{feat.id}</span>
                          </td>
                          <td className="px-4 py-2.5 text-gray-800 font-medium">{feat.name}</td>
                          {ROLES.map(role => (
                            <td key={role} className="px-4 py-2.5 text-center">
                              <input
                                type="checkbox"
                                checked={permissions[feat.id]?.[role] ?? false}
                                onChange={e => setPermissions(prev => ({
                                  ...prev,
                                  [feat.id]: { ...prev[feat.id], [role]: e.target.checked },
                                }))}
                                disabled={feat.id === 'F-020' && role === 'admin'}
                                className="w-4 h-4 accent-blue-600 rounded cursor-pointer disabled:opacity-50 disabled:cursor-default"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}

          <div className="flex justify-end">
            <button
              onClick={() => {
                savePermissionMatrix(permissions);
                setPermSaved(true);
                setTimeout(() => setPermSaved(false), 3000);
              }}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              儲存權限設定
            </button>
          </div>
        </div>
      )}

      {/* 職稱類別管理 */}
      {activeTab === 'jobtitles' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
            <p className="font-semibold mb-1">職稱類別管理</p>
            <p>管理員與人資可在此維護全公司職稱與其所屬類別（如管理職／專業職／技術作業職），供組織圖、職能分析等功能參照使用。</p>
          </div>

          {jobTitlesSaved && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700 flex items-center gap-2">
              <CheckCircle size={16} /> 已新增職稱
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">職稱</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 w-48">類別</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500 w-20">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {jobTitles.map(jt => (
                  <tr key={jt.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2.5">
                      <input
                        type="text"
                        value={jt.title}
                        onChange={(e) => renameJobTitle(jt.id, e.target.value)}
                        className="w-full border border-transparent hover:border-gray-200 focus:border-blue-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-transparent"
                      />
                    </td>
                    <td className="px-4 py-2.5">
                      <select
                        value={jt.category}
                        onChange={(e) => updateJobTitleCategory(jt.id, e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        {JOB_TITLE_CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        onClick={() => deleteJobTitle(jt.id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-gray-400 hover:text-red-500"
                        title="刪除職稱"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {jobTitles.length === 0 && (
                  <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-400 text-sm">尚無職稱資料</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-800 text-sm mb-3">新增職稱</h3>
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[180px]">
                <label className="block text-xs font-medium text-gray-700 mb-1">職稱名稱</label>
                <input
                  type="text"
                  value={newJobTitle}
                  onChange={(e) => setNewJobTitle(e.target.value)}
                  placeholder="例如：資深工程師"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="min-w-[160px]">
                <label className="block text-xs font-medium text-gray-700 mb-1">類別</label>
                <select
                  value={newJobTitleCategory}
                  onChange={(e) => setNewJobTitleCategory(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {JOB_TITLE_CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <button
                onClick={addJobTitle}
                disabled={!newJobTitle.trim()}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium"
              >
                <Plus size={15} /> 新增
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 雙重審核 */}
      {activeTab === 'dual-review' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
            <p className="font-semibold mb-1">雙重審核機制說明</p>
            <p>課程完成後，需由「部門主管」及「人資管理員」各別審核通過後，系統才會自動核發結業證書。</p>
          </div>
          {(() => {
            const pending = enrollments.filter(e => e.reportSubmitted && e.surveySubmitted && e.quizSubmitted && e.reviewStatus === 'pending');
            if (pending.length === 0) {
              return (
                <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">
                  <CheckCircle size={32} className="mx-auto mb-3 opacity-30" />
                  <p>目前沒有待審核的課程申請</p>
                </div>
              );
            }
            return pending.map(enr => {
              const user = users.find(u => u.id === enr.userId);
              const course = courses.find(c => c.id === enr.courseId);
              const isManager = currentUser?.role === 'manager' || currentUser?.role === 'admin';
              const isHR = currentUser?.role === 'admin';
              return (
                <div key={enr.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{course?.title}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">{user?.name} · {user?.department}</p>
                      <p className="text-xs text-gray-400 mt-1">提交日：{enr.submittedAt || '-'} · 測驗：{enr.quizScore}分</p>
                    </div>
                    <div className="flex gap-2">
                      <div className={`text-xs px-2.5 py-1 rounded-full font-medium ${enr.managerApproved ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        主管審核：{enr.managerApproved ? '✓ 已通過' : '待審核'}
                      </div>
                      <div className={`text-xs px-2.5 py-1 rounded-full font-medium ${enr.hrApproved ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        人資審核：{enr.hrApproved ? '✓ 已通過' : '待審核'}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    {isManager && !enr.managerApproved && (
                      <button
                        onClick={() => approveAsManager(enr.id)}
                        className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        ✓ 主管審核通過
                      </button>
                    )}
                    {isHR && !enr.hrApproved && (
                      <button
                        onClick={() => approveAsHR(enr.id)}
                        className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        ✓ 人資審核通過
                      </button>
                    )}
                    {(enr.managerApproved || enr.hrApproved) && (
                      <div className="flex-1 py-2 bg-green-50 text-green-700 rounded-lg text-sm text-center font-medium border border-green-200">
                        {enr.managerApproved && enr.hrApproved ? '✓ 雙重審核完成，證書已核發' : '部分審核完成，等待另一方確認...'}
                      </div>
                    )}
                  </div>
                </div>
              );
            });
          })()}
        </div>
      )}
    </div>
  );
}
