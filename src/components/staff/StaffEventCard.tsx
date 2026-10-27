import { format } from 'date-fns';
import { parseDateFromLocalString } from '@/utils/dateHelpers';
import { MapPin, Users, Clock, CheckCircle, AlertCircle, AlertTriangle, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { StaffEvent } from '@/hooks/useStaffEvents';
import { cn } from '@/lib/utils';
import { formatEventType, formatServiceType } from '@/utils/eventTypeLabels';
import { getUrgency, urgencyStyles, getCountdownLabel, formatStaffTime, getDietarySummary } from './staffUrgency';

interface StaffEventCardProps {
  event: StaffEvent;
  isSelected?: boolean;
  onClick?: () => void;
}

// Confirmation status badge
function getConfirmationBadge(status: string): { text: string; className: string } {
  if (['confirmed', 'awaiting_payment', 'paid'].includes(status)) {
    return { text: 'Confirmed', className: 'bg-success/10 text-success border-success/30' };
  }
  if (status === 'approved') {
    return { text: 'Approved', className: 'bg-primary/10 text-primary border-primary/30' };
  }
  return { text: 'Tentative', className: 'bg-[hsl(var(--gold)/0.15)] text-[hsl(var(--gold-dark))] border-[hsl(var(--gold)/0.4)]' };
}

export function StaffEventCard({ event, isSelected, onClick }: StaffEventCardProps) {
  const urgency = getUrgency(event.days_until);
  const styles = urgencyStyles[urgency];
  const confirmation = getConfirmationBadge(event.workflow_status);
  const confirmedCount = event.staff_assignments.filter(s => s.confirmed).length;
  const totalStaff = event.staff_assignments.length;
  const dietary = getDietarySummary(event);
  const servingTime = event.serving_start_time || event.start_time;

  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(event.location)}`;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`View details for ${event.event_name}`}
      aria-pressed={isSelected}
      onKeyDown={handleKeyDown}
      onClick={onClick}
      className={cn(
        'group relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm',
        'cursor-pointer select-none touch-manipulation transition-all duration-200',
        'hover:shadow-md hover:border-primary/30 active:scale-[0.99]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        isSelected && 'ring-2 ring-primary border-primary/40 shadow-md',
        urgency === 'past' && 'opacity-75'
      )}
    >
      {/* Urgency accent bar */}
      <span aria-hidden="true" className={cn('absolute inset-y-0 left-0 w-1.5', styles.accent)} />

      <div className="pl-5 pr-4 py-4 space-y-3">
        {/* Top row: countdown + status */}
        <div className="flex items-center justify-between gap-2">
          <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide', styles.chip)}>
            {getCountdownLabel(event.days_until, event.event_date)}
          </span>
          <Badge variant="outline" className={cn('text-[11px] font-medium', confirmation.className)}>
            {confirmation.text}
          </Badge>
        </div>

        {/* Title + date */}
        <div className="space-y-1">
          <h3 className="font-semibold text-base sm:text-lg leading-snug line-clamp-2 pr-6">
            {event.event_name}
          </h3>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              {format(parseDateFromLocalString(event.event_date), 'EEE, MMM d')}
              {servingTime && <> · <span className="font-medium text-foreground">Serve {formatStaffTime(servingTime)}</span></>}
            </span>
          </div>
        </div>

        {/* Location (tappable) */}
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-start gap-1.5 text-sm text-primary hover:underline min-h-[44px] md:min-h-0 py-1"
        >
          <MapPin className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
          <span className="line-clamp-2">{event.location}</span>
        </a>

        {/* Dietary alert pill */}
        {dietary.labels.length > 0 && (
          <div className="flex items-start gap-1.5 rounded-lg border border-destructive/25 bg-destructive/5 px-2.5 py-1.5 text-xs font-medium text-destructive">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-px" aria-hidden="true" />
            <span className="line-clamp-2">
              {dietary.count > 0 && `${dietary.count} guests · `}
              {dietary.labels.join(', ')}
            </span>
          </div>
        )}

        {/* Meta chips */}
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary" className="gap-1 font-medium">
            <Users className="h-3 w-3" aria-hidden="true" />
            {event.guest_count} guests
          </Badge>
          <Badge variant="outline" className="font-normal">{formatServiceType(event.service_type)}</Badge>
          <Badge variant="outline" className="font-normal">{formatEventType(event.event_type)}</Badge>
        </div>

        {/* Crew summary */}
        {totalStaff > 0 && (
          <div className="flex items-center gap-1.5 text-xs pt-2.5 border-t border-border/60">
            {confirmedCount === totalStaff ? (
              <CheckCircle className="h-4 w-4 text-success" aria-hidden="true" />
            ) : (
              <AlertCircle className="h-4 w-4 text-[hsl(var(--gold-dark))]" aria-hidden="true" />
            )}
            <span className="text-muted-foreground">
              Crew {confirmedCount}/{totalStaff} confirmed
            </span>
          </div>
        )}
      </div>

      <ChevronRight
        aria-hidden="true"
        className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
      />
    </div>
  );
}
