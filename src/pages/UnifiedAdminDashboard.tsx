import React, { useState } from 'react';
import { LinearRequestPipeline } from '@/components/admin/LinearRequestPipeline';
import { SmartPricingDashboard } from '@/components/admin/SmartPricingDashboard';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

type AdminView = 'pipeline' | 'pricing' | 'email' | 'customer' | 'invoice';

export default function UnifiedAdminDashboard() {
  const [currentView, setCurrentView] = useState<AdminView>('pipeline');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const { signOut } = useAuth();

  const handleStartPricing = (request: any) => {
    setSelectedRequest(request);
    setCurrentView('pricing');
  };

  const handlePricingComplete = (lineItems: any[], totals: any) => {
    console.log('Pricing completed:', { lineItems, totals });
    // Move to next step - email preview
    setCurrentView('email');
  };

  const handleBackToPipeline = () => {
    setCurrentView('pipeline');
    setSelectedRequest(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Global Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Soul Train's Eatery Admin</h1>
              <p className="text-sm text-muted-foreground">Streamlined request management</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={signOut}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {currentView === 'pipeline' && (
          <LinearRequestPipeline />
        )}
        
        {currentView === 'pricing' && selectedRequest && (
          <SmartPricingDashboard
            quoteRequest={selectedRequest}
            onPricingComplete={handlePricingComplete}
            onBack={handleBackToPipeline}
          />
        )}
        
        {currentView === 'email' && (
          <div className="container mx-auto p-6">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">Email Preview & Send</h2>
              <p className="text-muted-foreground mb-6">Coming in Phase 2...</p>
              <Button onClick={handleBackToPipeline}>
                Back to Pipeline
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}