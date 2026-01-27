/**
 * Menu & Actions Panel for Customer Portal (Desktop 3-column layout)
 * Contains: Menu & Pricing, Caterer Notes, and Customer Actions
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EstimateLineItems } from './EstimateLineItems';
import { CustomerActions } from './CustomerActions';
import { MessageSquare, Info } from 'lucide-react';

interface MenuActionsPanelProps {
  lineItems: Array<{
    id: string;
    title: string | null;
    description: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    category: string | null;
  }>;
  subtotal: number;
  taxAmount: number;
  total: number;
  notes: string | null;
  invoiceId: string;
  customerEmail: string;
  workflowStatus: string;
  quoteRequestId: string | null;
  amountPaid: number;
  onStatusChange: () => void;
  autoApprove?: boolean;
}

export function MenuActionsPanel({
  lineItems,
  subtotal,
  taxAmount,
  total,
  notes,
  invoiceId,
  customerEmail,
  workflowStatus,
  quoteRequestId,
  amountPaid,
  onStatusChange,
  autoApprove,
}: MenuActionsPanelProps) {
  return (
    <div className="space-y-6">
      {/* Line Items Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Your Menu & Pricing</CardTitle>
        </CardHeader>
        <CardContent>
          <EstimateLineItems
            lineItems={lineItems}
            subtotal={subtotal}
            taxAmount={taxAmount}
            total={total}
          />
        </CardContent>
      </Card>

      {/* Customer Notes from Caterer */}
      {notes && (
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <MessageSquare className="h-4 w-4" />
              Notes from Soul Train's
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-amber-800 dark:text-amber-300">{notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Actions Card */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          {['sent', 'viewed'].includes(workflowStatus) && (
            <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg border border-border/50">
              <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-sm text-muted-foreground">
                By approving this estimate, you agree to our <strong>Terms & Conditions</strong>.
              </p>
            </div>
          )}
          
          <CustomerActions
            invoiceId={invoiceId}
            customerEmail={customerEmail}
            status={workflowStatus}
            quoteRequestId={quoteRequestId}
            amountPaid={amountPaid}
            onStatusChange={onStatusChange}
            autoApprove={autoApprove}
          />
        </CardContent>
      </Card>
    </div>
  );
}
