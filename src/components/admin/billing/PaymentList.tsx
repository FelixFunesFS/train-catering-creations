import { useState } from 'react';
import { format, isPast, parseISO } from 'date-fns';
import { useInvoices } from '@/hooks/useInvoices';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PaymentRecorder } from './PaymentRecorder';
import { PaymentHistory } from './PaymentHistory';
import { DollarSign, Calendar, Users, CreditCard, History, Clock, AlertTriangle } from 'lucide-react';

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

type StatusFilter = 'all' | 'awaiting' | 'partial' | 'overdue' | 'paid';

export function PaymentList() {
  const { data: invoices, isLoading } = useInvoices();
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [historyInvoiceId, setHistoryInvoiceId] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // Filter to show only sent/approved/payment-related invoices
  const paymentInvoices = invoices?.filter(inv => 
    ['sent', 'viewed', 'approved', 'payment_pending', 'partially_paid', 'paid', 'overdue'].includes(inv.workflow_status || '')
  ) || [];

  // Apply status filter
  const filteredInvoices = paymentInvoices.filter(inv => {
    switch (statusFilter) {
      case 'awaiting':
        return ['sent', 'viewed', 'approved', 'payment_pending'].includes(inv.workflow_status || '');
      case 'partial':
        return inv.workflow_status === 'partially_paid';
      case 'overdue':
        return inv.workflow_status === 'overdue';
      case 'paid':
        return inv.workflow_status === 'paid';
      default:
        return true;
    }
  });

  // Get next due milestone from invoice milestones
  const getNextMilestone = (milestones: any[] | null) => {
    if (!milestones || milestones.length === 0) return null;
    return milestones.find((m: any) => m.status === 'pending') || null;
  };

  // Check if a milestone is overdue
  const isMilestoneOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    return isPast(parseISO(dueDate));
  };

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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-lg font-semibold">Payment Tracking</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setHistoryInvoiceId(undefined);
            setShowHistory(true);
          }}
        >
          <History className="h-4 w-4 mr-2" />
          View All Transactions
        </Button>
      </div>

      {/* Status Filter Tabs */}
      <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all" className="text-xs sm:text-sm">
            All ({paymentInvoices.length})
          </TabsTrigger>
          <TabsTrigger value="awaiting" className="text-xs sm:text-sm">
            Awaiting ({paymentInvoices.filter(i => ['sent', 'viewed', 'approved', 'payment_pending'].includes(i.workflow_status || '')).length})
          </TabsTrigger>
          <TabsTrigger value="partial" className="text-xs sm:text-sm">
            Partial ({paymentInvoices.filter(i => i.workflow_status === 'partially_paid').length})
          </TabsTrigger>
          <TabsTrigger value="overdue" className="text-xs sm:text-sm">
            Overdue ({paymentInvoices.filter(i => i.workflow_status === 'overdue').length})
          </TabsTrigger>
          <TabsTrigger value="paid" className="text-xs sm:text-sm">
            Paid ({paymentInvoices.filter(i => i.workflow_status === 'paid').length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {filteredInvoices.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No Invoices Found</h3>
            <p className="text-muted-foreground text-sm mt-1">
              {statusFilter === 'all' 
                ? 'Sent estimates will appear here once customers receive them.'
                : `No invoices match the "${statusFilter}" filter.`}
            </p>
          </CardContent>
        </Card>
      ) : (
        filteredInvoices.map((invoice) => {
          const totalPaid = invoice.total_paid ?? 0;
          // Use nullish coalescing to properly handle 0 balance (fully paid)
          const balanceRemaining = invoice.balance_remaining ?? (invoice.total_amount ?? 0);
          const progressPercent = invoice.total_amount 
            ? Math.min(100, Math.round((totalPaid / invoice.total_amount) * 100))
            : 0;
          const nextMilestone = getNextMilestone(invoice.milestones as any[] | null);
          const milestoneOverdue = nextMilestone && isMilestoneOverdue(nextMilestone.due_date);

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

                {/* Next Milestone Due */}
                {nextMilestone && balanceRemaining > 0 && (
                  <div className={`flex items-center gap-3 p-3 rounded-lg ${milestoneOverdue ? 'bg-destructive/10' : 'bg-muted/50'}`}>
                    {milestoneOverdue ? (
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    ) : (
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div className="flex-1 text-sm">
                      <span className="font-medium">
                        {nextMilestone.milestone_type?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}:
                      </span>{' '}
                      <span className={milestoneOverdue ? 'text-destructive font-medium' : ''}>
                        {formatCurrency(nextMilestone.amount_cents || 0)}
                      </span>
                      {nextMilestone.due_date && (
                        <span className="text-muted-foreground">
                          {' '}• {milestoneOverdue ? 'Was due' : 'Due'} {format(parseISO(nextMilestone.due_date), 'MMM d, yyyy')}
                        </span>
                      )}
                    </div>
                  </div>
                )}

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
                <div className="flex gap-2 pt-2 flex-wrap">
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setHistoryInvoiceId(invoice.invoice_id || undefined);
                      setShowHistory(true);
                    }}
                  >
                    <History className="h-4 w-4 mr-2" />
                    History
                  </Button>
                  {balanceRemaining > 0 && invoice.workflow_status !== 'cancelled' && (
                    <Button 
                      size="sm"
                      onClick={() => setSelectedInvoiceId(invoice.invoice_id!)}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Record Payment
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })
      )}

      {/* Payment Recorder Modal */}
      {selectedInvoiceId && (
        <PaymentRecorder
          invoiceId={selectedInvoiceId}
          onClose={() => setSelectedInvoiceId(null)}
        />
      )}

      {/* Payment History Modal */}
      {showHistory && (
        <PaymentHistory 
          invoiceId={historyInvoiceId}
          onClose={() => {
            setShowHistory(false);
            setHistoryInvoiceId(undefined);
          }} 
        />
      )}
    </div>
  );
}
