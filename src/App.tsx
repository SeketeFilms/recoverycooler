import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import BottomNav from "./components/BottomNav";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import SessionTracker from "./components/SessionTracker";
import SwipeableLayout from "./components/SwipeableLayout";
import OfflineIndicator from "./components/OfflineIndicator";
import OfflineAssistance from "./components/OfflineAssistance";
import BiometricGate from "./components/BiometricGate";
import { useOnlineStatus } from "./hooks/useOnlineStatus";
import { useOfflineCache } from "./hooks/useOfflineCache";
import Index from "./pages/Index";
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
import Meditation from "./pages/Meditation";
import AccountabilityPartners from "./pages/AccountabilityPartners";
import DataExport from "./pages/DataExport";
import Reports from "./pages/Reports";
import LocationAlerts from "./pages/LocationAlerts";

// Wrapper for swipeable main routes
const SwipeableRoute = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <SwipeableLayout>{children}</SwipeableLayout>
  </ProtectedRoute>
);

const MAIN_ROUTES = ['/home', '/cooldown', '/spending', '/profile', '/settings'];

// Bottom nav shown only on main routes
const MainRouteBottomNav = () => {
  const location = useLocation();
  const isMainRoute = MAIN_ROUTES.includes(location.pathname);
  return isMainRoute ? <BottomNav /> : null;
};

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
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/onboarding" element={<Onboarding />} />
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
        <Route
          path="/meditation"
          element={
            <ProtectedRoute>
              <Meditation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/partners"
          element={
            <ProtectedRoute>
              <AccountabilityPartners />
            </ProtectedRoute>
          }
        />
        <Route
          path="/export"
          element={
            <ProtectedRoute>
              <DataExport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/location-alerts"
          element={
            <ProtectedRoute>
              <LocationAlerts />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <MainRouteBottomNav />
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
          <BiometricGate>
            <AppContent />
          </BiometricGate>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
