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
  Send,
  ClipboardList,
  Users,
  TrendingUp,
  Crown,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTrainingAuth } from '../../context/TrainingAuthContext';
import { Link, useLocation } from 'wouter';

const navItems = [
  { to: '/training/dashboard',          icon: LayoutDashboard, labelKey: 'nav.dashboard',    roles: ['employee', 'manager', 'admin', 'hr', 'vp'] },
  { to: '/training/courses',            icon: BookOpen,        labelKey: 'nav.courses',       roles: ['employee', 'manager', 'admin', 'hr', 'vp'] },
  { to: '/training/my-courses',         icon: GraduationCap,   labelKey: 'nav.myCourses',     roles: ['employee'] },
  { to: '/training/competency',         icon: Target,          labelKey: 'nav.competency',    roles: ['employee', 'manager', 'admin', 'hr', 'vp'] },
  { to: '/training/annual-plan',        icon: Calendar,        labelKey: 'nav.annualPlan',    roles: ['manager', 'admin', 'hr', 'vp'] },
  { to: '/training/free-courses',       icon: Globe,           labelKey: 'nav.freeCourses',   roles: ['employee', 'manager', 'admin', 'hr'] },
  { to: '/training/achievements',       icon: Trophy,          labelKey: 'nav.achievements',  roles: ['employee', 'manager', 'admin', 'hr'] },
  { to: '/training/career',             icon: Map,             labelKey: 'nav.career',        roles: ['employee', 'manager', 'admin', 'hr'] },
  { to: '/training/ai-assistant',       icon: MessageSquare,   labelKey: 'nav.aiAssistant',   roles: ['employee', 'manager', 'admin', 'hr'] },
  { to: '/training/notifications',      icon: Bell,            labelKey: 'nav.notifications', roles: ['employee', 'manager', 'admin', 'hr', 'vp'] },
  { to: '/training/vp-dashboard',       icon: Crown,           labelKey: 'nav.vpDashboard',   roles: ['vp', 'admin'] },
  { to: '/training/management-reports', icon: BarChart2,       labelKey: 'nav.reports',       roles: ['manager', 'admin', 'hr', 'vp'] },
  { to: '/training/fee-agreement',      icon: FileText,        labelKey: 'nav.feeAgreement',      roles: ['manager', 'admin', 'hr'] },
  { to: '/training/physical-training',  icon: ClipboardList,   labelKey: 'nav.physicalTraining',  roles: ['manager', 'admin', 'hr'] },
  { to: '/training/instructor-roster',  icon: Users,           labelKey: 'nav.instructorRoster',  roles: ['manager', 'admin', 'hr'] },
  { to: '/training/performance-tracking', icon: TrendingUp,    labelKey: 'nav.performanceTracking', roles: ['employee', 'manager', 'admin', 'hr', 'vp'] },
  { to: '/training/review',             icon: ClipboardCheck,  labelKey: 'nav.review',            roles: ['manager', 'admin', 'hr'] },
  { to: '/training/admin',              icon: Settings,        labelKey: 'nav.admin',         roles: ['admin', 'hr'] },
];

interface TrainingSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function TrainingSidebar({ open, onClose }: TrainingSidebarProps) {
  const { currentUser, getPendingReviews } = useTrainingAuth();
  const { t } = useTranslation();
  const [location] = useLocation();
  const role = currentUser?.role || '';
  const pendingCount = getPendingReviews().length;

  const visibleItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose} />
      )}
      <aside
        className={`w-56 bg-gray-900 flex flex-col py-6 px-3 shrink-0 fixed md:static top-0 left-0 h-full md:min-h-screen z-50 overflow-y-auto transition-transform duration-200 md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
      <button
        onClick={onClose}
        className="md:hidden self-end mb-2 p-1.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white"
      >
        <X size={18} />
      </button>
      <nav className="flex flex-col gap-1 flex-1">
        {visibleItems.map(({ to, icon: Icon, labelKey }) => {
          const isActive = location === to || location.startsWith(to + '/');
          return (
            <Link
              key={to}
              href={to}
              onClick={onClose}
              className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} />
                <span>{t(labelKey)}</span>
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
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">{t('nav.currentUser')}</p>
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
    </>
  );
}
