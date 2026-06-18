import { ReactNode, useState } from 'react';
import { useLocation, Redirect } from 'wouter';
import { useTrainingAuth } from '../../context/TrainingAuthContext';
import TrainingNavbar from './TrainingNavbar';
import TrainingSidebar from './TrainingSidebar';
import AIChatbot from './AIChatbot';

interface TrainingLayoutProps {
  children: ReactNode;
  roles?: string[];
}

export default function TrainingLayout({ children, roles }: TrainingLayoutProps) {
  const { currentUser } = useTrainingAuth();
  const [location] = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  if (!currentUser) {
    return <Redirect to="/training/login" />;
  }

  if (roles && !roles.includes(currentUser.role)) {
    return <Redirect to="/training/dashboard" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TrainingNavbar onMenuClick={() => setMobileNavOpen(o => !o)} />
      <div className="flex flex-1">
        <TrainingSidebar open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
        <main className="flex-1 overflow-auto min-w-0">
          {children}
        </main>
      </div>
      <AIChatbot />
    </div>
  );
}
