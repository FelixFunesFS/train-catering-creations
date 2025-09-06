import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { InvoiceViewer } from '@/components/admin/invoice/InvoiceViewer';
import { EditableInvoiceViewer } from '@/components/admin/invoice/EditableInvoiceViewer';
import { ChangeRequestModal } from '@/components/customer/ChangeRequestModal';
import { EstimatePreviewActions } from '@/components/admin/EstimatePreviewActions';
import { useInvoiceEditing } from '@/hooks/useInvoiceEditing';
import { useLineItemManagement } from '@/hooks/useLineItemManagement';
import { useKeyboardShortcuts, SHORTCUTS } from '@/hooks/useKeyboardShortcuts';
import { 
  FileText, 
  Download, 
  CheckCircle, 
  CreditCard,
  ArrowLeft,
  Loader2,
  MessageSquare,
  Edit3,
  Send,
  X
} from 'lucide-react';
import { EstimateActionBar } from '@/components/admin/EstimateActionBar';
import { SimplifiedActionButton } from '@/components/admin/SimplifiedActionButton';

interface LineItem {
  id: string;
  title: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  category: string;
}

interface PaymentSchedule {
  deposit_amount: number;
  deposit_percentage: number;
  balance_due: number;
  payment_schedule: Array<{
    amount: number;
    due_date: string;
    description: string;
  }>;
}

interface EstimateData {
  id: string;
  invoice_number: string;
  status: string;
  total_amount: number;
  subtotal: number;
  tax_amount: number;
  due_date: string;
  sent_at: string | null;
  created_at: string;
  notes: string;
  draft_data: any;
  is_government_contract?: boolean;
  customers: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  quote_requests: {
    id: string;
    event_name: string;
    event_type: string;
    event_date: string;
    start_time?: string;
    serving_start_time?: string;
    location: string;
    service_type: string;
    guest_count: number;
    special_requests: string;
    contact_name: string;
    email: string;
  };
}

export default function EstimatePreview() {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { isEditMode, isSaving, hasUnsavedChanges, toggleEditMode, exitEditMode, saveWithBackup } = useInvoiceEditing();
  const [estimate, setEstimate] = useState<EstimateData | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [emailingCustomer, setEmailingCustomer] = useState(false);
  const [showChangeRequest, setShowChangeRequest] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Check for preview data in URL params (client-side preview)
  const urlParams = new URLSearchParams(location.search);
  const previewData = urlParams.get('data');
  
  // Check if we're in admin context
  const isAdminView = location.pathname.startsWith('/admin');
  const isCustomerView = !isAdminView;

  // Setup keyboard shortcuts for admin context
  useKeyboardShortcuts({
    shortcuts: {
      [SHORTCUTS.SAVE]: () => isEditMode && handleSaveEstimate,
      [SHORTCUTS.CANCEL]: () => isEditMode && toggleEditMode,
      [SHORTCUTS.EDIT]: () => !isEditMode && toggleEditMode
    },
    enabled: isAdminView && isEditMode
  });

  useEffect(() => {
    if (previewData) {
      // Handle client-side preview data
      try {
        const data = JSON.parse(decodeURIComponent(previewData));
        const mockEstimate = {
          id: 'preview',
          invoice_number: data.invoice_number || 'EST-PREVIEW',
          status: 'estimate',
          total_amount: data.total_amount,
          subtotal: data.subtotal,
          tax_amount: data.tax_amount,
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          sent_at: null,
          created_at: new Date().toISOString(),
          notes: data.notes || '',
          draft_data: data,
          is_government_contract: data.is_government_contract,
          customers: {
            id: 'preview',
            name: data.customer_name,
            email: data.customer_email,
            phone: data.customer_phone || '',
            address: ''
          },
          quote_requests: {
            id: 'preview',
            event_name: data.event_details.name,
            event_type: data.event_details.event_type || 'other',
            event_date: data.event_details.date,
            location: data.event_details.location,
            service_type: data.event_details.service_type,
            guest_count: data.event_details.guest_count,
            special_requests: data.notes || '',
            contact_name: data.customer_name,
            email: data.customer_email
          }
        };
        setEstimate(mockEstimate);
        setLineItems(data.line_items || []);
        setLoading(false);
      } catch (error) {
        console.error('Error parsing preview data:', error);
        toast({
          title: "Error",
          description: "Invalid preview data",
          variant: "destructive"
        });
        setLoading(false);
      }
    } else if (invoiceId) {
      fetchEstimate();
      // Track estimate view for real estimates
      trackEstimateView();
    }
  }, [invoiceId, previewData]);

  const fetchEstimate = async () => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          customers!customer_id (
            id,
            name,
            email,
            phone,
            address
          ),
          quote_requests!quote_request_id (
            id,
            event_name,
            event_type,
            event_date,
            start_time,
            serving_start_time,
            location,
            service_type,
            guest_count,
            special_requests,
            contact_name,
            email
          )
        `)
        .eq('id', invoiceId)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Estimate not found');

      // Fetch line items separately
      const { data: lineItemsData, error: lineItemsError } = await supabase
        .from('invoice_line_items')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('created_at');

      if (lineItemsError) throw lineItemsError;

      console.log('Fetched estimate data:', data);
      console.log('Fetched line items:', lineItemsData);

      // Check for pricing data issues
      if (!lineItemsData || lineItemsData.length === 0) {
        console.warn('No line items found for invoice:', invoiceId);
      }

      const hasZeroPricing = lineItemsData?.every(item => 
        item.unit_price === 0 && item.total_price === 0
      );

      if (hasZeroPricing && lineItemsData?.length > 0) {
        console.warn('All line items have zero pricing');
        toast({
          title: "Pricing Issue Detected",
          description: "This estimate has incomplete pricing data. Please review and update.",
          variant: "destructive"
        });
      }

      setEstimate(data);
      setLineItems(lineItemsData || []);
    } catch (error) {
      console.error('Error fetching estimate:', error);
      toast({
        title: "Error",
        description: "Failed to load estimate details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const trackEstimateView = async () => {
    if (!invoiceId || previewData) return;
    
    try {
      await supabase.functions.invoke('track-analytics', {
        body: { 
          event_type: 'estimate_viewed',
          entity_type: 'estimate',
          entity_id: invoiceId,
          metadata: {
            view_context: location.pathname.startsWith('/admin') ? 'admin' : 'customer',
            user_agent: navigator.userAgent,
            timestamp: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      console.error('Error tracking estimate view:', error);
      // Don't show error to user as this is background tracking
    }
  };


  const handleApproveEstimate = async () => {
    if (!estimate || estimate.id === 'preview') return;
    
    setApproving(true);
    try {
      // Update invoice status to customer_approved
      const { error } = await supabase
        .from('invoices')
        .update({
          status: 'customer_approved',
          viewed_at: new Date().toISOString()
        })
        .eq('id', estimate.id);

      if (error) throw error;

      // Trigger post-approval workflow
      const { error: workflowError } = await supabase.functions.invoke('send-approval-workflow', {
        body: { invoice_id: estimate.id }
      });

      if (workflowError) {
        console.warn('Workflow automation failed:', workflowError);
        // Don't block approval if workflow fails
      }

      toast({
        title: "Estimate Approved",
        description: "Thank you! Contract and payment details will be sent to your email shortly.",
      });

      // Refresh the data
      await fetchEstimate();
    } catch (error) {
      console.error('Error approving estimate:', error);
      toast({
        title: "Error",
        description: "Failed to approve estimate. Please try again.",
        variant: "destructive"
      });
    } finally {
      setApproving(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (estimate?.id === 'preview') {
      // For preview mode, just show the print dialog
      window.print();
      return;
    }

  // Check if we're in admin context to use the print route
    const currentPath = location.pathname;
    const isAdminContext = currentPath.startsWith('/admin');
    const isCustomerContext = currentPath.startsWith('/customer');
    
    if (isAdminContext) {
      // Open the dedicated print route for admin users
      const printUrl = `/admin/estimate-preview/${invoiceId}/print`;
      window.open(printUrl, '_blank');
      
      toast({
        title: "PDF Ready",
        description: "Your estimate has opened in a new window. Use the print dialog to save as PDF.",
      });
      return;
    }

    // Fallback to edge function for non-admin users
    try {
      const { data, error } = await supabase.functions.invoke('generate-invoice-pdf', {
        body: { 
          invoice_id: invoiceId
        }
      });

      if (error) throw error;

      if (data.pdf_url) {
        // Open the HTML in a new window for printing/saving
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(data.html_content);
          newWindow.document.close();
          newWindow.focus();
          // Trigger print dialog which allows saving as PDF
          setTimeout(() => newWindow.print(), 500);
        }

        toast({
          title: "PDF Ready",
          description: "Your estimate has opened in a new window. Use the print dialog to save as PDF.",
        });
      } else {
        throw new Error('PDF URL not provided');
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEditEstimate = () => {
    if (isAdminContext) {
      toggleEditMode();
    } else if (estimate?.id === 'preview') {
      // Go back to previous page for preview mode
      window.close();
      return;
    } else {
      // Navigate to the correct route based on whether we have an invoice or just a quote
      if (estimate?.id && estimate.id !== 'preview') {
        // Edit existing estimate/invoice
        navigate(`/admin/estimate/${estimate.id}`);
      } else if (estimate?.quote_requests?.id) {
        // Create new estimate from quote
        navigate(`/admin/estimate/quote/${estimate.quote_requests.id}`);
      } else {
        toast({
          title: "Error",
          description: "Unable to determine edit route. Missing invoice or quote information.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSaveEstimate = async (updatedInvoice: any) => {
    if (!estimate?.id) return;
    
    const success = await saveWithBackup(estimate.id, updatedInvoice);
    if (success) {
      // Refresh the estimate data
      await fetchEstimate();
      exitEditMode();
    }
  };

  const handleEmailCustomer = async () => {
    if (!estimate || estimate.id === 'preview') return;
    
    setEmailingCustomer(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-custom-invoice-email', {
        body: { invoice_id: estimate.id }
      });

      if (error) {
        console.error('Email error:', error);
        // Check if this is a Gmail token issue
        if (error.message?.includes('Gmail') || error.message?.includes('token')) {
          toast({
            title: "Email Setup Required",
            description: "Gmail integration needs to be configured. Please contact your administrator.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Email Failed",
            description: `Failed to send email: ${error.message}`,
            variant: "destructive"
          });
        }
        return;
      }

      if (data?.success) {
        toast({
          title: "Email Sent",
          description: data.message || "Estimate has been emailed to the customer",
        });
      } else {
        toast({
          title: "Email Warning",
          description: "Email may not have been sent successfully",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Error",
        description: "Failed to send email. Please try again.",
        variant: "destructive"
      });
    } finally {
      setEmailingCustomer(false);
    }
  };

  const handlePayDeposit = async () => {
    if (!estimate || estimate.id === 'preview') return;
    
    setProcessingPayment(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { 
          invoice_id: estimate.id,
          payment_type: 'deposit'
        }
      });

      if (error) throw error;

      if (data?.url) {
        // Open payment in new tab
        window.open(data.url, '_blank');
        toast({
          title: "Payment Link Opened",
          description: "Complete your payment in the new tab to secure your event date.",
        });
      } else {
        throw new Error('Payment URL not provided');
      }
    } catch (error) {
      console.error('Error creating payment session:', error);
      toast({
        title: "Error",
        description: "Failed to create payment session. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  const calculatePaymentSchedule = (totalAmount: number, eventDate: string, isGovernment = false): PaymentSchedule => {
    const eventDateTime = new Date(eventDate);
    const today = new Date();
    const daysUntilEvent = Math.ceil((eventDateTime.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (isGovernment) {
      // Government contracts: Custom terms, typically full payment after event
      return {
        deposit_amount: 0,
        deposit_percentage: 0,
        balance_due: totalAmount,
        payment_schedule: [{
          amount: totalAmount,
          due_date: new Date(eventDateTime.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          description: "Full payment due 30 days after event completion"
        }]
      };
    }

    if (daysUntilEvent <= 30) {
      // Short notice events: 50% deposit, 50% 10 days prior
      const depositAmount = Math.round(totalAmount * 0.5);
      const finalAmount = totalAmount - depositAmount;
      const finalDueDate = new Date(eventDateTime.getTime() - 10 * 24 * 60 * 60 * 1000);

      return {
        deposit_amount: depositAmount,
        deposit_percentage: 50,
        balance_due: finalAmount,
        payment_schedule: [
          {
            amount: depositAmount,
            due_date: today.toISOString().split('T')[0],
            description: "Deposit to secure event date (50%)"
          },
          {
            amount: finalAmount,
            due_date: finalDueDate.toISOString().split('T')[0],
            description: "Final payment due 10 days prior to event"
          }
        ]
      };
    } else {
      // Standard events: 25% deposit, 50% at 30 days prior, 25% at 10 days prior
      const depositAmount = Math.round(totalAmount * 0.25);
      const secondPayment = Math.round(totalAmount * 0.5);
      const finalAmount = totalAmount - depositAmount - secondPayment;
      
      const secondDueDate = new Date(eventDateTime.getTime() - 30 * 24 * 60 * 60 * 1000);
      const finalDueDate = new Date(eventDateTime.getTime() - 10 * 24 * 60 * 60 * 1000);

      return {
        deposit_amount: depositAmount,
        deposit_percentage: 25,
        balance_due: totalAmount - depositAmount,
        payment_schedule: [
          {
            amount: depositAmount,
            due_date: today.toISOString().split('T')[0],
            description: "Deposit to secure event date (25%)"
          },
          {
            amount: secondPayment,
            due_date: secondDueDate.toISOString().split('T')[0],
            description: "Second payment due 30 days prior (50%)"
          },
          {
            amount: finalAmount,
            due_date: finalDueDate.toISOString().split('T')[0],
            description: "Final payment due 10 days prior (25%)"
          }
        ]
      };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading estimate...</span>
        </div>
      </div>
    );
  }

  if (!estimate) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Estimate Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The estimate you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isApproved = estimate.status === 'customer_approved' || estimate.status === 'approved';
  const isPreview = estimate.id === 'preview';
  const isAdminContext = location.pathname.startsWith('/admin');
  const paymentSchedule = calculatePaymentSchedule(
    estimate.total_amount, 
    estimate.quote_requests.event_date,
    estimate.draft_data?.is_government_contract
  );

  // If this is an admin context, wrap in AdminLayout
  if (isAdminContext) {
    return (
      <AdminLayout 
        title={estimate.status === 'customer_approved' || estimate.status === 'paid' ? 'INVOICE' : 'ESTIMATE'}
        subtitle={`${estimate.invoice_number} - ${estimate.customers.name}`}
        showBackButton={true}
        backUrl="/admin"
      >
        <div className="space-y-4">
          {/* Edit Mode Controls */}
          <div className="flex justify-between items-center">
            <div>
              {isEditMode && (
                <Badge variant="outline" className="text-primary">
                  <Edit3 className="h-3 w-3 mr-1" />
                  Edit Mode
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant={isEditMode ? "default" : "outline"}
                onClick={toggleEditMode}
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                {isEditMode ? (
                  <>
                    <X className="h-4 w-4" />
                    Cancel Edit
                  </>
                ) : (
                  <>
                    <Edit3 className="h-4 w-4" />
                    Edit Estimate
                  </>
                )}
              </Button>
            </div>
          </div>

          <EstimateContent 
            estimate={estimate}
            lineItems={lineItems}
            paymentSchedule={paymentSchedule}
            isApproved={isApproved}
            isPreview={isPreview}
            isAdminContext={true}
            isEditMode={isEditMode}
            handleApproveEstimate={handleApproveEstimate}
            handleDownloadPDF={handleDownloadPDF}
            handleEditEstimate={handleEditEstimate}
            handleEmailCustomer={handleEmailCustomer}
            handlePayDeposit={handlePayDeposit}
            handleSaveEstimate={handleSaveEstimate}
            approving={approving}
            emailingCustomer={emailingCustomer}
            processingPayment={processingPayment}
            setShowChangeRequest={setShowChangeRequest}
            showChangeRequest={showChangeRequest}
          />
        </div>
      </AdminLayout>
    );
  }

  // Regular customer-facing layout
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {isPreview ? 'Estimate Preview' : 'Catering Estimate'}
              </h1>
              <p className="text-muted-foreground">
                From Soul Train's Eatery
              </p>
            </div>
            <div className="flex items-center gap-3">
              {isPreview && (
                <Badge variant="outline">Preview Mode</Badge>
              )}
              {!isPreview && (
                <Badge variant={isApproved ? "default" : "secondary"}>
                  {isApproved ? 'Approved' : 'Pending Review'}
                </Badge>
              )}
              <Button variant="outline" onClick={() => {
                if (isPreview) {
                  window.close();
                } else {
                  navigate(`/admin/estimate-workflow/${estimate.id}`);
                }
              }}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {isPreview ? 'Close Preview' : 'Back to Workflow'}
              </Button>
              <Button variant="outline" onClick={handleDownloadPDF}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <InvoiceViewer
              invoice={{
                id: estimate.id,
                invoice_number: estimate.invoice_number,
                status: estimate.status,
                total_amount: estimate.total_amount,
                subtotal: estimate.subtotal,
                tax_amount: estimate.tax_amount,
                due_date: estimate.due_date,
                line_items: lineItems
              }}
              customer={estimate.customers}
              quote={{
                ...estimate.quote_requests,
                contact_name: estimate.quote_requests.contact_name,
                email: estimate.quote_requests.email
              }}
              showActions={isAdminContext}
              documentType={estimate.status === 'customer_approved' || estimate.status === 'paid' ? 'invoice' : 'estimate'}
            />

            {/* Missing Line Items Warning */}
            {lineItems.length === 0 && estimate.draft_data?.line_items?.length > 0 && (
              <Card className="mt-6 border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="h-5 w-5 text-yellow-600" />
                    <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
                      Line Items Not Finalized
                    </h3>
                  </div>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                    The following items from your quote are pending pricing and haven't been added to the final estimate:
                  </p>
                  <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                    {estimate.draft_data?.line_items?.map((item: any, index: number) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                        {item.title}: {item.description}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Action Sidebar */}
          <div className="space-y-6">
            {!isPreview && (
              <>
                {/* Quick Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Amount</span>
                      <span className="font-semibold">{formatCurrency(estimate.total_amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Event Date</span>
                      <span>{new Date(estimate.quote_requests.event_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Customer</span>
                      <span className="text-right">{estimate.customers.name}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Schedule */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Payment Schedule</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {paymentSchedule.payment_schedule.map((payment, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium">{formatCurrency(payment.amount)}</span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(payment.due_date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{payment.description}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </>
            )}

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {!isPreview && !isApproved && (
                  <Button 
                    onClick={handleApproveEstimate} 
                    disabled={approving}
                    className="w-full"
                  >
                    {approving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Approving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve Estimate
                      </>
                    )}
                  </Button>
                )}

                {!isPreview && !isApproved && (
                  <Button 
                    onClick={() => setShowChangeRequest(true)} 
                    variant="outline"
                    className="w-full"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Request Changes
                  </Button>
                )}

                {!isPreview && isApproved && paymentSchedule.deposit_amount > 0 && (
                  <Button 
                    onClick={handlePayDeposit} 
                    disabled={processingPayment}
                    className="w-full"
                  >
                    {processingPayment ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Pay Deposit ({formatCurrency(paymentSchedule.deposit_amount)})
                      </>
                    )}
                  </Button>
                )}

                {!isPreview && (
                  <Button 
                    onClick={handleEmailCustomer} 
                    disabled={emailingCustomer}
                    variant="outline"
                    className="w-full"
                  >
                    {emailingCustomer ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Edit3 className="h-4 w-4 mr-2" />
                        Email Customer
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Change Request Modal */}
      {!isPreview && (
        <ChangeRequestModal
          isOpen={showChangeRequest}
          onClose={() => setShowChangeRequest(false)}
          invoiceId={estimate.id}
          customerEmail={estimate.customers.email}
        />
      )}
    </div>
  );
}

// Extract the main content into a reusable component
interface EstimateContentProps {
  estimate: EstimateData;
  lineItems: LineItem[];
  paymentSchedule: PaymentSchedule;
  isApproved: boolean;
  isPreview: boolean;
  isAdminContext?: boolean;
  isEditMode?: boolean;
  handleApproveEstimate: () => void;
  handleDownloadPDF: () => void;
  handleEditEstimate: () => void;
  handleEmailCustomer: () => void;
  handlePayDeposit: () => void;
  handleSaveEstimate?: (updatedInvoice: any) => Promise<void>;
  approving: boolean;
  emailingCustomer: boolean;
  processingPayment: boolean;
  setShowChangeRequest: (show: boolean) => void;
  showChangeRequest: boolean;
}

function EstimateContent({
  estimate,
  lineItems,
  paymentSchedule,
  isApproved,
  isPreview,
  isAdminContext = false,
  isEditMode = false,
  handleApproveEstimate,
  handleDownloadPDF,
  handleEditEstimate,
  handleEmailCustomer,
  handlePayDeposit,
  handleSaveEstimate,
  approving,
  emailingCustomer,
  processingPayment,
  setShowChangeRequest,
  showChangeRequest
}: EstimateContentProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  const documentType = estimate.status === 'customer_approved' || estimate.status === 'paid' ? 'invoice' : 'estimate';

  return (
    <>
      {/* Header for non-admin context */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {isPreview ? 'Estimate Preview' : 'Catering Estimate'}
              </h1>
              <p className="text-muted-foreground">
                From Soul Train's Eatery
              </p>
            </div>
            <div className="flex items-center gap-3">
              {isPreview && (
                <Badge variant="outline">Preview Mode</Badge>
              )}
              {estimate.status && (
                <Badge 
                  variant={isApproved ? "default" : "secondary"}
                  className="capitalize"
                >
                  {estimate.status}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {isAdminContext && isEditMode ? (
              <EditableInvoiceViewer
                invoice={{
                  ...estimate,
                  line_items: lineItems
                }}
                customer={estimate.customers}
                quote={estimate.quote_requests}
                documentType={documentType}
                showActions={true}
                isEditMode={isEditMode}
                onSave={handleSaveEstimate}
                onCancel={() => handleEditEstimate()}
              />
            ) : (
              <InvoiceViewer
                invoice={{
                  ...estimate,
                  line_items: lineItems
                }}
                customer={estimate.customers}
                quote={estimate.quote_requests}
                documentType={documentType}
                showActions={isAdminContext}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Event Date:</span>
                  <span className="font-medium">
                    {new Date(estimate.quote_requests.event_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Guest Count:</span>
                  <span className="font-medium">{estimate.quote_requests.guest_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service Type:</span>
                  <span className="font-medium capitalize">{estimate.quote_requests.service_type}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">Total Amount:</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatCurrency(estimate.total_amount)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Payment Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {paymentSchedule.payment_schedule.map((payment, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium">
                        {formatCurrency(payment.amount)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(payment.due_date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {payment.description}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Actions */}
            {!isPreview && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{isAdminContext ? 'Actions' : 'Customer Actions'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isAdminContext ? (
                    <EstimatePreviewActions
                      invoiceId={estimate.id}
                      status={estimate.status}
                      customerEmail={estimate.customers?.email || ''}
                      totalAmount={estimate.total_amount}
                      onDownload={handleDownloadPDF}
                      onEdit={handleEditEstimate}
                      onEmailSent={() => {
                        // Handle email sent if needed
                      }}
                    />
                  ) : (
                    <div className="space-y-3">
                      {/* Customer Primary Action */}
                      {!isApproved ? (
                        <SimplifiedActionButton
                          variant="primary"
                          onClick={handleApproveEstimate}
                          disabled={approving}
                          isLoading={approving}
                          loadingText="Approving..."
                          icon={<CheckCircle className="h-4 w-4" />}
                          className="w-full"
                        >
                          Approve Estimate
                        </SimplifiedActionButton>
                      ) : paymentSchedule.deposit_amount > 0 ? (
                        <SimplifiedActionButton
                          variant="primary"
                          onClick={handlePayDeposit}
                          disabled={processingPayment}
                          isLoading={processingPayment}
                          loadingText="Processing..."
                          icon={<CreditCard className="h-4 w-4" />}
                          className="w-full"
                        >
                          Pay Deposit ({formatCurrency(paymentSchedule.deposit_amount)})
                        </SimplifiedActionButton>
                      ) : null}
                      
                      {/* Customer Secondary Actions */}
                      {!isApproved && (
                        <SimplifiedActionButton
                          variant="secondary"
                          onClick={() => setShowChangeRequest(true)}
                          icon={<Edit3 className="h-4 w-4" />}
                          className="w-full"
                        >
                          Request Changes
                        </SimplifiedActionButton>
                      )}
                      
                      <Separator />
                      
                      <SimplifiedActionButton
                        variant="tertiary"
                        onClick={handleDownloadPDF}
                        icon={<Download className="h-4 w-4" />}
                        className="w-full"
                      >
                        Download PDF
                      </SimplifiedActionButton>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Change Request Modal */}
      <ChangeRequestModal
        isOpen={showChangeRequest}
        onClose={() => setShowChangeRequest(false)}
        invoiceId={estimate.id}
        customerEmail={estimate.customers.email}
      />
    </>
  );
}