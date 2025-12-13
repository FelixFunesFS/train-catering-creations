import { useState } from 'react';
import { format } from 'date-fns';
import { useQuotes } from '@/hooks/useQuotes';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Eye, Loader2, FileText, Receipt, Pencil } from 'lucide-react';
import { EventDetail } from './EventDetail';
import { Database } from '@/integrations/supabase/types';

type QuoteRequest = Database['public']['Tables']['quote_requests']['Row'];

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
  under_review: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
  estimated: 'bg-purple-500/10 text-purple-700 border-purple-500/20',
  quoted: 'bg-indigo-500/10 text-indigo-700 border-indigo-500/20',
  approved: 'bg-green-500/10 text-green-700 border-green-500/20',
  confirmed: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
  completed: 'bg-gray-500/10 text-gray-700 border-gray-500/20',
  cancelled: 'bg-red-500/10 text-red-700 border-red-500/20',
};

function formatStatus(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// Get contextual action icon and label based on workflow status
function getActionDetails(quoteStatus: string): { icon: typeof Eye; label: string } {
  const invoiceStatuses = ['approved', 'confirmed', 'paid', 'awaiting_payment'];
  const estimateStatuses = ['estimated', 'quoted'];
  
  if (invoiceStatuses.includes(quoteStatus)) {
    return { icon: Receipt, label: 'View Invoice' };
  }
  if (estimateStatuses.includes(quoteStatus)) {
    return { icon: Eye, label: 'View Estimate' };
  }
  // Default for pending, under_review, etc.
  return { icon: FileText, label: 'View Event' };
}

export function EventList() {
  const [search, setSearch] = useState('');
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);
  
  const { data: quotes, isLoading, error } = useQuotes({ search: search || undefined });

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-destructive">
          Error loading events: {error.message}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, or event..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">All Events</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : !quotes?.length ? (
            <p className="text-center py-8 text-muted-foreground">No events found</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="hidden sm:table-cell">Event</TableHead>
                    <TableHead className="hidden md:table-cell">Guests</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                {quotes.map((quote) => {
                  const { icon: ActionIcon, label: actionLabel } = getActionDetails(quote.workflow_status);
                  
                  return (
                    <TableRow 
                      key={quote.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedQuote(quote)}
                    >
                      <TableCell className="font-medium">
                        {format(new Date(quote.event_date), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{quote.contact_name}</p>
                          <p className="text-xs text-muted-foreground hidden sm:block">{quote.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {quote.event_name}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {quote.guest_count}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={statusColors[quote.workflow_status] || ''}
                        >
                          {formatStatus(quote.workflow_status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          title={actionLabel}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedQuote(quote);
                          }}
                        >
                          <ActionIcon className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      {selectedQuote && (
        <EventDetail 
          quote={selectedQuote} 
          onClose={() => setSelectedQuote(null)} 
        />
      )}
    </div>
  );
}
