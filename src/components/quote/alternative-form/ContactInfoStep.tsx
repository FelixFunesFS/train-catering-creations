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
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
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
      <div className="absolute right-3 top-1/2 -translate-y-1/2">
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

export const ContactInfoStep = ({ form, trackFieldInteraction }: ContactInfoStepProps) => {
  const { ref: elementRef, isVisible, variant: animVariant } = useScrollAnimation({ variant: 'subtle' });
  const animationClass = useAnimationClass(animVariant, isVisible);

  const { formState: { touchedFields, errors }, watch } = form;
  
  const contactName = watch('contact_name');
  const email = watch('email');
  const phone = watch('phone');

  const isNameValid = contactName?.length >= 1 && !errors.contact_name;
  const isEmailValid = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !errors.email;
  const isPhoneValid = phone?.length >= 10 && !errors.phone;

  const completedCount = [isNameValid, isEmailValid, isPhoneValid].filter(Boolean).length;

  return (
    <div ref={elementRef} className={animationClass}>
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-elegant text-foreground mb-3">
          Let's Start With Your Info
        </h2>
        <p className="text-muted-foreground">
          Just 3 quick fields to get started
        </p>
        <div className="mt-4 flex items-center justify-center gap-2">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  i < completedCount ? "bg-green-500" : "bg-muted"
                )}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">{completedCount} of 3 complete</span>
        </div>
      </div>

      <div className="max-w-md mx-auto space-y-6">
        <FormField
          control={form.control}
          name="contact_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Full Name
                <RequiredBadge show={!isNameValid} />
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="John Smith"
                    className={cn(
                      "h-14 text-lg pr-10 transition-all",
                      isNameValid && "border-green-500/50 bg-green-500/5"
                    )}
                    {...field}
                    onFocus={() => trackFieldInteraction('contact_name')}
                    onBlur={(e) => {
                      field.onChange(formatCustomerName(e.target.value));
                      field.onBlur();
                    }}
                  />
                  <FieldStatus isValid={isNameValid} isTouched={!!touchedFields.contact_name || !!contactName} />
                </div>
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
              <FormLabel className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                Email Address
                <RequiredBadge show={!isEmailValid} />
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    className={cn(
                      "h-14 text-lg pr-10 transition-all",
                      isEmailValid && "border-green-500/50 bg-green-500/5"
                    )}
                    {...field}
                    onFocus={() => trackFieldInteraction('email')}
                    onBlur={(e) => {
                      const trimmed = e.target.value.trim().toLowerCase();
                      field.onChange(trimmed);
                      field.onBlur();
                    }}
                  />
                  <FieldStatus isValid={!!isEmailValid} isTouched={!!touchedFields.email || !!email} />
                </div>
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
              <FormLabel className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                Phone Number
                <RequiredBadge show={!isPhoneValid} />
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type="tel"
                    placeholder="(843) 555-0123"
                    className={cn(
                      "h-14 text-lg pr-10 transition-all",
                      isPhoneValid && "border-green-500/50 bg-green-500/5"
                    )}
                    {...field}
                    onFocus={() => trackFieldInteraction('phone')}
                    onChange={(e) => {
                      const formatted = formatPhoneNumber(e.target.value);
                      field.onChange(formatted);
                    }}
                  />
                  <FieldStatus isValid={isPhoneValid} isTouched={!!touchedFields.phone || !!phone} />
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
