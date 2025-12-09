import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, FileText, History, AlertTriangle } from 'lucide-react';
import { PaymentProcessingDashboard } from '../PaymentProcessingDashboard';
import { AdminChangeManagement } from '../AdminChangeManagement';
import { ReportingDashboard } from './ReportingDashboard';
import { ARAgingDashboard } from '../payments/ARAgingDashboard';
import { UnifiedPaymentHistory } from '../payments/UnifiedPaymentHistory';

type BillingTab = 'payments' | 'ar-aging' | 'history' | 'changes' | 'reports';

export function BillingHub() {
  const [activeTab, setActiveTab] = useState<BillingTab>('payments');

  return (
    <div className="container mx-auto px-4 py-6">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as BillingTab)} className="space-y-6">
        <TabsList className="grid w-full max-w-2xl grid-cols-5">
          <TabsTrigger value="payments" className="gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Payments</span>
          </TabsTrigger>
          <TabsTrigger value="ar-aging" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">AR Aging</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">History</span>
          </TabsTrigger>
          <TabsTrigger value="changes" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Changes</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-2">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">Reports</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="mt-0">
          <PaymentProcessingDashboard />
        </TabsContent>

        <TabsContent value="ar-aging" className="mt-0">
          <ARAgingDashboard />
        </TabsContent>

        <TabsContent value="history" className="mt-0">
          <UnifiedPaymentHistory />
        </TabsContent>

        <TabsContent value="changes" className="mt-0">
          <AdminChangeManagement />
        </TabsContent>

        <TabsContent value="reports" className="mt-0">
          <ReportingDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}