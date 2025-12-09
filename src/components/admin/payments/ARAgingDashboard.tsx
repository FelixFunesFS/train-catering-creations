import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Mail, 
  Download,
  Loader2,
  DollarSign,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { format, differenceInDays } from 'date-fns';
import { ManualPaymentForm } from './ManualPaymentForm';

interface InvoiceSummary {
  invoice_id: string;
  invoice_number: string | null;
  total_amount: number;
  due_date: string | null;
  workflow_status: string;
  total_paid: number;
  balance_remaining: number;
  days_overdue: number;
  contact_name: string | null;
  email: string | null;
  event_name: string | null;
  event_date: string | null;
  last_reminder_sent_at: string | null;
  reminder_count: number | null;
}

type AgingBucket = 'current' | '1-30' | '31-60' | '60+';

export function ARAgingDashboard() {
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBucket, setSelectedBucket] = useState<AgingBucket | 'all'>('all');
  const [sendingReminder, setSendingReminder] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchInvoiceSummaries();
  }, []);

  const fetchInvoiceSummaries = async () => {
    try {
      setLoading(true);
      
      // Fetch invoices with payment data
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select(`
          id,
          invoice_number,
          total_amount,
          due_date,
          workflow_status,
          last_reminder_sent_at,
          reminder_count,
          quote_request_id
        `)
        .not('workflow_status', 'in', '("paid","cancelled","draft")')
        .order('due_date', { ascending: true });

      if (invoicesError) throw invoicesError;

      if (!invoicesData || invoicesData.length === 0) {
        setInvoices([]);
        return;
      }

      // Get payment totals
      const { data: paymentsData } = await supabase
        .from('payment_transactions')
        .select('invoice_id, amount')
        .eq('status', 'completed')
        .in('invoice_id', invoicesData.map(i => i.id));

      // Get quote details
      const quoteIds = invoicesData.map(i => i.quote_request_id).filter(Boolean);
      const { data: quotesData } = await supabase
        .from('quote_requests')
        .select('id, contact_name, email, event_name, event_date')
        .in('id', quoteIds);

      // Calculate summaries
      const summaries: InvoiceSummary[] = invoicesData.map(inv => {
        const payments = paymentsData?.filter(p => p.invoice_id === inv.id) || [];
        const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
        const quote = quotesData?.find(q => q.id === inv.quote_request_id);
        
        let daysOverdue = 0;
        if (inv.due_date && !['paid', 'cancelled'].includes(inv.workflow_status)) {
          daysOverdue = Math.max(0, differenceInDays(new Date(), new Date(inv.due_date)));
        }

        return {
          invoice_id: inv.id,
          invoice_number: inv.invoice_number,
          total_amount: inv.total_amount,
          due_date: inv.due_date,
          workflow_status: inv.workflow_status,
          total_paid: totalPaid,
          balance_remaining: inv.total_amount - totalPaid,
          days_overdue: daysOverdue,
          contact_name: quote?.contact_name || null,
          email: quote?.email || null,
          event_name: quote?.event_name || null,
          event_date: quote?.event_date || null,
          last_reminder_sent_at: inv.last_reminder_sent_at,
          reminder_count: inv.reminder_count
        };
      });

      setInvoices(summaries.filter(s => s.balance_remaining > 0));
    } catch (error) {
      console.error('Error fetching AR data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load accounts receivable data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getBucket = (daysOverdue: number): AgingBucket => {
    if (daysOverdue <= 0) return 'current';
    if (daysOverdue <= 30) return '1-30';
    if (daysOverdue <= 60) return '31-60';
    return '60+';
  };

  const bucketStats = {
    current: invoices.filter(i => getBucket(i.days_overdue) === 'current'),
    '1-30': invoices.filter(i => getBucket(i.days_overdue) === '1-30'),
    '31-60': invoices.filter(i => getBucket(i.days_overdue) === '31-60'),
    '60+': invoices.filter(i => getBucket(i.days_overdue) === '60+')
  };

  const filteredInvoices = selectedBucket === 'all' 
    ? invoices 
    : invoices.filter(i => getBucket(i.days_overdue) === selectedBucket);

  const sendReminder = async (invoice: InvoiceSummary) => {
    if (!invoice.email) {
      toast({
        title: 'No Email',
        description: 'No email address found for this customer',
        variant: 'destructive'
      });
      return;
    }

    setSendingReminder(invoice.invoice_id);
    
    try {
      const { error } = await supabase.functions.invoke('send-payment-reminder', {
        body: {
          invoiceId: invoice.invoice_id,
          customerEmail: invoice.email,
          customerName: invoice.contact_name,
          eventName: invoice.event_name,
          balanceRemaining: invoice.balance_remaining,
          daysOverdue: invoice.days_overdue,
          urgency: invoice.days_overdue > 30 ? 'high' : invoice.days_overdue > 0 ? 'medium' : 'low'
        }
      });

      if (error) throw error;

      // Update reminder tracking
      await supabase
        .from('invoices')
        .update({
          last_reminder_sent_at: new Date().toISOString(),
          reminder_count: (invoice.reminder_count || 0) + 1
        })
        .eq('id', invoice.invoice_id);

      toast({
        title: 'Reminder Sent',
        description: `Payment reminder sent to ${invoice.email}`
      });

      fetchInvoiceSummaries();
    } catch (error) {
      console.error('Error sending reminder:', error);
      toast({
        title: 'Error',
        description: 'Failed to send payment reminder',
        variant: 'destructive'
      });
    } finally {
      setSendingReminder(null);
    }
  };

  const exportToCSV = () => {
    const headers = ['Invoice', 'Customer', 'Event', 'Event Date', 'Due Date', 'Total', 'Paid', 'Balance', 'Days Overdue', 'Status'];
    const rows = filteredInvoices.map(i => [
      i.invoice_number || '-',
      i.contact_name || i.email || '-',
      i.event_name || '-',
      i.event_date ? format(new Date(i.event_date), 'yyyy-MM-dd') : '-',
      i.due_date ? format(new Date(i.due_date), 'yyyy-MM-dd') : '-',
      (i.total_amount / 100).toFixed(2),
      (i.total_paid / 100).toFixed(2),
      (i.balance_remaining / 100).toFixed(2),
      i.days_overdue,
      i.workflow_status
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ar-aging-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const totalAR = invoices.reduce((sum, i) => sum + i.balance_remaining, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Accounts Receivable</h2>
          <p className="text-muted-foreground">
            Total Outstanding: <span className="font-semibold text-foreground">{formatCurrency(totalAR / 100)}</span>
          </p>
        </div>
        <Button variant="outline" onClick={exportToCSV} className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Aging Buckets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card 
          className={`cursor-pointer transition-all ${selectedBucket === 'current' ? 'ring-2 ring-primary' : 'hover:bg-muted/50'}`}
          onClick={() => setSelectedBucket(selectedBucket === 'current' ? 'all' : 'current')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Current</span>
            </div>
            <div className="text-xl font-bold">
              {formatCurrency(bucketStats.current.reduce((s, i) => s + i.balance_remaining, 0) / 100)}
            </div>
            <div className="text-xs text-muted-foreground">{bucketStats.current.length} invoices</div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all ${selectedBucket === '1-30' ? 'ring-2 ring-primary' : 'hover:bg-muted/50'}`}
          onClick={() => setSelectedBucket(selectedBucket === '1-30' ? 'all' : '1-30')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium">1-30 Days</span>
            </div>
            <div className="text-xl font-bold">
              {formatCurrency(bucketStats['1-30'].reduce((s, i) => s + i.balance_remaining, 0) / 100)}
            </div>
            <div className="text-xs text-muted-foreground">{bucketStats['1-30'].length} invoices</div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all ${selectedBucket === '31-60' ? 'ring-2 ring-primary' : 'hover:bg-muted/50'}`}
          onClick={() => setSelectedBucket(selectedBucket === '31-60' ? 'all' : '31-60')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">31-60 Days</span>
            </div>
            <div className="text-xl font-bold">
              {formatCurrency(bucketStats['31-60'].reduce((s, i) => s + i.balance_remaining, 0) / 100)}
            </div>
            <div className="text-xs text-muted-foreground">{bucketStats['31-60'].length} invoices</div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all ${selectedBucket === '60+' ? 'ring-2 ring-primary' : 'hover:bg-muted/50'}`}
          onClick={() => setSelectedBucket(selectedBucket === '60+' ? 'all' : '60+')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium">60+ Days</span>
            </div>
            <div className="text-xl font-bold text-red-600">
              {formatCurrency(bucketStats['60+'].reduce((s, i) => s + i.balance_remaining, 0) / 100)}
            </div>
            <div className="text-xs text-muted-foreground">{bucketStats['60+'].length} invoices</div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>
              {selectedBucket === 'all' ? 'All Outstanding' : `${selectedBucket} Days Overdue`}
            </span>
            {selectedBucket !== 'all' && (
              <Button variant="ghost" size="sm" onClick={() => setSelectedBucket('all')}>
                Show All
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No outstanding invoices in this category
            </div>
          ) : (
            <div className="space-y-3">
              {filteredInvoices.map((invoice) => (
                <div
                  key={invoice.invoice_id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium truncate">{invoice.contact_name || invoice.email}</span>
                      {invoice.days_overdue > 0 && (
                        <Badge variant={invoice.days_overdue > 30 ? 'destructive' : 'secondary'}>
                          {invoice.days_overdue} days overdue
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {invoice.invoice_number || 'No #'}
                      </span>
                      {invoice.event_name && (
                        <span className="truncate">{invoice.event_name}</span>
                      )}
                      {invoice.due_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Due: {format(new Date(invoice.due_date), 'MMM dd')}
                        </span>
                      )}
                    </div>
                    {invoice.reminder_count && invoice.reminder_count > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {invoice.reminder_count} reminder{invoice.reminder_count !== 1 ? 's' : ''} sent
                        {invoice.last_reminder_sent_at && (
                          <span> • Last: {format(new Date(invoice.last_reminder_sent_at), 'MMM dd')}</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-lg font-semibold">
                        {formatCurrency(invoice.balance_remaining / 100)}
                      </div>
                      {invoice.total_paid > 0 && (
                        <div className="text-xs text-muted-foreground">
                          of {formatCurrency(invoice.total_amount / 100)}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <ManualPaymentForm
                        invoiceId={invoice.invoice_id}
                        customerEmail={invoice.email || ''}
                        balanceRemaining={invoice.balance_remaining}
                        onPaymentRecorded={fetchInvoiceSummaries}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => sendReminder(invoice)}
                        disabled={sendingReminder === invoice.invoice_id}
                      >
                        {sendingReminder === invoice.invoice_id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Mail className="h-4 w-4" />
                        )}
                      </Button>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}