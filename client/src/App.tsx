import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import { AccountPage, ForgotPasswordPage, HistoryPage, ProfilePage, ResetPasswordPage } from "./pages/Account";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={() => <AccountPage mode="login" />} />
      <Route path="/signup" component={() => <AccountPage mode="signup" />} />
      <Route path="/forgot-password" component={ForgotPasswordPage} />
      <Route path="/reset-password" component={ResetPasswordPage} />
      <Route path="/patient/profile" component={ProfilePage} />
      <Route path="/patient/history" component={HistoryPage} />
      <Route path="/patient" component={Home} />
      <Route path="/patient/intake" component={Home} />
      <Route path="/patient/symptoms" component={Home} />
      <Route path="/patient/documents" component={Home} />
      <Route path="/doctor" component={Home} />
      <Route path="/doctor/patients/:patientId" component={Home} />
      <Route path="/doctor/feedback" component={Home} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
