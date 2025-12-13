import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { StandardTermsAndConditions } from '@/components/shared/StandardTermsAndConditions';
import { ChangesSummaryBanner } from './ChangesSummaryBanner';
import { TermsAcceptanceModal } from './TermsAcceptanceModal';
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
  FileText,
  AlertCircle
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface EstimateData {
  id: string;
  invoice_number: string;
  total_amount: number;
  tax_amount?: number;
  workflow_status: string;
  created_at: string;
  updated_at: string;
  requires_separate_contract?: boolean;
  include_terms_and_conditions?: boolean;
  quote_requests: {
    id: string;
    contact_name: string;
    event_name: string;
    event_date: string;
    event_type: string;
    location: string;
    guest_count: number;
    email: string;
    compliance_level?: string;
  };
  payment_milestones?: Array<{
    id: string;
    description: string;
    amount_cents: number;
    due_date: string;
    milestone_type: string;
  }>;
  invoice_line_items?: Array<{
    id: string;
    title: string;
    description?: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    category?: string;
  }>;
}

interface EstimateApprovalWorkflowProps {
  estimate: EstimateData;
  onApproval?: () => void;
  onRequestChanges?: () => void;
}

export function EstimateApprovalWorkflow({ 
  estimate, 
  onApproval, 
  onRequestChanges 
}: EstimateApprovalWorkflowProps) {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isApproved, setIsApproved] = useState(estimate.workflow_status === 'approved');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const { toast } = useToast();
  
  const needsTermsAcceptance = estimate.include_terms_and_conditions;
  const quoteData = estimate.quote_requests;
  const termsType = quoteData.event_type === 'wedding' || quoteData.event_type === 'second_wedding' ? 'wedding' : 'standard';

  const handleInitiateApproval = () => {
    setShowTermsModal(true);
  };

  const handleTermsAccept = async () => {
    setLoading(true);
    try {
      const { error: invoiceError } = await supabase
        .from('invoices')
        .update({
          workflow_status: 'approved',
          status_changed_by: 'customer',
          customer_feedback: { approval_feedback: feedback },
          terms_accepted_at: new Date().toISOString()
        })
        .eq('id', estimate.id);

      if (invoiceError) throw invoiceError;

      const { error: quoteError } = await supabase
        .from('quote_requests')
        .update({
          workflow_status: 'approved',
          status_changed_by: 'customer',
          last_customer_interaction: new Date().toISOString()
        })
        .eq('id', estimate.quote_requests.id);

      if (quoteError) throw quoteError;

      // Send admin notification
      try {
        await supabase.functions.invoke('send-admin-notification', {
          body: {
            invoiceId: estimate.id,
            notificationType: 'customer_approval',
            metadata: { feedback }
          }
        });
      } catch (notifError) {
        console.error('Admin notification failed (non-critical):', notifError);
      }

      setIsApproved(true);
      setShowTermsModal(false);
      toast({
        title: "Estimate Approved!",
        description: "Thank you! You can now proceed to secure your event date with payment.",
      });

      onApproval?.();
    } catch (error: any) {
      console.error('Approval error:', error);
      toast({
        title: "Approval Failed",
        description: error.message || "Unable to approve estimate. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (paymentType: 'full' | 'deposit') => {
    setPaymentLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          invoice_id: estimate.id,
          payment_type: paymentType,
          success_url: `${window.location.origin}/payment-success`,
          cancel_url: window.location.href
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to start payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Event Details Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Event Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{estimate.quote_requests.event_name}</h3>
                <div className="space-y-1 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(estimate.quote_requests.event_date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {estimate.quote_requests.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {estimate.quote_requests.guest_count} guests
                  </div>
                </div>
              </div>
              <Badge variant={isApproved ? "default" : "secondary"} className="text-sm">
                {isApproved ? 'Approved' : 'Pending Approval'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Approval Section */}
      {!isApproved && (
        <Card>
          <CardHeader>
            <CardTitle>Ready to Approve?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="feedback">Comments or Questions (Optional)</Label>
              <Textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Any feedback, questions, or special requests..."
                rows={3}
                className="mt-2"
              />
            </div>

            <Button 
              onClick={handleInitiateApproval}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              <CheckCircle2 className="mr-2 h-5 w-5" />
              Approve This Estimate
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              By approving, you agree to our Terms & Conditions
            </p>
          </CardContent>
        </Card>
      )}

      {/* Payment Section */}
      {isApproved && (
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <DollarSign className="h-5 w-5" />
              Secure Your Event Date
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Your estimate has been approved! Choose your payment option below to secure your event date.
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => handlePayment('deposit')}
                disabled={paymentLoading}
                variant="outline"
                size="lg"
                className="h-auto py-6 flex-col items-start"
              >
                <div className="font-semibold mb-1">50% Deposit</div>
                <div className="text-2xl font-bold mb-1">
                  {formatCurrency((estimate.total_amount / 100) * 0.5)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Balance due 14 days before event
                </div>
              </Button>

              <Button
                onClick={() => handlePayment('full')}
                disabled={paymentLoading}
                variant="default"
                size="lg"
                className="h-auto py-6 flex-col items-start"
              >
                <div className="font-semibold mb-1">Full Payment</div>
                <div className="text-2xl font-bold mb-1">
                  {formatCurrency(estimate.total_amount / 100)}
                </div>
                <div className="text-xs">
                  Pay in full today
                </div>
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Secure payment processing by Stripe
            </p>
          </CardContent>
        </Card>
      )}

      <TermsAcceptanceModal
        open={showTermsModal}
        onAccept={handleTermsAccept}
        onCancel={() => setShowTermsModal(false)}
        eventType={termsType}
        loading={loading}
      />
    </div>
  );
}
