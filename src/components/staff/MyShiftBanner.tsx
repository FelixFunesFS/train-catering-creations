import { useState } from 'react';
import { UserCheck, CircleDashed, CheckCircle2, Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import type { StaffAssignment } from '@/hooks/useStaffEvents';
import { formatStaffTime } from './staffUrgency';
import { cn } from '@/lib/utils';

export function MyShiftBanner({ assignment, compact }: { assignment: StaffAssignment; compact?: boolean }) {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const confirm = async () => {
    setSaving(true);
    const { error } = await (supabase.rpc as any)('confirm_my_staff_assignment', { _assignment_id: assignment.id });
    setSaving(false);
    if (error) {
      toast.error("Couldn't confirm your shift. Please contact the office.");
      return;
    }
    toast.success("Thanks! You're confirmed for this shift.");
    await queryClient.invalidateQueries({ queryKey: ['staff-event'] });
    await queryClient.invalidateQueries({ queryKey: ['staff-events'] });
  };

  return (
    <div
      className={cn(
        'rounded-lg border border-primary/30 bg-primary/5',
        compact ? 'px-2.5 py-1.5 text-xs' : 'p-3 text-sm space-y-3'
      )}
    >
      <div className="flex items-center gap-2">
        <UserCheck className={cn('shrink-0 text-primary', compact ? 'h-3.5 w-3.5' : 'h-5 w-5')} aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <span className="font-semibold text-primary">Your shift: </span>
          <span className="font-medium">{assignment.role}</span>
          {assignment.arrival_time && <> · Arrive {formatStaffTime(assignment.arrival_time)}</>}
          {!compact && assignment.notes && <p className="text-xs text-muted-foreground mt-0.5">{assignment.notes}</p>}
        </div>
        {assignment.confirmed ? (
          <span className="shrink-0 inline-flex items-center gap-1 text-xs font-medium text-success">
            <CheckCircle2 className="h-3 w-3" aria-hidden="true" /> Confirmed
          </span>
        ) : (
          <span className="shrink-0 inline-flex items-center gap-1 text-xs font-medium text-[hsl(var(--gold-dark))]">
            <CircleDashed className="h-3 w-3" aria-hidden="true" /> Pending
          </span>
        )}
      </div>
      {!compact && !assignment.confirmed && (
        <Button onClick={confirm} disabled={saving} className="w-full h-12 md:h-10 touch-manipulation font-semibold print:hidden">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
          Confirm I'll be there
        </Button>
      )}
    </div>
  );
}
