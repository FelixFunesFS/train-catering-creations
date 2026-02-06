import { format, parseISO } from 'date-fns';
import { 
  MapPin, Users, Clock, ChefHat, Utensils, CheckCircle2, 
  AlertTriangle, ChevronDown, User
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { AddToCalendarButton } from './AddToCalendarButton';
import type { StaffEvent, StaffAssignment } from '@/hooks/useStaffEvents';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { formatEventType, formatServiceType } from '@/utils/eventTypeLabels';
import { convertMenuIdToReadableText } from '@/utils/menuNLP';

interface StaffEventDetailsProps {
  event: StaffEvent;
  onBack?: () => void;
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

// Role badge colors
const roleBadgeColors: Record<string, string> = {
  'Lead Chef': 'bg-primary text-primary-foreground',
  'Chef': 'bg-orange-500 text-white',
  'Server': 'bg-blue-500 text-white',
  'Bartender': 'bg-purple-500 text-white',
  'Setup': 'bg-green-500 text-white',
  'Manager': 'bg-amber-500 text-white',
};

// Collapsible section component
function CollapsibleSection({ 
  title, 
  icon: Icon, 
  children,
  defaultOpen = false
}: { 
  title: string; 
  icon: React.ElementType; 
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button 
          variant="ghost" 
          className="w-full justify-between h-12 px-3 hover:bg-muted/50"
        >
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            <span className="font-medium">{title}</span>
          </div>
          <ChevronDown className={cn(
            "h-4 w-4 transition-transform",
            isOpen && "rotate-180"
          )} />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="px-3 pb-4">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

// Menu item list component
function MenuList({ title, items }: { title: string; items: string[] }) {
  if (!items || items.length === 0) return null;
  
  return (
    <div className="space-y-1">
      <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-sm flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
            {convertMenuIdToReadableText(item)}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Selected item display (only shows items that are true)
function SelectedItemsList({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="text-sm flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          {item}
        </li>
      ))}
    </ul>
  );
}

// Staff assignment card
function StaffAssignmentCard({ 
  assignment 
}: { 
  assignment: StaffAssignment; 
}) {
  const roleColor = roleBadgeColors[assignment.role] || 'bg-muted text-muted-foreground';
  
  return (
    <div className="flex items-center gap-3 py-3 border-b last:border-0">
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
          <User className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium truncate">{assignment.staff_name}</span>
            <Badge className={cn("text-xs shrink-0", roleColor)}>
              {assignment.role}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {assignment.arrival_time && (
              <span>Arrive: {formatTime(assignment.arrival_time)}</span>
            )}
            {assignment.confirmed ? (
              <span className="text-green-600 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Confirmed
              </span>
            ) : (
              <span className="text-amber-600 flex items-center gap-1">
                <span className="h-3 w-3 rounded-full border border-current" /> Pending
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function StaffEventDetails({ event, onBack }: StaffEventDetailsProps) {
  const countdown = getCountdownBadge(event.days_until, event.event_date);
  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(event.location)}`;

  const hasMenuItems = event.proteins.length > 0 || event.sides.length > 0 || 
    event.appetizers.length > 0 || event.desserts.length > 0 || 
    event.drinks.length > 0 || event.vegetarian_entrees.length > 0;

  const hasEquipment = event.chafers_requested || event.plates_requested || 
    event.cups_requested || event.napkins_requested || 
    event.serving_utensils_requested || event.ice_requested;

  const hasServiceDetails = event.wait_staff_requested || event.bussing_tables_needed || 
    event.cocktail_hour || event.special_requests;

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <Badge className={cn("text-xs font-semibold", countdown.className)}>
              {countdown.text}
            </Badge>
          </div>
          <CardTitle className="text-xl leading-tight">{event.event_name}</CardTitle>
          
          {/* Date and time */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground pt-1">
            <Clock className="h-4 w-4" />
            <span>
              {format(parseISO(event.event_date), 'EEEE, MMMM d, yyyy')} • {formatTime(event.start_time)}
            </span>
          </div>
          
          {/* Location */}
          <a 
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-2 text-sm text-primary hover:underline min-h-[44px] py-2"
          >
            <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{event.location}</span>
          </a>
          
          {/* Info badges */}
          <div className="flex flex-wrap gap-2 pt-1">
            <Badge variant="secondary" className="gap-1">
              <Users className="h-3 w-3" />
              {event.guest_count} guests
            </Badge>
            <Badge variant="outline">{formatServiceType(event.service_type)}</Badge>
            <Badge variant="outline">{formatEventType(event.event_type)}</Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <AddToCalendarButton event={event} variant="full" className="w-full" />
        </CardContent>
      </Card>

      {/* Collapsible Sections */}
      <Card className="overflow-hidden">
        {/* Menu Items */}
        {hasMenuItems && (
          <>
            <CollapsibleSection title="Menu Items" icon={ChefHat} defaultOpen>
              <div className="space-y-4">
                <MenuList title="Proteins" items={event.proteins} />
                <MenuList title="Sides" items={event.sides} />
                <MenuList title="Appetizers" items={event.appetizers} />
                <MenuList title="Desserts" items={event.desserts} />
                <MenuList title="Drinks" items={event.drinks} />
                <MenuList title="Vegetarian Options" items={event.vegetarian_entrees} />
                
                {event.dietary_restrictions.length > 0 && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-medium text-sm mb-2">
                      <AlertTriangle className="h-4 w-4" />
                      Dietary Restrictions
                    </div>
                    <ul className="space-y-1">
                      {event.dietary_restrictions.map((restriction, i) => (
                        <li key={i} className="text-sm text-amber-800 dark:text-amber-300">
                          • {convertMenuIdToReadableText(restriction)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CollapsibleSection>
            <Separator />
          </>
        )}

        {/* Equipment - only show selected items */}
        {hasEquipment && (
          <>
            <CollapsibleSection title="Equipment Needed" icon={Utensils}>
              <SelectedItemsList 
                items={[
                  event.chafers_requested && 'Chafers',
                  event.plates_requested && 'Plates',
                  event.cups_requested && 'Cups',
                  event.napkins_requested && 'Napkins',
                  event.serving_utensils_requested && 'Serving Utensils',
                  event.ice_requested && 'Ice',
                ].filter(Boolean) as string[]}
              />
            </CollapsibleSection>
            <Separator />
          </>
        )}

        {/* Service Details - only show selected items */}
        {hasServiceDetails && (
          <>
            <CollapsibleSection title="Service Details" icon={Users}>
              <div className="space-y-3">
                <SelectedItemsList 
                  items={[
                    event.wait_staff_requested && 'Wait Staff',
                    event.bussing_tables_needed && 'Bussing Tables',
                    event.cocktail_hour && 'Cocktail Hour',
                  ].filter(Boolean) as string[]}
                />
                
                {event.special_requests && (
                  <div className="p-3 bg-muted rounded-lg">
                    <h4 className="text-sm font-medium mb-1">Special Requests</h4>
                    <p className="text-sm text-muted-foreground">{event.special_requests}</p>
                  </div>
                )}
              </div>
            </CollapsibleSection>
            <Separator />
          </>
        )}

        {/* Staff Assignments */}
        <CollapsibleSection title={`Staff Assignments (${event.staff_assignments.length})`} icon={User} defaultOpen>
          {event.staff_assignments.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">No staff assigned yet</p>
          ) : (
            <div className="divide-y">
              {event.staff_assignments.map((assignment) => (
                <StaffAssignmentCard 
                  key={assignment.id} 
                  assignment={assignment}
                />
              ))}
            </div>
          )}
        </CollapsibleSection>
      </Card>
    </div>
  );
}
