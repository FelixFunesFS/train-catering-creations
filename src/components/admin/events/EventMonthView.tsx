import { useMemo, useState } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameDay, 
  isSameMonth, 
  isToday,
  parseISO 
} from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Database } from '@/integrations/supabase/types';
import { MapPin, Phone } from 'lucide-react';
import { formatLocationLink, formatPhoneLink } from '@/utils/linkFormatters';

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

interface EventMonthViewProps {
  events: EventWithInvoice[];
  currentDate: Date;
  onEventClick: (event: QuoteRequest) => void;
}

const statusDotColors: Record<string, string> = {
  pending: 'bg-yellow-500',
  under_review: 'bg-blue-500',
  estimated: 'bg-purple-500',
  quoted: 'bg-indigo-500',
  approved: 'bg-green-500',
  confirmed: 'bg-emerald-500',
  completed: 'bg-gray-500',
  cancelled: 'bg-red-500',
};

export function EventMonthView({ events, currentDate, onEventClick }: EventMonthViewProps) {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Generate calendar grid
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    
    const days: Date[] = [];
    let day = calendarStart;
    
    while (day <= calendarEnd) {
      days.push(day);
      day = addDays(day, 1);
    }
    
    return days;
  }, [currentDate]);

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, EventWithInvoice[]> = {};
    
    events.forEach(event => {
      const dateKey = format(parseISO(event.event_date), 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });
    
    return grouped;
  }, [events]);

  // Get selected day's events
  const selectedDayEvents = useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    return eventsByDate[dateKey] || [];
  }, [selectedDate, eventsByDate]);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
      {/* Calendar Grid */}
      <div className="bg-card rounded-lg border p-3">
        {/* Week day headers */}
        <div className="grid grid-cols-7 mb-2">
          {weekDays.map(day => (
            <div 
              key={day} 
              className="text-center text-xs font-medium text-muted-foreground py-2"
            >
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayEvents = eventsByDate[dateKey] || [];
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isCurrentDay = isToday(day);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            
            return (
              <div
                key={dateKey}
                onClick={() => setSelectedDate(day)}
                className={`
                  min-h-[80px] p-1.5 rounded cursor-pointer transition-colors
                  ${isCurrentMonth ? 'bg-background' : 'bg-muted/30'}
                  ${isCurrentDay ? 'ring-2 ring-primary ring-inset' : ''}
                  ${isSelected ? 'bg-primary/10' : 'hover:bg-muted/50'}
                `}
              >
                <div className={`text-sm font-medium mb-1 ${
                  !isCurrentMonth ? 'text-muted-foreground/50' : 
                  isCurrentDay ? 'text-primary' : ''
                }`}>
                  {format(day, 'd')}
                </div>
                
                {/* Event dots/previews */}
                <div className="space-y-0.5">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div 
                      key={event.id}
                      className="flex items-center gap-1 group"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        statusDotColors[event.workflow_status] || 'bg-gray-400'
                      }`} />
                      <span className="text-[10px] truncate text-muted-foreground group-hover:text-foreground">
                        {event.contact_name}
                      </span>
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-[10px] text-muted-foreground pl-2">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Events Panel */}
      <div className="bg-card rounded-lg border p-4">
        <h3 className="font-semibold mb-3">
          {selectedDate 
            ? format(selectedDate, 'EEEE, MMMM d')
            : 'Select a day'
          }
        </h3>
        
        <ScrollArea className="h-[400px]">
          {selectedDate ? (
            selectedDayEvents.length > 0 ? (
              <div className="space-y-2 pr-2">
                {selectedDayEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className="p-3 rounded-lg border bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-medium text-sm">{event.contact_name}</p>
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        statusDotColors[event.workflow_status] || 'bg-gray-400'
                      }`} />
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{event.event_name}</p>
                    
                    {/* Contact info with clickable links */}
                    <div className="space-y-1 mt-2">
                      {event.phone && (
                        <a 
                          href={formatPhoneLink(event.phone) || '#'}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 text-xs text-primary hover:underline"
                          aria-label="Call customer"
                        >
                          <Phone className="h-3 w-3" />
                          {event.phone}
                        </a>
                      )}
                      {event.location && (
                        <a 
                          href={formatLocationLink(event.location) || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 text-xs text-primary hover:underline"
                          aria-label="Open in Maps"
                        >
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </a>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                      <span>{event.start_time?.slice(0, 5) || 'TBD'}</span>
                      <span>{event.guest_count} guests</span>
                    </div>
                    {event.invoice && (
                      <Badge variant="outline" className="mt-2 text-xs">
                        ${(event.invoice.total_amount / 100).toLocaleString()}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No events on this day
              </p>
            )
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              Click a day to see events
            </p>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
