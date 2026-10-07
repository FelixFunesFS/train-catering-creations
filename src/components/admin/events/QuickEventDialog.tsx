import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserCheck } from 'lucide-react';

// Fallback so phone-only patrons can still be saved; customer emails route to the business inbox.
const BUSINESS_EMAIL = 'soultrainseatery@gmail.com';

const EVENT_TYPES = [
  ['private_party', 'Private Party'], ['birthday', 'Birthday'], ['wedding', 'Wedding'],
  ['graduation', 'Graduation'], ['corporate', 'Corporate'], ['military_function', 'Military Function'],
  ['bereavement', 'Bereavement'], ['anniversary', 'Anniversary'], ['baby_shower', 'Baby Shower'],
  ['retirement', 'Retirement'], ['holiday_party', 'Holiday Party'], ['black_tie', 'Black Tie'], ['other', 'Other'],
] as const;
const SERVICE_TYPES = [
  ['full-service', 'Full Service'], ['delivery-setup', 'Delivery + Setup'],
  ['delivery-only', 'Delivery Only'], ['drop-off', 'Drop-off'],
] as const;

interface PastCustomer { contact_name: string; email: string; phone: string; location: string }

const empty = {
  contact_name: '', phone: '', email: '', event_name: '', event_type: 'private_party',
  event_date: '', start_time: '12:00', guest_count: '', location: '', service_type: 'full-service', notes: '',
};

export function QuickEventDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [form, setForm] = useState(empty);
  const [lookup, setLookup] = useState('');
  const [matches, setMatches] = useState<PastCustomer[]>([]);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const set = (k: keyof typeof empty, v: string) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => { if (!open) { setForm(empty); setLookup(''); setMatches([]); } }, [open]);

  useEffect(() => {
    const term = lookup.trim().replace(/[%,()]/g, '');
    if (term.length < 2) { setMatches([]); return; }
    const t = setTimeout(async () => {
      const { data } = await supabase.from('quote_requests')
        .select('contact_name,email,phone,location')
        .or(`contact_name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%`)
        .order('created_at', { ascending: false }).limit(20);
      const seen = new Set<string>();
      setMatches((data || []).filter((c) => {
        const k = `${c.contact_name}|${c.phone}`.toLowerCase();
        if (seen.has(k)) return false; seen.add(k); return true;
      }).slice(0, 5));
    }, 250);
    return () => clearTimeout(t);
  }, [lookup]);

  const pick = (c: PastCustomer) => {
    setForm((f) => ({ ...f, contact_name: c.contact_name, phone: c.phone,
      email: c.email === BUSINESS_EMAIL ? '' : c.email, location: f.location || c.location }));
    setMatches([]); setLookup('');
  };

  const valid = form.contact_name.trim() && form.phone.trim() && form.event_name.trim()
    && form.event_date && form.start_time && Number(form.guest_count) > 0 && form.location.trim();

  const save = async () => {
    if (!valid) return;
    setSaving(true);
    const { data, error } = await supabase.from('quote_requests').insert({
      contact_name: form.contact_name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || BUSINESS_EMAIL,
      event_name: form.event_name.trim(),
      event_type: form.event_type as any,
      event_date: form.event_date,
      start_time: form.start_time,
      guest_count: Number(form.guest_count),
      location: form.location.trim(),
      service_type: form.service_type as any,
      special_requests: form.notes.trim() || null,
      referral_source: 'Admin phone intake',
    }).select('id').single();
    setSaving(false);
    if (error || !data) {
      toast({ title: 'Could not save event', description: error?.message, variant: 'destructive' });
      return;
    }
    qc.invalidateQueries({ queryKey: ['quotes'] });
    qc.invalidateQueries({ queryKey: ['events'] });
    toast({ title: 'Event created', description: 'Add menu and pricing next.' });
    onOpenChange(false);
    navigate(`/admin/event/${data.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Event (Phone Intake)</DialogTitle>
          <DialogDescription>Essentials only. Menu and pricing can be added after saving. No email is sent.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5 relative">
            <Label htmlFor="qe-lookup">Repeat customer? Search name, phone, or email</Label>
            <Input id="qe-lookup" value={lookup} onChange={(e) => setLookup(e.target.value)} placeholder="Start typing…" className="h-11" />
            {matches.length > 0 && (
              <ul className="border rounded-md divide-y bg-popover">
                {matches.map((c, i) => (
                  <li key={i}>
                    <button type="button" onClick={() => pick(c)} className="w-full text-left px-3 py-2.5 min-h-11 hover:bg-muted flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm"><span className="font-medium">{c.contact_name}</span> · {c.phone}
                        {c.email !== BUSINESS_EMAIL && <span className="text-muted-foreground"> · {c.email}</span>}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Customer name *" id="qe-name"><Input id="qe-name" className="h-11" value={form.contact_name} onChange={(e) => set('contact_name', e.target.value)} /></Field>
            <Field label="Phone *" id="qe-phone"><Input id="qe-phone" type="tel" inputMode="tel" className="h-11" value={form.phone} onChange={(e) => set('phone', e.target.value)} /></Field>
            <Field label="Email (optional)" id="qe-email" className="sm:col-span-2"><Input id="qe-email" type="email" className="h-11" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="Leave blank if none" /></Field>
            <Field label="Event name *" id="qe-ev" className="sm:col-span-2"><Input id="qe-ev" className="h-11" value={form.event_name} onChange={(e) => set('event_name', e.target.value)} placeholder="e.g. Johnson Family Reunion" /></Field>
            <Field label="Event type" id="qe-type">
              <Select value={form.event_type} onValueChange={(v) => set('event_type', v)}>
                <SelectTrigger id="qe-type" className="h-11"><SelectValue /></SelectTrigger>
                <SelectContent>{EVENT_TYPES.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Service" id="qe-svc">
              <Select value={form.service_type} onValueChange={(v) => set('service_type', v)}>
                <SelectTrigger id="qe-svc" className="h-11"><SelectValue /></SelectTrigger>
                <SelectContent>{SERVICE_TYPES.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Event date *" id="qe-date"><Input id="qe-date" type="date" className="h-11" value={form.event_date} onChange={(e) => set('event_date', e.target.value)} /></Field>
            <Field label="Start time *" id="qe-time"><Input id="qe-time" type="time" className="h-11" value={form.start_time} onChange={(e) => set('start_time', e.target.value)} /></Field>
            <Field label="Guests *" id="qe-guests"><Input id="qe-guests" type="number" inputMode="numeric" min={1} className="h-11" value={form.guest_count} onChange={(e) => set('guest_count', e.target.value)} /></Field>
            <Field label="Location *" id="qe-loc"><Input id="qe-loc" className="h-11" value={form.location} onChange={(e) => set('location', e.target.value)} /></Field>
            <Field label="Call notes" id="qe-notes" className="sm:col-span-2"><Textarea id="qe-notes" rows={3} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Menu ideas, dietary needs, anything they mentioned" /></Field>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" className="h-11" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="h-11" disabled={!valid || saving} onClick={save}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save Event
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, id, className, children }: { label: string; id: string; className?: string; children: React.ReactNode }) {
  return <div className={`space-y-1.5 ${className || ''}`}><Label htmlFor={id}>{label}</Label>{children}</div>;
}
