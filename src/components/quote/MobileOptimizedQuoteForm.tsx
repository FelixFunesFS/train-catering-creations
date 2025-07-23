import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { regularEventSchema, type RegularEventFormData } from "@/lib/schemas/quoteFormSchemas";
import { StepIndicator } from "./StepIndicator";
import { SimplifiedMenuSelection } from "./SimplifiedMenuSelection";
import { regularMenuItems } from "@/data/menuItems";
import { ArrowLeft, ArrowRight, Phone, Mail } from "lucide-react";

const steps = ["Contact", "Event", "Menu", "Details"];

export const MobileOptimizedQuoteForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<RegularEventFormData>({
    resolver: zodResolver(regularEventSchema),
    defaultValues: {
      bussingTablesNeeded: false,
      separateServingArea: false,
      servingUtensils: false,
      cups: false,
      plates: false,
      napkins: false,
      foodWarmers: false,
      ice: false,
      bothProteinsAvailable: false,
      dietaryRestrictions: [],
    }
  });

  const guestCount = parseInt(form.watch("guestCount") || "0");
  const serviceType = form.watch("serviceType");

  const validateCurrentStep = () => {
    const values = form.getValues();
    
    switch (currentStep) {
      case 0: // Contact
        return values.contactName && values.eventName && values.email && values.phone;
      case 1: // Event
        return values.eventType && values.eventDate && values.eventStartTime && values.guestCount && values.location;
      case 2: // Menu
        return values.primaryProtein && values.serviceType && values.servingStartTime;
      case 3: // Details
        return true; // Optional fields
      default:
        return true;
    }
  };

  const nextStep = async () => {
    const isValid = await form.trigger();
    if (isValid && validateCurrentStep()) {
      setCompletedSteps(prev => [...prev.filter(s => s !== currentStep), currentStep]);
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const onSubmit = async (data: RegularEventFormData) => {
    setIsSubmitting(true);
    try {
      const emailContent = formatEmailContent(data);
      
      console.log("Form Data:", data);
      console.log("Email Content:", emailContent);
      
      toast({
        title: "Quote Request Submitted!",
        description: "We'll contact you within 24 hours to discuss your event details.",
      });
      
      form.reset();
      setCurrentStep(0);
      setCompletedSteps([]);
    } catch (error) {
      toast({
        title: "Submission Error",
        description: "There was an issue submitting your request. Please try again or call us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatEmailContent = (data: RegularEventFormData) => {
    const primaryProteinItem = regularMenuItems.find(item => item.id === data.primaryProtein);
    const secondaryProteinItem = regularMenuItems.find(item => item.id === data.secondaryProtein);
    
    return `
Regular Event Quote Request

CONTACT INFORMATION:
- Contact Name: ${data.contactName}
- Event Name: ${data.eventName}
- Email: ${data.email}
- Phone: ${data.phone}

EVENT DETAILS:
- Event Type: ${data.eventType}
- Date: ${data.eventDate}
- Start Time: ${data.eventStartTime}
- Guest Count: ${data.guestCount}
- Location: ${data.location}

MENU SELECTION:
- Primary Protein: ${primaryProteinItem?.name || 'Not selected'}
${secondaryProteinItem ? `- Secondary Protein: ${secondaryProteinItem.name}` : ''}
- Both Proteins Available to Guests: ${data.bothProteinsAvailable ? 'Yes' : 'No'}
${data.customMenuRequests ? `- Custom Menu Requests: ${data.customMenuRequests}` : ''}

SERVICE OPTIONS:
- Service Type: ${data.serviceType}
- Serving Start Time: ${data.servingStartTime}

SPECIAL REQUESTS:
${data.specialRequests || 'None'}

HOW DID YOU HEAR ABOUT US:
${data.hearAboutUs || 'Not specified'}
    `.trim();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-elegant font-semibold">Contact Information</h3>
              <p className="text-muted-foreground">Let's start with your contact details</p>
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="contactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">Your Name *</FormLabel>
                    <FormControl>
                      <Input {...field} className="h-12 text-base" placeholder="Enter your full name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="eventName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">Event Name *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Company Holiday Party" className="h-12 text-base" />
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
                    <FormLabel className="text-base font-medium">Email Address *</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" className="h-12 text-base" placeholder="your@email.com" />
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
                    <FormLabel className="text-base font-medium">Phone Number *</FormLabel>
                    <FormControl>
                      <Input {...field} type="tel" className="h-12 text-base" placeholder="(555) 123-4567" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-elegant font-semibold">Event Details</h3>
              <p className="text-muted-foreground">Tell us about your event</p>
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="eventType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">Type of Event *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 text-base">
                          <SelectValue placeholder="Select event type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="corporate">Corporate Event</SelectItem>
                        <SelectItem value="private-party">Private Party</SelectItem>
                        <SelectItem value="birthday">Birthday Party</SelectItem>
                        <SelectItem value="baby-shower">Baby Shower</SelectItem>
                        <SelectItem value="bereavement">Bereavement</SelectItem>
                        <SelectItem value="graduation">Graduation</SelectItem>
                        <SelectItem value="retirement">Retirement</SelectItem>
                        <SelectItem value="holiday-party">Holiday Party</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="guestCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">Number of Guests *</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" placeholder="e.g. 50" className="h-12 text-base" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="eventDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">Event Date *</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" className="h-12 text-base" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="eventStartTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">Start Time *</FormLabel>
                      <FormControl>
                        <Input {...field} type="time" className="h-12 text-base" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">Event Location *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Full address or venue name" className="h-12 text-base" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <SimplifiedMenuSelection form={form} guestCount={guestCount} />
            
            <div className="space-y-4 pt-4 border-t">
              <FormField
                control={form.control}
                name="serviceType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-base font-medium">Service Type *</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="space-y-3"
                      >
                        <div className="flex items-center space-x-3 p-3 border rounded-lg">
                          <RadioGroupItem value="full-service" id="full-service" />
                          <Label htmlFor="full-service" className="flex-1 text-base">
                            <div className="font-medium">Full Service</div>
                            <div className="text-sm text-muted-foreground">Including wait staff</div>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3 p-3 border rounded-lg">
                          <RadioGroupItem value="delivery-setup" id="delivery-setup" />
                          <Label htmlFor="delivery-setup" className="flex-1 text-base">
                            <div className="font-medium">Delivery & Setup</div>
                            <div className="text-sm text-muted-foreground">We'll set up everything for you</div>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3 p-3 border rounded-lg">
                          <RadioGroupItem value="delivery-only" id="delivery-only" />
                          <Label htmlFor="delivery-only" className="flex-1 text-base">
                            <div className="font-medium">Delivery Only</div>
                            <div className="text-sm text-muted-foreground">Food delivered in containers</div>
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="servingStartTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">Serving Start Time *</FormLabel>
                    <FormControl>
                      <Input {...field} type="time" className="h-12 text-base" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-elegant font-semibold">Additional Details</h3>
              <p className="text-muted-foreground">Help us make your event perfect</p>
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="specialRequests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">Special Requests</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Any special requirements, allergies, or requests..."
                        className="min-h-[100px] resize-none text-base"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hearAboutUs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">How did you hear about us?</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 text-base">
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="google">Google Search</SelectItem>
                        <SelectItem value="social-media">Social Media</SelectItem>
                        <SelectItem value="friend-referral">Friend/Family Referral</SelectItem>
                        <SelectItem value="previous-customer">Previous Customer</SelectItem>
                        <SelectItem value="vendor-referral">Vendor Referral</SelectItem>
                        <SelectItem value="event-planner">Event Planner</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Contact CTAs */}
            <div className="pt-6 border-t space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Prefer to discuss your event over the phone?
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="flex-1"
                    onClick={() => window.open('tel:8439700265')}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call (843) 970-0265
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="flex-1"
                    onClick={() => window.open('mailto:soultrainseatery@gmail.com')}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email Us
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="shadow-elegant w-full max-w-2xl mx-auto">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-elegant text-center">Request a Quote</CardTitle>
        <p className="text-muted-foreground text-center">
          Let us cater your special event with delicious Southern cuisine
        </p>
      </CardHeader>
      
      <CardContent className="px-4 sm:px-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <StepIndicator steps={steps} currentStep={currentStep} completedSteps={completedSteps} />
            
            {renderStepContent()}
            
            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-6 border-t sticky bottom-0 bg-background py-4">
              {currentStep > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="flex-1 h-12"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              )}
              
              {currentStep < steps.length - 1 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 h-12"
                  disabled={!validateCurrentStep()}
                >
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-12"
                >
                  {isSubmitting ? "Submitting..." : "Submit Quote Request"}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};