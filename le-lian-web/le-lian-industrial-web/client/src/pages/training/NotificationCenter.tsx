import { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Bell, CheckCheck, AlertCircle, CheckCircle, BookOpen, Megaphone, Clock, X, ChevronRight, Plus, Users, Eye, ArrowRight, Pencil, Trash2, History, EyeOff } from 'lucide-react';
import { useTrainingAuth } from '../../context/TrainingAuthContext';
import {
  type Announcement as AnnouncementLocal,
  loadAnnouncements,
  saveAnnouncements,
  confirmRead,
} from '../../lib/announcementStorage';
import {
  type MockNotification,
  type NotifType,
  loadNotifications,
  saveNotifications,
} from '../../lib/notifCenterStorage';

const UPCOMING_DEADLINES: { date: string; course: string; daysLeft: number; urgent: boolean }[] = [];

type DeadlineItem = typeof UPCOMING_DEADLINES[number];

type FilterTab = 'all' | NotifType;

const TABS: { id: FilterTab; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'deadline_reminder', label: '截止提醒' },
  { id: 'review_result', label: '審核結果' },
  { id: 'new_course', label: '新課程' },
  { id: 'system', label: '系統公告' },
];

interface NewAnnForm {
  title: string;
  content: string;
  category: string;
  targetAudience: '全體員工' | '主管以上' | '特定部門';
  targetDept: string;
  important: boolean;
  pinned: boolean;
  requireConfirmation: boolean;
  expiresAt: string;
}

const DEFAULT_ANN_FORM: NewAnnForm = {
  title: '',
  content: '',
  category: '訓練通知',
  targetAudience: '全體員工',
  targetDept: '',
  important: false,
  pinned: false,
  requireConfirmation: false,
  expiresAt: '',
};

function formToSnapshot(f: NewAnnForm) {
  return { title: f.title.trim(), content: f.content.trim(), category: f.category, targetAudience: f.targetAudience, targetDept: f.targetDept, important: f.important, pinned: f.pinned, requireConfirmation: f.requireConfirmation, expiresAt: f.expiresAt };
}

function diffSummary(before: ReturnType<typeof formToSnapshot>, after: ReturnType<typeof formToSnapshot>): string {
  const labels: Record<string, string> = { title: '標題', content: '內容', category: '類別', targetAudience: '推播對象', targetDept: '指定部門', important: '標示重要', pinned: '置頂顯示', requireConfirmation: '需確認閱讀', expiresAt: '有效期限' };
  const changed: string[] = [];
  (Object.keys(labels) as (keyof typeof labels)[]).forEach(key => {
    const b = (before as Record<string, unknown>)[key];
    const a = (after as Record<string, unknown>)[key];
    if (b !== a) changed.push(labels[key]);
  });
  return changed.length ? `修改了：${changed.join('、')}` : '內容無變更';
}

function isExpired(ann: AnnouncementLocal): boolean {
  if (!ann.expiresAt) return false;
  return new Date(ann.expiresAt).getTime() < Date.now();
}

const ANN_CATEGORIES = ['訓練通知', '安全通知', '課程公告', '人事公告', '補助資訊', '系統公告'];
const DEPARTMENTS_LIST = ['總經理室', '品保課', '管理部', '總務課', '營業部', '業務課', '研發課', '廠務部', '廠務室', '製造課', '組一組', '組二組'];

function typeStripe(n: MockNotification): string {
  if (n.urgent || n.type === 'deadline_reminder') return 'bg-red-500';
  if (n.type === 'review_result') return n.title.includes('通過') ? 'bg-green-500' : 'bg-red-400';
  if (n.type === 'new_course') return 'bg-blue-500';
  return 'bg-gray-400';
}

function TypeIcon({ type, title }: { type: NotifType; title: string }) {
  if (type === 'deadline_reminder') return <AlertCircle size={18} className="text-red-500 shrink-0" />;
  if (type === 'review_result') return title.includes('通過') ? <CheckCircle size={18} className="text-green-500 shrink-0" /> : <AlertCircle size={18} className="text-red-400 shrink-0" />;
  if (type === 'new_course') return <BookOpen size={18} className="text-blue-500 shrink-0" />;
  return <Megaphone size={18} className="text-gray-400 shrink-0" />;
}

export default function NotificationCenter() {
  const { currentUser, courses } = useTrainingAuth();
  const [, navigate] = useLocation();
  const [notifications, setNotifications] = useState<MockNotification[]>([]);
  const [notificationsLoaded, setNotificationsLoaded] = useState(false);
  useEffect(() => {
    loadNotifications().then((data) => {
      setNotifications(data);
      setNotificationsLoaded(true);
    });
  }, []);
  useEffect(() => {
    if (notificationsLoaded) saveNotifications(notifications);
  }, [notifications, notificationsLoaded]);

  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [selectedNotif, setSelectedNotif] = useState<MockNotification | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementLocal | null>(null);
  const [selectedDeadline, setSelectedDeadline] = useState<DeadlineItem | null>(null);
  const [mainTab, setMainTab] = useState<'notifications' | 'announcements'>('notifications');

  const [announcements, setAnnouncements] = useState<AnnouncementLocal[]>([]);
  const [announcementsLoaded, setAnnouncementsLoaded] = useState(false);
  useEffect(() => {
    loadAnnouncements().then((data) => {
      setAnnouncements(data);
      setAnnouncementsLoaded(true);
    });
  }, []);
  useEffect(() => {
    if (announcementsLoaded) saveAnnouncements(announcements);
  }, [announcements, announcementsLoaded]);

  const [showCreateAnn, setShowCreateAnn] = useState(false);
  const [annForm, setAnnForm] = useState<NewAnnForm>(DEFAULT_ANN_FORM);
  const [editingAnnId, setEditingAnnId] = useState<string | null>(null);
  const [showReadersFor, setShowReadersFor] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AnnouncementLocal | null>(null);
  const [historyTarget, setHistoryTarget] = useState<AnnouncementLocal | null>(null);
  const [showExpiredAndDeleted, setShowExpiredAndDeleted] = useState(false);

  const isHRAdmin = currentUser && ['manager', 'admin', 'hr'].includes(currentUser.role);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications]);

  const filtered = useMemo(
    () => (activeTab === 'all' ? notifications : notifications.filter((n) => n.type === activeTab)),
    [notifications, activeTab]
  );

  const visibleAnnouncements = useMemo(() => {
    const audienceFiltered = !currentUser ? announcements : announcements.filter(ann => {
      if (ann.targetAudience === '全體員工') return true;
      if (ann.targetAudience === '主管以上') return ['manager', 'admin', 'hr'].includes(currentUser.role);
      if (ann.targetAudience === '特定部門') return !ann.targetDept || ann.targetDept === currentUser.department;
      return true;
    });
    if (isHRAdmin && showExpiredAndDeleted) return audienceFiltered;
    return audienceFiltered.filter(ann => !ann.deletedAt && !isExpired(ann));
  }, [announcements, currentUser, isHRAdmin, showExpiredAndDeleted]);

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };
  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

  const handleCreateAnnouncement = () => {
    if (!annForm.title.trim() || !annForm.content.trim()) return;
    const operator = currentUser?.name || '系統管理員';
    const now = new Date().toISOString().split('T')[0];

    if (editingAnnId) {
      setAnnouncements(prev => prev.map(a => {
        if (a.id !== editingAnnId) return a;
        const before = formToSnapshot({ ...DEFAULT_ANN_FORM, title: a.title, content: a.content, category: a.category, targetAudience: a.targetAudience, targetDept: a.targetDept, important: a.important, pinned: a.pinned, requireConfirmation: a.requireConfirmation, expiresAt: a.expiresAt || '' });
        const after = formToSnapshot(annForm);
        const summary = diffSummary(before, after);
        return {
          ...a,
          title: annForm.title.trim(),
          content: annForm.content.trim(),
          category: annForm.category,
          pinned: annForm.pinned,
          important: annForm.important,
          targetAudience: annForm.targetAudience,
          targetDept: annForm.targetDept,
          requireConfirmation: annForm.requireConfirmation,
          expiresAt: annForm.expiresAt || undefined,
          editHistory: [...a.editHistory, { action: '編輯' as const, editedAt: now, editedBy: operator, summary }],
        };
      }));
    } else {
      const newAnn: AnnouncementLocal = {
        id: `ann${Date.now()}`,
        title: annForm.title.trim(),
        content: annForm.content.trim(),
        category: annForm.category,
        publishedAt: now,
        publishedBy: operator,
        pinned: annForm.pinned,
        important: annForm.important,
        targetAudience: annForm.targetAudience,
        targetDept: annForm.targetDept,
        requireConfirmation: annForm.requireConfirmation,
        readBy: [],
        expiresAt: annForm.expiresAt || undefined,
        editHistory: [{ action: '建立', editedAt: now, editedBy: operator, summary: '建立公告' }],
      };
      setAnnouncements(prev => [newAnn, ...prev]);
    }
    setShowCreateAnn(false);
    setEditingAnnId(null);
    setAnnForm(DEFAULT_ANN_FORM);
  };

  const handleOpenEditAnnouncement = (ann: AnnouncementLocal) => {
    setEditingAnnId(ann.id);
    setAnnForm({
      title: ann.title,
      content: ann.content,
      category: ann.category,
      targetAudience: ann.targetAudience,
      targetDept: ann.targetDept,
      important: ann.important,
      pinned: ann.pinned,
      requireConfirmation: ann.requireConfirmation,
      expiresAt: ann.expiresAt || '',
    });
    setShowCreateAnn(true);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    const operator = currentUser?.name || '系統管理員';
    const now = new Date().toISOString().split('T')[0];
    setAnnouncements(prev => prev.map(a =>
      a.id === deleteTarget.id
        ? { ...a, deletedAt: now, deletedBy: operator, editHistory: [...a.editHistory, { action: '刪除' as const, editedAt: now, editedBy: operator, summary: '公告已刪除（保留紀錄供稽核）' }] }
        : a
    ));
    setDeleteTarget(null);
  };

  const handleRestoreAnnouncement = (ann: AnnouncementLocal) => {
    const operator = currentUser?.name || '系統管理員';
    const now = new Date().toISOString().split('T')[0];
    setAnnouncements(prev => prev.map(a =>
      a.id === ann.id
        ? { ...a, deletedAt: undefined, deletedBy: undefined, editHistory: [...a.editHistory, { action: '還原' as const, editedAt: now, editedBy: operator, summary: '公告已還原' }] }
        : a
    ));
  };

  const handleConfirmRead = (annId: string) => {
    if (!currentUser) return;
    setAnnouncements(prev => prev.map(a =>
      a.id === annId && !a.readBy.includes(currentUser.id)
        ? { ...a, readBy: [...a.readBy, currentUser.id] }
        : a
    ));
    confirmRead(annId, currentUser.id);
  };

  const hasConfirmed = (ann: AnnouncementLocal) =>
    currentUser ? ann.readBy.includes(currentUser.id) : false;

  // 行事曆項目對應的線上課程（標題雙向包含比對）
  const findCourseForDeadline = (courseName: string) =>
    courses.find(c => c.title.includes(courseName) || courseName.includes(c.title));

  const handleDeadlineClick = (item: DeadlineItem) => {
    setSelectedDeadline(item);
  };

  const handleGoToDeadlineCourse = (item: DeadlineItem) => {
    const matched = findCourseForDeadline(item.course);
    setSelectedDeadline(null);
    navigate(matched ? `/training/courses/${matched.id}` : '/training/courses');
  };

  const targetAudienceBadge = (ann: AnnouncementLocal) => {
    if (ann.targetAudience === '全體員工') return <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">全體員工</span>;
    if (ann.targetAudience === '主管以上') return <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">主管以上</span>;
    if (ann.targetAudience === '特定部門') return <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">{ann.targetDept || '特定部門'}</span>;
    return null;
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
            <p className="text-sm text-gray-500">{currentUser?.name} · {unreadCount > 0 ? `${unreadCount} 則未讀` : '全部已讀'}</p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
            <CheckCheck size={16} />
            全部標為已讀
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
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
              <span className="bg-orange-100 text-orange-700 text-xs px-1.5 py-0.5 rounded-full font-semibold">{visibleAnnouncements.length}</span>
            </button>
          </div>

          {/* Notifications tab content */}
          {mainTab === 'notifications' && (
            <>
              <div className="flex gap-1 bg-gray-100 rounded-xl p-1 flex-wrap">
                {TABS.map(({ id, label }) => {
                  const count = id === 'all' ? notifications.filter((n) => !n.isRead).length : notifications.filter((n) => n.type === id && !n.isRead).length;
                  return (
                    <button
                      key={id}
                      onClick={() => setActiveTab(id)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap px-2 ${activeTab === id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      {label}
                      {count > 0 && <span className="w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{count}</span>}
                    </button>
                  );
                })}
              </div>

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
                    className={`bg-white rounded-xl border overflow-hidden transition-all cursor-pointer hover:shadow-md ${notif.isRead ? 'border-gray-100 opacity-80' : 'border-gray-200 shadow-sm'}`}
                  >
                    <div className="flex">
                      <div className={`w-1 shrink-0 ${typeStripe(notif)}`} />
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <TypeIcon type={notif.type} title={notif.title} />
                            <div className="min-w-0">
                              <p className={`text-sm mb-1 ${notif.isRead ? 'font-normal text-gray-600' : 'font-semibold text-gray-900'}`}>{notif.title}</p>
                              <p className="text-sm text-gray-600 leading-relaxed">{notif.message}</p>
                              {notif.course && <span className="inline-block mt-2 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">{notif.course}</span>}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <span className="text-xs text-gray-400 whitespace-nowrap">{notif.time}</span>
                            {!notif.isRead && <span className="text-xs text-blue-600 font-medium whitespace-nowrap">未讀</span>}
                            {notif.isRead && <span className="text-xs text-gray-300 font-medium">已讀</span>}
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
              {/* Create announcement button (admin/hr/manager) */}
              {isHRAdmin && (
                <div className="flex gap-2">
                  <button
                    onClick={() => { setEditingAnnId(null); setAnnForm(DEFAULT_ANN_FORM); setShowCreateAnn(true); }}
                    className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-dashed border-orange-300 rounded-xl text-orange-600 hover:bg-orange-50 transition-colors text-sm font-medium"
                  >
                    <Plus size={16} />
                    新增公告
                  </button>
                  <button
                    onClick={() => setShowExpiredAndDeleted(v => !v)}
                    className={`flex items-center justify-center gap-1.5 px-4 rounded-xl text-xs font-medium border transition-colors ${showExpiredAndDeleted ? 'bg-gray-700 text-white border-gray-700' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
                  >
                    <EyeOff size={14} />
                    {showExpiredAndDeleted ? '隱藏已過期/已刪除' : '顯示已過期/已刪除'}
                  </button>
                </div>
              )}

              {visibleAnnouncements.length === 0 && (
                <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">
                  <Megaphone size={32} className="mx-auto mb-3 opacity-30" />
                  <p>目前沒有公告</p>
                </div>
              )}

              {visibleAnnouncements.map((ann) => {
                const confirmed = hasConfirmed(ann);
                const expired = isExpired(ann);
                const deleted = !!ann.deletedAt;
                return (
                  <div
                    key={ann.id}
                    className={`bg-white rounded-xl border overflow-hidden transition-all ${deleted ? 'border-red-200 opacity-60' : expired ? 'border-gray-200 opacity-70' : ann.pinned ? 'border-orange-200' : 'border-gray-100'}`}
                  >
                    <div className="flex">
                      <div className={`w-1 shrink-0 ${deleted ? 'bg-red-400' : ann.important ? 'bg-orange-500' : 'bg-gray-300'}`} />
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 cursor-pointer" onClick={() => setSelectedAnnouncement(ann)}>
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              {deleted && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">🗑 已刪除</span>}
                              {!deleted && expired && <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-medium">已過期</span>}
                              {ann.pinned && <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">📌 置頂</span>}
                              {ann.important && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">重要</span>}
                              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{ann.category}</span>
                              {targetAudienceBadge(ann)}
                              {ann.requireConfirmation && (
                                <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-medium">需確認閱讀</span>
                              )}
                              {ann.expiresAt && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">效期至 {ann.expiresAt}</span>}
                            </div>
                            <p className="text-sm font-semibold text-gray-900 mb-1">{ann.title}</p>
                            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{ann.content}</p>
                          </div>
                          <ChevronRight size={16} className="text-gray-300 shrink-0 mt-1" />
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span>{ann.publishedAt}</span>
                            <span>·</span>
                            <span>{ann.publishedBy}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {isHRAdmin && (
                              <button
                                onClick={() => setHistoryTarget(ann)}
                                title="編輯紀錄"
                                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 px-2 py-1 rounded-lg"
                              >
                                <History size={12} />
                                紀錄 {ann.editHistory.length}
                              </button>
                            )}
                            {isHRAdmin && !deleted && (
                              <button
                                onClick={() => handleOpenEditAnnouncement(ann)}
                                title="編輯公告"
                                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 border border-blue-200 px-2 py-1 rounded-lg"
                              >
                                <Pencil size={12} /> 編輯
                              </button>
                            )}
                            {isHRAdmin && !deleted && (
                              <button
                                onClick={() => setDeleteTarget(ann)}
                                title="刪除公告"
                                className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 border border-red-200 px-2 py-1 rounded-lg"
                              >
                                <Trash2 size={12} /> 刪除
                              </button>
                            )}
                            {isHRAdmin && deleted && (
                              <button
                                onClick={() => handleRestoreAnnouncement(ann)}
                                title="還原公告"
                                className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 border border-green-200 px-2 py-1 rounded-lg"
                              >
                                還原
                              </button>
                            )}
                            {isHRAdmin && ann.requireConfirmation && (
                              <button
                                onClick={() => setShowReadersFor(showReadersFor === ann.id ? null : ann.id)}
                                className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 border border-purple-200 px-2 py-0.5 rounded-lg"
                              >
                                <Users size={12} />
                                已讀 {ann.readBy.length} 人
                              </button>
                            )}
                            {ann.requireConfirmation && !isHRAdmin && !deleted && !expired && (
                              confirmed ? (
                                <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                                  <CheckCircle size={12} /> 已確認閱讀
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleConfirmRead(ann.id)}
                                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 border border-blue-200 px-2.5 py-1 rounded-lg font-medium"
                                >
                                  <Eye size={12} /> 確認已閱讀
                                </button>
                              )
                            )}
                          </div>
                        </div>

                        {/* Reader list (admin/hr only) */}
                        {isHRAdmin && showReadersFor === ann.id && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-xs font-semibold text-gray-600 mb-2">已閱讀確認名單（{ann.readBy.length} 人）</p>
                            {ann.readBy.length === 0 ? (
                              <p className="text-xs text-gray-400">尚無人確認閱讀</p>
                            ) : (
                              <div className="flex flex-wrap gap-1.5">
                                {ann.readBy.map(uid => (
                                  <span key={uid} className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">{uid}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
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
              {UPCOMING_DEADLINES.map((item) => {
                const { date, course, daysLeft, urgent } = item;
                return (
                  <div
                    key={date}
                    onClick={() => handleDeadlineClick(item)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleDeadlineClick(item); }}
                    className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:shadow-sm ${urgent ? 'bg-red-50 border border-red-100 hover:bg-red-100' : 'bg-gray-50 hover:bg-gray-100'}`}
                  >
                    <div className={`text-center shrink-0 w-12 rounded-lg py-1 ${urgent ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                      <p className="text-[10px] font-medium">{date.split('/')[0]}月</p>
                      <p className="text-base font-bold leading-none">{date.split('/')[1]}</p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-medium truncate ${urgent ? 'text-red-800' : 'text-gray-700'}`}>{course}</p>
                      <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-semibold ${daysLeft <= 7 ? 'bg-red-100 text-red-600' : daysLeft <= 30 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                        {daysLeft <= 7 ? `緊急！剩 ${daysLeft} 天` : `剩 ${daysLeft} 天`}
                      </span>
                    </div>
                    <ChevronRight size={14} className="text-gray-300 shrink-0 mt-1" />
                  </div>
                );
              })}
            </div>
          </div>

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
              <button onClick={() => setSelectedNotif(null)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} className="text-gray-500" /></button>
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
              <button onClick={() => setSelectedNotif(null)} className="w-full py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700">關閉</button>
            </div>
          </div>
        </div>
      )}

      {/* Deadline calendar detail modal */}
      {selectedDeadline && (() => {
        const matched = findCourseForDeadline(selectedDeadline.course);
        return (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedDeadline(null)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className={`p-5 text-white ${selectedDeadline.urgent ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-gray-600 to-gray-500'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs opacity-80 mb-1">截止日期</p>
                    <h2 className="font-bold text-lg leading-snug">{selectedDeadline.date}（2026年）</h2>
                  </div>
                  <button onClick={() => setSelectedDeadline(null)} className="p-1.5 hover:bg-white/20 rounded-lg"><X size={18} /></button>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">課程名稱</p>
                  <p className="text-base font-semibold text-gray-900">{selectedDeadline.course}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${selectedDeadline.daysLeft <= 7 ? 'bg-red-100 text-red-600' : selectedDeadline.daysLeft <= 30 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                    {selectedDeadline.daysLeft <= 7 ? `緊急！剩 ${selectedDeadline.daysLeft} 天` : `剩 ${selectedDeadline.daysLeft} 天`}
                  </span>
                  {selectedDeadline.urgent && <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-red-50 text-red-500 border border-red-200">優先處理</span>}
                </div>
                {matched ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                    <p className="text-xs text-blue-600 font-medium">已找到對應線上課程</p>
                    <p className="text-sm text-blue-800 font-semibold mt-0.5">{matched.title}</p>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-500">
                    尚未找到完全對應的線上課程，可至課程庫搜尋相關課程或聯繫人資安全組確認訓練安排。
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-gray-100 flex gap-3">
                <button onClick={() => setSelectedDeadline(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">關閉</button>
                <button
                  onClick={() => handleGoToDeadlineCourse(selectedDeadline)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold"
                >
                  {matched ? '前往課程' : '前往課程庫搜尋'} <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Announcement detail modal */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedAnnouncement(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-5 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {selectedAnnouncement.pinned && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">📌 置頂</span>}
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{selectedAnnouncement.category}</span>
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{selectedAnnouncement.targetAudience}</span>
                  </div>
                  <h2 className="font-bold text-lg leading-snug">{selectedAnnouncement.title}</h2>
                </div>
                <button onClick={() => setSelectedAnnouncement(null)} className="p-1.5 hover:bg-white/20 rounded-lg"><X size={18} /></button>
              </div>
              <p className="text-orange-100 text-xs mt-2">{selectedAnnouncement.publishedAt} · {selectedAnnouncement.publishedBy}</p>
            </div>
            <div className="p-5">
              <p className="text-sm text-gray-700 leading-relaxed">{selectedAnnouncement.content}</p>

              {selectedAnnouncement.requireConfirmation && (
                <div className="mt-5 pt-4 border-t border-gray-100">
                  {hasConfirmed(selectedAnnouncement) ? (
                    <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-green-700">
                      <CheckCircle size={18} />
                      <div>
                        <p className="font-semibold text-sm">已確認閱讀</p>
                        <p className="text-xs text-green-600 mt-0.5">您已完成本公告的閱讀確認簽名</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <p className="text-sm text-blue-800 font-semibold mb-2">此公告需要閱讀確認</p>
                      <p className="text-xs text-blue-600 mb-3">請點擊下方按鈕以確認您已閱讀此公告（此操作視同電子簽名）</p>
                      <button
                        onClick={() => { handleConfirmRead(selectedAnnouncement.id); setSelectedAnnouncement({ ...selectedAnnouncement, readBy: [...selectedAnnouncement.readBy, currentUser?.id || ''] }); }}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                      >
                        <CheckCircle size={15} />
                        確認已閱讀（電子簽名）
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-100">
              <button onClick={() => setSelectedAnnouncement(null)} className="w-full py-2 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600">關閉</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDeleteTarget(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-5">
              <h2 className="font-bold text-gray-900 mb-2">確定要刪除這則公告？</h2>
              <p className="text-sm text-gray-500 mb-1">「{deleteTarget.title}」</p>
              <p className="text-xs text-gray-400">刪除後此公告將不再顯示給一般員工，但會保留於編輯紀錄中供稽核，管理員可隨時還原。</p>
            </div>
            <div className="p-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">取消</button>
              <button onClick={handleConfirmDelete} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold">確定刪除</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit history modal */}
      {historyTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setHistoryTarget(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-gray-900 text-sm flex items-center gap-2"><History size={16} className="text-gray-500" />編輯紀錄</h2>
                <p className="text-xs text-gray-400 mt-0.5">{historyTarget.title}</p>
              </div>
              <button onClick={() => setHistoryTarget(null)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} className="text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-3 overflow-y-auto">
              {historyTarget.editHistory.slice().reverse().map((h, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className={`w-2.5 h-2.5 rounded-full ${h.action === '刪除' ? 'bg-red-500' : h.action === '建立' ? 'bg-green-500' : h.action === '還原' ? 'bg-blue-500' : 'bg-orange-500'}`} />
                    {idx < historyTarget.editHistory.length - 1 && <span className="w-px flex-1 bg-gray-200 mt-1" />}
                  </div>
                  <div className="pb-3">
                    <p className="text-sm font-medium text-gray-800">{h.action} <span className="text-xs text-gray-400 font-normal">· {h.editedBy} · {h.editedAt}</span></p>
                    <p className="text-xs text-gray-500 mt-0.5">{h.summary}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-100">
              <button onClick={() => setHistoryTarget(null)} className="w-full py-2 bg-gray-700 text-white rounded-xl text-sm font-medium hover:bg-gray-800">關閉</button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Announcement Modal */}
      {showCreateAnn && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => { setShowCreateAnn(false); setEditingAnnId(null); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-5 text-white flex items-center justify-between">
              <h2 className="font-bold text-lg">{editingAnnId ? '編輯公告' : '新增公告'}</h2>
              <button onClick={() => { setShowCreateAnn(false); setEditingAnnId(null); }} className="p-1.5 hover:bg-white/20 rounded-lg"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">公告標題 *</label>
                <input
                  type="text"
                  value={annForm.title}
                  onChange={e => setAnnForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="請輸入公告標題"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">公告內容 *</label>
                <textarea
                  value={annForm.content}
                  onChange={e => setAnnForm(f => ({ ...f, content: e.target.value }))}
                  placeholder="請輸入公告詳細內容..."
                  rows={4}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">公告類別</label>
                  <select
                    value={annForm.category}
                    onChange={e => setAnnForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
                  >
                    {ANN_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">推播對象</label>
                  <select
                    value={annForm.targetAudience}
                    onChange={e => setAnnForm(f => ({ ...f, targetAudience: e.target.value as NewAnnForm['targetAudience'] }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
                  >
                    <option value="全體員工">全體員工</option>
                    <option value="主管以上">主管以上</option>
                    <option value="特定部門">特定部門</option>
                  </select>
                </div>
              </div>

              {annForm.targetAudience === '特定部門' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">指定部門</label>
                  <select
                    value={annForm.targetDept}
                    onChange={e => setAnnForm(f => ({ ...f, targetDept: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
                  >
                    <option value="">請選擇部門</option>
                    {DEPARTMENTS_LIST.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={annForm.important}
                    onChange={e => setAnnForm(f => ({ ...f, important: e.target.checked }))}
                    className="w-4 h-4 accent-red-500 rounded"
                  />
                  <span className="text-sm text-gray-700">標示重要</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={annForm.pinned}
                    onChange={e => setAnnForm(f => ({ ...f, pinned: e.target.checked }))}
                    className="w-4 h-4 accent-orange-500 rounded"
                  />
                  <span className="text-sm text-gray-700">置頂顯示</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={annForm.requireConfirmation}
                    onChange={e => setAnnForm(f => ({ ...f, requireConfirmation: e.target.checked }))}
                    className="w-4 h-4 accent-purple-500 rounded"
                  />
                  <span className="text-sm text-gray-700">需確認閱讀</span>
                </label>
              </div>

              {annForm.requireConfirmation && (
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-xs text-purple-700">
                  ✓ 啟用「需確認閱讀」後，收到此公告的人員需點擊確認按鈕，系統將記錄閱讀確認簽名，管理員可查看已讀名單。
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">公告有效期限（選填）</label>
                <input
                  type="date"
                  value={annForm.expiresAt}
                  onChange={e => setAnnForm(f => ({ ...f, expiresAt: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
                <p className="text-xs text-gray-400 mt-1">超過此日期後，公告將自動從一般員工的公告列表中隱藏（管理員仍可開啟「顯示已過期/已刪除」查看）。</p>
              </div>

              {editingAnnId && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-500">
                  ℹ️ 編輯後將自動記錄變更內容、編輯人員與時間於「編輯紀錄」中，供日後稽核查閱。
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => { setShowCreateAnn(false); setEditingAnnId(null); }} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">取消</button>
              <button
                onClick={handleCreateAnnouncement}
                disabled={!annForm.title.trim() || !annForm.content.trim()}
                className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
              >
                {editingAnnId ? '儲存變更' : '發布公告'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
