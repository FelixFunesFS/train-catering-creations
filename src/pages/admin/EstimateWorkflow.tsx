import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DollarSign, ArrowLeft, CheckCircle, Calculator } from "lucide-react";
import { EstimateStatusIndicator } from "@/components/admin/workflow/EstimateStatusIndicator";
import { ChangeRequestManager } from "@/components/admin/workflow/ChangeRequestManager";
import { EstimateActions } from "@/components/admin/workflow/EstimateActions";
import { InvoicePricingPanel } from "@/components/admin/invoice/InvoicePricingPanel";
import { WorkflowBreadcrumb } from "@/components/admin/workflow/WorkflowBreadcrumb";

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

      // Fetch related quote data
      if (invoiceData.quote_request_id) {
        const { data: quoteData, error: quoteError } = await supabase
          .from('quote_requests')
          .select('*')
          .eq('id', invoiceData.quote_request_id)
          .single();

        if (quoteError) {
          console.warn('Quote not found:', quoteError);
        } else {
          setQuote(quoteData);
        }
      }

    } catch (error: any) {
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

  const handlePricingUpdate = async (updatedPricing: {
    subtotal: number;
    tax: number;
    total: number;
    overrides?: { reason: string; amount: number; type: string }[];
  }) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .update({
          subtotal: updatedPricing.subtotal,
          tax: updatedPricing.tax,
          total: updatedPricing.total,
          manual_overrides: updatedPricing.overrides || []
        })
        .eq('id', invoiceId);

      if (error) throw error;

      toast({
        title: "Pricing Updated",
        description: "Estimate pricing has been updated successfully",
      });

      // Refresh data
      await fetchData();
      setShowPricingPanel(false);
    } catch (error: any) {
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
                <DollarSign className="h-4 w-4" />
                Edit Pricing
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 space-y-8">
        
        {/* Workflow Progress */}
        <WorkflowBreadcrumb 
          currentStep={invoice?.status || 'draft'} 
          invoiceStatus={invoice?.status || 'draft'} 
        />

        {/* What's Next Section */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <CheckCircle className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">What's Next?</h3>
                {invoice?.status === 'draft' && (
                  <div>
                    <p className="text-muted-foreground mb-3">
                      Your estimate is ready to send. Review the details below and click "Send Estimate" to deliver it via email.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      Ready to send estimate
                    </div>
                  </div>
                )}
                {invoice?.status === 'sent' && (
                  <div>
                    <p className="text-muted-foreground mb-3">
                      Estimate has been sent to the customer. You can now follow up or wait for their response.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      Awaiting customer response
                    </div>
                  </div>
                )}
                {(invoice?.status === 'approved' || invoice?.status === 'contract_generated') && (
                  <div>
                    <p className="text-muted-foreground mb-3">
                      Great! The estimate has been approved. You can now generate a contract or start planning the event.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-purple-600">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                      Ready for next phase
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status and Actions Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Left Column */}
          <div className="space-y-6">
            
            {/* Status Indicator */}
            <EstimateStatusIndicator 
              status={invoice?.status || 'draft'}
              hasChangeRequests={false}
              hasManualOverrides={!!invoice?.manual_overrides?.length}
              showProgress={true}
            />

            {/* Change Request Manager */}
            <ChangeRequestManager 
              invoiceId={invoiceId!}
              onChangeProcessed={fetchData}
            />
            
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            
            {/* Actions */}
            <EstimateActions 
              invoice={invoice}
              quote={quote}
              onStatusChange={fetchData}
            />

            {/* Customer and Event Details */}
            <Card>
              <CardHeader>
                <CardTitle>Customer & Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Customer</p>
                  <p className="text-base">{quote?.contact_name || 'N/A'}</p>
                  <p className="text-sm text-muted-foreground">{quote?.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Event</p>
                  <p className="text-base">{quote?.event_name || 'N/A'}</p>
                  <p className="text-sm text-muted-foreground">
                    {quote?.event_date ? new Date(quote.event_date).toLocaleDateString() : 'No date set'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Guest Count</p>
                  <p className="text-base">{quote?.guest_count || 'N/A'} guests</p>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>

        {/* Estimate Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Estimate Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${invoice?.subtotal?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>${invoice?.tax?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-3">
                <span>Total:</span>
                <span>${invoice?.total?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
            
            {invoice?.manual_overrides?.length > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm font-medium text-yellow-800 mb-2">Manual Overrides Applied:</p>
                {invoice.manual_overrides.map((override: any, index: number) => (
                  <div key={index} className="text-sm text-yellow-700">
                    {override.reason}: ${override.amount?.toFixed(2)} ({override.type})
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Pricing Panel Modal */}
      {showPricingPanel && (
        <InvoicePricingPanel
          isOpen={showPricingPanel}
          onClose={() => setShowPricingPanel(false)}
          lineItems={invoice?.line_items || []}
          onUpdateLineItems={() => {}}
          onSave={handlePricingUpdate}
        />
      )}
    </div>
  );
}