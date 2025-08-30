import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  CheckCircle, 
  Clock, 
  DollarSign, 
  FileText, 
  Calendar,
  ArrowRight,
  Download,
  CreditCard,
  MessageSquare,
  Star
} from 'lucide-react';

interface CustomerData {
  quote?: any;
  invoice?: any;
  customer?: any;
}

export function OptimizedCustomerPortal() {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<CustomerData>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const quoteId = searchParams.get('quote');
  const invoiceId = searchParams.get('invoice');
  const customerEmail = searchParams.get('email');

  useEffect(() => {
    if (quoteId || invoiceId || customerEmail) {
      fetchCustomerData();
    }
  }, [quoteId, invoiceId, customerEmail]);

  const fetchCustomerData = async () => {
    setLoading(true);
    try {
      let customerData: CustomerData = {};

      if (quoteId) {
        const { data: quote } = await supabase
          .from('quote_requests')
          .select('*')
          .eq('id', quoteId)
          .single();
        customerData.quote = quote;
      }

      if (invoiceId) {
        const { data: invoice } = await supabase
          .from('invoices')
          .select('*')
          .eq('id', invoiceId)
          .single();
        customerData.invoice = invoice;
      }

      setData(customerData);
    } catch (error) {
      console.error('Error fetching customer data:', error);
      toast({
        title: "Error",
        description: "Failed to load your information. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getProgressSteps = () => {
    if (data.invoice) {
      const steps = [
        { label: 'Quote Requested', completed: true },
        { label: 'Quote Confirmed', completed: true },
        { label: 'Invoice Sent', completed: true },
        { label: 'Payment', completed: data.invoice.status === 'paid' },
        { label: 'Event Confirmed', completed: data.invoice.status === 'paid' }
      ];
      return steps;
    }

    if (data.quote) {
      const steps = [
        { label: 'Quote Requested', completed: true },
        { label: 'Under Review', completed: data.quote.status !== 'pending' },
        { label: 'Quote Ready', completed: ['quoted', 'confirmed'].includes(data.quote.status) },
        { label: 'Confirmation', completed: data.quote.status === 'confirmed' },
        { label: 'Invoice Creation', completed: false }
      ];
      return steps;
    }

    return [];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-500';
      case 'confirmed': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      case 'quoted': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const handleApproveQuote = async () => {
    if (!data.quote) return;

    try {
      const { error } = await supabase
        .from('quote_requests')
        .update({ status: 'confirmed' })
        .eq('id', data.quote.id);

      if (error) throw error;

      toast({
        title: "Quote Approved!",
        description: "We'll prepare your invoice and contact you shortly.",
      });

      fetchCustomerData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve quote. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handlePayInvoice = async () => {
    if (!data.invoice) return;

    try {
      // Simulate payment processing
      const { error } = await supabase
        .from('invoices')
        .update({ status: 'paid' })
        .eq('id', data.invoice.id);

      if (error) throw error;

      toast({
        title: "Payment Successful!",
        description: "Thank you! Your event is now confirmed.",
      });

      fetchCustomerData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Payment failed. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your information...</p>
        </div>
      </div>
    );
  }

  const steps = getProgressSteps();
  const completedSteps = steps.filter(step => step.completed).length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Soul Train's Eatery</h1>
              <p className="text-muted-foreground">Customer Portal</p>
            </div>
            <div className="text-right">
              {data.quote && (
                <div>
                  <p className="text-sm text-muted-foreground">Quote #</p>
                  <p className="font-mono text-lg">{data.quote.id?.slice(-8)}</p>
                </div>
              )}
              {data.invoice && (
                <div>
                  <p className="text-sm text-muted-foreground">Invoice #</p>
                  <p className="font-mono text-lg">{data.invoice.invoice_number}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Progress Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              Your Event Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Progress</span>
                <span>{Math.round(progressPercentage)}% Complete</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {steps.map((step, index) => (
                <div key={index} className="flex flex-col items-center text-center space-y-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step.completed ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    {step.completed ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                  </div>
                  <p className="text-xs font-medium">{step.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Current Status */}
        {data.quote && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Quote Details</span>
                <Badge className={getStatusColor(data.quote.status)}>
                  {data.quote.status.charAt(0).toUpperCase() + data.quote.status.slice(1)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Event Name</p>
                  <p className="font-medium">{data.quote.event_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Event Date</p>
                  <p className="font-medium">{new Date(data.quote.event_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Guest Count</p>
                  <p className="font-medium">{data.quote.guest_count} guests</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Service Type</p>
                  <p className="font-medium">{data.quote.service_type}</p>
                </div>
              </div>

              {data.quote.estimated_total && (
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">Estimated Total</span>
                    <span className="text-2xl font-bold text-primary">
                      ${(data.quote.estimated_total / 100).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {data.quote.status === 'quoted' && (
                <div className="flex gap-3 pt-4">
                  <Button onClick={handleApproveQuote} className="flex-1">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Quote
                  </Button>
                  <Button variant="outline">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Ask Questions
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Invoice Section */}
        {data.invoice && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Invoice</span>
                <Badge className={getStatusColor(data.invoice.status)}>
                  {data.invoice.status.charAt(0).toUpperCase() + data.invoice.status.slice(1)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-lg">
                <span>Total Amount</span>
                <span className="font-bold text-2xl text-primary">
                  ${(data.invoice.total_amount / 100).toLocaleString()}
                </span>
              </div>

              {data.invoice.due_date && (
                <div className="flex justify-between items-center">
                  <span>Due Date</span>
                  <span className="font-medium">
                    {new Date(data.invoice.due_date).toLocaleDateString()}
                  </span>
                </div>
              )}

              <Separator />

              <div className="flex gap-3">
                {data.invoice.status !== 'paid' && (
                  <Button onClick={handlePayInvoice} className="flex-1">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay Now
                  </Button>
                )}
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle>What's Next?</CardTitle>
          </CardHeader>
          <CardContent>
            {data.quote?.status === 'pending' && (
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="font-medium">We're reviewing your quote</p>
                  <p className="text-sm text-muted-foreground">
                    Our team will prepare a detailed quote within 24 hours and email it to you.
                  </p>
                </div>
              </div>
            )}

            {data.quote?.status === 'confirmed' && (
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium">Invoice preparation</p>
                  <p className="text-sm text-muted-foreground">
                    We're preparing your invoice and contract. You'll receive them within 2 business days.
                  </p>
                </div>
              </div>
            )}

            {data.invoice?.status === 'paid' && (
              <div className="flex items-start gap-3">
                <Star className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">You're all set!</p>
                  <p className="text-sm text-muted-foreground">
                    Your event is confirmed. We'll contact you a few days before your event to confirm final details.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card>
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium">Call Us</p>
                <p className="text-muted-foreground">(843) 970-0265</p>
              </div>
              <div>
                <p className="font-medium">Email Us</p>
                <p className="text-muted-foreground">soultrainseatery@gmail.com</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}