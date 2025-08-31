import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
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
import NotFound from "./pages/NotFound";

import InvoicePublic from "./pages/InvoicePublic";
import EstimateCreation from "./pages/EstimateCreation";

import EstimatePreview from "./pages/EstimatePreview";
import PaymentSuccess from "./pages/PaymentSuccess";
import ContractManagement from "./pages/ContractManagement";
import { OptimizedCustomerPortal } from "./components/customer/OptimizedCustomerPortal";
import { TokenBasedCustomerPortal } from "./components/customer/TokenBasedCustomerPortal";
import UnifiedAdminDashboard from "./pages/UnifiedAdminDashboard";
import QuoteDetailPage from "./pages/QuoteDetailPage";
import EstimatePrintView from "./pages/EstimatePrintView";
import { EstimateManagementHub } from "./components/admin/EstimateManagementHub";
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
          {/* Development routes - remove in production */}
          {process.env.NODE_ENV === 'development' && <Route path="/test-email" element={<TestEmail />} />}
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-conditions" element={<TermsConditions />} />
          {/* Admin Dashboard and Management */}
          <Route path="/admin" element={<UnifiedAdminDashboard />} />
          <Route path="/admin/quotes/:quoteId" element={<QuoteDetailPage />} />
          <Route path="/admin/estimates/quote/:quoteId" element={<EstimateManagementHub />} />
          <Route path="/admin/estimates/:invoiceId" element={<EstimateManagementHub />} />
          <Route path="/admin/contracts" element={<ContractManagement />} />
          
          {/* Print routes */}
          <Route path="/estimate-print/:id" element={<EstimatePrintView />} />
          <Route path="/admin/*" element={<UnifiedAdminDashboard />} />
          
          {/* Customer-facing routes */}
          <Route path="/invoice/public/:invoiceToken" element={<InvoicePublic />} />
          <Route path="/customer/portal" element={<OptimizedCustomerPortal />} />
          <Route path="/customer/estimate/:token" element={<TokenBasedCustomerPortal />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
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
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </QueryClientProvider>
);
export default App;