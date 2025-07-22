
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { regularEventSchema, type RegularEventFormData } from "@/lib/schemas/quoteFormSchemas";

const RegularEventQuoteForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<RegularEventFormData>({
    resolver: zodResolver(regularEventSchema),
    defaultValues: {
      doubleMeat: false,
      bussingTablesNeeded: false,
      separateServingArea: false,
      servingUtensils: false,
      cups: false,
      plates: false,
      napkins: false,
      foodWarmers: false,
      ice: false,
    }
  });

  const waitStaffRequested = form.watch("waitStaffRequested");
  const serviceType = form.watch("serviceType");

  const onSubmit = async (data: RegularEventFormData) => {
    setIsSubmitting(true);
    try {
      // Format email content
      const emailContent = formatEmailContent(data);
      
      // Here you would integrate with your email service
      console.log("Form Data:", data);
      console.log("Email Content:", emailContent);
      
      toast({
        title: "Quote Request Submitted!",
        description: "We'll contact you within 24 hours to discuss your event details.",
      });
      
      form.reset();
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

SERVICE OPTIONS:
- Service Type: ${data.serviceType}
- Serving Start Time: ${data.servingStartTime}
- Protein Choice: ${data.proteinChoice}
- Double Meat: ${data.doubleMeat ? 'Yes' : 'No'}

WAIT STAFF:
- Wait Staff: ${data.waitStaffRequested}
- Bussing Tables: ${data.bussingTablesNeeded ? 'Yes' : 'No'}
${waitStaffRequested === 'yes-full-service' ? `
- Wait Staff Setup Area: ${data.waitStaffSetupArea || 'Not specified'}
- Separate Serving Area: ${data.separateServingArea ? 'Yes' : 'No'}
- Serving Setup Area: ${data.servingSetupArea || 'Not specified'}
` : ''}

ADDITIONAL SERVICES:
- Serving Utensils: ${data.servingUtensils ? 'Yes' : 'No'}
- Cups: ${data.cups ? 'Yes' : 'No'}
- Plates: ${data.plates ? 'Yes' : 'No'}
- Napkins: ${data.napkins ? 'Yes' : 'No'}
- Food Warmers: ${data.foodWarmers ? 'Yes' : 'No'}
- Ice: ${data.ice ? 'Yes' : 'No'}

SPECIAL REQUESTS:
${data.specialRequests || 'None'}

HOW DID YOU HEAR ABOUT US:
${data.hearAboutUs}
    `.trim();
  };

  return (
    <Card className="shadow-elegant max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-3xl font-elegant text-center">Regular Event Quote Request</CardTitle>
        <p className="text-muted-foreground text-center">
          Fill out the details below and we'll create a custom quote for your event
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-primary">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Point of Contact Name *</FormLabel>
                      <FormControl>
                        <Input {...field} className="h-12" />
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
                      <FormLabel>Name of Event *</FormLabel>
                      <FormControl>
                        <Input {...field} className="h-12" />
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
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" className="h-12" />
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
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input {...field} type="tel" className="h-12" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Event Details */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-primary">Event Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="eventType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type of Event *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12">
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
                      <FormLabel>Number of Guests *</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" placeholder="e.g. 50" className="h-12" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="eventDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Date *</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" className="h-12" />
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
                      <FormLabel>Event Start Time *</FormLabel>
                      <FormControl>
                        <Input {...field} type="time" className="h-12" />
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
                    <FormLabel>Event Location *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Full address or venue name" className="h-12" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Service Options */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-primary">Service Options</h3>
              <FormField
                control={form.control}
                name="serviceType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Service Type *</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="full-service" id="full-service" />
                          <Label htmlFor="full-service">Full Service (including wait staff)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="delivery-only" id="delivery-only" />
                          <Label htmlFor="delivery-only">Delivery Only</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="delivery-setup" id="delivery-setup" />
                          <Label htmlFor="delivery-setup">Delivery and Set Up</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Serving Details */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-primary">Serving Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="servingStartTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time Serving Should Start *</FormLabel>
                      <FormControl>
                        <Input {...field} type="time" className="h-12" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="proteinChoice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Protein Choice *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select protein option" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="option-1">Protein Option #1</SelectItem>
                          <SelectItem value="option-2">Protein Option #2</SelectItem>
                          <SelectItem value="both">Both Options Available</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Wait Staff Section */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-primary">Wait Staff Requirements</h3>
              <FormField
                control={form.control}
                name="waitStaffRequested"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Wait Staff Requested *</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes-full-service" id="yes-full-service" />
                          <Label htmlFor="yes-full-service">Yes - Full Service</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="no-wait-staff" />
                          <Label htmlFor="no-wait-staff">No</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {waitStaffRequested === 'yes-full-service' && (
                <div className="space-y-4 pl-4 border-l-2 border-primary/20">
                  <FormField
                    control={form.control}
                    name="bussingTablesNeeded"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Bussing Tables Needed?
                          </FormLabel>
                          <FormDescription>
                            Removing dishes/glassware after meal service
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="waitStaffSetupArea"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wait Staff Set Up Area</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Select setup area type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="covered-outdoor">Covered Outdoor</SelectItem>
                            <SelectItem value="non-covered-outdoor">Non-Covered Outdoor</SelectItem>
                            <SelectItem value="indoor">Indoor</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Area where wait staff will prep and store food
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="separateServingArea"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Will Wait Staff Set Up area be separate from serving area?
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  {form.watch("separateServingArea") && (
                    <FormField
                      control={form.control}
                      name="servingSetupArea"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Serving Set Up Area</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12">
                                <SelectValue placeholder="Select serving area type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="covered-outdoor">Covered Outdoor</SelectItem>
                              <SelectItem value="non-covered-outdoor">Non-Covered Outdoor</SelectItem>
                              <SelectItem value="indoor">Indoor</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Area where buffet/meals will be served to guests
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Additional Services */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-primary">Additional Services</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { name: "servingUtensils", label: "Serving Utensils" },
                  { name: "cups", label: "Cups" },
                  { name: "plates", label: "Plates" },
                  { name: "napkins", label: "Napkins" },
                  { name: "foodWarmers", label: "Food Warmers" },
                  { name: "ice", label: "Ice" },
                ].map((item) => (
                  <FormField
                    key={item.name}
                    control={form.control}
                    name={item.name as any}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          {item.label}
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Special Requests */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-primary">Custom & Special Requests</h3>
              <FormField
                control={form.control}
                name="specialRequests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Details</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Tell us about double meat servings, dietary restrictions, special setup requirements, or any other custom requests..."
                        className="min-h-[120px] resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* How did you hear about us */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="hearAboutUs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How did you hear about us? *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="google">Google Search</SelectItem>
                        <SelectItem value="social-media">Social Media</SelectItem>
                        <SelectItem value="word-of-mouth">Word of Mouth</SelectItem>
                        <SelectItem value="previous-client">Previous Client</SelectItem>
                        <SelectItem value="vendor-referral">Vendor Referral</SelectItem>
                        <SelectItem value="wedding-show">Wedding Show/Event</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-center pt-6">
              <Button 
                type="submit" 
                variant="cta" 
                size="responsive-lg" 
                disabled={isSubmitting}
                className="w-full sm:w-auto sm:min-w-[16rem]"
              >
                {isSubmitting ? "Submitting..." : "Submit Quote Request"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default RegularEventQuoteForm;
