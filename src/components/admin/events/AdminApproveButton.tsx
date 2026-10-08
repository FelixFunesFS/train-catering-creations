import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Props {
  invoiceId: string;
  quoteId: string;
  customerName: string;
  className?: string;
  /** Called after approval so the admin can take/arrange the deposit */
  onApproved?: () => void;
}

/** Admin approves an estimate on the customer's behalf (phone/in-person agreement). */
export function AdminApproveButton({ invoiceId, quoteId, customerName, className = '', onApproved }: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();

  const approve = async () => {
    setBusy(true);
    try {
      const { data: inv, error } = await supabase
        .from('invoices').select('customer_access_token').eq('id', invoiceId).single();
      if (error || !inv?.customer_access_token) throw new Error('Could not load estimate link');
      const { error: fnErr } = await supabase.functions.invoke('approve-estimate', { body: { token: inv.customer_access_token } });
      if (fnErr) throw fnErr;
      const now = new Date().toISOString();
      await supabase.from('invoices').update({ terms_accepted_at: now, last_customer_interaction: now }).eq('id', invoiceId);
      await supabase.from('admin_notes').insert({
        quote_request_id: quoteId,
        note_content: `Estimate approved by admin on behalf of ${customerName} (verbal/phone agreement).`,
        created_by: 'admin', is_internal: true, category: 'contact',
      });
      qc.invalidateQueries();
      toast({ title: 'Estimate approved', description: 'Take the deposit now, or log the agreed payment date.' });
      setOpen(false);
      onApproved?.();
    } catch (e: any) {
      toast({ title: 'Approval failed', description: e?.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Button size="sm" className={`h-10 text-xs font-medium gap-1.5 px-3 ${className}`}
        onClick={(e) => { e.stopPropagation(); setOpen(true); }}>
        <CheckCircle2 className="h-4 w-4" /> Approve
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve for {customerName}?</AlertDialogTitle>
            <AlertDialogDescription>
              Only approve if the customer agreed to the estimate and terms by phone or in person. The 10% booking
              deposit becomes due and the customer gets their approval email. If they're paying now, you can instead
              use Pay — recording a deposit approves and confirms the booking in one step.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2 sm:justify-end">
            <AlertDialogCancel className="mt-0 flex-1 sm:flex-none">Not yet</AlertDialogCancel>
            <AlertDialogAction className="flex-1 sm:flex-none" disabled={busy} onClick={(e) => { e.preventDefault(); approve(); }}>
              {busy && <Loader2 className="h-4 w-4 animate-spin mr-1" />} Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
