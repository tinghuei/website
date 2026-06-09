import { useState } from 'react';
import { useTrainingAuth } from '../../context/TrainingAuthContext';
import {
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  ChevronDown,
  ChevronUp,
  FileText,
  Star,
  ClipboardList,
  Award,
} from 'lucide-react';

export default function TrainingReviewPanel() {
  const { enrollments, courses, users, currentUser, approveEnrollment, rejectEnrollment, approveAsManager, approveAsHR } = useTrainingAuth();
  const [filterDept, setFilterDept] = useState('全部');
  const [filterStatus, setFilterStatus] = useState('pending');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rejectComment, setRejectComment] = useState('');
  const [approveComment, setApproveComment] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);

  const reviewableEnrollments = enrollments.filter(
    (e) => e.reportSubmitted && e.surveySubmitted && e.quizSubmitted
  );

  const filteredEnrollments = reviewableEnrollments.filter((e) => {
    const user = users.find((u) => u.id === e.userId);
    const matchDept = filterDept === '全部' || user?.department === filterDept;
    const matchStatus =
      filterStatus === '全部' ||
      (filterStatus === 'pending' && e.reviewStatus === 'pending') ||
      (filterStatus === 'approved' && e.reviewStatus === 'approved') ||
      (filterStatus === 'rejected' && e.reviewStatus === 'rejected');
    return matchDept && matchStatus;
  });

  const departments = ['全部', ...Array.from(new Set(users.map((u) => u.department).filter(Boolean)))];

  const handleApprove = (enrollmentId: string) => {
    setProcessing(enrollmentId + 'approve');
    setTimeout(() => {
      approveEnrollment(enrollmentId, approveComment);
      setExpandedId(null);
      setApproveComment('');
      setProcessing(null);
    }, 600);
  };

  const handleReject = (enrollmentId: string) => {
    if (!rejectComment.trim()) return;
    setProcessing(enrollmentId + 'reject');
    setTimeout(() => {
      rejectEnrollment(enrollmentId, rejectComment);
      setExpandedId(null);
      setRejectComment('');
      setProcessing(null);
    }, 600);
  };

  const pendingCount = reviewableEnrollments.filter((e) => e.reviewStatus === 'pending').length;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">審核面板</h1>
        <p className="text-gray-500 mt-1 text-sm">審核員工提交的學習資料並決定是否核發證書</p>
      </div>

      {pendingCount > 0 && (
        <div className="mb-5 bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
            <Clock size={18} className="text-orange-600" />
          </div>
          <div>
            <p className="font-semibold text-orange-800 text-sm">有 {pendingCount} 份資料等待審核</p>
            <p className="text-orange-600 text-xs">請盡快完成審核，以便員工取得結業證書</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <span className="text-sm text-gray-600">篩選：</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {['pending', 'approved', 'rejected', '全部'].map((status) => {
            const labels: Record<string, string> = { pending: '待審核', approved: '已通過', rejected: '已退回', '全部': '全部' };
            const colors: Record<string, string> = {
              pending: filterStatus === status ? 'bg-blue-600 text-white' : 'border border-blue-200 text-blue-600 bg-blue-50',
              approved: filterStatus === status ? 'bg-green-600 text-white' : 'border border-green-200 text-green-600 bg-green-50',
              rejected: filterStatus === status ? 'bg-red-600 text-white' : 'border border-red-200 text-red-600 bg-red-50',
              '全部': filterStatus === status ? 'bg-gray-700 text-white' : 'border border-gray-200 text-gray-600',
            };
            return (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${colors[status]}`}
              >
                {labels[status]}
                {status === 'pending' && pendingCount > 0 && (
                  <span className="ml-1.5 bg-white/20 text-current px-1 rounded-full text-xs">{pendingCount}</span>
                )}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2 ml-4">
          <span className="text-sm text-gray-600">部門：</span>
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {departments.map((d) => <option key={d}>{d}</option>)}
          </select>
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-4">顯示 {filteredEnrollments.length} 筆記錄</p>

      {filteredEnrollments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <CheckCircle size={48} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">目前沒有符合條件的記錄</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEnrollments.map((enr) => {
            const user = users.find((u) => u.id === enr.userId);
            const course = courses.find((c) => c.id === enr.courseId);
            const isExpanded = expandedId === enr.id;
            const isPending = enr.reviewStatus === 'pending';

            return (
              <div key={enr.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div
                  className="p-5 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : enr.id)}
                >
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {user?.avatar || user?.name?.[0] || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 text-sm">{user?.name || `用戶 ${enr.userId}`}</span>
                      <span className="text-xs text-gray-400">{user?.department}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{course?.title}</p>
                  </div>
                  <div className="text-center shrink-0">
                    <p className="text-xs text-gray-400">測驗成績</p>
                    <p className={`text-lg font-bold ${(enr.quizScore || 0) >= (course?.passingScore || 70) ? 'text-green-600' : 'text-red-500'}`}>
                      {enr.quizScore}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {[
                      { label: '報告', done: enr.reportSubmitted, icon: FileText },
                      { label: '調查', done: enr.surveySubmitted, icon: Star },
                      { label: '測驗', done: enr.quizSubmitted, icon: ClipboardList },
                    ].map(({ label, done, icon: Icon }) => (
                      <div key={label} className={`flex flex-col items-center text-xs ${done ? 'text-green-600' : 'text-gray-300'}`}>
                        <Icon size={16} />
                        <span className="text-xs mt-0.5">{label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="shrink-0">
                    {enr.reviewStatus === 'pending' && (
                      <span className="text-xs bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                        <Clock size={11} /> 待審核
                      </span>
                    )}
                    {enr.reviewStatus === 'approved' && (
                      <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                        <CheckCircle size={11} /> 已通過
                      </span>
                    )}
                    {enr.reviewStatus === 'rejected' && (
                      <span className="text-xs bg-red-100 text-red-700 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                        <XCircle size={11} /> 已退回
                      </span>
                    )}
                  </div>
                  <div className="text-gray-400 shrink-0">
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50 p-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                      <div className="bg-white rounded-xl p-4 border border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText size={16} className="text-blue-600" />
                          <h4 className="font-semibold text-gray-900 text-sm">心得報告</h4>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {enr.reportContent || '（員工未填寫內容）'}
                        </p>
                      </div>
                      <div className="bg-white rounded-xl p-4 border border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                          <Star size={16} className="text-yellow-500" />
                          <h4 className="font-semibold text-gray-900 text-sm">滿意度調查</h4>
                        </div>
                        {enr.surveyData ? (
                          <div className="space-y-1.5 text-sm">
                            {[
                              { label: '課程內容', val: enr.surveyData.content },
                              { label: '講師表現', val: enr.surveyData.instructor },
                              { label: '教材品質', val: enr.surveyData.materials },
                              { label: '實務應用', val: enr.surveyData.practical },
                              { label: '整體滿意度', val: enr.surveyData.overall },
                            ].map(({ label, val }) => (
                              <div key={label} className="flex items-center justify-between">
                                <span className="text-gray-500">{label}</span>
                                <div className="flex gap-0.5">
                                  {[1, 2, 3, 4, 5].map((s) => (
                                    <Star
                                      key={s}
                                      size={13}
                                      className={s <= (val as number) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}
                                    />
                                  ))}
                                </div>
                              </div>
                            ))}
                            {enr.surveyData.suggestions && (
                              <div className="pt-2 border-t border-gray-100 mt-2">
                                <p className="text-xs text-gray-500">建議：{enr.surveyData.suggestions as string}</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400">（未填寫調查）</p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-5">
                      <span>提交日期：{enr.submittedAt || '-'}</span>
                      <span>報名日期：{enr.enrolledAt}</span>
                      <span>測驗成績：<strong className={(enr.quizScore || 0) >= (course?.passingScore || 70) ? 'text-green-600' : 'text-red-500'}>{enr.quizScore} / 100</strong></span>
                      <span>通過標準：{course?.passingScore || 70} 分</span>
                    </div>

                    {enr.reviewStatus === 'approved' && (
                      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                        <Award size={18} className="text-green-500" />
                        <span className="text-sm text-green-700 font-medium">
                          已審核通過，結業證書已核發（{enr.completedAt}）
                        </span>
                      </div>
                    )}

                    {enr.reviewStatus === 'rejected' && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                        <p className="text-sm font-medium text-red-700 mb-1">退回原因：</p>
                        <p className="text-sm text-red-600">{enr.managerComment}</p>
                      </div>
                    )}

                    {isPending && (
                      <div className="space-y-4">
                        {/* Dual approval status */}
                        <div className="flex gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs">
                          <div className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg ${enr.managerApproved ? 'bg-green-100 text-green-700' : 'bg-white text-gray-500 border border-gray-200'}`}>
                            <CheckCircle size={14} />
                            <span className="font-medium">主管審核：{enr.managerApproved ? `✓ 通過 (${enr.managerApprovedAt || ''})` : '待審核'}</span>
                          </div>
                          <div className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg ${enr.hrApproved ? 'bg-purple-100 text-purple-700' : 'bg-white text-gray-500 border border-gray-200'}`}>
                            <CheckCircle size={14} />
                            <span className="font-medium">人資審核：{enr.hrApproved ? `✓ 通過 (${enr.hrApprovedAt || ''})` : '待審核'}</span>
                          </div>
                        </div>
                        {(!enr.managerApproved || !enr.hrApproved) && (
                          <div className="text-xs text-orange-600 bg-orange-50 border border-orange-100 rounded-lg px-3 py-2">
                            ⚠ 需主管及人資雙方均審核通過後，系統才會自動核發結業證書
                          </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Manager approve */}
                          {!enr.managerApproved && (currentUser?.role === 'manager' || currentUser?.role === 'admin') && (
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                              <h5 className="font-semibold text-blue-800 text-sm mb-2 flex items-center gap-1.5">
                                <CheckCircle size={15} /> 主管審核通過
                              </h5>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={approveComment}
                                  onChange={(e) => setApproveComment(e.target.value)}
                                  placeholder="審核意見（選填）"
                                  className="flex-1 border border-blue-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                                />
                                <button
                                  onClick={() => { setProcessing(enr.id + 'mgr'); setTimeout(() => { approveAsManager(enr.id, approveComment); setExpandedId(null); setApproveComment(''); setProcessing(null); }, 600); }}
                                  disabled={processing === enr.id + 'mgr'}
                                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
                                >
                                  {processing === enr.id + 'mgr' ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><Award size={14} /> 主管通過</>}
                                </button>
                              </div>
                            </div>
                          )}
                          {/* HR approve */}
                          {!enr.hrApproved && currentUser?.role === 'admin' && (
                            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                              <h5 className="font-semibold text-purple-800 text-sm mb-2 flex items-center gap-1.5">
                                <CheckCircle size={15} /> 人資審核通過
                              </h5>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => { setProcessing(enr.id + 'hr'); setTimeout(() => { approveAsHR(enr.id); setExpandedId(null); setProcessing(null); }, 600); }}
                                  disabled={processing === enr.id + 'hr'}
                                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
                                >
                                  {processing === enr.id + 'hr' ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><Award size={14} /> 人資通過</>}
                                </button>
                              </div>
                            </div>
                          )}
                          {/* Reject */}
                          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                            <h5 className="font-semibold text-red-800 text-sm mb-2 flex items-center gap-1.5">
                              <XCircle size={15} /> 退回申請
                            </h5>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={rejectComment}
                                onChange={(e) => setRejectComment(e.target.value)}
                                placeholder="退回原因（必填）"
                                className="flex-1 border border-red-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
                              />
                              <button
                                onClick={() => handleReject(enr.id)}
                                disabled={!rejectComment.trim() || processing === enr.id + 'reject'}
                                className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
                              >
                                {processing === enr.id + 'reject' ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><XCircle size={14} /> 退回</>}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
