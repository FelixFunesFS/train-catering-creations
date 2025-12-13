import { useState } from 'react';
import { format } from 'date-fns';
import { useInvoices } from '@/hooks/useInvoices';
import { InvoicePaymentSummary } from '@/services/PaymentDataService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, DollarSign, Eye } from 'lucide-react';
import { EstimateEditor } from './EstimateEditor';

const statusColors: Record<string, string> = {
  draft: 'bg-gray-500/10 text-gray-700 border-gray-500/20',
  pending_review: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
  sent: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
  viewed: 'bg-purple-500/10 text-purple-700 border-purple-500/20',
  approved: 'bg-green-500/10 text-green-700 border-green-500/20',
  paid: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
  partially_paid: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
  overdue: 'bg-red-500/10 text-red-700 border-red-500/20',
  cancelled: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
};

function formatCents(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

function formatStatus(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export function EstimateList() {
  const [selectedInvoice, setSelectedInvoice] = useState<InvoicePaymentSummary | null>(null);
  const { data: invoices, isLoading, error } = useInvoices();

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-destructive">
          Error loading estimates: {error.message}
        </CardContent>
      </Card>
    );
  }

  // Filter to show invoices that need pricing (draft) or are ready to send
  const estimates = invoices?.filter(inv => 
    ['draft', 'pending_review', 'sent', 'viewed'].includes(inv.workflow_status)
  ) || [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Estimates & Invoices
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : !estimates.length ? (
            <p className="text-center py-8 text-muted-foreground">
              No estimates pending. Generate one from the Events tab.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="hidden sm:table-cell">Created</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {estimates.map((invoice) => (
                    <TableRow 
                      key={invoice.invoice_id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedInvoice(invoice)}
                    >
                      <TableCell className="font-medium">
                        {invoice.invoice_number || 'Draft'}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{invoice.contact_name}</p>
                          <p className="text-xs text-muted-foreground">{invoice.event_name}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {format(new Date(invoice.invoice_created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={statusColors[invoice.workflow_status] || ''}
                        >
                          {formatStatus(invoice.workflow_status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {invoice.total_amount > 0 
                          ? formatCents(invoice.total_amount) 
                          : <span className="text-muted-foreground">$0.00</span>
                        }
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedInvoice(invoice);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedInvoice && (
        <EstimateEditor 
          invoice={selectedInvoice} 
          onClose={() => setSelectedInvoice(null)} 
        />
      )}
    </div>
  );
}
