import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Users } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";

interface FinalStepProps {
  form: UseFormReturn<any>;
}

export const FinalStep = ({ form }: FinalStepProps) => {
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
          Additional Information
        </h2>
        <p className="text-muted-foreground text-lg">
          Help us serve you better with a few final details.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Special Requests */}
        <Card className="neumorphic-card-1 border-0 bg-gradient-to-br from-card via-card/95 to-muted/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl font-elegant">
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-primary-foreground" />
              </div>
              Special Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="special_requests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">
                    Any special requests or additional information?
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about any special accommodations, setup requirements, or other details we should know..."
                      className="min-h-[120px] neumorphic-card-1 border-0 focus:ring-2 focus:ring-primary/30"
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

        {/* How did you hear about us */}
        <Card className="neumorphic-card-1 border-0 bg-gradient-to-br from-card via-card/95 to-muted/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl font-elegant">
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-primary-foreground" />
              </div>
              How did you hear about us?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="referral_source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">
                    Please let us know how you found Soul Train's Eatery
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 neumorphic-card-1 border-0 focus:ring-2 focus:ring-primary/30">
                        <SelectValue placeholder="Select an option..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-background border shadow-lg">
                      <SelectItem value="google_search">Google Search</SelectItem>
                      <SelectItem value="social_media">Social Media (Facebook, Instagram, etc.)</SelectItem>
                      <SelectItem value="friend_family_referral">Friend/Family Referral</SelectItem>
                      <SelectItem value="previous_customer">Previous Customer</SelectItem>
                      <SelectItem value="local_business_referral">Local Business Referral</SelectItem>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      </div>

      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-lg p-4 text-center">
        <p className="text-sm text-muted-foreground">
          <span className="text-primary font-medium">🤝 Thank you!</span> We appreciate you choosing Soul Train's Eatery for your special event.
        </p>
      </div>
    </div>
  );
};