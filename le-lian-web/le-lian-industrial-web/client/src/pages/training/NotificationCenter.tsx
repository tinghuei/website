import { useState, useMemo } from 'react';
import { Bell, CheckCheck, AlertCircle, CheckCircle, BookOpen, Megaphone, Clock, X, ChevronRight } from 'lucide-react';
import { useTrainingAuth } from '../../context/TrainingAuthContext';
import { COMPANY_ANNOUNCEMENTS } from '../../data/trainingMockData';

type NotifType = 'deadline_reminder' | 'review_result' | 'new_course' | 'system';

interface MockNotification {
  id: string;
  type: NotifType;
  isRead: boolean;
  title: string;
  message: string;
  time: string;
  course: string | null;
  urgent: boolean;
}

const INITIAL_NOTIFICATIONS: MockNotification[] = [
  {
    id: 'n1',
    type: 'deadline_reminder',
    isRead: false,
    title: '⚠️ 課程截止提醒',
    message: '「職業安全衛生法規研習」課程將於3天後(2026/06/01)截止，請盡速完成！',
    time: '10分鐘前',
    course: '職業安全衛生法規研習',
    urgent: true,
  },
  {
    id: 'n2',
    type: 'review_result',
    isRead: false,
    title: '✅ 審核通過通知',
    message: '您在「5S推行與現場管理」課程的心得報告已由李主管審核通過，完訓證書已發放！',
    time: '2小時前',
    course: '5S推行與現場管理',
    urgent: false,
  },
  {
    id: 'n3',
    type: 'new_course',
    isRead: false,
    title: '🆕 新課程上架',
    message: '「智慧製造導入實務」新課程已上架，此為您部門的必修課程，請於2026/07/31前完成。',
    time: '昨天',
    course: '智慧製造導入實務',
    urgent: false,
  },
  {
    id: 'n4',
    type: 'review_result',
    isRead: true,
    title: '❌ 審核退回通知',
    message: '您在「iCAP職能評估實務」課程的心得報告被退回，原因：內容過於簡短，請補充實務應用說明後重新提交。',
    time: '3天前',
    course: 'iCAP職能評估實務',
    urgent: false,
  },
  {
    id: 'n5',
    type: 'system',
    isRead: true,
    title: '📢 系統公告',
    message: '年度訓練計畫填報截止日期：2026年10月31日。請各部門主管於期限前完成次年度訓練計畫提報。',
    time: '1週前',
    course: null,
    urgent: false,
  },
  {
    id: 'n6',
    type: 'deadline_reminder',
    isRead: true,
    title: '⏰ 年度訓練時數提醒',
    message: '您今年度已完成18小時訓練，距離年度目標24小時尚差6小時，請加油！',
    time: '2週前',
    course: null,
    urgent: false,
  },
];

const UPCOMING_DEADLINES = [
  { date: '06/01', course: '職業安全衛生法規研習', daysLeft: 3, urgent: true },
  { date: '06/15', course: 'ISO 9001 品質管理', daysLeft: 17, urgent: false },
  { date: '06/30', course: '5S推行與現場管理（複訓）', daysLeft: 32, urgent: false },
  { date: '07/31', course: '智慧製造導入實務', daysLeft: 63, urgent: false },
  { date: '08/31', course: 'iCAP職能評估實務', daysLeft: 94, urgent: false },
];

type FilterTab = 'all' | NotifType;

const TABS: { id: FilterTab; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'deadline_reminder', label: '截止提醒' },
  { id: 'review_result', label: '審核結果' },
  { id: 'new_course', label: '新課程' },
  { id: 'system', label: '系統公告' },
];

function typeStripe(n: MockNotification): string {
  if (n.urgent || n.type === 'deadline_reminder') return 'bg-red-500';
  if (n.type === 'review_result') {
    return n.title.includes('通過') ? 'bg-green-500' : 'bg-red-400';
  }
  if (n.type === 'new_course') return 'bg-blue-500';
  return 'bg-gray-400';
}

function TypeIcon({ type, title }: { type: NotifType; title: string }) {
  if (type === 'deadline_reminder') return <AlertCircle size={18} className="text-red-500 shrink-0" />;
  if (type === 'review_result') {
    return title.includes('通過')
      ? <CheckCircle size={18} className="text-green-500 shrink-0" />
      : <AlertCircle size={18} className="text-red-400 shrink-0" />;
  }
  if (type === 'new_course') return <BookOpen size={18} className="text-blue-500 shrink-0" />;
  return <Megaphone size={18} className="text-gray-400 shrink-0" />;
}

export default function NotificationCenter() {
  const { currentUser } = useTrainingAuth();
  const [notifications, setNotifications] = useState<MockNotification[]>(INITIAL_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [selectedNotif, setSelectedNotif] = useState<MockNotification | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<typeof COMPANY_ANNOUNCEMENTS[0] | null>(null);
  const [mainTab, setMainTab] = useState<'notifications' | 'announcements'>('notifications');

  const unreadCount = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications]);

  const filtered = useMemo(
    () => (activeTab === 'all' ? notifications : notifications.filter((n) => n.type === activeTab)),
    [notifications, activeTab]
  );

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Bell size={22} className="text-blue-600" />
            </div>
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">通知中心</h1>
            <p className="text-sm text-gray-500">
              {currentUser?.name} · {unreadCount > 0 ? `${unreadCount} 則未讀` : '全部已讀'}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            <CheckCheck size={16} />
            全部標為已讀
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Notifications / Announcements main area */}
        <div className="xl:col-span-2 space-y-4">
          {/* Main tab switcher */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setMainTab('notifications')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${mainTab === 'notifications' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              <Bell size={16} /> 通知中心 {unreadCount > 0 && <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{unreadCount}</span>}
            </button>
            <button
              onClick={() => setMainTab('announcements')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${mainTab === 'announcements' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              <Megaphone size={16} /> 公司公告
              <span className="bg-orange-100 text-orange-700 text-xs px-1.5 py-0.5 rounded-full font-semibold">{COMPANY_ANNOUNCEMENTS.length}</span>
            </button>
          </div>

          {/* Notifications tab content */}
          {mainTab === 'notifications' && (
            <>
              {/* Filter tabs */}
              <div className="flex gap-1 bg-gray-100 rounded-xl p-1 flex-wrap">
                {TABS.map(({ id, label }) => {
                  const count = id === 'all'
                    ? notifications.filter((n) => !n.isRead).length
                    : notifications.filter((n) => n.type === id && !n.isRead).length;
                  return (
                    <button
                      key={id}
                      onClick={() => setActiveTab(id)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap px-2 ${
                        activeTab === id
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {label}
                      {count > 0 && (
                        <span className="w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Notification cards */}
              <div className="space-y-3">
                {filtered.length === 0 && (
                  <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">
                    <Bell size={32} className="mx-auto mb-3 opacity-30" />
                    <p>此分類目前沒有通知</p>
                  </div>
                )}
                {filtered.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => { setSelectedNotif(notif); markAsRead(notif.id); }}
                    className={`bg-white rounded-xl border overflow-hidden transition-all cursor-pointer hover:shadow-md ${
                      notif.isRead ? 'border-gray-100 opacity-80' : 'border-gray-200 shadow-sm'
                    }`}
                  >
                    <div className="flex">
                      {/* Colored stripe */}
                      <div className={`w-1 shrink-0 ${typeStripe(notif)}`} />

                      {/* Content */}
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <TypeIcon type={notif.type} title={notif.title} />
                            <div className="min-w-0">
                              <p className={`text-sm mb-1 ${notif.isRead ? 'font-normal text-gray-600' : 'font-semibold text-gray-900'}`}>
                                {notif.title}
                              </p>
                              <p className="text-sm text-gray-600 leading-relaxed">{notif.message}</p>
                              {notif.course && (
                                <span className="inline-block mt-2 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                                  {notif.course}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <span className="text-xs text-gray-400 whitespace-nowrap">{notif.time}</span>
                            {!notif.isRead && (
                              <span className="text-xs text-blue-600 font-medium whitespace-nowrap">未讀</span>
                            )}
                            {notif.isRead && (
                              <span className="text-xs text-gray-300 font-medium">已讀</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Announcements tab content */}
          {mainTab === 'announcements' && (
            <div className="space-y-4">
              {COMPANY_ANNOUNCEMENTS.map((ann) => (
                <div
                  key={ann.id}
                  onClick={() => setSelectedAnnouncement(ann)}
                  className={`bg-white rounded-xl border overflow-hidden cursor-pointer hover:shadow-md transition-all ${ann.pinned ? 'border-orange-200' : 'border-gray-100'}`}
                >
                  <div className="flex">
                    <div className={`w-1 shrink-0 ${ann.important ? 'bg-orange-500' : 'bg-gray-300'}`} />
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {ann.pinned && <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">📌 置頂</span>}
                            {ann.important && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">重要</span>}
                            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{ann.category}</span>
                          </div>
                          <p className="text-sm font-semibold text-gray-900 mb-1">{ann.title}</p>
                          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{ann.content}</p>
                        </div>
                        <ChevronRight size={16} className="text-gray-300 shrink-0 mt-1" />
                      </div>
                      <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                        <span>{ann.publishedAt}</span>
                        <span>·</span>
                        <span>{ann.publishedBy}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: Upcoming deadlines */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 px-5 py-4 flex items-center gap-2">
              <Clock size={18} className="text-white" />
              <h2 className="font-semibold text-white">截止日期行事曆</h2>
            </div>
            <div className="p-4 space-y-3">
              {UPCOMING_DEADLINES.map(({ date, course, daysLeft, urgent }) => (
                <div
                  key={date}
                  className={`flex items-start gap-3 p-3 rounded-lg ${
                    urgent ? 'bg-red-50 border border-red-100' : 'bg-gray-50'
                  }`}
                >
                  <div className={`text-center shrink-0 w-12 rounded-lg py-1 ${urgent ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                    <p className="text-[10px] font-medium">{date.split('/')[0]}月</p>
                    <p className="text-base font-bold leading-none">{date.split('/')[1]}</p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-medium truncate ${urgent ? 'text-red-800' : 'text-gray-700'}`}>
                      {course}
                    </p>
                    <span
                      className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        daysLeft <= 7
                          ? 'bg-red-100 text-red-600'
                          : daysLeft <= 30
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {daysLeft <= 7 ? `緊急！剩 ${daysLeft} 天` : `剩 ${daysLeft} 天`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats summary */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">通知統計</h3>
            <div className="space-y-3">
              {[
                { label: '截止提醒', count: notifications.filter((n) => n.type === 'deadline_reminder').length, color: 'bg-red-100 text-red-600' },
                { label: '審核結果', count: notifications.filter((n) => n.type === 'review_result').length, color: 'bg-green-100 text-green-600' },
                { label: '新課程', count: notifications.filter((n) => n.type === 'new_course').length, color: 'bg-blue-100 text-blue-600' },
                { label: '系統公告', count: notifications.filter((n) => n.type === 'system').length, color: 'bg-gray-100 text-gray-600' },
              ].map(({ label, count, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{label}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Notification detail modal */}
      {selectedNotif && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedNotif(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TypeIcon type={selectedNotif.type} title={selectedNotif.title} />
                <h2 className="font-bold text-gray-900 text-sm">{selectedNotif.title}</h2>
              </div>
              <button onClick={() => setSelectedNotif(null)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <div className="p-5">
              <p className="text-sm text-gray-700 leading-relaxed mb-4">{selectedNotif.message}</p>
              {selectedNotif.course && (
                <div className="bg-blue-50 rounded-xl p-3 mb-4">
                  <p className="text-xs text-blue-600 font-medium">相關課程</p>
                  <p className="text-sm text-blue-800 font-semibold mt-0.5">{selectedNotif.course}</p>
                </div>
              )}
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span className="flex items-center gap-1"><Clock size={12} />{selectedNotif.time}</span>
                <span className={`px-2 py-0.5 rounded-full font-medium ${selectedNotif.isRead ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-600'}`}>
                  {selectedNotif.isRead ? '已讀' : '未讀'}
                </span>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100">
              <button onClick={() => setSelectedNotif(null)} className="w-full py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700">
                關閉
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Announcement detail modal */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedAnnouncement(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-5 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {selectedAnnouncement.pinned && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">📌 置頂</span>}
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{selectedAnnouncement.category}</span>
                  </div>
                  <h2 className="font-bold text-lg leading-snug">{selectedAnnouncement.title}</h2>
                </div>
                <button onClick={() => setSelectedAnnouncement(null)} className="p-1.5 hover:bg-white/20 rounded-lg">
                  <X size={18} />
                </button>
              </div>
              <p className="text-orange-100 text-xs mt-2">{selectedAnnouncement.publishedAt} · {selectedAnnouncement.publishedBy}</p>
            </div>
            <div className="p-5">
              <p className="text-sm text-gray-700 leading-relaxed">{selectedAnnouncement.content}</p>
            </div>
            <div className="p-4 border-t border-gray-100">
              <button onClick={() => setSelectedAnnouncement(null)} className="w-full py-2 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600">
                關閉
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
