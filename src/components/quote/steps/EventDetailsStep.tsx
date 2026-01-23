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
import { formatEventName } from "@/utils/textFormatters";
import { Calendar, MapPin, Users, Utensils, PartyPopper, Cake, Heart, GraduationCap, Briefcase, Gift, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface EventDetailsStepProps {
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
  { value: "anniversary", label: "Anniversary Celebration", icon: Heart },
  { value: "military_function", label: "Military Function", icon: Briefcase },
];

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

export const EventDetailsStep = ({ form, trackFieldInteraction, variant = 'regular' }: EventDetailsStepProps) => {
  const { getFieldState, watch } = form;
  const eventTypes = variant === 'wedding' ? WEDDING_EVENT_TYPES : REGULAR_EVENT_TYPES;

  const getFieldValidation = (fieldName: string) => {
    const fieldState = getFieldState(fieldName);
    const value = watch(fieldName);
    const hasValue = value && (typeof value === 'string' ? value.trim().length > 0 : typeof value === 'number' ? value > 0 : true);
    return {
      isValid: hasValue && !fieldState.error,
      isTouched: fieldState.isTouched || hasValue,
    };
  };

  return (
    <div className="space-y-6 w-full max-w-lg mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Calendar className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-elegant font-semibold">Tell us about your event</h2>
        <p className="text-muted-foreground mt-2">Help us understand what you're planning</p>
      </div>

      <div className="grid gap-4">
        <FormField
          control={form.control}
          name="event_name"
          render={({ field }) => {
            const validation = getFieldValidation('event_name');
            return (
              <FormItem>
                <FormLabel className="flex items-center">
                  Event Name
                  <RequiredBadge show={!validation.isValid} />
                  <FieldStatus isValid={validation.isValid} isTouched={validation.isTouched} />
                </FormLabel>
                <FormControl>
                  <Input
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
              <p className="text-xs text-muted-foreground">Example: Summer Company Picnic</p>
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
                  value={field.value ?? ""}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="guest_count"
            render={({ field }) => {
              const validation = getFieldValidation('guest_count');
              return (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                    Guests
                    <RequiredBadge show={!validation.isValid} />
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
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
                  <p className="text-xs text-muted-foreground">Example: 50</p>
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
                <FormItem>
                  <FormLabel className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                    Date
                    <RequiredBadge show={!validation.isValid} />
                  </FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value ? new Date(field.value) : undefined}
                      onChange={(date) => field.onChange(date?.toISOString().split('T')[0])}
                      placeholder="Pick date"
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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_time"
            render={({ field }) => {
              const validation = getFieldValidation('start_time');
              return (
                <FormItem>
                  <FormLabel className="flex items-center">
                    Start Time
                    <RequiredBadge show={!validation.isValid} />
                  </FormLabel>
                  <FormControl>
                    <TimeSelect
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select time"
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
                <FormItem>
                  <FormLabel className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                    Location
                    <RequiredBadge show={!validation.isValid} />
                  </FormLabel>
                  <FormControl>
                    <Input
                      className={cn(
                        "h-12 text-base input-clean transition-all",
                        validation.isValid && "border-green-500/50 focus:border-green-500"
                      )}
                      {...field}
                      onFocus={() => trackFieldInteraction('location')}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">Example: Charleston, SC</p>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </div>
      </div>
    </div>
  );
};
