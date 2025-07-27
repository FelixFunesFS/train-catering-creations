import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Mail, 
  Phone, 
  User,
  UtensilsCrossed,
  DollarSign,
  MessageSquare,
  Heart
} from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";

interface ReviewStepProps {
  form: UseFormReturn<any>;
  estimatedCost: number | null;
}

export const ReviewStep = ({ form, estimatedCost }: ReviewStepProps) => {
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
      "baby-shower": "Baby Shower",
      "retirement": "Retirement Party",
      "holiday-party": "Holiday Party",
      "memorial": "Memorial Service",
      "other": "Other Event"
    };
    return types[type] || type;
  };

  const formatServiceType = (type: string) => {
    return type === "drop-off" ? "Drop-Off Service" : "Full-Service Catering";
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getSelectedItems = (category: string) => {
    const items = formData[category] || [];
    return Array.isArray(items) ? items : [];
  };

  return (
    <div ref={ref} className={`space-y-6 ${animationClass}`}>
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-elegant text-foreground mb-3 title-hover-motion">
          Review Your Quote Request
        </h2>
        <p className="text-muted-foreground text-lg">
          Please review all details before submitting. You can go back to make changes if needed.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Contact & Event Info */}
        <div className="space-y-6">
          <Card className="neumorphic-card-1 border-0 bg-gradient-to-br from-card via-card/95 to-muted/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl font-elegant">
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{formData.contact_name}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{formData.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{formData.phone}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="neumorphic-card-1 border-0 bg-gradient-to-br from-card via-card/95 to-muted/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl font-elegant">
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-primary-foreground" />
                </div>
                Event Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="font-medium text-lg">{formData.event_name}</span>
                <Badge variant="outline" className="ml-2">
                  {formatEventType(formData.event_type)}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{formatDate(formData.event_date)}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{formatTime(formData.start_time)}</span>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{formData.guest_count} guests</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{formData.location}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Service & Menu */}
        <div className="space-y-6">
          <Card className="neumorphic-card-1 border-0 bg-gradient-to-br from-card via-card/95 to-muted/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl font-elegant">
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                  <UtensilsCrossed className="h-4 w-4 text-primary-foreground" />
                </div>
                Service & Menu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="font-medium">{formatServiceType(formData.service_type)}</span>
                {formData.wait_staff_requested && (
                  <Badge variant="outline" className="ml-2 bg-gold/10 text-gold">
                    + Wait Staff
                  </Badge>
                )}
              </div>

              {getSelectedItems('appetizers').length > 0 && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Appetizers:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {getSelectedItems('appetizers').map((item: string) => (
                      <Badge key={item} variant="secondary" className="text-xs">
                        {item.replace(/-/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {formData.primary_protein && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Main Protein:</span>
                  <Badge variant="secondary" className="ml-2">
                    {formData.primary_protein.replace(/-/g, ' ')}
                  </Badge>
                </div>
              )}

              {getSelectedItems('sides').length > 0 && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Sides:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {getSelectedItems('sides').map((item: string) => (
                      <Badge key={item} variant="secondary" className="text-xs">
                        {item.replace(/-/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {getSelectedItems('desserts').length > 0 && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Desserts:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {getSelectedItems('desserts').map((item: string) => (
                      <Badge key={item} variant="secondary" className="text-xs">
                        {item.replace(/-/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {getSelectedItems('drinks').length > 0 && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Beverages:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {getSelectedItems('drinks').map((item: string) => (
                      <Badge key={item} variant="secondary" className="text-xs">
                        {item.replace(/-/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {estimatedCost && (
            <Card className="neumorphic-card-1 border-0 bg-gradient-to-br from-primary/5 via-primary/3 to-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl font-elegant">
                  <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-primary-foreground" />
                  </div>
                  Estimated Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  ${estimatedCost.toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  This is a preliminary estimate. Final pricing will be provided in your detailed quote.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Final Details */}
      <Card className="neumorphic-card-1 border-0 bg-gradient-to-br from-card via-card/95 to-muted/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl font-elegant">
            <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-primary-foreground" />
            </div>
            Additional Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormField
            control={form.control}
            name="special_requests"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">
                  Special Requests or Additional Notes
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Any special requests, allergies to note, or additional information you'd like us to know..."
                    className="min-h-[100px] neumorphic-card-1 border-0 focus:ring-2 focus:ring-primary/30"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="referral_source"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">
                  How did you hear about us? (Optional)
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Google search, friend referral, social media..."
                    className="h-12 text-base neumorphic-card-1 border-0 focus:ring-2 focus:ring-primary/30"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-lg p-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Heart className="h-5 w-5 text-primary" />
          <span className="text-primary font-medium">Thank you for choosing us!</span>
        </div>
        <p className="text-sm text-muted-foreground">
          We'll review your request and get back to you within 24 hours with a detailed quote and any questions.
        </p>
      </div>
    </div>
  );
};