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
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);

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

      setEstimate(data);
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

      toast({
        title: "Estimate Approved",
        description: "Thank you! We'll contact you soon to arrange the details.",
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
      const { data, error } = await supabase.functions.invoke('generate-invoice-from-quote', {
        body: { 
          invoice_id: invoiceId,
          format: 'pdf' 
        }
      });

      if (error) throw error;

      // Create download link
      const link = document.createElement('a');
      link.href = data.pdf_url;
      link.download = `estimate-${estimate?.invoice_number}.pdf`;
      link.click();

      toast({
        title: "Download Started",
        description: "Your estimate PDF is being downloaded",
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        title: "Error",
        description: "Failed to download PDF",
        variant: "destructive"
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
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
  const depositAmount = Math.round(estimate.total_amount * 0.25); // 25% deposit

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
                line_items: estimate.draft_data?.line_items || []
              }}
              customer={estimate.customers}
              quote={{
                ...estimate.quote_requests,
                contact_name: estimate.quote_requests.contact_name,
                email: estimate.quote_requests.email
              }}
              showActions={false}
            />
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
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      Deposit Required (25%)
                    </span>
                    <span className="font-bold text-blue-700 dark:text-blue-300">
                      {formatCurrency(depositAmount)}
                    </span>
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Remaining balance due on event date
                  </p>
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