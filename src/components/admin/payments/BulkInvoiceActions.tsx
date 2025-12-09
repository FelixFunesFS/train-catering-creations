import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ChevronDown, Mail, Download, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface Invoice {
  id: string;
  invoice_number: string | null;
  total_amount: number;
  balance_remaining: number;
  contact_name: string | null;
  email: string | null;
  event_name: string | null;
  days_overdue: number;
}

interface BulkInvoiceActionsProps {
  invoices: Invoice[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onActionComplete: () => void;
}

export function BulkInvoiceActions({
  invoices,
  selectedIds,
  onSelectionChange,
  onActionComplete
}: BulkInvoiceActionsProps) {
  const [loading, setLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<'reminders' | null>(null);
  const { toast } = useToast();

  const selectedInvoices = invoices.filter(i => selectedIds.includes(i.id));

  const toggleAll = () => {
    if (selectedIds.length === invoices.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(invoices.map(i => i.id));
    }
  };

  const toggleOne = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(i => i !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const sendBulkReminders = async () => {
    setLoading(true);
    setConfirmDialog(null);

    let successCount = 0;
    let failCount = 0;

    for (const invoice of selectedInvoices) {
      if (!invoice.email) {
        failCount++;
        continue;
      }

      try {
        await supabase.functions.invoke('send-payment-reminder', {
          body: {
            invoiceId: invoice.id,
            customerEmail: invoice.email,
            customerName: invoice.contact_name,
            eventName: invoice.event_name,
            balanceRemaining: invoice.balance_remaining,
            daysOverdue: invoice.days_overdue,
            urgency: invoice.days_overdue > 30 ? 'high' : invoice.days_overdue > 0 ? 'medium' : 'low'
          }
        });
        successCount++;

        // Update reminder tracking - increment count
        const { data: currentInvoice } = await supabase
          .from('invoices')
          .select('reminder_count')
          .eq('id', invoice.id)
          .single();

        await supabase
          .from('invoices')
          .update({
            last_reminder_sent_at: new Date().toISOString(),
            reminder_count: (currentInvoice?.reminder_count || 0) + 1
          })
          .eq('id', invoice.id);

      } catch (error) {
        console.error('Failed to send reminder:', error);
        failCount++;
      }
    }

    setLoading(false);

    toast({
      title: 'Reminders Sent',
      description: `${successCount} sent successfully${failCount > 0 ? `, ${failCount} failed` : ''}`
    });

    onSelectionChange([]);
    onActionComplete();
  };

  const exportSelected = () => {
    const headers = ['Invoice #', 'Customer', 'Email', 'Event', 'Total', 'Balance', 'Days Overdue'];
    const rows = selectedInvoices.map(i => [
      i.invoice_number || '-',
      i.contact_name || '-',
      i.email || '-',
      i.event_name || '-',
      (i.total_amount / 100).toFixed(2),
      (i.balance_remaining / 100).toFixed(2),
      i.days_overdue
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoices-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({ title: 'Exported', description: `${selectedInvoices.length} invoices exported to CSV` });
  };

  return (
    <>
      <div className="flex items-center gap-4 py-2">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={selectedIds.length === invoices.length && invoices.length > 0}
            onCheckedChange={toggleAll}
            aria-label="Select all"
          />
          <span className="text-sm text-muted-foreground">
            {selectedIds.length > 0 
              ? `${selectedIds.length} selected` 
              : 'Select all'
            }
          </span>
        </div>

        {selectedIds.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <ChevronDown className="h-4 w-4 mr-2" />
                )}
                Bulk Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => setConfirmDialog('reminders')}>
                <Mail className="h-4 w-4 mr-2" />
                Send Payment Reminders
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={exportSelected}>
                <Download className="h-4 w-4 mr-2" />
                Export to CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Render checkboxes in parent component */}
      {invoices.map(invoice => (
        <input
          key={invoice.id}
          type="hidden"
          data-invoice-id={invoice.id}
          data-selected={selectedIds.includes(invoice.id)}
        />
      ))}

      <AlertDialog open={confirmDialog === 'reminders'} onOpenChange={() => setConfirmDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send Payment Reminders</AlertDialogTitle>
            <AlertDialogDescription>
              This will send payment reminder emails to {selectedInvoices.filter(i => i.email).length} customers.
              {selectedInvoices.filter(i => !i.email).length > 0 && (
                <span className="block mt-2 text-yellow-600">
                  {selectedInvoices.filter(i => !i.email).length} invoice(s) have no email and will be skipped.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={sendBulkReminders}>
              Send Reminders
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Helper component for individual row checkbox
export function InvoiceCheckbox({ 
  invoiceId, 
  selected, 
  onToggle 
}: { 
  invoiceId: string; 
  selected: boolean; 
  onToggle: (id: string) => void;
}) {
  return (
    <Checkbox
      checked={selected}
      onCheckedChange={() => onToggle(invoiceId)}
      aria-label={`Select invoice ${invoiceId}`}
    />
  );
}