import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import SessionTracker from "./components/SessionTracker";
import SwipeableLayout from "./components/SwipeableLayout";
import OfflineIndicator from "./components/OfflineIndicator";
import OfflineAssistance from "./components/OfflineAssistance";
import { useOnlineStatus } from "./hooks/useOnlineStatus";
import { useOfflineCache } from "./hooks/useOfflineCache";
import Onboarding from "./pages/Onboarding";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import Cooldown from "./pages/Cooldown";
import Spending from "./pages/Spending";
import Exclusion from "./pages/Exclusion";
import Profile from "./pages/Profile";
import Security from "./pages/Security";
import Help from "./pages/Help";
import Settings from "./pages/Settings";
import ShortcutsSettings from "./pages/ShortcutsSettings";
import Community from "./pages/Community";
import RelapsePrevention from "./pages/RelapsePrevention";
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

// Wrapper for swipeable main routes
const SwipeableRoute = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <SwipeableLayout>{children}</SwipeableLayout>
  </ProtectedRoute>
);

// App content with offline handling
const AppContent = () => {
  const isOnline = useOnlineStatus();
  useOfflineCache();

  // Show offline assistance when offline and logged in
  if (!isOnline) {
    return (
      <>
        <OfflineIndicator />
        <OfflineAssistance />
      </>
    );
  }

  return (
    <>
      <OfflineIndicator />
      <Routes>
        <Route path="/" element={<Onboarding />} />
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/home"
          element={
            <SwipeableRoute>
              <Home />
            </SwipeableRoute>
          }
        />
        <Route
          path="/cooldown"
          element={
            <SwipeableRoute>
              <Cooldown />
            </SwipeableRoute>
          }
        />
        <Route
          path="/spending"
          element={
            <SwipeableRoute>
              <Spending />
            </SwipeableRoute>
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
            <SwipeableRoute>
              <Profile />
            </SwipeableRoute>
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
        <Route
          path="/community"
          element={
            <ProtectedRoute>
              <Community />
            </ProtectedRoute>
          }
        />
        <Route
          path="/relapse-prevention"
          element={
            <ProtectedRoute>
              <RelapsePrevention />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <SwipeableRoute>
              <Settings />
            </SwipeableRoute>
          }
        />
        <Route
          path="/settings/shortcuts"
          element={
            <ProtectedRoute>
              <ShortcutsSettings />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <SessionTracker />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
