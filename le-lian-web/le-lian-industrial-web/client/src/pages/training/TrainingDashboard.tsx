import { useState, useEffect } from 'react';
import { useTrainingAuth } from '../../context/TrainingAuthContext';
import { useLocation } from 'wouter';
import {
  BookOpen,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Bell,
  ClipboardCheck,
  Timer,
  X,
  User,
} from 'lucide-react';

const statusBadge: Record<string, { label: string; cls: string }> = {
  in_progress: { label: '進行中', cls: 'bg-yellow-100 text-yellow-700' },
  pending_review: { label: '待審核', cls: 'bg-blue-100 text-blue-700' },
  completed: { label: '已完成', cls: 'bg-green-100 text-green-700' },
  rejected: { label: '已退回', cls: 'bg-red-100 text-red-700' },
};

const DEPT_OPTIONS = ['總經理室', '品保課', '管理部', '總務課', '營業部', '業務課', '研發課', '廠務部', '廠務室', '製造課', '組一組', '組二組', '組三組', '沖床組', '塗裝組', '加工組', '財務部', '庶務組', '人資安全組'];
const TITLE_OPTIONS = ['操作員', '技術員', '工程師', '主任', '課長', '組長', '副理', '經理'];

export default function TrainingDashboard() {
  const { currentUser, getUserEnrollments, courses, getUserNotifications, getPendingReviews } = useTrainingAuth();
  const [, navigate] = useLocation();

  const profileKey = `profile_done_${currentUser?.id}`;
  const [showProfile, setShowProfile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !localStorage.getItem(profileKey);
  });
  const [profileForm, setProfileForm] = useState({
    employeeId: currentUser?.email?.split('@')[0] || '',
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    department: currentUser?.department || '',
    title: '',
  });
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    if (profileSaved) {
      localStorage.setItem(profileKey, '1');
      setTimeout(() => setShowProfile(false), 800);
    }
  }, [profileSaved, profileKey]);

  const enrollments = currentUser ? getUserEnrollments(currentUser.id) : [];
  const notifications = currentUser ? getUserNotifications(currentUser.id) : [];
  const pendingReviews = getPendingReviews();

  const totalHours = enrollments.reduce((sum, e) => sum + (e.watchTimeMinutes || 0), 0) / 60;
  const completedCount = enrollments.filter((e) => e.status === 'completed').length;

  const stats = {
    enrolled: enrollments.length,
    completed: completedCount,
    pendingReview: enrollments.filter((e) => e.status === 'pending_review').length,
    certificates: enrollments.filter((e) => e.certificateIssued).length,
    hours: totalHours,
  };

  const recentEnrollments = enrollments.slice(0, 4);
  const unreadNotifications = notifications.filter((n) => !n.read).slice(0, 5);

  const isManager = currentUser?.role === 'manager' || currentUser?.role === 'admin';

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Employee Profile Modal */}
      {showProfile && currentUser?.role === 'employee' && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center">
                  <User size={18} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">填寫員工基本資料</h2>
                  <p className="text-xs text-gray-500">完善您的個人資訊，以獲得更好的學習體驗</p>
                </div>
              </div>
              <button onClick={() => { localStorage.setItem(profileKey, '1'); setShowProfile(false); }} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X size={16} className="text-gray-400" />
              </button>
            </div>
            {profileSaved ? (
              <div className="p-8 text-center">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle size={28} className="text-green-500" />
                </div>
                <p className="font-semibold text-gray-900">資料已儲存！</p>
                <p className="text-sm text-gray-500 mt-1">正在進入訓練系統...</p>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">工號 <span className="text-red-500">*</span></label>
                    <input
                      value={profileForm.employeeId}
                      onChange={(e) => setProfileForm((p) => ({ ...p, employeeId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                      placeholder="員工工號"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">姓名 <span className="text-red-500">*</span></label>
                    <input
                      value={profileForm.name}
                      onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                      placeholder="員工姓名"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">電子郵件</label>
                  <input
                    value={profileForm.email}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-100 rounded-lg text-sm bg-gray-50 text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">部門 <span className="text-red-500">*</span></label>
                  <select
                    value={profileForm.department}
                    onChange={(e) => setProfileForm((p) => ({ ...p, department: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="">選擇部門</option>
                    {DEPT_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">職稱</label>
                  <select
                    value={profileForm.title}
                    onChange={(e) => setProfileForm((p) => ({ ...p, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="">選擇職稱</option>
                    {TITLE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <button
                  onClick={() => setProfileSaved(true)}
                  disabled={!profileForm.employeeId || !profileForm.name || !profileForm.department}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors"
                >
                  儲存並繼續
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          歡迎回來，{currentUser?.name} 👋
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          {currentUser?.department} ·{' '}
          {{ admin: '系統管理員', manager: '部門主管', employee: '員工' }[currentUser?.role || 'employee']}
        </p>
      </div>

      {/* Manager alert */}
      {isManager && pendingReviews.length > 0 && (
        <div
          onClick={() => navigate('/training/review')}
          className="mb-6 bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-orange-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <ClipboardCheck size={20} className="text-orange-600" />
            </div>
            <div>
              <p className="font-semibold text-orange-800">有 {pendingReviews.length} 份學習資料待審核</p>
              <p className="text-orange-600 text-sm">請前往審核面板進行審核</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-orange-500" />
        </div>
      )}

      {/* Stats */}
      {currentUser?.role === 'employee' && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-3">
              <BookOpen size={20} className="text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.enrolled}</p>
            <p className="text-sm text-gray-500 mt-1">已報名課程</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center mb-3">
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
            <p className="text-sm text-gray-500 mt-1">已完成課程</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center mb-3">
              <Timer size={20} className="text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.hours > 0 ? stats.hours.toFixed(1) : '0'}h</p>
            <p className="text-sm text-gray-500 mt-1">總訓練時數</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center mb-3">
              <Clock size={20} className="text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.pendingReview}</p>
            <p className="text-sm text-gray-500 mt-1">待審核</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center mb-3">
              <Award size={20} className="text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.certificates}</p>
            <p className="text-sm text-gray-500 mt-1">已取得證書</p>
          </div>
        </div>
      )}

      {isManager && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {[
            { label: '待審核案件', value: pendingReviews.length, icon: ClipboardCheck, color: 'orange' },
            { label: '本月已審核', value: 3, icon: CheckCircle, color: 'green' },
            { label: '已發放證書', value: 4, icon: Award, color: 'blue' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className={`w-10 h-10 rounded-lg bg-${color}-50 flex items-center justify-center mb-3`}>
                <Icon size={20} className={`text-${color}-600`} />
              </div>
              <p className="text-3xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Courses */}
        {currentUser?.role === 'employee' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">我的課程</h2>
              <button
                onClick={() => navigate('/training/my-courses')}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                查看全部 <ChevronRight size={14} />
              </button>
            </div>
            {recentEnrollments.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen size={32} className="text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">尚未報名任何課程</p>
                <button
                  onClick={() => navigate('/training/courses')}
                  className="mt-3 text-sm text-blue-600 hover:text-blue-700"
                >
                  瀏覽課程庫
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentEnrollments.map((enr) => {
                  const course = courses.find((c) => c.id === enr.courseId);
                  const badge = statusBadge[enr.status];
                  return (
                    <div
                      key={enr.id}
                      onClick={() => navigate(`/training/courses/${enr.courseId}`)}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
                    >
                      <div className={`w-10 h-10 rounded-lg ${course?.thumbnail || 'bg-blue-500'} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                        {course?.title?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{course?.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                            <div
                              className="bg-blue-500 h-1.5 rounded-full"
                              style={{ width: `${enr.progressPercent}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 shrink-0">{enr.progressPercent}%</span>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${badge?.cls}`}>
                        {badge?.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Pending Reviews for manager */}
        {isManager && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">待審核項目</h2>
              <button
                onClick={() => navigate('/training/review')}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                前往審核 <ChevronRight size={14} />
              </button>
            </div>
            {pendingReviews.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle size={32} className="text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">目前沒有待審核的項目</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingReviews.slice(0, 4).map((enr) => {
                  const course = courses.find((c) => c.id === enr.courseId);
                  return (
                    <div key={enr.id} className="flex items-center gap-3 p-3 rounded-lg bg-orange-50">
                      <div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center text-orange-700 text-xs font-bold">
                        {enr.userId}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{course?.title}</p>
                        <p className="text-xs text-gray-500">測驗：{enr.quizScore}分</p>
                      </div>
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                        待審核
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Notifications */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={16} className="text-gray-600" />
            <h2 className="font-semibold text-gray-900">最新通知</h2>
            {unreadNotifications.length > 0 && (
              <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                {unreadNotifications.length}
              </span>
            )}
          </div>
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell size={32} className="text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">暫無通知</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.slice(0, 5).map((n) => (
                <div key={n.id} className={`flex items-start gap-3 p-3 rounded-lg ${!n.read ? 'bg-blue-50' : ''}`}>
                  <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${!n.read ? 'bg-blue-500' : 'bg-gray-200'}`} />
                  <div>
                    <p className="text-sm text-gray-700">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{n.createdAt}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mandatory Courses Reminder */}
        {currentUser?.role === 'employee' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle size={16} className="text-yellow-500" />
              <h2 className="font-semibold text-gray-900">必修課程提醒</h2>
            </div>
            {courses
              .filter((c) => c.mandatory)
              .map((c) => {
                const enr = enrollments.find((e) => e.courseId === c.id);
                const done = enr?.status === 'completed';
                return (
                  <div key={c.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                      {done ? (
                        <CheckCircle size={18} className="text-green-500 shrink-0" />
                      ) : (
                        <AlertCircle size={18} className="text-yellow-500 shrink-0" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-800">{c.title}</p>
                        <p className="text-xs text-gray-500">截止日期：2025-06-30</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${done ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {done ? '已完成' : '未完成'}
                    </span>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
