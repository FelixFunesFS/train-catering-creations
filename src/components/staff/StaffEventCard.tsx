import { format, parseISO } from 'date-fns';
import { MapPin, Users, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { StaffEvent } from '@/hooks/useStaffEvents';
import { cn } from '@/lib/utils';
import { formatEventType, formatServiceType } from '@/utils/eventTypeLabels';

interface StaffEventCardProps {
  event: StaffEvent;
  isSelected?: boolean;
  onClick?: () => void;
}

// Countdown badge logic
function getCountdownBadge(daysUntil: number, eventDate: string): { text: string; className: string } {
  if (daysUntil < 0) return { text: 'PAST', className: 'bg-muted text-muted-foreground' };
  if (daysUntil === 0) return { text: 'TODAY', className: 'bg-destructive text-destructive-foreground' };
  if (daysUntil === 1) return { text: 'TOMORROW', className: 'bg-amber-500 text-white' };
  if (daysUntil <= 7) return { text: `IN ${daysUntil} DAYS`, className: 'bg-blue-500 text-white' };
  return { text: format(parseISO(eventDate), 'MMM d'), className: 'bg-muted text-muted-foreground' };
}

// Format time for display
function formatTime(time: string | null): string {
  if (!time) return '';
  try {
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return format(date, 'h:mm a');
  } catch {
    return time;
  }
}


export function StaffEventCard({ event, isSelected, onClick }: StaffEventCardProps) {
  const countdown = getCountdownBadge(event.days_until, event.event_date);
  const confirmedCount = event.staff_assignments.filter(s => s.confirmed).length;
  const totalStaff = event.staff_assignments.length;
  
  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(event.location)}`;

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all active:bg-muted/50 active:scale-[0.99]",
        isSelected && "ring-2 ring-primary"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header with countdown */}
        <div className="flex items-start justify-between gap-2">
          <Badge className={cn("text-xs font-semibold shrink-0", countdown.className)}>
            {countdown.text}
          </Badge>
        </div>

        {/* Event name */}
        <h3 className="font-semibold text-lg leading-tight line-clamp-2">
          {event.event_name}
        </h3>

        {/* Contact name */}
        {event.contact_name && (
          <p className="text-sm text-muted-foreground">
            Contact: {event.contact_name}
          </p>
        )}

        {/* Date and time */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4 shrink-0" />
          <span>
            {format(parseISO(event.event_date), 'EEE, MMM d')} • {formatTime(event.start_time)}
          </span>
        </div>

        {/* Location (tappable) */}
        <a 
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-start gap-2 text-sm text-primary hover:underline min-h-[44px] py-2 -my-2"
        >
          <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
          <span className="line-clamp-2">{event.location}</span>
        </a>

        {/* Info badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="gap-1">
            <Users className="h-3 w-3" />
            {event.guest_count} guests
          </Badge>
          <Badge variant="outline">
            {formatServiceType(event.service_type)}
          </Badge>
          <Badge variant="outline">
            {formatEventType(event.event_type)}
          </Badge>
        </div>

        {/* Staff summary */}
        {totalStaff > 0 && (
          <div className="flex items-center gap-2 text-sm pt-1 border-t">
            {confirmedCount === totalStaff ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-amber-500" />
            )}
            <span className="text-muted-foreground">
              {totalStaff} staff • {confirmedCount}/{totalStaff} confirmed
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}