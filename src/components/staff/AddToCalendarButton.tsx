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
  event_type?: string;
  // Full menu
  proteins?: string[];
  sides?: string[];
  appetizers?: string[];
  desserts?: string[];
  drinks?: string[];
  vegetarian_entrees?: string[];
  dietary_restrictions?: string[];
  special_requests?: string | null;
  // Equipment
  chafers_requested?: boolean;
  plates_requested?: boolean;
  cups_requested?: boolean;
  napkins_requested?: boolean;
  serving_utensils_requested?: boolean;
  ice_requested?: boolean;
  // Services
  wait_staff_requested?: boolean;
  bussing_tables_needed?: boolean;
  cocktail_hour?: boolean;
  // Staff assignments
  staff_assignments?: Array<{
    staff_name: string;
    role: string;
    arrival_time?: string | null;
    notes?: string | null;
  }>;
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
      guestCount: event.guest_count,
      serviceType: event.service_type,
      eventType: event.event_type,
      
      // Full menu
      proteins: event.proteins,
      sides: event.sides,
      appetizers: event.appetizers,
      desserts: event.desserts,
      drinks: event.drinks,
      vegetarianOptions: event.vegetarian_entrees,
      dietaryRestrictions: event.dietary_restrictions,
      specialRequests: event.special_requests,
      
      // Equipment
      chafersRequested: event.chafers_requested,
      platesRequested: event.plates_requested,
      cupsRequested: event.cups_requested,
      napkinsRequested: event.napkins_requested,
      servingUtensilsRequested: event.serving_utensils_requested,
      iceRequested: event.ice_requested,
      
      // Services
      waitStaffRequested: event.wait_staff_requested,
      bussingTablesNeeded: event.bussing_tables_needed,
      cocktailHour: event.cocktail_hour,
      
      // Staff list (replaces single role)
      staffAssignments: event.staff_assignments?.map(s => ({
        name: s.staff_name,
        role: s.role
      })),
      
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
