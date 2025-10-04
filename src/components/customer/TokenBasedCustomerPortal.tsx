import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { EstimateApprovalWorkflow } from './EstimateApprovalWorkflow';
import { ChangeRequestForm } from './ChangeRequestForm';
import { PaymentInterface } from './PaymentInterface';
import { 
  CheckCircle, 
  Clock, 
  FileText, 
  Download,
  CreditCard,
  MessageSquare,
  Star,
  Edit,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';

interface CustomerData {
  quote?: any;
  invoice?: any;
  customer?: any;
}

export function TokenBasedCustomerPortal() {
  const { token: paramToken } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || paramToken; // Support both URL structures
  const action = searchParams.get('action');
  const [data, setData] = useState<CustomerData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showChangeForm, setShowChangeForm] = useState(false);
  const [actionExecuted, setActionExecuted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (token) {
      fetchCustomerData();
    }
  }, [token]);

  // Handle automatic actions from URL - only execute once
  useEffect(() => {
    if (data.invoice && action && !actionExecuted) {
      setActionExecuted(true);
      if (action === 'approve' && data.invoice.status !== 'approved') {
        handleApproveEstimate();
      } else if (action === 'changes') {
        setShowChangeForm(true);
        toast({
          title: "Request Changes",
          description: "Fill out the form below to request modifications to your estimate.",
          duration: 4000,
        });
      }
    }
  }, [data.invoice, action, actionExecuted]);

  const fetchCustomerData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch invoice by token with explicit relationship specification
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select(`
          id,
          invoice_number,
          status,
          total_amount,
          is_draft,
          created_at,
          due_date,
          customer_id,
          quote_request_id
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

      // Fetch related customer and quote separately to avoid type issues
      let customer = null;
      let quote = null;

      if (invoice.customer_id) {
        const { data: customerData } = await supabase
          .from('customers')
          .select('*')
          .eq('id', invoice.customer_id)
          .single();
        customer = customerData;
      }

      if (invoice.quote_request_id) {
        const { data: quoteData } = await supabase
          .from('quote_requests')
          .select('*')
          .eq('id', invoice.quote_request_id)
          .single();
        quote = quoteData;
      }

      // Structure data to match EstimateApprovalWorkflow expectations
      const structuredInvoice = {
        ...invoice,
        quote_requests: quote || {}
      };

      const customerData: CustomerData = {
        invoice: structuredInvoice,
        quote,
        customer
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
    setShowChangeForm(true);
  };

  const handleMakePayment = () => {
    toast({
      title: "Payment Processing",
      description: "Payment functionality will be available soon. Please contact us to arrange payment.",
    });
  };

  const handleChangeRequestSubmitted = () => {
    setShowChangeForm(false);
    toast({
      title: "Request Submitted Successfully",
      description: "We'll review your changes and get back to you within 24 hours.",
      duration: 5000,
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

  // Show change request form when requested
  if (showChangeForm && data.quote) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b border-border">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Soul Train's Eatery</h1>
                <p className="text-muted-foreground">Request Changes</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Estimate #</p>
                <p className="font-mono text-lg">{data.invoice.invoice_number || 'DRAFT'}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => setShowChangeForm(false)}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Estimate
          </Button>
          
          {/* Current Estimate Summary */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Current Estimate Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Date:</span>
                  <p className="text-muted-foreground">
                    {data.quote.event_date ? new Date(data.quote.event_date).toLocaleDateString() : 'Not set'}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Time:</span>
                  <p className="text-muted-foreground">{data.quote.start_time || 'Not set'}</p>
                </div>
                <div>
                  <span className="font-medium">Guests:</span>
                  <p className="text-muted-foreground">{data.quote.guest_count}</p>
                </div>
                <div>
                  <span className="font-medium">Location:</span>
                  <p className="text-muted-foreground">{data.quote.location}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <ChangeRequestForm 
            quote={data.quote}
            invoice={data.invoice}
            onRequestSubmitted={handleChangeRequestSubmitted}
          />
        </main>
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
        {/* Show payment interface if approved, otherwise show approval workflow */}
        {data.invoice.status === 'approved' || data.invoice.status === 'paid' ? (
          <div className="space-y-6">
            <PaymentInterface 
              invoiceId={data.invoice.id} 
              accessToken={token}
            />
            
            {data.invoice.status !== 'paid' && (
              <Card>
                <CardHeader>
                  <CardTitle>Need Changes?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    If you need to make changes to your estimate, you can request modifications below.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowChangeForm(true)}
                  >
                    Request Changes
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <EstimateApprovalWorkflow
            estimate={data.invoice}
            onApproval={() => {
              fetchCustomerData();
              toast({
                title: "Success!",
                description: "Your estimate has been approved. Payment options are shown below.",
              });
            }}
            onRejection={() => {
              setShowChangeForm(true);
            }}
          />
        )}

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