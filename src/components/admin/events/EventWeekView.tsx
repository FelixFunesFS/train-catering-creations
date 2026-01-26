import { useMemo, useState } from 'react';
import { format, startOfWeek, addDays, isSameDay, isToday, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Clock, Users, MapPin, Shield } from 'lucide-react';
import { isMilitaryEvent } from '@/utils/eventTypeUtils';
import { Database } from '@/integrations/supabase/types';
import { formatLocationLink } from '@/utils/linkFormatters';
import { EventSummaryPanel } from './EventSummaryPanel';
import { useMediaQuery } from '@/hooks/useMediaQuery';

type QuoteRequest = Database['public']['Tables']['quote_requests']['Row'];

interface InvoiceForEvent {
  id: string;
  quote_request_id: string | null;
  workflow_status: Database['public']['Enums']['invoice_workflow_status'];
  total_amount: number;
}

interface EventWithInvoice extends QuoteRequest {
  invoice: InvoiceForEvent | null;
}

interface EventWeekViewProps {
  events: EventWithInvoice[];
  currentDate: Date;
  onEventClick: (event: QuoteRequest) => void;
}

const statusColors: Record<string, string> = {
  pending: 'border-l-yellow-500 bg-yellow-500/5',
  under_review: 'border-l-blue-500 bg-blue-500/5',
  estimated: 'border-l-purple-500 bg-purple-500/5',
  quoted: 'border-l-indigo-500 bg-indigo-500/5',
  approved: 'border-l-green-500 bg-green-500/5',
  confirmed: 'border-l-emerald-500 bg-emerald-500/5',
  completed: 'border-l-gray-500 bg-gray-500/5',
  cancelled: 'border-l-red-500 bg-red-500/5',
};

function EventCard({ event, onClick }: { event: EventWithInvoice; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`p-2 rounded border-l-4 cursor-pointer hover:shadow-md transition-shadow ${
        statusColors[event.workflow_status] || 'border-l-gray-300 bg-muted/20'
      }`}
    >
      <p className="font-medium text-sm truncate">
        {event.contact_name}
      </p>
      <p className="text-xs text-muted-foreground truncate">
        {event.event_name}
      </p>
      
      <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" />
        <span>{event.start_time?.slice(0, 5) || 'TBD'}</span>
      </div>
      
      <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
        <Users className="h-3 w-3" />
        <span>{event.guest_count}</span>
      </div>
      
      {isMilitaryEvent(event.event_type) && (
        <div className="flex items-center gap-1 mt-0.5 text-xs text-blue-600">
          <Shield className="h-3 w-3" />
          <span className="truncate">{event.military_organization || 'Military'}</span>
        </div>
      )}
      
      {event.location && (
        <a 
          href={formatLocationLink(event.location) || '#'}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 mt-0.5 text-xs text-primary hover:underline"
          aria-label="Open in Maps"
        >
          <MapPin className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">{event.location}</span>
        </a>
      )}
      
      {event.invoice && (
        <Badge 
          variant="outline" 
          className="mt-1.5 text-[10px] px-1.5 py-0"
        >
          ${(event.invoice.total_amount / 100).toLocaleString()}
        </Badge>
      )}
    </div>
  );
}

export function EventWeekView({ events, currentDate, onEventClick }: EventWeekViewProps) {
  const navigate = useNavigate();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const isMobile = useMediaQuery('(max-width: 639px)');
  const [selectedEvent, setSelectedEvent] = useState<EventWithInvoice | null>(null);
  
  // Generate 7 days starting from the week's Sunday
  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 0 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [currentDate]);

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, EventWithInvoice[]> = {};
    
    weekDays.forEach(day => {
      const dateKey = format(day, 'yyyy-MM-dd');
      grouped[dateKey] = events.filter(event => 
        isSameDay(parseISO(event.event_date), day)
      );
    });
    
    return grouped;
  }, [events, weekDays]);

  const handleEventCardClick = (event: EventWithInvoice) => {
    setSelectedEvent(event);
  };

  const handleViewFull = () => {
    if (selectedEvent) {
      if (isDesktop) {
        navigate(`/admin/event/${selectedEvent.id}`);
      } else {
        onEventClick(selectedEvent);
      }
      setSelectedEvent(null);
    }
  };

  // Mobile: Vertical layout
  if (isMobile) {
    return (
      <>
        <div className="space-y-3">
          {weekDays.map((day) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayEvents = eventsByDate[dateKey] || [];
            const isCurrentDay = isToday(day);
            
            return (
              <div 
                key={dateKey}
                className={`rounded-lg border ${
                  isCurrentDay 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border bg-card'
                }`}
              >
                {/* Day Header */}
                <div className={`px-3 py-2 flex items-center justify-between border-b ${
                  isCurrentDay ? 'bg-primary/10' : 'bg-muted/30'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-semibold ${isCurrentDay ? 'text-primary' : ''}`}>
                      {format(day, 'd')}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {format(day, 'EEEE')}
                    </span>
                  </div>
                  {dayEvents.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {dayEvents.length} event{dayEvents.length > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
                
                {/* Events */}
                <div className="p-2 space-y-2">
                  {dayEvents.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-2">
                      No events
                    </p>
                  ) : (
                    dayEvents.map((event) => (
                      <EventCard 
                        key={event.id}
                        event={event}
                        onClick={() => handleEventCardClick(event)}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Event Summary Sheet */}
        <Sheet open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
          <SheetContent side="bottom" className="h-[min(85vh,500px)] sm:h-[85vh] p-0 rounded-t-xl">
            {selectedEvent && (
              <EventSummaryPanel 
                event={selectedEvent} 
                onClose={() => setSelectedEvent(null)}
                onViewFull={handleViewFull}
              />
            )}
          </SheetContent>
        </Sheet>
      </>
    );
  }

  // Tablet/Desktop: Horizontal layout
  return (
    <>
      <ScrollArea className="w-full">
        <div className="flex gap-2 pb-4 min-w-[900px] lg:min-w-0">
          {weekDays.map((day) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayEvents = eventsByDate[dateKey] || [];
            const isCurrentDay = isToday(day);
            
            return (
              <div 
                key={dateKey}
                className={`flex-1 min-w-[140px] rounded-lg border ${
                  isCurrentDay 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border bg-card'
                }`}
              >
                {/* Day Header */}
                <div className={`p-2 text-center border-b ${
                  isCurrentDay ? 'bg-primary/10' : 'bg-muted/30'
                }`}>
                  <div className="text-xs font-medium text-muted-foreground uppercase">
                    {format(day, 'EEE')}
                  </div>
                  <div className={`text-lg font-semibold ${
                    isCurrentDay ? 'text-primary' : ''
                  }`}>
                    {format(day, 'd')}
                  </div>
                </div>
                
                {/* Events */}
                <div className="p-2 space-y-2 min-h-[200px]">
                  {dayEvents.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      No events
                    </p>
                  ) : (
                    dayEvents.map((event) => (
                      <EventCard 
                        key={event.id}
                        event={event}
                        onClick={() => handleEventCardClick(event)}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Event Summary Sheet */}
      <Sheet open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <SheetContent className="w-[calc(100vw-1rem)] sm:w-[350px] md:w-[400px] p-0">
          {selectedEvent && (
            <EventSummaryPanel 
              event={selectedEvent} 
              onClose={() => setSelectedEvent(null)}
              onViewFull={handleViewFull}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
