import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Download, CreditCard, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatCategory } from '@/utils/textFormatters';

interface EstimateData {
  id: string;
  invoice_number: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  status: string;
  due_date: string;
  quote_requests: {
    contact_name: string;
    event_name: string;
    event_date: string;
    guest_count: number;
    location: string;
    email: string;
  };
  invoice_line_items: Array<{
    title: string;
    description: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    category: string;
  }>;
}

export default function EstimatePreview() {
  const { invoiceId } = useParams();
  const [searchParams] = useSearchParams();
  const [estimate, setEstimate] = useState<EstimateData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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
          quote_requests(contact_name, event_name, event_date, guest_count, location, email),
          invoice_line_items(title, description, quantity, unit_price, total_price, category)
        `)
        .eq('id', invoiceId)
        .single();

      if (error) throw error;
      setEstimate(data as any);
    } catch (error) {
      console.error('Error fetching estimate:', error);
      toast({
        title: "Error",
        description: "Failed to load estimate",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!estimate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Estimate Not Found</h1>
          <p className="text-muted-foreground">The requested estimate could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Estimate Preview</h1>
            <p className="text-muted-foreground">Estimate #{estimate.invoice_number}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Estimate */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Soul Train's Eatery</CardTitle>
                  <Badge variant="outline">{estimate.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Catering Estimate</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Event Details */}
                <div>
                  <h3 className="font-semibold mb-3">Event Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Event:</span>
                      <p className="font-medium">{estimate.quote_requests.event_name}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Contact:</span>
                      <p className="font-medium">{estimate.quote_requests.contact_name}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Date:</span>
                      <p className="font-medium">{new Date(estimate.quote_requests.event_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Guests:</span>
                      <p className="font-medium">{estimate.quote_requests.guest_count}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Location:</span>
                      <p className="font-medium">{estimate.quote_requests.location}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Line Items */}
                <div>
                  <h3 className="font-semibold mb-3">Service Details</h3>
                  <div className="space-y-3">
                    {estimate.invoice_line_items.map((item, index) => (
                      <div key={index} className="flex items-start justify-between py-2 border-b last:border-b-0">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{item.title}</h4>
                            <Badge variant="secondary" className="text-xs">
                              {formatCategory(item.category)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                          <p className="text-sm mt-1">
                            Quantity: {item.quantity} × {formatCurrency(item.unit_price / 100)}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-medium">{formatCurrency(item.total_price / 100)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(estimate.subtotal / 100)}</span>
                  </div>
                  {estimate.tax_amount > 0 && (
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>{formatCurrency(estimate.tax_amount / 100)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total:</span>
                    <span>{formatCurrency(estimate.total_amount / 100)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full gap-2">
                  <CreditCard className="w-4 h-4" />
                  Approve & Pay
                </Button>
                <Button variant="outline" className="w-full gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Request Changes
                </Button>
                <Button variant="outline" className="w-full gap-2">
                  <Download className="w-4 h-4" />
                  Download PDF
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-2">
                  <p>• Review the estimate details</p>
                  <p>• Request changes if needed</p>
                  <p>• Approve to proceed with your event</p>
                  <p>• Make payment to secure your date</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}