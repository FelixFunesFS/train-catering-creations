import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, formatDistanceToNow } from 'date-fns';
import { Phone, MessageSquare, Users, StickyNote, Plus, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';

export const CONTACT_TYPES = {
  call: { label: 'Phone Call', icon: Phone },
  text: { label: 'Text Message', icon: MessageSquare },
  in_person: { label: 'In Person', icon: Users },
  note: { label: 'Note', icon: StickyNote },
} as const;
type ContactType = keyof typeof CONTACT_TYPES;

/** Follow-ups stay paused for this many days after any logged contact. */
export const FOLLOW_UP_SNOOZE_DAYS = 7;

interface Props { quoteId: string; invoiceId?: string | null }

export function ContactLogCard({ quoteId, invoiceId }: Props) {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<ContactType>('call');
  const [text, setText] = useState('');
  const key = ['contact-log', quoteId];

  const { data: logs = [], isLoading } = useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await supabase.from('admin_notes')
        .select('id, note_content, category, created_by, created_at')
        .eq('quote_request_id', quoteId)
        .in('category', Object.keys(CONTACT_TYPES))
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const content = text.trim() || `${CONTACT_TYPES[type].label} with customer`;
      const { error } = await supabase.from('admin_notes').insert({
        quote_request_id: quoteId, note_content: content, category: type,
        is_internal: true, created_by: user?.email || 'admin',
      });
      if (error) throw error;
      if (invoiceId) {
        const { error: e2 } = await supabase.from('invoices')
          .update({ last_customer_interaction: new Date().toISOString() }).eq('id', invoiceId);
        if (e2) throw e2;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key });
      qc.invalidateQueries({ queryKey: ['invoices'] });
      toast({ title: 'Contact logged', description: `Follow-ups paused for ${FOLLOW_UP_SNOOZE_DAYS} days.` });
      setOpen(false); setText(''); setType('call');
    },
    onError: (e: any) => toast({ title: 'Could not save', description: e.message, variant: 'destructive' }),
  });

  const last = logs[0];
  const LastIcon = last ? (CONTACT_TYPES[last.category as ContactType]?.icon ?? StickyNote) : null;

  return (
    <Card>
      <CardHeader className="py-3 flex-row items-center justify-between space-y-0 gap-2">
        <CardTitle className="text-base">Customer Contact</CardTitle>
        <Button size="sm" variant="outline" className="h-10 gap-1.5" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Log Call / Note
        </Button>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p>
          : !last ? <p className="text-sm text-muted-foreground">No contact logged yet.</p>
          : (
            <>
              <p className="text-sm flex items-center gap-2">
                {LastIcon && <LastIcon className="h-4 w-4 text-muted-foreground" />}
                <span>Last contacted <strong>{formatDistanceToNow(new Date(last.created_at), { addSuffix: true })}</strong> via {CONTACT_TYPES[last.category as ContactType]?.label ?? 'Note'}</span>
              </p>
              <ul className="space-y-2">
                {logs.slice(0, 5).map(l => (
                  <li key={l.id} className="text-sm border-l-2 border-border pl-3">
                    <p className="whitespace-pre-wrap">{l.note_content}</p>
                    <p className="text-xs text-muted-foreground">
                      {CONTACT_TYPES[l.category as ContactType]?.label ?? 'Note'} · {format(new Date(l.created_at), 'MMM d, h:mm a')} · {l.created_by}
                    </p>
                  </li>
                ))}
              </ul>
            </>
          )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Log Customer Contact</DialogTitle>
            <DialogDescription>Follow-up emails pause for {FOLLOW_UP_SNOOZE_DAYS} days after you log contact.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Contact type">
            {(Object.keys(CONTACT_TYPES) as ContactType[]).map(t => {
              const Icon = CONTACT_TYPES[t].icon;
              return (
                <Button key={t} type="button" role="radio" aria-checked={type === t}
                  variant={type === t ? 'default' : 'outline'} className="h-11 gap-2" onClick={() => setType(t)}>
                  <Icon className="h-4 w-4" /> {CONTACT_TYPES[t].label}
                </Button>
              );
            })}
          </div>
          <Textarea value={text} onChange={e => setText(e.target.value)} rows={4} maxLength={1000}
            placeholder="What was discussed? e.g. Will confirm menu by Friday" aria-label="Notes" />
          <DialogFooter className="flex-row gap-2">
            <Button variant="outline" className="flex-1 h-11" onClick={() => setOpen(false)}>Cancel</Button>
            <Button className="flex-1 h-11" disabled={save.isPending} onClick={() => save.mutate()}>
              {save.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />} Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
