import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Dashboard from "@/pages/dashboard";
import Landing from "@/pages/landing";
import Courses from "@/pages/courses";
import Assignments from "@/pages/assignments";
import Schedule from "@/pages/schedule";
import Projects from "@/pages/projects";
import Settings from "@/pages/settings";
import AuthPage from "@/pages/auth-page";
import AIAssistant from "@/pages/ai-assistant";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider, useAuth } from "./hooks/use-auth";

function Router() {
  return (
    <Switch>
      {/* Public routes - redirect to dashboard if logged in */}
      <Route path="/">
        {props => {
          const { user } = useAuth();
          return user ? <Dashboard /> : <Landing />;
        }}
      </Route>
      <Route path="/auth" component={AuthPage} />
      
      {/* Protected routes */}
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/courses" component={Courses} />
      <ProtectedRoute path="/assignments" component={Assignments} />
      <ProtectedRoute path="/schedule" component={Schedule} />
      <ProtectedRoute path="/projects" component={Projects} />
      <ProtectedRoute path="/ai-assistant" component={AIAssistant} />
      <ProtectedRoute path="/settings" component={Settings} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
