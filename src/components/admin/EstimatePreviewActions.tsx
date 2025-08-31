import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  CreditCard, 
  DollarSign, 
  Download, 
  Edit, 
  Eye, 
  FileText, 
  Mail, 
  Send, 
  Calendar,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EstimatePreviewActionsProps {
  invoiceId: string;
  status: string;
  customerEmail: string;
  totalAmount: number;
  onDownload?: () => void;
  onEdit?: () => void;
  onEmailSent?: () => void;
}

export function EstimatePreviewActions({
  invoiceId,
  status,
  customerEmail,
  totalAmount,
  onDownload,
  onEdit,
  onEmailSent
}: EstimatePreviewActionsProps) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const { toast } = useToast();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  };

  const handleAction = async (actionId: string, action: () => Promise<void> | void) => {
    setActionLoading(actionId);
    try {
      await action();
    } catch (error) {
      console.error(`Error in ${actionId}:`, error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendToCustomer = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('send-custom-invoice-email', {
        body: { invoice_id: invoiceId }
      });

      if (error) {
        console.error('Email error:', error);
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
        onEmailSent?.();
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
    }
  };

  const handleCreatePaymentLink = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-payment-link', {
        body: { invoice_id: invoiceId }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
        toast({
          title: "Payment Link Created",
          description: "Payment link opened in new tab",
        });
      }
    } catch (error) {
      console.error('Error creating payment link:', error);
      toast({
        title: "Error",
        description: "Failed to create payment link",
        variant: "destructive"
      });
    }
  };

  const handleGenerateContract = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-contract', {
        body: { invoice_id: invoiceId }
      });

      if (error) throw error;

      toast({
        title: "Contract Generated",
        description: "Contract has been generated successfully",
      });
    } catch (error) {
      console.error('Error generating contract:', error);
      toast({
        title: "Error",
        description: "Failed to generate contract",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Draft', variant: 'secondary' as const },
      sent: { label: 'Sent', variant: 'default' as const },
      viewed: { label: 'Viewed', variant: 'outline' as const },
      approved: { label: 'Approved', variant: 'default' as const },
      paid: { label: 'Paid', variant: 'default' as const },
      overdue: { label: 'Overdue', variant: 'destructive' as const },
      cancelled: { label: 'Cancelled', variant: 'secondary' as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    );
  };

  const getNextSteps = () => {
    switch (status) {
      case 'draft':
      case 'revised':
        return {
          title: status === 'revised' ? "Estimate Revised" : "Estimate Created Successfully",
          description: status === 'revised' ? 
            "Estimate has been updated and requires customer re-approval. Choose your next action:" :
            "Your estimate is ready. Choose your next action:",
          actions: [
            {
              id: 'send',
              label: status === 'revised' ? 'Resend to Customer' : 'Send to Customer',
              icon: Send,
              variant: 'default' as const,
              onClick: handleSendToCustomer,
              primary: true
            }
          ]
        };

      case 'sent':
        return {
          title: "Estimate Sent to Customer",
          description: `Estimate sent to ${customerEmail}. Awaiting customer response.`,
          actions: [
            {
              id: 'resend',
              label: 'Resend Custom Email',
              icon: Mail,
              variant: 'outline' as const,
              onClick: handleSendToCustomer
            },
            {
              id: 'payment',
              label: 'Create Payment Link',
              icon: CreditCard,
              variant: 'default' as const,
              onClick: handleCreatePaymentLink,
              primary: true
            }
          ]
        };

      case 'viewed':
        return {
          title: "Customer Viewed Estimate",
          description: "Customer has viewed the estimate. Follow up or wait for response.",
          actions: [
            {
              id: 'payment',
              label: 'Send Payment Link',
              icon: CreditCard,
              variant: 'default' as const,
              onClick: handleCreatePaymentLink,
              primary: true
            },
            {
              id: 'follow-up',
              label: 'Send Follow-up',
              icon: Mail,
              variant: 'outline' as const,
              onClick: () => handleSendToCustomer()
            }
          ]
        };

      case 'approved':
        return {
          title: "Estimate Approved by Customer",
          description: "Customer has approved the estimate. Process payment and generate contract.",
          actions: [
            {
              id: 'contract',
              label: 'Generate Contract',
              icon: FileText,
              variant: 'default' as const,
              onClick: handleGenerateContract,
              primary: true
            },
            {
              id: 'payment',
              label: 'Process Payment',
              icon: DollarSign,
              variant: 'outline' as const,
              onClick: handleCreatePaymentLink
            }
          ]
        };

      case 'paid':
        return {
          title: "Payment Received",
          description: "Customer has paid. Generate contract and schedule event.",
          actions: [
            {
              id: 'contract',
              label: 'Generate Contract',
              icon: FileText,
              variant: 'default' as const,
              onClick: handleGenerateContract,
              primary: true
            },
            {
              id: 'schedule',
              label: 'Schedule Event',
              icon: Calendar,
              variant: 'outline' as const,
              onClick: () => {}
            }
          ]
        };

      case 'overdue':
        return {
          title: "Payment Overdue",
          description: "Payment is overdue. Send reminder or follow up with customer.",
          actions: [
            {
              id: 'reminder',
              label: 'Send Reminder',
              icon: AlertCircle,
              variant: 'destructive' as const,
              onClick: handleSendToCustomer,
              primary: true
            },
            {
              id: 'payment',
              label: 'Resend Payment Link',
              icon: CreditCard,
              variant: 'outline' as const,
              onClick: handleCreatePaymentLink
            }
          ]
        };

      default:
        return {
          title: "Estimate Status",
          description: "Choose your next action:",
          actions: []
        };
    }
  };

  const nextSteps = getNextSteps();

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Next Steps
          </CardTitle>
          {getStatusBadge(status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <h4 className="font-semibold text-base">{nextSteps.title}</h4>
          <p className="text-sm text-muted-foreground">
            {nextSteps.description}
          </p>
          <div className="text-lg font-bold text-primary">
            Total: {formatCurrency(totalAmount)}
          </div>
        </div>

        {nextSteps.actions.length > 0 && (
          <div className="space-y-3">
            {nextSteps.actions.map((action) => (
              <Button
                key={action.id}
                variant={action.variant}
                className="w-full justify-start"
                onClick={() => handleAction(action.id, action.onClick)}
                disabled={actionLoading === action.id}
                size="sm"
              >
                <action.icon className="h-4 w-4 mr-2" />
                {actionLoading === action.id ? 'Loading...' : action.label}
                {action.primary && <ArrowRight className="h-4 w-4 ml-auto" />}
              </Button>
            ))}
          </div>
        )}

        {/* Additional Actions */}
        <div className="pt-4 border-t space-y-2">
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="w-full justify-start"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Estimate
            </Button>
          )}
          {onDownload && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDownload}
              className="w-full justify-start"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}