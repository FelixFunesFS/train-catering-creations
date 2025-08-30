import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { InvoiceViewer } from '@/components/admin/invoice/InvoiceViewer';
import { 
  FileText, 
  Download, 
  CheckCircle, 
  CreditCard,
  ArrowLeft,
  Loader2
} from 'lucide-react';

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
    event_date: string;
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
  const { toast } = useToast();
  const [estimate, setEstimate] = useState<EstimateData | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [emailingCustomer, setEmailingCustomer] = useState(false);

  useEffect(() => {
    if (invoiceId) {
      fetchEstimate();
    }
  }, [invoiceId]);

  const fetchEstimate = async () => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          customers (
            id,
            name,
            email,
            phone,
            address
          ),
          quote_requests (
            id,
            event_name,
            event_date,
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

  const handleApproveEstimate = async () => {
    if (!estimate) return;
    
    setApproving(true);
    try {
      // Update invoice status to approved
      const { error } = await supabase
        .from('invoices')
        .update({
          status: 'approved',
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
    navigate(`/admin/invoice-creation/${estimate?.quote_requests.id}`);
  };

  const handleEmailCustomer = async () => {
    if (!estimate) return;
    
    setEmailingCustomer(true);
    try {
      const { error } = await supabase.functions.invoke('send-invoice-email', {
        body: { invoice_id: estimate.id }
      });

      if (error) throw error;

      toast({
        title: "Email Sent",
        description: "Estimate has been emailed to the customer",
      });
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

  const isApproved = estimate.status === 'approved';
  const paymentSchedule = calculatePaymentSchedule(
    estimate.total_amount, 
    estimate.quote_requests.event_date,
    estimate.draft_data?.is_government_contract
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Catering Estimate
              </h1>
              <p className="text-muted-foreground">
                From Soul Train's Eatery
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={isApproved ? "default" : "secondary"}>
                {isApproved ? 'Approved' : 'Pending Review'}
              </Badge>
              <Button variant="outline" onClick={handleEditEstimate}>
                <FileText className="h-4 w-4 mr-2" />
                Edit Estimate
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
              showActions={false}
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
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {isApproved ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Approved
                    </>
                  ) : (
                    <>
                      <FileText className="h-5 w-5 text-yellow-500" />
                      Awaiting Approval
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isApproved ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Thank you for approving this estimate! We'll contact you soon to finalize the details.
                    </p>
                    <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
                      <p className="text-sm font-medium text-green-700 dark:text-green-300">
                        Next Steps:
                      </p>
                      <ul className="text-xs text-green-600 dark:text-green-400 mt-1 space-y-1">
                        <li>• Contract will be sent for signature</li>
                        <li>• Deposit payment link will be provided</li>
                        <li>• Event details will be confirmed</li>
                      </ul>
                    </div>
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
                          <FileText className="h-4 w-4 mr-2" />
                          Email Customer
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Please review the estimate details and approve if everything looks correct.
                    </p>
                    <Button 
                      onClick={handleApproveEstimate}
                      disabled={approving}
                      className="w-full"
                      size="lg"
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
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pricing Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatCurrency(estimate.subtotal)}</span>
                </div>
                {estimate.tax_amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Tax</span>
                    <span className="font-medium">{formatCurrency(estimate.tax_amount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(estimate.total_amount)}</span>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      Deposit Required ({paymentSchedule.deposit_percentage}%)
                    </span>
                    <span className="font-bold text-blue-700 dark:text-blue-300">
                      {formatCurrency(paymentSchedule.deposit_amount)}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {paymentSchedule.payment_schedule.map((payment, index) => (
                      <div key={index} className="flex justify-between text-xs text-blue-600 dark:text-blue-400">
                        <span>{payment.description}</span>
                        <span>{formatCurrency(payment.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="font-medium">Soul Train's Eatery</p>
                  <p className="text-sm text-muted-foreground">
                    Charleston's Premier Catering Service
                  </p>
                </div>
                <Separator />
                <div className="space-y-1 text-sm">
                  <p><strong>Phone:</strong> (843) 970-0265</p>
                  <p><strong>Email:</strong> soultrainseatery@gmail.com</p>
                  <p className="text-muted-foreground">
                    Proudly serving Charleston's Lowcountry and surrounding areas
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}