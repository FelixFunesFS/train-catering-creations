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
import TestEmail from "./pages/TestEmail";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";
import AdminAuth from "./pages/AdminAuth";
import NotFound from "./pages/NotFound";

import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCanceled from "./pages/PaymentCanceled";
import UnifiedAdminDashboard from "./pages/UnifiedAdminDashboard";
import EstimatePrintView from "./pages/EstimatePrintView";
import { EventEstimateFullViewPage } from "./pages/EventEstimateFullViewPage";
import { CustomerEstimateView } from "./components/customer/CustomerEstimateView";

const AppContent = () => {
  useScrollToAnchor();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  // Hide header/footer for full-page event view
  const isEventFullView = /^\/admin\/event\/[^/]+$/.test(location.pathname);
  const isEstimatePrint = /^\/admin\/estimate-print\/[^/]+$/.test(location.pathname);
  const hideChrome = isEventFullView || isEstimatePrint;
  
  return <div className="min-h-screen bg-background font-clean flex flex-col transition-colors duration-300 py-0 my-0">
      {!hideChrome && <Header />}
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
          {/* Development routes - remove in production */}
          {process.env.NODE_ENV === 'development' && <Route path="/test-email" element={<TestEmail />} />}
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-conditions" element={<TermsConditions />} />
          <Route path="/admin/auth" element={<AdminAuth />} />
          {/* Admin Dashboard and Management */}
          <Route path="/admin" element={<UnifiedAdminDashboard />} />
          
          {/* Admin full-viewport event/estimate view */}
          <Route path="/admin/event/:quoteId" element={<EventEstimateFullViewPage />} />
          
          {/* Admin estimate print route */}
          <Route path="/admin/estimate-print/:invoiceId" element={<EstimatePrintView />} />
          <Route path="/admin/*" element={<UnifiedAdminDashboard />} />
          
          {/* Customer-facing routes */}
          <Route path="/estimate" element={<CustomerEstimateView />} />
          <Route path="/customer-portal" element={<CustomerEstimateView />} />
          <Route path="/customer/estimate/:token" element={<CustomerEstimateView />} />
          <Route path="/customer/estimate-preview/:invoiceId" element={<CustomerEstimateView />} />
          <Route path="/estimate-preview/:token" element={<CustomerEstimateView />} />
          <Route path="/invoice/public/:invoiceToken" element={<CustomerEstimateView />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-canceled" element={<PaymentCanceled />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!hideChrome && !isAdminRoute && <Footer />}
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