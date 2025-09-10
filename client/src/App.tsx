import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { User } from "@shared/schema";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import Browse from "@/pages/Browse";
import LessonView from "@/pages/LessonView";
import Upload from "@/pages/Upload";
import AdminCategories from "@/pages/AdminCategories";
import AdminUsers from "@/pages/AdminUsers";
import NotFound from "@/pages/not-found";

function Router() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const userTyped = user as User | undefined;

  return (
    <Switch>
      {/* Public routes - accessible to everyone */}
      <Route path="/" component={isAuthenticated ? Home : Landing} />
      <Route path="/browse/*" component={Browse} />
      <Route path="/lesson/:id" component={LessonView} />
      
      {/* Protected routes - require authentication */}
      {isAuthenticated && (
        <>
          {(userTyped?.role === 'teacher' || userTyped?.role === 'admin') && (
            <Route path="/upload" component={Upload} />
          )}
          {userTyped?.role === 'admin' && (
            <>
              <Route path="/admin/categories" component={AdminCategories} />
              <Route path="/admin/users" component={AdminUsers} />
            </>
          )}
        </>
      )}
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
