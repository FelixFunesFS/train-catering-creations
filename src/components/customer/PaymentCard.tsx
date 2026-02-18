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
  calculateMilestoneBalances,
  type Milestone,
  type EnrichedMilestone,
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
  totalPaidFromTransactions?: number;
}

export function PaymentCard({
  invoiceId,
  totalAmount,
  milestones,
  workflowStatus,
  accessToken,
  totalPaidFromTransactions,
}: PaymentCardProps) {
  const { initiatePayment, isProcessing } = usePaymentCheckout();
  const [customAmount, setCustomAmount] = useState('');

  const showPaymentActions = ['approved', 'partially_paid', 'payment_pending'].includes(workflowStatus);
  const { amountPaid, remaining, percentComplete } = calculatePaymentProgress(milestones, totalPaidFromTransactions);
  
  // Calculate per-milestone remaining balances using waterfall
  const enrichedMilestones = calculateMilestoneBalances(milestones, totalPaidFromTransactions ?? 0);
  
  // Find next due/upcoming from enriched milestones (with remaining balances)
  const nextDueEnriched = enrichedMilestones.find(m => {
    const { isDue } = getMilestoneStatus(m);
    return isDue && m.remainingCents > 0;
  });
  const nextUpcomingEnriched = enrichedMilestones.find(m => m.remainingCents > 0 && m.status !== 'paid');

  const nextDueMilestone = getNextDueMilestone(milestones);
  const nextUpcomingMilestone = milestones.find(m => m.status !== 'paid');

  // Handlers
  const handlePayMilestone = (milestone: EnrichedMilestone) => {
    // Send the remaining amount as a custom payment to prevent overcharging
    initiatePayment({
      invoiceId,
      accessToken,
      paymentType: 'custom',
      amount: milestone.remainingCents,
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
        {/* Desktop Quick Pay CTA - Above everything */}
        {showPaymentActions && (nextDueEnriched || nextUpcomingEnriched) && (
          <div className="hidden lg:block">
            {nextDueEnriched && getMilestoneStatus(nextDueEnriched).isDue ? (
              <div className="p-4 bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-950/40 dark:to-amber-900/20 rounded-lg border-2 border-amber-300 dark:border-amber-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-2">
                      <span className="inline-block w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                      {getMilestoneLabel(nextDueEnriched.milestone_type)} Due Now
                    </p>
                    <p className="text-2xl font-bold text-amber-900 dark:text-amber-200 mt-1">
                      {formatPaymentCurrency(nextDueEnriched.remainingCents)}
                    </p>
                    {nextDueEnriched.remainingCents < nextDueEnriched.amount_cents && (
                      <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                        {formatPaymentCurrency(nextDueEnriched.appliedCents)} already applied
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={() => handlePayMilestone(nextDueEnriched)}
                    disabled={isProcessing}
                    size="lg"
                    className="shadow-lg"
                  >
                    {isProcessing ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <Wallet className="mr-2 h-5 w-5" />
                    )}
                    Pay Now
                  </Button>
                </div>
              </div>
            ) : nextUpcomingEnriched ? (
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Next Payment: {getMilestoneLabel(nextUpcomingEnriched.milestone_type)}
                    </p>
                    <p className="text-xl font-bold text-foreground mt-1">
                      {formatPaymentCurrency(nextUpcomingEnriched.remainingCents)}
                    </p>
                    {nextUpcomingEnriched.remainingCents < nextUpcomingEnriched.amount_cents && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatPaymentCurrency(nextUpcomingEnriched.appliedCents)} already applied
                      </p>
                    )}
                    {nextUpcomingEnriched.due_date && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Due: {formatDate(nextUpcomingEnriched.due_date)}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={() => handlePayMilestone(nextUpcomingEnriched)}
                    disabled={isProcessing}
                    variant="outline"
                    size="lg"
                  >
                    {isProcessing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Wallet className="mr-2 h-4 w-4" />
                    )}
                    Pay Early
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        )}

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
          {enrichedMilestones.map((milestone, index) => {
            const { isPaid, isDue } = getMilestoneStatus(milestone);
            const hasPartialPayment = !isPaid && milestone.appliedCents > 0;

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
                  {hasPartialPayment && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatPaymentCurrency(milestone.appliedCents)} applied
                    </p>
                  )}
                </div>
                <div className="text-right">
                  {isPaid ? (
                    <p className="font-semibold text-green-600">
                      {formatPaymentCurrency(milestone.amount_cents)}
                    </p>
                  ) : hasPartialPayment ? (
                    <>
                      <p className="font-semibold">
                        {formatPaymentCurrency(milestone.remainingCents)}
                      </p>
                      <p className="text-xs text-muted-foreground line-through">
                        {formatPaymentCurrency(milestone.amount_cents)}
                      </p>
                    </>
                  ) : (
                    <p className="font-semibold">
                      {formatPaymentCurrency(milestone.amount_cents)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Payment Actions - Only after approval */}
        {showPaymentActions && (
          <>
            {/* Mobile: Full Tabs Interface */}
            <div className="lg:hidden">
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
                  {nextDueEnriched && getMilestoneStatus(nextDueEnriched).isDue ? (
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-2">
                        Payment Due Now
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-foreground">
                          {getMilestoneLabel(nextDueEnriched.milestone_type)} ({nextDueEnriched.percentage}%)
                        </span>
                        <span className="font-bold text-lg">
                          {formatPaymentCurrency(nextDueEnriched.remainingCents)}
                        </span>
                      </div>
                      {nextDueEnriched.remainingCents < nextDueEnriched.amount_cents && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatPaymentCurrency(nextDueEnriched.appliedCents)} already applied
                        </p>
                      )}
                      <Button
                        onClick={() => handlePayMilestone(nextDueEnriched)}
                        disabled={isProcessing}
                        className="w-full mt-3"
                      >
                        {isProcessing ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Wallet className="mr-2 h-4 w-4" />
                        )}
                        Pay {formatPaymentCurrency(nextDueEnriched.remainingCents)}
                      </Button>
                    </div>
                  ) : nextUpcomingEnriched ? (
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm font-medium text-muted-foreground mb-2">
                        Next Scheduled Payment
                      </p>
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-foreground block">
                            {getMilestoneLabel(nextUpcomingEnriched.milestone_type)}
                          </span>
                          {nextUpcomingEnriched.due_date && (
                            <span className="text-xs text-muted-foreground">
                              Due: {formatDate(nextUpcomingEnriched.due_date)}
                            </span>
                          )}
                        </div>
                        <span className="font-bold text-lg">
                          {formatPaymentCurrency(nextUpcomingEnriched.remainingCents)}
                        </span>
                      </div>
                      {nextUpcomingEnriched.remainingCents < nextUpcomingEnriched.amount_cents && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatPaymentCurrency(nextUpcomingEnriched.appliedCents)} already applied
                        </p>
                      )}
                      <Button
                        onClick={() => handlePayMilestone(nextUpcomingEnriched)}
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
                    <Label htmlFor="custom-amount-mobile">Enter Amount</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="custom-amount-mobile"
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
            </div>

            {/* Desktop: Compact Other Options */}
            <div className="hidden lg:block space-y-3">
              <p className="text-sm font-medium text-muted-foreground">Other Payment Options</p>
              <div className="flex gap-3">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="custom-amount-desktop" className="text-xs">Custom Amount</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="custom-amount-desktop"
                        type="number"
                        min="1"
                        max={remaining / 100}
                        step="0.01"
                        placeholder="0.00"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        className="pl-9 h-9"
                      />
                    </div>
                    <Button
                      onClick={handlePayCustom}
                      disabled={isProcessing || !customAmount || parseFloat(customAmount) <= 0}
                      variant="outline"
                      size="sm"
                    >
                      {isProcessing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>Pay</>
                      )}
                    </Button>
                  </div>
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={handlePayFull}
                    disabled={isProcessing}
                    variant="secondary"
                    size="sm"
                    className="whitespace-nowrap"
                  >
                    {isProcessing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CreditCard className="mr-2 h-4 w-4" />
                    )}
                    Pay Full ({formatPaymentCurrency(remaining)})
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
