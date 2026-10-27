import { format } from 'date-fns';
import { parseDateFromLocalString } from '@/utils/dateHelpers';
import { AlertTriangle, ChevronRight, Users } from 'lucide-react';
import type { StaffEvent } from '@/hooks/useStaffEvents';
import { cn } from '@/lib/utils';
import { formatEventType, formatServiceType } from '@/utils/eventTypeLabels';
import { useAuth } from '@/hooks/useAuth';
import { findMyAssignment } from './myShift';
import { MyShiftBanner } from './MyShiftBanner';
import { getCountdownLabel, formatStaffTime, getDietarySummary } from './staffUrgency';

interface StaffEventCardProps {
  event: StaffEvent;
  isSelected?: boolean;
  onClick?: () => void;
}

function getStatus(status: string, isPast: boolean): { text: string; dot: string } {
  if (isPast || status === 'completed') return { text: 'Completed', dot: 'bg-muted-foreground/50' };
  if (['confirmed', 'awaiting_payment', 'paid'].includes(status)) return { text: 'Confirmed', dot: 'bg-success' };
  if (status === 'approved') return { text: 'Approved', dot: 'bg-primary' };
  return { text: 'Tentative', dot: 'bg-[hsl(var(--gold))]' };
}

export function StaffEventCard({ event, isSelected, onClick }: StaffEventCardProps) {
  const { user } = useAuth();
  const isPast = event.days_until < 0;
  const myAssignment = isPast ? null : findMyAssignment(event.staff_assignments, {
    email: user?.email,
    fullName: (user?.user_metadata?.full_name || user?.user_metadata?.name) as string | undefined,
  });
  const status = getStatus(event.workflow_status, isPast);
  const crew = event.staff_assignments.length;
  const crewConfirmed = event.staff_assignments.filter((s) => s.confirmed).length;
  const dietary = getDietarySummary(event);
  const servingTime = event.serving_start_time || event.start_time;
  const date = parseDateFromLocalString(event.event_date);

  // Hide the event-type tag when the name already says it (e.g. "Smith Wedding" + "Wedding")
  const typeLabel = formatEventType(event.event_type);
  const showType = typeLabel && !event.event_name.toLowerCase().includes(typeLabel.toLowerCase());
  const meta = [
    servingTime ? `Serve ${formatStaffTime(servingTime)}` : null,
    `${event.guest_count} guests`,
    formatServiceType(event.service_type),
    showType ? typeLabel : null,
  ].filter(Boolean) as string[];

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`View details for ${event.event_name}`}
      aria-pressed={isSelected}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(); } }}
      onClick={onClick}
      className={cn(
        'group flex gap-3.5 rounded-2xl border border-border/70 bg-card p-3.5 sm:p-4 text-card-foreground',
        'cursor-pointer select-none touch-manipulation transition-all duration-200',
        'hover:border-border hover:shadow-sm active:scale-[0.995]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isSelected && 'border-primary/50 bg-primary/[0.03] shadow-sm',
        isPast && 'bg-muted/30',
      )}
    >
      {/* Date block */}
      <div className={cn(
        'flex h-14 w-12 shrink-0 flex-col items-center justify-center rounded-xl border border-border/60 bg-background',
        isPast && 'opacity-60',
      )}>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{format(date, 'MMM')}</span>
        <span className="text-xl font-semibold leading-none tabular-nums">{format(date, 'd')}</span>
        <span className="text-[10px] text-muted-foreground">{format(date, 'EEE')}</span>
      </div>

      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className={cn('h-1.5 w-1.5 rounded-full', status.dot)} aria-hidden="true" />
          <span className="font-medium text-foreground/80">{status.text}</span>
          {!isPast && (
            <>
              <span aria-hidden="true">·</span>
              <span>{getCountdownLabel(event.days_until, event.event_date)}</span>
            </>
          )}
        </div>

        <h3 className={cn('font-semibold leading-snug line-clamp-2 text-[15px] sm:text-base', isPast && 'text-foreground/70')}>
          {event.event_name}
        </h3>

        <p className="text-sm text-muted-foreground line-clamp-1">{meta.join(' · ')}</p>
        {event.location && <p className="text-sm text-muted-foreground line-clamp-1">{event.location}</p>}

        {dietary.labels.length > 0 && !isPast && (
          <p className="flex items-center gap-1.5 text-xs font-medium text-destructive">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="line-clamp-1">{dietary.count > 0 && `${dietary.count} · `}{dietary.labels.join(', ')}</span>
          </p>
        )}

        {myAssignment && <div className="pt-1"><MyShiftBanner assignment={myAssignment} compact /></div>}

        {crew > 0 && (
          <div className="flex justify-end pt-0.5">
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" aria-hidden="true" />
              {isPast ? `${crew} crew` : `${crewConfirmed}/${crew} crew confirmed`}
            </span>
          </div>
        )}
      </div>

      <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0 self-center text-muted-foreground/40 transition-transform group-hover:translate-x-0.5" />
    </div>
  );
}
