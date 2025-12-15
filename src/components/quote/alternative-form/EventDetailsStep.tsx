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
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { Calendar, MapPin, Users, Clock, PartyPopper, Check, Briefcase, Cake, Heart, GraduationCap, Gift } from "lucide-react";
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
  { value: "other", label: "Other", icon: PartyPopper },
];

const WEDDING_EVENT_TYPES = [
  { value: "wedding", label: "Wedding Reception", icon: Heart },
  { value: "black_tie", label: "Black Tie Event", icon: Users },
];

const FieldStatus = ({ isValid, isTouched }: { isValid: boolean; isTouched: boolean }) => {
  if (!isTouched) return null;
  if (isValid) {
    return (
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <Check className="h-4 w-4 text-green-500" />
      </div>
    );
  }
  return null;
};

const RequiredBadge = ({ show }: { show: boolean }) => {
  if (!show) return null;
  return (
    <span className="ml-2 text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
      Required
    </span>
  );
};

export const EventDetailsStep = ({ form, trackFieldInteraction, variant = 'regular' }: EventDetailsStepProps) => {
  const { ref: elementRef, isVisible, variant: animVariant } = useScrollAnimation({ variant: 'subtle' });
  const animationClass = useAnimationClass(animVariant, isVisible);
  
  const eventTypes = variant === 'wedding' ? WEDDING_EVENT_TYPES : REGULAR_EVENT_TYPES;
  const { formState: { touchedFields, errors }, watch } = form;
  
  const eventName = watch('event_name');
  const eventType = watch('event_type');
  const eventDate = watch('event_date');
  const startTime = watch('start_time');
  const guestCount = watch('guest_count');
  const location = watch('location');

  const isEventNameValid = eventName?.length >= 1 && !errors.event_name;
  const isEventTypeValid = !!eventType && !errors.event_type;
  const isEventDateValid = !!eventDate && !errors.event_date;
  const isStartTimeValid = !!startTime && !errors.start_time;
  const isGuestCountValid = guestCount >= 1 && !errors.guest_count;
  const isLocationValid = location?.length >= 1 && !errors.location;

  const completedCount = [
    isEventNameValid, isEventTypeValid, isEventDateValid, 
    isStartTimeValid, isGuestCountValid, isLocationValid
  ].filter(Boolean).length;

  return (
    <div ref={elementRef} className={animationClass}>
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-elegant text-foreground mb-3">
          Tell Us About Your Event
        </h2>
        <p className="text-muted-foreground">
          6 fields to describe your perfect occasion
        </p>
        <div className="mt-4 flex items-center justify-center gap-2">
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  i < completedCount ? "bg-green-500" : "bg-muted"
                )}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">{completedCount} of 6 complete</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        <FormField
          control={form.control}
          name="event_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <PartyPopper className="h-4 w-4 text-primary" />
                Event Name
                <RequiredBadge show={!isEventNameValid} />
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="Summer Company Picnic"
                    className={cn(
                      "h-12 pr-10 transition-all",
                      isEventNameValid && "border-green-500/50 bg-green-500/5"
                    )}
                    {...field}
                    onFocus={() => trackFieldInteraction('event_name')}
                    onBlur={(e) => {
                      field.onChange(formatEventName(e.target.value));
                      field.onBlur();
                    }}
                  />
                  <FieldStatus isValid={isEventNameValid} isTouched={!!touchedFields.event_name || !!eventName} />
                </div>
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
              <FormLabel className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Event Type
                <RequiredBadge show={!isEventTypeValid} />
              </FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value}
                onOpenChange={(open) => open && trackFieldInteraction('event_type')}
              >
                <FormControl>
                  <SelectTrigger className={cn(
                    "h-12 transition-all",
                    isEventTypeValid && "border-green-500/50 bg-green-500/5"
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
          )}
        />

        <FormField
          control={form.control}
          name="event_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Event Date
                <RequiredBadge show={!isEventDateValid} />
              </FormLabel>
              <FormControl>
                <DatePicker
                  value={field.value ? new Date(field.value) : undefined}
                  onChange={(date) => field.onChange(date?.toISOString().split('T')[0])}
                  placeholder="Pick an event date"
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  onFocus={() => trackFieldInteraction('event_date')}
                  className={cn(
                    isEventDateValid && "border-green-500/50 bg-green-500/5"
                  )}
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
              <FormLabel className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Start Time
                <RequiredBadge show={!isStartTimeValid} />
              </FormLabel>
              <FormControl>
                <TimeSelect
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select start time"
                  interval={30}
                  onFocus={() => trackFieldInteraction('start_time')}
                  className={cn(
                    isStartTimeValid && "border-green-500/50 bg-green-500/5"
                  )}
                />
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
              <FormLabel className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Number of Guests
                <RequiredBadge show={!isGuestCountValid} />
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="50"
                    min="1"
                    className={cn(
                      "h-12 pr-10 transition-all",
                      isGuestCountValid && "border-green-500/50 bg-green-500/5"
                    )}
                    {...field}
                    onFocus={() => trackFieldInteraction('guest_count')}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || '')}
                  />
                  <FieldStatus isValid={isGuestCountValid} isTouched={!!touchedFields.guest_count || !!guestCount} />
                </div>
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
              <FormLabel className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Event Location
                <RequiredBadge show={!isLocationValid} />
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="123 Main Street, Charleston, SC"
                    className={cn(
                      "h-12 pr-10 transition-all",
                      isLocationValid && "border-green-500/50 bg-green-500/5"
                    )}
                    {...field}
                    onFocus={() => trackFieldInteraction('location')}
                  />
                  <FieldStatus isValid={isLocationValid} isTouched={!!touchedFields.location || !!location} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
