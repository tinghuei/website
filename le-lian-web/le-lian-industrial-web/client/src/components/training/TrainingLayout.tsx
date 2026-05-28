import { ReactNode } from 'react';
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

  if (!currentUser) {
    return <Redirect to="/training/portal" />;
  }

  if (roles && !roles.includes(currentUser.role)) {
    return <Redirect to="/training/dashboard" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TrainingNavbar />
      <div className="flex flex-1">
        <TrainingSidebar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
      <AIChatbot />
    </div>
  );
}
