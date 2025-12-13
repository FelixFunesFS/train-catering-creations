import { useState } from 'react';
import { format } from 'date-fns';
import { useEvents } from '@/hooks/useEvents';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Eye, Loader2, FileText, Receipt, DollarSign } from 'lucide-react';
import { EventDetail } from './EventDetail';
import { EventSummary } from '@/services/EventDataService';

// Event status colors (workflow lifecycle)
const eventStatusColors: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
  under_review: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
  estimated: 'bg-purple-500/10 text-purple-700 border-purple-500/20',
  quoted: 'bg-purple-500/10 text-purple-700 border-purple-500/20',
  sent: 'bg-purple-500/10 text-purple-700 border-purple-500/20',
  viewed: 'bg-purple-500/10 text-purple-700 border-purple-500/20',
  approved: 'bg-green-500/10 text-green-700 border-green-500/20',
  confirmed: 'bg-green-500/10 text-green-700 border-green-500/20',
  in_progress: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
  completed: 'bg-gray-500/10 text-gray-700 border-gray-500/20',
  cancelled: 'bg-red-500/10 text-red-700 border-red-500/20',
};

// Payment status colors (financial lifecycle)
const paymentStatusColors: Record<string, string> = {
  draft: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
  pending_review: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
  sent: 'bg-purple-500/10 text-purple-700 border-purple-500/20',
  viewed: 'bg-purple-500/10 text-purple-700 border-purple-500/20',
  approved: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
  payment_pending: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
  partially_paid: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
  paid: 'bg-green-500/10 text-green-700 border-green-500/20',
  overdue: 'bg-red-500/10 text-red-700 border-red-500/20',
  cancelled: 'bg-gray-500/10 text-gray-700 border-gray-500/20',
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
  const [selectedEvent, setSelectedEvent] = useState<EventSummary | null>(null);
  
  const { data: events, isLoading, error } = useEvents();

  // Filter events based on search term
  const filteredEvents = events?.filter((event) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      event.contact_name?.toLowerCase().includes(searchLower) ||
      event.email?.toLowerCase().includes(searchLower) ||
      event.event_name?.toLowerCase().includes(searchLower)
    );
  });

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
          ) : !filteredEvents?.length ? (
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
                {filteredEvents.map((event) => {
                  const { icon: ActionIcon, label: actionLabel } = getActionDetails(event.quote_status || 'pending');
                  
                  return (
                    <TableRow 
                      key={event.quote_id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <TableCell className="font-medium">
                        {event.event_date ? format(new Date(event.event_date), 'MMM d, yyyy') : '-'}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{event.contact_name}</p>
                          <p className="text-xs text-muted-foreground hidden sm:block">{event.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {event.event_name}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {event.guest_count}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {/* Event Status Badge */}
                          <Badge 
                            variant="outline" 
                            className={eventStatusColors[event.quote_status || 'pending'] || ''}
                          >
                            {formatStatus(event.quote_status || 'pending')}
                          </Badge>
                          {/* Payment Status Badge (only show if invoice exists) */}
                          {event.invoice_status && (
                            <Badge 
                              variant="outline" 
                              className={`${paymentStatusColors[event.invoice_status] || ''} flex items-center gap-1`}
                            >
                              <DollarSign className="h-3 w-3" />
                              {formatStatus(event.invoice_status)}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          title={actionLabel}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(event);
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
      {selectedEvent && (
        <EventDetail 
          quote={selectedEvent as any} 
          onClose={() => setSelectedEvent(null)} 
        />
      )}
    </div>
  );
}
