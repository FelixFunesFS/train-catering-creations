import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle2, 
  XCircle, 
  CreditCard, 
  MessageSquare, 
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Clock,
  FileText
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface EstimateData {
  id: string;
  invoice_number: string;
  total_amount: number;
  status: string;
  quote_requests: {
    contact_name: string;
    event_name: string;
    event_date: string;
    location: string;
    guest_count: number;
    email: string;
  };
  payment_milestones?: Array<{
    id: string;
    description: string;
    amount_cents: number;
    due_date: string;
    milestone_type: string;
  }>;
}

interface EstimateApprovalWorkflowProps {
  estimate: EstimateData;
  onApproval?: () => void;
  onRejection?: () => void;
}

export function EstimateApprovalWorkflow({ 
  estimate, 
  onApproval, 
  onRejection 
}: EstimateApprovalWorkflowProps) {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const { toast } = useToast();

  const handleApprove = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ 
          status: 'approved',
          customer_feedback: { 
            approved: true, 
            feedback: feedback,
            approved_at: new Date().toISOString()
          }
        })
        .eq('id', estimate.id);

      if (error) throw error;

      // Create change request entry for approval
      const { error: changeError } = await supabase
        .from('change_requests')
        .insert({
          invoice_id: estimate.id,
          customer_email: estimate.quote_requests.email,
          request_type: 'approval',
          status: 'approved',
          customer_comments: feedback || 'Estimate approved',
          requested_changes: { approved: true },
        });

      if (changeError) console.error('Error creating change request:', changeError);

      toast({
        title: "Estimate Approved!",
        description: "Your estimate has been approved. You can now proceed with payment.",
      });

      setShowPaymentOptions(true);
      onApproval?.();
    } catch (error: any) {
      console.error('Error approving estimate:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to approve estimate",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!feedback.trim()) {
      toast({
        title: "Feedback Required",
        description: "Please provide feedback about why you're rejecting this estimate.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ 
          status: 'rejected',
          customer_feedback: { 
            approved: false, 
            feedback: feedback,
            rejected_at: new Date().toISOString()
          }
        })
        .eq('id', estimate.id);

      if (error) throw error;

      // Create change request for rejection
      const { error: changeError } = await supabase
        .from('change_requests')
        .insert({
          invoice_id: estimate.id,
          customer_email: estimate.quote_requests.email,
          request_type: 'modification',
          status: 'pending',
          customer_comments: feedback,
          requested_changes: { rejected: true, reason: feedback },
        });

      if (changeError) console.error('Error creating change request:', changeError);

      toast({
        title: "Feedback Submitted",
        description: "Your feedback has been sent. We'll revise the estimate based on your comments.",
      });

      onRejection?.();
    } catch (error: any) {
      console.error('Error rejecting estimate:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit feedback",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePayDeposit = async () => {
    setProcessingPayment(true);
    try {
      // Find deposit milestone or use 50% of total
      const depositMilestone = estimate.payment_milestones?.find(m => 
        m.milestone_type === 'deposit' || m.milestone_type === 'initial'
      );
      
      const depositAmount = depositMilestone 
        ? depositMilestone.amount_cents 
        : Math.round(estimate.total_amount * 0.5 * 100); // 50% deposit in cents

      const { data, error } = await supabase.functions.invoke('create-payment-link', {
        body: {
          invoice_id: estimate.id,
          amount: depositAmount,
          customer_email: estimate.quote_requests.email,
          payment_type: 'deposit',
          description: `Deposit for ${estimate.quote_requests.event_name}`,
        }
      });

      if (error) throw error;

      // Open payment link in new tab
      if (data.url) {
        window.open(data.url, '_blank');
        toast({
          title: "Payment Link Opened",
          description: "Please complete your payment in the new tab.",
        });
      }
    } catch (error: any) {
      console.error('Error creating payment link:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create payment link",
        variant: "destructive",
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  const handlePayFull = async () => {
    setProcessingPayment(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment-link', {
        body: {
          invoice_id: estimate.id,
          amount: estimate.total_amount * 100, // Convert to cents
          customer_email: estimate.quote_requests.email,
          payment_type: 'full_payment',
          description: `Full payment for ${estimate.quote_requests.event_name}`,
        }
      });

      if (error) throw error;

      // Open payment link in new tab
      if (data.url) {
        window.open(data.url, '_blank');
        toast({
          title: "Payment Link Opened",
          description: "Please complete your payment in the new tab.",
        });
      }
    } catch (error: any) {
      console.error('Error creating payment link:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create payment link",
        variant: "destructive",
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  if (estimate.status === 'approved' || showPaymentOptions) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-5 w-5" />
            Estimate Approved - Choose Payment Option
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Great! Your estimate has been approved. Choose your payment option below to secure your event date.
            </AlertDescription>
          </Alert>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg">Deposit Payment</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Pay 50% now, remainder due 10 days before event
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-4">
                  {formatCurrency(estimate.total_amount * 0.5)}
                </div>
                <Button 
                  onClick={handlePayDeposit}
                  disabled={processingPayment}
                  className="w-full"
                  size="lg"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {processingPayment ? 'Processing...' : 'Pay Deposit'}
                </Button>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Secures your event date immediately
                </p>
              </CardContent>
            </Card>

            <Card className="border-secondary/20">
              <CardHeader>
                <CardTitle className="text-lg">Full Payment</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Pay the full amount now (often with a small discount)
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-4">
                  {formatCurrency(estimate.total_amount)}
                </div>
                <Button 
                  onClick={handlePayFull}
                  disabled={processingPayment}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {processingPayment ? 'Processing...' : 'Pay Full Amount'}
                </Button>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Complete payment with potential savings
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
              📅 Next Steps After Payment
            </h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Your event date will be secured immediately</li>
              <li>• You'll receive a service agreement via email</li>
              <li>• Final details will be confirmed 1 week before your event</li>
              <li>• If paying deposit: remainder due 10 days before event</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Review Your Estimate
        </CardTitle>
        <Badge variant={estimate.status === 'sent' ? 'default' : 'secondary'}>
          {estimate.status.charAt(0).toUpperCase() + estimate.status.slice(1)}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Event Details Summary */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <strong>Date:</strong> {new Date(estimate.quote_requests.event_date).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <strong>Location:</strong> {estimate.quote_requests.location}
              </span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <strong>Guests:</strong> {estimate.quote_requests.guest_count}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <strong>Total:</strong> {formatCurrency(estimate.total_amount)}
              </span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Feedback Section */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Comments or Questions (Optional)
            </label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Any questions about the estimate, special requests, or changes you'd like to make..."
              rows={3}
              className="resize-none"
            />
          </div>

          <Alert>
            <MessageSquare className="h-4 w-4" />
            <AlertDescription>
              Please review the estimate carefully. If you have any questions or need changes, 
              add them in the comments above before making your decision.
            </AlertDescription>
          </Alert>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            onClick={handleApprove}
            disabled={loading}
            className="flex-1 gap-2"
            size="lg"
          >
            <CheckCircle2 className="h-4 w-4" />
            {loading ? 'Processing...' : 'Approve Estimate'}
          </Button>
          
          <Button
            onClick={handleReject}
            disabled={loading}
            variant="destructive"
            className="flex-1 gap-2"
            size="lg"
          >
            <XCircle className="h-4 w-4" />
            {loading ? 'Processing...' : 'Request Changes'}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          After approval, you'll be able to make payment to secure your event date.
        </p>
      </CardContent>
    </Card>
  );
}