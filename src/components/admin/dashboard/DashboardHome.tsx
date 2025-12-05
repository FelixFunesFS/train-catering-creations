import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  AlertTriangle, 
  Users, 
  CheckCircle2,
  Clock,
  ArrowRight,
  CalendarDays
} from 'lucide-react';
import { format, differenceInDays, startOfWeek, endOfWeek, isToday, isTomorrow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface KPIData {
  openLeads: number;
  eventsThisWeek: number;
  outstandingBalance: number;
  recentActivity: number;
}

interface RiskEvent {
  id: string;
  event_name: string;
  event_date: string;
  contact_name: string;
  workflow_status: string;
  riskLevel: 'high' | 'medium' | 'low';
  message: string;
}

interface UpcomingEvent {
  id: string;
  event_name: string;
  event_date: string;
  start_time: string;
  contact_name: string;
  guest_count: number;
  workflow_status: string;
}

export function DashboardHome() {
  const [kpis, setKpis] = useState<KPIData>({ openLeads: 0, eventsThisWeek: 0, outstandingBalance: 0, recentActivity: 0 });
  const [riskEvents, setRiskEvents] = useState<RiskEvent[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const today = new Date();
      const weekStart = startOfWeek(today);
      const weekEnd = endOfWeek(today);

      // Load KPIs in parallel
      const [quotesResult, invoicesResult, upcomingResult] = await Promise.all([
        // Open leads (pending, under_review)
        supabase
          .from('quote_requests')
          .select('id, workflow_status')
          .in('workflow_status', ['pending', 'under_review', 'estimated']),
        
        // Outstanding invoices
        supabase
          .from('invoices')
          .select('id, total_amount, workflow_status')
          .in('workflow_status', ['sent', 'viewed', 'approved', 'payment_pending', 'partially_paid']),
        
        // This week's events
        supabase
          .from('quote_requests')
          .select('*')
          .gte('event_date', weekStart.toISOString().split('T')[0])
          .lte('event_date', weekEnd.toISOString().split('T')[0])
          .order('event_date', { ascending: true })
      ]);

      // Calculate KPIs
      const openLeads = quotesResult.data?.length || 0;
      const eventsThisWeek = upcomingResult.data?.length || 0;
      const outstandingBalance = invoicesResult.data?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0;

      setKpis({
        openLeads,
        eventsThisWeek,
        outstandingBalance,
        recentActivity: openLeads + eventsThisWeek
      });

      // Load at-risk events
      const { data: riskQuotes } = await supabase
        .from('quote_requests')
        .select(`
          id, event_name, event_date, contact_name, workflow_status,
          invoices(id, total_amount, workflow_status, due_date)
        `)
        .gte('event_date', today.toISOString())
        .order('event_date', { ascending: true })
        .limit(10);

      const risks: RiskEvent[] = [];
      riskQuotes?.forEach(quote => {
        const eventDate = new Date(quote.event_date);
        const daysUntilEvent = differenceInDays(eventDate, today);

        if (daysUntilEvent <= 14 && quote.workflow_status !== 'paid' && quote.workflow_status !== 'confirmed') {
          risks.push({
            id: quote.id,
            event_name: quote.event_name,
            event_date: quote.event_date,
            contact_name: quote.contact_name,
            workflow_status: quote.workflow_status,
            riskLevel: daysUntilEvent <= 7 ? 'high' : 'medium',
            message: `Event in ${daysUntilEvent} days - ${quote.workflow_status}`,
          });
        }
      });

      setRiskEvents(risks.slice(0, 5));

      // Load upcoming events (next 7 days)
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);

      const { data: upcoming } = await supabase
        .from('quote_requests')
        .select('id, event_name, event_date, start_time, contact_name, guest_count, workflow_status')
        .gte('event_date', today.toISOString().split('T')[0])
        .lte('event_date', nextWeek.toISOString().split('T')[0])
        .in('workflow_status', ['confirmed', 'paid', 'approved'])
        .order('event_date', { ascending: true })
        .limit(5);

      setUpcomingEvents(upcoming || []);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-destructive text-destructive-foreground';
      case 'medium': return 'bg-amber-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}><CardContent className="p-6 h-24" /></Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/admin?view=events&tab=list')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.openLeads}</div>
            <p className="text-xs text-muted-foreground">Pending & under review</p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/admin?view=events&tab=calendar')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Events This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.eventsThisWeek}</div>
            <p className="text-xs text-muted-foreground">Scheduled events</p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/admin?view=billing')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(kpis.outstandingBalance)}</div>
            <p className="text-xs text-muted-foreground">Unpaid invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Needs Attention</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{riskEvents.length}</div>
            <p className="text-xs text-muted-foreground">At-risk events</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* At-Risk Events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                At-Risk Events
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Requires attention</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin?view=events&filter=at-risk')}>
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {riskEvents.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="h-10 w-10 mx-auto text-green-500 mb-2" />
                <p className="text-sm text-muted-foreground">All clear! No at-risk events.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {riskEvents.map(event => (
                  <div 
                    key={event.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/admin?view=events&quoteId=${event.id}`)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{event.event_name}</p>
                      <p className="text-xs text-muted-foreground">{event.message}</p>
                    </div>
                    <Badge className={getRiskColor(event.riskLevel)}>
                      {event.riskLevel}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" />
                Upcoming Events
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Next 7 days</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin?view=events&tab=calendar')}>
              Calendar <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No confirmed events this week.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map(event => {
                  const eventDate = new Date(event.event_date);
                  const dateLabel = isToday(eventDate) ? 'Today' : isTomorrow(eventDate) ? 'Tomorrow' : format(eventDate, 'EEE, MMM d');
                  
                  return (
                    <div 
                      key={event.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/admin?view=events&quoteId=${event.id}`)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{event.event_name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {event.start_time ? format(new Date(`2000-01-01T${event.start_time}`), 'h:mm a') : 'TBD'}
                          <span>•</span>
                          <Users className="h-3 w-3" />
                          {event.guest_count} guests
                        </div>
                      </div>
                      <Badge variant={isToday(eventDate) ? 'default' : 'secondary'}>
                        {dateLabel}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
