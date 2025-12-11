import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { AppLayout } from "@/components/AppLayout";
import { PublicLandingPage } from "./pages/PublicLandingPage";
import { TermsOfService } from "./pages/TermsOfService";
import { PrivacyPolicy } from "./pages/PrivacyPolicy";
import { CareersPage } from "./pages/CareersPage";
import { AboutPage } from "./pages/AboutPage";
import PreviewPage from "./pages/PreviewPage";
import Index from "./pages/Index";
import ChatPage from "./pages/ChatPage";
import AuthPage from "./pages/AuthPage";
import CaseSwitcher from "./pages/CaseSwitcher";
import CaseView from "./pages/CaseView";
import HomeDashboard from "./pages/HomeDashboard";
import AddLovedOne from "./pages/AddLovedOne";
import AcceptInvitation from "./pages/AcceptInvitation";
import SettingsPage from "./pages/SettingsPage";
import MemorialPage from "./pages/MemorialPage";
import NotFound from "./pages/NotFound";
// OnboardingPage removed - using OnboardingModal in HomeDashboard instead
import { TaskDetailPage } from "@/components/TaskDetailPage";
import MemorialHub from "./pages/MemorialHub";
import LegalHub from "./pages/LegalHub";
import FinancialHub from "./pages/FinancialHub";
import AccountsHub from "./pages/AccountsHub";
import SupportHub from "./pages/SupportHub";
import VaultPage from "./pages/VaultPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes without sidebar */}
            <Route path="/" element={<PreviewPage />} />
            <Route path="/welcome" element={<PublicLandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/careers" element={<CareersPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/memorial/:slug" element={<MemorialPage />} />
            <Route path="/accept-invitation" element={<AcceptInvitation />} />
            
            {/* Authenticated routes with sidebar */}
            <Route path="/home" element={<AppLayout><HomeDashboard /></AppLayout>} />
            <Route path="/chat" element={<AppLayout><ChatPage /></AppLayout>} />
            <Route path="/dashboard" element={<AppLayout><CaseSwitcher /></AppLayout>} />
            <Route path="/cases/:caseId" element={<AppLayout><CaseView /></AppLayout>} />
            <Route path="/dashboard/planning" element={<AppLayout><CaseSwitcher /></AppLayout>} />
            <Route path="/vault/:lovedOneId" element={<AppLayout><VaultPage /></AppLayout>} />
            <Route path="/hub/memorial/:lovedOneId" element={<AppLayout><MemorialHub /></AppLayout>} />
            <Route path="/hub/legal/:lovedOneId" element={<AppLayout><LegalHub /></AppLayout>} />
            <Route path="/hub/financial/:lovedOneId" element={<AppLayout><FinancialHub /></AppLayout>} />
            <Route path="/hub/accounts/:lovedOneId" element={<AppLayout><AccountsHub /></AppLayout>} />
            <Route path="/hub/support/:lovedOneId" element={<AppLayout><SupportHub /></AppLayout>} />
            <Route path="/add-loved-one" element={<AppLayout><AddLovedOne /></AppLayout>} />
            <Route path="/settings" element={<AppLayout><SettingsPage /></AppLayout>} />
            <Route path="/task/:taskId" element={<AppLayout><TaskDetailPage /></AppLayout>} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
