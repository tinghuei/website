import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
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

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
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
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
