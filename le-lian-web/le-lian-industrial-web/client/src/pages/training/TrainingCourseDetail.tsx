import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'wouter';
import { useTrainingAuth } from '../../context/TrainingAuthContext';
import {
  Play,
  Pause,
  Clock,
  User,
  MessageSquare,
  BarChart2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  ChevronRight,
  BookOpen,
  Award,
} from 'lucide-react';

const tabList = [
  { id: 'content', label: '課程內容' },
  { id: 'discussion', label: '討論區' },
  { id: 'progress', label: '我的進度' },
];

const thumbnailColors: Record<string, string> = {
  'bg-blue-500': 'bg-blue-500',
  'bg-green-500': 'bg-green-500',
  'bg-purple-500': 'bg-purple-500',
  'bg-orange-500': 'bg-orange-500',
  'bg-red-500': 'bg-red-500',
};

export default function TrainingCourseDetail() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [, navigate] = useLocation();
  const { currentUser, courses, getEnrollmentForUser, enrollInCourse, updateEnrollment, getCourseDiscussions, addDiscussion } = useTrainingAuth();

  const [activeTab, setActiveTab] = useState('content');
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [watchTime, setWatchTime] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [discussions, setDiscussions] = useState<ReturnType<typeof getCourseDiscussions>>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const course = courses.find((c) => c.id === id);
  const enrollment = currentUser ? getEnrollmentForUser(currentUser.id, id || '') : null;

  // Sync state from enrollment on mount
  useEffect(() => {
    if (enrollment) {
      setProgress(enrollment.progressPercent || 0);
      setWatchTime(enrollment.watchTimeMinutes || 0);
    }
  }, [id]);

  // Load discussions
  useEffect(() => {
    if (course) {
      setDiscussions(getCourseDiscussions(course.id));
    }
  }, [course, id]);

  // Video progress interval
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (enrollment) {
              updateEnrollment(enrollment.id, {
                progressPercent: 100,
                watchTimeMinutes: course?.duration || 60,
                videoWatched: true,
              });
            }
            return 100;
          }
          const newProg = prev + 0.5;
          const newTime = Math.round((newProg / 100) * (course?.duration || 60));
          setWatchTime(newTime);
          if (enrollment && Math.floor(newProg) % 10 === 0) {
            updateEnrollment(enrollment.id, {
              progressPercent: Math.round(newProg),
              watchTimeMinutes: newTime,
            });
          }
          return newProg;
        });
      }, 500);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (enrollment && progress > 0) {
        updateEnrollment(enrollment.id, {
          progressPercent: Math.round(progress),
          watchTimeMinutes: watchTime,
        });
      }
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying]);

  if (!course) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">找不到此課程</p>
        <button onClick={() => navigate('/training/courses')} className="mt-4 text-blue-600 hover:text-blue-700 text-sm">
          返回課程庫
        </button>
      </div>
    );
  }

  const thumbColor = thumbnailColors[course.thumbnail] || 'bg-blue-500';
  const isEnrolled = !!enrollment;

  const handleEnroll = () => {
    if (currentUser) enrollInCourse(currentUser.id, course.id);
  };

  const handlePlayPause = () => {
    if (!isEnrolled) {
      handleEnroll();
      return;
    }
    setIsPlaying((prev) => !prev);
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEnrolled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newProgress = Math.min(100, Math.max(0, (x / rect.width) * 100));
    setProgress(newProgress);
    setWatchTime(Math.round((newProgress / 100) * (course.duration || 60)));
  };

  const handlePostComment = () => {
    if (!newComment.trim() || !currentUser) return;
    addDiscussion(course.id, currentUser.id, currentUser.name, newComment.trim());
    setDiscussions(getCourseDiscussions(course.id).concat({
      id: `d${Date.now()}`,
      courseId: course.id,
      userId: currentUser.id,
      userName: currentUser.name,
      message: newComment.trim(),
      timestamp: new Date().toLocaleString('zh-TW'),
    }));
    setNewComment('');
  };

  const canSubmit = enrollment && Math.round(progress) >= 80;

  const progressItems = [
    { label: '影片觀看', done: progress >= 80, value: `${Math.round(progress)}%`, note: '需完成 80% 以上' },
    { label: '心得報告', done: enrollment?.reportSubmitted, value: enrollment?.reportSubmitted ? '已提交' : '未提交' },
    { label: '滿意度調查', done: enrollment?.surveySubmitted, value: enrollment?.surveySubmitted ? '已提交' : '未提交' },
    { label: '課程測驗', done: enrollment?.quizSubmitted, value: enrollment?.quizSubmitted ? `${enrollment.quizScore}分` : '未完成' },
    {
      label: '審核狀態',
      done: enrollment?.reviewStatus === 'approved',
      value: ({ approved: '已通過', pending: '審核中', rejected: '已退回' } as Record<string, string>)[enrollment?.reviewStatus || ''] || '-',
      special: enrollment?.reviewStatus === 'rejected' ? 'rejected' : null,
    },
    { label: '結業證書', done: enrollment?.certificateIssued, value: enrollment?.certificateIssued ? '已發放' : '未發放' },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate('/training/courses')}
        className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-4"
      >
        ← 返回課程庫
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Video Player */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className={`${thumbColor} relative aspect-video flex items-center justify-center`}>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white/10 text-8xl font-black select-none">{course.title[0]}</span>
              </div>
              <button
                onClick={handlePlayPause}
                className="relative z-10 w-16 h-16 bg-white/20 hover:bg-white/30 backdrop-blur rounded-full flex items-center justify-center transition-all hover:scale-110"
              >
                {isPlaying ? (
                  <Pause size={28} className="text-white" />
                ) : (
                  <Play size={28} className="text-white ml-1" />
                )}
              </button>
              <div className="absolute top-3 right-3">
                {isPlaying ? (
                  <span className="bg-red-500 text-white text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    播放中
                  </span>
                ) : (
                  <span className="bg-black/40 text-white text-xs px-2.5 py-1 rounded-full">已暫停</span>
                )}
              </div>
              <div className="absolute bottom-3 left-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                <Clock size={12} />
                {watchTime} / {course.duration} 分鐘
              </div>
            </div>

            {/* Progress bar */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                <span className={isPlaying ? 'text-blue-600 font-medium' : ''}>
                  {isPlaying ? '▶ 進度更新中...' : '點擊播放以繼續計時'}
                </span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <div
                className="bg-gray-100 rounded-full h-2 cursor-pointer hover:h-3 transition-all group"
                onClick={handleProgressBarClick}
              >
                <div
                  className={`h-full rounded-full transition-all relative ${progress >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {progress >= 100
                  ? '✓ 影片已完成'
                  : progress >= 80
                  ? '✓ 已達提交門檻，可提交作業'
                  : `需觀看至少 80%（還需 ${Math.round(80 - progress)}%）`}
              </p>
            </div>

            {/* Action buttons */}
            <div className="p-4 flex gap-3 flex-wrap">
              {!isEnrolled ? (
                <button
                  onClick={handleEnroll}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium text-sm transition-colors"
                >
                  立即報名
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigate(`/training/courses/${id}/submit`)}
                    disabled={!canSubmit}
                    className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                      canSubmit ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {enrollment?.reportSubmitted && enrollment?.surveySubmitted ? '✓ 已提交報告' : '提交心得 & 調查'}
                  </button>
                  <button
                    onClick={() => navigate(`/training/courses/${id}/quiz`)}
                    disabled={!canSubmit}
                    className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                      canSubmit ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {enrollment?.quizSubmitted ? `✓ 測驗 ${enrollment.quizScore}分` : '參加測驗'}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="flex border-b border-gray-100">
              {tabList.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-5">
              {activeTab === 'content' && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">課程說明</h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-5">{course.description}</p>
                  <h3 className="font-semibold text-gray-900 mb-3">課程內容大綱</h3>
                  <div className="space-y-2">
                    {['第一單元：課程介紹與學習目標', '第二單元：核心概念與理論基礎', '第三單元：實務操作與案例分析', '第四單元：常見問題與解決方法', '第五單元：總結與課後評估'].map((item, idx) => (
                      <div key={idx} className={`flex items-center gap-3 p-3 rounded-lg ${progress > (idx + 1) * 20 ? 'bg-green-50' : 'bg-gray-50'}`}>
                        {progress > (idx + 1) * 20 ? (
                          <CheckCircle size={16} className="text-green-500 shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-gray-300 shrink-0" />
                        )}
                        <span className="text-sm text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'discussion' && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquare size={18} className="text-blue-600" />
                    <h3 className="font-semibold text-gray-900">課程討論（{discussions.length} 則）</h3>
                  </div>
                  {isEnrolled && (
                    <div className="flex gap-3 mb-5 p-4 bg-gray-50 rounded-xl">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {currentUser?.avatar || currentUser?.name?.[0]}
                      </div>
                      <div className="flex-1">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="分享您的學習心得或提問..."
                          className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          rows={3}
                        />
                        <div className="flex justify-end mt-2">
                          <button
                            onClick={handlePostComment}
                            disabled={!newComment.trim()}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Send size={14} /> 發布
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  {discussions.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare size={32} className="text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">尚無討論，成為第一個留言的人！</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {discussions.map((d) => (
                        <div key={d.id} className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-bold shrink-0">
                            {d.userName[0]}
                          </div>
                          <div className="flex-1 bg-gray-50 rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-semibold text-gray-800">{d.userName}</span>
                              <span className="text-xs text-gray-400">{d.timestamp}</span>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed">{d.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'progress' && (
                <div>
                  {!isEnrolled ? (
                    <div className="text-center py-8">
                      <AlertCircle size={32} className="text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">請先報名課程才能查看進度</p>
                      <button onClick={handleEnroll} className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                        立即報名
                      </button>
                    </div>
                  ) : (
                    <>
                      {enrollment?.reviewStatus === 'rejected' && enrollment?.managerComment && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                          <div className="flex items-center gap-2 mb-1">
                            <XCircle size={16} className="text-red-500" />
                            <span className="text-sm font-semibold text-red-700">審核退回意見</span>
                          </div>
                          <p className="text-sm text-red-600">{enrollment.managerComment}</p>
                        </div>
                      )}
                      {enrollment?.certificateIssued && (
                        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                          <div className="flex items-center gap-2">
                            <Award size={16} className="text-green-500" />
                            <span className="text-sm font-semibold text-green-700">恭喜！您已取得結業證書</span>
                          </div>
                        </div>
                      )}
                      <h3 className="font-semibold text-gray-900 mb-3">完成清單</h3>
                      <div className="space-y-3">
                        {progressItems.map((item) => (
                          <div
                            key={item.label}
                            className={`flex items-center justify-between p-3 rounded-xl ${
                              item.special === 'rejected' ? 'bg-red-50 border border-red-200' : item.done ? 'bg-green-50' : 'bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {item.special === 'rejected' ? (
                                <XCircle size={18} className="text-red-500 shrink-0" />
                              ) : item.done ? (
                                <CheckCircle size={18} className="text-green-500 shrink-0" />
                              ) : (
                                <div className="w-4 h-4 rounded-full border-2 border-gray-300 shrink-0" />
                              )}
                              <div>
                                <p className={`text-sm font-medium ${item.done ? 'text-green-800' : 'text-gray-700'}`}>{item.label}</p>
                                {item.note && <p className="text-xs text-gray-400">{item.note}</p>}
                              </div>
                            </div>
                            <span className={`text-xs font-medium ${item.done ? 'text-green-600' : item.special === 'rejected' ? 'text-red-600' : 'text-gray-500'}`}>
                              {item.value}
                            </span>
                          </div>
                        ))}
                      </div>
                      {canSubmit && (!enrollment?.reportSubmitted || !enrollment?.surveySubmitted) && (
                        <button
                          onClick={() => navigate(`/training/courses/${id}/submit`)}
                          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                        >
                          前往提交心得報告 & 調查 <ChevronRight size={16} />
                        </button>
                      )}
                      {canSubmit && !enrollment?.quizSubmitted && (
                        <button
                          onClick={() => navigate(`/training/courses/${id}/quiz`)}
                          className="mt-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                        >
                          前往參加測驗 <ChevronRight size={16} />
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar info */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-bold text-gray-900 mb-1 leading-snug">{course.title}</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{course.category}</span>
              {course.mandatory && (
                <span className="text-xs bg-red-100 text-red-700 px-2.5 py-1 rounded-full font-medium">必修</span>
              )}
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <User size={15} className="text-gray-400 shrink-0" />
                <span>講師：{course.instructor}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock size={15} className="text-gray-400 shrink-0" />
                <span>課程時長：{course.duration} 分鐘</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <BarChart2 size={15} className="text-gray-400 shrink-0" />
                <span>通過標準：{course.passingScore} 分</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <BookOpen size={15} className="text-gray-400 shrink-0" />
                <span>建立日期：{course.createdAt}</span>
              </div>
            </div>
          </div>

          {enrollment?.certificateIssued && (
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl p-5 text-white">
              <Award size={24} className="mb-2" />
              <h3 className="font-bold text-lg">已取得證書</h3>
              <p className="text-yellow-100 text-sm mt-1">完成日期：{enrollment.completedAt}</p>
              <button
                onClick={() => navigate('/training/my-courses')}
                className="mt-3 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium w-full transition-colors"
              >
                查看證書
              </button>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 mb-3">完成條件</h3>
            <div className="space-y-2 text-sm">
              {[
                { label: '觀看影片 ≥ 80%', done: progress >= 80 },
                { label: '提交心得報告', done: !!enrollment?.reportSubmitted },
                { label: '完成滿意度調查', done: !!enrollment?.surveySubmitted },
                { label: `通過測驗（${course.passingScore}分）`, done: !!(enrollment?.quizSubmitted && (enrollment?.quizScore || 0) >= course.passingScore) },
                { label: '通過主管審核', done: enrollment?.reviewStatus === 'approved' },
              ].map((req) => (
                <div key={req.label} className="flex items-center gap-2">
                  {req.done ? (
                    <CheckCircle size={15} className="text-green-500 shrink-0" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-gray-300 shrink-0" />
                  )}
                  <span className={req.done ? 'text-green-700' : 'text-gray-600'}>{req.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
