
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import StudyPlan from "./pages/StudyPlan";
import Analysis from "./pages/Analysis";
import Badges from "./pages/Badges";
import AllBadges from "./pages/AllBadges";
import Exercises from "./pages/Exercises";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import { AuthProvider } from "./context/AuthContext";
import { TasksProvider } from "./context/TasksContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <TasksProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/index" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/studyplan" element={<StudyPlan />} />
              <Route path="/analysis" element={<Analysis />} />
              <Route path="/exercises" element={<Exercises />} />
              <Route path="/badges" element={<Badges />} />
              <Route path="/badges/levels" element={<Badges />} />
              <Route path="/badges/all" element={<AllBadges />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TasksProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
