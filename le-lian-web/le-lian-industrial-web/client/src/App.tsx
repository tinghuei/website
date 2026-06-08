import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Router as WouterRouter, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { TrainingAuthProvider } from "./context/TrainingAuthContext";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Quality from "./pages/Quality";
import Training from "./pages/Training";
import Contact from "./pages/Contact";
import CompetencyGapAnalysis from "./pages/CompetencyGapAnalysis";
import EmployeeSelfAssessment from "./pages/EmployeeSelfAssessment";
import Initialize from "./pages/Initialize";
import CompetencyAssessment from "./pages/CompetencyAssessment";
import DetailedCompetencyAssessment from "./pages/DetailedCompetencyAssessment";
import AdminDashboard from "./pages/AdminDashboard";

// Training system pages
import TrainingLogin from "./pages/training/TrainingLogin";
import TrainingDashboard from "./pages/training/TrainingDashboard";
import TrainingCourseLibrary from "./pages/training/TrainingCourseLibrary";
import TrainingCourseDetail from "./pages/training/TrainingCourseDetail";
import TrainingMyCourses from "./pages/training/TrainingMyCourses";
import TrainingSubmitReport from "./pages/training/TrainingSubmitReport";
import TrainingTakeQuiz from "./pages/training/TrainingTakeQuiz";
import TrainingReviewPanel from "./pages/training/TrainingReviewPanel";
import TrainingAdminPanel from "./pages/training/TrainingAdminPanel";
import TrainingLayout from "./components/training/TrainingLayout";
import CompetencyAnalysis from "./pages/training/CompetencyAnalysis";
import AnnualTrainingPlan from "./pages/training/AnnualTrainingPlan";
import FreeCourses from "./pages/training/FreeCourses";
import Achievements from "./pages/training/Achievements";
import CareerPlanning from "./pages/training/CareerPlanning";
import ManagementReports from "./pages/training/ManagementReports";
import FeeAgreement from "./pages/training/FeeAgreement";
import NotificationCenter from "./pages/training/NotificationCenter";
import AIAssistant from "./pages/training/AIAssistant";

function Router() {
  return (
    <Switch>
      {/* Main site routes */}
      <Route path={"/"} component={Home} />
      <Route path={"/about"} component={About} />
      <Route path={"/services"} component={Services} />
      <Route path={"/quality"} component={Quality} />
      <Route path={"/training"} component={Training} />
      <Route path={"/competency-gap-analysis"} component={CompetencyGapAnalysis} />
      <Route path={"/employee-self-assessment"} component={EmployeeSelfAssessment} />
      <Route path={"/initialize"} component={Initialize} />
      <Route path={"/competency-assessment"} component={CompetencyAssessment} />
      <Route path={"/detailed-competency-assessment"} component={DetailedCompetencyAssessment} />
      <Route path={"/admin-dashboard"} component={AdminDashboard} />
      <Route path={"/contact"} component={Contact} />

      {/* Training portal login (no auth required) */}
      <Route path={"/training/login"} component={TrainingLogin} />

      {/* Training system authenticated routes */}
      <Route path={"/training/dashboard"}>
        {() => (
          <TrainingLayout>
            <TrainingDashboard />
          </TrainingLayout>
        )}
      </Route>
      <Route path={"/training/courses"}>
        {() => (
          <TrainingLayout>
            <TrainingCourseLibrary />
          </TrainingLayout>
        )}
      </Route>
      <Route path={"/training/courses/:id/submit"}>
        {() => (
          <TrainingLayout>
            <TrainingSubmitReport />
          </TrainingLayout>
        )}
      </Route>
      <Route path={"/training/courses/:id/quiz"}>
        {() => (
          <TrainingLayout>
            <TrainingTakeQuiz />
          </TrainingLayout>
        )}
      </Route>
      <Route path={"/training/courses/:id"}>
        {() => (
          <TrainingLayout>
            <TrainingCourseDetail />
          </TrainingLayout>
        )}
      </Route>
      <Route path={"/training/my-courses"}>
        {() => (
          <TrainingLayout roles={['employee']}>
            <TrainingMyCourses />
          </TrainingLayout>
        )}
      </Route>
      <Route path={"/training/review"}>
        {() => (
          <TrainingLayout roles={['manager', 'admin']}>
            <TrainingReviewPanel />
          </TrainingLayout>
        )}
      </Route>
      <Route path={"/training/admin"}>
        {() => (
          <TrainingLayout roles={['admin']}>
            <TrainingAdminPanel />
          </TrainingLayout>
        )}
      </Route>
      <Route path={"/training/competency"}>
        {() => (
          <TrainingLayout>
            <CompetencyAnalysis />
          </TrainingLayout>
        )}
      </Route>
      <Route path={"/training/annual-plan"}>
        {() => (
          <TrainingLayout roles={['manager', 'admin', 'hr']}>
            <AnnualTrainingPlan />
          </TrainingLayout>
        )}
      </Route>
      <Route path={"/training/free-courses"}>
        {() => (
          <TrainingLayout>
            <FreeCourses />
          </TrainingLayout>
        )}
      </Route>
      <Route path={"/training/achievements"}>
        {() => (
          <TrainingLayout>
            <Achievements />
          </TrainingLayout>
        )}
      </Route>
      <Route path={"/training/career"}>
        {() => (
          <TrainingLayout>
            <CareerPlanning />
          </TrainingLayout>
        )}
      </Route>
      <Route path={"/training/management-reports"}>
        {() => (
          <TrainingLayout roles={['manager', 'admin']}>
            <ManagementReports />
          </TrainingLayout>
        )}
      </Route>
      <Route path={"/training/fee-agreement"}>
        {() => (
          <TrainingLayout roles={['manager', 'admin', 'hr']}>
            <FeeAgreement />
          </TrainingLayout>
        )}
      </Route>
      <Route path={"/training/notifications"}>
        {() => (
          <TrainingLayout>
            <NotificationCenter />
          </TrainingLayout>
        )}
      </Route>
      <Route path={"/training/ai-assistant"}>
        {() => (
          <TrainingLayout>
            <AIAssistant />
          </TrainingLayout>
        )}
      </Route>

      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <TrainingAuthProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
          </TrainingAuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
