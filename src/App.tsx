import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Header } from "@/components/Header";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useScrollToAnchor } from "@/hooks/useScrollToAnchor";
import { lazy, Suspense } from "react";

import { useIsMobile } from "@/hooks/use-mobile";
import { HeroVisibilityProvider } from "@/contexts/HeroVisibilityContext";
import { useVisitorTracking } from "@/hooks/useVisitorTracking";

// Critical path - eagerly loaded for LCP
import Index from "./pages/Index";

// Lazy loaded utility components - not critical for initial render
const Footer = lazy(() => import("./components/Footer").then(m => ({ default: m.Footer })));
const OfflineIndicator = lazy(() => import("./components/pwa/OfflineIndicator").then(m => ({ default: m.OfflineIndicator })));
const PwaUpdateBanner = lazy(() => import("./components/pwa/PwaUpdateBanner").then(m => ({ default: m.PwaUpdateBanner })));
const MobileActionBar = lazy(() => import("./components/mobile/MobileActionBar").then(m => ({ default: m.MobileActionBar })));
const ScrollToTop = lazy(() => import("./components/ui/scroll-to-top").then(m => ({ default: m.ScrollToTop })));

// Lazy loaded pages - CSS code-split for reduced initial bundle
const About = lazy(() => import("./pages/About"));
const SimplifiedMenu = lazy(() => import("./pages/SimplifiedMenu"));
const RequestQuote = lazy(() => import("./pages/RequestQuote"));
const RegularEventQuote = lazy(() => import("./pages/RegularEventQuote"));
const WeddingEventQuote = lazy(() => import("./pages/WeddingEventQuote"));
const Reviews = lazy(() => import("./pages/Reviews"));
const AlternativeGallery = lazy(() => import("./pages/AlternativeGallery"));
const FAQ = lazy(() => import("./pages/FAQ"));
const TestEmail = lazy(() => import("./pages/TestEmail"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsConditions = lazy(() => import("./pages/TermsConditions"));
const AdminAuth = lazy(() => import("./pages/AdminAuth"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Install = lazy(() => import("./pages/Install"));
const ApproveEstimate = lazy(() => import("./pages/ApproveEstimate"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const PaymentCanceled = lazy(() => import("./pages/PaymentCanceled"));
const UnifiedAdminDashboard = lazy(() => import("./pages/UnifiedAdminDashboard"));
const EstimatePrintView = lazy(() => import("./pages/EstimatePrintView"));
const EventEstimateFullViewPage = lazy(() => import("./pages/EventEstimateFullViewPage").then(m => ({ default: m.EventEstimateFullViewPage })));
const CustomerEstimateView = lazy(() => import("./components/customer/CustomerEstimateView").then(m => ({ default: m.CustomerEstimateView })));
const QuoteThankYou = lazy(() => import("./pages/QuoteThankYou"));
const AdminMenuEditPage = lazy(() => import("./pages/AdminMenuEditPage"));

// Minimal loading fallback to avoid layout shift
const PageLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const AppContent = () => {
  useScrollToAnchor();
  useVisitorTracking(); // Track visitor page views for admin notifications
  const location = useLocation();
  const isMobile = useIsMobile();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isQuoteWizardRoute = /^\/request-quote\/(regular|wedding)$/.test(location.pathname);
  // Hide header/footer for full-page event view and quote wizard (all devices)
  const isEventFullView = /^\/admin\/event\/[^/]+$/.test(location.pathname);
  const isEventMenuEdit = /^\/admin\/event\/[^/]+\/menu$/.test(location.pathname);
  const isEstimatePrint = /^\/admin\/estimate-print\/[^/]+$/.test(location.pathname);
  const hideChrome = isEventFullView || isEventMenuEdit || isEstimatePrint || isQuoteWizardRoute;

  const showMobileActionBar = isMobile && !isAdminRoute && !isQuoteWizardRoute;
  
  return <div className="min-h-screen bg-background font-clean flex flex-col transition-colors duration-300 py-0 my-0">
      <Suspense fallback={null}>
        <OfflineIndicator />
        <PwaUpdateBanner />
      </Suspense>
      {!hideChrome && <Header />}
      <main className={`flex-1 ${!hideChrome ? 'pt-16 lg:pt-[72px]' : ''} ${isAdminRoute ? 'p-0' : 'py-0 my-0'} ${showMobileActionBar ? 'pb-[calc(5rem+env(safe-area-inset-bottom))]' : ''}`}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/menu" element={<SimplifiedMenu />} />
            <Route path="/wedding-menu" element={<Navigate to="/menu" replace />} />
            <Route path="/request-quote" element={<RequestQuote />} />
            <Route path="/request-quote/regular" element={<RegularEventQuote />} />
            <Route path="/request-quote/wedding" element={<WeddingEventQuote />} />
            <Route path="/request-quote/thank-you" element={<QuoteThankYou />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/gallery" element={<AlternativeGallery />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/install" element={<Install />} />
            {/* Customer approval deep links (email clients may append trailing slashes) */}
            <Route path="/approve/*" element={<ApproveEstimate />} />
            <Route path="/approve-estimate" element={<ApproveEstimate />} />
            {/* Development routes - remove in production */}
            {process.env.NODE_ENV === 'development' && <Route path="/test-email" element={<TestEmail />} />}
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-conditions" element={<TermsConditions />} />
            <Route path="/admin/auth" element={<AdminAuth />} />
            {/* Admin Dashboard and Management - Protected */}
            <Route path="/admin" element={<ProtectedRoute><UnifiedAdminDashboard /></ProtectedRoute>} />
            
            {/* Admin full-viewport event/estimate view - Protected */}
            <Route path="/admin/event/:quoteId" element={<ProtectedRoute><EventEstimateFullViewPage /></ProtectedRoute>} />

             {/* Admin full-viewport menu editor - Protected */}
             <Route path="/admin/event/:quoteId/menu" element={<ProtectedRoute><AdminMenuEditPage /></ProtectedRoute>} />
            
            {/* Admin estimate print route - Protected */}
            <Route path="/admin/estimate-print/:invoiceId" element={<ProtectedRoute><EstimatePrintView /></ProtectedRoute>} />
            <Route path="/admin/*" element={<ProtectedRoute><UnifiedAdminDashboard /></ProtectedRoute>} />
            
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
        </Suspense>
      </main>
      <Suspense fallback={null}>
        {!hideChrome && !isAdminRoute && <Footer />}
        {showMobileActionBar && <MobileActionBar />}
        <ScrollToTop />
      </Suspense>
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
              <HeroVisibilityProvider>
                <AppContent />
              </HeroVisibilityProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </QueryClientProvider>
);
export default App;
