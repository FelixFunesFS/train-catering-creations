import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle,
  Search,
  RefreshCw,
  Eye,
  TrendingUp,
  Users,
  ListChecks
} from 'lucide-react';
import { format, differenceInDays, isPast, isFuture } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { EventDetailModal } from './EventDetailModal';

interface EventStatus {
  quote: any;
  invoice: any;
  payment_status: 'unpaid' | 'partial' | 'paid';
  total_paid: number;
  days_until_event: number;
  urgency: 'critical' | 'high' | 'medium' | 'low';
}

export function EventStatusBoard() {
  const [events, setEvents] = useState<EventStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEventStatuses();
  }, []);

  const fetchEventStatuses = async () => {
    try {
      setLoading(true);

      // Fetch quotes with confirmed or pending status
      const { data: quotes, error: quotesError } = await supabase
        .from('quote_requests')
        .select('*')
        .in('status', ['confirmed', 'quoted', 'reviewed'])
        .order('event_date', { ascending: true });

      if (quotesError) throw quotesError;

      // Fetch invoices for these quotes
      const quoteIds = quotes?.map(q => q.id) || [];
      const { data: invoices } = await supabase
        .from('invoices')
        .select('*')
        .in('quote_request_id', quoteIds);

      // Fetch payment transactions
      const invoiceIds = invoices?.map(i => i.id) || [];
      const { data: transactions } = await supabase
        .from('payment_transactions')
        .select('invoice_id, amount')
        .in('invoice_id', invoiceIds)
        .eq('status', 'completed');

      // Calculate payment status for each event
      const eventStatuses: EventStatus[] = (quotes || []).map(quote => {
        const invoice = invoices?.find(i => i.quote_request_id === quote.id);
        const invoiceTransactions = transactions?.filter(t => t.invoice_id === invoice?.id) || [];
        const totalPaid = invoiceTransactions.reduce((sum, t) => sum + t.amount, 0);
        const totalAmount = invoice?.total_amount || 0;
        
        const daysUntil = differenceInDays(new Date(quote.event_date), new Date());
        
        let paymentStatus: 'unpaid' | 'partial' | 'paid' = 'unpaid';
        if (totalPaid >= totalAmount && totalAmount > 0) {
          paymentStatus = 'paid';
        } else if (totalPaid > 0) {
          paymentStatus = 'partial';
        }

        // Determine urgency
        let urgency: 'critical' | 'high' | 'medium' | 'low' = 'low';
        if (daysUntil <= 7 && paymentStatus !== 'paid') {
          urgency = 'critical';
        } else if (daysUntil <= 14 && paymentStatus !== 'paid') {
          urgency = 'high';
        } else if (daysUntil <= 30) {
          urgency = 'medium';
        }

        return {
          quote,
          invoice,
          payment_status: paymentStatus,
          total_paid: totalPaid,
          days_until_event: daysUntil,
          urgency
        };
      });

      // Sort by urgency and date
      eventStatuses.sort((a, b) => {
        const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
          return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
        }
        return a.days_until_event - b.days_until_event;
      });

      setEvents(eventStatuses);
    } catch (error: any) {
      console.error('Error fetching event statuses:', error);
      toast({
        title: 'Error',
        description: 'Failed to load event statuses',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500">Paid</Badge>;
      case 'partial':
        return <Badge className="bg-amber-500">Partial</Badge>;
      default:
        return <Badge variant="destructive">Unpaid</Badge>;
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
  };

  const filteredEvents = events.filter(event => 
    event.quote.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.quote.event_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.quote.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const upcomingEvents = filteredEvents.filter(e => e.days_until_event >= 0);
  const pastEvents = filteredEvents.filter(e => e.days_until_event < 0);

  const stats = {
    total: upcomingEvents.length,
    critical: upcomingEvents.filter(e => e.urgency === 'critical').length,
    unpaid: upcomingEvents.filter(e => e.payment_status === 'unpaid').length,
    confirmed: upcomingEvents.filter(e => e.payment_status === 'paid').length,
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Upcoming Events</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Needs Attention</p>
                <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Awaiting Payment</p>
                <p className="text-2xl font-bold text-amber-600">{stats.unpaid}</p>
              </div>
              <DollarSign className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Confirmed</p>
                <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Event Status Board</CardTitle>
              <CardDescription>Monitor upcoming events and payment status</CardDescription>
            </div>
            <Button onClick={fetchEventStatuses} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by customer name, event, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading events...</div>
          ) : (
            <div className="space-y-6">
              {/* Upcoming Events */}
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Upcoming Events ({upcomingEvents.length})
                </h3>
                <div className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <Card key={event.quote.id} className={`border-l-4 ${getUrgencyColor(event.urgency)}`}>
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
                          <div className="md:col-span-2">
                            <h4 className="font-semibold">{event.quote.event_name}</h4>
                            <p className="text-sm text-muted-foreground">{event.quote.contact_name}</p>
                            <p className="text-xs text-muted-foreground">{event.quote.email}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">
                                {format(new Date(event.quote.event_date), 'MMM dd, yyyy')}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {event.days_until_event} days away
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm">{event.quote.guest_count} guests</p>
                              <p className="text-xs text-muted-foreground">
                                {formatCurrency(event.invoice?.total_amount || 0)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            {getPaymentStatusBadge(event.payment_status)}
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedEventId(event.quote.id);
                                  setModalOpen(true);
                                }}
                                title="View Timeline"
                              >
                                <ListChecks className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/admin?view=workflow&quote=${event.quote.id}`)}
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {upcomingEvents.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">No upcoming events</p>
                  )}
                </div>
              </div>

              {/* Past Events */}
              {pastEvents.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-4 text-muted-foreground">
                    Past Events ({pastEvents.length})
                  </h3>
                  <div className="space-y-2 opacity-60">
                    {pastEvents.slice(0, 5).map((event) => (
                      <Card key={event.quote.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{event.quote.event_name}</p>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(event.quote.event_date), 'MMM dd, yyyy')}
                              </p>
                            </div>
                            {getPaymentStatusBadge(event.payment_status)}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <EventDetailModal 
        eventId={selectedEventId}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}
