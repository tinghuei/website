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
} from 'lucide-react';

const statusBadge: Record<string, { label: string; cls: string }> = {
  in_progress: { label: '進行中', cls: 'bg-yellow-100 text-yellow-700' },
  pending_review: { label: '待審核', cls: 'bg-blue-100 text-blue-700' },
  completed: { label: '已完成', cls: 'bg-green-100 text-green-700' },
  rejected: { label: '已退回', cls: 'bg-red-100 text-red-700' },
};

export default function TrainingDashboard() {
  const { currentUser, getUserEnrollments, courses, getUserNotifications, getPendingReviews } = useTrainingAuth();
  const [, navigate] = useLocation();

  const enrollments = currentUser ? getUserEnrollments(currentUser.id) : [];
  const notifications = currentUser ? getUserNotifications(currentUser.id) : [];
  const pendingReviews = getPendingReviews();

  const stats = {
    enrolled: enrollments.length,
    completed: enrollments.filter((e) => e.status === 'completed').length,
    pendingReview: enrollments.filter((e) => e.status === 'pending_review').length,
    certificates: enrollments.filter((e) => e.certificateIssued).length,
  };

  const recentEnrollments = enrollments.slice(0, 4);
  const unreadNotifications = notifications.filter((n) => !n.read).slice(0, 5);

  const isManager = currentUser?.role === 'manager' || currentUser?.role === 'admin';

  return (
    <div className="p-6 max-w-7xl mx-auto">
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: '已報名課程', value: stats.enrolled, icon: BookOpen, color: 'blue' },
            { label: '已完成課程', value: stats.completed, icon: CheckCircle, color: 'green' },
            { label: '待審核', value: stats.pendingReview, icon: Clock, color: 'yellow' },
            { label: '已取得證書', value: stats.certificates, icon: Award, color: 'purple' },
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
