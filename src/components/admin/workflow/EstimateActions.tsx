import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";
import { EstimateActionBar } from '@/components/admin/EstimateActionBar';

interface EstimateActionsProps {
  invoice: any;
  quote: any;
  onStatusChange?: () => void;
}

export const EstimateActions = ({ invoice, quote, onStatusChange }: EstimateActionsProps) => {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const getStatusMessage = () => {
    const status = invoice?.status || 'draft';
    switch (status) {
      case 'draft':
        return 'Estimate is ready to send to customer';
      case 'sent':
        return 'Estimate has been sent, awaiting customer response';
      case 'under_review':
        return 'Customer is reviewing the estimate';
      case 'customer_approved':
        return 'Customer has approved - ready to generate contract';
      case 'paid':
        return 'Payment received - ready to start planning';
      default:
        return `Current status: ${status}`;
    }
  };

  const handlePreview = () => {
    window.open(`/admin/estimate-preview/${invoice.id}`, '_blank');
  };

  const handleEdit = () => {
    window.open(`/admin/estimate-creation/${quote?.id}`, '_blank');
  };

  const handleDownload = () => {
    window.open(`/estimate-print/${invoice.id}`, '_blank');
  };

  const handleSendEmail = async () => {
    if (loading) return;
    
    setLoading('send');
    try {
      const { error } = await supabase.functions.invoke('send-custom-invoice-email', {
        body: { invoice_id: invoice.id }
      });

      if (error) throw error;

      // Update invoice status to sent
      await supabase
        .from('invoices')
        .update({ 
          status: 'sent', 
          sent_at: new Date().toISOString(),
          status_changed_by: 'admin'
        })
        .eq('id', invoice.id);

      // Also update the quote request status
      if (quote?.id) {
        await supabase
          .from('quote_requests')
          .update({ status: 'quoted' })
          .eq('id', quote.id);
      }

      const isEstimate = invoice.status === 'draft' || invoice.status === 'estimate' || invoice.status === 'revised';
      const documentType = isEstimate ? 'Estimate' : 'Invoice';
      
      toast({
        title: `${documentType} Sent Successfully!`,
        description: `Your customer will receive the ${documentType.toLowerCase()} via email shortly.`,
      });

      onStatusChange?.();
    } catch (error) {
      console.error('Error sending estimate:', error);
      toast({
        title: "Error",
        description: "Failed to send estimate. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const status = invoice?.status || 'draft';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estimate Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground mb-4">
          {getStatusMessage()}
        </div>
        
        <EstimateActionBar
          context="management"
          status={status}
          onPreview={handlePreview}
          onEdit={handleEdit}
          onDownload={handleDownload}
          onSend={handleSendEmail}
          className="flex-col gap-3"
        />
        
        {status === 'draft' && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Review the estimate details and send it to the customer when ready.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};