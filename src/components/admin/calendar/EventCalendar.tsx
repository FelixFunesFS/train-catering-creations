import { useState, useEffect, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Download, Users, MapPin, Clock, Mail, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    id: string;
    event_name: string;
    contact_name: string;
    email: string;
    phone: string;
    guest_count: number;
    location: string;
    workflow_status: string;
    service_type: string;
  };
}

const statusColors: Record<string, string> = {
  pending: 'hsl(var(--muted))',
  under_review: 'hsl(45, 93%, 47%)', // amber
  estimated: 'hsl(221, 83%, 53%)', // blue
  approved: 'hsl(142, 71%, 45%)', // green
  confirmed: 'hsl(142, 76%, 36%)', // darker green
  paid: 'hsl(142, 76%, 36%)', // green
  cancelled: 'hsl(0, 84%, 60%)', // red
  completed: 'hsl(var(--muted))',
};

export function EventCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<typeof Views[keyof typeof Views]>(Views.MONTH);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadEvents();
  }, [currentDate]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const monthStart = startOfMonth(subMonths(currentDate, 1));
      const monthEnd = endOfMonth(addMonths(currentDate, 1));

      const { data, error } = await supabase
        .from('quote_requests')
        .select('*')
        .gte('event_date', monthStart.toISOString().split('T')[0])
        .lte('event_date', monthEnd.toISOString().split('T')[0])
        .neq('workflow_status', 'cancelled')
        .order('event_date', { ascending: true });

      if (error) throw error;

      const calendarEvents: CalendarEvent[] = (data || []).map(quote => {
        const eventDate = new Date(quote.event_date);
        const startTime = quote.start_time 
          ? new Date(`${quote.event_date}T${quote.start_time}`)
          : eventDate;
        const endTime = new Date(startTime.getTime() + 3 * 60 * 60 * 1000); // Default 3 hours

        return {
          id: quote.id,
          title: quote.event_name,
          start: startTime,
          end: endTime,
          resource: {
            id: quote.id,
            event_name: quote.event_name,
            contact_name: quote.contact_name,
            email: quote.email,
            phone: quote.phone,
            guest_count: quote.guest_count,
            location: quote.location,
            workflow_status: quote.workflow_status,
            service_type: quote.service_type,
          },
        };
      });

      setEvents(calendarEvents);
    } catch (error) {
      console.error('Error loading calendar events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (action: 'PREV' | 'NEXT' | 'TODAY') => {
    switch (action) {
      case 'PREV':
        setCurrentDate(prev => subMonths(prev, 1));
        break;
      case 'NEXT':
        setCurrentDate(prev => addMonths(prev, 1));
        break;
      case 'TODAY':
        setCurrentDate(new Date());
        break;
    }
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  const handleViewEvent = () => {
    if (selectedEvent) {
      navigate(`/admin?view=events&quoteId=${selectedEvent.id}`);
      setSelectedEvent(null);
    }
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    const status = event.resource.workflow_status;
    const backgroundColor = statusColors[status] || statusColors.pending;
    
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: 'none',
        display: 'block',
        fontSize: '12px',
        padding: '2px 4px',
      },
    };
  };

  const generateICalExport = () => {
    const confirmedEvents = events.filter(e => 
      ['confirmed', 'paid', 'approved'].includes(e.resource.workflow_status)
    );

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Soul Trains Eatery//Event Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      ...confirmedEvents.flatMap(event => [
        'BEGIN:VEVENT',
        `UID:${event.id}@soultrainseatery.com`,
        `DTSTAMP:${format(new Date(), "yyyyMMdd'T'HHmmss'Z'")}`,
        `DTSTART:${format(event.start, "yyyyMMdd'T'HHmmss")}`,
        `DTEND:${format(event.end, "yyyyMMdd'T'HHmmss")}`,
        `SUMMARY:${event.title}`,
        `DESCRIPTION:Contact: ${event.resource.contact_name}\\nGuests: ${event.resource.guest_count}\\nPhone: ${event.resource.phone}`,
        `LOCATION:${event.resource.location}`,
        'END:VEVENT',
      ]),
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `soul-trains-events-${format(currentDate, 'yyyy-MM')}.ics`;
    link.click();
  };

  const statusLegend = useMemo(() => [
    { status: 'pending', label: 'Pending', color: statusColors.pending },
    { status: 'estimated', label: 'Estimate Sent', color: statusColors.estimated },
    { status: 'approved', label: 'Approved', color: statusColors.approved },
    { status: 'confirmed', label: 'Confirmed', color: statusColors.confirmed },
  ], []);

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => handleNavigate('PREV')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-semibold min-w-[200px] text-center">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <Button variant="outline" size="icon" onClick={() => handleNavigate('NEXT')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleNavigate('TODAY')}>
              Today
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-4 mr-4">
              {statusLegend.map(item => (
                <div key={item.status} className="flex items-center gap-1.5">
                  <div 
                    className="w-3 h-3 rounded" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={generateICalExport}>
              <Download className="h-4 w-4 mr-2" />
              Export iCal
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[600px]">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading events...</div>
          </div>
        ) : (
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            date={currentDate}
            onNavigate={(date) => setCurrentDate(date)}
            view={view}
            onView={(newView) => setView(newView)}
            onSelectEvent={handleSelectEvent}
            eventPropGetter={eventStyleGetter}
            views={['month', 'week', 'day']}
            popup
            style={{ height: '100%' }}
          />
        )}
      </CardContent>

      {/* Event Detail Modal */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {selectedEvent?.title}
            </DialogTitle>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge 
                  style={{ 
                    backgroundColor: statusColors[selectedEvent.resource.workflow_status],
                    color: 'white'
                  }}
                >
                  {selectedEvent.resource.workflow_status.replace('_', ' ')}
                </Badge>
                <Badge variant="outline">{selectedEvent.resource.service_type}</Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {format(selectedEvent.start, 'EEEE, MMMM d, yyyy')}
                    {selectedEvent.resource.workflow_status !== 'pending' && (
                      <> at {format(selectedEvent.start, 'h:mm a')}</>
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedEvent.resource.guest_count} guests</span>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedEvent.resource.location}</span>
                </div>

                <div className="border-t pt-3 mt-3">
                  <p className="text-sm font-medium mb-2">Contact Information</p>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div>{selectedEvent.resource.contact_name}</div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3" />
                      {selectedEvent.resource.email}
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      {selectedEvent.resource.phone}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button className="flex-1" onClick={handleViewEvent}>
                  Open Event Details
                </Button>
                <Button variant="outline" onClick={() => setSelectedEvent(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
