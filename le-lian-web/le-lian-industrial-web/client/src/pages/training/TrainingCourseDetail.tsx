import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'wouter';
import { useTrainingAuth } from '../../context/TrainingAuthContext';
import {
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

declare global {
  interface Window {
    YT: {
      Player: new (elementId: string, config: YTConfig) => YTPlayer;
      PlayerState: { ENDED: number; PLAYING: number; PAUSED: number; BUFFERING: number; CUED: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}
interface YTPlayer {
  getCurrentTime(): number;
  getDuration(): number;
  playVideo(): void;
  pauseVideo(): void;
  destroy(): void;
}
interface YTConfig {
  videoId: string;
  width?: string | number;
  height?: string | number;
  playerVars?: Record<string, number | string>;
  events?: {
    onReady?: () => void;
    onStateChange?: (event: { data: number }) => void;
    onError?: (event: { data: number }) => void;
  };
}

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

  // YouTube player refs and state
  const playerRef = useRef<YTPlayer | null>(null);
  const [ytReady, setYtReady] = useState(false);
  const [ytError, setYtError] = useState(false);

  const course = courses.find((c) => c.id === id);
  const enrollment = currentUser ? getEnrollmentForUser(currentUser.id, id || '') : null;

  const videoId = course?.videoId;

  // Sync state from enrollment on mount
  useEffect(() => {
    if (enrollment) {
      setProgress(enrollment.progressPercent || 0);
      setWatchTime((enrollment.watchTimeMinutes || 0) * 60); // store as seconds internally
    }
  }, [id]);

  // Load discussions
  useEffect(() => {
    if (course) {
      setDiscussions(getCourseDiscussions(course.id));
    }
  }, [course, id]);

  // Load YouTube IFrame API and initialize player
  useEffect(() => {
    if (!course || !videoId) return;

    const initPlayer = () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      setYtReady(false);
      setYtError(false);

      playerRef.current = new window.YT.Player(`yt-player-${course.id}`, {
        videoId,
        width: '100%',
        height: '100%',
        playerVars: {
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
        },
        events: {
          onReady: () => {
            setYtReady(true);
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
            } else {
              setIsPlaying(false);
              // Save progress on pause or end
              if (playerRef.current) {
                const currentTime = playerRef.current.getCurrentTime();
                const duration = playerRef.current.getDuration();
                if (duration > 0) {
                  const pct = Math.min(100, (currentTime / duration) * 100);
                  setProgress(pct);
                  setWatchTime(Math.floor(currentTime));
                  if (enrollment) {
                    const isEnded = event.data === window.YT.PlayerState.ENDED;
                    updateEnrollment(enrollment.id, {
                      progressPercent: isEnded ? 100 : Math.round(pct),
                      watchTimeMinutes: Math.floor(currentTime / 60),
                      ...(isEnded ? { videoWatched: true } : {}),
                    });
                  }
                }
              }
            }
          },
          onError: () => {
            setYtError(true);
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      // Load the script if not already loading
      if (!document.getElementById('yt-iframe-api-script')) {
        const tag = document.createElement('script');
        tag.id = 'yt-iframe-api-script';
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
      }
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [course?.id, videoId]);

  // Real-time progress tracking via interval when YouTube player is playing
  useEffect(() => {
    if (isPlaying && ytReady && playerRef.current) {
      intervalRef.current = setInterval(() => {
        if (!playerRef.current) return;
        const currentTime = playerRef.current.getCurrentTime();
        const duration = playerRef.current.getDuration();
        if (duration > 0) {
          const pct = Math.min(100, (currentTime / duration) * 100);
          setProgress(pct);
          setWatchTime(Math.floor(currentTime));
          if (enrollment && Math.floor(currentTime) % 30 === 0 && Math.floor(currentTime) > 0) {
            updateEnrollment(enrollment.id, {
              progressPercent: Math.round(pct),
              watchTimeMinutes: Math.floor(currentTime / 60),
            });
          }
        }
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, ytReady]);

  // Fallback simulated progress interval (used only when no YouTube player)
  useEffect(() => {
    if (videoId) return; // YouTube player handles progress
    if (isPlaying) {
      const durationSec = (course?.duration || 60) * 60;
      intervalRef.current = setInterval(() => {
        setWatchTime((prevTime) => {
          const newTime = prevTime + 1;
          const newProg = Math.min(100, (newTime / durationSec) * 100);
          setProgress(newProg);
          if (newTime >= durationSec) {
            setIsPlaying(false);
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (enrollment) updateEnrollment(enrollment.id, { progressPercent: 100, watchTimeMinutes: course?.duration || 60, videoWatched: true });
          } else if (enrollment && newTime % 30 === 0) {
            updateEnrollment(enrollment.id, { progressPercent: Math.round(newProg), watchTimeMinutes: Math.floor(newTime / 60) });
          }
          return newTime;
        });
      }, 1000);
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
    const newTimeSec = Math.round((newProgress / 100) * (course.duration || 60) * 60);
    setProgress(newProgress);
    setWatchTime(newTimeSec);
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
            {videoId && !ytError ? (
              <div className="relative aspect-video bg-black">
                <div id={`yt-player-${course.id}`} className="w-full h-full" />
                {!ytReady && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                    <div className="text-center text-white">
                      <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-3" />
                      <p className="text-sm">載入影片中...</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className={`${thumbColor} relative aspect-video flex items-center justify-center overflow-hidden`}>
                {/* Simulated video grid overlay */}
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                {/* Playing scan-line animation */}
                {isPlaying && (
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/40 animate-pulse" />
                )}
                {/* Progress overlay bar at top */}
                <div className="absolute top-0 left-0 h-1 bg-white/30 transition-all duration-1000" style={{ width: `${progress}%` }} />
                <span className="text-white/10 text-8xl font-black select-none absolute">{course.title[0]}</span>
                {/* Center timer control */}
                <div className="relative z-10 flex flex-col items-center gap-3 px-6 text-center">
                  <button
                    onClick={handlePlayPause}
                    className="w-16 h-16 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all hover:scale-110 border border-white/30"
                  >
                    {isPlaying ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white ml-1"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    )}
                  </button>
                  <p className="text-white/85 text-xs max-w-xs leading-relaxed">
                    本課程尚未提供線上影片，請點擊{isPlaying ? '暫停' : '開始'}進行學習時數計時，累計達 80% 即可提交心得與測驗
                  </p>
                </div>
                <div className="absolute top-3 right-3">
                  {isPlaying ? (
                    <span className="bg-blue-500 text-white text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      計時中
                    </span>
                  ) : (
                    <span className="bg-black/50 text-white text-xs px-2.5 py-1 rounded-full">已暫停計時</span>
                  )}
                </div>
                <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-mono">
                  <Clock size={12} />
                  已學習 {Math.floor(watchTime / 60)}:{String(watchTime % 60).padStart(2,'0')} / {Math.floor(course.duration / 60)}:{String(course.duration % 60).padStart(2,'0')}
                </div>
              </div>
            )}

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
