import { useState, useCallback, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ContactAndEventStep } from "./alternative-form/ContactAndEventStep";
import { ServiceSelectionStep } from "./alternative-form/ServiceSelectionStep";
import { MenuSelectionStep } from "./alternative-form/MenuSelectionStep";
import { FinalStep } from "./alternative-form/FinalStep";
import { SuccessStep } from "./alternative-form/SuccessStep";
import { FormProgressBar } from "./FormProgressBar";
import { FormSectionHeader } from "./FormSectionHeader";
import { ReviewSummaryCard } from "./ReviewSummaryCard";
import { Check, Loader2, User, Calendar, ChefHat, UtensilsCrossed, FileText } from "lucide-react";
import { formSchema } from "./alternative-form/formSchema";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useFormAnalytics } from "@/hooks/useFormAnalytics";
import { formatCustomerName, formatEventName, formatLocation } from "@/utils/textFormatters";

type FormData = z.infer<typeof formSchema>;

interface SinglePageQuoteFormProps {
  variant?: 'regular' | 'wedding';
  onSuccess?: (quoteId: string) => void;
}

const SECTIONS = [
  { id: 'contact-event', title: 'Event & Contact', icon: Calendar, required: true },
  { id: 'service', title: 'Service Type', icon: ChefHat, required: true },
  { id: 'menu', title: 'Menu Selection', icon: UtensilsCrossed, required: false },
  { id: 'additional', title: 'Additional Info', icon: FileText, required: false },
];

export const SinglePageQuoteForm = ({ variant = 'regular', onSuccess }: SinglePageQuoteFormProps) => {
  const [openSections, setOpenSections] = useState<string[]>(['contact-event']);
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedQuoteId, setSubmittedQuoteId] = useState<string | null>(null);
  const [eventData, setEventData] = useState<any>(null);
  const { toast } = useToast();
  const { trackFieldInteraction, trackFormSubmission } = useFormAnalytics({ 
    formType: variant === 'wedding' ? 'wedding_event' : 'regular_event' 
  });

  const getDefaultEventType = () => {
    return variant === 'wedding' ? 'wedding' : 'birthday';
  };

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    defaultValues: {
      contact_name: "",
      email: "",
      phone: "",
      event_name: "",
      event_type: getDefaultEventType(),
      event_date: "",
      start_time: "",
      guest_count: 1,
      location: "",
      service_type: '' as any,
      serving_start_time: "",
      primary_protein: [],
      secondary_protein: [],
      both_proteins_available: false,
      appetizers: [],
      sides: [],
      desserts: [],
      drinks: [],
      dietary_restrictions: [],
      guest_count_with_restrictions: "",
      custom_menu_requests: "",
      plates_requested: false,
      cups_requested: false,
      napkins_requested: false,
      serving_utensils_requested: false,
      chafers_requested: false,
      ice_requested: false,
      utensils: [],
      extras: [],
      separate_serving_area: false,
      serving_setup_area: "",
      bussing_tables_needed: false,
      special_requests: "",
      referral_source: undefined,
      theme_colors: "",
    },
  });

  // Check if a section is complete
  const checkSectionCompletion = useCallback(async (sectionId: string): Promise<boolean> => {
    let fields: (keyof FormData)[] = [];
    
    switch (sectionId) {
      case 'contact-event':
        fields = ['contact_name', 'email', 'phone', 'event_name', 'event_type', 'event_date', 'start_time', 'guest_count', 'location'];
        break;
      case 'service':
        fields = ['service_type'];
        break;
      case 'menu':
      case 'additional':
        return true; // Optional sections
      default:
        return false;
    }

    const isValid = await form.trigger(fields);
    return isValid;
  }, [form]);

  // Auto-expand next section when current is completed
  useEffect(() => {
    const subscription = form.watch(async (value, { name }) => {
      if (!name) return;

      // Determine which section the changed field belongs to
      let currentSection = '';
      if (['contact_name', 'email', 'phone', 'event_name', 'event_type', 'event_date', 'start_time', 'guest_count', 'location'].includes(name)) {
        currentSection = 'contact-event';
      } else if (name === 'service_type') {
        currentSection = 'service';
      }

      if (currentSection) {
        const isComplete = await checkSectionCompletion(currentSection);
        
        if (isComplete) {
          // Mark section as complete
          setCompletedSections(prev => new Set(prev).add(currentSection));
          
          // Auto-expand next section
          const currentIndex = SECTIONS.findIndex(s => s.id === currentSection);
          if (currentIndex >= 0 && currentIndex < SECTIONS.length - 1) {
            const nextSection = SECTIONS[currentIndex + 1].id;
            if (!openSections.includes(nextSection)) {
              setOpenSections(prev => [...prev, nextSection]);
            }
          }
        } else {
          // Remove from completed if no longer valid
          setCompletedSections(prev => {
            const newSet = new Set(prev);
            newSet.delete(currentSection);
            return newSet;
          });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form, checkSectionCompletion, openSections]);

  const onSubmit = async (data: FormData) => {
    if (isSubmitting) return;
    
    const validationResult = await form.trigger();
    const errors = form.formState.errors;
    
    if (Object.keys(errors).length > 0 || !validationResult) {
      toast({
        title: "Please Fix Form Errors",
        description: "Some required fields are missing or invalid.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const insertPayload = {
        contact_name: formatCustomerName(data.contact_name),
        email: data.email,
        phone: data.phone,
        event_name: formatEventName(data.event_name),
        event_type: data.event_type as any,
        event_date: data.event_date,
        start_time: data.start_time,
        guest_count: data.guest_count,
        location: formatLocation(data.location),
        service_type: data.service_type,
        serving_start_time: data.serving_start_time || null,
        primary_protein: data.primary_protein.join(', '),
        secondary_protein: data.secondary_protein.join(', '),
        both_proteins_available: data.both_proteins_available,
        appetizers: data.appetizers || [],
        sides: data.sides || [],
        desserts: data.desserts || [],
        drinks: data.drinks || [],
        dietary_restrictions: data.dietary_restrictions || [],
        guest_count_with_restrictions: data.guest_count_with_restrictions,
        custom_menu_requests: data.custom_menu_requests,
        plates_requested: data.plates_requested,
        cups_requested: data.cups_requested,
        napkins_requested: data.napkins_requested,
        serving_utensils_requested: data.serving_utensils_requested,
        chafers_requested: data.chafers_requested,
        ice_requested: data.ice_requested,
        utensils: data.utensils || [],
        extras: data.extras || [],
        separate_serving_area: data.separate_serving_area,
        serving_setup_area: data.serving_setup_area,
        bussing_tables_needed: data.bussing_tables_needed,
        special_requests: data.special_requests,
        referral_source: data.referral_source,
        theme_colors: data.theme_colors,
        ceremony_included: data.ceremony_included,
        cocktail_hour: data.cocktail_hour,
        workflow_status: 'pending' as const
      };
      
      const { data: insertedData, error } = await supabase
        .from('quote_requests')
        .insert([insertPayload])
        .select();

      if (error) throw error;
      
      const quoteId = insertedData?.[0]?.id;
      setSubmittedQuoteId(quoteId);
      
      setEventData({
        eventName: data.event_name,
        eventDate: data.event_date,
        startTime: data.start_time,
        location: data.location,
        contactName: data.contact_name
      });
      
      await trackFormSubmission(quoteId);
      
      toast({
        title: "Quote Saved Successfully!",
        description: "Your quote request has been saved. Sending notifications...",
      });

      // Send confirmation email
      try {
        await supabase.functions.invoke('send-quote-confirmation', {
          body: { quote_id: quoteId }
        });
      } catch (emailError) {
        console.error('Confirmation email failed:', emailError);
      }

      // Send notification email
      try {
        await supabase.functions.invoke('send-quote-notification', {
          body: { ...data, quote_id: quoteId }
        });
      } catch (emailError) {
        console.error('Notification email failed:', emailError);
      }

      setIsSubmitted(true);
      
      if (onSuccess) {
        onSuccess(quoteId);
      }
      
      toast({
        title: "✅ Quote Request Submitted!",
        description: "We'll respond within 48 hours. Check your email for confirmation.",
      });
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Please try again or contact us at (843) 970-0265.",
        variant: "destructive",
      });
      setIsSubmitted(false);
      setSubmittedQuoteId(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return <SuccessStep estimatedCost={null} quoteId={submittedQuoteId} eventData={eventData} />;
  }

  const progress = (completedSections.size / SECTIONS.filter(s => s.required).length) * 100;

  return (
    <div className="space-y-6">
      <FormProgressBar 
        progress={progress} 
        completedCount={completedSections.size}
        totalCount={SECTIONS.filter(s => s.required).length}
      />

      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Accordion 
            type="multiple" 
            value={openSections} 
            onValueChange={setOpenSections}
            className="space-y-4"
          >
            {/* Event & Contact Information Section */}
            <AccordionItem value="contact-event" className="neumorphic-card-2-static border-0 rounded-xl overflow-hidden bg-card/50 backdrop-blur-sm">
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <FormSectionHeader
                    icon={Calendar}
                    title="Event & Contact Information"
                    isComplete={completedSections.has('contact-event')}
                    isRequired
                  />
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <ContactAndEventStep form={form} trackFieldInteraction={trackFieldInteraction} variant={variant} />
                </AccordionContent>
              </AccordionItem>

              {/* Service Selection Section */}
              <AccordionItem value="service" className="neumorphic-card-2-static border-0 rounded-xl overflow-hidden bg-card/50 backdrop-blur-sm">
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <FormSectionHeader
                    icon={ChefHat}
                    title="Service Type"
                    isComplete={completedSections.has('service')}
                    isRequired
                  />
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <ServiceSelectionStep form={form} trackFieldInteraction={trackFieldInteraction} />
                </AccordionContent>
              </AccordionItem>

              {/* Menu Selection Section */}
              <AccordionItem value="menu" className="neumorphic-card-2-static border-0 rounded-xl overflow-hidden bg-card/50 backdrop-blur-sm">
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <FormSectionHeader
                    icon={UtensilsCrossed}
                    title="Menu Selection"
                    isComplete={completedSections.has('menu')}
                    isRequired={false}
                  />
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <MenuSelectionStep form={form} trackFieldInteraction={trackFieldInteraction} variant={variant} />
                </AccordionContent>
              </AccordionItem>

              {/* Additional Info Section */}
              <AccordionItem value="additional" className="neumorphic-card-2-static border-0 rounded-xl overflow-hidden bg-card/50 backdrop-blur-sm">
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <FormSectionHeader
                    icon={FileText}
                    title="Additional Information"
                    isComplete={completedSections.has('additional')}
                    isRequired={false}
                  />
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <FinalStep form={form} variant={variant} />
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Review Summary */}
            <ReviewSummaryCard form={form} variant={variant} />

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <Button
                type="submit"
                disabled={isSubmitting || completedSections.size < SECTIONS.filter(s => s.required).length}
                className="gap-2 min-w-[280px] h-14 text-lg bg-gradient-primary hover:opacity-90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Submitting Your Request...
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5" />
                    Submit Quote Request
                  </>
                )}
              </Button>
            </div>
        </form>
      </FormProvider>
    </div>
  );
};
