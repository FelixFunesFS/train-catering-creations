import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { User, Mail, Phone } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { formatCustomerName } from "@/utils/textFormatters";
import { formatPhoneNumber } from "@/utils/phoneFormatter";

interface ContactStepProps {
  form: UseFormReturn<any>;
  trackFieldInteraction: (fieldName: string) => void;
}

export const ContactStep = ({ form, trackFieldInteraction }: ContactStepProps) => {
  const { ref, isVisible } = useScrollAnimation({
    threshold: 0.2,
    triggerOnce: true,
    delay: 100
  });

  const animationClass = useAnimationClass('fade-up', isVisible);

  return (
    <div ref={ref} className={`space-y-6 ${animationClass}`}>
      <div className="space-y-6">
          <FormField
            control={form.control}
            name="contact_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Full Name *
                </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onFocus={() => trackFieldInteraction('contact_name')}
                  onBlur={(e) => {
                    const formatted = formatCustomerName(e.target.value);
                    field.onChange(formatted);
                    field.onBlur();
                  }}
                  placeholder="Enter your full name"
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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Email Address *
                </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  {...field}
                  onFocus={() => trackFieldInteraction('email')}
                  onBlur={(e) => {
                    const normalized = e.target.value.trim().toLowerCase();
                    field.onChange(normalized);
                    field.onBlur();
                  }}
                  placeholder="your.email@example.com"
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
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  Phone Number *
                </FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  {...field}
                  onFocus={() => trackFieldInteraction('phone')}
                  onChange={(e) => {
                    const formatted = formatPhoneNumber(e.target.value);
                    field.onChange(formatted);
                  }}
                  onBlur={field.onBlur}
                  placeholder="(555) 123-4567"
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
      </div>

      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-lg p-4 text-center">
        <p className="text-sm text-muted-foreground">
          <span className="text-primary font-medium">Privacy Promise:</span> Your information is secure and will only be used to provide your quote.
        </p>
      </div>
    </div>
  );
};