import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { EstimateApprovalWorkflow } from './EstimateApprovalWorkflow';
import { ChangeRequestForm } from './ChangeRequestForm';
import { PaymentInterface } from './PaymentInterface';
import { EventCountdown } from './EventCountdown';
import { CustomerEventPortal } from './CustomerEventPortal';
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
  const { token: paramToken, invoiceId, invoiceToken } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Support multiple token sources and normalize to query param
  const queryToken = searchParams.get('token');
  const token = queryToken || paramToken || invoiceId || invoiceToken;
  const action = searchParams.get('action');
  const [data, setData] = useState<CustomerData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showChangeForm, setShowChangeForm] = useState(false);
  const [actionExecuted, setActionExecuted] = useState(false);
  const { toast } = useToast();

  // Redirect path params to query params for consistent URL format
  useEffect(() => {
    if (token && !queryToken) {
      navigate(`/estimate?token=${token}`, { replace: true });
    }
  }, [token, queryToken, navigate]);

  useEffect(() => {
    if (token) {
      fetchCustomerData();
      // Set up real-time subscription for invoice updates
      setupRealtimeSubscription();
    }
    
    return () => {
      // Cleanup subscription on unmount
      if (token) {
        supabase.removeAllChannels();
      }
    };
  }, [token]);

  // Handle automatic actions from URL - only execute once
  useEffect(() => {
    if (data.invoice && action && !actionExecuted) {
      setActionExecuted(true);
      if (action === 'approve' && data.invoice.workflow_status !== 'approved') {
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
    if (!token) {
      setError('No access token provided');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Use RPC function to get ALL data in one call
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_estimate_with_line_items', {
          access_token: token
        });

      if (rpcError || !rpcData || rpcData.length === 0) {
        throw new Error('Invalid or expired access link');
      }

      const result = rpcData[0];
      const invoice = result.invoice as any;
      const quote = result.quote as any;
      const lineItems = (result.line_items as any[]) || [];
      const milestones = (result.milestones as any[]) || [];

      // Structure data properly with line items included
      const structuredInvoice = {
        ...(typeof invoice === 'object' ? invoice : {}),
        invoice_line_items: lineItems,
        payment_milestones: milestones,
        quote_requests: quote
      };

      // Track access analytics
      await supabase.from('analytics_events').insert({
        event_type: 'estimate_accessed',
        entity_type: 'invoices',
        entity_id: invoice?.id,
        session_id: token,
        metadata: {
          invoice_number: invoice?.invoice_number,
          customer_email: quote?.email
        }
      });

      setData({
        invoice: structuredInvoice,
        quote,
        customer: null
      });
    } catch (error: any) {
      console.error('Error fetching customer data:', error);
      setError(error.message || 'Failed to load estimate');
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time subscription for invoice and quote updates
  const setupRealtimeSubscription = () => {
    if (!token) return;

    const channel = supabase
      .channel(`customer-portal-${token}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all changes (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'invoices',
        },
        (payload) => {
          console.log('Invoice updated in real-time:', payload);
          // Refresh data when invoice changes
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            toast({
              title: "Estimate Updated",
              description: "Your estimate has been updated. Refreshing...",
              duration: 3000,
            });
            fetchCustomerData();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'change_requests',
        },
        (payload) => {
          console.log('Change request updated in real-time:', payload);
          // Refresh when change request status changes
          if (payload.eventType === 'UPDATE') {
            const newRecord = payload.new as any;
            if (newRecord.status === 'approved' || newRecord.status === 'rejected') {
              toast({
                title: newRecord.status === 'approved' ? "Changes Approved!" : "Change Request Update",
                description: newRecord.status === 'approved' 
                  ? "Your requested changes have been approved and applied to your estimate."
                  : "Your change request has been reviewed.",
                duration: 5000,
              });
              fetchCustomerData();
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
      });

    return channel;
  };

  const handleViewDetails = () => {
    const detailsSection = document.getElementById('estimate-breakdown');
    detailsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSignContract = async () => {
    if (!data.invoice?.contract_id) {
      toast({
        title: "No Contract Available",
        description: "Please contact us for assistance.",
        variant: "destructive"
      });
      return;
    }
    
    navigate(`/customer/contract/${data.invoice.contract_id}?token=${token}`);
  };

  const handlePayment = async () => {
    if (!data.invoice?.id) return;
    
    try {
      const { data: paymentData, error } = await supabase.functions.invoke(
        'create-checkout-session',
        {
          body: {
            invoice_id: data.invoice.id,
            access_token: token,
            success_url: window.location.href,
            cancel_url: window.location.href
          }
        }
      );
      
      if (error) throw error;
      
      if (paymentData?.checkout_url) {
        window.location.href = paymentData.checkout_url;
      }
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "Unable to process payment. Please contact us.",
        variant: "destructive"
      });
    }
  };

  const handleDownloadEstimate = async () => {
    if (!data.invoice?.id) return;
    
    try {
      const { data: pdfData, error } = await supabase.functions.invoke(
        'generate-estimate-pdf',
        {
          body: {
            invoice_id: data.invoice.id,
            access_token: token
          }
        }
      );
      
      if (error) throw error;
      
      if (pdfData?.pdf_url) {
        const link = document.createElement('a');
        link.href = pdfData.pdf_url;
        link.download = `estimate-${data.invoice.invoice_number}.pdf`;
        link.click();
      }
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Unable to generate PDF. Please contact us.",
        variant: "destructive"
      });
    }
  };

  const handleApproveEstimate = async () => {
    if (!data.invoice) return;

    try {
      const { error } = await supabase
        .from('invoices')
        .update({ workflow_status: 'approved' })
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

  const handleChangeRequestSubmitted = async () => {
    setShowChangeForm(false);
    
    // Refetch data to show updated status
    await fetchCustomerData();
    
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

  // Show approval workflow if estimate sent/viewed but NOT approved
  const showApprovalWorkflow = 
    data.invoice.workflow_status && 
    ['sent', 'viewed', 'pending_review'].includes(data.invoice.workflow_status);

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
        {/* Show approval workflow if sent/viewed */}
        {showApprovalWorkflow && (
          <EstimateApprovalWorkflow
            estimate={data.invoice}
            onApproval={fetchCustomerData}
            onRequestChanges={handleRequestChanges}
          />
        )}

        {/* Show event portal if paid */}
        {data.invoice.workflow_status === 'paid' && data.quote && (
          <div className="space-y-6">
            <EventCountdown quote={data.quote} invoice={data.invoice} />
            <CustomerEventPortal 
              quote={data.quote} 
              invoice={data.invoice}
              token={token}
            />
          </div>
        )}

        {/* Show payment interface if approved but not paid */}
        {data.invoice.workflow_status === 'approved' && (
          <div className="space-y-6">
            <PaymentInterface 
              invoiceId={data.invoice.id} 
              accessToken={token}
            />
            
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
          </div>
        )}

        {/* Show approval workflow if not yet approved */}
        {data.invoice.workflow_status !== 'approved' && data.invoice.workflow_status !== 'paid' && (
          <EstimateApprovalWorkflow
            estimate={data.invoice}
            onApproval={() => {
              fetchCustomerData();
              toast({
                title: "Success!",
                description: "Your estimate has been approved. Payment options are shown below.",
              });
            }}
            onRequestChanges={() => {
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