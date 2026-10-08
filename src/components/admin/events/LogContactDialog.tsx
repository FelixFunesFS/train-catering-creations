import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
import { CONTACT_TYPES, FOLLOW_UP_SNOOZE_DAYS } from './ContactLogCard';
import { saveAgreedDueDate, todayStr, invalidatePaymentViews } from './AdjustDueDateDialog';
import { getMilestoneLabel } from '@/utils/paymentFormatters';
import { parseDateFromLocalString } from '@/utils/dateHelpers';

type ContactType = keyof typeof CONTACT_TYPES;

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  quoteId: string;
  invoiceId?: string | null;
  customerName?: string;
  eventName?: string;
}

/** One quick dialog: log a call/text/visit/note and, optionally, set an agreed payment date. */
export function LogContactDialog({ open, onOpenChange, quoteId, invoiceId, customerName, eventName }: Props) {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  const [type, setType] = useState<ContactType>('call');
  const [text, setText] = useState('');
  const [arrange, setArrange] = useState(false);
  const [newDue, setNewDue] = useState('');

  useEffect(() => { if (open) { setType('call'); setText(''); setArrange(false); setNewDue(''); } }, [open]);

  const { data: milestone } = useQuery({
    queryKey: ['log-contact-next-milestone', invoiceId],
    enabled: !!invoiceId && open,
    queryFn: async () => {
      const { data, error } = await supabase.from('payment_milestones')
        .select('id, milestone_type, due_date, status, amount_cents').eq('invoice_id', invoiceId!)
        .neq('status', 'paid').order('due_date', { ascending: true, nullsFirst: true }).limit(1);
      if (error) throw error;
      return data?.[0] ?? null;
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const author = user?.email || 'admin';
      const content = text.trim() || `${CONTACT_TYPES[type].label} with customer`;
      const { error } = await supabase.from('admin_notes').insert({
        quote_request_id: quoteId, note_content: content, category: type, is_internal: true, created_by: author,
      });
      if (error) throw error;
      if (invoiceId) {
        const { error: e2 } = await supabase.from('invoices')
          .update({ last_customer_interaction: new Date().toISOString() }).eq('id', invoiceId);
        if (e2) throw e2;
      }
      if (arrange && newDue && milestone) {
        await saveAgreedDueDate({
          milestone, newDate: newDue, quoteId, invoiceId, author,
          reason: `agreed during ${CONTACT_TYPES[type].label.toLowerCase()}${text.trim() ? `: ${text.trim()}` : ''}`,
        });
      }
    },
    onSuccess: () => {
      invalidatePaymentViews(qc, quoteId);
      toast({
        title: arrange && newDue ? 'Payment arranged' : 'Contact logged',
        description: arrange && newDue
          ? `Now due ${format(parseDateFromLocalString(newDue), 'MMM d, yyyy')}. Follow-ups paused ${FOLLOW_UP_SNOOZE_DAYS} days.`
          : `Follow-ups paused ${FOLLOW_UP_SNOOZE_DAYS} days.`,
      });
      onOpenChange(false);
    },
    onError: (e: any) => toast({ title: 'Could not save', description: e.message, variant: 'destructive' }),
  });

  const label = milestone ? getMilestoneLabel(milestone.milestone_type as any) || milestone.milestone_type : '';
  const amount = milestone?.amount_cents != null ? `$${(milestone.amount_cents / 100).toFixed(2)}` : '';
  const dueText = milestone?.due_date ? format(parseDateFromLocalString(milestone.due_date), 'MMM d, yyyy') : 'due now';
  const dateInvalid = arrange && (!newDue || newDue < todayStr());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Log Contact</DialogTitle>
          <DialogDescription>{[customerName, eventName].filter(Boolean).join(' · ') || 'Record a conversation with the customer.'}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Contact type">
            {(Object.keys(CONTACT_TYPES) as ContactType[]).map(t => {
              const Icon = CONTACT_TYPES[t].icon;
              return (
                <Button key={t} type="button" role="radio" aria-checked={type === t}
                  variant={type === t ? 'default' : 'outline'} className="h-11 gap-1.5" onClick={() => setType(t)}>
                  <Icon className="h-4 w-4" /> {CONTACT_TYPES[t].label}
                </Button>
              );
            })}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lc-note">What was discussed? (optional, internal)</Label>
            <Textarea id="lc-note" rows={3} maxLength={1000} value={text} onChange={e => setText(e.target.value)}
              placeholder="e.g. Left voicemail · Will pay deposit Friday by card" />
          </div>
          {invoiceId && milestone && (
            <div className="rounded-md border p-3 space-y-3">
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" className="mt-1 h-4 w-4" checked={arrange} onChange={e => {
                  setArrange(e.target.checked);
                  if (e.target.checked && !newDue) setNewDue(milestone.due_date && milestone.due_date >= todayStr() ? milestone.due_date : todayStr());
                }} />
                <span className="text-sm">
                  <span className="font-medium">Payment arrangement made</span>
                  <span className="block text-xs text-muted-foreground">Next: {label} {amount} · {dueText}</span>
                </span>
              </label>
              {arrange && (
                <div className="space-y-1.5">
                  <Label htmlFor="lc-due">Agreed payment date</Label>
                  <Input id="lc-due" type="date" min={todayStr()} value={newDue} onChange={e => setNewDue(e.target.value)} className="h-11" />
                  {newDue && newDue < todayStr() && <p className="text-xs text-destructive">Pick today or a future date.</p>}
                </div>
              )}
            </div>
          )}
          <p className="text-xs text-muted-foreground">Logging pauses follow-ups for {FOLLOW_UP_SNOOZE_DAYS} days and keeps the quote from being treated as expired.</p>
        </div>
        <DialogFooter className="flex-row gap-2">
          <Button variant="outline" className="flex-1 h-11" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="flex-1 h-11" disabled={dateInvalid || save.isPending} onClick={() => save.mutate()}>
            {save.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />} {arrange ? 'Save Arrangement' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
