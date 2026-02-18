import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Send, Plus, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SendPaymentReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quoteId: string;
  eventName: string;
  primaryEmail: string;
  invoiceNumber: string | null;
  totalAmount: number;
}

export function SendPaymentReminderDialog({
  open,
  onOpenChange,
  quoteId,
  eventName,
  primaryEmail,
  invoiceNumber,
  totalAmount,
}: SendPaymentReminderDialogProps) {
  const [email, setEmail] = useState(primaryEmail);
  const [additionalEmails, setAdditionalEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  // Reset state when dialog opens
  const handleOpenChange = (value: boolean) => {
    if (value) {
      setEmail(primaryEmail);
      setAdditionalEmails([]);
      setNewEmail('');
    }
    onOpenChange(value);
  };

  const addEmail = () => {
    const trimmed = newEmail.trim();
    if (trimmed && trimmed.includes('@') && !additionalEmails.includes(trimmed) && trimmed !== email) {
      setAdditionalEmails(prev => [...prev, trimmed]);
      setNewEmail('');
    }
  };

  const removeEmail = (emailToRemove: string) => {
    setAdditionalEmails(prev => prev.filter(e => e !== emailToRemove));
  };

  const handleSend = async () => {
    const allRecipients = [email, ...additionalEmails].filter(e => e.trim());
    if (allRecipients.length === 0) return;

    setSending(true);
    let successCount = 0;
    let lastError: string | null = null;

    for (const recipient of allRecipients) {
      try {
        const body: any = { type: 'payment_reminder', quote_request_id: quoteId };
        if (recipient !== primaryEmail) {
          body.override_email = recipient;
        }
        const { error } = await supabase.functions.invoke('send-customer-portal-email', { body });
        if (error) throw error;

        // Log to reminder_logs for duplicate protection
        const { data: invoiceData } = await supabase
          .from('invoices')
          .select('id')
          .eq('quote_request_id', quoteId)
          .maybeSingle();

        if (invoiceData?.id) {
          await supabase.from('reminder_logs').insert({
            invoice_id: invoiceData.id,
            reminder_type: 'manual_payment_reminder',
            recipient_email: recipient,
            urgency: 'medium',
          });
        }

        successCount++;
      } catch (err: any) {
        lastError = err.message;
      }
    }

    setSending(false);

    if (successCount > 0) {
      toast({
        title: 'Payment Reminder Sent',
        description: `Sent to ${successCount} recipient${successCount > 1 ? 's' : ''}`,
      });
      handleOpenChange(false);
    }
    if (lastError && successCount < allRecipients.length) {
      toast({
        title: 'Some emails failed',
        description: lastError,
        variant: 'destructive',
      });
    }
  };

  const formatCurrency = (cents: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Payment Reminder</DialogTitle>
          <DialogDescription>
            Review recipient details before sending.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Event Summary */}
          <div className="rounded-lg border bg-muted/50 p-3 text-sm space-y-1">
            <p><span className="text-muted-foreground">Event:</span> <strong>{eventName}</strong></p>
            {invoiceNumber && (
              <p><span className="text-muted-foreground">Invoice:</span> <span className="font-mono">{invoiceNumber}</span></p>
            )}
            {totalAmount > 0 && (
              <p><span className="text-muted-foreground">Total:</span> <strong>{formatCurrency(totalAmount)}</strong></p>
            )}
          </div>

          {/* Primary Email */}
          <div className="space-y-2">
            <Label htmlFor="primary-email">Recipient Email</Label>
            <Input
              id="primary-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Additional Recipients */}
          <div className="space-y-2">
            <Label>Additional Recipients</Label>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Add another email..."
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addEmail(); } }}
              />
              <Button type="button" variant="outline" size="icon" onClick={addEmail} disabled={!newEmail.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {additionalEmails.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {additionalEmails.map((e) => (
                  <span key={e} className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs">
                    {e}
                    <button onClick={() => removeEmail(e)} className="ml-1 hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={sending}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={sending || !email.trim()}>
            {sending ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending...</>
            ) : (
              <><Send className="h-4 w-4 mr-2" /> Send Reminder</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
