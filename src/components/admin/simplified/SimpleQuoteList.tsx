import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Calendar, Users, MapPin, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';
import { QuickPricingEditor } from './QuickPricingEditor';
import { AdminNotesSection } from '../AdminNotesSection';

interface Quote {
  id: string;
  event_name: string;
  event_date: string;
  contact_name: string;
  email: string;
  phone: string;
  guest_count: number;
  location: string;
  workflow_status: string;
  created_at: string;
  invoices?: Array<{
    id: string;
    total_amount: number;
    workflow_status: string;
  }>;
}

interface SimpleQuoteListProps {
  quotes: Quote[];
  onStatusUpdate: (quoteId: string, newStatus: string) => void;
  onGenerateEstimate: (quoteId: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-blue-500',
  quoted: 'bg-purple-500',
  approved: 'bg-green-500',
  paid: 'bg-emerald-600',
  completed: 'bg-gray-500',
  cancelled: 'bg-red-500',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'New Request',
  quoted: 'Quoted',
  approved: 'Approved',
  paid: 'Paid',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export function SimpleQuoteList({ quotes, onStatusUpdate, onGenerateEstimate }: SimpleQuoteListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (quoteId: string) => {
    setExpandedId(expandedId === quoteId ? null : quoteId);
  };

  const getNextAction = (quote: Quote) => {
    const status = quote.workflow_status;
    const hasInvoice = quote.invoices && quote.invoices.length > 0;

    if (status === 'pending' && !hasInvoice) {
      return {
        label: 'Generate Estimate',
        action: () => onGenerateEstimate(quote.id),
        variant: 'default' as const,
      };
    }

    if (status === 'pending' && hasInvoice) {
      return {
        label: 'Send Estimate',
        action: () => onStatusUpdate(quote.id, 'quoted'),
        variant: 'default' as const,
      };
    }

    if (status === 'quoted') {
      return null; // Waiting for customer
    }

    if (status === 'approved') {
      return {
        label: 'Confirm Payment',
        action: () => onStatusUpdate(quote.id, 'paid'),
        variant: 'default' as const,
      };
    }

    if (status === 'paid') {
      return {
        label: 'Mark Complete',
        action: () => onStatusUpdate(quote.id, 'completed'),
        variant: 'default' as const,
      };
    }

    return null;
  };

  return (
    <div className="space-y-3">
      {quotes.map((quote) => {
        const isExpanded = expandedId === quote.id;
        const nextAction = getNextAction(quote);
        const invoice = quote.invoices?.[0];

        return (
          <Card key={quote.id} className="overflow-hidden">
            <div className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg truncate">{quote.event_name}</h3>
                    <Badge className={STATUS_COLORS[quote.workflow_status]}>
                      {STATUS_LABELS[quote.workflow_status]}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(quote.event_date), 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{quote.guest_count} guests</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">{quote.location}</span>
                    </div>
                    {invoice && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span>${(invoice.total_amount / 100).toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-2 text-sm">
                    <span className="text-muted-foreground">Contact:</span>{' '}
                    <span className="font-medium">{quote.contact_name}</span>
                    <span className="text-muted-foreground ml-3">{quote.email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {nextAction && (
                    <Button onClick={nextAction.action} variant={nextAction.variant} size="sm">
                      {nextAction.label}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpand(quote.id)}
                  >
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {isExpanded && invoice && (
                <div className="mt-4 pt-4 border-t space-y-4">
                  <QuickPricingEditor
                    quoteId={quote.id}
                    invoiceId={invoice.id}
                    guestCount={quote.guest_count}
                  />
                  
                  <div className="border-t pt-4">
                    <AdminNotesSection quoteId={quote.id} />
                  </div>
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
