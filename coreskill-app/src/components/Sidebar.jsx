import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  ClipboardCheck,
  Settings,
  Users,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: '儀表板', roles: ['employee', 'manager', 'admin'] },
  { to: '/courses', icon: BookOpen, label: '課程庫', roles: ['employee', 'manager', 'admin'] },
  { to: '/my-courses', icon: GraduationCap, label: '我的課程', roles: ['employee'] },
  { to: '/review', icon: ClipboardCheck, label: '審核面板', roles: ['manager', 'admin'] },
  { to: '/admin', icon: Settings, label: '系統管理', roles: ['admin'] },
];

export default function Sidebar() {
  const { currentUser, getPendingReviews } = useAuth();
  const role = currentUser?.role;
  const pendingCount = getPendingReviews().length;

  const visibleItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <aside className="w-56 bg-gray-900 min-h-screen flex flex-col py-6 px-3 shrink-0">
      <nav className="flex flex-col gap-1 flex-1">
        {visibleItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-3">
                  <Icon size={18} />
                  <span>{label}</span>
                </div>
                {to === '/review' && pendingCount > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${isActive ? 'bg-white text-blue-600' : 'bg-red-500 text-white'}`}>
                    {pendingCount}
                  </span>
                )}
                {isActive && to !== '/review' && <ChevronRight size={14} className="text-blue-200" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-4 border-t border-gray-700">
        <div className="px-3 py-2">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">目前登入</p>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {currentUser?.avatar || currentUser?.name?.[0]}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-300 font-medium truncate">{currentUser?.name}</p>
              <p className="text-xs text-gray-500 truncate">{currentUser?.department}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
