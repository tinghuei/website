import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CourseLibrary from './pages/CourseLibrary';
import CourseDetail from './pages/CourseDetail';
import SubmitReport from './pages/SubmitReport';
import TakeQuiz from './pages/TakeQuiz';
import MyCourses from './pages/MyCourses';
import ReviewPanel from './pages/ReviewPanel';
import AdminPanel from './pages/AdminPanel';

function ProtectedRoute({ children, roles }) {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/" replace />;
  if (roles && !roles.includes(currentUser.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { currentUser } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={currentUser ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout><Dashboard /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses"
        element={
          <ProtectedRoute>
            <AppLayout><CourseLibrary /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses/:id"
        element={
          <ProtectedRoute>
            <AppLayout><CourseDetail /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses/:id/submit"
        element={
          <ProtectedRoute roles={['employee', 'manager', 'admin']}>
            <AppLayout><SubmitReport /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses/:id/quiz"
        element={
          <ProtectedRoute roles={['employee', 'manager', 'admin']}>
            <AppLayout><TakeQuiz /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-courses"
        element={
          <ProtectedRoute roles={['employee']}>
            <AppLayout><MyCourses /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/review"
        element={
          <ProtectedRoute roles={['manager', 'admin']}>
            <AppLayout><ReviewPanel /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['admin']}>
            <AppLayout><AdminPanel /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
