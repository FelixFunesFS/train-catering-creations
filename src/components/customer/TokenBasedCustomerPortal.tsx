import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { EstimatePreviewCard } from './EstimatePreviewCard';
import { 
  CheckCircle, 
  Clock, 
  FileText, 
  Download,
  CreditCard,
  MessageSquare,
  Star,
  Edit,
  AlertCircle
} from 'lucide-react';

interface CustomerData {
  quote?: any;
  invoice?: any;
  customer?: any;
}

export function TokenBasedCustomerPortal() {
  const { token } = useParams();
  const [data, setData] = useState<CustomerData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (token) {
      fetchCustomerData();
    }
  }, [token]);

  const fetchCustomerData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch invoice by token with explicit relationship specification
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select(`
          *,
          customers(*),
          quote_requests(*)
        `)
        .eq('customer_access_token', token)
        .single();

      if (invoiceError) {
        console.error('Invoice fetch error:', invoiceError);
        throw new Error('Invalid access link. Please check your email for the correct link.');
      }

      if (!invoice) {
        throw new Error('Estimate not found. Please check your email for the correct link.');
      }

      const customerData: CustomerData = {
        invoice,
        quote: invoice.quote_requests,
        customer: invoice.customers
      };

      setData(customerData);
    } catch (error: any) {
      console.error('Error fetching customer data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveEstimate = async () => {
    if (!data.invoice) return;

    try {
      const { error } = await supabase
        .from('invoices')
        .update({ status: 'approved' })
        .eq('id', data.invoice.id);

      if (error) throw error;

      toast({
        title: "Estimate Approved!",
        description: "Thank you! We'll prepare your contract and contact you shortly.",
      });

      fetchCustomerData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve estimate. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleRequestChanges = () => {
    toast({
      title: "Contact Us",
      description: "Please call us at (843) 970-0265 to discuss changes to your estimate.",
    });
  };

  const handleMakePayment = () => {
    toast({
      title: "Payment Processing",
      description: "Payment functionality will be available soon. Please contact us to arrange payment.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your estimate...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Access Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{error}</p>
            <p className="text-sm text-muted-foreground">
              If you continue to have issues, please contact us at{' '}
              <a href="tel:8439700265" className="text-primary hover:underline">
                (843) 970-0265
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data.invoice) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Estimate Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We couldn't find your estimate. Please check your email for the correct link.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Soul Train's Eatery</h1>
              <p className="text-muted-foreground">Your Estimate Portal</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Estimate #</p>
              <p className="font-mono text-lg">{data.invoice.invoice_number || 'DRAFT'}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <EstimatePreviewCard
          invoice={data.invoice}
          quote={data.quote}
          onViewEstimate={() => {}}
          onRequestChanges={handleRequestChanges}
          onMakePayment={handleMakePayment}
          onApprove={handleApproveEstimate}
        />

        {/* Contact Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium">Phone</p>
                <p className="text-muted-foreground">(843) 970-0265</p>
              </div>
              <div>
                <p className="font-medium">Email</p>
                <p className="text-muted-foreground">soultrainseatery@gmail.com</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Proudly serving Charleston's Lowcountry and surrounding areas.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}