/**
 * Desktop sidebar for Quote Form split-view layout.
 * Shows a live preview of entered form data + trust badges.
 */

import { UseFormReturn } from "react-hook-form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, Calendar, MapPin, Users, ChefHat, UtensilsCrossed,
  Phone, Mail, Shield, Clock, Star, Award, CheckCircle2
} from "lucide-react";

interface QuotePreviewSidebarProps {
  form: UseFormReturn<any>;
  variant?: 'regular' | 'wedding';
}

export function QuotePreviewSidebar({ form, variant }: QuotePreviewSidebarProps) {
  const values = form.watch();

  const formatDate = (dateStr: string) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        year: 'numeric',
        timeZone: 'America/New_York',
      });
    } catch {
      return null;
    }
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return null;
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getServiceTypeLabel = (type: string) => {
    switch (type) {
      case 'delivery-only': return 'Delivery Only';
      case 'delivery-setup': return 'Delivery + Setup';
      case 'full-service': return 'Full-Service';
      default: return null;
    }
  };

  const countMenuItems = () => {
    let count = 0;
    if (values.proteins?.length) count += values.proteins.length;
    if (values.appetizers?.length) count += values.appetizers.length;
    if (values.sides?.length) count += values.sides.length;
    if (values.desserts?.length) count += values.desserts.length;
    if (values.drinks?.length) count += values.drinks.length;
    return count;
  };

  const hasContactInfo = values.contact_name || values.email || values.phone;
  const hasEventInfo = values.event_name || values.event_date || values.location;
  const hasServiceInfo = values.service_type;
  const menuItemCount = countMenuItems();

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="text-center pb-2">
          <h3 className="text-lg font-elegant font-semibold text-foreground">Your Quote Summary</h3>
          <p className="text-sm text-muted-foreground">Preview as you build</p>
        </div>

        {/* Contact Info Preview */}
        <Card className={hasContactInfo ? "border-primary/30" : "border-dashed border-muted-foreground/30"}>
          <CardHeader className="py-3 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Contact Info
              {hasContactInfo && <CheckCircle2 className="h-3.5 w-3.5 text-green-500 ml-auto" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2 text-sm">
            {hasContactInfo ? (
              <div className="space-y-1">
                {values.contact_name && (
                  <p className="font-medium text-foreground truncate">{values.contact_name}</p>
                )}
                {values.email && (
                  <p className="text-muted-foreground truncate">{values.email}</p>
                )}
                {values.phone && (
                  <p className="text-muted-foreground">{values.phone}</p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground italic">Not yet provided</p>
            )}
          </CardContent>
        </Card>

        {/* Event Details Preview */}
        <Card className={hasEventInfo ? "border-primary/30" : "border-dashed border-muted-foreground/30"}>
          <CardHeader className="py-3 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Event Details
              {hasEventInfo && <CheckCircle2 className="h-3.5 w-3.5 text-green-500 ml-auto" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2 text-sm">
            {hasEventInfo ? (
              <div className="space-y-2">
                {values.event_name && (
                  <p className="font-medium text-foreground">{values.event_name}</p>
                )}
                {values.event_date && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formatDate(values.event_date)}</span>
                  </div>
                )}
                {values.start_time && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{formatTime(values.start_time)}</span>
                  </div>
                )}
                {values.guest_count > 0 && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    <span>{values.guest_count} guests</span>
                  </div>
                )}
                {values.location && (
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    <span className="line-clamp-2">{values.location}</span>
                  </div>
                )}
                {values.event_type === 'military_function' && values.military_organization && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <Shield className="h-3.5 w-3.5" />
                    <span className="text-sm">{values.military_organization}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground italic">Not yet provided</p>
            )}
          </CardContent>
        </Card>

        {/* Service & Menu Preview */}
        <Card className={hasServiceInfo || menuItemCount > 0 ? "border-primary/30" : "border-dashed border-muted-foreground/30"}>
          <CardHeader className="py-3 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <ChefHat className="h-4 w-4 text-primary" />
              Service & Menu
              {(hasServiceInfo || menuItemCount > 0) && <CheckCircle2 className="h-3.5 w-3.5 text-green-500 ml-auto" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2 text-sm">
            {hasServiceInfo || menuItemCount > 0 ? (
              <div className="space-y-2">
                {values.service_type && (
                  <Badge variant="secondary" className="text-xs">
                    {getServiceTypeLabel(values.service_type)}
                  </Badge>
                )}
                {menuItemCount > 0 && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <UtensilsCrossed className="h-3.5 w-3.5" />
                    <span>{menuItemCount} menu items selected</span>
                  </div>
                )}
                {values.vegetarian_entrees?.length > 0 && (
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                    🌱 {values.vegetarian_entrees.length} vegetarian option(s)
                  </Badge>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground italic">Not yet selected</p>
            )}
          </CardContent>
        </Card>

        <Separator className="my-4" />

        {/* Trust Badges */}
        <div className="space-y-3">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Why Choose Us
          </h4>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                <Award className="h-4 w-4 text-primary" />
              </div>
              <span className="text-foreground">20+ Years of Excellence</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                <Star className="h-4 w-4 text-primary" />
              </div>
              <span className="text-foreground">Charleston's Trusted Caterer</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <span className="text-foreground">Family-Owned & Operated</span>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Contact Info */}
        <div className="text-center text-sm text-muted-foreground space-y-1">
          <p className="font-medium text-foreground">Questions?</p>
          <p>
            <a href="tel:+18439700265" className="text-primary hover:underline">
              (843) 970-0265
            </a>
          </p>
          <p>
            <a href="mailto:soultrainseatery@gmail.com" className="text-primary hover:underline text-xs">
              soultrainseatery@gmail.com
            </a>
          </p>
        </div>
      </div>
    </ScrollArea>
  );
}
