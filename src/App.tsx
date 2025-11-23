import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import SessionTracker from "./components/SessionTracker";
import Onboarding from "./pages/Onboarding";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import Cooldown from "./pages/Cooldown";
import Spending from "./pages/Spending";
import Exclusion from "./pages/Exclusion";
import Profile from "./pages/Profile";
import Security from "./pages/Security";
import Help from "./pages/Help";
import AIChatPage from "./pages/AIChat";
import RebuildLife from "./pages/RebuildLife";
import FinanceRecovery from "./pages/modules/FinanceRecovery";
import RelationshipHealing from "./pages/modules/RelationshipHealing";
import BuildNewHabits from "./pages/modules/BuildNewHabits";
import SetFutureGoals from "./pages/modules/SetFutureGoals";
import MentalHealthSupport from "./pages/modules/MentalHealthSupport";
import Progress from "./pages/Progress";
import Journal from "./pages/Journal";
import Crisis from "./pages/Crisis";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <SessionTracker />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Onboarding />} />
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cooldown"
              element={
                <ProtectedRoute>
                  <Cooldown />
                </ProtectedRoute>
              }
            />
            <Route
              path="/spending"
              element={
                <ProtectedRoute>
                  <Spending />
                </ProtectedRoute>
              }
            />
            <Route
              path="/exclusion"
              element={
                <ProtectedRoute>
                  <Exclusion />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/help"
              element={
                <ProtectedRoute>
                  <Help />
                </ProtectedRoute>
              }
            />
            <Route
              path="/security"
              element={
                <ProtectedRoute>
                  <Security />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ai-chat"
              element={
                <ProtectedRoute>
                  <AIChatPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rebuild-life"
              element={
                <ProtectedRoute>
                  <RebuildLife />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rebuild-life/finance"
              element={
                <ProtectedRoute>
                  <FinanceRecovery />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rebuild-life/relationships"
              element={
                <ProtectedRoute>
                  <RelationshipHealing />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rebuild-life/habits"
              element={
                <ProtectedRoute>
                  <BuildNewHabits />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rebuild-life/goals"
              element={
                <ProtectedRoute>
                  <SetFutureGoals />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rebuild-life/mental-health"
              element={
                <ProtectedRoute>
                  <MentalHealthSupport />
                </ProtectedRoute>
              }
            />
            <Route
              path="/progress"
              element={
                <ProtectedRoute>
                  <Progress />
                </ProtectedRoute>
              }
            />
            <Route
              path="/journal"
              element={
                <ProtectedRoute>
                  <Journal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/crisis"
              element={
                <ProtectedRoute>
                  <Crisis />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
