import { useState } from 'react';
import { useLocation } from 'wouter';
import { useTrainingAuth } from '../../context/TrainingAuthContext';
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
import type { Enrollment, Course, User } from '../../data/trainingMockData';

const TAB_FILTERS = [
  { id: 'all', label: '全部', statuses: ['in_progress', 'pending_review', 'completed', 'rejected'] },
  { id: 'in_progress', label: '進行中', statuses: ['in_progress'] },
  { id: 'pending_review', label: '待審核', statuses: ['pending_review'] },
  { id: 'completed', label: '已完成', statuses: ['completed'] },
  { id: 'rejected', label: '已退回', statuses: ['rejected'] },
];

const STATUS_CONFIG: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
  in_progress: { label: '進行中', cls: 'bg-yellow-100 text-yellow-700', icon: Clock },
  pending_review: { label: '待審核', cls: 'bg-blue-100 text-blue-700', icon: Clock },
  completed: { label: '已完成', cls: 'bg-green-100 text-green-700', icon: CheckCircle },
  rejected: { label: '已退回', cls: 'bg-red-100 text-red-700', icon: XCircle },
};

const thumbnailColors: Record<string, string> = {
  'bg-blue-500': 'bg-blue-500',
  'bg-green-500': 'bg-green-500',
  'bg-purple-500': 'bg-purple-500',
  'bg-orange-500': 'bg-orange-500',
  'bg-red-500': 'bg-red-500',
};

function CertificateModal({ enrollment, course, user, onClose }: { enrollment: Enrollment; course: Course | undefined; user: User | null; onClose: () => void }) {
  const handleDownload = () => {
    const el = document.getElementById('certificate-content');
    if (!el) return;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<html><head><title>結業證書</title><style>
      body { margin: 0; font-family: sans-serif; }
      .cert { background: linear-gradient(135deg, #1d4ed8, #4338ca); color: white; padding: 60px; text-align: center; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; }
      h1 { font-size: 48px; margin: 20px 0 8px; }
      h2 { font-size: 28px; margin: 8px 0; color: #bfdbfe; }
      h3 { font-size: 36px; margin: 20px 0; color: #fef08a; }
      p { color: #bfdbfe; margin: 8px 0; }
    </style></head><body>
    <div class="cert">
      <p style="letter-spacing:4px;font-size:14px;">樂聯工業 員工訓練平台</p>
      <h1>結業證書</h1>
      <h2>Certificate of Completion</h2>
      <p style="margin-top:32px;">茲此證明</p>
      <h3>${user?.name || ''}</h3>
      <p>已完成以下訓練課程</p>
      <p style="font-size:20px;color:white;font-weight:bold;margin:16px 0;">${course?.title || ''}</p>
      <p style="margin-top:24px;">工號：${user?.email?.split('@')[0] || ''}</p>
      <p>完成日期：${enrollment.completedAt || ''} &nbsp;|&nbsp; 測驗成績：${enrollment.quizScore ?? '-'} 分</p>
    </div></body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 500);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        id="certificate-content"
      >
        {/* Blue certificate header */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-8 pt-10 pb-8 text-white text-center relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-12 -right-12 w-48 h-48 border-4 border-white/10 rounded-full" />
          <div className="absolute -bottom-8 -left-8 w-36 h-36 border-4 border-white/10 rounded-full" />
          <div className="absolute top-4 left-4 w-16 h-16 border-2 border-white/10 rounded-full" />

          <div className="relative z-10">
            <div className="w-20 h-20 border-4 border-yellow-400/60 rounded-full flex items-center justify-center mx-auto mb-4 bg-white/10">
              <Award size={38} className="text-yellow-300" />
            </div>
            <p className="text-blue-200 text-xs font-medium tracking-[0.3em] uppercase mb-2">
              樂聯工業 員工訓練平台
            </p>
            <h2 className="text-3xl font-black mb-1 tracking-wide">結業證書</h2>
            <p className="text-blue-300 text-sm font-medium">Certificate of Completion</p>
          </div>

          {/* Decorative wave strip at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-3 opacity-20"
            style={{ background: 'repeating-linear-gradient(45deg, #fff, #fff 4px, transparent 4px, transparent 8px)' }}
          />
        </div>

        {/* Certificate body */}
        <div className="px-8 py-7 text-center">
          <p className="text-gray-400 text-sm mb-1">茲此證明</p>
          <h3 className="text-2xl font-black text-gray-900 mb-1">{user?.name}</h3>
          <p className="text-gray-400 text-xs mb-4">{user?.email?.split('@')[0]}</p>
          <p className="text-gray-500 text-sm mb-1">已完成以下訓練課程</p>
          <h4 className="text-lg font-bold text-blue-600 mb-5">{course?.title}</h4>

          <div className="flex justify-center gap-10 mb-6">
            <div>
              <p className="text-gray-400 text-xs mb-0.5">測驗成績</p>
              <p className="font-black text-2xl text-gray-900">{enrollment.quizScore ?? '-'}<span className="text-sm font-medium text-gray-500">分</span></p>
            </div>
            <div className="w-px bg-gray-100" />
            <div>
              <p className="text-gray-400 text-xs mb-0.5">完成日期</p>
              <p className="font-bold text-gray-900">{enrollment.completedAt || '-'}</p>
            </div>
          </div>

          {/* Stamp */}
          <div className="flex justify-center mb-5">
            <div className="w-14 h-14 border-4 border-blue-600 rounded-full flex items-center justify-center opacity-70">
              <span className="text-blue-600 font-black text-[10px] text-center leading-snug">樂聯<br />核准</span>
            </div>
          </div>

          <p className="text-xs text-gray-300 mb-5">樂聯工業 員工訓練系統 官方核發</p>

          <div className="flex gap-3 justify-center">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              <Award size={15} /> 下載 PDF
            </button>
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-semibold transition-colors"
            >
              <X size={15} /> 關閉
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TrainingMyCourses() {
  const { currentUser, courses, getUserEnrollments } = useTrainingAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedCert, setSelectedCert] = useState<Enrollment | null>(null);

  const enrollments = currentUser ? getUserEnrollments(currentUser.id) : [];

  const activeTabConfig = TAB_FILTERS.find((t) => t.id === activeTab);
  const filteredEnrollments = enrollments.filter((e) =>
    activeTabConfig?.statuses.includes(e.status)
  );

  const tabCounts = TAB_FILTERS.reduce((acc, tab) => {
    acc[tab.id] = enrollments.filter((e) => tab.statuses.includes(e.status)).length;
    return acc;
  }, {} as Record<string, number>);

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
              activeTab === tab.id ? 'bg-blue-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
            }`}
          >
            {tab.label}
            {tabCounts[tab.id] > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
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
            <button onClick={() => navigate('/training/courses')} className="mt-3 text-blue-600 text-sm hover:text-blue-700">
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
              <div key={enr.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div
                      className={`${thumbColor} w-14 h-14 rounded-xl flex items-center justify-center text-white font-black text-xl shrink-0 cursor-pointer`}
                      onClick={() => navigate(`/training/courses/${course.id}`)}
                    >
                      {course.title[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3
                            className="font-semibold text-gray-900 text-sm cursor-pointer hover:text-blue-600 transition-colors"
                            onClick={() => navigate(`/training/courses/${course.id}`)}
                          >
                            {course.title}
                          </h3>
                          <p className="text-xs text-gray-500 mt-0.5">{course.category} · 報名日：{enr.enrolledAt}</p>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 shrink-0 ${statusConf?.cls}`}>
                          <StatusIcon size={12} />
                          {statusConf?.label}
                        </span>
                      </div>

                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>影片進度</span>
                          <span>{enr.progressPercent}%</span>
                        </div>
                        <div className="bg-gray-100 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${enr.progressPercent >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                            style={{ width: `${enr.progressPercent}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-3">
                        {[
                          { label: '心得報告', done: enr.reportSubmitted, score: undefined, icon: FileText },
                          { label: '滿意度調查', done: enr.surveySubmitted, score: undefined, icon: Star },
                          { label: '測驗', done: enr.quizSubmitted, score: enr.quizScore, icon: ClipboardList },
                        ].map(({ label, done, score, icon: Icon }) => (
                          <div
                            key={label}
                            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg font-medium ${done ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}
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

                      {enr.status === 'rejected' && enr.managerComment && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-lg">
                          <p className="text-xs font-semibold text-red-700 mb-0.5">退回意見：</p>
                          <p className="text-xs text-red-600">{enr.managerComment}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50 flex-wrap">
                    <button
                      onClick={() => navigate(`/training/courses/${course.id}`)}
                      className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-blue-300 transition-colors"
                    >
                      繼續學習 <ChevronRight size={14} />
                    </button>
                    {enr.progressPercent >= 80 && !enr.reportSubmitted && (
                      <button
                        onClick={() => navigate(`/training/courses/${course.id}/submit`)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
                      >
                        提交心得報告 <ChevronRight size={14} />
                      </button>
                    )}
                    {enr.progressPercent >= 80 && !enr.quizSubmitted && (
                      <button
                        onClick={() => navigate(`/training/courses/${course.id}/quiz`)}
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
                        <Award size={14} /> 查看證書
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
