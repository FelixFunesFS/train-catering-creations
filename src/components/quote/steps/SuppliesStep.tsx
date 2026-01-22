import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Circle, Package, MessageSquare } from "lucide-react";

interface SuppliesStepProps {
  form: UseFormReturn<any>;
  variant?: 'regular' | 'wedding';
}

export const SuppliesStep = ({ form, variant = 'regular' }: SuppliesStepProps) => {
  const supplies = [
    { name: "plates_requested", label: "Disposable Plates", description: "Heavy-duty disposable plates" },
    { name: "cups_requested", label: "Disposable Cups", description: "Cups for beverages" },
    { name: "napkins_requested", label: "Napkins", description: "Disposable napkins" },
    { name: "serving_utensils_requested", label: "Serving Utensils", description: "Tongs, spoons, serving tools" },
    { name: "chafers_requested", label: "Chafing Dishes", description: "Disposable chafers with fuel" },
    { name: "ice_requested", label: "Ice", description: "Ice for beverages and cooling" },
  ];

  return (
    <div className="space-y-6 w-full max-w-lg mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Package className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-elegant font-semibold">Supplies & Final Details</h2>
        <p className="text-muted-foreground mt-2">Select any supplies you need and add special requests</p>
      </div>

      {/* Wedding-specific options */}
      {variant === 'wedding' && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <FormField
            control={form.control}
            name="ceremony_included"
            render={({ field }) => (
              <FormItem 
                className="flex items-start space-x-3 space-y-0 rounded-md border border-muted bg-card p-4 cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => field.onChange(!field.value)}
              >
                <FormControl>
                  {field.value ? (
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  )}
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm font-medium cursor-pointer">Ceremony Included</FormLabel>
                  <p className="text-xs text-muted-foreground">Catering during ceremony</p>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cocktail_hour"
            render={({ field }) => (
              <FormItem 
                className="flex items-start space-x-3 space-y-0 rounded-md border border-muted bg-card p-4 cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => field.onChange(!field.value)}
              >
                <FormControl>
                  {field.value ? (
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  )}
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm font-medium cursor-pointer">Cocktail Hour</FormLabel>
                  <p className="text-xs text-muted-foreground">Light appetizers</p>
                </div>
              </FormItem>
            )}
          />
        </div>
      )}

      {/* Supply & Equipment Grid */}
      <div className="grid grid-cols-2 gap-3">
        {supplies.map((supply) => (
          <FormField
            key={supply.name}
            control={form.control}
            name={supply.name}
            render={({ field }) => (
              <FormItem 
                className="flex items-start space-x-3 space-y-0 rounded-md border border-muted bg-card p-3 cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => field.onChange(!field.value)}
              >
                <FormControl>
                  {field.value ? (
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  )}
                </FormControl>
                <div className="space-y-0.5 leading-none">
                  <FormLabel className="text-sm font-medium cursor-pointer">{supply.label}</FormLabel>
                  <p className="text-xs text-muted-foreground">{supply.description}</p>
                </div>
              </FormItem>
            )}
          />
        ))}
      </div>

      {/* Special Requests */}
      <div className="space-y-4 pt-4">
        <FormField
          control={form.control}
          name="special_requests"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2 text-base font-medium">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                Special Requests
              </FormLabel>
              <FormControl>
                <Textarea
                  className="min-h-[100px] input-clean resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.preventDefault();
                  }}
                  {...field}
                />
              </FormControl>
              <p className="text-xs text-muted-foreground">
                Example: buffet setup details, serving area notes, allergies, timing constraints.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="referral_source"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">How did you find us?</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="h-12 input-clean">
                    <SelectValue placeholder="Select an option..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-background border shadow-lg">
                  <SelectItem value="google_search">Google Search</SelectItem>
                  <SelectItem value="social_media">Social Media</SelectItem>
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
  );
};
