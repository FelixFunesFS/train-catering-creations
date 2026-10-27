import { Navigation, Phone, Share2, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { StaffEvent } from '@/hooks/useStaffEvents';
import { getDirectionsUrl } from './myShift';

/** One-tap field actions. 2x2 grid on phones, single row from tablet up. */
export function StaffQuickActions({ event }: { event: StaffEvent }) {
  const handleShare = async () => {
    const text = `${event.event_name} — ${event.event_date}\n${event.location}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: event.event_name, text, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(`${text}\n${window.location.href}`);
        toast.success('Event details copied');
      }
    } catch {
      /* user cancelled share */
    }
  };

  const btn = 'h-12 md:h-10 w-full gap-2 touch-manipulation font-medium';

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 print:hidden" role="group" aria-label="Quick actions">
      <Button asChild className={btn}>
        <a href={getDirectionsUrl(event.location)} target="_blank" rel="noopener noreferrer">
          <Navigation className="h-4 w-4" aria-hidden="true" /> Directions
        </a>
      </Button>
      {event.phone ? (
        <Button asChild variant="outline" className={btn}>
          <a href={`tel:${event.phone}`}>
            <Phone className="h-4 w-4" aria-hidden="true" /> Call contact
          </a>
        </Button>
      ) : (
        <Button variant="outline" className={btn} disabled>
          <Phone className="h-4 w-4" aria-hidden="true" /> No phone
        </Button>
      )}
      <Button variant="outline" className={btn} onClick={handleShare}>
        <Share2 className="h-4 w-4" aria-hidden="true" /> Share
      </Button>
      <Button variant="outline" className={btn} onClick={() => window.print()}>
        <Printer className="h-4 w-4" aria-hidden="true" /> Print BEO
      </Button>
    </div>
  );
}
