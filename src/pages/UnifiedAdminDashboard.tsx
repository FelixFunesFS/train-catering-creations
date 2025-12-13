import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { EventList } from '@/components/admin/events';
import { EstimateList, PaymentList } from '@/components/admin/billing';
import { Settings, FileText, CreditCard } from 'lucide-react';

export type AdminView = 'events' | 'billing' | 'settings';

export function UnifiedAdminDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const viewParam = searchParams.get('view') as AdminView | null;
  const tabParam = searchParams.get('tab') || 'estimates';
  const [currentView, setCurrentView] = useState<AdminView>(viewParam || 'events');
  const [billingTab, setBillingTab] = useState(tabParam);

  useEffect(() => {
    if (viewParam && viewParam !== currentView) {
      setCurrentView(viewParam);
    }
  }, [viewParam, currentView]);

  const handleViewChange = (view: AdminView) => {
    setCurrentView(view);
    setSearchParams({ view });
  };

  const handleBillingTabChange = (tab: string) => {
    setBillingTab(tab);
    setSearchParams({ view: 'billing', tab });
  };

  return (
    <AdminLayout currentView={currentView} onViewChange={handleViewChange}>
      <div className="container mx-auto px-4 py-6">
        {currentView === 'events' && <EventList />}
        
        {currentView === 'billing' && (
          <Tabs value={billingTab} onValueChange={handleBillingTabChange}>
            <TabsList className="mb-6">
              <TabsTrigger value="estimates" className="gap-2">
                <FileText className="h-4 w-4" />
                Estimates
              </TabsTrigger>
              <TabsTrigger value="payments" className="gap-2">
                <CreditCard className="h-4 w-4" />
                Payments
              </TabsTrigger>
            </TabsList>
            <TabsContent value="estimates">
              <EstimateList />
            </TabsContent>
            <TabsContent value="payments">
              <PaymentList />
            </TabsContent>
          </Tabs>
        )}
        
        {currentView === 'settings' && (
          <Card className="max-w-lg mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                <Settings className="h-7 w-7 text-primary" />
              </div>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground text-sm">
                Email templates and configuration coming next
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}

export default UnifiedAdminDashboard;
