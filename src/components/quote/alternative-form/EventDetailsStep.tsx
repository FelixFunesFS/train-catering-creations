import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Users, MapPin, PartyPopper } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { formatEventName, formatLocation } from "@/utils/textFormatters";

interface EventDetailsStepProps {
  form: UseFormReturn<any>;
  trackFieldInteraction: (fieldName: string) => void;
}

const EVENT_TYPES = [
  { value: "birthday", label: "Birthday Party", icon: "🎂" },
  { value: "private_party", label: "Private Party", icon: "💒" },
  { value: "corporate", label: "Corporate Event", icon: "🏢" },
  { value: "anniversary", label: "Anniversary", icon: "💕" },
  { value: "graduation", label: "Graduation", icon: "🎓" },
  { value: "baby_shower", label: "Baby Shower", icon: "👶" },
  { value: "retirement", label: "Retirement Party", icon: "🎉" },
  { value: "holiday_party", label: "Holiday Party", icon: "🎄" },
  { value: "bereavement", label: "Memorial Service", icon: "🕊️" },
  { value: "other", label: "Other Event", icon: "🎊" },
];

export const EventDetailsStep = ({ form, trackFieldInteraction }: EventDetailsStepProps) => {
  const { ref, isVisible } = useScrollAnimation({
    threshold: 0.2,
    triggerOnce: true,
    delay: 100
  });

  const animationClass = useAnimationClass('fade-up', isVisible);

  return (
    <div ref={ref} className={`space-y-6 ${animationClass}`}>
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-elegant text-foreground mb-3 title-hover-motion">
          Tell Us About Your Event
        </h2>
        <p className="text-muted-foreground text-lg">
          The more we know about your celebration, the better we can serve you.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Event Basic Info */}
        <Card className="neumorphic-card-1 border-0 bg-gradient-to-br from-card via-card/95 to-muted/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl font-elegant">
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                <PartyPopper className="h-4 w-4 text-primary-foreground" />
              </div>
              Event Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="event_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">Event Name *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onFocus={() => trackFieldInteraction('event_name')}
                      onBlur={(e) => {
                        const formatted = formatEventName(e.target.value);
                        field.onChange(formatted);
                        field.onBlur();
                      }}
                      placeholder="e.g., Sarah's 30th Birthday"
                      className="h-12 text-base neumorphic-card-1 border-0 focus:ring-2 focus:ring-primary/30"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                        }
                      }}
                    />
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
                  <FormLabel className="text-base font-medium">Type of Event *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 text-base neumorphic-card-1 border-0 focus:ring-2 focus:ring-primary/30">
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {EVENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <span>{type.icon}</span>
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="guest_count"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    Number of Guests *
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      placeholder="25"
                      className="h-12 text-base neumorphic-card-1 border-0 focus:ring-2 focus:ring-primary/30"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                        }
                      }}
                      {...field}
                      onFocus={() => trackFieldInteraction('guest_count')}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Date, Time & Location */}
        <Card className="neumorphic-card-1 border-0 bg-gradient-to-br from-card via-card/95 to-muted/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl font-elegant">
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                <Calendar className="h-4 w-4 text-primary-foreground" />
              </div>
              When & Where
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="event_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    Event Date *
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      className="h-12 text-base neumorphic-card-1 border-0 focus:ring-2 focus:ring-primary/30"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                        }
                      }}
                      {...field}
                      onFocus={() => trackFieldInteraction('event_date')}
                    />
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
                  <FormLabel className="text-base font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    Start Time *
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      className="h-12 text-base neumorphic-card-1 border-0 focus:ring-2 focus:ring-primary/30"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                        }
                      }}
                      {...field}
                    />
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
                  <FormLabel className="text-base font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    Event Location *
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Address or venue name"
                      className="h-12 text-base neumorphic-card-1 border-0 focus:ring-2 focus:ring-primary/30"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                        }
                      }}
                      {...field}
                      onFocus={() => trackFieldInteraction('location')}
                    />
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
                  <FormLabel className="text-base font-medium flex items-center gap-2">
                    <span className="text-lg">🎨</span>
                    Theme/Event Colors
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Navy Blue & Gold, Pink & White"
                      className="h-12 text-base neumorphic-card-1 border-0 focus:ring-2 focus:ring-primary/30"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                        }
                      }}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      </div>

      <div className="bg-gradient-to-r from-gold/10 via-gold/5 to-gold/10 rounded-lg p-4 text-center">
        <p className="text-sm text-muted-foreground">
          <span className="text-gold font-medium">💡 Pro Tip:</span> Events with 2+ weeks notice often get better availability and pricing.
        </p>
      </div>
    </div>
  );
};