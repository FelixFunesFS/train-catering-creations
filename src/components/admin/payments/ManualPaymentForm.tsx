import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface ManualPaymentFormProps {
  invoiceId: string;
  customerEmail: string;
  balanceRemaining: number;
  milestones?: Array<{ id: string; description: string; amount_cents: number; status: string }>;
  onPaymentRecorded: () => void;
}

type PaymentMethod = 'cash' | 'check' | 'bank_transfer' | 'other';

export function ManualPaymentForm({ 
  invoiceId, 
  customerEmail, 
  balanceRemaining, 
  milestones = [],
  onPaymentRecorded 
}: ManualPaymentFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string>('');
  const { toast } = useToast();

  const pendingMilestones = milestones.filter(m => m.status === 'pending');

  const handleMilestoneSelect = (milestoneId: string) => {
    setSelectedMilestoneId(milestoneId);
    const milestone = milestones.find(m => m.id === milestoneId);
    if (milestone) {
      setAmount((milestone.amount_cents / 100).toFixed(2));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amountCents = Math.round(parseFloat(amount) * 100);
    
    if (isNaN(amountCents) || amountCents <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid payment amount',
        variant: 'destructive'
      });
      return;
    }

    if (amountCents > balanceRemaining) {
      toast({
        title: 'Amount Exceeds Balance',
        description: `Maximum payment is ${formatCurrency(balanceRemaining / 100)}`,
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      // Record the payment transaction
      const { error: transactionError } = await supabase
        .from('payment_transactions')
        .insert({
          invoice_id: invoiceId,
          customer_email: customerEmail,
          amount: amountCents,
          payment_type: 'manual',
          payment_method: paymentMethod,
          status: 'completed',
          processed_at: new Date().toISOString(),
          description: referenceNumber ? `Ref: ${referenceNumber}. ${notes}` : notes,
          milestone_id: selectedMilestoneId || null
        });

      if (transactionError) throw transactionError;

      // Also log to payment_history
      await supabase
        .from('payment_history')
        .insert({
          invoice_id: invoiceId,
          amount: amountCents,
          payment_method: paymentMethod,
          status: 'completed',
          notes: referenceNumber ? `Ref: ${referenceNumber}. ${notes}` : notes
        });

      // Update milestone status if one was selected
      if (selectedMilestoneId) {
        await supabase
          .from('payment_milestones')
          .update({ status: 'paid', updated_at: new Date().toISOString() })
          .eq('id', selectedMilestoneId);
      }

      // Check if invoice is now fully paid
      const { data: summaryData } = await supabase
        .from('payment_transactions')
        .select('amount')
        .eq('invoice_id', invoiceId)
        .eq('status', 'completed');

      const totalPaid = summaryData?.reduce((sum, t) => sum + t.amount, 0) || 0;
      
      const { data: invoice } = await supabase
        .from('invoices')
        .select('total_amount')
        .eq('id', invoiceId)
        .single();

      if (invoice && totalPaid >= invoice.total_amount) {
        await supabase
          .from('invoices')
          .update({
            workflow_status: 'paid',
            paid_at: new Date().toISOString()
          })
          .eq('id', invoiceId);
      } else if (totalPaid > 0) {
        await supabase
          .from('invoices')
          .update({ workflow_status: 'partially_paid' })
          .eq('id', invoiceId);
      }

      toast({
        title: 'Payment Recorded',
        description: `${formatCurrency(amountCents / 100)} payment has been recorded successfully.`
      });

      setOpen(false);
      resetForm();
      onPaymentRecorded();
    } catch (error) {
      console.error('Error recording payment:', error);
      toast({
        title: 'Error',
        description: 'Failed to record payment. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAmount('');
    setPaymentMethod('cash');
    setReferenceNumber('');
    setNotes('');
    setSelectedMilestoneId('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Record Payment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record Manual Payment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground">Balance Remaining</div>
            <div className="text-xl font-bold">{formatCurrency(balanceRemaining / 100)}</div>
          </div>

          {pendingMilestones.length > 0 && (
            <div className="space-y-2">
              <Label>Apply to Milestone (Optional)</Label>
              <Select value={selectedMilestoneId} onValueChange={handleMilestoneSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a milestone..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No specific milestone</SelectItem>
                  {pendingMilestones.map(m => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.description} - {formatCurrency(m.amount_cents / 100)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="amount">Payment Amount *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="pl-7"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Payment Method *</Label>
            <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="check">Check</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer / ACH</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference">Reference / Check Number</Label>
            <Input
              id="reference"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="e.g., Check #1234"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional payment notes..."
              rows={2}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Record Payment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}