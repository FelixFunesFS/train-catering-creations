import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, DollarSign, Calendar, ShoppingBag, CreditCard } from 'lucide-react';
import { ReportsFilterBar } from './ReportsFilterBar';
import { RevenueOverview } from './RevenueOverview';
import { EventAnalytics } from './EventAnalytics';
import { ItemsAnalysis } from './ItemsAnalysis';
import { PaymentAnalysis } from './PaymentAnalysis';
import {
  type ReportsFilters,
  getDefaultFilters,
  useInvoiceSummaryData,
  useQuoteRequestsData,
  useLineItemsData,
  usePaymentTransactionsData,
} from './useReportsData';

export function ReportsView() {
  const [filters, setFilters] = useState<ReportsFilters>(getDefaultFilters);

  const invoiceQuery = useInvoiceSummaryData(filters);
  const quotesQuery = useQuoteRequestsData(filters);
  const lineItemsQuery = useLineItemsData(filters);
  const transactionsQuery = usePaymentTransactionsData(filters);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <BarChart3 className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-semibold">Reports & Analytics</h1>
      </div>

      <ReportsFilterBar filters={filters} onChange={setFilters} />

      <Tabs defaultValue="revenue" className="space-y-4">
        <div className="overflow-x-auto -mx-4 px-4 pb-2 scrollbar-hide">
          <TabsList className="inline-flex w-max min-w-full sm:w-auto">
            <TabsTrigger value="revenue" className="gap-1.5 px-3 sm:px-4">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Revenue</span>
              <span className="sm:hidden">Rev</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="gap-1.5 px-3 sm:px-4">
              <Calendar className="h-4 w-4" />
              <span>Events</span>
            </TabsTrigger>
            <TabsTrigger value="items" className="gap-1.5 px-3 sm:px-4">
              <ShoppingBag className="h-4 w-4" />
              <span>Items</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-1.5 px-3 sm:px-4">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Payments</span>
              <span className="sm:hidden">Pay</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="revenue" className="mt-4">
          <RevenueOverview invoices={invoiceQuery.data ?? []} isLoading={invoiceQuery.isLoading} />
        </TabsContent>
        <TabsContent value="events" className="mt-4">
          <EventAnalytics quotes={quotesQuery.data ?? []} isLoading={quotesQuery.isLoading} />
        </TabsContent>
        <TabsContent value="items" className="mt-4">
          <ItemsAnalysis lineItems={lineItemsQuery.data ?? []} isLoading={lineItemsQuery.isLoading} />
        </TabsContent>
        <TabsContent value="payments" className="mt-4">
          <PaymentAnalysis
            transactions={transactionsQuery.data ?? []}
            invoices={invoiceQuery.data ?? []}
            isLoading={transactionsQuery.isLoading || invoiceQuery.isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
