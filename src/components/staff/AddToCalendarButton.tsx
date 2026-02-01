import { CalendarPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { downloadStaffICSFile, type StaffCalendarEventData } from '@/utils/calendarExport';
import { toast } from 'sonner';

interface StaffEvent {
  event_name: string;
  event_date: string;
  start_time?: string;
  location?: string;
  guest_count?: number;
  service_type?: string;
  proteins?: string[];
  sides?: string[];
}

interface StaffAssignment {
  arrival_time?: string | null;
  role?: string;
  notes?: string | null;
}

interface AddToCalendarButtonProps {
  event: StaffEvent;
  staffAssignment?: StaffAssignment;
  variant?: 'icon' | 'button' | 'full';
  className?: string;
}

export function AddToCalendarButton({ 
  event, 
  staffAssignment, 
  variant = 'button',
  className 
}: AddToCalendarButtonProps) {
  const handleClick = () => {
    const calendarData: StaffCalendarEventData = {
      eventName: event.event_name,
      eventDate: event.event_date,
      eventStartTime: event.start_time,
      staffArrivalTime: staffAssignment?.arrival_time || event.start_time,
      location: event.location,
      staffRole: staffAssignment?.role,
      guestCount: event.guest_count,
      serviceType: event.service_type,
      menuHighlights: [
        ...(event.proteins || []),
        ...(event.sides?.slice(0, 3) || [])
      ],
      notes: staffAssignment?.notes || undefined
    };

    downloadStaffICSFile(calendarData);
    toast.success('Calendar event downloaded');
  };

  if (variant === 'icon') {
    return (
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={handleClick}
        className={`h-11 w-11 min-w-[44px] min-h-[44px] ${className || ''}`}
        aria-label="Add to calendar"
      >
        <CalendarPlus className="h-5 w-5" />
      </Button>
    );
  }

  if (variant === 'full') {
    return (
      <Button 
        variant="outline" 
        onClick={handleClick}
        className={`h-11 min-w-[44px] gap-2 ${className || ''}`}
      >
        <CalendarPlus className="h-4 w-4" />
        <span>Add to My Calendar</span>
      </Button>
    );
  }

  // Default 'button' variant
  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleClick}
      className={`h-11 min-w-[44px] gap-2 ${className || ''}`}
    >
      <CalendarPlus className="h-4 w-4" />
      <span>Add to Calendar</span>
    </Button>
  );
}
