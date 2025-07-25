import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
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
import SecondAlternativeHome from "./pages/SecondAlternativeHome";
import ThirdAlternativeHome from "./pages/ThirdAlternativeHome";
import FourthAlternativeHome from "./pages/FourthAlternativeHome";
import FAQ from "./pages/FAQ";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";
import NotFound from "./pages/NotFound";
const AppContent = () => {
  useScrollToAnchor();
  return <div className="min-h-screen bg-background font-clean flex flex-col transition-colors duration-300 py-0 my-0">
      <Header />
      <main className="flex-1 py-0 my-0">
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
          <Route path="/home-alt" element={<SecondAlternativeHome />} />
          <Route path="/home-alt-3" element={<ThirdAlternativeHome />} />
          <Route path="/home-alt-4" element={<FourthAlternativeHome />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-conditions" element={<TermsConditions />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>;
};
const queryClient = new QueryClient();
const App = () => <QueryClientProvider client={queryClient}>
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
  </QueryClientProvider>;
export default App;