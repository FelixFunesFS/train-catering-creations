/**
 * Unified Payment Card Component
 * 
 * Handles both pre-approval (read-only schedule) and post-approval (payment actions) states.
 * Consolidates PaymentProgress and PaymentOptions into a single, adaptive component.
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePaymentCheckout } from '@/hooks/usePaymentCheckout';
import { 
  formatPaymentCurrency, 
  getMilestoneLabel, 
  getMilestoneStatus, 
  calculatePaymentProgress,
  getNextDueMilestone,
  type Milestone 
} from '@/utils/paymentFormatters';
import { formatDate } from '@/utils/formatters';
import { 
  Clock, 
  CreditCard, 
  DollarSign, 
  Loader2, 
  Wallet,
  CheckCircle2,
  PartyPopper
} from 'lucide-react';

interface PaymentCardProps {
  invoiceId: string;
  totalAmount: number;
  milestones: Milestone[];
  workflowStatus: string;
  customerEmail: string;
  accessToken: string;
}

export function PaymentCard({
  invoiceId,
  totalAmount,
  milestones,
  workflowStatus,
  accessToken,
}: PaymentCardProps) {
  const { initiatePayment, isProcessing } = usePaymentCheckout();
  const [customAmount, setCustomAmount] = useState('');

  const showPaymentActions = ['approved', 'partially_paid', 'payment_pending'].includes(workflowStatus);
  const { amountPaid, remaining, percentComplete } = calculatePaymentProgress(milestones);
  
  const nextDueMilestone = getNextDueMilestone(milestones);
  const nextUpcomingMilestone = milestones.find(m => m.status !== 'paid');

  // Handlers
  const handlePayMilestone = (milestone: Milestone) => {
    initiatePayment({
      invoiceId,
      accessToken,
      paymentType: 'milestone',
      amount: milestone.amount_cents,
      milestoneId: milestone.id,
    });
  };

  const handlePayCustom = () => {
    const amountInCents = Math.round(parseFloat(customAmount) * 100);
    if (amountInCents > 0 && amountInCents <= remaining) {
      initiatePayment({
        invoiceId,
        accessToken,
        paymentType: 'custom',
        amount: amountInCents,
      });
    }
  };

  const handlePayFull = () => {
    initiatePayment({
      invoiceId,
      accessToken,
      paymentType: 'full',
      amount: remaining,
    });
  };

  // If no milestones, don't render
  if (!milestones || milestones.length === 0) {
    return null;
  }

  // Fully paid state
  if (remaining <= 0) {
    return (
      <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20">
        <CardContent className="pt-6 space-y-4">
          <div className="text-center space-y-2">
            <PartyPopper className="h-10 w-10 text-emerald-600 mx-auto" />
            <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">
              All Payments Complete!
            </h3>
            <p className="text-sm text-emerald-600 dark:text-emerald-500">
              Thank you for your payment of {formatPaymentCurrency(totalAmount)}
            </p>
          </div>
          
          {/* Show payment history */}
          <div className="pt-4 border-t border-emerald-200 dark:border-emerald-800">
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400 mb-2">Payment Summary</p>
            <div className="space-y-2">
              {milestones.map((milestone, index) => (
                <div 
                  key={milestone.id || index}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-2 text-emerald-600 dark:text-emerald-500">
                    <CheckCircle2 className="h-4 w-4" />
                    {getMilestoneLabel(milestone.milestone_type)}
                  </span>
                  <span className="font-medium text-emerald-700 dark:text-emerald-400">
                    {formatPaymentCurrency(milestone.amount_cents)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          {showPaymentActions ? (
            <>
              <CreditCard className="h-5 w-5 text-primary" />
              Make a Payment
            </>
          ) : (
            <>
              <Clock className="h-5 w-5 text-primary" />
              Payment Schedule
            </>
          )}
        </CardTitle>
        {showPaymentActions && (
          <CardDescription>
            Balance remaining: {formatPaymentCurrency(remaining)}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress Section */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Payment Progress</span>
            <span className="font-medium text-foreground">{percentComplete}% Complete</span>
          </div>
          <Progress value={percentComplete} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Paid: {formatPaymentCurrency(amountPaid)}</span>
            <span>Remaining: {formatPaymentCurrency(remaining)}</span>
          </div>
        </div>

        {/* Milestone Schedule */}
        <div className="space-y-3">
          {milestones.map((milestone, index) => {
            const { isPaid, isDue } = getMilestoneStatus(milestone);

            return (
              <div
                key={milestone.id || index}
                className={`flex items-center justify-between py-3 px-3 rounded-lg border ${
                  isPaid
                    ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
                    : isDue
                      ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'
                      : 'bg-muted/30 border-border/50'
                }`}
              >
                <div>
                  <p className="font-medium text-foreground flex items-center gap-2">
                    {getMilestoneLabel(milestone.milestone_type)}
                    {isPaid && (
                      <Badge variant="outline" className="bg-green-100 text-green-700 text-xs">
                        ✓ Paid
                      </Badge>
                    )}
                    {isDue && (
                      <Badge variant="outline" className="bg-amber-100 text-amber-700 text-xs">
                        Due Now
                      </Badge>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {milestone.percentage}% of total
                    {milestone.due_date && !isPaid && ` • Due ${formatDate(milestone.due_date)}`}
                  </p>
                </div>
                <p className={`font-semibold ${isPaid ? 'text-green-600' : ''}`}>
                  {formatPaymentCurrency(milestone.amount_cents)}
                </p>
              </div>
            );
          })}
        </div>

        {/* Payment Actions - Only after approval */}
        {showPaymentActions && (
          <Tabs defaultValue={nextDueMilestone ? 'scheduled' : 'full'} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="scheduled" disabled={!nextUpcomingMilestone}>
                Scheduled
              </TabsTrigger>
              <TabsTrigger value="custom">
                Custom
              </TabsTrigger>
              <TabsTrigger value="full">
                Full Balance
              </TabsTrigger>
            </TabsList>

            {/* Scheduled Payment Tab */}
            <TabsContent value="scheduled" className="space-y-4 mt-4">
              {nextDueMilestone && getMilestoneStatus(nextDueMilestone).isDue ? (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-2">
                    Payment Due Now
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-foreground">
                      {getMilestoneLabel(nextDueMilestone.milestone_type)} ({nextDueMilestone.percentage}%)
                    </span>
                    <span className="font-bold text-lg">
                      {formatPaymentCurrency(nextDueMilestone.amount_cents)}
                    </span>
                  </div>
                  <Button
                    onClick={() => handlePayMilestone(nextDueMilestone)}
                    disabled={isProcessing}
                    className="w-full mt-3"
                  >
                    {isProcessing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Wallet className="mr-2 h-4 w-4" />
                    )}
                    Pay {formatPaymentCurrency(nextDueMilestone.amount_cents)}
                  </Button>
                </div>
              ) : nextUpcomingMilestone ? (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Next Scheduled Payment
                  </p>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-foreground block">
                        {getMilestoneLabel(nextUpcomingMilestone.milestone_type)}
                      </span>
                      {nextUpcomingMilestone.due_date && (
                        <span className="text-xs text-muted-foreground">
                          Due: {formatDate(nextUpcomingMilestone.due_date)}
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-lg">
                      {formatPaymentCurrency(nextUpcomingMilestone.amount_cents)}
                    </span>
                  </div>
                  <Button
                    onClick={() => handlePayMilestone(nextUpcomingMilestone)}
                    disabled={isProcessing}
                    variant="outline"
                    className="w-full mt-3"
                  >
                    {isProcessing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Wallet className="mr-2 h-4 w-4" />
                    )}
                    Pay Early
                  </Button>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  No scheduled payments remaining.
                </p>
              )}
            </TabsContent>

            {/* Custom Amount Tab */}
            <TabsContent value="custom" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="custom-amount">Enter Amount</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="custom-amount"
                    type="number"
                    min="1"
                    max={remaining / 100}
                    step="0.01"
                    placeholder="0.00"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Maximum: {formatPaymentCurrency(remaining)}
                </p>
              </div>
              <Button
                onClick={handlePayCustom}
                disabled={isProcessing || !customAmount || parseFloat(customAmount) <= 0}
                className="w-full"
              >
                {isProcessing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="mr-2 h-4 w-4" />
                )}
                Pay ${customAmount || '0.00'}
              </Button>
            </TabsContent>

            {/* Full Balance Tab */}
            <TabsContent value="full" className="space-y-4 mt-4">
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex justify-between items-center">
                  <span className="text-foreground">Full Remaining Balance</span>
                  <span className="font-bold text-xl text-primary">
                    {formatPaymentCurrency(remaining)}
                  </span>
                </div>
              </div>
              <Button
                onClick={handlePayFull}
                disabled={isProcessing}
                className="w-full"
                size="lg"
              >
                {isProcessing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="mr-2 h-4 w-4" />
                )}
                Pay Full Balance
              </Button>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
