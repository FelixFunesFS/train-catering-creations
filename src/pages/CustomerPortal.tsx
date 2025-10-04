import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, CreditCard, CheckCircle, Clock, AlertCircle,
  Download, MessageSquare, Calendar
} from 'lucide-react';

export default function CustomerPortal() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState<any>(null);
  const [invoice, setInvoice] = useState<any>(null);
  const [contract, setContract] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<any>(null);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      toast({
        title: "Access Denied",
        description: "Invalid or missing access token",
        variant: "destructive"
      });
      navigate('/');
      return;
    }

    loadPortalData();
  }, [token]);

  const loadPortalData = async () => {
    try {
      // Find invoice by token
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select(`
          *,
          quote_requests!quote_request_id (*)
        `)
        .eq('customer_access_token', token)
        .single();

      if (invoiceError) throw invoiceError;

      setInvoice(invoiceData);
      setQuote(invoiceData.quote_requests);

      // Track portal access
      await supabase
        .from('invoices')
        .update({
          portal_last_accessed: new Date().toISOString(),
          portal_access_count: (invoiceData.portal_access_count || 0) + 1
        })
        .eq('id', invoiceData.id);

      // Load contract if exists
      const { data: contractData } = await supabase
        .from('contracts')
        .select('*')
        .eq('invoice_id', invoiceData.id)
        .maybeSingle();

      setContract(contractData);

      // Load payment status
      const { data: transactions } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('invoice_id', invoiceData.id)
        .eq('status', 'completed');

      const totalPaid = transactions?.reduce((sum, t) => sum + t.amount, 0) || 0;
      setPaymentStatus({
        totalPaid,
        amountDue: invoiceData.total_amount - totalPaid,
        isPaid: totalPaid >= invoiceData.total_amount
      });

    } catch (error) {
      console.error('Error loading portal data:', error);
      toast({
        title: "Error",
        description: "Failed to load your event details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getWorkflowStatus = () => {
    if (paymentStatus?.isPaid) return { label: 'Confirmed', color: 'bg-green-500', icon: CheckCircle };
    if (contract?.status === 'signed') return { label: 'Contract Signed', color: 'bg-blue-500', icon: FileText };
    if (invoice?.status === 'sent') return { label: 'Awaiting Your Action', color: 'bg-orange-500', icon: AlertCircle };
    return { label: 'In Progress', color: 'bg-gray-500', icon: Clock };
  };

  const formatCurrency = (cents: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <Card className="w-full max-w-md">
          <CardContent className="py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            <p className="mt-4">Loading your event details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!quote || !invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <Card className="w-full max-w-md">
          <CardContent className="py-8 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">Unable to find your event details</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = getWorkflowStatus();
  const StatusIcon = status.icon;

  return (
    <div className="min-h-screen bg-muted p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-t-4 border-t-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Soul Train's Eatery</CardTitle>
                <p className="text-muted-foreground">Customer Portal</p>
              </div>
              <Badge className={`${status.color} text-white`}>
                <StatusIcon className="w-4 h-4 mr-1" />
                {status.label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">{quote.event_name}</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{new Date(quote.event_date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-muted-foreground">{quote.location}</p>
                  <p className="text-muted-foreground">{quote.guest_count} guests</p>
                </div>
              </div>
              <div className="text-right md:text-left">
                <p className="text-sm text-muted-foreground">Total Estimate</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(invoice.total_amount)}</p>
                {paymentStatus && !paymentStatus.isPaid && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Amount Due: {formatCurrency(paymentStatus.amountDue)}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Items */}
        <Card>
          <CardHeader>
            <CardTitle>What You Need to Do</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {invoice.status === 'sent' && !contract && (
              <div className="flex items-center gap-3 p-4 border rounded-lg bg-orange-50 dark:bg-orange-950">
                <FileText className="w-8 h-8 text-orange-600" />
                <div className="flex-1">
                  <h4 className="font-semibold">Review Your Estimate</h4>
                  <p className="text-sm text-muted-foreground">Please review the pricing and details</p>
                </div>
                <Button>View Details</Button>
              </div>
            )}

            {contract && contract.status !== 'signed' && (
              <div className="flex items-center gap-3 p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
                <FileText className="w-8 h-8 text-blue-600" />
                <div className="flex-1">
                  <h4 className="font-semibold">Sign Your Contract</h4>
                  <p className="text-sm text-muted-foreground">Your contract is ready for signature</p>
                </div>
                <Button>Sign Now</Button>
              </div>
            )}

            {paymentStatus && !paymentStatus.isPaid && contract?.status === 'signed' && (
              <div className="flex items-center gap-3 p-4 border rounded-lg bg-green-50 dark:bg-green-950">
                <CreditCard className="w-8 h-8 text-green-600" />
                <div className="flex-1">
                  <h4 className="font-semibold">Make Payment</h4>
                  <p className="text-sm text-muted-foreground">
                    Complete your payment to confirm your event
                  </p>
                </div>
                <Button>Pay Now</Button>
              </div>
            )}

            {paymentStatus?.isPaid && (
              <div className="flex items-center gap-3 p-4 border rounded-lg bg-green-50 dark:bg-green-950">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div className="flex-1">
                  <h4 className="font-semibold">All Set!</h4>
                  <p className="text-sm text-muted-foreground">Your event is confirmed and ready to go</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          <Button variant="outline" className="h-auto py-4 flex-col gap-2">
            <Download className="w-6 h-6" />
            <span>Download Estimate</span>
          </Button>
          
          <Button variant="outline" className="h-auto py-4 flex-col gap-2">
            <MessageSquare className="w-6 h-6" />
            <span>Request Changes</span>
          </Button>
          
          <Button variant="outline" className="h-auto py-4 flex-col gap-2">
            <FileText className="w-6 h-6" />
            <span>View Documents</span>
          </Button>
        </div>

        {/* Contact */}
        <Card>
          <CardContent className="py-6">
            <p className="text-center text-muted-foreground">
              Questions? Contact us at <strong>(843) 970-0265</strong> or{' '}
              <strong>soultrainseatery@gmail.com</strong>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
