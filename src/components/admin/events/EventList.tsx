import { useState, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useQuotes } from '@/hooks/useQuotes';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Eye, Loader2, FileText, Receipt, Mail, MailOpen, Globe, List, CalendarDays, CalendarRange } from 'lucide-react';
import { EventDetail } from './EventDetail';
import { EventWeekView } from './EventWeekView';
import { EventMonthView } from './EventMonthView';
import { DateNavigation } from './DateNavigation';
import { EventFilters, StatusFilter, ServiceTypeFilter, SortBy, SortOrder } from './EventFilters';
import { Database } from '@/integrations/supabase/types';

type QuoteRequest = Database['public']['Tables']['quote_requests']['Row'];

// Fetch raw invoices for email tracking fields
function useRawInvoices() {
  return useQuery({
    queryKey: ['invoices', 'raw-for-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('id, quote_request_id, workflow_status, total_amount, sent_at, viewed_at, email_opened_at')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 2,
  });
}

const eventStatusColors: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
  under_review: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
  estimated: 'bg-purple-500/10 text-purple-700 border-purple-500/20',
  quoted: 'bg-indigo-500/10 text-indigo-700 border-indigo-500/20',
  approved: 'bg-green-500/10 text-green-700 border-green-500/20',
  confirmed: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
  completed: 'bg-gray-500/10 text-gray-700 border-gray-500/20',
  cancelled: 'bg-red-500/10 text-red-700 border-red-500/20',
};

const estimateStatusColors: Record<string, string> = {
  draft: 'bg-gray-500/10 text-gray-700 border-gray-500/20',
  pending_review: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
  sent: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
  viewed: 'bg-indigo-500/10 text-indigo-700 border-indigo-500/20',
  approved: 'bg-green-500/10 text-green-700 border-green-500/20',
  paid: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
  partially_paid: 'bg-teal-500/10 text-teal-700 border-teal-500/20',
  overdue: 'bg-red-500/10 text-red-700 border-red-500/20',
  cancelled: 'bg-red-500/10 text-red-700 border-red-500/20',
};

function formatStatus(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function formatCurrency(cents: number | null): string {
  if (!cents) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

function getActionDetails(quoteStatus: string): { icon: typeof Eye; label: string } {
  const invoiceStatuses = ['approved', 'confirmed', 'paid', 'awaiting_payment'];
  const estimateStatuses = ['estimated', 'quoted'];
  
  if (invoiceStatuses.includes(quoteStatus)) {
    return { icon: Receipt, label: 'View Invoice' };
  }
  if (estimateStatuses.includes(quoteStatus)) {
    return { icon: Eye, label: 'View Estimate' };
  }
  return { icon: FileText, label: 'View Event' };
}

type InvoiceForEvent = {
  id: string;
  quote_request_id: string | null;
  workflow_status: Database['public']['Enums']['invoice_workflow_status'];
  total_amount: number;
  sent_at: string | null;
  viewed_at: string | null;
  email_opened_at: string | null;
};

interface EventWithInvoice extends QuoteRequest {
  invoice: InvoiceForEvent | null;
}

type ViewMode = 'list' | 'week' | 'month';

export function EventList() {
  const [search, setSearch] = useState('');
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Filter & Sort state
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [serviceTypeFilter, setServiceTypeFilter] = useState<ServiceTypeFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  
  const navigate = useNavigate();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  
  const { data: quotes, isLoading: quotesLoading, error: quotesError } = useQuotes({ search: search || undefined });
  const { data: invoices, isLoading: invoicesLoading } = useRawInvoices();

  // Join quotes with their invoices and apply filters/sorting
  const eventsWithInvoices = useMemo((): EventWithInvoice[] => {
    if (!quotes) return [];
    
    let result = quotes.map(quote => ({
      ...quote,
      invoice: invoices?.find(inv => inv.quote_request_id === quote.id) || null,
    }));

    // Apply status filter
    if (statusFilter !== 'all') {
      const statusMap: Record<StatusFilter, string[]> = {
        all: [],
        pending: ['pending', 'under_review'],
        confirmed: ['confirmed', 'approved', 'quoted', 'estimated'],
        completed: ['completed'],
        cancelled: ['cancelled'],
      };
      result = result.filter(e => statusMap[statusFilter].includes(e.workflow_status));
    }

    // Apply service type filter
    if (serviceTypeFilter !== 'all') {
      result = result.filter(e => e.service_type === serviceTypeFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = parseISO(a.event_date).getTime() - parseISO(b.event_date).getTime();
          break;
        case 'name':
          comparison = a.contact_name.localeCompare(b.contact_name);
          break;
        case 'total':
          comparison = (a.invoice?.total_amount || 0) - (b.invoice?.total_amount || 0);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [quotes, invoices, statusFilter, serviceTypeFilter, sortBy, sortOrder]);

  const isLoading = quotesLoading || invoicesLoading;
  const isMobile = useMediaQuery('(max-width: 640px)');

  if (quotesError) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-destructive">
          Error loading events: {quotesError.message}
        </CardContent>
      </Card>
    );
  }

  const handleEventClick = (event: QuoteRequest) => {
    if (isDesktop) {
      navigate(`/admin/event/${event.id}`);
    } else {
      setSelectedQuote(event);
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Controls Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or event..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          
          {/* View Toggle */}
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
            <TabsList className="h-9">
              <TabsTrigger value="list" className="gap-1.5 px-3">
                <List className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">List</span>
              </TabsTrigger>
              <TabsTrigger value="week" className="gap-1.5 px-3">
                <CalendarDays className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Week</span>
              </TabsTrigger>
              <TabsTrigger value="month" className="gap-1.5 px-3">
                <CalendarRange className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Month</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Date Navigation (only for week/month views) */}
        {viewMode !== 'list' && (
          <DateNavigation 
            currentDate={currentDate} 
            viewMode={viewMode} 
            onDateChange={setCurrentDate} 
          />
        )}

        {/* Filters (only for list view) */}
        {viewMode === 'list' && (
          <EventFilters
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            serviceTypeFilter={serviceTypeFilter}
            setServiceTypeFilter={setServiceTypeFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
          />
        )}

        {/* Content */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              {viewMode === 'list' ? 'All Events' : 
               viewMode === 'week' ? 'Week View' : 'Month View'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : !eventsWithInvoices?.length ? (
              <p className="text-center py-8 text-muted-foreground">No events found</p>
            ) : viewMode === 'week' ? (
              <EventWeekView 
                events={eventsWithInvoices} 
                currentDate={currentDate}
                onEventClick={handleEventClick}
              />
            ) : viewMode === 'month' ? (
              <EventMonthView 
                events={eventsWithInvoices} 
                currentDate={currentDate}
                onEventClick={handleEventClick}
              />
            ) : isMobile ? (
              /* Mobile Card Layout */
              <div className="space-y-3">
                {eventsWithInvoices.map((event) => {
                  const { icon: ActionIcon, label: actionLabel } = getActionDetails(event.workflow_status);
                  const invoice = event.invoice;
                  
                  return (
                    <div
                      key={event.id}
                      className="p-4 border rounded-lg bg-card active:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedQuote(event)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{event.contact_name}</p>
                          <p className="text-sm text-muted-foreground truncate">{event.event_name}</p>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`shrink-0 ml-2 text-xs ${eventStatusColors[event.workflow_status] || ''}`}
                        >
                          {formatStatus(event.workflow_status)}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mb-3">
                        <span>{format(new Date(event.event_date), 'MMM d, yyyy')}</span>
                        <span>{event.guest_count} guests</span>
                        {invoice && (
                          <span className="font-medium text-foreground">
                            {formatCurrency(invoice.total_amount)}
                          </span>
                        )}
                      </div>
                      
                        <div className="flex items-center justify-between">
                        {invoice ? (
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${estimateStatusColors[invoice.workflow_status] || ''}`}
                          >
                            Est: {formatStatus(invoice.workflow_status)}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">No estimate</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Desktop Table Layout */
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="hidden sm:table-cell">Event</TableHead>
                    <TableHead className="hidden md:table-cell">Guests</TableHead>
                    <TableHead>Event Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Estimate</TableHead>
                    <TableHead className="hidden xl:table-cell">Total</TableHead>
                    <TableHead className="hidden lg:table-cell">Email</TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                {eventsWithInvoices.map((event) => {
                  const { icon: ActionIcon, label: actionLabel } = getActionDetails(event.workflow_status);
                  const invoice = event.invoice;
                  
                  return (
                    <TableRow 
                      key={event.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => {
                        if (isDesktop) {
                          navigate(`/admin/event/${event.id}`);
                        } else {
                          setSelectedQuote(event);
                        }
                      }}
                    >
                      <TableCell className="font-medium">
                        {format(new Date(event.event_date), 'MMM d, yyyy')}
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
                        <Badge 
                          variant="outline" 
                          className={eventStatusColors[event.workflow_status] || ''}
                        >
                          {formatStatus(event.workflow_status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {invoice ? (
                          <Badge 
                            variant="outline" 
                            className={estimateStatusColors[invoice.workflow_status] || ''}
                          >
                            {formatStatus(invoice.workflow_status)}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        {invoice ? (
                          <span className="font-medium">{formatCurrency(invoice.total_amount)}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <EmailTrackingIndicator invoice={invoice} />
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          title={actionLabel}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedQuote(event);
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
    </TooltipProvider>
  );
}

// Email tracking indicator component
function EmailTrackingIndicator({ invoice }: { invoice: InvoiceForEvent | null }) {
  if (!invoice) {
    return <span className="text-muted-foreground text-sm">—</span>;
  }

  const { sent_at, email_opened_at, viewed_at } = invoice;

  // No email sent yet
  if (!sent_at) {
    return <span className="text-muted-foreground text-sm">Not sent</span>;
  }

  return (
    <div className="flex items-center gap-1">
      {/* Email sent indicator */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`p-1 rounded ${email_opened_at ? 'text-green-600' : 'text-blue-600'}`}>
            {email_opened_at ? (
              <MailOpen className="h-4 w-4" />
            ) : (
              <Mail className="h-4 w-4" />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {email_opened_at ? (
            <p>Email opened {format(new Date(email_opened_at), 'MMM d, h:mm a')}</p>
          ) : (
            <p>Email sent {format(new Date(sent_at), 'MMM d, h:mm a')}</p>
          )}
        </TooltipContent>
      </Tooltip>

      {/* Portal viewed indicator */}
      {viewed_at && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="p-1 rounded text-purple-600">
              <Globe className="h-4 w-4" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Portal viewed {format(new Date(viewed_at), 'MMM d, h:mm a')}</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}