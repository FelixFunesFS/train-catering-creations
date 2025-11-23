import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    const types: { [key: string]: string } = {
      "drop-off": "Drop-Off Service",
      "delivery-setup": "Delivery + Setup", 
      "full-service": "Full-Service Catering"
    };
    return types[type] || type;
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
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="contact_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Contact Name
                    </FormLabel>
                    <FormControl>
                      <Input {...field} className="neumorphic-card-1 border-0" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <Input {...field} type="email" className="neumorphic-card-1 border-0" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number
                    </FormLabel>
                    <FormControl>
                      <Input {...field} className="neumorphic-card-1 border-0" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="event_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Event Name</FormLabel>
                    <FormControl>
                      <Input {...field} className="neumorphic-card-1 border-0" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="event_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Event Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="neumorphic-card-1 border-0">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="birthday">Birthday Party</SelectItem>
                        <SelectItem value="corporate">Corporate Event</SelectItem>
                        <SelectItem value="anniversary">Anniversary</SelectItem>
                        <SelectItem value="graduation">Graduation</SelectItem>
                        <SelectItem value="baby-shower">Baby Shower</SelectItem>
                        <SelectItem value="retirement">Retirement Party</SelectItem>
                        <SelectItem value="holiday-party">Holiday Party</SelectItem>
                        <SelectItem value="memorial">Memorial Service</SelectItem>
                        <SelectItem value="other">Other Event</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="event_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Event Date
                    </FormLabel>
                    <FormControl>
                      <Input {...field} type="date" className="neumorphic-card-1 border-0" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Start Time
                    </FormLabel>
                    <FormControl>
                      <Input {...field} type="time" className="neumorphic-card-1 border-0" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="guest_count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Guest Count
                    </FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min="1" className="neumorphic-card-1 border-0" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Event Location
                    </FormLabel>
                    <FormControl>
                      <Textarea {...field} className="neumorphic-card-1 border-0 min-h-[60px]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="theme_colors"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex items-center gap-2">
                      <span className="text-lg">🎨</span>
                      Theme/Event Colors (Optional)
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Navy blue and gold" className="neumorphic-card-1 border-0" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
              <FormField
                control={form.control}
                name="service_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Service Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="neumorphic-card-1 border-0">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="drop-off">Drop-Off Service</SelectItem>
                        <SelectItem value="delivery-setup">Delivery + Setup</SelectItem>
                        <SelectItem value="full-service">Full-Service Catering</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              

              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground">Selected Menu Items</h4>
                <p className="text-xs text-muted-foreground">
                  Go back to the Menu Selection step to modify your choices.
                </p>
                
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

                {formData.proteins && formData.proteins.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Proteins:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {formData.proteins.map((protein: string) => (
                        <Badge key={protein} variant="secondary" className="text-xs">
                          {protein.replace(/-/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                    {formData.both_proteins_available && formData.proteins.length === 2 && (
                      <p className="text-xs text-muted-foreground mt-1">Both proteins served to all guests</p>
                    )}
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
              </div>
            </CardContent>
          </Card>

          {/* Additional Services */}
          <Card className="neumorphic-card-1 border-0 bg-gradient-to-br from-card via-card/95 to-muted/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl font-elegant">
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                  <UtensilsCrossed className="h-4 w-4 text-primary-foreground" />
                </div>
                Additional Services
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plates:</span>
                  <span className="font-medium">{formData.plates_requested ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cups:</span>
                  <span className="font-medium">{formData.cups_requested ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Napkins:</span>
                  <span className="font-medium">{formData.napkins_requested ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Serving Utensils:</span>
                  <span className="font-medium">{formData.serving_utensils_requested ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Chafing Dishes:</span>
                  <span className="font-medium">{formData.chafers_requested ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ice:</span>
                  <span className="font-medium">{formData.ice_requested ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {false && (
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
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                      }
                    }}
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
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                      }
                    }}
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