import { memo, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, MapPin, Users, MessageSquare, 
  PartyPopper, Heart, Pencil, Utensils, Phone, ExternalLink,
  Clock, Truck, Palette, Info, Shield, CheckCircle2, Loader2, Mail
} from 'lucide-react';
import { formatDate, formatTime, formatServiceType, formatEventType, formatReferralSource, getStatusColor } from '@/utils/formatters';
import { formatLocationLink, formatPhoneLink } from '@/utils/linkFormatters';
import { ChangeHistory } from './ChangeHistory';
import { PaymentScheduleSection } from './PaymentScheduleSection';
import { isMilitaryEvent } from '@/utils/eventTypeUtils';
import { parseDateFromLocalString } from '@/utils/dateHelpers';

interface EventDetailsPanelContentProps {
  quote: any;
  invoice: any;
  milestones: any[];
  totalAmount: number;
  isGovernment: boolean;
  isRegenerating: boolean;
  onRegenerateMilestones: () => void;
  onToggleGovernment: (checked: boolean) => void;
  onEditCustomer: () => void;
  onEditMenu: () => void;
  onMarkCompleted?: () => void;
  isMarkingComplete?: boolean;
  onSendThankYou?: () => void;
  isSendingThankYou?: boolean;
}

export const EventDetailsPanelContent = memo(function EventDetailsPanelContent({
  quote,
  invoice,
  milestones,
  totalAmount,
  isGovernment,
  isRegenerating,
  onRegenerateMilestones,
  onToggleGovernment,
  onEditCustomer,
  onEditMenu,
  onMarkCompleted,
  isMarkingComplete,
  onSendThankYou,
  isSendingThankYou,
}: EventDetailsPanelContentProps) {
  const formatMenuItems = (items: unknown): string => {
    if (!items || !Array.isArray(items) || items.length === 0) return '';
    return items.map((item: string) => 
      item.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    ).join(', ');
  };

  // Check if already completed
  const isCompleted = quote?.workflow_status === 'completed';

  // Date check - only allow marking complete on or after event day
  // Use parseDateFromLocalString to avoid off-by-one day bug
  const isEventDayOrLater = useMemo(() => {
    if (!quote?.event_date) return false;
    const eventDate = parseDateFromLocalString(quote.event_date);
    eventDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today >= eventDate;
  }, [quote?.event_date]);

  // Determine if "Mark Completed" button should show
  const canMarkComplete = quote?.workflow_status && 
    ['confirmed', 'paid', 'approved', 'awaiting_payment'].includes(quote.workflow_status) &&
    isEventDayOrLater &&
    !isCompleted;

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Header with Status */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Event Details
        </h2>
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(quote?.workflow_status || 'pending')} variant="secondary">
            {(['awaiting_payment', 'paid', 'partially_paid', 'payment_pending'].includes(quote?.workflow_status) ? 'CONFIRMED' : quote?.workflow_status?.replace('_', ' ').toUpperCase())}
          </Badge>
          {isCompleted ? (
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Completed
              </Badge>
              {onSendThankYou && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onSendThankYou}
                  disabled={isSendingThankYou}
                  className="gap-1.5"
                >
                  {isSendingThankYou ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Mail className="h-4 w-4" />
                  )}
                  Send Thank You
                </Button>
              )}
            </div>
          ) : canMarkComplete && onMarkCompleted ? (
            <Button 
              size="sm" 
              variant="default" 
              onClick={onMarkCompleted}
              disabled={isMarkingComplete}
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isMarkingComplete ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Mark Complete
            </Button>
          ) : null}
        </div>
      </div>

      {/* Customer Section */}
      <section className="space-y-1">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <Users className="h-4 w-4" /> Customer
          </h3>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onEditCustomer} aria-label="Edit customer details">
            <Pencil className="h-3 w-3" />
          </Button>
        </div>
        <p className="font-medium">{quote?.contact_name}</p>
        <p className="text-sm text-muted-foreground">{quote?.email}</p>
        {quote?.phone && (
          <a 
            href={formatPhoneLink(quote.phone) || '#'} 
            className="text-sm text-primary hover:underline flex items-center gap-1"
            aria-label="Call customer"
          >
            <Phone className="h-3 w-3" />
            {quote.phone}
          </a>
        )}
      </section>

      <Separator />

      {/* Event Section */}
      <section className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
          <PartyPopper className="h-4 w-4" /> Event
        </h3>
        <p className="font-medium">{quote?.event_name}</p>
        
        {/* Event Type */}
        {quote?.event_type && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <PartyPopper className="h-3 w-3" />
            <span>{formatEventType(quote.event_type)}</span>
          </div>
        )}
        
        {/* Military Organization Badge */}
        {isMilitaryEvent(quote?.event_type) && (
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className="bg-blue-500/10 text-blue-700 border-blue-500/20">
              <Shield className="h-3 w-3 mr-1" />
              Military Function
            </Badge>
            {quote?.military_organization && (
              <span className="text-sm text-blue-700">{quote.military_organization}</span>
            )}
          </div>
        )}
        
        {/* Date & Time */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{formatDate(quote?.event_date)} {quote?.start_time && `at ${formatTime(quote?.start_time)}`}</span>
        </div>
        
        {/* Serving Start Time (if different from event start) */}
        {quote?.serving_start_time && quote.serving_start_time !== quote.start_time && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Serving begins at {formatTime(quote.serving_start_time)}</span>
          </div>
        )}
        
        {/* Location */}
        {quote?.location && (
          <a 
            href={formatLocationLink(quote.location) || '#'} 
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            <MapPin className="h-3 w-3" />
            {quote.location}
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
        
        {/* Guest Count & Service Type */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" /> {quote?.guest_count} guests
          </span>
          <span className="flex items-center gap-1">
            <Truck className="h-3 w-3" /> {formatServiceType(quote?.service_type)}
          </span>
        </div>
        
        {/* Theme/Colors (for weddings) */}
        {quote?.theme_colors && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Palette className="h-3 w-3" />
            <span>Theme: {quote.theme_colors}</span>
          </div>
        )}
      </section>

      <Separator />

      {/* Menu Section */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <Utensils className="h-4 w-4" /> Menu Selections
          </h3>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onEditMenu} aria-label="Edit menu selections">
            <Pencil className="h-3 w-3" />
          </Button>
        </div>

        <div className="space-y-2 text-sm">
          {/* Appetizers */}
          {quote?.appetizers && Array.isArray(quote.appetizers) && quote.appetizers.length > 0 && (
            <div className="space-y-1">
              <p className="font-medium text-xs text-muted-foreground">Appetizers</p>
              <p>{formatMenuItems(quote.appetizers)}</p>
            </div>
          )}
          {/* Proteins */}
          {quote?.proteins && Array.isArray(quote.proteins) && quote.proteins.length > 0 && (
            <div className="space-y-1">
              <p className="font-medium text-xs text-muted-foreground">
                Proteins {quote.both_proteins_available && <span className="text-primary">(Both Available)</span>}
              </p>
              <p>{formatMenuItems(quote.proteins)}</p>
            </div>
          )}
          {/* Vegetarian Entrées */}
          {quote?.vegetarian_entrees && Array.isArray(quote.vegetarian_entrees) && quote.vegetarian_entrees.length > 0 && (
            <div className="space-y-1">
              <p className="font-medium text-xs text-muted-foreground">
                Vegetarian Entrées{quote.guest_count_with_restrictions && ` (${quote.guest_count_with_restrictions} guests)`}
              </p>
              <p>{formatMenuItems(quote.vegetarian_entrees)}</p>
            </div>
          )}
          {/* Sides */}
          {quote?.sides && Array.isArray(quote.sides) && quote.sides.length > 0 && (
            <div className="space-y-1">
              <p className="font-medium text-xs text-muted-foreground">Sides</p>
              <p>{formatMenuItems(quote.sides)}</p>
            </div>
          )}
          {/* Desserts */}
          {quote?.desserts && Array.isArray(quote.desserts) && quote.desserts.length > 0 && (
            <div className="space-y-1">
              <p className="font-medium text-xs text-muted-foreground">Desserts</p>
              <p>{formatMenuItems(quote.desserts)}</p>
            </div>
          )}
          {/* Drinks */}
          {quote?.drinks && Array.isArray(quote.drinks) && quote.drinks.length > 0 && (
            <div className="space-y-1">
              <p className="font-medium text-xs text-muted-foreground">Drinks</p>
              <p>{formatMenuItems(quote.drinks)}</p>
            </div>
          )}
        </div>
      </section>

      {/* Supplies & Equipment */}
      {(quote?.plates_requested || quote?.cups_requested || quote?.napkins_requested || 
        quote?.serving_utensils_requested || quote?.ice_requested) && (
        <>
          <Separator />
          <section className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Supplies & Equipment
            </h3>
            <ul className="text-sm space-y-1">
              {quote?.plates_requested && <li>• Plates</li>}
              {quote?.cups_requested && <li>• Cups</li>}
              {quote?.napkins_requested && <li>• Napkins</li>}
              {quote?.serving_utensils_requested && <li>• Serving Utensils</li>}
              {quote?.ice_requested && <li>• Ice</li>}
            </ul>
          </section>
        </>
      )}

      {/* Service Add-ons */}
      {(quote?.chafers_requested || quote?.wait_staff_requested || quote?.bussing_tables_needed ||
        quote?.ceremony_included || quote?.cocktail_hour) && (
        <>
          <Separator />
          <section className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Heart className="h-4 w-4" /> Service Add-ons
            </h3>
            <ul className="text-sm space-y-1">
              {quote?.chafers_requested && <li>• Chafer Setup</li>}
              {quote?.wait_staff_requested && <li>• Wait Staff</li>}
              {quote?.bussing_tables_needed && <li>• Bussing Tables</li>}
              {quote?.ceremony_included && <li>• Ceremony Catering</li>}
              {quote?.cocktail_hour && <li>• Cocktail Hour</li>}
            </ul>
          </section>
        </>
      )}

      {/* Special Requests */}
      {quote?.special_requests && (
        <>
          <Separator />
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <MessageSquare className="h-4 w-4" /> Special Requests
              </h3>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onEditMenu} aria-label="Edit special requests">
                <Pencil className="h-3 w-3" />
              </Button>
            </div>
            <p className="text-sm italic text-muted-foreground">{quote.special_requests}</p>
          </section>
        </>
      )}

      {/* Payment Schedule */}
      <Separator />
      <PaymentScheduleSection 
        invoiceId={invoice?.id} 
        milestones={milestones}
        totalAmount={totalAmount}
        isGovernment={isGovernment}
        isRegenerating={isRegenerating}
        onRegenerate={onRegenerateMilestones}
        onToggleGovernment={onToggleGovernment}
      />

      {/* Referral Source (Business Intelligence) */}
      {quote?.referral_source && (
        <>
          <Separator />
          <section className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <Info className="h-4 w-4" /> How They Found Us
            </h3>
            <p className="text-sm">{formatReferralSource(quote.referral_source)}</p>
          </section>
        </>
      )}

      {/* Change History */}
      <Separator />
      <ChangeHistory quoteId={quote?.id} />
    </div>
  );
});
