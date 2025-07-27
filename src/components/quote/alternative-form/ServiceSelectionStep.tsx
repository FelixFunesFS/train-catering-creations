import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Truck, Users, Clock, ChefHat } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";

interface ServiceSelectionStepProps {
  form: UseFormReturn<any>;
}

export const ServiceSelectionStep = ({ form }: ServiceSelectionStepProps) => {
  const { ref, isVisible } = useScrollAnimation({
    threshold: 0.2,
    triggerOnce: true,
    delay: 100
  });

  const animationClass = useAnimationClass('fade-up', isVisible);
  const waitStaffRequested = form.watch("wait_staff_requested");

  return (
    <div ref={ref} className={`space-y-6 ${animationClass}`}>
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-elegant text-foreground mb-3 title-hover-motion">
          Choose Your Service Level
        </h2>
        <p className="text-muted-foreground text-lg">
          From simple drop-off to full-service experience, we'll match your needs.
        </p>
      </div>

      <Card className="neumorphic-card-1 border-0 bg-gradient-to-br from-card via-card/95 to-muted/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl font-elegant">
            <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
              <ChefHat className="h-4 w-4 text-primary-foreground" />
            </div>
            Service Type
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormField
            control={form.control}
            name="service_type"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
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
                            <span className="text-sm text-primary bg-primary/10 px-2 py-1 rounded-full">Most Popular</span>
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
                        <RadioGroupItem value="full-service" id="full-service" className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor="full-service" className="flex items-center gap-3 text-base font-medium cursor-pointer">
                            <Users className="h-5 w-5 text-gold" />
                            Full-Service Catering
                            <span className="text-sm text-gold bg-gold/10 px-2 py-1 rounded-full">Premium</span>
                          </Label>
                          <p className="text-sm text-muted-foreground mt-2 ml-8">
                            Complete catering experience with setup, service, and cleanup. Includes chafing dishes, linens, and professional presentation.
                          </p>
                          <div className="flex items-center gap-4 mt-3 ml-8 text-xs text-muted-foreground">
                            <span>✓ Professional setup & service</span>
                            <span>✓ Chafing dishes & linens</span>
                            <span>✓ Complete cleanup</span>
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

          {form.watch("service_type") === "full-service" && (
            <div className="space-y-4 animate-fade-in-up">
              <FormField
                control={form.control}
                name="serving_start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      Preferred Serving Start Time
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        className="h-12 text-base neumorphic-card-1 border-0 focus:ring-2 focus:ring-primary/30"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-between p-4 neumorphic-card-1 rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="wait-staff" className="text-base font-medium">
                    Professional Wait Staff
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Add experienced servers to assist your guests
                  </p>
                </div>
                <FormField
                  control={form.control}
                  name="wait_staff_requested"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Switch
                          id="wait-staff"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {waitStaffRequested && (
                <div className="space-y-4 animate-fade-in-up">
                  <FormField
                    control={form.control}
                    name="wait_staff_requirements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">
                          Wait Staff Requirements
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your wait staff needs (e.g., number of servers, specific duties, dress code)"
                            className="min-h-[100px] neumorphic-card-1 border-0 focus:ring-2 focus:ring-primary/30"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="wait_staff_setup_areas"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">
                          Setup Areas for Wait Staff
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., main dining room, outdoor patio, cocktail area"
                            className="h-12 text-base neumorphic-card-1 border-0 focus:ring-2 focus:ring-primary/30"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-lg p-4 text-center">
        <p className="text-sm text-muted-foreground">
          <span className="text-primary font-medium">🍽️ Service Tip:</span> Full-service includes all setup, service, and cleanup - perfect for stress-free hosting.
        </p>
      </div>
    </div>
  );
};