import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Calendar, MapPin, Users, ChefHat, UtensilsCrossed, MessageSquare } from "lucide-react";

interface ReviewSummaryCardProps {
  form: UseFormReturn<any>;
  variant?: 'regular' | 'wedding';
}

export const ReviewSummaryCard = ({ form, variant }: ReviewSummaryCardProps) => {
  const watchedValues = form.watch();

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Not set';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return 'Not set';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getServiceTypeLabel = (type: string) => {
    switch (type) {
      case 'drop-off': return 'Drop-Off Service';
      case 'delivery-setup': return 'Delivery + Setup';
      case 'full-service': return 'Full-Service Catering';
      default: return 'Not selected';
    }
  };

  const countMenuItems = () => {
    let count = 0;
    if (watchedValues.proteins?.length) count += watchedValues.proteins.length;
    if (watchedValues.appetizers?.length) count += watchedValues.appetizers.length;
    if (watchedValues.sides?.length) count += watchedValues.sides.length;
    if (watchedValues.desserts?.length) count += watchedValues.desserts.length;
    if (watchedValues.drinks?.length) count += watchedValues.drinks.length;
    return count;
  };

  return (
    <Card className="neumorphic-card-1 border-0 bg-gradient-to-br from-primary/5 via-card to-card/80">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl font-elegant">
          <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
            <UtensilsCrossed className="h-4 w-4 text-primary-foreground" />
          </div>
          Review Your Quote Request
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          {/* Contact Info */}
          <div className="border-l-4 border-primary/20 bg-muted/30 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-primary mb-3">
              <User className="h-4 w-4" />
              <span className="text-sm font-medium">Contact Information</span>
            </div>
            <div className="space-y-1 text-sm">
              <p className="text-foreground font-medium">{watchedValues.contact_name || 'Not provided'}</p>
              <p className="text-muted-foreground">{watchedValues.email || 'Not provided'}</p>
              <p className="text-muted-foreground">{watchedValues.phone || 'Not provided'}</p>
            </div>
          </div>

          {/* Event Details */}
          <div className="border-l-4 border-primary/20 bg-muted/30 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-primary mb-3">
              <Calendar className="h-4 w-4" />
              <span className="text-sm font-medium">Event Details</span>
            </div>
            <div className="space-y-1 text-sm">
              <p className="text-foreground font-medium">{watchedValues.event_name || 'Not provided'}</p>
              <p className="text-muted-foreground">{formatDate(watchedValues.event_date)}</p>
              <p className="text-muted-foreground">{formatTime(watchedValues.start_time)}</p>
            </div>
          </div>

          {/* Location & Guests */}
          <div className="border-l-4 border-primary/20 bg-muted/30 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-primary mb-3">
              <MapPin className="h-4 w-4" />
              <span className="text-sm font-medium">Location & Guests</span>
            </div>
            <div className="space-y-1 text-sm">
              <p className="text-foreground">{watchedValues.location || 'Not provided'}</p>
              <div className="flex items-center gap-2 mt-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {watchedValues.guest_count || 0} {watchedValues.guest_count === 1 ? 'guest' : 'guests'}
                </span>
              </div>
            </div>
          </div>

          {/* Service & Menu - EXPANDED */}
          <div className="md:col-span-2 border-l-4 border-primary/20 bg-muted/30 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-primary mb-3">
              <ChefHat className="h-4 w-4" />
              <span className="text-sm font-medium">Service & Menu Selections</span>
            </div>
            
            {/* Service Type */}
            <div className="mb-4">
              <p className="text-xs text-muted-foreground mb-1">Service Type</p>
              <p className="text-sm font-medium text-foreground">
                {getServiceTypeLabel(watchedValues.service_type)}
              </p>
            </div>

            {/* Menu Items */}
            {countMenuItems() > 0 ? (
              <div className="space-y-3">
                {/* Proteins */}
                {watchedValues.proteins?.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
                      <UtensilsCrossed className="h-3 w-3" /> Proteins
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {watchedValues.proteins.map((id: string, idx: number) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {id.split('-').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </Badge>
                      ))}
                    </div>
                    {watchedValues.both_proteins_available && watchedValues.proteins.length === 2 && (
                      <p className="text-xs text-muted-foreground italic mt-1">Both proteins for all guests</p>
                    )}
                  </div>
                )}

                {/* Sides */}
                {watchedValues.sides?.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">Sides</p>
                    <div className="flex flex-wrap gap-1">
                      {watchedValues.sides.map((id: string, idx: number) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Appetizers */}
                {watchedValues.appetizers?.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">Appetizers</p>
                    <div className="flex flex-wrap gap-1">
                      {watchedValues.appetizers.map((id: string, idx: number) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Desserts */}
                {watchedValues.desserts?.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">Desserts</p>
                    <div className="flex flex-wrap gap-1">
                      {watchedValues.desserts.map((id: string, idx: number) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Beverages */}
                {watchedValues.drinks?.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">Beverages</p>
                    <div className="flex flex-wrap gap-1">
                      {watchedValues.drinks.map((id: string, idx: number) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No menu items selected yet
              </p>
            )}
          </div>
        </div>

        {/* Supply Items */}
        {(watchedValues.plates_requested || watchedValues.cups_requested || watchedValues.napkins_requested || 
          watchedValues.serving_utensils_requested || watchedValues.chafers_requested || watchedValues.ice_requested) && (
          <div className="md:col-span-2 border-l-4 border-primary/20 bg-muted/30 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-primary mb-3">
              <UtensilsCrossed className="h-4 w-4" />
              <span className="text-sm font-medium">Supply Items Requested</span>
            </div>
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              {watchedValues.plates_requested && <span>✓ Disposable Plates</span>}
              {watchedValues.cups_requested && <span>✓ Disposable Cups</span>}
              {watchedValues.napkins_requested && <span>✓ Napkins</span>}
              {watchedValues.serving_utensils_requested && <span>✓ Serving Utensils</span>}
              {watchedValues.chafers_requested && <span>✓ Chafing Dishes with Fuel</span>}
              {watchedValues.ice_requested && <span>✓ Ice</span>}
            </div>
          </div>
        )}

        {/* Additional Requests */}
        {(watchedValues.guest_count_with_restrictions || watchedValues.special_requests) && (
          <div className="md:col-span-2 border-l-4 border-primary/20 bg-muted/30 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-primary mb-3">
              <MessageSquare className="h-4 w-4" />
              <span className="text-sm font-medium">Additional Requests</span>
            </div>
            <div className="space-y-2 text-sm">
              {watchedValues.guest_count_with_restrictions && (
                <p>
                  <span className="text-muted-foreground">Vegetarian Portions:</span>{' '}
                  <span className="font-medium">{watchedValues.guest_count_with_restrictions}</span>
                </p>
              )}
              {watchedValues.special_requests && (
                <p>
                  <span className="text-muted-foreground">Special Requests:</span>{' '}
                  <span className="font-medium">{watchedValues.special_requests}</span>
                </p>
              )}
            </div>
          </div>
        )}

        <div className="mt-4 p-4 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-lg text-center">
          <p className="text-sm text-muted-foreground">
            <span className="text-primary font-medium">👆 Review above</span> - Make any changes before submitting
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
