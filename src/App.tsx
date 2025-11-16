import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useScrollToAnchor } from "@/hooks/useScrollToAnchor";
import Index from "./pages/Index";
import About from "./pages/About";
import Menu from "./pages/Menu";
import WeddingMenu from "./pages/WeddingMenu";
import RequestQuote from "./pages/RequestQuote";
import RegularEventQuote from "./pages/RegularEventQuote";
import WeddingEventQuote from "./pages/WeddingEventQuote";
import Reviews from "./pages/Reviews";
import PhotoGallery from "./pages/PhotoGallery";
import AlternativeGallery from "./pages/AlternativeGallery";
import FAQ from "./pages/FAQ";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";
import AdminAuth from "./pages/AdminAuth";
import NotFound from "./pages/NotFound";

import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCanceled from "./pages/PaymentCanceled";
import { TokenBasedCustomerPortal } from "./components/customer/TokenBasedCustomerPortal";
import { SimplifiedAdminDashboard } from "./pages/SimplifiedAdminDashboard";
import QuoteDetailPage from "./pages/QuoteDetailPage";
import EstimatePrintView from "./pages/EstimatePrintView";
import DevTestingPanel from "./pages/DevTestingPanel";

const AppContent = () => {
  useScrollToAnchor();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  return <div className="min-h-screen bg-background font-clean flex flex-col transition-colors duration-300 py-0 my-0">
      <Header />
      <main className={`flex-1 ${isAdminRoute ? 'p-0' : 'py-0 my-0'}`}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/wedding-menu" element={<WeddingMenu />} />
          <Route path="/request-quote" element={<RequestQuote />} />
          <Route path="/request-quote/regular" element={<RegularEventQuote />} />
          <Route path="/request-quote/wedding" element={<WeddingEventQuote />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/gallery" element={<PhotoGallery />} />
          <Route path="/gallery-alt" element={<AlternativeGallery />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-conditions" element={<TermsConditions />} />
          <Route path="/terms-conditions" element={<TermsConditions />} />
          <Route path="/admin/auth" element={<AdminAuth />} />
          {/* Admin Dashboard and Management */}
          <Route path="/admin" element={<SimplifiedAdminDashboard />} />
          
          {/* Admin quote details route - MUST come before admin/* catch-all */}
          <Route path="/admin/quotes/:quoteId" element={<QuoteDetailPage />} />
          
          {/* Admin estimate print route */}
          <Route path="/admin/estimate-print/:invoiceId" element={<EstimatePrintView />} />
          
          {/* Dev Testing Panel */}
          <Route path="/dev/testing" element={<DevTestingPanel />} />
          
          <Route path="/admin/*" element={<SimplifiedAdminDashboard />} />
          
          {/* Customer-facing routes - Single portal route */}
          <Route path="/estimate" element={<TokenBasedCustomerPortal />} />
          
          {/* Redirect old routes to new format */}
          <Route path="/customer-portal" element={<TokenBasedCustomerPortal />} />
          <Route path="/customer/estimate/:token" element={<TokenBasedCustomerPortal />} />
          <Route path="/customer/estimate-preview/:invoiceId" element={<TokenBasedCustomerPortal />} />
          <Route path="/estimate-preview/:token" element={<TokenBasedCustomerPortal />} />
          <Route path="/invoice/public/:invoiceToken" element={<TokenBasedCustomerPortal />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-canceled" element={<PaymentCanceled />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
    </div>;
};
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange={false}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{
            v7_startTransition: true
          }}>
            <AuthProvider>
              <AppContent />
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </QueryClientProvider>
);
export default App;