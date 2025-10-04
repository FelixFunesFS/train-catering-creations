import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Phone } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";

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
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-elegant text-foreground mb-3 title-hover-motion">
          Let's Start With Your Details
        </h2>
        <p className="text-muted-foreground text-lg">
          We'll use this information to create your personalized quote and keep you updated.
        </p>
      </div>

      <Card className="neumorphic-card-1 border-0 bg-gradient-to-br from-card via-card/95 to-muted/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl font-elegant">
            <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-primary-foreground" />
            </div>
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
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
        </CardContent>
      </Card>

      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-lg p-4 text-center">
        <p className="text-sm text-muted-foreground">
          <span className="text-primary font-medium">Privacy Promise:</span> Your information is secure and will only be used to provide your quote.
        </p>
      </div>
    </div>
  );
};