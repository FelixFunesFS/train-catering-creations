import { UserCheck, CircleDashed } from 'lucide-react';
import type { StaffAssignment } from '@/hooks/useStaffEvents';
import { formatStaffTime } from './staffUrgency';
import { cn } from '@/lib/utils';

export function MyShiftBanner({ assignment, compact }: { assignment: StaffAssignment; compact?: boolean }) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5',
        compact ? 'px-2.5 py-1.5 text-xs' : 'p-3 text-sm'
      )}
    >
      <UserCheck className={cn('shrink-0 text-primary', compact ? 'h-3.5 w-3.5' : 'h-5 w-5')} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <span className="font-semibold text-primary">Your shift: </span>
        <span className="font-medium">{assignment.role}</span>
        {assignment.arrival_time && <> · Arrive {formatStaffTime(assignment.arrival_time)}</>}
        {!compact && assignment.notes && <p className="text-xs text-muted-foreground mt-0.5">{assignment.notes}</p>}
      </div>
      {assignment.confirmed ? (
        <span className="shrink-0 text-xs font-medium text-success">Confirmed</span>
      ) : (
        <span className="shrink-0 inline-flex items-center gap-1 text-xs font-medium text-[hsl(var(--gold-dark))]">
          <CircleDashed className="h-3 w-3" aria-hidden="true" /> Pending
        </span>
      )}
    </div>
  );
}
