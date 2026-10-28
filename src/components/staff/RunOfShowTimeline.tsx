import { useEffect, useState } from 'react';
import { Truck, Flag, Wine, UtensilsCrossed, Sparkles, ListOrdered } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { StaffEvent } from '@/hooks/useStaffEvents';
import { buildRunOfShow, getCurrentStepIndex, type RunStepKind } from './runOfShow';
import { formatStaffTime } from './staffUrgency';
import { cn } from '@/lib/utils';

const icons: Record<RunStepKind, React.ElementType> = {
  arrival: Truck,
  start: Flag,
  cocktail: Wine,
  serving: UtensilsCrossed,
  breakdown: Sparkles,
};

const nowHHMM = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export function RunOfShowTimeline({ event }: { event: StaffEvent }) {
  const steps = buildRunOfShow(event);
  const [now, setNow] = useState(nowHHMM);

  useEffect(() => {
    if (!event.is_today) return;
    const id = setInterval(() => setNow(nowHHMM()), 60_000);
    return () => clearInterval(id);
  }, [event.is_today]);

  const current = getCurrentStepIndex(steps, now, event.is_today);

  return (
    <Card className="rounded-xl p-4 sm:p-5 !shadow-none !bg-none bg-card border border-border/60 hover:!shadow-none hover:!translate-y-0">
      <div className="flex items-center justify-between mb-4">
        <h3 className="flex items-center gap-2 font-semibold">
          <ListOrdered className="h-4 w-4 text-primary" aria-hidden="true" />
          Run of Show
        </h3>
        {event.is_today && (
          <span className="text-xs font-medium text-destructive flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" aria-hidden="true" />
            Live · {formatStaffTime(now)}
          </span>
        )}
      </div>

      <ol className="relative">
        {steps.map((step, i) => {
          const Icon = icons[step.kind];
          const done = current >= 0 && i < current;
          const active = i === current;
          const last = i === steps.length - 1;
          return (
            <li key={`${step.kind}-${i}`} className="relative flex gap-3 pb-5 last:pb-0" aria-current={active ? 'step' : undefined}>
              {!last && (
                <span
                  aria-hidden="true"
                  className={cn('absolute left-[1.125rem] top-10 bottom-0 w-px -translate-x-1/2', done || active ? 'bg-primary/50' : 'bg-border')}
                />
              )}
              <div
                className={cn(
                  'relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 bg-card',
                  active && 'border-primary bg-primary text-primary-foreground ring-4 ring-primary/15',
                  done && 'border-primary/50 text-primary',
                  !active && !done && 'border-border text-muted-foreground',
                  step.kind === 'serving' && !active && !done && 'border-primary/40 text-primary'
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </div>
              <div className={cn('min-w-0 flex-1 pt-1', done && 'opacity-60')}>
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className={cn('text-sm font-semibold tabular-nums', step.time ? 'text-foreground' : 'text-muted-foreground')}>
                    {step.time ? formatStaffTime(step.time) : 'Time TBD'}
                  </span>
                  <span className={cn('text-sm', step.kind === 'serving' ? 'font-semibold text-primary' : 'font-medium')}>
                    {step.title}
                  </span>
                  {active && <span className="text-[11px] font-semibold uppercase tracking-wide text-primary">Now</span>}
                </div>
                {step.detail && <p className="text-xs text-muted-foreground mt-0.5 break-words">{step.detail}</p>}
              </div>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
