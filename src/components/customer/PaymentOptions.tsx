import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePaymentCheckout } from '@/hooks/usePaymentCheckout';
import { PaymentProgress } from './PaymentProgress';
import { CreditCard, DollarSign, Loader2, Wallet } from 'lucide-react';

interface Milestone {
  id: string;
  milestone_type: string;
  amount_cents: number;
  percentage: number;
  status: string | null;
  due_date: string | null;
  is_due_now: boolean | null;
}

interface PaymentOptionsProps {
  invoiceId: string;
  totalAmount: number;
  amountPaid: number;
  milestones: Milestone[];
  customerEmail: string;
}

export function PaymentOptions({
  invoiceId,
  totalAmount,
  amountPaid,
  milestones,
}: PaymentOptionsProps) {
  const { initiatePayment, isProcessing } = usePaymentCheckout();
  const [customAmount, setCustomAmount] = useState('');
  
  const remaining = totalAmount - amountPaid;
  const nextDueMilestone = milestones.find(m => m.status !== 'paid' && (m.is_due_now || (m.due_date && new Date(m.due_date) <= new Date())));
  const nextUpcomingMilestone = milestones.find(m => m.status !== 'paid');

  const formatCurrency = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const handlePayMilestone = (milestone: Milestone) => {
    initiatePayment({
      invoiceId,
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
        paymentType: 'custom',
        amount: amountInCents,
      });
    }
  };

  const handlePayFull = () => {
    initiatePayment({
      invoiceId,
      paymentType: 'full',
      amount: remaining,
    });
  };

  if (remaining <= 0) {
    return (
      <Card className="border-emerald-200 dark:border-emerald-800">
        <CardContent className="pt-6">
          <PaymentProgress 
            totalAmount={totalAmount} 
            amountPaid={amountPaid} 
            milestones={milestones} 
          />
          <p className="text-center text-emerald-600 font-medium mt-4">
            All payments complete. Thank you!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Make a Payment
        </CardTitle>
        <CardDescription>
          Balance remaining: {formatCurrency(remaining)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Progress */}
        <PaymentProgress 
          totalAmount={totalAmount} 
          amountPaid={amountPaid} 
          milestones={milestones} 
        />

        {/* Payment Options Tabs */}
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
            {nextDueMilestone ? (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-2">
                  Payment Due Now
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-foreground">
                    {nextDueMilestone.milestone_type.replace('_', ' ')} ({nextDueMilestone.percentage}%)
                  </span>
                  <span className="font-bold text-lg">
                    {formatCurrency(nextDueMilestone.amount_cents)}
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
                  Pay {formatCurrency(nextDueMilestone.amount_cents)}
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
                      {nextUpcomingMilestone.milestone_type.replace('_', ' ')}
                    </span>
                    {nextUpcomingMilestone.due_date && (
                      <span className="text-xs text-muted-foreground">
                        Due: {new Date(nextUpcomingMilestone.due_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-lg">
                    {formatCurrency(nextUpcomingMilestone.amount_cents)}
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
                Maximum: {formatCurrency(remaining)}
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
                  {formatCurrency(remaining)}
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
      </CardContent>
    </Card>
  );
}
