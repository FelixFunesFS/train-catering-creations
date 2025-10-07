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
import { getEventTermsType } from '@/utils/contractRequirements';
import { ChangesSummaryBanner } from './ChangesSummaryBanner';
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
  status: string;
  created_at: string;
  updated_at: string;
  requires_separate_contract?: boolean;
  include_terms_and_conditions?: boolean;
  quote_requests: {
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
  const [isApproved, setIsApproved] = useState(estimate.status === 'approved');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { toast } = useToast();
  
  const needsTermsAcceptance = !estimate.requires_separate_contract && estimate.include_terms_and_conditions;
  const termsType = getEventTermsType(estimate.quote_requests);

  const handleApprove = async () => {
    // Check T&C acceptance if required
    if (needsTermsAcceptance && !termsAccepted) {
      toast({
        title: "Terms & Conditions Required",
        description: "Please accept the Terms & Conditions before approving the estimate.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Use workflow orchestration service for proper event handling
      const { WorkflowOrchestrationService } = await import('@/services/WorkflowOrchestrationService');

      // Record T&C acceptance if needed
      if (needsTermsAcceptance) {
        await supabase
          .from('invoices')
          .update({ terms_accepted_at: new Date().toISOString() })
          .eq('id', estimate.id);
      }

      // Orchestrated approval - handles notifications, status sync, payments
      const result = await WorkflowOrchestrationService.handleCustomerApproval(
        estimate.id,
        feedback || undefined
      );

      if (!result.success) throw new Error('Approval failed');

      toast({
        title: "✅ Estimate Approved!",
        description: "Payment options are now available below.",
      });

      setIsApproved(true);
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


  const handlePayDeposit = async () => {
    setProcessingPayment(true);
    try {
      // Find deposit milestone or use 50% of total
      const depositMilestone = estimate.payment_milestones?.find(m => 
        m.milestone_type === 'deposit' || m.milestone_type === 'initial'
      );
      
      const depositAmount = depositMilestone 
        ? depositMilestone.amount_cents 
        : Math.round(estimate.total_amount * 0.5); // 50% deposit (already in cents)

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          invoice_id: estimate.id,
          payment_type: 'deposit',
          success_url: `${window.location.origin}/payment/success`,
          cancel_url: window.location.href,
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
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          invoice_id: estimate.id,
          payment_type: 'full',
          success_url: `${window.location.origin}/payment/success`,
          cancel_url: window.location.href,
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

  if (isApproved) {
    return (
      <Card className="w-full border-green-200 dark:border-green-800">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
          <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
            <CheckCircle2 className="h-6 w-6" />
            Estimate Approved ✅
          </CardTitle>
          <p className="text-sm text-green-600 dark:text-green-400">
            {estimate.quote_requests.event_name} • {new Date(estimate.quote_requests.event_date).toLocaleDateString()}
          </p>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* Approval Summary */}
          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              What You Approved
            </h3>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Event Date:</span>
                <span className="font-medium">{new Date(estimate.quote_requests.event_date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location:</span>
                <span className="font-medium">{estimate.quote_requests.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Guest Count:</span>
                <span className="font-medium">{estimate.quote_requests.guest_count} guests</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-base">
                <span className="font-semibold">Total Amount:</span>
                <span className="font-bold text-green-700 dark:text-green-400">{formatCurrency(estimate.total_amount / 100)}</span>
              </div>
            </div>
          </div>

          {/* Payment Options Title */}
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2">Choose Your Payment Option</h3>
            <p className="text-sm text-muted-foreground">Select how you'd like to pay to secure your event date</p>
          </div>

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
                  {formatCurrency((estimate.total_amount / 100) * 0.5)}
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
                  {formatCurrency(estimate.total_amount / 100)}
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

          <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <Clock className="h-4 w-4 text-blue-600" />
            <AlertDescription>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                📅 What Happens Next
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4">
                <li>1. Complete your payment using one of the options above</li>
                <li>2. Your event date will be secured immediately</li>
                <li>3. You'll receive a service agreement via email within 24 hours</li>
                <li>4. We'll confirm final details 1 week before your event</li>
                {estimate.payment_milestones?.some(m => m.milestone_type === 'deposit') && (
                  <li>5. If paying deposit: remainder due 10 days before event</li>
                )}
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Show pending change request banner */}
      {estimate.status === 'change_requested' && (
        <Alert className="mb-6 bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800">
          <Clock className="h-4 w-4 text-yellow-600" />
          <AlertDescription>
            <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
              ✏️ Change Request Pending Review
            </h4>
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              We've received your change request and are reviewing it now. 
              We'll send you an updated estimate within 24 hours with revised pricing.
            </p>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Show changes summary if estimate was recently updated */}
      {estimate.updated_at && new Date(estimate.updated_at).getTime() > new Date(estimate.created_at).getTime() && (
        <ChangesSummaryBanner 
          updatedAt={estimate.updated_at}
          status="approved"
        />
      )}
      
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
                <strong>Total:</strong> {formatCurrency(estimate.total_amount / 100)}
              </span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Line Items Breakdown */}
        <div className="space-y-3">
          <h3 className="font-semibold text-base">What's Included</h3>
          {estimate.invoice_line_items && estimate.invoice_line_items.length > 0 ? (
            <div className="space-y-2">
              {estimate.invoice_line_items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start gap-4 py-2 border-b last:border-0">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.title}</p>
                    {item.description && (
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-medium text-sm">{formatCurrency(item.total_price / 100)}</p>
                    {item.quantity > 1 && (
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} × {formatCurrency(item.unit_price / 100)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Line items are being prepared. Please refresh the page if they don't appear.
              </AlertDescription>
            </Alert>
          )}
          
          {/* Totals Summary */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>{formatCurrency((estimate.total_amount - (estimate.tax_amount || 0)) / 100)}</span>
            </div>
            {estimate.tax_amount && estimate.tax_amount > 0 && (
              <div className="flex justify-between text-sm">
                <span>Tax:</span>
                <span>{formatCurrency(estimate.tax_amount / 100)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-bold text-base">
              <span>Total:</span>
              <span>{formatCurrency(estimate.total_amount / 100)}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Terms & Conditions (if included) */}
        {needsTermsAcceptance && (
          <>
            <Separator />
            <StandardTermsAndConditions eventType={termsType} variant="compact" />
            
            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
              <Checkbox
                id="terms-acceptance"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
              />
              <Label htmlFor="terms-acceptance" className="text-sm leading-relaxed cursor-pointer">
                I have read and agree to the Terms & Conditions above. By approving this estimate, 
                I acknowledge these terms will serve as our service agreement.
              </Label>
            </div>
          </>
        )}

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
              onClick={onRequestChanges}
              disabled={loading}
              variant="outline"
              className="flex-1 gap-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
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
    </div>
  );
}