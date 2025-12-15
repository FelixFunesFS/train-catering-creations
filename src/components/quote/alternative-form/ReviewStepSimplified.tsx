import { UseFormReturn } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Mail, 
  Phone, 
  User,
  UtensilsCrossed,
  Pencil,
  CheckCircle2,
  Palette
} from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";

interface ReviewStepSimplifiedProps {
  form: UseFormReturn<any>;
  estimatedCost: number | null;
  onEditSection: (stepIndex: number) => void;
}

export const ReviewStepSimplified = ({ form, estimatedCost, onEditSection }: ReviewStepSimplifiedProps) => {
  const { ref, isVisible } = useScrollAnimation({
    threshold: 0.2,
    triggerOnce: true,
    delay: 100
  });

  const animationClass = useAnimationClass('fade-up', isVisible);
  const formData = form.getValues();

  const formatEventType = (type: string) => {
    const types: { [key: string]: string } = {
      "birthday": "Birthday Party",
      "wedding": "Wedding",
      "corporate": "Corporate Event",
      "anniversary": "Anniversary",
      "graduation": "Graduation",
      "baby_shower": "Baby Shower",
      "private_party": "Private Party",
      "retirement": "Retirement Party",
      "holiday_party": "Holiday Party",
      "bereavement": "Bereavement",
      "military_function": "Military Function",
      "black_tie": "Black Tie Event",
      "other": "Other Event"
    };
    return types[type] || type;
  };

  const formatServiceType = (type: string) => {
    const types: { [key: string]: string } = {
      "delivery-only": "Delivery Only",
      "delivery-setup": "Delivery + Setup", 
      "full-service": "Full-Service Catering"
    };
    return types[type] || type;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      timeZone: 'America/New_York',
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm} ET`;
  };

  const getSelectedItems = (category: string) => {
    const items = formData[category] || [];
    return Array.isArray(items) ? items : [];
  };

  const formatMenuItem = (item: string) => {
    return item.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getSuppliesCount = () => {
    let count = 0;
    if (formData.plates_requested) count++;
    if (formData.cups_requested) count++;
    if (formData.napkins_requested) count++;
    if (formData.serving_utensils_requested) count++;
    if (formData.chafers_requested) count++;
    if (formData.ice_requested) count++;
    return count;
  };

  const hasMenuSelections = () => {
    return getSelectedItems('proteins').length > 0 ||
           getSelectedItems('sides').length > 0 ||
           getSelectedItems('appetizers').length > 0 ||
           getSelectedItems('desserts').length > 0 ||
           getSelectedItems('drinks').length > 0;
  };

  return (
    <div ref={ref} className={`space-y-6 ${animationClass}`}>
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/10 rounded-full mb-4">
          <CheckCircle2 className="h-8 w-8 text-green-500" />
        </div>
        <h2 className="text-2xl md:text-3xl font-elegant text-foreground mb-3">
          Almost Done!
        </h2>
        <p className="text-muted-foreground">
          Review your details below, then submit your request
        </p>
      </div>

      <div className="space-y-4 max-w-2xl mx-auto">
        {/* Contact Info Section */}
        <Card className="border bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Contact Info
              </h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onEditSection(0)}
                className="h-8 gap-1 text-xs"
              >
                <Pencil className="h-3 w-3" />
                Edit
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{formData.contact_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">{formData.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{formData.phone}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Event Details Section */}
        <Card className="border bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Event Details
              </h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onEditSection(1)}
                className="h-8 gap-1 text-xs"
              >
                <Pencil className="h-3 w-3" />
                Edit
              </Button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Event</span>
                <span className="font-medium">{formData.event_name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Type</span>
                <Badge variant="secondary">{formatEventType(formData.event_type)}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Date
                </span>
                <span>{formatDate(formData.event_date)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Time
                </span>
                <span>{formatTime(formData.start_time)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Users className="h-3 w-3" /> Guests
                </span>
                <span className="font-medium">{formData.guest_count} guests</span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> Location
                </span>
                <span className="text-right max-w-[200px]">{formData.location}</span>
              </div>
              {formData.theme_colors && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Palette className="h-3 w-3" /> Theme
                  </span>
                  <span>{formData.theme_colors}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Service Type Section */}
        <Card className="border bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <UtensilsCrossed className="h-4 w-4 text-primary" />
                Service Type
              </h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onEditSection(2)}
                className="h-8 gap-1 text-xs"
              >
                <Pencil className="h-3 w-3" />
                Edit
              </Button>
            </div>
            <Badge className="bg-primary/10 text-primary border-0">
              {formatServiceType(formData.service_type)}
            </Badge>
          </CardContent>
        </Card>

        {/* Menu Selections Section */}
        {hasMenuSelections() && (
          <Card className="border bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <UtensilsCrossed className="h-4 w-4 text-primary" />
                  Menu Selections
                </h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onEditSection(3)}
                  className="h-8 gap-1 text-xs"
                >
                  <Pencil className="h-3 w-3" />
                  Edit
                </Button>
              </div>
              <div className="space-y-3">
                {getSelectedItems('proteins').length > 0 && (
                  <div>
                    <span className="text-xs text-muted-foreground block mb-1">Proteins</span>
                    <div className="flex flex-wrap gap-1">
                      {getSelectedItems('proteins').map((item: string) => (
                        <Badge key={item} variant="outline" className="text-xs">
                          {formatMenuItem(item)}
                        </Badge>
                      ))}
                    </div>
                    {formData.both_proteins_available && formData.proteins?.length === 2 && (
                      <p className="text-xs text-green-600 mt-1">✓ Both proteins served to all guests</p>
                    )}
                  </div>
                )}
                
                {getSelectedItems('sides').length > 0 && (
                  <div>
                    <span className="text-xs text-muted-foreground block mb-1">Sides</span>
                    <div className="flex flex-wrap gap-1">
                      {getSelectedItems('sides').map((item: string) => (
                        <Badge key={item} variant="outline" className="text-xs">
                          {formatMenuItem(item)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {getSelectedItems('appetizers').length > 0 && (
                  <div>
                    <span className="text-xs text-muted-foreground block mb-1">Appetizers</span>
                    <div className="flex flex-wrap gap-1">
                      {getSelectedItems('appetizers').map((item: string) => (
                        <Badge key={item} variant="outline" className="text-xs">
                          {formatMenuItem(item)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {getSelectedItems('desserts').length > 0 && (
                  <div>
                    <span className="text-xs text-muted-foreground block mb-1">Desserts</span>
                    <div className="flex flex-wrap gap-1">
                      {getSelectedItems('desserts').map((item: string) => (
                        <Badge key={item} variant="outline" className="text-xs">
                          {formatMenuItem(item)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {getSelectedItems('drinks').length > 0 && (
                  <div>
                    <span className="text-xs text-muted-foreground block mb-1">Beverages</span>
                    <div className="flex flex-wrap gap-1">
                      {getSelectedItems('drinks').map((item: string) => (
                        <Badge key={item} variant="outline" className="text-xs">
                          {formatMenuItem(item)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Additional Info Section */}
        {(getSuppliesCount() > 0 || formData.special_requests) && (
          <Card className="border bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Additional Details</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onEditSection(4)}
                  className="h-8 gap-1 text-xs"
                >
                  <Pencil className="h-3 w-3" />
                  Edit
                </Button>
              </div>
              <div className="space-y-2 text-sm">
                {getSuppliesCount() > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Supplies Requested</span>
                    <span>{getSuppliesCount()} items</span>
                  </div>
                )}
                {formData.special_requests && (
                  <div>
                    <span className="text-muted-foreground block mb-1">Special Requests</span>
                    <p className="text-sm bg-muted/50 p-2 rounded">{formData.special_requests}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
