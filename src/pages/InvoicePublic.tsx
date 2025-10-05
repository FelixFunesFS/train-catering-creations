import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  CreditCard,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Download,
  Building2
} from 'lucide-react';

interface LineItem {
  id: string;
  title: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface InvoiceData {
  id: string;
  invoice_number: string;
  status: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  due_date: string;
  notes?: string;
  stripe_payment_link?: string;
  line_items: LineItem[];
  customer?: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
  };
  quote_request?: {
    event_name: string;
    event_date: string;
    location: string;
    guest_count: number;
  };
}

export default function InvoicePublic() {
  const { invoiceToken } = useParams();
  const { toast } = useToast();
  
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    if (invoiceToken) {
      fetchInvoiceData();
    }
  }, [invoiceToken]);

  const fetchInvoiceData = async () => {
    try {
      // In a real implementation, you'd decode the token and fetch the invoice
      // For now, we'll use a simple approach
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select(`
          *,
          customers (
            name,
            email,
            phone,
            address
          ),
          quote_requests (
            event_name,
            event_date,
            location,
            guest_count
          )
        `)
        .eq('id', invoiceToken) // In production, decode token to get ID
        .single();

      if (invoiceError) throw invoiceError;

      const { data: lineItems, error: lineItemsError } = await supabase
        .from('invoice_line_items')
        .select('*')
        .eq('invoice_id', invoiceToken)
        .order('created_at');

      if (lineItemsError) throw lineItemsError;

      setInvoice({
        ...invoiceData,
        line_items: lineItems || []
      });
    } catch (error) {
      console.error('Error fetching invoice:', error);
      toast({
        title: "Error",
        description: "Invoice not found or access denied",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayNow = async () => {
    if (!invoice?.stripe_payment_link) return;
    
    setIsProcessingPayment(true);
    try {
      // Redirect to Stripe payment link
      window.location.href = invoice.stripe_payment_link;
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: "Error",
        description: "Failed to process payment",
        variant: "destructive",
      });
      setIsProcessingPayment(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'sent':
      case 'viewed':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'overdue':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'sent':
      case 'viewed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
          <h1 className="text-2xl font-bold mb-2">Invoice Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The invoice you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Building2 className="h-8 w-8" />
              <div>
                <h1 className="text-2xl font-bold">Soul Train's Eatery</h1>
                <p className="text-primary-foreground/80">Charleston's Premier Catering</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-3 mb-2">
                {getStatusIcon(invoice.status)}
                <Badge className={getStatusColor(invoice.status)}>
                  {invoice.status === 'paid' ? 'Paid' : 'Pending Payment'}
                </Badge>
              </div>
              <p className="text-sm text-primary-foreground/80">
                Invoice #{invoice.invoice_number}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Invoice Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer & Event Info */}
            <Card>
              <CardHeader>
                <CardTitle>Invoice Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                      Bill To
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{invoice.customer?.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{invoice.customer?.email}</span>
                      </div>
                      {invoice.customer?.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{invoice.customer.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {invoice.quote_request && (
                    <div className="space-y-3">
                      <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                        Event Details
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{invoice.quote_request.event_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {new Date(invoice.quote_request.event_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{invoice.quote_request.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{invoice.quote_request.guest_count} guests</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Line Items */}
            <Card>
              <CardHeader>
                <CardTitle>Services & Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invoice.line_items.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{item.title}</h4>
                          {item.description && (
                            <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span>Quantity: {item.quantity}</span>
                            <span>Unit Price: {formatCurrency(item.unit_price)}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-lg">{formatCurrency(item.total_price)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Terms & Notes */}
            {invoice.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Additional Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{invoice.notes}</p>
                </CardContent>
              </Card>
            )}

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>(843) 970-0265</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>soultrainseatery@gmail.com</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Sidebar */}
          <div className="space-y-6">
            {/* Invoice Total */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(invoice.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (8%):</span>
                  <span>{formatCurrency(invoice.tax_amount)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total Amount:</span>
                  <span className="text-primary">{formatCurrency(invoice.total_amount)}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Due Date: {new Date(invoice.due_date).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>

            {/* Payment Action */}
            {invoice.status !== 'paid' && invoice.stripe_payment_link && (
              <Card className="border-primary">
                <CardHeader>
                  <CardTitle className="text-primary">Secure Payment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Click below to pay securely with Stripe. You'll be redirected to our secure payment page.
                  </p>
                  <Button 
                    onClick={handlePayNow}
                    disabled={isProcessingPayment}
                    className="w-full"
                    size="lg"
                  >
                    <CreditCard className="h-5 w-5 mr-2" />
                    {isProcessingPayment ? 'Processing...' : `Pay ${formatCurrency(invoice.total_amount)}`}
                  </Button>
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                    <span>Secured by Stripe</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment Confirmation */}
            {invoice.status === 'paid' && (
              <Card className="border-green-500">
                <CardHeader>
                  <CardTitle className="text-green-600 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    Payment Received
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Thank you! Your payment has been received and processed.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Download Options */}
            <Card>
              <CardHeader>
                <CardTitle>Download</CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t mt-16">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p className="mb-2">
              © 2024 Soul Train's Eatery - Charleston's Premier Catering Service
            </p>
            <p>
              Proudly serving Charleston's Lowcountry and surrounding areas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}