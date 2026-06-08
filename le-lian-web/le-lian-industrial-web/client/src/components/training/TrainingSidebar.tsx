import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  ClipboardCheck,
  Settings,
  ChevronRight,
  Target,
  Calendar,
  Globe,
  Trophy,
  Map,
  Bell,
  BarChart2,
  FileText,
  MessageSquare,
} from 'lucide-react';
import { useTrainingAuth } from '../../context/TrainingAuthContext';
import { Link, useLocation } from 'wouter';

const navItems = [
  { to: '/training/dashboard', icon: LayoutDashboard, label: '儀表板', roles: ['employee', 'manager', 'admin'] },
  { to: '/training/courses', icon: BookOpen, label: '課程庫', roles: ['employee', 'manager', 'admin'] },
  { to: '/training/my-courses', icon: GraduationCap, label: '我的課程', roles: ['employee'] },
  { to: '/training/competency', icon: Target, label: '職能分析', roles: ['employee', 'manager', 'admin'] },
  { to: '/training/annual-plan', icon: Calendar, label: '年度計劃', roles: ['manager', 'admin', 'hr'] },
  { to: '/training/free-courses', icon: Globe, label: '免費課程', roles: ['employee', 'manager', 'admin'] },
  { to: '/training/achievements', icon: Trophy, label: '成就獎勵', roles: ['employee', 'manager', 'admin'] },
  { to: '/training/career', icon: Map, label: '職涯規劃', roles: ['employee', 'manager', 'admin'] },
  { to: '/training/ai-assistant', icon: MessageSquare, label: 'AI 學習助理', roles: ['employee', 'manager', 'admin'] },
  { to: '/training/notifications', icon: Bell, label: '通知中心', roles: ['employee', 'manager', 'admin'] },
  { to: '/training/management-reports', icon: BarChart2, label: '管理報表', roles: ['manager', 'admin'] },
  { to: '/training/fee-agreement', icon: FileText, label: '費用同意書', roles: ['manager', 'admin', 'hr'] },
  { to: '/training/review', icon: ClipboardCheck, label: '審核面板', roles: ['manager', 'admin'] },
  { to: '/training/admin', icon: Settings, label: '系統管理', roles: ['admin'] },
];

export default function TrainingSidebar() {
  const { currentUser, getPendingReviews } = useTrainingAuth();
  const [location] = useLocation();
  const role = currentUser?.role || '';
  const pendingCount = getPendingReviews().length;

  const visibleItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <aside className="w-56 bg-gray-900 min-h-screen flex flex-col py-6 px-3 shrink-0">
      <nav className="flex flex-col gap-1 flex-1">
        {visibleItems.map(({ to, icon: Icon, label }) => {
          const isActive = location === to || location.startsWith(to + '/');
          return (
            <Link
              key={to}
              href={to}
              className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} />
                <span>{label}</span>
              </div>
              {to === '/training/review' && pendingCount > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${isActive ? 'bg-white text-blue-600' : 'bg-red-500 text-white'}`}>
                  {pendingCount}
                </span>
              )}
              {isActive && to !== '/training/review' && <ChevronRight size={14} className="text-blue-200" />}
            </Link>
          );
        })}
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
