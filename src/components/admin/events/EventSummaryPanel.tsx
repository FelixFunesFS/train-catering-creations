import { format, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Mail, Phone, MapPin, Calendar, Clock, Users, 
  Utensils, Leaf, MessageSquare, ExternalLink, X,
  Package, Flame, IceCream, GlassWater, DollarSign, Shield
} from 'lucide-react';
import { Database } from '@/integrations/supabase/types';
import { formatLocationLink, formatPhoneLink, formatEmailLink } from '@/utils/linkFormatters';
import { EventChecklistPanel } from './EventChecklistPanel';
import { StaffAssignmentPanel } from './StaffAssignmentPanel';
import { useCustomLineItems } from '@/hooks/useCustomLineItems';
import { isMilitaryEvent } from '@/utils/eventTypeUtils';

type QuoteRequest = Database['public']['Tables']['quote_requests']['Row'];

interface InvoiceForEvent {
  id: string;
  quote_request_id: string | null;
  workflow_status: Database['public']['Enums']['invoice_workflow_status'];
  total_amount: number;
  notes?: string | null;
}

interface EventWithInvoice extends QuoteRequest {
  invoice: InvoiceForEvent | null;
}

interface EventSummaryPanelProps {
  event: EventWithInvoice;
  onClose: () => void;
  onViewFull: () => void;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
  under_review: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
  estimated: 'bg-purple-500/10 text-purple-700 border-purple-500/20',
  quoted: 'bg-indigo-500/10 text-indigo-700 border-indigo-500/20',
  approved: 'bg-green-500/10 text-green-700 border-green-500/20',
  confirmed: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
  completed: 'bg-gray-500/10 text-gray-700 border-gray-500/20',
  cancelled: 'bg-red-500/10 text-red-700 border-red-500/20',
};

const estimateStatusColors: Record<string, string> = {
  draft: 'bg-gray-500/10 text-gray-700 border-gray-500/20',
  sent: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
  viewed: 'bg-indigo-500/10 text-indigo-700 border-indigo-500/20',
  approved: 'bg-green-500/10 text-green-700 border-green-500/20',
  paid: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
};

function formatStatus(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function formatMenuItem(item: string): string {
  return item.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function formatServiceType(type: string): string {
  return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export function EventSummaryPanel({ event, onClose, onViewFull }: EventSummaryPanelProps) {
  const { customItems, hasCustomItems } = useCustomLineItems(event.invoice?.id || null);
  
  const proteins = Array.isArray(event.proteins) ? event.proteins as string[] : [];
  const sides = Array.isArray(event.sides) ? event.sides as string[] : [];
  const appetizers = Array.isArray(event.appetizers) ? event.appetizers as string[] : [];
  const desserts = Array.isArray(event.desserts) ? event.desserts as string[] : [];
  const drinks = Array.isArray(event.drinks) ? event.drinks as string[] : [];
  const vegetarianEntrees = Array.isArray(event.vegetarian_entrees) ? event.vegetarian_entrees as string[] : [];

  const hasMenuItems = proteins.length > 0 || sides.length > 0 || appetizers.length > 0 || 
                       desserts.length > 0 || drinks.length > 0 || vegetarianEntrees.length > 0;

  // Supply & Equipment items
  const supplies = [
    { key: 'plates_requested', label: 'Plates', icon: Utensils },
    { key: 'cups_requested', label: 'Cups', icon: GlassWater },
    { key: 'napkins_requested', label: 'Napkins', icon: Package },
    { key: 'serving_utensils_requested', label: 'Serving Utensils', icon: Utensils },
    { key: 'chafers_requested', label: 'Chafers & Fuel', icon: Flame },
    { key: 'ice_requested', label: 'Ice', icon: IceCream },
  ].filter(s => event[s.key as keyof typeof event]);

  const hasSupplies = supplies.length > 0;
  const hasWaitStaff = event.wait_staff_requested;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">{event.contact_name}</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Status Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={statusColors[event.workflow_status] || ''}>
              {formatStatus(event.workflow_status)}
            </Badge>
            {event.invoice && (
              <Badge variant="outline" className={estimateStatusColors[event.invoice.workflow_status] || ''}>
                Est: {formatStatus(event.invoice.workflow_status)}
              </Badge>
            )}
          </div>

          {/* Event Name */}
          <p className="text-sm text-muted-foreground">{event.event_name}</p>
          
          {/* Military Organization Badge */}
          {isMilitaryEvent(event.event_type) && (
            <div className="flex items-center gap-2 flex-wrap mt-1">
              <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-500/20 text-xs">
                <Shield className="h-3 w-3 mr-1" />
                Military
              </Badge>
              {event.military_organization && (
                <span className="text-xs text-blue-700">{event.military_organization}</span>
              )}
            </div>
          )}

          <Separator />

          {/* Contact Info */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground uppercase">Contact</h4>
            <div className="space-y-1.5">
              <a 
                href={formatEmailLink(event.email) || '#'}
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Mail className="h-3.5 w-3.5" />
                {event.email}
              </a>
              <a 
                href={formatPhoneLink(event.phone) || '#'}
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Phone className="h-3.5 w-3.5" />
                {event.phone}
              </a>
              {event.location && (
                <a 
                  href={formatLocationLink(event.location) || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 text-sm text-primary hover:underline"
                >
                  <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span>{event.location}</span>
                </a>
              )}
            </div>
          </div>

          <Separator />

          {/* Event Details */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground uppercase">Event Details</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{format(parseISO(event.event_date), 'MMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{event.start_time?.slice(0, 5) || 'TBD'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{event.guest_count} guests</span>
              </div>
              <div className="flex items-center gap-2">
                <Utensils className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{formatServiceType(event.service_type)}</span>
              </div>
            </div>
            {event.guest_count_with_restrictions && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Leaf className="h-3.5 w-3.5" />
                <span>{event.guest_count_with_restrictions} vegetarian portions</span>
              </div>
            )}
          </div>

          {/* Menu Selections */}
          {hasMenuItems && (
            <>
              <Separator />
              <Accordion type="single" collapsible defaultValue="menu">
                <AccordionItem value="menu" className="border-none">
                  <AccordionTrigger className="py-2 text-xs font-medium text-muted-foreground uppercase hover:no-underline">
                    Menu Selections
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-1">
                      {proteins.length > 0 && (
                        <div>
                          <p className="text-xs font-medium mb-1">Proteins</p>
                          <div className="flex flex-wrap gap-1">
                            {proteins.map((p, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {formatMenuItem(p)}
                              </Badge>
                            ))}
                          </div>
                          {event.both_proteins_available && (
                            <p className="text-xs text-amber-600 mt-1">⭐ Both proteins served to all guests</p>
                          )}
                        </div>
                      )}
                      {vegetarianEntrees.length > 0 && (
                        <div>
                          <p className="text-xs font-medium mb-1 flex items-center gap-1 text-green-600">
                            <Leaf className="h-3 w-3" /> Vegetarian
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {vegetarianEntrees.map((v, i) => (
                              <Badge key={i} variant="secondary" className="text-xs bg-green-100 text-green-700 border-green-200">
                                {formatMenuItem(v)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {sides.length > 0 && (
                        <div>
                          <p className="text-xs font-medium mb-1">Sides</p>
                          <div className="flex flex-wrap gap-1">
                            {sides.map((s, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {formatMenuItem(s)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {appetizers.length > 0 && (
                        <div>
                          <p className="text-xs font-medium mb-1">Appetizers</p>
                          <div className="flex flex-wrap gap-1">
                            {appetizers.map((a, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {formatMenuItem(a)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {desserts.length > 0 && (
                        <div>
                          <p className="text-xs font-medium mb-1">Desserts</p>
                          <div className="flex flex-wrap gap-1">
                            {desserts.map((d, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {formatMenuItem(d)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {drinks.length > 0 && (
                        <div>
                          <p className="text-xs font-medium mb-1">Beverages</p>
                          <div className="flex flex-wrap gap-1">
                            {drinks.map((d, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {formatMenuItem(d)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {/* Other/Custom Items from Line Items */}
                      {hasCustomItems && (
                        <div>
                          <p className="text-xs font-medium mb-1 flex items-center gap-1 text-indigo-600">
                            <Package className="h-3 w-3" /> Other Items
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {customItems.map((item) => (
                              <Badge 
                                key={item.id} 
                                variant="secondary" 
                                className="text-xs bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700"
                              >
                                {item.title || item.description}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </>
          )}

          {/* Supply & Equipment */}
          {hasSupplies && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1">
                  <Package className="h-3 w-3" /> Supply & Equipment
                </h4>
                <div className="flex flex-wrap gap-1">
                  {supplies.map((s, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      <s.icon className="h-3 w-3 mr-1" />
                      {s.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Service Add-ons - Consolidated section for all services */}
          {(hasWaitStaff || event.bussing_tables_needed || event.ceremony_included || event.cocktail_hour) && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1">
                  <Users className="h-3 w-3" /> Service Add-ons
                </h4>
                <div className="flex flex-wrap gap-1">
                  {hasWaitStaff && (
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-700">
                      👨‍🍳 Wait Staff
                    </Badge>
                  )}
                  {event.bussing_tables_needed && (
                    <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-700">
                      🧹 Table Bussing
                    </Badge>
                  )}
                  {event.ceremony_included && (
                    <Badge variant="outline" className="text-xs bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/30 dark:text-pink-300 dark:border-pink-700">
                      💒 Ceremony Catering
                    </Badge>
                  )}
                  {event.cocktail_hour && (
                    <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-700">
                      🍸 Cocktail Hour
                    </Badge>
                  )}
                </div>
                {hasWaitStaff && event.wait_staff_requirements && (
                  <p className="text-xs text-muted-foreground">{event.wait_staff_requirements}</p>
                )}
              </div>
            </>
          )}

          {/* Special Requests - Moved above Staff Assignments */}
          {event.special_requests && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" /> Special Requests
                </h4>
                <p className="text-sm text-muted-foreground italic">{event.special_requests}</p>
              </div>
            </>
          )}

          {/* Customer Notes - from invoice.notes */}
          {event.invoice && (event.invoice as any).notes && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" /> Customer Notes
                </h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{(event.invoice as any).notes}</p>
              </div>
            </>
          )}

          {/* Operations Section Separator */}
          <Separator className="my-2" />
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Operations</p>

          {/* Staff Assignments */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground uppercase">Staff Assignments</h4>
            <StaffAssignmentPanel quoteId={event.id} compact />
          </div>

          {/* Prep Checklist Summary - with expand capability */}
          <Separator />
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground uppercase">Prep Checklist</h4>
            <EventChecklistPanel 
              quoteId={event.id} 
              eventDate={event.event_date}
              eventType={event.event_type}
              compact
              allowExpand
            />
          </div>

          {/* Invoice Total */}
          {event.invoice && (
            <>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Estimate Total</span>
                <span className="font-semibold">
                  ${(event.invoice.total_amount / 100).toLocaleString()}
                </span>
              </div>
            </>
          )}
        </div>
      </ScrollArea>

      {/* Actions */}
      <div className="p-4 border-t space-y-2">
        <Button className="w-full" onClick={onViewFull}>
          <ExternalLink className="h-4 w-4 mr-2" />
          View Full Details
        </Button>
        <a 
          href={formatEmailLink(event.email) || '#'}
          className="block"
        >
          <Button variant="outline" className="w-full">
            <Mail className="h-4 w-4 mr-2" />
            Contact Customer
          </Button>
        </a>
      </div>
    </div>
  );
}
