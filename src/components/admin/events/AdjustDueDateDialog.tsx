import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { parseDateFromLocalString } from '@/utils/dateHelpers';
import { getMilestoneLabel } from '@/utils/paymentFormatters';

export interface AdjustableMilestone { id: string; milestone_type: string; due_date: string | null }

/** Saves an agreed due date on a milestone and leaves an internal note. Shared by schedule + contact log. */
export async function saveAgreedDueDate(opts: {
  milestone: AdjustableMilestone; newDate: string; quoteId?: string | null; invoiceId?: string | null;
  reason?: string; author: string;
}) {
  const { milestone, newDate, quoteId, invoiceId, reason, author } = opts;
  const { error } = await supabase.from('payment_milestones')
    .update({ due_date: newDate, is_due_now: false }).eq('id', milestone.id);
  if (error) throw error;
  if (quoteId) {
    const label = getMilestoneLabel(milestone.milestone_type as any) || milestone.milestone_type;
    const from = milestone.due_date ? format(parseDateFromLocalString(milestone.due_date), 'MMM d, yyyy') : 'due now';
    const to = format(parseDateFromLocalString(newDate), 'MMM d, yyyy');
    await supabase.from('admin_notes').insert({
      quote_request_id: quoteId, category: 'note', is_internal: true, created_by: author,
      note_content: `${label} due date changed from ${from} to ${to}${reason?.trim() ? ` — ${reason.trim()}` : ''}`,
    });
  }
  if (invoiceId) {
    await supabase.from('invoices').update({ last_customer_interaction: new Date().toISOString() }).eq('id', invoiceId);
  }
}

export const todayStr = () => format(new Date(), 'yyyy-MM-dd');

export function invalidatePaymentViews(qc: ReturnType<typeof useQueryClient>, quoteId?: string | null) {
  // Due dates feed lists, calendars, billing, portal previews — refresh everything.
  void quoteId;
  qc.invalidateQueries();
}

interface Props {
  open: boolean; onOpenChange: (o: boolean) => void;
  milestone: AdjustableMilestone | null; quoteId?: string | null; invoiceId?: string | null;
  onSaved?: () => void;
}

export function AdjustDueDateDialog({ open, onOpenChange, milestone, quoteId, invoiceId, onSaved }: Props) {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (open) { setDate(milestone?.due_date && milestone.due_date >= todayStr() ? milestone.due_date : todayStr()); setReason(''); }
  }, [open, milestone]);

  const save = useMutation({
    mutationFn: () => saveAgreedDueDate({ milestone: milestone!, newDate: date, quoteId, invoiceId, reason, author: user?.email || 'admin' }),
    onSuccess: () => {
      invalidatePaymentViews(qc, quoteId);
      toast({ title: 'Due date updated', description: `Now due ${format(parseDateFromLocalString(date), 'MMM d, yyyy')}.` });
      onOpenChange(false); onSaved?.();
    },
    onError: (e: any) => toast({ title: 'Could not update', description: e.message, variant: 'destructive' }),
  });

  const invalid = !date || date < todayStr();
  const label = milestone ? getMilestoneLabel(milestone.milestone_type as any) || milestone.milestone_type : '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Change Due Date</DialogTitle>
          <DialogDescription>
            {label} — use this when you've agreed on a new date with the customer. It won't show as overdue until this date passes.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="agreed-date">New due date</Label>
            <Input id="agreed-date" type="date" min={todayStr()} value={date} onChange={e => setDate(e.target.value)} className="h-11" />
            {date && date < todayStr() && <p className="text-xs text-destructive">Pick today or a future date.</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="agreed-reason">Reason (optional, internal)</Label>
            <Textarea id="agreed-reason" rows={3} maxLength={500} value={reason} onChange={e => setReason(e.target.value)}
              placeholder="e.g. Agreed by phone — paying Friday after payday" />
          </div>
          <p className="text-xs text-muted-foreground">Note: using "Regenerate schedule" later resets dates to the standard schedule.</p>
        </div>
        <DialogFooter className="flex-row gap-2">
          <Button variant="outline" className="flex-1 h-11" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="flex-1 h-11" disabled={invalid || !milestone || save.isPending} onClick={() => save.mutate()}>
            {save.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />} Save Date
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
