import { UseFormReturn, useWatch } from "react-hook-form";
import { memo } from "react";
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

const ServiceSelectionStepComponent = ({ form, trackFieldInteraction }: ServiceSelectionStepProps) => {
  const { ref, isVisible } = useScrollAnimation({
    threshold: 0.2,
    triggerOnce: true,
    delay: 100
  });

  const animationClass = useAnimationClass('fade-up', isVisible);
  const watchServiceType = useWatch({
    control: form.control,
    name: "service_type"
  });

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
                    value={field.value}
                    className="space-y-4"
                  >
                    <div 
                      className="bg-card p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-colors duration-300 cursor-pointer"
                      onClick={() => {
                        trackFieldInteraction('service_type');
                        field.onChange('drop-off');
                      }}
                    >
                      <div className="flex items-start space-x-3">
                        <RadioGroupItem 
                          value="drop-off" 
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <Label className="flex items-center gap-3 text-base font-medium cursor-pointer">
                            <Truck className="h-5 w-5 text-primary" />
                            Drop-Off Service
                          </Label>
                          <p className="text-sm text-muted-foreground mt-2 ml-8">
                            We deliver beautifully prepared food in disposable containers. Perfect for casual events and budget-conscious hosts.
                          </p>
                          <div className="flex items-center gap-4 mt-3 ml-8 text-xs text-muted-foreground">
                            <span>✓ Fresh, hot food delivery</span>
                            <span>✓ Serving utensils provided</span>
                            <span>✓ Disposable containers</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div 
                      className="bg-card p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-colors duration-300 cursor-pointer"
                      onClick={() => {
                        trackFieldInteraction('service_type');
                        field.onChange('delivery-setup');
                      }}
                    >
                      <div className="flex items-start space-x-3">
                        <RadioGroupItem 
                          value="delivery-setup" 
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <Label className="flex items-center gap-3 text-base font-medium cursor-pointer">
                            <Truck className="h-5 w-5 text-secondary" />
                            Delivery + Setup
                            <span className="text-sm text-primary bg-primary/10 px-2 py-1 rounded-full">Most Popular</span>
                          </Label>
                          <p className="text-sm text-muted-foreground mt-2 ml-8">
                            We deliver and professionally set up your food with chafing dishes and professional presentation, then you take it from there.
                          </p>
                          <div className="flex items-center gap-4 mt-3 ml-8 text-xs text-muted-foreground">
                            <span>✓ Professional food setup</span>
                            <span>✓ Serving utensils provided</span>
                            <span>✓ Disposable chafing dishes with fuel</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div 
                      className="bg-card p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-colors duration-300 cursor-pointer"
                      onClick={() => {
                        trackFieldInteraction('service_type');
                        field.onChange('full-service');
                      }}
                    >
                      <div className="flex items-start space-x-3">
                        <RadioGroupItem 
                          value="full-service" 
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <Label className="flex items-center gap-3 text-base font-medium cursor-pointer">
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
                        className="h-12 text-base input-clean"
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
                    <div 
                      className="flex items-center justify-between space-x-2 bg-card p-4 rounded-lg border border-border/50 hover:border-primary/50 cursor-pointer transition-colors"
                      onClick={() => field.onChange(!field.value)}
                    >
                      <div className="space-y-0.5">
                        <FormLabel className="text-base font-medium cursor-pointer">
                          Bussing Tables Service
                        </FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Professional table clearing and cleaning during your event
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
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

    </div>
  );
};

export const ServiceSelectionStep = ServiceSelectionStepComponent;