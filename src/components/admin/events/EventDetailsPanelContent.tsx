import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, MapPin, Users, MessageSquare, 
  PartyPopper, Heart, Pencil, Utensils, Phone, ExternalLink
} from 'lucide-react';
import { formatDate, formatTime, formatServiceType, getStatusColor } from '@/utils/formatters';
import { formatLocationLink, formatPhoneLink } from '@/utils/linkFormatters';
import { ChangeHistory } from './ChangeHistory';

interface PaymentScheduleSectionProps {
  invoiceId: string | undefined;
  milestones: any[];
  isRegenerating: boolean;
  onRegenerate: () => void;
}

function PaymentScheduleSectionInner({ invoiceId, milestones, isRegenerating, onRegenerate }: PaymentScheduleSectionProps) {
  const formatMilestoneType = (type: string): string => {
    const typeMap: Record<string, string> = {
      'DEPOSIT': 'Booking Deposit',
      'MILESTONE': 'Milestone Payment',
      'BALANCE': 'Final Balance',
      'FULL': 'Full Payment',
      'FINAL': 'Final Payment',
      'COMBINED': 'Combined Payment',
    };
    return typeMap[type] || type;
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <span className="text-base">💵</span> Payment Schedule
        </h3>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onRegenerate}
          disabled={isRegenerating || !invoiceId}
        >
          <span className={`mr-1 ${isRegenerating ? 'animate-spin' : ''}`}>🔄</span>
          Regenerate
        </Button>
      </div>
      
      {milestones.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">No payment schedule generated yet. Click Regenerate.</p>
      ) : (
        <div className="space-y-2">
          {milestones.map((milestone: any) => {
            const isPaid = milestone.status === 'paid';
            const isDue = milestone.status === 'pending' && 
              milestone.due_date && new Date(milestone.due_date) <= new Date();
            return (
              <div 
                key={milestone.id} 
                className={`flex items-center justify-between p-2 rounded-md border text-sm ${
                  isPaid ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800' :
                  isDue ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800' :
                  'bg-muted/30 border-border'
                }`}
              >
                <div className="flex items-center gap-2">
                  {isPaid && <span className="text-green-600">✓</span>}
                  <span className="font-medium">{formatMilestoneType(milestone.milestone_type)}</span>
                  <span className="text-muted-foreground">({milestone.percentage}%)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{formatCurrency(milestone.amount_cents)}</span>
                  {isPaid ? (
                    <Badge variant="outline" className="text-green-600 border-green-600">Paid</Badge>
                  ) : milestone.due_date ? (
                    <span className="text-xs text-muted-foreground">
                      Due {new Date(milestone.due_date).toLocaleDateString()}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Upcoming</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

interface EventDetailsPanelContentProps {
  quote: any;
  invoice: any;
  milestones: any[];
  isRegenerating: boolean;
  onRegenerateMilestones: () => void;
  onEditCustomer: () => void;
  onEditMenu: () => void;
}

export const EventDetailsPanelContent = memo(function EventDetailsPanelContent({
  quote,
  invoice,
  milestones,
  isRegenerating,
  onRegenerateMilestones,
  onEditCustomer,
  onEditMenu,
}: EventDetailsPanelContentProps) {
  const isGovernment = quote?.compliance_level === 'government' || quote?.requires_po_number;
  
  const formatMenuItems = (items: unknown): string => {
    if (!items || !Array.isArray(items) || items.length === 0) return '';
    return items.map((item: string) => 
      item.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    ).join(', ');
  };

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Header with Status */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Event Details
        </h2>
        <Badge className={getStatusColor(quote?.workflow_status || 'pending')} variant="secondary">
          {quote?.workflow_status?.replace('_', ' ').toUpperCase()}
        </Badge>
      </div>

      {/* Customer Section */}
      <section className="space-y-1">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <Users className="h-4 w-4" /> Customer
          </h3>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onEditCustomer}>
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
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{formatDate(quote?.event_date)} {quote?.start_time && `at ${formatTime(quote?.start_time)}`}</span>
        </div>
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
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" /> {quote?.guest_count} guests
          </span>
          <span>{formatServiceType(quote?.service_type)}</span>
        </div>
      </section>

      <Separator />

      {/* Menu Section */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <Utensils className="h-4 w-4" /> Menu Selections
          </h3>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onEditMenu}>
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
              <p className="font-medium text-xs text-muted-foreground">Proteins</p>
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
      {(quote?.chafers_requested || quote?.wait_staff_requested || quote?.bussing_tables_needed) && (
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
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onEditMenu}>
                <Pencil className="h-3 w-3" />
              </Button>
            </div>
            <p className="text-sm italic text-muted-foreground">{quote.special_requests}</p>
          </section>
        </>
      )}

      {/* Payment Schedule */}
      <Separator />
      <PaymentScheduleSectionInner 
        invoiceId={invoice?.id} 
        milestones={milestones}
        isRegenerating={isRegenerating}
        onRegenerate={onRegenerateMilestones}
      />

      {/* Government Badge */}
      {isGovernment && (
        <>
          <Separator />
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-blue-700 dark:text-blue-400 font-medium text-sm">
              🏛️ Government Contract (Tax Exempt • Net 30)
            </p>
          </div>
        </>
      )}

      {/* Change History */}
      <Separator />
      <ChangeHistory quoteId={quote?.id} />
    </div>
  );
});
