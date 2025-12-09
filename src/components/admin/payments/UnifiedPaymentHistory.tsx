import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Download, 
  CreditCard, 
  Banknote, 
  Building2, 
  CheckCircle2,
  Clock,
  XCircle,
  Loader2
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';

interface PaymentRecord {
  id: string;
  invoice_id: string;
  amount: number;
  payment_method: string | null;
  payment_type: string;
  status: string;
  processed_at: string | null;
  created_at: string;
  description: string | null;
  customer_email: string;
  stripe_payment_intent_id: string | null;
  invoice_number?: string;
  contact_name?: string;
  event_name?: string;
}

interface UnifiedPaymentHistoryProps {
  invoiceId?: string; // Optional - if provided, filter to single invoice
}

export function UnifiedPaymentHistory({ invoiceId }: UnifiedPaymentHistoryProps) {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchPayments();
  }, [invoiceId]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('payment_transactions')
        .select(`
          id,
          invoice_id,
          amount,
          payment_method,
          payment_type,
          status,
          processed_at,
          created_at,
          description,
          customer_email,
          stripe_payment_intent_id
        `)
        .order('created_at', { ascending: false });

      if (invoiceId) {
        query = query.eq('invoice_id', invoiceId);
      }

      const { data: transactionsData, error } = await query;
      if (error) throw error;

      // Fetch invoice details for each transaction
      if (transactionsData && transactionsData.length > 0) {
        const invoiceIds = [...new Set(transactionsData.map(t => t.invoice_id).filter(Boolean))];
        
        const { data: invoicesData } = await supabase
          .from('invoices')
          .select('id, invoice_number, quote_request_id')
          .in('id', invoiceIds);

        const quoteIds = invoicesData?.map(i => i.quote_request_id).filter(Boolean) || [];
        
        const { data: quotesData } = await supabase
          .from('quote_requests')
          .select('id, contact_name, event_name')
          .in('id', quoteIds);

        // Merge data
        const enrichedPayments = transactionsData.map(payment => {
          const invoice = invoicesData?.find(i => i.id === payment.invoice_id);
          const quote = quotesData?.find(q => q.id === invoice?.quote_request_id);
          return {
            ...payment,
            invoice_number: invoice?.invoice_number,
            contact_name: quote?.contact_name,
            event_name: quote?.event_name
          };
        });

        setPayments(enrichedPayments);
      } else {
        setPayments([]);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load payment history',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payment.contact_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (payment.event_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (payment.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesMethod = methodFilter === 'all' || payment.payment_method === methodFilter;
    
    return matchesSearch && matchesStatus && matchesMethod;
  });

  const exportToCSV = () => {
    const headers = ['Date', 'Invoice', 'Customer', 'Event', 'Amount', 'Method', 'Status', 'Reference'];
    const rows = filteredPayments.map(p => [
      p.processed_at ? format(new Date(p.processed_at), 'yyyy-MM-dd HH:mm') : format(new Date(p.created_at), 'yyyy-MM-dd HH:mm'),
      p.invoice_number || '-',
      p.contact_name || p.customer_email,
      p.event_name || '-',
      (p.amount / 100).toFixed(2),
      p.payment_method || p.payment_type,
      p.status,
      p.stripe_payment_intent_id || p.description || '-'
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment-history-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({ title: 'Exported', description: 'Payment history exported to CSV' });
  };

  const getMethodIcon = (method: string | null) => {
    switch (method) {
      case 'card':
        return <CreditCard className="h-4 w-4" />;
      case 'cash':
        return <Banknote className="h-4 w-4" />;
      case 'bank_transfer':
      case 'check':
        return <Building2 className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/10 text-green-600 gap-1"><CheckCircle2 className="h-3 w-3" /> Completed</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const totalAmount = filteredPayments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Payment History</CardTitle>
          <Button variant="outline" size="sm" onClick={exportToCSV} className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by customer, event, invoice..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={methodFilter} onValueChange={setMethodFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="card">Card</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="check">Check</SelectItem>
              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredPayments.length > 0 && (
          <div className="flex items-center justify-between pt-4 text-sm">
            <span className="text-muted-foreground">
              {filteredPayments.length} transaction{filteredPayments.length !== 1 ? 's' : ''}
            </span>
            <span className="font-medium">
              Total: {formatCurrency(totalAmount / 100)}
            </span>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {filteredPayments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No payments found
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPayments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-muted rounded-lg">
                    {getMethodIcon(payment.payment_method)}
                  </div>
                  <div>
                    <div className="font-medium">
                      {payment.contact_name || payment.customer_email}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {payment.event_name && <span>{payment.event_name} • </span>}
                      {payment.invoice_number || 'No invoice'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {payment.processed_at 
                        ? format(new Date(payment.processed_at), 'MMM dd, yyyy h:mm a')
                        : format(new Date(payment.created_at), 'MMM dd, yyyy h:mm a')
                      }
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-lg">
                    {formatCurrency(payment.amount / 100)}
                  </div>
                  <div className="mt-1">
                    {getStatusBadge(payment.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}