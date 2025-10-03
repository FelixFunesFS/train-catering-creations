import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { EnhancedEstimateLineItems } from '../EnhancedEstimateLineItems';
import { IntegratedChangeRequestPanel } from './IntegratedChangeRequestPanel';

interface Quote {
  id: string;
  event_name: string;
  contact_name: string;
  event_date: string;
  guest_count: number;
  location: string;
  status?: string;
}

interface Invoice {
  id: string;
  quote_request_id: string;
  status: string;
}

interface LineItem {
  id?: string;
  title: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  category: string;
}

interface PricingPanelProps {
  quote: Quote;
  invoice: Invoice | null;
  lineItems: LineItem[];
  totals: { subtotal: number; tax_amount: number; total_amount: number };
  isModified: boolean;
  isGovernmentContract: boolean;
  loading: boolean;
  onGenerateInvoice: () => void;
  onSavePricing: () => void;
  onBack: () => void;
  onGovernmentToggle: () => void;
  onChangeProcessed: () => void;
  updateLineItem: (id: string, updates: Partial<LineItem>) => void;
  addLineItem: () => void;
  removeLineItem: (id: string) => void;
  addTemplateItem: (template: any) => void;
  triggerAutoSave: () => void;
  quickCalculatePerPerson: (guestCount: number) => void;
}

export function PricingPanel({
  quote,
  invoice,
  lineItems,
  totals,
  isModified,
  isGovernmentContract,
  loading,
  onGenerateInvoice,
  onSavePricing,
  onBack,
  onGovernmentToggle,
  onChangeProcessed,
  updateLineItem,
  addLineItem,
  removeLineItem,
  addTemplateItem,
  triggerAutoSave,
  quickCalculatePerPerson
}: PricingPanelProps) {
  return (
    <div className="space-y-6">
      {/* Change Requests Panel */}
      {invoice && (
        <IntegratedChangeRequestPanel 
          invoiceId={invoice.id}
          onChangeProcessed={onChangeProcessed}
        />
      )}

      {/* Quote Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Pricing for {quote.event_name}</span>
            <Badge variant="outline">{quote.status}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="font-medium">Contact</div>
              <div className="text-muted-foreground">{quote.contact_name}</div>
            </div>
            <div>
              <div className="font-medium">Event Date</div>
              <div className="text-muted-foreground">
                {format(new Date(quote.event_date), 'PPP')}
              </div>
            </div>
            <div>
              <div className="font-medium">Guest Count</div>
              <div className="text-muted-foreground">{quote.guest_count} guests</div>
            </div>
            <div>
              <div className="font-medium">Location</div>
              <div className="text-muted-foreground">{quote.location}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Management */}
      {!invoice ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-muted-foreground">No invoice exists for this quote.</div>
              <Button onClick={onGenerateInvoice} disabled={loading}>
                Generate Invoice
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <EnhancedEstimateLineItems
          lineItems={lineItems.map(item => ({ ...item, id: item.id || '' }))}
          updateLineItem={updateLineItem}
          addLineItem={addLineItem}
          removeLineItem={removeLineItem}
          addTemplateItem={addTemplateItem}
          subtotal={totals.subtotal}
          taxAmount={totals.tax_amount}
          grandTotal={totals.total_amount}
          guestCount={quote.guest_count}
          isModified={isModified}
          triggerAutoSave={triggerAutoSave}
          quickCalculatePerPerson={() => quickCalculatePerPerson(quote.guest_count)}
          isGovernmentContract={isGovernmentContract}
          onGovernmentToggle={onGovernmentToggle}
        />
      )}

      {invoice && (
        <div className="flex gap-3">
          <Button onClick={onBack} variant="outline">
            Back to Quotes
          </Button>
          <Button 
            onClick={onSavePricing} 
            disabled={!lineItems.length || totals.total_amount === 0}
          >
            Save & Continue to Review
          </Button>
        </div>
      )}
    </div>
  );
}
