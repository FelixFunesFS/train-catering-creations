import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { formatPhoneNumber } from "@/utils/phoneFormatter";
import { formatCustomerName } from "@/utils/textFormatters";
import { User, Mail, Phone, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContactInfoStepProps {
  form: UseFormReturn<any>;
  trackFieldInteraction: (fieldName: string) => void;
}

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

export const ContactInfoStep = ({ form, trackFieldInteraction }: ContactInfoStepProps) => {
  const { getFieldState, watch } = form;

  const getFieldValidation = (fieldName: string) => {
    const fieldState = getFieldState(fieldName);
    const value = watch(fieldName);
    const hasValue = value && (typeof value === 'string' ? value.trim().length > 0 : true);
    return {
      isValid: hasValue && !fieldState.error,
      isTouched: fieldState.isTouched || hasValue,
    };
  };

  return (
    <div className="space-y-6 w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <User className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-elegant font-semibold">Let's start with your info</h2>
        <p className="text-muted-foreground mt-2">We'll use this to contact you about your event</p>
      </div>

      <FormField
        control={form.control}
        name="contact_name"
        render={({ field }) => {
          const validation = getFieldValidation('contact_name');
          return (
            <FormItem>
              <FormLabel className="flex items-center text-base">
                <User className="h-4 w-4 mr-2 text-muted-foreground" />
                Full Name
                <RequiredBadge show={!validation.isValid} />
                <FieldStatus isValid={validation.isValid} isTouched={validation.isTouched} />
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="John Smith"
                  className={cn(
                    "h-14 text-lg input-clean transition-all",
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
            <FormItem>
              <FormLabel className="flex items-center text-base">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                Email Address
                <RequiredBadge show={!validation.isValid} />
                <FieldStatus isValid={validation.isValid} isTouched={validation.isTouched} />
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  className={cn(
                    "h-14 text-lg input-clean transition-all",
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
            <FormItem>
              <FormLabel className="flex items-center text-base">
                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                Phone Number
                <RequiredBadge show={!validation.isValid} />
                <FieldStatus isValid={validation.isValid} isTouched={validation.isTouched} />
              </FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder="(843) 555-0123"
                  className={cn(
                    "h-14 text-lg input-clean transition-all",
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
    </div>
  );
};
