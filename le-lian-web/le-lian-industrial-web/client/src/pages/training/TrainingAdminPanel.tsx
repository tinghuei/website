import { useState, useRef } from 'react';
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
} from 'lucide-react';
import type { Course } from '../../data/trainingMockData';

const ADMIN_TABS = [
  { id: 'courses', label: '課程管理', icon: BookOpen },
  { id: 'users', label: '人員管理', icon: Users },
  { id: 'upload', label: '上傳教材', icon: Upload },
  { id: 'audit', label: '稽核日誌', icon: FileText },
];

const roleLabel: Record<string, string> = { admin: '系統管理員', manager: '部門主管', employee: '員工' };
const roleColor: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700',
  manager: 'bg-blue-100 text-blue-700',
  employee: 'bg-green-100 text-green-700',
};

export default function TrainingAdminPanel() {
  const { courses, users, auditLogs, toggleCourseStatus, addCourse, currentUser, setUserRole, addUser } = useTrainingAuth();
  const [activeTab, setActiveTab] = useState('courses');
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
  const [showAddUser, setShowAddUser] = useState(false);
  const [addUserForm, setAddUserForm] = useState({ name: '', email: '', department: '', role: 'employee' as 'employee' | 'manager' | 'admin' });
  const [addUserSuccess, setAddUserSuccess] = useState(false);
  const [uploadDragging, setUploadDragging] = useState(false);
  const uploadFileRef = useRef<HTMLInputElement>(null);
  const [aiProgress, setAiProgress] = useState(0);
  const [aiCurrentStep, setAiCurrentStep] = useState(-1);
  interface QuizPreviewItem { id: string; question: string; options: string[]; answerIndex: number; enabled: boolean; }
  const [quizPreview, setQuizPreview] = useState<QuizPreviewItem[]>([]);
  const [showQuizPreview, setShowQuizPreview] = useState(false);
  const [published, setPublished] = useState(false);

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
        <h1 className="text-2xl font-bold text-gray-900">系統管理</h1>
        <p className="text-gray-500 mt-1 text-sm">管理課程、人員、教材及系統稽核紀錄</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 overflow-x-auto">
        {ADMIN_TABS.map(({ id, label, icon: Icon }) => (
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
                        <button
                          onClick={() => setConfirmDelete(course.id)}
                          className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-gray-400 hover:text-red-500"
                          title="刪除"
                        >
                          <Trash2 size={15} />
                        </button>
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
                  <button onClick={() => setConfirmDelete(null)} className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700">刪除</button>
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
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">角色設定</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((user) => (
                  <tr key={user.id} className={`hover:bg-gray-50 transition-colors ${user.id === currentUser?.id ? 'bg-blue-50/30' : ''}`}>
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
                            {user.id === currentUser?.id && <span className="ml-1.5 text-xs text-blue-500">（你）</span>}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{user.department || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{user.joinDate || '-'}</td>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add user modal */}
          {showAddUser && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
                <h3 className="font-bold text-gray-900 mb-1">新增使用者</h3>
                <p className="text-xs text-gray-400 mb-4">新增使用者並設定初始角色</p>
                {addUserSuccess && (
                  <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                    <CheckCircle size={15} className="text-green-500" />
                    <p className="text-sm text-green-700">使用者已新增成功！</p>
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
                      onChange={(e) => setAddUserForm(p => ({ ...p, role: e.target.value as 'employee' | 'manager' | 'admin' }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="employee">員工</option>
                      <option value="manager">部門主管</option>
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
                      addUser({ name: addUserForm.name, email: addUserForm.email, password: '1234', role: addUserForm.role, department: addUserForm.department, avatar: addUserForm.name[0], joinDate: new Date().toISOString().split('T')[0] });
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
    </div>
  );
}
