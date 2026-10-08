import { usePaymentSnapshots } from '@/hooks/usePaymentSnapshots';
import { PaymentSnapshotCompact, getOverdueInfo } from './PaymentSnapshotView';
import { useState, useMemo, useCallback } from 'react';
import { usePagination } from '@/hooks/usePagination';
import { PaginationControls } from '@/components/admin/PaginationControls';
import { format } from 'date-fns';
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
import { Search, Eye, Loader2, FileText, Receipt, Mail, MailOpen, Globe, List, CalendarDays, CalendarRange, Phone, Shield, CreditCard, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { isMilitaryEvent, getMilitaryBadgeStyles } from '@/utils/eventTypeUtils';
import { getPaymentStatus, getNextUnpaidMilestone } from '@/utils/statusHelpers';
import { EventDetail } from './EventDetail';
import { SendPaymentReminderDialog } from './SendPaymentReminderDialog';
import { PaymentRecorder } from '@/components/admin/billing/PaymentRecorder';
import { EventWeekView } from './EventWeekView';
import { EventMonthView } from './EventMonthView';
import { DateNavigation } from './DateNavigation';
import { EventFilters, StatusFilter, ServiceTypeFilter, SortBy, SortOrder } from './EventFilters';
import { SortableTableHead } from './SortableTableHead';
import { QuickEventDialog } from './QuickEventDialog';
import { MobileFilterSheet } from './MobileFilterSheet';
import { Plus } from 'lucide-react';
import { AdminApproveButton } from './AdminApproveButton';
import { getProposalStatus, isPreApproval } from '@/utils/proposalStatus';
import { formatDateTimeShortET } from '@/utils/formatters';
import { parseDateFromLocalString } from '@/utils/dateHelpers';
import { Database } from '@/integrations/supabase/types';

type QuoteRequest = Database['public']['Tables']['quote_requests']['Row'];

// Fetch raw invoices for email tracking fields
function useRawInvoices() {
  return useQuery({
    queryKey: ['invoices', 'raw-for-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          id, 
          quote_request_id, 
          workflow_status, 
          total_amount, 
          sent_at, 
          viewed_at, 
          email_opened_at, 
          invoice_number,
          last_customer_interaction,
          payment_milestones (
            id,
            milestone_type,
            status,
            due_date
          )
        `)
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
  awaiting_payment: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
  paid: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
  partially_paid: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
  payment_pending: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
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

// Map granular DB statuses to admin-friendly business labels
const eventStatusLabels: Record<string, string> = {
  awaiting_payment: 'Confirmed',
  paid: 'Confirmed',
  partially_paid: 'Confirmed',
  payment_pending: 'Confirmed',
};

function formatStatus(status: string): string {
  if (eventStatusLabels[status]) return eventStatusLabels[status];
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
  invoice_number: string | null;
  last_customer_interaction: string | null;
  payment_milestones: Array<{
    id: string;
    milestone_type: string;
    status: string | null;
    due_date: string | null;
  }> | null;
};

interface EventWithInvoice extends QuoteRequest {
  invoice: InvoiceForEvent | null;
}

type ViewMode = 'list' | 'week' | 'month';

interface EventListProps {
  excludeStatuses?: string[];
}

export function EventList({ excludeStatuses = [] }: EventListProps) {
  const [search, setSearch] = useState('');
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [reminderDialogEvent, setReminderDialogEvent] = useState<EventWithInvoice | null>(null);
  const [paymentInvoiceId, setPaymentInvoiceId] = useState<string | null>(null);
  const [quickOpen, setQuickOpen] = useState(false);
  const { toast } = useToast();
  
  // Filter & Sort state - default to newest submissions first
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [serviceTypeFilter, setServiceTypeFilter] = useState<ServiceTypeFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  
  // Handle column header clicks for sorting
  const handleSort = useCallback((key: SortBy) => {
    if (sortBy === key) {
      // Toggle order if clicking same column
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      // Default to desc for submitted (newest first), asc for others
      setSortOrder(key === 'submitted' ? 'desc' : 'asc');
    }
  }, [sortBy]);
  
  const navigate = useNavigate();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  
  const { data: quotes, isLoading: quotesLoading, error: quotesError } = useQuotes({ search: search || undefined });
  const { data: invoices, isLoading: invoicesLoading } = useRawInvoices();
  const snapshots = usePaymentSnapshots();

  // Join quotes with their invoices and apply filters/sorting
  const eventsWithInvoices = useMemo((): EventWithInvoice[] => {
    if (!quotes) return [];
    
    let result = quotes.map(quote => ({
      ...quote,
      invoice: invoices?.find(inv => inv.quote_request_id === quote.id) || null,
    }));

    // Exclude specified statuses (for use when SubmissionsCard handles pending/under_review)
    if (excludeStatuses.length > 0) {
      result = result.filter(e => !excludeStatuses.includes(e.workflow_status));
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      const statusMap: Record<StatusFilter, string[]> = {
        all: [],
        pending: ['pending', 'under_review'],
        confirmed: ['confirmed', 'approved', 'quoted', 'estimated', 'awaiting_payment', 'paid', 'partially_paid', 'payment_pending'],
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
        case 'submitted':
          comparison = new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
          break;
        case 'date':
          comparison = parseDateFromLocalString(a.event_date).getTime() - parseDateFromLocalString(b.event_date).getTime();
          break;
        case 'name':
          comparison = a.contact_name.localeCompare(b.contact_name);
          break;
        case 'event':
          comparison = a.event_name.localeCompare(b.event_name);
          break;
        case 'guests':
          comparison = a.guest_count - b.guest_count;
          break;
        case 'status':
          comparison = a.workflow_status.localeCompare(b.workflow_status);
          break;
        case 'invoice':
          const aInv = a.invoice?.invoice_number || '';
          const bInv = b.invoice?.invoice_number || '';
          comparison = aInv.localeCompare(bInv);
          break;
        case 'total':
          comparison = (a.invoice?.total_amount || 0) - (b.invoice?.total_amount || 0);
          break;
        case 'edited':
          comparison = new Date(a.updated_at || 0).getTime() - new Date(b.updated_at || 0).getTime();
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [quotes, invoices, excludeStatuses, statusFilter, serviceTypeFilter, sortBy, sortOrder]);

  const isLoading = quotesLoading || invoicesLoading;
  const isMobile = useMediaQuery('(max-width: 640px)');

  // Past events collapse: hide past events unless they still owe money.
  // Searching or picking a status filter shows everything.
  const [showPast, setShowPast] = useState<boolean>(() => {
    try { return localStorage.getItem('admin.events.showPast') === 'true'; } catch { return false; }
  });
  const toggleShowPast = () => setShowPast(v => {
    try { localStorage.setItem('admin.events.showPast', String(!v)); } catch {}
    return !v;
  });
  const [overdueOpen, setOverdueOpen] = useState(false);
  const { listEvents, hiddenPastCount, overdueEvents } = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const owesMoney = (e: EventWithInvoice) => {
      if (!e.invoice || e.workflow_status === 'cancelled') return false;
      if (!['approved', 'payment_pending', 'partially_paid', 'overdue'].includes(e.invoice.workflow_status)) return false;
      const snap = snapshots.get(e.invoice.id);
      const balance = snap ? snap.balanceCents : ((e.invoice as any).balance_remaining ?? e.invoice.total_amount ?? 0);
      return balance > 0;
    };
    if (showPast || search || statusFilter !== 'all') return { listEvents: eventsWithInvoices, hiddenPastCount: 0, overdueEvents: [] as EventWithInvoice[] };
    let hidden = 0;
    const overdue: EventWithInvoice[] = [];
    const kept = eventsWithInvoices.filter(e => {
      const isPast = parseDateFromLocalString(e.event_date).getTime() < today.getTime();
      if (!isPast) return true;
      if (owesMoney(e)) {
        // Agreed future due date = grace period: keep it in the main list, not the past-due card.
        const due = snapshots.get(e.invoice!.id)?.nextMilestone?.dueDate;
        if (due && parseDateFromLocalString(due).getTime() >= today.getTime()) return true;
        overdue.push(e); return false;
      }
      hidden++;
      return false;
    });
    return { listEvents: kept, hiddenPastCount: hidden, overdueEvents: overdue };
  }, [eventsWithInvoices, snapshots, showPast, search, statusFilter]);

  // Approved, upcoming, nothing paid, and the first payment date has passed.
  const [awaitingOpen, setAwaitingOpen] = useState(false);
  const awaitingDeposit = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return eventsWithInvoices.filter(e => {
      const inv = e.invoice;
      if (!inv || e.workflow_status === 'cancelled') return false;
      if (!['approved', 'payment_pending', 'overdue'].includes(inv.workflow_status)) return false;
      if (parseDateFromLocalString(e.event_date).getTime() < today.getTime()) return false;
      const snap = snapshots.get(inv.id);
      if (!snap || snap.paidCents > 0 || snap.balanceCents <= 0) return false;
      const due = snap.nextMilestone?.dueDate;
      return !!due && parseDateFromLocalString(due).getTime() < today.getTime();
    });
  }, [eventsWithInvoices, snapshots]);
  const daysBetween = (from: Date, to: Date) => Math.round((to.getTime() - from.getTime()) / 86400000);

  // Pagination for list view (15 per page)
  const { currentPage, setCurrentPage, totalPages, startIndex, endIndex } = usePagination(
    listEvents.length,
    15,
    [search, statusFilter, serviceTypeFilter, sortBy, sortOrder, showPast]
  );
  const paginatedEvents = useMemo(
    () => listEvents.slice(startIndex, endIndex),
    [listEvents, startIndex, endIndex]
  );

  const paymentReminderStatuses = ['approved', 'payment_pending', 'partially_paid', 'overdue'];
  // Invoices that can still accept a payment (has remaining balance)
  const takePaymentStatuses = ['approved', 'payment_pending', 'partially_paid', 'overdue', 'sent', 'viewed'];
  
  const handleOpenReminderDialog = useCallback((e: React.MouseEvent, event: EventWithInvoice) => {
    e.stopPropagation();
    setReminderDialogEvent(event);
  }, []);

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
    navigate(`/admin/event/${event.id}`);
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Controls: 2 rows on mobile, 1 row on desktop */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <div className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name, email, event..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
                aria-label="Search events"
              />
            </div>
            <Button onClick={() => setQuickOpen(true)} className="h-10 px-3 gap-1 shrink-0 sm:hidden" aria-label="New event">
              <Plus className="h-4 w-4" /> New
            </Button>
          </div>

          <div className="flex items-center justify-between gap-2">
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
              <TabsList className="h-9">
                <TabsTrigger value="list" className="gap-1.5 px-3" aria-label="List view">
                  <List className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">List</span>
                </TabsTrigger>
                <TabsTrigger value="week" className="gap-1.5 px-3" aria-label="Week view">
                  <CalendarDays className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Week</span>
                </TabsTrigger>
                <TabsTrigger value="month" className="gap-1.5 px-3" aria-label="Month view">
                  <CalendarRange className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Month</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
            {viewMode === 'list' && (
              <div className="sm:hidden">
                <MobileFilterSheet
                  statusFilter={statusFilter}
                  setStatusFilter={setStatusFilter}
                  serviceTypeFilter={serviceTypeFilter}
                  setServiceTypeFilter={setServiceTypeFilter}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  sortOrder={sortOrder}
                  setSortOrder={setSortOrder}
                />
              </div>
            )}
            <Button onClick={() => setQuickOpen(true)} className="h-9 gap-1.5 hidden sm:inline-flex">
              <Plus className="h-4 w-4" /> New Event
            </Button>
          </div>
        </div>
        <QuickEventDialog open={quickOpen} onOpenChange={setQuickOpen} />

        {/* Date Navigation (only for week/month views) */}
        {viewMode !== 'list' && (
          <DateNavigation 
            currentDate={currentDate} 
            viewMode={viewMode} 
            onDateChange={setCurrentDate} 
          />
        )}

        {/* Filters (desktop inline; mobile uses the sheet) */}
        {viewMode === 'list' && (
          <div className="hidden sm:block">
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
          </div>
        )}

        {viewMode === 'list' && overdueEvents.length > 0 && (
          <Card className="border-destructive/30 bg-destructive/5">
            <button type="button" onClick={() => setOverdueOpen(o => !o)} aria-expanded={overdueOpen}
              className="w-full flex items-center justify-between gap-3 p-4 sm:px-6 text-left min-h-[56px]">
              <div className="min-w-0">
                <p className="text-lg font-semibold flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-destructive shrink-0" />
                  Past-Due Balances
                  <Badge variant="outline" className="border-destructive/30 text-destructive">{overdueEvents.length}</Badge>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Past events with {formatCurrency(overdueEvents.reduce((t, e) => t + (snapshots.get(e.invoice!.id)?.balanceCents ?? 0), 0))} still owed
                </p>
              </div>
              <span className="text-xs font-medium text-destructive shrink-0">{overdueOpen ? 'Hide' : 'Show'}</span>
            </button>
            {overdueOpen && (
              <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0 space-y-3">
                {overdueEvents.map(event => {
                  const invoice = event.invoice!;
                  return (
                    <div key={event.id} className="p-4 border rounded-lg bg-card cursor-pointer" onClick={() => navigate(`/admin/event/${event.id}`)}>
                      <div className="flex flex-wrap justify-between gap-2 mb-2">
                        <div className="min-w-0">
                          <p className="font-medium truncate">{event.contact_name}</p>
                          <p className="text-sm text-muted-foreground truncate">{event.event_name} · Event Date: <span className="text-foreground font-medium">{format(parseDateFromLocalString(event.event_date), 'MMM d, yyyy')}</span></p>
                        </div>
                        <Badge variant="outline" className="h-6 text-xs border-destructive/30 bg-destructive/10 text-destructive">Payment Overdue</Badge>
                      </div>
                      {snapshots.get(invoice.id) && <div className="mb-3 rounded-md bg-muted/40 px-3 py-2"><PaymentSnapshotCompact snapshot={snapshots.get(invoice.id)} eventDate={event.event_date} overdue={getOverdueInfo(snapshots.get(invoice.id), invoice.workflow_status, event.event_date)} /></div>}
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" className="h-10 text-xs gap-1.5 px-3 bg-success text-success-foreground hover:bg-success/90"
                          onClick={(e) => { e.stopPropagation(); setPaymentInvoiceId(invoice.id); }}>
                          <CreditCard className="h-4 w-4" /> Record Payment
                        </Button>
                        <Button variant="outline" size="sm" className="h-10 text-xs gap-1.5 px-3 border-amber-500/40 bg-amber-500/10 text-amber-800 hover:bg-amber-500/20 hover:text-amber-900 dark:text-amber-300"
                          onClick={(e) => handleOpenReminderDialog(e, event)}>
                          <DollarSign className="h-4 w-4" /> Remind
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            )}
          </Card>
        )}

        {viewMode === 'list' && awaitingDeposit.length > 0 && (
          <Card className="border-amber-500/40 bg-amber-500/5">
            <button type="button" onClick={() => setAwaitingOpen(o => !o)} aria-expanded={awaitingOpen}
              className="w-full flex items-center justify-between gap-3 p-4 sm:px-6 text-left min-h-[56px]">
              <div className="min-w-0">
                <p className="text-lg font-semibold flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-amber-600 shrink-0" />
                  Approved – Awaiting Deposit
                  <Badge variant="outline" className="border-amber-500/40 text-amber-800 dark:text-amber-300">{awaitingDeposit.length}</Badge>
                </p>
                <p className="text-xs text-muted-foreground mt-1">Approved, upcoming, nothing paid yet, and the first payment date has passed. Pay, remind, change the date, or cancel.</p>
              </div>
              <span className="text-xs font-medium text-amber-800 dark:text-amber-300 shrink-0">{awaitingOpen ? 'Hide' : 'Show'}</span>
            </button>
            {awaitingOpen && (
              <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0 space-y-3">
                {awaitingDeposit.map(event => {
                  const invoice = event.invoice!;
                  const snap = snapshots.get(invoice.id)!;
                  const today = new Date(); today.setHours(0, 0, 0, 0);
                  const lateDays = daysBetween(parseDateFromLocalString(snap.nextMilestone!.dueDate!), today);
                  const untilEvent = daysBetween(today, parseDateFromLocalString(event.event_date));
                  const lastContact = (invoice as any).last_customer_interaction as string | null;
                  return (
                    <div key={event.id} className="p-4 border rounded-lg bg-card cursor-pointer" onClick={() => navigate(`/admin/event/${event.id}`)}>
                      <div className="flex flex-wrap justify-between gap-2 mb-2">
                        <div className="min-w-0">
                          <p className="font-medium truncate">{event.contact_name}</p>
                          <p className="text-sm text-muted-foreground truncate">{event.event_name}</p>
                          <p className="text-sm mt-1"><span className="text-muted-foreground">Event Date:</span> <span className="font-medium">{format(parseDateFromLocalString(event.event_date), 'EEE, MMM d, yyyy')}</span></p>
                        </div>
                        <span className="font-semibold">{formatCurrency(snap.balanceCents)}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-3 text-xs">
                        <Badge variant="outline" className="border-destructive/30 bg-destructive/10 text-destructive">Payment late {lateDays} day{lateDays === 1 ? '' : 's'}</Badge>
                        <Badge variant="outline">{untilEvent === 0 ? 'Event today' : `Event in ${untilEvent} day${untilEvent === 1 ? '' : 's'}`}</Badge>
                        <Badge variant="outline">{lastContact ? `Last contact ${format(new Date(lastContact), 'MMM d')}` : 'No contact logged'}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" className="h-10 text-xs gap-1.5 px-3 bg-success text-success-foreground hover:bg-success/90"
                          onClick={(e) => { e.stopPropagation(); setPaymentInvoiceId(invoice.id); }}>
                          <CreditCard className="h-4 w-4" /> Take Payment
                        </Button>
                        <Button variant="outline" size="sm" className="h-10 text-xs gap-1.5 px-3 border-amber-500/40 bg-amber-500/10 text-amber-800 hover:bg-amber-500/20 hover:text-amber-900 dark:text-amber-300"
                          onClick={(e) => handleOpenReminderDialog(e, event)}>
                          <DollarSign className="h-4 w-4" /> Remind
                        </Button>
                        <Button variant="outline" size="sm" className="h-10 text-xs gap-1.5 px-3"
                          onClick={(e) => { e.stopPropagation(); navigate(`/admin/event/${event.id}`); }}>
                          <Eye className="h-4 w-4" /> Log Call / Change Date / Cancel
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            )}
          </Card>
        )}

        {/* Content */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="text-lg">
                {viewMode === 'list' ? (showPast || search || statusFilter !== 'all' ? 'All Events' : 'Upcoming Events') :
                 viewMode === 'week' ? 'Week View' : 'Month View'}
              </CardTitle>
              {viewMode === 'list' && !search && statusFilter === 'all' && (showPast || hiddenPastCount > 0) && (
                <Button variant="outline" size="sm" className="h-10 sm:h-9" onClick={toggleShowPast} aria-expanded={showPast}>
                  {showPast ? 'Hide past events' : `Show past events (${hiddenPastCount})`}
                </Button>
              )}
            </div>
            {viewMode === 'list' && !showPast && hiddenPastCount > 0 && !search && statusFilter === 'all' && (
              <p className="text-xs text-muted-foreground mt-1">Past events that still owe money are in the Past-Due Balances card above.</p>
            )}
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (viewMode === 'list' ? !listEvents.length : !eventsWithInvoices?.length) ? (
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
                <p className="text-xs text-muted-foreground rounded-md border border-dashed px-3 py-2">Tip: Estimates are valid 7 days. If the customer called, texted, or agreed to a payment arrangement, log it (Log Call / Note) so the quote isn't treated as expired. Customer agreed by phone? Tap Approve, or Pay to approve and record the deposit in one step.</p>
                {paginatedEvents.map((event) => {
                  const { icon: ActionIcon, label: actionLabel } = getActionDetails(event.workflow_status);
                  const invoice = event.invoice;
                  
                  return (
                    <div
                      key={event.id}
                      className="p-4 border rounded-lg bg-card active:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/admin/event/${event.id}`)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{event.contact_name}</p>
                          <p className="text-sm text-muted-foreground truncate">{event.event_name}</p>
                          {isMilitaryEvent(event.event_type) && (
                            <Badge className={getMilitaryBadgeStyles().className + " text-[10px] px-1.5 py-0 mt-1"}>
                              <Shield className="h-2.5 w-2.5 mr-0.5" />
                              Military
                            </Badge>
                          )}
                        </div>
                        {/* Show event status badge only when no invoice (avoids redundancy) */}
                        {!invoice && (
                          <Badge 
                            variant="outline" 
                            className={`shrink-0 ml-2 text-xs ${eventStatusColors[event.workflow_status] || ''}`}
                          >
                            {formatStatus(event.workflow_status)}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mb-3">
                        <span className="inline-flex items-center gap-1 text-foreground"><CalendarDays className="h-3.5 w-3.5" aria-hidden="true" /><span className="text-muted-foreground">Event Date:</span> <span className="font-medium">{format(parseDateFromLocalString(event.event_date), 'EEE, MMM d, yyyy')}</span></span>
                        <span>{event.guest_count} guests</span>
                        {invoice?.invoice_number && (
                          <span className="font-mono text-xs">{invoice.invoice_number}</span>
                        )}
                        {invoice && (
                          <span className="font-medium text-foreground">
                            {formatCurrency(invoice.total_amount)}
                          </span>
                        )}
                      </div>
                      {invoice && isPreApproval(invoice.workflow_status) ? (() => {
                        const ps = getProposalStatus(invoice)!;
                        const warn = ps.state === 'needs_follow_up';
                        return (
                          <div className={`mb-3 rounded-md px-3 py-2 text-xs ${warn ? 'border border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300' : 'bg-muted/40'}`}>
                            <p className="font-medium text-foreground">Estimate {formatCurrency(invoice.total_amount)} · {ps.label}{ps.daysSinceSent !== null ? ` (${ps.daysSinceSent}d ago)` : ''}</p>
                            <p className={warn ? '' : 'text-muted-foreground'}>{ps.detail}. No payment is owed until approved.</p>
                          </div>
                        );
                      })() : invoice && snapshots.get(invoice.id) && (
                        <div className="mb-3 rounded-md bg-muted/40 px-3 py-2">
                          <PaymentSnapshotCompact snapshot={snapshots.get(invoice.id)} eventDate={event.event_date} overdue={getOverdueInfo(snapshots.get(invoice.id), invoice.workflow_status, event.event_date)} />
                        </div>
                      )}
                      <div className="flex flex-wrap gap-x-3 text-xs text-muted-foreground mb-2">
                        <span>Submitted: {formatDateTimeShortET(event.created_at!)}</span>
                        {event.updated_at && event.updated_at !== event.created_at && (
                          <span>Edited: {formatDateTimeShortET(event.updated_at)}</span>
                        )}
                      </div>
                      
                      {/* Status badges - show primary status only (avoid redundancy) */}
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {invoice ? (
                          <>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${['overdue','payment_pending','partially_paid','paid'].includes(invoice.workflow_status) ? (eventStatusColors[event.workflow_status] || '') : (estimateStatusColors[invoice.workflow_status] || '')}`}
                            >
                              {['overdue','payment_pending','partially_paid','paid'].includes(invoice.workflow_status)
                                ? (['confirmed','completed'].includes(event.workflow_status) ? formatStatus(event.workflow_status) : 'Approved')
                                : formatStatus(invoice.workflow_status)}
                            </Badge>
                            {(() => {
                              const nextMilestone = invoice.payment_milestones 
                                ? getNextUnpaidMilestone(invoice.payment_milestones)
                                : null;
                              const paymentStatus = getPaymentStatus(invoice.workflow_status, nextMilestone?.milestone_type, nextMilestone?.due_date, event.event_date);
                              if (!paymentStatus) return null;
                              return (
                                <Badge variant="outline" className={`text-xs ${paymentStatus.color} border`}>
                                  <CreditCard className="h-3 w-3 mr-0.5" />
                                  {/^overdue$/i.test(paymentStatus.label) ? 'Payment Overdue' : paymentStatus.label}
                                </Badge>
                              );
                            })()}
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground">No estimate</span>
                        )}
                      </div>

                      {/* Labeled action buttons for mobile */}
                      <div className="grid grid-cols-2 gap-2 pt-3 border-t [&>button]:w-full [&>button]:justify-center">
                        {event.phone && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-10 text-xs font-medium gap-1.5 px-3 border-border text-foreground hover:bg-muted hover:text-foreground"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.location.href = `tel:${event.phone}`;
                            }}
                          >
                            <Phone className="h-4 w-4" />
                            Call
                          </Button>
                        )}
                        
                        {invoice && isPreApproval(invoice.workflow_status) && invoice.workflow_status !== 'draft' && (
                          <AdminApproveButton invoiceId={invoice.id} quoteId={event.id} customerName={event.contact_name} />
                        )}
                        {invoice && takePaymentStatuses.includes(invoice.workflow_status) && (
                          <Button
                            size="sm"
                            className="h-10 text-xs font-medium gap-1.5 px-3 bg-success text-success-foreground hover:bg-success/90"
                            aria-label="Take payment"
                            onClick={(e) => { e.stopPropagation(); setPaymentInvoiceId(invoice.id); }}
                          >
                            <CreditCard className="h-4 w-4" />
                            Pay
                          </Button>
                        )}

                        {invoice && paymentReminderStatuses.includes(invoice.workflow_status) && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-10 text-xs font-medium gap-1.5 px-3 border-amber-500/40 bg-amber-500/10 text-amber-800 hover:bg-amber-500/20 hover:text-amber-900 dark:text-amber-300"
                            onClick={(e) => handleOpenReminderDialog(e, event)}
                          >
                            <DollarSign className="h-4 w-4" />
                            Remind
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-10 text-xs font-medium gap-1.5 px-3 bg-muted/60 text-foreground hover:bg-muted hover:text-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/event/${event.id}`);
                          }}
                        >
                          <ActionIcon className="h-4 w-4" />
                          {actionLabel.replace('View ', '')}
                        </Button>
                        
                        {(invoice?.sent_at || invoice?.viewed_at) && <div className="col-span-2 flex gap-3">
                        {invoice?.sent_at && (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            {invoice.email_opened_at ? (
                              <><MailOpen className="h-3 w-3 text-green-600" /> Opened</>
                            ) : (
                              <><Mail className="h-3 w-3 text-blue-600" /> Sent</>
                            )}
                          </span>
                        )}
                        
                        {invoice?.viewed_at && (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Globe className="h-3 w-3 text-purple-600" /> Viewed
                          </span>
                        )}
                        </div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Desktop Table Layout */
              <>
              <p className="mb-3 text-xs text-muted-foreground rounded-md border border-dashed px-3 py-2">Tip: Estimates are valid 7 days. If the customer called, texted, or agreed to a payment arrangement, log it (Log Call / Note) so the quote isn't treated as expired. Customer agreed by phone? Tap Approve, or Pay to approve and record the deposit in one step.</p>
              <Table className="[&_th]:lg:px-2 [&_td]:lg:px-2">
                <TableHeader>
                  <TableRow>
                    <SortableTableHead 
                      label="Submitted" 
                      sortKey="submitted" 
                      currentSortBy={sortBy} 
                      currentSortOrder={sortOrder}
                      onSort={handleSort}
                      className="hidden lg:table-cell"
                    />
                    <SortableTableHead 
                      label="Event Date" 
                      sortKey="date" 
                      currentSortBy={sortBy} 
                      currentSortOrder={sortOrder}
                      onSort={handleSort}
                    />
                    <SortableTableHead 
                      label="Customer" 
                      sortKey="name" 
                      currentSortBy={sortBy} 
                      currentSortOrder={sortOrder}
                      onSort={handleSort}
                    />
                    <SortableTableHead 
                      label="Event" 
                      sortKey="event" 
                      currentSortBy={sortBy} 
                      currentSortOrder={sortOrder}
                      onSort={handleSort}
                      className="hidden sm:table-cell"
                    />
                    <SortableTableHead 
                      label="Guests" 
                      sortKey="guests" 
                      currentSortBy={sortBy} 
                      currentSortOrder={sortOrder}
                      onSort={handleSort}
                      className="hidden lg:table-cell"
                    />
                    <SortableTableHead 
                      label="Status"
                      sortKey="status" 
                      currentSortBy={sortBy} 
                      currentSortOrder={sortOrder}
                      onSort={handleSort}
                    />
                    <SortableTableHead 
                      label="Payment" 
                      sortKey="payment_status" 
                      currentSortBy={sortBy} 
                      currentSortOrder={sortOrder}
                      onSort={handleSort}
                      className="hidden lg:table-cell"
                    />
                    <SortableTableHead 
                      label="Invoice #" 
                      sortKey="invoice" 
                      currentSortBy={sortBy} 
                      currentSortOrder={sortOrder}
                      onSort={handleSort}
                      className="hidden lg:table-cell"
                    />
                    <SortableTableHead 
                      label="Total" 
                      sortKey="total" 
                      currentSortBy={sortBy} 
                      currentSortOrder={sortOrder}
                      onSort={handleSort}
                      className="hidden lg:table-cell"
                    />
                    <SortableTableHead 
                      label="Last Edited" 
                      sortKey="edited" 
                      currentSortBy={sortBy} 
                      currentSortOrder={sortOrder}
                      onSort={handleSort}
                      className="hidden lg:table-cell"
                    />
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                {paginatedEvents.map((event) => {
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
                      <TableCell className="hidden lg:table-cell text-muted-foreground whitespace-nowrap">
                        {formatDateTimeShortET(event.created_at!)}
                      </TableCell>
                      <TableCell className="font-medium whitespace-nowrap">
                        {format(parseDateFromLocalString(event.event_date), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{event.contact_name}</p>
                          <p className="text-xs text-muted-foreground hidden sm:block">{event.email}</p>
                          {isMilitaryEvent(event.event_type) && (
                            <Badge className={getMilitaryBadgeStyles().className + " text-[10px] px-1 py-0 mt-0.5"}>
                              <Shield className="h-2.5 w-2.5 mr-0.5" />
                              Military
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {event.event_name}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
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
                        {(() => {
                          if (!invoice) return <span className="text-muted-foreground">—</span>;
                          const ps = getProposalStatus(invoice);
                          if (ps) return (
                            <Badge variant="outline" title={ps.detail} className={`text-xs ${ps.state === 'needs_follow_up' ? 'border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300' : 'text-muted-foreground'}`}>
                              {ps.label}
                            </Badge>
                          );
                          const nextMilestone = invoice.payment_milestones 
                            ? getNextUnpaidMilestone(invoice.payment_milestones)
                            : null;
                          const paymentStatus = getPaymentStatus(invoice.workflow_status, nextMilestone?.milestone_type, nextMilestone?.due_date, event.event_date);
                          if (!paymentStatus) return <span className="text-muted-foreground">—</span>;
                          return (
                            <Badge variant="outline" className={`text-xs ${paymentStatus.color} border`}>
                              {paymentStatus.label}
                            </Badge>
                          );
                        })()}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {invoice?.invoice_number ? (
                          <span className="font-mono text-sm">{invoice.invoice_number}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {invoice ? (
                          <span className="font-medium">{formatCurrency(invoice.total_amount)}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground whitespace-nowrap">
                        {event.updated_at ? formatDateTimeShortET(event.updated_at) : '—'}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        {invoice && isPreApproval(invoice.workflow_status) && invoice.workflow_status !== 'draft' && (
                          <AdminApproveButton invoiceId={invoice.id} quoteId={event.id} customerName={event.contact_name} className="h-8 mr-1" />
                        )}
                        {invoice && takePaymentStatuses.includes(invoice.workflow_status) && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                aria-label="Take payment"
                                onClick={(e) => { e.stopPropagation(); setPaymentInvoiceId(invoice.id); }}
                              >
                                <CreditCard className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Take Payment</TooltipContent>
                          </Tooltip>
                        )}
                        {invoice && paymentReminderStatuses.includes(invoice.workflow_status) && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenReminderDialog(e, event);
                                }}
                              >
                                <DollarSign className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Send Payment Reminder</TooltipContent>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                </TableBody>
              </Table>
            )}
          </CardContent>
          {viewMode === 'list' && (
            <div className="px-3 sm:px-6 pb-4">
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                startIndex={startIndex}
                endIndex={endIndex}
                totalItems={listEvents.length}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </Card>

        {/* Detail Modal */}
        {selectedQuote && (
          <EventDetail 
            quote={selectedQuote} 
            onClose={() => setSelectedQuote(null)} 
          />
        )}

        {/* Take Payment dialog (mounted only on demand) */}
        {paymentInvoiceId && (
          <PaymentRecorder invoiceId={paymentInvoiceId} onClose={() => setPaymentInvoiceId(null)} />
        )}

        {/* Payment Reminder Dialog */}
        {reminderDialogEvent && (
          <SendPaymentReminderDialog
            open={!!reminderDialogEvent}
            onOpenChange={(open) => { if (!open) setReminderDialogEvent(null); }}
            quoteId={reminderDialogEvent.id}
            eventName={reminderDialogEvent.event_name}
            primaryEmail={reminderDialogEvent.email}
            invoiceNumber={reminderDialogEvent.invoice?.invoice_number || null}
            totalAmount={reminderDialogEvent.invoice?.total_amount || 0}
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