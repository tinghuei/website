import { useState } from 'react';
import { Bell, LogOut, ChevronDown, Check, Menu } from 'lucide-react';
import { useTrainingAuth } from '../../context/TrainingAuthContext';
import { Link, useLocation } from 'wouter';
import LanguageSwitcher from './LanguageSwitcher';

interface TrainingNavbarProps {
  onMenuClick: () => void;
}

export default function TrainingNavbar({ onMenuClick }: TrainingNavbarProps) {
  const { currentUser, logout, getUserNotifications, markNotificationRead, markAllNotificationsRead } = useTrainingAuth();
  const [, navigate] = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifications = currentUser ? getUserNotifications(currentUser.id) : [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    logout();
    navigate('/training/login');
  };

  const roleLabel: Record<string, string> = {
    admin: '系統管理員',
    manager: '部門主管',
    employee: '員工',
  };

  const roleColor: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-700',
    manager: 'bg-blue-100 text-blue-700',
    employee: 'bg-green-100 text-green-700',
  };

  const notificationTypeColor: Record<string, string> = {
    review_approved: 'text-green-600',
    review_rejected: 'text-red-600',
    review_pending: 'text-blue-600',
    enrollment_reminder: 'text-yellow-600',
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-3 sm:px-6 py-3 flex items-center justify-between gap-2 shadow-sm sticky top-0 z-50">
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-1 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
          aria-label="開啟選單"
        >
          <Menu size={20} className="text-gray-600" />
        </button>
        <Link href="/training/login">
          <div className="flex items-center gap-2 sm:gap-3 cursor-pointer min-w-0">
            <img src="/website/choice-logo.svg" alt="CHOICE" className="h-8 sm:h-9 object-contain shrink-0" />
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold text-gray-900 leading-tight truncate">樂聯工業</h1>
              <p className="text-xs text-gray-500 leading-tight truncate">員工訓練系統</p>
            </div>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        <LanguageSwitcher />
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Bell size={20} className="text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 max-w-[calc(100vw-1.5rem)] bg-white rounded-xl shadow-xl border border-gray-100 z-50">
              <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                <span className="font-semibold text-gray-800 text-sm">通知</span>
                {unreadCount > 0 && currentUser && (
                  <button
                    onClick={() => markAllNotificationsRead(currentUser.id)}
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Check size={12} /> 全部標記已讀
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">暫無通知</div>
                ) : (
                  notifications.slice(0, 10).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${!n.read ? 'bg-blue-50' : ''}`}
                    >
                      <div className="flex items-start gap-2">
                        {!n.read && <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />}
                        <div className={n.read ? 'pl-4' : ''}>
                          <p className={`text-xs leading-relaxed ${notificationTypeColor[n.type] || 'text-gray-700'}`}>
                            {n.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">{n.createdAt}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
              {currentUser?.avatar || currentUser?.name?.[0] || 'U'}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-gray-800 leading-tight">{currentUser?.name}</p>
              <p className="text-xs text-gray-500 leading-tight">{currentUser?.department}</p>
            </div>
            <ChevronDown size={16} className="text-gray-500" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-12 w-56 max-w-[calc(100vw-1.5rem)] bg-white rounded-xl shadow-xl border border-gray-100 z-50">
              <div className="p-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                    {currentUser?.avatar || currentUser?.name?.[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{currentUser?.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColor[currentUser?.role || '']}`}>
                      {roleLabel[currentUser?.role || '']}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">{currentUser?.email}</p>
              </div>
              <div className="p-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut size={16} />
                  登出
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Close dropdowns when clicking outside */}
      {(showNotifications || showUserMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowNotifications(false);
            setShowUserMenu(false);
          }}
        />
      )}
    </nav>
  );
}
