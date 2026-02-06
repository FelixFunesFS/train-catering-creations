/**
 * Desktop sidebar for Customer Portal split-view layout.
 * Contains: Action CTAs at top, Customer contact info, Event details, Terms & Conditions, Help contact.
 */

import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { 
  User, Mail, Phone, Leaf, Calendar, MapPin, Users, 
  ChevronDown, PenLine, Shield, HelpCircle, Info 
} from "lucide-react";
import { formatDate, formatTime, formatServiceType } from "@/utils/formatters";
import { formatPhoneLink, formatEmailLink, formatLocationLink } from "@/utils/linkFormatters";
import { isMilitaryEvent } from "@/utils/eventTypeUtils";
import { StandardTermsAndConditions } from "@/components/shared/StandardTermsAndConditions";
import { CustomerActions } from "./CustomerActions";

interface CustomerDetailsSidebarProps {
  quote: {
    contact_name: string;
    email: string;
    phone: string;
    event_name: string;
    event_date: string;
    start_time?: string | null;
    guest_count: number;
    service_type: string;
    location?: string | null;
    event_type: string;
    military_organization?: string | null;
    guest_count_with_restrictions?: string | null;
    wait_staff_requested?: boolean;
    bussing_tables_needed?: boolean;
    cocktail_hour?: boolean;
    special_requests?: string | null;
    compliance_level?: string | null;
  };
  // Action props for desktop CTA placement
  invoiceId?: string;
  customerEmail?: string;
  workflowStatus?: string;
  quoteRequestId?: string | null;
  amountPaid?: number;
  onStatusChange?: () => void;
  autoApprove?: boolean;
  accessToken?: string;
  invoiceNumber?: string;
  /** Hide Terms & Help sections (used for desktop to show them in center panel) */
  hideTermsAndHelp?: boolean;
}

export function CustomerDetailsSidebar({ 
  quote,
  invoiceId,
  customerEmail,
  workflowStatus,
  quoteRequestId,
  amountPaid = 0,
  onStatusChange,
  autoApprove,
  accessToken,
  invoiceNumber,
  hideTermsAndHelp = false,
}: CustomerDetailsSidebarProps) {
  const phoneLink = formatPhoneLink(quote.phone);
  const emailLink = formatEmailLink(quote.email);
  const locationLink = formatLocationLink(quote.location);
  
  const showActions = invoiceId && workflowStatus && ['sent', 'viewed'].includes(workflowStatus);

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-4">
        {/* Customer Actions - TOP of sidebar on desktop */}
        {showActions && (
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-card to-card/90 shadow-md">
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg border border-border/50">
                <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground">
                  By approving this estimate, you agree to our <strong>Terms & Conditions</strong>.
                </p>
              </div>
              <CustomerActions
                invoiceId={invoiceId}
                customerEmail={customerEmail || quote.email}
                status={workflowStatus}
                quoteRequestId={quoteRequestId}
                amountPaid={amountPaid}
                onStatusChange={onStatusChange}
                autoApprove={autoApprove}
                layout="stacked"
                accessToken={accessToken}
                invoiceNumber={invoiceNumber}
              />
            </CardContent>
          </Card>
        )}
        {/* Customer Contact Card */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card/90">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Your Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="font-medium text-foreground">{quote.contact_name}</span>
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              {emailLink ? (
                <a href={emailLink} className="text-primary hover:underline truncate">
                  {quote.email}
                </a>
              ) : (
                <span className="text-foreground truncate">{quote.email}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              {phoneLink ? (
                <a href={phoneLink} className="text-primary hover:underline">
                  {quote.phone}
                </a>
              ) : (
                <span className="text-foreground">{quote.phone}</span>
              )}
            </div>
            {quote.guest_count_with_restrictions && (
              <div className="flex items-center gap-2 pt-1">
                <Leaf className="h-3.5 w-3.5 text-green-600 shrink-0" />
                <span className="text-green-700 dark:text-green-400">
                  {quote.guest_count_with_restrictions} vegetarian portions
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Event Details Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Event Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <h3 className="font-semibold text-foreground">{quote.event_name}</h3>
              <p className="text-muted-foreground">
                {formatDate(quote.event_date)}
                {quote.start_time && ` at ${formatTime(quote.start_time)}`}
              </p>
            </div>

            <div className="flex items-start gap-2">
              <Users className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">{quote.guest_count} Guests</p>
                <p className="text-muted-foreground">
                  {formatServiceType(quote.service_type)}
                </p>
              </div>
            </div>

            {isMilitaryEvent(quote.event_type) && quote.military_organization && (
              <div className="flex items-center gap-2 pt-1 border-t border-border">
                <Shield className="h-4 w-4 text-blue-600 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Military Organization</p>
                  <p className="font-medium text-blue-700">{quote.military_organization}</p>
                </div>
              </div>
            )}

            {quote.location && (
              <div className="flex items-start gap-2 pt-2 border-t border-border">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                {locationLink ? (
                  <a 
                    href={locationLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {quote.location}
                  </a>
                ) : (
                  <p className="text-foreground">{quote.location}</p>
                )}
              </div>
            )}

            {/* Service Add-ons */}
            {(quote.wait_staff_requested || quote.bussing_tables_needed || quote.cocktail_hour) && (
              <div className="pt-2 border-t border-border">
                <span className="text-xs text-muted-foreground block mb-2">🍽️ Services:</span>
                <div className="flex flex-wrap gap-1.5">
                  {quote.wait_staff_requested && (
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                      Wait Staff
                    </Badge>
                  )}
                  {quote.bussing_tables_needed && (
                    <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                      Bussing
                    </Badge>
                  )}
                  {quote.cocktail_hour && (
                    <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                      Cocktail Hour
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {quote.special_requests && (
              <div className="pt-2 border-t border-border">
                <span className="text-xs text-muted-foreground">📝 Special Requests:</span>
                <p className="text-sm font-medium mt-1">{quote.special_requests}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Terms & Conditions Collapsible - hidden on desktop (shown in center panel) */}
        {!hideTermsAndHelp && (
          <Collapsible defaultOpen={false}>
            <Card>
              <CollapsibleTrigger className="w-full">
                <CardHeader className="flex flex-row items-center justify-between py-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <PenLine className="h-4 w-4 text-primary" />
                    Terms & Conditions
                  </CardTitle>
                  <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <StandardTermsAndConditions 
                    eventType={quote.compliance_level === 'government' ? 'government' : 'standard'} 
                    variant="compact" 
                  />
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        )}

        {/* Help Section - hidden on desktop (shown in center panel) */}
        {!hideTermsAndHelp && (
          <Card className="bg-muted/30">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <HelpCircle className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Need Help?</span>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>
                  Call:{' '}
                  <a href="tel:+18439700265" className="text-primary hover:underline">
                    (843) 970-0265
                  </a>
                </p>
                <p>
                  Email:{' '}
                  <a href="mailto:soultrainseatery@gmail.com" className="text-primary hover:underline">
                    soultrainseatery@gmail.com
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  );
}
