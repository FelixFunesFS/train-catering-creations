import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { CopyPlus, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

// Fields that belong to the old event's lifecycle and must not be copied.
const SKIP = new Set(['id', 'created_at', 'updated_at', 'workflow_status', 'last_status_change', 'status_changed_by',
  'version', 'idempotency_key', 'estimated_total', 'final_total', 'po_number']);

const JSON_COLS = new Set(['appetizers', 'sides', 'desserts', 'drinks', 'utensils', 'extras', 'dietary_restrictions', 'proteins', 'vegetarian_entrees']);

export function DuplicateEstimateButton({ quote, lineItems }: { quote: any; lineItems: any[] }) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState('');
  const [guests, setGuests] = useState(String(quote?.guest_count ?? ''));
  const [name, setName] = useState(`${quote?.event_name ?? 'Event'} (Copy)`);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { toast } = useToast();
  if (!quote?.id) return null;

  const run = async () => {
    const g = Number(guests);
    if (!date || !(g > 0) || !name.trim()) return;
    setBusy(true);
    try {
      const copy: Record<string, any> = { ...quote };
      for (const k of Object.keys(copy)) if (SKIP.has(k) || (copy[k] && typeof copy[k] === 'object' && !JSON_COLS.has(k))) delete copy[k];
      Object.assign(copy, { event_name: name.trim(), event_date: date, guest_count: g, referral_source: 'Duplicated estimate' });

      const { data: newQuote, error } = await supabase.from('quote_requests').insert(copy as any).select('id').single();
      if (error || !newQuote) throw error ?? new Error('Could not create event');

      const { data: gen, error: genErr } = await supabase.functions.invoke('generate-invoice-from-quote', { body: { quote_request_id: newQuote.id } });
      if (genErr) throw genErr;
      const invoiceId = gen?.invoice_id;

      // Replace generated items with the original's priced items so custom pricing carries over.
      if (invoiceId && lineItems?.length) {
        const oldGuests = Number(quote.guest_count) || 0;
        await supabase.from('invoice_line_items').delete().eq('invoice_id', invoiceId);
        const rows = lineItems.map((li, i) => {
          const scale = li.category === 'package' && !/vegetarian/i.test(li.title ?? '') && oldGuests && li.quantity === oldGuests;
          const quantity = scale ? g : li.quantity;
          return { invoice_id: invoiceId, title: li.title, description: li.description, category: li.category,
            quantity, unit_price: li.unit_price, total_price: quantity * li.unit_price, metadata: li.metadata ?? null,
            sort_order: li.sort_order ?? i };
        });
        const { error: liErr } = await supabase.from('invoice_line_items').insert(rows);
        if (liErr) throw liErr;
        await supabase.rpc('force_recalculate_invoice_totals', { p_invoice_id: invoiceId });
        await supabase.functions.invoke('generate-payment-milestones', { body: { invoice_id: invoiceId, force_regenerate: true } });
      }

      qc.invalidateQueries({ queryKey: ['quotes'] });
      qc.invalidateQueries({ queryKey: ['events'] });
      qc.invalidateQueries({ queryKey: ['invoices'] });
      toast({ title: 'Estimate duplicated', description: 'New draft created. Nothing was sent to the customer.' });
      setOpen(false);
      navigate(`/admin/event/${newQuote.id}`);
    } catch (e: any) {
      toast({ title: 'Could not duplicate', description: e?.message ?? String(e), variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
        <CopyPlus className="h-4 w-4" /> Duplicate
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Duplicate estimate</DialogTitle>
            <DialogDescription>Copies the customer, menu and line-item prices into a new draft. Payments and emails are not copied.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label htmlFor="dup-name">Event name</Label>
              <Input id="dup-name" value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label htmlFor="dup-date">New event date</Label>
                <Input id="dup-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
              <div className="space-y-1.5"><Label htmlFor="dup-guests">Guests</Label>
                <Input id="dup-guests" type="number" min={1} inputMode="numeric" value={guests} onChange={(e) => setGuests(e.target.value)} /></div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={busy}>Cancel</Button>
            <Button onClick={run} disabled={busy || !date || !(Number(guests) > 0) || !name.trim()}>
              {busy && <Loader2 className="h-4 w-4 mr-1 animate-spin" />} Create copy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
