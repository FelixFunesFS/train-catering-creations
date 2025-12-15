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
import { DatePicker } from "@/components/ui/date-picker";
import { TimeSelect } from "@/components/ui/time-select";
import { formatPhoneNumber } from "@/utils/phoneFormatter";
import { formatCustomerName, formatEventName } from "@/utils/textFormatters";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { Calendar, Utensils, PartyPopper, Cake, Heart, GraduationCap, Briefcase, Users, Gift, Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

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

// Helper components for validation status
const FieldStatus = ({ isValid, isTouched }: { isValid: boolean; isTouched: boolean }) => {
  if (!isTouched) return null;
  
  if (isValid) {
    return (
      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-500/20 text-green-600 ml-2">
        <Check className="h-3 w-3" />
      </span>
    );
  }
  return null;
};

const RequiredBadge = ({ show }: { show: boolean }) => {
  if (!show) return null;
  return (
    <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded ml-2">
      Required
    </span>
  );
};

export const ContactAndEventStep = ({ form, trackFieldInteraction, variant = 'regular' }: ContactAndEventStepProps) => {
  const { ref: elementRef, isVisible, variant: animVariant } = useScrollAnimation({ variant: 'subtle' });
  const animationClass = useAnimationClass(animVariant, isVisible);
  
  const eventTypes = variant === 'wedding' ? WEDDING_EVENT_TYPES : REGULAR_EVENT_TYPES;
  
  // Get form state for validation indicators
  const { formState: { touchedFields, errors }, getFieldState, watch } = form;
  
  // Contact fields validation
  const contactFields = ['contact_name', 'email', 'phone', 'event_name', 'event_type'];
  const eventFields = ['guest_count', 'event_date', 'start_time', 'location'];
  
  const getFieldValidation = (fieldName: string) => {
    const fieldState = getFieldState(fieldName);
    const value = watch(fieldName);
    const hasValue = value && (typeof value === 'string' ? value.trim().length > 0 : true);
    return {
      isValid: hasValue && !fieldState.error,
      isTouched: fieldState.isTouched || hasValue,
      hasError: !!fieldState.error
    };
  };
  
  // Count completed fields for progress
  const contactCompleted = contactFields.filter(f => getFieldValidation(f).isValid).length;
  const eventCompleted = eventFields.filter(f => getFieldValidation(f).isValid).length;

  return (
    <div ref={elementRef} className={animationClass}>
      <div className="grid md:grid-cols-2 gap-6">
        {/* Contact Information - Left Column */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Contact Information
              </h3>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                {contactCompleted}/5 complete
              </span>
            </div>
            
            <FormField
              control={form.control}
              name="contact_name"
              render={({ field }) => {
                const validation = getFieldValidation('contact_name');
                return (
                  <FormItem className="mb-3">
                    <FormLabel className="flex items-center">
                      Full Name
                      <RequiredBadge show={!validation.isValid} />
                      <FieldStatus isValid={validation.isValid} isTouched={validation.isTouched} />
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Smith"
                        className={cn(
                          "h-12 text-base input-clean transition-all",
                          validation.isValid && "border-green-500/50 focus:border-green-500"
                        )}
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
                );
              }}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => {
                const validation = getFieldValidation('email');
                return (
                  <FormItem className="mb-3">
                    <FormLabel className="flex items-center">
                      Email Address
                      <RequiredBadge show={!validation.isValid} />
                      <FieldStatus isValid={validation.isValid} isTouched={validation.isTouched} />
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        className={cn(
                          "h-12 text-base input-clean transition-all",
                          validation.isValid && "border-green-500/50 focus:border-green-500"
                        )}
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
                );
              }}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => {
                const validation = getFieldValidation('phone');
                return (
                  <FormItem className="mb-3">
                    <FormLabel className="flex items-center">
                      Phone Number
                      <RequiredBadge show={!validation.isValid} />
                      <FieldStatus isValid={validation.isValid} isTouched={validation.isTouched} />
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="(843) 555-0123"
                        className={cn(
                          "h-12 text-base input-clean transition-all",
                          validation.isValid && "border-green-500/50 focus:border-green-500"
                        )}
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
                );
              }}
            />

            <FormField
              control={form.control}
              name="event_name"
              render={({ field }) => {
                const validation = getFieldValidation('event_name');
                return (
                  <FormItem className="mb-3">
                    <FormLabel className="flex items-center">
                      Event Name
                      <RequiredBadge show={!validation.isValid} />
                      <FieldStatus isValid={validation.isValid} isTouched={validation.isTouched} />
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Summer Company Picnic"
                        className={cn(
                          "h-12 text-base input-clean transition-all",
                          validation.isValid && "border-green-500/50 focus:border-green-500"
                        )}
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
                );
              }}
            />

            <FormField
              control={form.control}
              name="event_type"
              render={({ field }) => {
                const validation = getFieldValidation('event_type');
                return (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      Event Type
                      <RequiredBadge show={!validation.isValid} />
                      <FieldStatus isValid={validation.isValid} isTouched={validation.isTouched} />
                    </FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                      onOpenChange={(open) => open && trackFieldInteraction('event_type')}
                    >
                      <FormControl>
                        <SelectTrigger className={cn(
                          "h-12 text-base input-clean transition-all",
                          validation.isValid && "border-green-500/50 focus:border-green-500"
                        )}>
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
                );
              }}
            />
          </div>
        </div>

        {/* Event Logistics - Right Column */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Event Logistics
              </h3>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                {eventCompleted}/4 complete
              </span>
            </div>

            <FormField
              control={form.control}
              name="guest_count"
              render={({ field }) => {
                const validation = getFieldValidation('guest_count');
                return (
                  <FormItem className="mb-3">
                    <FormLabel className="flex items-center">
                      Number of Guests
                      <RequiredBadge show={!validation.isValid} />
                      <FieldStatus isValid={validation.isValid} isTouched={validation.isTouched} />
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="50"
                        min="1"
                        className={cn(
                          "h-12 text-base input-clean transition-all",
                          validation.isValid && "border-green-500/50 focus:border-green-500"
                        )}
                        {...field}
                        onFocus={() => trackFieldInteraction('guest_count')}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || '')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="event_date"
              render={({ field }) => {
                const validation = getFieldValidation('event_date');
                return (
                  <FormItem className="mb-3">
                    <FormLabel className="flex items-center">
                      Event Date
                      <RequiredBadge show={!validation.isValid} />
                      <FieldStatus isValid={validation.isValid} isTouched={validation.isTouched} />
                    </FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value ? new Date(field.value) : undefined}
                        onChange={(date) => field.onChange(date?.toISOString().split('T')[0])}
                        placeholder="Pick an event date"
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        onFocus={() => trackFieldInteraction('event_date')}
                        className={cn(
                          validation.isValid && "border-green-500/50"
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="start_time"
              render={({ field }) => {
                const validation = getFieldValidation('start_time');
                return (
                  <FormItem className="mb-3">
                    <FormLabel className="flex items-center">
                      Start Time
                      <RequiredBadge show={!validation.isValid} />
                      <FieldStatus isValid={validation.isValid} isTouched={validation.isTouched} />
                    </FormLabel>
                    <FormControl>
                      <TimeSelect
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select start time"
                        interval={30}
                        onFocus={() => trackFieldInteraction('start_time')}
                        className={cn(
                          validation.isValid && "border-green-500/50"
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => {
                const validation = getFieldValidation('location');
                return (
                  <FormItem className="mb-3">
                    <FormLabel className="flex items-center">
                      Event Location
                      <RequiredBadge show={!validation.isValid} />
                      <FieldStatus isValid={validation.isValid} isTouched={validation.isTouched} />
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="123 Main Street, Charleston, SC"
                        className={cn(
                          "h-12 text-base input-clean transition-all",
                          validation.isValid && "border-green-500/50 focus:border-green-500"
                        )}
                        {...field}
                        onFocus={() => trackFieldInteraction('location')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
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

    </div>
  );
};
