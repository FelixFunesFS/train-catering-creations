
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { EmailPreviewModal } from './EmailPreviewModal';
import {
  CheckCircle2,
  Send,
  Eye,
  Edit,
  FileText,
  DollarSign,
  Calendar,
  Clock,
  AlertCircle,
  ArrowRight,
  Mail,
  CreditCard
} from 'lucide-react';

interface EstimateNextStepsProps {
  invoiceId: string;
  status: string;
  customerEmail: string;
  totalAmount: number;
  onStatusChange?: () => void;
}

export function EstimateNextSteps({ 
  invoiceId, 
  status, 
  customerEmail, 
  totalAmount,
  onStatusChange 
}: EstimateNextStepsProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [estimateData, setEstimateData] = useState(null);
  const [lineItems, setLineItems] = useState([]);

  // Fetch full estimate data when email preview is opened
  const fetchEstimateData = async () => {
    try {
      const { data: invoice, error } = await supabase
        .from('invoices')
        .select(`
          *,
          customers!customer_id(*),
          quote_requests!quote_request_id(*)
        `)
        .eq('id', invoiceId)
        .single();

      if (error) throw error;

      const { data: items, error: itemsError } = await supabase
        .from('invoice_line_items')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('created_at');

      if (itemsError) throw itemsError;

      setEstimateData(invoice);
      setLineItems(items || []);
    } catch (error) {
      console.error('Error fetching estimate data:', error);
      toast({
        title: "Error",
        description: "Failed to load estimate data",
        variant: "destructive",
      });
    }
  };

  const handleSendToCustomer = async () => {
    await fetchEstimateData();
    setShowEmailPreview(true);
  };

  const handleEmailSent = () => {
    setShowEmailPreview(false);
    onStatusChange?.();
  };

  const handlePreview = () => {
    const previewUrl = `/admin/estimate-preview/${invoiceId}`;
    window.open(previewUrl, '_blank');
  };

  const handleEdit = () => {
    navigate(`/admin/estimate-creation/${invoiceId}?edit=true`);
  };

  const handleCreatePaymentLink = async () => {
    setActionLoading('payment');
    try {
      const { data, error } = await supabase.functions.invoke('create-payment-link', {
        body: { invoice_id: invoiceId }
      });

      if (error) throw error;

      toast({
        title: "Payment Link Created",
        description: "Payment link has been generated and sent to customer",
      });

      onStatusChange?.();
    } catch (error) {
      console.error('Error creating payment link:', error);
      toast({
        title: "Error",
        description: "Failed to create payment link",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleGenerateContract = async () => {
    setActionLoading('contract');
    try {
      const { error } = await supabase.functions.invoke('generate-contract', {
        body: { invoice_id: invoiceId }
      });

      if (error) throw error;

      // Update invoice status
      await supabase
        .from('invoices')
        .update({ status: 'contract_generated' })
        .eq('id', invoiceId);

      toast({
        title: "Contract Generated",
        description: "Service contract has been created",
      });

      onStatusChange?.();
    } catch (error) {
      console.error('Error generating contract:', error);
      toast({
        title: "Error", 
        description: "Failed to generate contract",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleScheduleEvent = () => {
    navigate(`/admin/event-planning/${invoiceId}`);
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
              id: 'preview',
              label: 'Preview Estimate',
              icon: Eye,
              variant: 'outline' as const,
              onClick: handlePreview
            },
            {
              id: 'send',
              label: status === 'revised' ? 'Resend to Customer' : 'Send to Customer',
              icon: Send,
              variant: 'default' as const,
              onClick: handleSendToCustomer,
              primary: true
            },
            {
              id: 'edit',
              label: 'Edit More',
              icon: Edit,
              variant: 'ghost' as const,
              onClick: handleEdit
            }
          ]
        };

      case 'sent':
        return {
          title: "Estimate Sent to Customer",
          description: `Estimate sent to ${customerEmail}. Awaiting customer response.`,
          actions: [
            {
              id: 'preview',
              label: 'View Estimate',
              icon: Eye,
              variant: 'outline' as const,
              onClick: handlePreview
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
          description: "Payment has been processed. Ready to schedule the event.",
          actions: [
            {
              id: 'schedule',
              label: 'Schedule Event',
              icon: Calendar,
              variant: 'default' as const,
              onClick: handleScheduleEvent,
              primary: true
            },
            {
              id: 'contract',
              label: 'View Contract',
              icon: FileText,
              variant: 'outline' as const,
              onClick: () => window.open(`/admin/contract/${invoiceId}`, '_blank')
            }
          ]
        };

      default:
        return {
          title: "Estimate Status Unknown",
          description: "Please check the estimate status in the admin dashboard.",
          actions: []
        };
    }
  };

  const nextSteps = getNextSteps();

  const getStatusBadge = () => {
    const variants = {
      draft: { variant: 'secondary' as const, color: 'bg-gray-100 text-gray-800' },
      revised: { variant: 'secondary' as const, color: 'bg-orange-100 text-orange-800' },
      sent: { variant: 'default' as const, color: 'bg-blue-100 text-blue-800' },
      viewed: { variant: 'default' as const, color: 'bg-yellow-100 text-yellow-800' },
      approved: { variant: 'default' as const, color: 'bg-green-100 text-green-800' },
      paid: { variant: 'default' as const, color: 'bg-green-100 text-green-800' }
    };

    const config = variants[status as keyof typeof variants] || variants.draft;
    
    return (
      <Badge className={config.color}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            {nextSteps.title}
          </CardTitle>
          {getStatusBadge()}
        </div>
        <p className="text-sm text-muted-foreground">
          {nextSteps.description}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Estimate Summary */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Total Amount</span>
            <span className="text-lg font-semibold">{formatCurrency(totalAmount)}</span>
          </div>
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>Invoice ID</span>
            <span className="font-mono">{invoiceId.slice(0, 8)}...</span>
          </div>
        </div>

        {/* Action Buttons */}
        {nextSteps.actions.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Next Actions:</h4>
            <div className="grid grid-cols-1 gap-2">
              {nextSteps.actions.map((action) => (
                <Button
                  key={action.id}
                  variant={action.variant}
                  onClick={action.onClick}
                  disabled={actionLoading === action.id}
                  className="w-full justify-start"
                  size="sm"
                >
                  <action.icon className="h-4 w-4 mr-2" />
                  {actionLoading === action.id ? 'Loading...' : action.label}
                  {action.primary && <ArrowRight className="h-4 w-4 ml-auto" />}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin')}
            >
              Back to Dashboard
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePreview}
            >
              <Eye className="h-4 w-4 mr-2" />
              Quick Preview
            </Button>
          </div>
        </div>

        {/* Email Preview Modal */}
        {estimateData && (
          <EmailPreviewModal
            isOpen={showEmailPreview}
            onClose={() => setShowEmailPreview(false)}
            estimateData={estimateData}
            lineItems={lineItems}
            onEmailSent={handleEmailSent}
          />
        )}
      </CardContent>
    </Card>
  );
}
