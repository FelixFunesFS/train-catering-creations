import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPhoneNumber } from "@/utils/phoneFormatter";
import { formatCustomerName, formatEventName } from "@/utils/textFormatters";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { Calendar, Utensils, PartyPopper, Cake, Heart, GraduationCap, Briefcase, Users, Gift } from "lucide-react";

interface ContactAndEventStepProps {
  form: UseFormReturn<any>;
  trackFieldInteraction: (fieldName: string) => void;
  variant?: 'regular' | 'wedding';
}

const REGULAR_EVENT_TYPES = [
  { value: "corporate", label: "Corporate Event", icon: Briefcase },
  { value: "private_party", label: "Private Party", icon: PartyPopper },
  { value: "birthday", label: "Birthday Party", icon: Cake },
  { value: "baby_shower", label: "Baby Shower", icon: Gift },
  { value: "bereavement", label: "Bereavement", icon: Heart },
  { value: "graduation", label: "Graduation", icon: GraduationCap },
  { value: "retirement", label: "Retirement Party", icon: Users },
  { value: "holiday_party", label: "Holiday Party", icon: PartyPopper },
  { value: "anniversary", label: "Anniversary", icon: Heart },
  { value: "military_function", label: "Military Function", icon: Briefcase },
  { value: "other", label: "Other", icon: Utensils },
];

const WEDDING_EVENT_TYPES = [
  { value: "wedding", label: "Wedding Reception", icon: Heart },
  { value: "black_tie", label: "Black Tie Event", icon: Users },
];

export const ContactAndEventStep = ({ form, trackFieldInteraction, variant = 'regular' }: ContactAndEventStepProps) => {
  const { ref: elementRef, isVisible, variant: animVariant } = useScrollAnimation({ variant: 'subtle' });
  const animationClass = useAnimationClass(animVariant, isVisible);
  
  const eventTypes = variant === 'wedding' ? WEDDING_EVENT_TYPES : REGULAR_EVENT_TYPES;

  return (
    <div ref={elementRef} className={animationClass}>
      <div className="grid md:grid-cols-2 gap-6">
        {/* Contact Information - Left Column */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Contact Information
            </h3>
            
            <FormField
              control={form.control}
              name="contact_name"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Full Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Smith"
                      className="h-12 text-base input-clean"
                      {...field}
                      onFocus={() => trackFieldInteraction('contact_name')}
                      onBlur={(e) => {
                        field.onChange(formatCustomerName(e.target.value));
                        field.onBlur();
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Email Address *</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      className="h-12 text-base input-clean"
                      {...field}
                      onFocus={() => trackFieldInteraction('email')}
                      onBlur={(e) => {
                        const trimmed = e.target.value.trim().toLowerCase();
                        field.onChange(trimmed);
                        field.onBlur();
                      }}
                    />
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
                  <FormLabel>Phone Number *</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="(843) 555-0123"
                      className="h-12 text-base input-clean"
                      {...field}
                      onFocus={() => trackFieldInteraction('phone')}
                      onChange={(e) => {
                        const formatted = formatPhoneNumber(e.target.value);
                        field.onChange(formatted);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Event Details - Right Column */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Event Details
            </h3>

            <FormField
              control={form.control}
              name="event_name"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Event Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Summer Company Picnic"
                      className="h-12 text-base input-clean"
                      {...field}
                      onFocus={() => trackFieldInteraction('event_name')}
                      onBlur={(e) => {
                        field.onChange(formatEventName(e.target.value));
                        field.onBlur();
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
                <FormItem className="mb-4">
                  <FormLabel>Event Type *</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                    onOpenChange={(open) => open && trackFieldInteraction('event_type')}
                  >
                    <FormControl>
                      <SelectTrigger className="h-12 text-base input-clean">
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-background border shadow-lg z-50">
                      {eventTypes.map((type) => {
                        const Icon = type.icon;
                        return (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              {type.label}
                            </div>
                          </SelectItem>
                        );
                      })}
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
                <FormItem className="mb-4">
                  <FormLabel>Number of Guests *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="50"
                      min="1"
                      className="h-12 text-base input-clean"
                      {...field}
                      onFocus={() => trackFieldInteraction('guest_count')}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || '')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="event_date"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Event Date *</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      className="h-12 text-base input-clean"
                      min={new Date().toISOString().split('T')[0]}
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
                <FormItem className="mb-4">
                  <FormLabel>Start Time *</FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      className="h-12 text-base input-clean"
                      {...field}
                      onFocus={() => trackFieldInteraction('start_time')}
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
                <FormItem className="mb-4">
                  <FormLabel>Event Location *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="123 Main Street, Charleston, SC"
                      className="h-12 text-base input-clean"
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
                  <FormLabel>Theme or Event Colors (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Navy blue and gold"
                      className="h-12 text-base input-clean"
                      {...field}
                      onFocus={() => trackFieldInteraction('theme_colors')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>

      {/* Pro Tip */}
      <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-primary">Pro Tip:</span> Having your event details ready helps us provide a more accurate quote. We'll use this information to tailor our services to your specific needs.
        </p>
      </div>
    </div>
  );
};
