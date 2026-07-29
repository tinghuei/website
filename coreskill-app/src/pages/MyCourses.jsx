import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  CheckCircle,
  XCircle,
  Clock,
  Award,
  X,
  ChevronRight,
  FileText,
  Star,
  ClipboardList,
  BookOpen,
} from 'lucide-react';

const TAB_FILTERS = [
  { id: 'all', label: '全部', statuses: ['in_progress', 'pending_review', 'completed', 'rejected'] },
  { id: 'in_progress', label: '進行中', statuses: ['in_progress'] },
  { id: 'pending_review', label: '待審核', statuses: ['pending_review'] },
  { id: 'completed', label: '已完成', statuses: ['completed'] },
  { id: 'rejected', label: '已退回', statuses: ['rejected'] },
];

const STATUS_CONFIG = {
  in_progress: { label: '進行中', cls: 'bg-yellow-100 text-yellow-700', icon: Clock },
  pending_review: { label: '待審核', cls: 'bg-blue-100 text-blue-700', icon: Clock },
  completed: { label: '已完成', cls: 'bg-green-100 text-green-700', icon: CheckCircle },
  rejected: { label: '已退回', cls: 'bg-red-100 text-red-700', icon: XCircle },
};

const thumbnailColors = {
  'bg-blue-500': 'bg-blue-500',
  'bg-green-500': 'bg-green-500',
  'bg-purple-500': 'bg-purple-500',
  'bg-orange-500': 'bg-orange-500',
  'bg-red-500': 'bg-red-500',
  safety: 'bg-red-500',
  lean: 'bg-blue-500',
  culture: 'bg-green-500',
  maintenance: 'bg-purple-500',
};

function CertificateModal({ enrollment, course, user, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden">
        {/* Certificate design */}
        <div className="bg-gradient-to-br from-blue-700 to-indigo-800 p-8 text-white relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 border-4 border-white/10 rounded-full" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 border-4 border-white/10 rounded-full" />

          <div className="relative z-10 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Award size={32} className="text-yellow-300" />
            </div>
            <p className="text-blue-200 text-sm font-medium uppercase tracking-widest mb-1">CoreSkill Enterprise</p>
            <h2 className="text-2xl font-black mb-1">結業證書</h2>
            <p className="text-blue-200 text-sm">Certificate of Completion</p>
          </div>
        </div>

        <div className="p-8 text-center">
          <p className="text-gray-500 text-sm mb-1">茲證明</p>
          <h3 className="text-2xl font-black text-gray-900 mb-4">{user?.name}</h3>

          <p className="text-gray-500 text-sm mb-1">已完成</p>
          <h4 className="text-xl font-bold text-blue-600 mb-4">{course?.title}</h4>

          <div className="flex justify-center gap-8 mb-6 text-sm text-gray-600">
            <div>
              <p className="text-gray-400 text-xs mb-0.5">測驗成績</p>
              <p className="font-bold text-lg">{enrollment.quizScore} 分</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-0.5">完成日期</p>
              <p className="font-bold">{enrollment.completedAt}</p>
            </div>
          </div>

          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 border-4 border-blue-600 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-black text-xs text-center leading-tight">核准<br />蓋章</span>
            </div>
          </div>

          <p className="text-xs text-gray-400 mb-4">
            CoreSkill Enterprise 核心技能訓練平台 官方核發
          </p>

          <button
            onClick={onClose}
            className="flex items-center gap-2 mx-auto text-gray-500 hover:text-gray-700 text-sm"
          >
            <X size={16} /> 關閉
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MyCourses() {
  const { currentUser, courses, getUserEnrollments } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedCert, setSelectedCert] = useState(null);

  const enrollments = currentUser ? getUserEnrollments(currentUser.id) : [];

  const activeTabConfig = TAB_FILTERS.find((t) => t.id === activeTab);
  const filteredEnrollments = enrollments.filter((e) =>
    activeTabConfig?.statuses.includes(e.status)
  );

  const tabCounts = TAB_FILTERS.reduce((acc, tab) => {
    acc[tab.id] = enrollments.filter((e) => tab.statuses.includes(e.status)).length;
    return acc;
  }, {});

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">我的課程</h1>
        <p className="text-gray-500 mt-1 text-sm">管理您的學習進度與完成記錄</p>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: '全部', count: tabCounts.all, color: 'blue' },
          { label: '進行中', count: tabCounts.in_progress, color: 'yellow' },
          { label: '待審核', count: tabCounts.pending_review, color: 'indigo' },
          { label: '已完成', count: tabCounts.completed, color: 'green' },
        ].map(({ label, count, color }) => (
          <div key={label} className={`bg-${color}-50 border border-${color}-100 rounded-xl p-4 text-center`}>
            <p className={`text-2xl font-bold text-${color}-700`}>{count}</p>
            <p className={`text-xs text-${color}-600 mt-0.5`}>{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {TAB_FILTERS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
            }`}
          >
            {tab.label}
            {tabCounts[tab.id] > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                {tabCounts[tab.id]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Enrollment list */}
      {filteredEnrollments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <BookOpen size={48} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">此分類暫無課程</p>
          {activeTab === 'all' && (
            <button
              onClick={() => navigate('/courses')}
              className="mt-3 text-blue-600 text-sm hover:text-blue-700"
            >
              瀏覽課程庫
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEnrollments.map((enr) => {
            const course = courses.find((c) => c.id === enr.courseId);
            if (!course) return null;
            const statusConf = STATUS_CONFIG[enr.status];
            const StatusIcon = statusConf?.icon || Clock;
            const thumbColor = thumbnailColors[course.thumbnail] || 'bg-blue-500';

            return (
              <div
                key={enr.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Thumbnail */}
                    <div
                      className={`${thumbColor} w-14 h-14 rounded-xl flex items-center justify-center text-white font-black text-xl shrink-0 cursor-pointer`}
                      onClick={() => navigate(`/courses/${course.id}`)}
                    >
                      {course.title[0]}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3
                            className="font-semibold text-gray-900 text-sm cursor-pointer hover:text-blue-600 transition-colors"
                            onClick={() => navigate(`/courses/${course.id}`)}
                          >
                            {course.title}
                          </h3>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {course.category} · 報名日：{enr.enrolledAt}
                          </p>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 shrink-0 ${statusConf?.cls}`}>
                          <StatusIcon size={12} />
                          {statusConf?.label}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>影片進度</span>
                          <span>{enr.progressPercent}%</span>
                        </div>
                        <div className="bg-gray-100 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              enr.progressPercent >= 100 ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${enr.progressPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Submission status icons */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {[
                          { label: '心得報告', done: enr.reportSubmitted, icon: FileText },
                          { label: '滿意度調查', done: enr.surveySubmitted, icon: Star },
                          { label: '測驗', done: enr.quizSubmitted, score: enr.quizScore, icon: ClipboardList },
                        ].map(({ label, done, score, icon: Icon }) => (
                          <div
                            key={label}
                            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg font-medium ${
                              done ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'
                            }`}
                          >
                            <Icon size={13} />
                            {label}
                            {done ? (
                              <>
                                <CheckCircle size={12} className="text-green-500" />
                                {score != null && <span className="text-green-600">({score}分)</span>}
                              </>
                            ) : (
                              <XCircle size={12} className="text-gray-300" />
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Rejection comment */}
                      {enr.status === 'rejected' && enr.managerComment && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-lg">
                          <p className="text-xs font-semibold text-red-700 mb-0.5">退回意見：</p>
                          <p className="text-xs text-red-600">{enr.managerComment}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50 flex-wrap">
                    <button
                      onClick={() => navigate(`/courses/${course.id}`)}
                      className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-blue-300 transition-colors"
                    >
                      繼續學習 <ChevronRight size={14} />
                    </button>

                    {enr.progressPercent >= 80 && !enr.reportSubmitted && (
                      <button
                        onClick={() => navigate(`/courses/${course.id}/submit`)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
                      >
                        提交心得報告 <ChevronRight size={14} />
                      </button>
                    )}

                    {enr.progressPercent >= 80 && !enr.quizSubmitted && (
                      <button
                        onClick={() => navigate(`/courses/${course.id}/quiz`)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors"
                      >
                        參加測驗 <ChevronRight size={14} />
                      </button>
                    )}

                    {enr.certificateIssued && (
                      <button
                        onClick={() => setSelectedCert(enr)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-xs font-medium transition-colors"
                      >
                        <Award size={14} />
                        查看證書
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Certificate Modal */}
      {selectedCert && (
        <CertificateModal
          enrollment={selectedCert}
          course={courses.find((c) => c.id === selectedCert.courseId)}
          user={currentUser}
          onClose={() => setSelectedCert(null)}
        />
      )}
    </div>
  );
}
