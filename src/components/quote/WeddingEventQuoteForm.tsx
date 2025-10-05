import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { weddingEventSchema, type WeddingEventFormData } from "@/lib/schemas/tempFormSchemas";
import { MenuSelection } from "./MenuSelection";
import { weddingMenuItems } from "@/data/menuItems";
import { supabase } from "@/integrations/supabase/client";
import { formatCustomerName, formatEventName, formatLocation } from "@/utils/textFormatters";
import { formatPhoneNumber } from "@/utils/phoneFormatter";

const WeddingEventQuoteForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<WeddingEventFormData>({
    resolver: zodResolver(weddingEventSchema),
    defaultValues: {
      bussingTablesNeeded: false,
      separateServingArea: false,
      servingUtensils: false,
      cups: false,
      plates: false,
      napkins: false,
      foodWarmers: false,
      ice: false,
      ceremonyIncluded: false,
      cocktailHour: false,
      bothProteinsAvailable: false,
      dietaryRestrictions: [],
    }
  });

  const waitStaffRequested = form.watch("waitStaffRequested");
  const guestCount = parseInt(form.watch("guestCount") || "0");
  const primaryProtein = form.watch("primaryProtein");
  const secondaryProtein = form.watch("secondaryProtein");

  const onSubmit = async (data: WeddingEventFormData) => {
    setIsSubmitting(true);
    try {
      // Submit to database
      const { data: insertedData, error } = await supabase.from('quote_requests').insert({
        contact_name: data.contactName,
        email: data.email,
        phone: data.phone,
        event_name: data.eventName,
        event_type: data.eventType === 'wedding' ? 'private_party' : 
                   data.eventType === 'black_tie' ? 'corporate' :
                   data.eventType === 'military_function' ? 'corporate' :
                   data.eventType === 'gala' ? 'corporate' :
                   data.eventType === 'engagement_party' ? 'private_party' :
                   'anniversary',
        event_date: data.eventDate,
        start_time: data.eventStartTime,
        guest_count: parseInt(data.guestCount),
        location: data.location,
        service_type: data.serviceType === 'full-service' ? 'full-service' :
                     data.serviceType === 'delivery-only' ? 'delivery-only' :
                     'delivery-setup',
        serving_start_time: data.servingStartTime,
        primary_protein: data.primaryProtein,
        secondary_protein: data.secondaryProtein,
        both_proteins_available: data.bothProteinsAvailable,
        dietary_restrictions: data.dietaryRestrictions || [],
        special_requests: data.specialRequests,
        custom_menu_requests: data.customMenuRequests,
        serving_utensils_requested: data.servingUtensils,
        cups_requested: data.cups,
        plates_requested: data.plates,
        napkins_requested: data.napkins,
        ice_requested: data.ice,
        chafers_requested: data.foodWarmers,
        separate_serving_area: data.separateServingArea,
        serving_setup_area: data.servingSetupArea,
        bussing_tables_needed: data.bussingTablesNeeded,
        referral_source: data.hearAboutUs,
        status: 'pending'
      }).select();

      if (error) throw error;

      toast({
        title: "Wedding Quote Request Submitted!",
        description: "We'll contact you within 24 hours to discuss your special day.",
      });
      
      form.reset();
    } catch (error) {
      console.error('Wedding form submission error:', error);
      toast({
        title: "Submission Error",
        description: "There was an issue submitting your request. Please try again or call us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatEmailContent = (data: WeddingEventFormData) => {
    const primaryProteinItem = weddingMenuItems.find(item => item.id === data.primaryProtein);
    const secondaryProteinItem = weddingMenuItems.find(item => item.id === data.secondaryProtein);
    
    return `
Wedding/Black Tie Event Quote Request

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
- Ceremony Included: ${data.ceremonyIncluded ? 'Yes' : 'No'}
- Cocktail Hour: ${data.cocktailHour ? 'Yes' : 'No'}

MENU SELECTION:
- Primary Protein: ${primaryProteinItem?.name || 'Not selected'}
${secondaryProteinItem ? `- Secondary Protein: ${secondaryProteinItem.name}` : ''}
- Both Proteins Available to Guests: ${data.bothProteinsAvailable ? 'Yes' : 'No'}
${data.customMenuRequests ? `- Custom Menu Requests: ${data.customMenuRequests}` : ''}

SERVICE OPTIONS:
- Service Type: ${data.serviceType}
- Serving Start Time: ${data.servingStartTime}

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

DIETARY CONSIDERATIONS:
${data.dietaryRestrictions?.length ? data.dietaryRestrictions.join(', ') : 'None specified'}

DIETARY NEEDS:
${data.specialDietaryNeeds || 'None specified'}

SPECIAL REQUESTS:
${data.specialRequests || 'None'}

HOW DID YOU HEAR ABOUT US:
${data.hearAboutUs}
    `.trim();
  };

  return (
    <Card className="shadow-elegant w-full">
      <CardHeader>
        <CardTitle className="text-3xl font-elegant text-center">Wedding & Black Tie Event Quote</CardTitle>
        <p className="text-muted-foreground text-center">
          Let us help make your special occasion extraordinary with our premium catering services
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
                        <Input 
                          {...field}
                          onBlur={(e) => {
                            const formatted = formatCustomerName(e.target.value);
                            field.onChange(formatted);
                            field.onBlur();
                          }}
                          className="h-12" 
                        />
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
                        <Input 
                          {...field}
                          onBlur={(e) => {
                            const formatted = formatEventName(e.target.value);
                            field.onChange(formatted);
                            field.onBlur();
                          }}
                          placeholder="e.g. Sarah & John's Wedding" 
                          className="h-12" 
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
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field}
                          type="email"
                          onBlur={(e) => {
                            const normalized = e.target.value.trim().toLowerCase();
                            field.onChange(normalized);
                            field.onBlur();
                          }}
                          className="h-12" 
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
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field}
                          type="tel"
                          onChange={(e) => {
                            const formatted = formatPhoneNumber(e.target.value);
                            field.onChange(formatted);
                          }}
                          onBlur={field.onBlur}
                          className="h-12" 
                        />
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
                          <SelectItem value="wedding">Wedding</SelectItem>
                          <SelectItem value="black-tie">Black Tie Event</SelectItem>
                          <SelectItem value="military-function">Military Function</SelectItem>
                          <SelectItem value="gala">Gala</SelectItem>
                          <SelectItem value="anniversary">Anniversary</SelectItem>
                          <SelectItem value="engagement-party">Engagement Party</SelectItem>
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
                        <Input {...field} type="number" placeholder="e.g. 150" className="h-12" />
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
                      <Input 
                        {...field}
                        onBlur={(e) => {
                          const formatted = formatLocation(e.target.value);
                          field.onChange(formatted);
                          field.onBlur();
                        }}
                        placeholder="Full address or venue name" 
                        className="h-12" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="ceremonyIncluded"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Ceremony Catering Included</FormLabel>
                        <FormDescription>Light refreshments during ceremony</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cocktailHour"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Cocktail Hour</FormLabel>
                        <FormDescription>Appetizers and beverages before dinner</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
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
                          <RadioGroupItem value="full-service" id="wedding-full-service" />
                          <FormLabel htmlFor="wedding-full-service">Full Service (including wait staff)</FormLabel>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="delivery-only" id="wedding-delivery-only" />
                          <FormLabel htmlFor="wedding-delivery-only">Delivery Only</FormLabel>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="delivery-setup" id="wedding-delivery-setup" />
                          <FormLabel htmlFor="wedding-delivery-setup">Delivery and Set Up</FormLabel>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Menu Selection */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-primary">Menu Selection</h3>
              <MenuSelection 
                form={form} 
                eventType="wedding" 
                guestCount={guestCount}
              />
            </div>

            {/* Serving Details */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-primary">Serving Details</h3>
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
                          <RadioGroupItem value="yes-full-service" id="wedding-yes-full-service" />
                          <FormLabel htmlFor="wedding-yes-full-service">Yes - Full Service</FormLabel>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="wedding-no-wait-staff" />
                          <FormLabel htmlFor="wedding-no-wait-staff">No</FormLabel>
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

            {/* Dietary Needs */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-primary">Special Dietary Needs</h3>
              <FormField
                control={form.control}
                name="specialDietaryNeeds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dietary Restrictions & Allergies</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Please list any food allergies, vegetarian/vegan guests, gluten-free requirements, etc..."
                        className="min-h-[100px] resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                        placeholder="Tell us about special presentation requests, timing considerations, or any other custom requirements for your special day..."
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
                        <SelectItem value="vendor-referral">Wedding Vendor Referral</SelectItem>
                        <SelectItem value="wedding-show">Wedding Show/Expo</SelectItem>
                        <SelectItem value="venue-recommendation">Venue Recommendation</SelectItem>
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
                {isSubmitting ? "Submitting..." : "Submit Wedding Quote Request"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default WeddingEventQuoteForm;
