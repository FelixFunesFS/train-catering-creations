import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, FileText, History } from 'lucide-react';
import { PaymentProcessingDashboard } from '../PaymentProcessingDashboard';
import { AdminChangeManagement } from '../AdminChangeManagement';
import { ReportingDashboard } from './ReportingDashboard';

type BillingTab = 'payments' | 'changes' | 'reports';

export function BillingHub() {
  const [activeTab, setActiveTab] = useState<BillingTab>('payments');

  return (
    <div className="container mx-auto px-4 py-6">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as BillingTab)} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="payments" className="gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Payments</span>
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
