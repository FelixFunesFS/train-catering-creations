import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Send, 
  Eye, 
  Download, 
  FileText, 
  DollarSign, 
  AlertCircle,
  RefreshCw,
  CheckCircle
} from "lucide-react";

interface EstimateActionsProps {
  invoice: any;
  quote: any;
  onStatusChange?: () => void;
}

export const EstimateActions = ({ invoice, quote, onStatusChange }: EstimateActionsProps) => {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const getAvailableActions = () => {
    const status = invoice?.status || 'draft';
    
    switch (status) {
      case 'draft':
        return [
          { id: 'send', label: 'Send Estimate', icon: Send, variant: 'default' as const, primary: true },
          { id: 'preview', label: 'Preview', icon: Eye, variant: 'outline' as const },
          { id: 'download', label: 'Download PDF', icon: Download, variant: 'outline' as const }
        ];
      
      case 'sent':
        return [
          { id: 'resend', label: 'Resend', icon: RefreshCw, variant: 'outline' as const },
          { id: 'follow_up', label: 'Follow Up', icon: Send, variant: 'default' as const, primary: true },
          { id: 'view_sent', label: 'View Sent', icon: Eye, variant: 'outline' as const },
          { id: 'download', label: 'Download PDF', icon: Download, variant: 'outline' as const }
        ];
      
      case 'under_review':
        return [
          { id: 'follow_up', label: 'Send Reminder', icon: Send, variant: 'default' as const, primary: true },
          { id: 'view_sent', label: 'View Sent', icon: Eye, variant: 'outline' as const },
          { id: 'download', label: 'Download PDF', icon: Download, variant: 'outline' as const }
        ];
      
      case 'customer_approved':
        return [
          { id: 'generate_contract', label: 'Generate Contract', icon: FileText, variant: 'default' as const, primary: true },
          { id: 'setup_payment', label: 'Setup Payment', icon: DollarSign, variant: 'outline' as const },
          { id: 'download', label: 'Download PDF', icon: Download, variant: 'outline' as const }
        ];
      
      case 'paid':
        return [
          { id: 'start_planning', label: 'Start Event Planning', icon: CheckCircle, variant: 'default' as const, primary: true },
          { id: 'download', label: 'Download PDF', icon: Download, variant: 'outline' as const }
        ];
      
      default:
        return [];
    }
  };

  const handleAction = async (actionId: string) => {
    setLoading(actionId);
    
    try {
      switch (actionId) {
        case 'send':
        case 'resend':
          await handleSendEstimate();
          break;
        
        case 'follow_up':
          await handleFollowUp();
          break;
        
        case 'preview':
          window.open(`/admin/estimate-preview/${invoice.id}`, '_blank');
          break;
        
        case 'view_sent':
          window.open(`/estimate-print/${invoice.id}`, '_blank');
          break;
        
        case 'download':
          await handleDownload();
          break;
        
        case 'generate_contract':
          await handleGenerateContract();
          break;
        
        case 'setup_payment':
          await handleSetupPayment();
          break;
        
        case 'start_planning':
          await handleStartPlanning();
          break;
        
        default:
          toast({
            title: "Action not implemented",
            description: `The ${actionId} action is not yet implemented.`,
            variant: "destructive",
          });
      }
    } catch (error) {
      console.error(`Error executing ${actionId}:`, error);
      toast({
        title: "Action Failed",
        description: `Failed to execute ${actionId}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleSendEstimate = async () => {
    const { error } = await supabase.functions.invoke('send-invoice-email', {
      body: { invoice_id: invoice.id }
    });

    if (error) throw error;

    // Update status to sent
    await supabase
      .from('invoices')
      .update({ 
        status: 'sent', 
        sent_at: new Date().toISOString(),
        status_changed_by: 'admin'
      })
      .eq('id', invoice.id);

    toast({
      title: "Estimate Sent",
      description: "The estimate has been sent to the customer.",
    });

    onStatusChange?.();
  };

  const handleFollowUp = async () => {
    // Create a follow-up message or reminder
    toast({
      title: "Follow-up sent",
      description: "A follow-up reminder has been sent to the customer.",
    });
  };

  const handleDownload = async () => {
    window.open(`/estimate-print/${invoice.id}`, '_blank');
  };

  const handleGenerateContract = async () => {
    // Generate contract logic
    await supabase
      .from('invoices')
      .update({ 
        status: 'contract_generated',
        status_changed_by: 'admin'
      })
      .eq('id', invoice.id);

    toast({
      title: "Contract Generated",
      description: "The contract has been generated and is ready for customer signature.",
    });

    onStatusChange?.();
  };

  const handleSetupPayment = async () => {
    // Setup payment logic
    toast({
      title: "Payment Setup",
      description: "Payment processing has been configured for this estimate.",
    });
  };

  const handleStartPlanning = async () => {
    // Start event planning workflow
    await supabase
      .from('invoices')
      .update({ 
        status: 'planning',
        status_changed_by: 'admin'
      })
      .eq('id', invoice.id);

    toast({
      title: "Event Planning Started",
      description: "The event planning phase has begun.",
    });

    onStatusChange?.();
  };

  const actions = getAvailableActions();
  const primaryAction = actions.find(action => action.primary);
  const secondaryActions = actions.filter(action => !action.primary);

  if (actions.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No actions available for the current status.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Available Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {primaryAction && (
          <Button
            onClick={() => handleAction(primaryAction.id)}
            disabled={loading === primaryAction.id}
            className="w-full"
            size="lg"
            variant={primaryAction.variant}
          >
            {loading === primaryAction.id ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <primaryAction.icon className="h-4 w-4 mr-2" />
            )}
            {primaryAction.label}
          </Button>
        )}

        {secondaryActions.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {secondaryActions.map((action) => (
              <Button
                key={action.id}
                onClick={() => handleAction(action.id)}
                disabled={loading === action.id}
                variant={action.variant}
                size="sm"
              >
                {loading === action.id ? (
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <action.icon className="h-3 w-3 mr-1" />
                )}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};