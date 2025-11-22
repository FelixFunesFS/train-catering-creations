import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";

interface FinalStepProps {
  form: UseFormReturn<any>;
  variant?: 'regular' | 'wedding';
}

export const FinalStep = ({ form, variant = 'regular' }: FinalStepProps) => {
  const { ref, isVisible } = useScrollAnimation({
    threshold: 0.2,
    triggerOnce: true,
    delay: 100
  });

  const animationClass = useAnimationClass('fade-up', isVisible);

  return (
    <div ref={ref} className={`space-y-6 ${animationClass}`}>
      {/* Wedding-Specific Options */}
      {variant === 'wedding' && (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="ceremony_included"
                render={({ field }) => (
                  <FormItem className="flex items-start space-x-3 space-y-0 rounded-md border border-muted p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-base font-medium">Ceremony Included</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        We'll provide catering service during the ceremony
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cocktail_hour"
                render={({ field }) => (
                  <FormItem className="flex items-start space-x-3 space-y-0 rounded-md border border-muted p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-base font-medium">Cocktail Hour</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Add a cocktail hour with light appetizers
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </div>
        </div>
      )}

      {/* Complete Setup Package */}
      <div className="space-y-6">
        <FormField
          control={form.control}
          name="complete_setup_package"
          render={({ field }) => (
            <FormItem className="flex items-start space-x-3 space-y-0 rounded-md border border-muted bg-card/50 backdrop-blur-sm p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-base font-medium">Complete Setup Package</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Includes plates, cups, napkins, serving utensils, chafing dishes, and ice
                </p>
              </div>
            </FormItem>
          )}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Special Requests */}
        <div className="space-y-6">
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
                      className="min-h-[120px] input-clean"
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
        </div>

        {/* How did you hear about us */}
        <div className="space-y-6">
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
                    <SelectTrigger className="h-12 input-clean">
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
        </div>
      </div>

    </div>
  );
};