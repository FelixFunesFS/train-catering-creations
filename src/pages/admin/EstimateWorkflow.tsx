import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Calculator } from 'lucide-react';
import { EstimateStatusIndicator } from '@/components/admin/workflow/EstimateStatusIndicator';
import { ChangeRequestManager } from '@/components/admin/workflow/ChangeRequestManager';
import { EstimateActions } from '@/components/admin/workflow/EstimateActions';
import { InvoicePricingPanel } from '@/components/admin/invoice/InvoicePricingPanel';

export default function EstimateWorkflow() {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [quote, setQuote] = useState<any>(null);
  const [invoice, setInvoice] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPricingPanel, setShowPricingPanel] = useState(false);

  useEffect(() => {
    if (invoiceId) {
      fetchData();
    }
  }, [invoiceId]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch invoice data
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .single();

      if (invoiceError) throw invoiceError;
      setInvoice(invoiceData);

      // Fetch related quote request
      if (invoiceData.quote_request_id) {
        const { data: quoteData, error: quoteError } = await supabase
          .from('quote_requests')
          .select('*')
          .eq('id', invoiceData.quote_request_id)
          .single();

        if (quoteError) throw quoteError;
        setQuote(quoteData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load estimate data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePricingUpdate = async (overrides: any) => {
    try {
      // Update invoice with new pricing from overrides
      const { error: invoiceError } = await supabase
        .from('invoices')
        .update({
          subtotal: overrides.subtotal,
          tax_amount: overrides.tax_amount,
          total_amount: overrides.total_amount,
          manual_overrides: overrides.manual_overrides || {},
          override_reason: overrides.override_reason,
          status: 'draft'
        })
        .eq('id', invoiceId);

      if (invoiceError) throw invoiceError;

      toast({
        title: "Pricing Updated",
        description: "Estimate pricing has been saved successfully",
      });

      setShowPricingPanel(false);
      await fetchData();
    } catch (error) {
      console.error('Error updating pricing:', error);
      toast({
        title: "Error",
        description: "Failed to update pricing",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Calculator className="h-8 w-8 animate-pulse mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading estimate workflow...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground">Estimate not found</p>
          <Button onClick={() => navigate('/admin')} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Admin
              </Button>
              <div className="flex items-center gap-3">
                <Calculator className="h-5 w-5 text-primary" />
                <div>
                  <h1 className="text-xl font-semibold">
                    Estimate Workflow
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {quote?.event_name} - {quote?.event_date ? new Date(quote.event_date).toLocaleDateString() : 'No date'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setShowPricingPanel(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                Edit Pricing
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Workflow Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Overview */}
            <EstimateStatusIndicator 
              status={invoice.status || 'draft'}
              hasChangeRequests={false} // Will be calculated
              hasManualOverrides={invoice.manual_overrides && Object.keys(invoice.manual_overrides).length > 0}
              showProgress={true}
            />

            {/* Change Request Management */}
            <ChangeRequestManager 
              invoiceId={invoice.id}
              onChangeProcessed={fetchData}
            />

            {/* Customer & Event Info */}
            {quote && (
              <Card>
                <CardHeader>
                  <CardTitle>Customer & Event Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <h4 className="font-medium">Customer</h4>
                      <p>{quote.contact_name}</p>
                      <p className="text-sm text-muted-foreground">{quote.email}</p>
                      <p className="text-sm text-muted-foreground">{quote.phone}</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Event</h4>
                      <p>{quote.event_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(quote.event_date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">{quote.location}</p>
                      <p className="text-sm text-muted-foreground">{quote.guest_count} guests</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Actions Sidebar */}
          <div className="space-y-6">
            <EstimateActions
              invoice={invoice}
              quote={quote}
              onStatusChange={fetchData}
            />

            {/* Estimate Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Estimate Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${(invoice.subtotal / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${(invoice.tax_amount / 100).toFixed(2)}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${(invoice.total_amount / 100).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Pricing Panel Modal */}
      {showPricingPanel && (
        <InvoicePricingPanel
          isOpen={showPricingPanel}
          onClose={() => setShowPricingPanel(false)}
          lineItems={[]} // Will be fetched from invoice_line_items
          onUpdateLineItems={() => {}}
          onSave={handlePricingUpdate}
        />
      )}
    </div>
  );
}