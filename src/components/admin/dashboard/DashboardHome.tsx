import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  DollarSign, 
  AlertTriangle, 
  Users, 
  CheckCircle2,
  Clock,
  ArrowRight,
  CalendarDays
} from 'lucide-react';
import { format, isToday, isTomorrow, differenceInDays } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useDashboardKPIs, useAtRiskEvents, useUpcomingEvents } from '@/hooks/useEvents';

export function DashboardHome() {
  const navigate = useNavigate();
  
  const { data: kpis, isLoading: kpisLoading } = useDashboardKPIs();
  const { data: atRiskEvents, isLoading: riskLoading } = useAtRiskEvents();
  const { data: upcomingEvents, isLoading: upcomingLoading } = useUpcomingEvents(7);

  const loading = kpisLoading || riskLoading || upcomingLoading;

  // Transform at-risk events to display format
  const riskEvents = (atRiskEvents || []).slice(0, 5).map(event => {
    const eventDate = new Date(event.event_date);
    const daysUntilEvent = differenceInDays(eventDate, new Date());
    return {
      id: event.quote_id,
      event_name: event.event_name,
      event_date: event.event_date,
      contact_name: event.contact_name,
      workflow_status: event.quote_status,
      riskLevel: event.risk_level,
      message: `Event in ${daysUntilEvent} days - ${event.quote_status}`,
    };
  });

  // Filter upcoming to only confirmed events
  const confirmedUpcoming = (upcomingEvents || [])
    .filter(e => ['confirmed', 'paid', 'approved'].includes(e.quote_status))
    .slice(0, 5);

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
            <div className="text-2xl font-bold">{kpis?.openLeads || 0}</div>
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
            <div className="text-2xl font-bold">{kpis?.eventsThisWeek || 0}</div>
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
            <div className="text-2xl font-bold">{formatCurrency(kpis?.outstandingBalance || 0)}</div>
            <p className="text-xs text-muted-foreground">Unpaid invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Needs Attention</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis?.atRiskCount || 0}</div>
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
            {confirmedUpcoming.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No confirmed events this week.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {confirmedUpcoming.map(event => {
                  const eventDate = new Date(event.event_date);
                  const dateLabel = isToday(eventDate) ? 'Today' : isTomorrow(eventDate) ? 'Tomorrow' : format(eventDate, 'EEE, MMM d');
                  
                  return (
                    <div 
                      key={event.quote_id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/admin?view=events&quoteId=${event.quote_id}`)}
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
