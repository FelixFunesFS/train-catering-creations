import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Users, UtensilsCrossed } from "lucide-react";
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
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-elegant text-foreground mb-3 title-hover-motion">
          Additional Information
        </h2>
        <p className="text-muted-foreground text-lg">
          Help us serve you better with a few final details.
        </p>
      </div>

      {/* Wedding-Specific Options */}
      {variant === 'wedding' && (
        <Card className="neumorphic-card-1 border-0 bg-gradient-to-br from-card via-card/95 to-muted/10 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl font-elegant">
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                <UtensilsCrossed className="h-4 w-4 text-primary-foreground" />
              </div>
              Wedding Service Options
            </CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      )}

      {/* Additional Services */}
      <Card className="neumorphic-card-1 border-0 bg-gradient-to-br from-card via-card/95 to-muted/10 mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl font-elegant">
            <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
              <UtensilsCrossed className="h-4 w-4 text-primary-foreground" />
            </div>
            Additional Services
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="plates_requested"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-medium">Plates</FormLabel>
                    <p className="text-xs text-muted-foreground">Disposable serving plates</p>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cups_requested"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-medium">Cups</FormLabel>
                    <p className="text-xs text-muted-foreground">Disposable drinking cups</p>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="napkins_requested"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-medium">Napkins</FormLabel>
                    <p className="text-xs text-muted-foreground">Premium paper napkins</p>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="serving_utensils_requested"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-medium">Serving Utensils</FormLabel>
                    <p className="text-xs text-muted-foreground">Spoons, tongs, and serving forks</p>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="chafers_requested"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-medium">Chafing Dishes</FormLabel>
                    <p className="text-xs text-muted-foreground">Keep food warm during service</p>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ice_requested"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-medium">Ice</FormLabel>
                    <p className="text-xs text-muted-foreground">Fresh ice for beverages</p>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

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