import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Truck, Users, Clock, ChefHat } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";

interface ServiceSelectionStepProps {
  form: UseFormReturn<any>;
  trackFieldInteraction: (fieldName: string) => void;
}

export const ServiceSelectionStep = ({ form, trackFieldInteraction }: ServiceSelectionStepProps) => {
  const { ref, isVisible } = useScrollAnimation({
    threshold: 0.2,
    triggerOnce: true,
    delay: 100
  });

  const animationClass = useAnimationClass('fade-up', isVisible);
  const watchServiceType = form.watch("service_type");

  return (
    <div ref={ref} className={`space-y-6 ${animationClass}`}>
      <div className="space-y-6">
          <FormField
            control={form.control}
            name="service_type"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <RadioGroup
                    onValueChange={(value) => {
                      trackFieldInteraction('service_type');
                      field.onChange(value);
                    }}
                    value={field.value}
                    className="space-y-4"
                  >
                    <div className="neumorphic-card-1 p-4 rounded-lg hover:shadow-glow transition-all duration-300">
                      <div className="flex items-start space-x-3">
                        <RadioGroupItem value="drop-off" id="drop-off" className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor="drop-off" className="flex items-center gap-3 text-base font-medium cursor-pointer">
                            <Truck className="h-5 w-5 text-primary" />
                            Drop-Off Service
                          </Label>
                          <p className="text-sm text-muted-foreground mt-2 ml-8">
                            We deliver beautifully prepared food in disposable containers. Perfect for casual events and budget-conscious hosts.
                          </p>
                          <div className="flex items-center gap-4 mt-3 ml-8 text-xs text-muted-foreground">
                            <span>✓ Fresh, hot food delivery</span>
                            <span>✓ Disposable containers included</span>
                            <span>✓ Serving utensils provided</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="neumorphic-card-1 p-4 rounded-lg hover:shadow-glow transition-all duration-300">
                      <div className="flex items-start space-x-3">
                        <RadioGroupItem value="delivery-setup" id="delivery-setup" className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor="delivery-setup" className="flex items-center gap-3 text-base font-medium cursor-pointer">
                            <Truck className="h-5 w-5 text-secondary" />
                            Delivery + Setup
                            <span className="text-sm text-primary bg-primary/10 px-2 py-1 rounded-full">Most Popular</span>
                          </Label>
                          <p className="text-sm text-muted-foreground mt-2 ml-8">
                            We deliver and professionally set up your food with chafing dishes and professional presentation, then you take it from there.
                          </p>
                          <div className="flex items-center gap-4 mt-3 ml-8 text-xs text-muted-foreground">
                            <span>✓ Professional food setup</span>
                            <span>✓ Chafing dishes included</span>
                            <span>✓ Elegant presentation</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="neumorphic-card-1 p-4 rounded-lg hover:shadow-glow transition-all duration-300">
                      <div className="flex items-start space-x-3">
                        <RadioGroupItem value="full-service" id="full-service" className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor="full-service" className="flex items-center gap-3 text-base font-medium cursor-pointer">
                            <Users className="h-5 w-5 text-gold" />
                            Full-Service Catering
                            <span className="text-sm text-gold bg-gold/10 px-2 py-1 rounded-full">Premium</span>
                          </Label>
          <p className="text-sm text-muted-foreground mt-2 ml-8">
            Complete catering service with professional setup, serving, and cleanup. Wait staff available for enhanced service.
          </p>
                          <div className="flex items-center gap-4 mt-3 ml-8 text-xs text-muted-foreground">
                            <span>✓ Professional wait staff included</span>
                            <span>✓ Complete setup & cleanup</span>
                            <span>✓ Chafing dishes & linens</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {watchServiceType === "full-service" && (
            <div className="space-y-4 animate-fade-in-up">
              <FormField
                control={form.control}
                name="serving_start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      Preferred Serving Start Time (Optional)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        className="h-12 text-base neumorphic-card-1 border-0 focus:ring-2 focus:ring-primary/30"
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

              <FormField
                control={form.control}
                name="bussing_tables_needed"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between space-x-2">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base font-medium">
                          Bussing Tables Service
                        </FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Professional table clearing and cleaning during your event
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
      </div>

      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-lg p-4 text-center">
        <p className="text-sm text-muted-foreground">
          <span className="text-primary font-medium">🍽️ Service Tip:</span> Need just delivery? Choose Drop-Off. Want setup help? Choose Delivery + Setup. Want the full experience? Choose Full-Service with optional wait staff.
        </p>
      </div>
    </div>
  );
};