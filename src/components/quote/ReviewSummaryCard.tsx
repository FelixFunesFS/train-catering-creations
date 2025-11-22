import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Calendar, MapPin, Users, ChefHat, UtensilsCrossed } from "lucide-react";

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
    if (watchedValues.primary_protein?.length) count += watchedValues.primary_protein.length;
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

          {/* Service & Menu */}
          <div className="border-l-4 border-primary/20 bg-muted/30 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-primary mb-3">
              <ChefHat className="h-4 w-4" />
              <span className="text-sm font-medium">Service & Menu</span>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-foreground">{getServiceTypeLabel(watchedValues.service_type)}</p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {countMenuItems()} menu items selected
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-lg text-center">
          <p className="text-sm text-muted-foreground">
            <span className="text-primary font-medium">👆 Review above</span> - Make any changes before submitting
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
