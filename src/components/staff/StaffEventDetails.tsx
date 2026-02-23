import { format } from 'date-fns';
import { parseDateFromLocalString } from '@/utils/dateHelpers';
import { 
  MapPin, Users, Clock, ChefHat, Utensils, CheckCircle2, 
  AlertTriangle, ChevronDown, User, Phone, Shield, Palette,
  MessageSquare, StickyNote, Package
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import type { StaffEvent, StaffAssignment, StaffLineItem, StaffAdminNote } from '@/hooks/useStaffEvents';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { formatEventType, formatServiceType } from '@/utils/eventTypeLabels';
import { convertMenuIdToReadableText } from '@/utils/menuNLP';
import { isMilitaryEvent } from '@/utils/eventTypeUtils';

interface StaffEventDetailsProps {
  event: StaffEvent;
  onBack?: () => void;
}

// Confirmation status badge
function getConfirmationBadge(status: string): { text: string; className: string } {
  if (['confirmed', 'awaiting_payment', 'paid'].includes(status)) {
    return { text: 'Confirmed', className: 'bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30' };
  }
  if (status === 'approved') {
    return { text: 'Approved', className: 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30' };
  }
  return { text: 'Tentative', className: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30' };
}

// Countdown badge logic
function getCountdownBadge(daysUntil: number, eventDate: string): { text: string; className: string } {
  if (daysUntil < 0) return { text: 'PAST', className: 'bg-muted text-muted-foreground' };
  if (daysUntil === 0) return { text: 'TODAY', className: 'bg-destructive text-destructive-foreground' };
  if (daysUntil === 1) return { text: 'TOMORROW', className: 'bg-amber-500 text-white' };
  if (daysUntil <= 7) return { text: `IN ${daysUntil} DAYS`, className: 'bg-blue-500 text-white' };
  return { text: format(parseDateFromLocalString(eventDate), 'MMM d'), className: 'bg-muted text-muted-foreground' };
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

// Collapsible section component - defaults to open
function CollapsibleSection({ 
  title, 
  icon: Icon, 
  children,
  defaultOpen = true
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
function StaffAssignmentCard({ assignment }: { assignment: StaffAssignment }) {
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

// Line items grouped by category
function LineItemsByCategory({ lineItems }: { lineItems: StaffLineItem[] }) {
  const grouped = lineItems.reduce((acc, item) => {
    const cat = item.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, StaffLineItem[]>);

  const categoryLabels: Record<string, string> = {
    package: 'Catering Package',
    meal_bundle: 'Meal Bundle',
    appetizers: 'Appetizers',
    appetizer: 'Appetizers',
    appetizer_dietary: 'Dietary Appetizers',
    sides: 'Additional Sides',
    side: 'Additional Sides',
    desserts: 'Desserts',
    dessert: 'Desserts',
    dietary: 'Dietary Accommodations',
    service: 'Services',
    service_addon: 'Service Add-ons',
    supplies: 'Supplies & Equipment',
    other: 'Other Items',
  };

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="space-y-1">
          <h4 className="text-sm font-medium text-muted-foreground">
            {categoryLabels[category] || category.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </h4>
          <ul className="space-y-1">
            {items.map(item => (
              <li key={item.id} className="text-sm flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-2" />
                <div>
                  <span className="font-medium">{item.title}</span>
                  {item.quantity > 1 && (
                    <span className="text-muted-foreground ml-1">×{item.quantity}</span>
                  )}
                  {item.description && (
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

// Admin notes display
function AdminNotesBlock({ notes }: { notes: StaffAdminNote[] }) {
  if (notes.length === 0) return null;

  const priorityColors: Record<string, string> = {
    high: 'bg-destructive/10 text-destructive border-destructive/20',
    medium: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
    low: 'bg-muted text-muted-foreground',
  };

  return (
    <div className="space-y-2">
      {notes.map(note => (
        <div key={note.id} className="p-3 bg-muted/50 rounded-lg border">
          <div className="flex items-center gap-2 mb-1">
            {note.category && (
              <Badge variant="outline" className="text-xs">
                {note.category}
              </Badge>
            )}
            {note.priority_level && (
              <Badge variant="outline" className={cn("text-xs", priorityColors[note.priority_level] || '')}>
                {note.priority_level}
              </Badge>
            )}
          </div>
          <p className="text-sm">{note.note_content}</p>
        </div>
      ))}
    </div>
  );
}

export function StaffEventDetails({ event, onBack }: StaffEventDetailsProps) {
  const countdown = getCountdownBadge(event.days_until, event.event_date);
  const confirmation = getConfirmationBadge(event.workflow_status);
  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(event.location)}`;

  const hasLineItems = event.line_items.length > 0;

  // Fallback: raw menu data if no line items
  const hasMenuItems = event.proteins.length > 0 || event.sides.length > 0 || 
    event.appetizers.length > 0 || event.desserts.length > 0 || 
    event.drinks.length > 0 || event.vegetarian_entrees.length > 0;

  const hasEquipment = event.chafers_requested || event.plates_requested || 
    event.cups_requested || event.napkins_requested || 
    event.serving_utensils_requested || event.ice_requested;

  const hasServiceDetails = event.wait_staff_requested || event.bussing_tables_needed || 
    event.cocktail_hour || event.special_requests ||
    event.serving_setup_area || event.separate_serving_area ||
    event.wait_staff_requirements || event.wait_staff_setup_areas;

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <Badge className={cn("text-xs font-semibold", countdown.className)}>
              {countdown.text}
            </Badge>
            <Badge variant="outline" className={cn("text-xs font-medium", confirmation.className)}>
              {confirmation.text}
            </Badge>
          </div>
          <CardTitle className="text-xl leading-tight">{event.event_name}</CardTitle>
          
          {/* Date and time */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground pt-1">
            <Clock className="h-4 w-4" />
            <span>
              {format(parseDateFromLocalString(event.event_date), 'EEEE, MMMM d, yyyy')} • {formatTime(event.start_time)}
            </span>
          </div>

          {/* Serving time if different */}
          {event.serving_start_time && event.serving_start_time !== event.start_time && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Serving begins at {formatTime(event.serving_start_time)}</span>
            </div>
          )}
          
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

          {/* Contact info */}
          {(event.contact_name || event.phone) && (
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border mt-2">
              {event.contact_name && (
                <span className="text-sm font-medium">{event.contact_name}</span>
              )}
              {event.phone && (
                <a 
                  href={`tel:${event.phone}`}
                  className="flex items-center gap-1 text-sm text-primary hover:underline min-h-[44px] py-2"
                >
                  <Phone className="h-4 w-4" />
                  {event.phone}
                </a>
              )}
            </div>
          )}

          {/* Military badge */}
          {isMilitaryEvent(event.event_type) && (
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-500/20">
                <Shield className="h-3 w-3 mr-1" />
                Military
              </Badge>
              {event.military_organization && (
                <span className="text-sm text-blue-700">{event.military_organization}</span>
              )}
            </div>
          )}

          {/* Theme/colors */}
          {event.theme_colors && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Palette className="h-4 w-4" />
              <span>Theme: {event.theme_colors}</span>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Collapsible Sections */}
      <Card className="overflow-hidden">
        {/* Event Requirements (from line items, or raw menu fallback) */}
        {(hasLineItems || hasMenuItems) && (
          <>
            <CollapsibleSection title="Event Requirements" icon={ChefHat} defaultOpen>
              {hasLineItems ? (
                <div className="space-y-4">
                  <LineItemsByCategory lineItems={event.line_items} />
                  
                  {/* Dietary restrictions alert */}
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

                  {event.guest_count_with_restrictions && Number(event.guest_count_with_restrictions) > 0 && (
                    <p className="text-sm text-green-700 dark:text-green-400">
                      🌿 {event.guest_count_with_restrictions} guests with dietary restrictions
                    </p>
                  )}

                  {event.both_proteins_available && (
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      ⭐ Both proteins served to all guests
                    </p>
                  )}
                </div>
              ) : (
                /* Fallback: raw menu arrays */
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

                  {event.guest_count_with_restrictions && Number(event.guest_count_with_restrictions) > 0 && (
                    <p className="text-sm text-green-700 dark:text-green-400">
                      🌿 {event.guest_count_with_restrictions} guests with dietary restrictions
                    </p>
                  )}

                  {event.both_proteins_available && (
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      ⭐ Both proteins served to all guests
                    </p>
                  )}

                  {/* Equipment in fallback mode */}
                  {hasEquipment && (
                    <div className="pt-2 border-t">
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Equipment</h4>
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
                    </div>
                  )}
                </div>
              )}
            </CollapsibleSection>
            <Separator />
          </>
        )}

        {/* Service Details */}
        {hasServiceDetails && (
          <>
            <CollapsibleSection title="Service Details" icon={Package} defaultOpen>
              <div className="space-y-3">
                <SelectedItemsList 
                  items={[
                    event.wait_staff_requested && 'Wait Staff',
                    event.bussing_tables_needed && 'Bussing Tables',
                    event.cocktail_hour && 'Cocktail Hour',
                  ].filter(Boolean) as string[]}
                />

                {event.serving_setup_area && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>Setup Area: {event.serving_setup_area}</span>
                  </div>
                )}

                {event.separate_serving_area && (
                  <div className="text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-500 inline mr-1" />
                    Separate Serving Area
                  </div>
                )}

                {event.wait_staff_requirements && (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <h4 className="text-sm font-medium mb-1">Wait Staff Requirements</h4>
                    <p className="text-sm text-muted-foreground">{event.wait_staff_requirements}</p>
                  </div>
                )}

                {event.wait_staff_setup_areas && (
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">Wait Staff Setup:</span> {event.wait_staff_setup_areas}
                  </div>
                )}
                
                {event.special_requests && (
                  <div className="p-3 bg-muted rounded-lg">
                    <h4 className="text-sm font-medium mb-1">Special Requests</h4>
                    <p className="text-sm text-muted-foreground">{event.special_requests}</p>
                  </div>
                )}

                {/* Admin Notes */}
                {event.admin_notes.length > 0 && (
                  <div className="pt-2 border-t">
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                      <StickyNote className="h-4 w-4" />
                      Admin Notes
                    </h4>
                    <AdminNotesBlock notes={event.admin_notes} />
                  </div>
                )}
              </div>
            </CollapsibleSection>
            <Separator />
          </>
        )}

        {/* Admin Notes standalone (if no service details section) */}
        {!hasServiceDetails && event.admin_notes.length > 0 && (
          <>
            <CollapsibleSection title="Admin Notes" icon={StickyNote} defaultOpen>
              <AdminNotesBlock notes={event.admin_notes} />
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