import { useState } from 'react';
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

  const handleAiToggle = () => {
    setAiEnabled(!aiEnabled);
    if (!aiEnabled) setAiDone(false);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.title || !uploadForm.category) return;
    setUploadLoading(true);

    if (aiEnabled) {
      setAiProcessing(true);
      let step = 0;
      const steps = ['分析教材內容...', '生成課程大綱...', '建立測驗題目...', '完成！'];
      const interval = setInterval(() => {
        step++;
        if (step >= steps.length) {
          clearInterval(interval);
          setTimeout(() => {
            addCourse({
              ...uploadForm,
              duration: parseInt(uploadForm.duration) || 60,
              thumbnail: 'bg-blue-500',
              passingScore: 70,
              quizQuestions: [
                {
                  id: 'q1',
                  question: `關於「${uploadForm.title}」，以下哪項描述最為正確？`,
                  options: ['選項 A：基礎概念應用', '選項 B：進階技術實踐', '選項 C：安全操作規範', '選項 D：品質管理要求'],
                  answerIndex: 0,
                },
                {
                  id: 'q2',
                  question: `在實際操作「${uploadForm.category}」時，最重要的注意事項是？`,
                  options: ['效率優先', '安全第一', '成本考量', '速度最重要'],
                  answerIndex: 1,
                },
                {
                  id: 'q3',
                  question: `完成本課程後，員工應能獨立執行哪項工作？`,
                  options: ['基本操作', '進階維護', '日常檢查', '緊急處理'],
                  answerIndex: 2,
                },
              ],
            } as Partial<Course>);
            setAiProcessing(false);
            setAiDone(true);
            setUploadLoading(false);
            setUploadSuccess(true);
            setUploadForm({ title: '', category: '', instructor: '', duration: '', mandatory: false, description: '', file: null });
            setTimeout(() => setUploadSuccess(false), 4000);
          }, 600);
        }
      }, 1200);
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
        <div className="max-w-2xl">
          <h2 className="font-semibold text-gray-900 mb-4">上傳訓練教材</h2>
          {uploadSuccess && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
              <CheckCircle size={18} className="text-green-500" />
              <p className="text-sm text-green-700 font-medium">課程已成功建立！</p>
            </div>
          )}
          <form onSubmit={handleUploadSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-blue-300 transition-colors">
              <Upload size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-700 mb-1">拖曳檔案或點擊上傳</p>
              <p className="text-xs text-gray-400 mb-3">支援 PDF、MP4、PPT、DOCX（最大 500MB）</p>
              <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors inline-block">
                選擇檔案
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.mp4,.ppt,.pptx,.docx"
                  onChange={(e) => setUploadForm((prev) => ({ ...prev, file: e.target.files?.[0] || null }))}
                />
              </label>
              {uploadForm.file && (
                <p className="mt-2 text-xs text-green-600 flex items-center justify-center gap-1">
                  <CheckCircle size={13} /> {uploadForm.file.name}
                </p>
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

            <div className={`rounded-xl p-4 border-2 transition-all ${aiEnabled ? 'border-purple-300 bg-purple-50' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className={aiEnabled ? 'text-purple-600' : 'text-gray-400'} />
                  <span className={`text-sm font-semibold ${aiEnabled ? 'text-purple-800' : 'text-gray-700'}`}>AI 自動生成課程</span>
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Beta</span>
                </div>
                <button
                  type="button"
                  onClick={handleAiToggle}
                  className={`w-12 h-6 rounded-full transition-all relative ${aiEnabled ? 'bg-purple-600' : 'bg-gray-300'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow ${aiEnabled ? 'left-6' : 'left-0.5'}`} />
                </button>
              </div>
              <p className={`text-xs ${aiEnabled ? 'text-purple-600' : 'text-gray-500'}`}>
                {aiEnabled ? '啟用後，系統將自動分析上傳的教材內容，自動生成課程大綱及測驗題目' : '開啟此功能以使用 AI 自動分析教材並生成課程及測驗題目'}
              </p>
              {aiProcessing && !aiDone && (
                <div className="mt-3 space-y-2">
                  {aiSteps.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      {idx === 0 && aiProcessing ? (
                        <div className="w-4 h-4 border-2 border-purple-600/30 border-t-purple-600 rounded-full animate-spin" />
                      ) : step.done ? (
                        <CheckCircle size={16} className="text-purple-500" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                      )}
                      <span className={`text-xs ${step.done ? 'text-purple-700 font-medium' : 'text-gray-400'}`}>{step.label}</span>
                    </div>
                  ))}
                </div>
              )}
              {aiDone && (
                <div className="mt-3 flex items-center gap-2 text-green-600">
                  <CheckCircle size={16} />
                  <span className="text-xs font-medium">AI 已完成分析，課程及測驗題目已自動生成！</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={uploadLoading || !uploadForm.title || !uploadForm.category}
              className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 ${
                uploadLoading || !uploadForm.title || !uploadForm.category
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : aiEnabled ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {uploadLoading ? (
                <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />{aiEnabled ? 'AI 分析中...' : '建立課程中...'}</>
              ) : (
                <>{aiEnabled ? <Sparkles size={16} /> : <Upload size={16} />}{aiEnabled ? 'AI 自動生成課程' : '建立課程'}</>
              )}
            </button>
          </form>
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
