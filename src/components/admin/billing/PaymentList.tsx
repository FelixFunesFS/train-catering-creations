import { useState } from 'react';
import { format } from 'date-fns';
import { useInvoices, usePaymentTransactions } from '@/hooks/useInvoices';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PaymentRecorder } from './PaymentRecorder';
import { PaymentHistory } from './PaymentHistory';
import { DollarSign, Calendar, Users, CreditCard, History } from 'lucide-react';

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

function getStatusBadge(status: string) {
  const variants: Record<string, { label: string; className: string }> = {
    draft: { label: 'Draft', className: 'bg-muted text-muted-foreground' },
    sent: { label: 'Sent', className: 'bg-blue-500/10 text-blue-700' },
    viewed: { label: 'Viewed', className: 'bg-amber-500/10 text-amber-700' },
    approved: { label: 'Approved', className: 'bg-green-500/10 text-green-700' },
    payment_pending: { label: 'Payment Pending', className: 'bg-orange-500/10 text-orange-700' },
    partially_paid: { label: 'Partially Paid', className: 'bg-purple-500/10 text-purple-700' },
    paid: { label: 'Paid', className: 'bg-emerald-500/10 text-emerald-700' },
    overdue: { label: 'Overdue', className: 'bg-destructive/10 text-destructive' },
    cancelled: { label: 'Cancelled', className: 'bg-muted text-muted-foreground' },
  };
  const v = variants[status] || { label: status, className: 'bg-muted text-muted-foreground' };
  return <Badge variant="outline" className={v.className}>{v.label}</Badge>;
}

export function PaymentList() {
  const { data: invoices, isLoading } = useInvoices();
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // Filter to show only sent/approved/payment-related invoices
  const paymentInvoices = invoices?.filter(inv => 
    ['sent', 'viewed', 'approved', 'payment_pending', 'partially_paid', 'paid', 'overdue'].includes(inv.workflow_status || '')
  ) || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (paymentInvoices.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No Invoices Pending Payment</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Sent estimates will appear here once customers receive them.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Payment Tracking</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowHistory(true)}
        >
          <History className="h-4 w-4 mr-2" />
          View All Transactions
        </Button>
      </div>

      {paymentInvoices.map((invoice) => {
        const totalPaid = invoice.total_paid || 0;
        const balanceRemaining = invoice.balance_remaining || (invoice.total_amount || 0);
        const progressPercent = invoice.total_amount 
          ? Math.min(100, Math.round((totalPaid / invoice.total_amount) * 100))
          : 0;

        return (
          <Card key={invoice.invoice_id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base font-medium">
                    {invoice.event_name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {invoice.contact_name} • {invoice.invoice_number}
                  </p>
                </div>
                {getStatusBadge(invoice.workflow_status || 'draft')}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Event & Payment Info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{invoice.event_date ? format(new Date(invoice.event_date), 'MMM d, yyyy') : 'TBD'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{invoice.guest_count} guests</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{formatCurrency(invoice.total_amount || 0)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className={balanceRemaining > 0 ? 'text-amber-600' : 'text-emerald-600'}>
                    {balanceRemaining > 0 ? `${formatCurrency(balanceRemaining)} due` : 'Paid'}
                  </span>
                </div>
              </div>

              {/* Payment Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment Progress</span>
                  <span className="font-medium">{progressPercent}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Paid: {formatCurrency(totalPaid)}</span>
                  <span>Remaining: {formatCurrency(balanceRemaining)}</span>
                </div>
              </div>

              {/* Actions */}
              {balanceRemaining > 0 && invoice.workflow_status !== 'cancelled' && (
                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm"
                    onClick={() => setSelectedInvoiceId(invoice.invoice_id!)}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Record Payment
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Payment Recorder Modal */}
      {selectedInvoiceId && (
        <PaymentRecorder
          invoiceId={selectedInvoiceId}
          onClose={() => setSelectedInvoiceId(null)}
        />
      )}

      {/* Payment History Modal */}
      {showHistory && (
        <PaymentHistory onClose={() => setShowHistory(false)} />
      )}
    </div>
  );
}
