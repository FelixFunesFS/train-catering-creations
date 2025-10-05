import { useState, useCallback, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Form } from "@/components/ui/form";
import { ContactStep } from "./alternative-form/ContactStep";
import { EventDetailsStep } from "./alternative-form/EventDetailsStep";
import { ServiceSelectionStep } from "./alternative-form/ServiceSelectionStep";
import { MenuSelectionStep } from "./alternative-form/MenuSelectionStep";
import { ReviewStep } from "./alternative-form/ReviewStep";
import { SuccessStep } from "./alternative-form/SuccessStep";
import { FinalStep } from "./alternative-form/FinalStep";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { ArrowLeft, ArrowRight, Check, Sparkles, Loader2 } from "lucide-react";
import { formSchema } from "./alternative-form/formSchema";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useFormAnalytics } from "@/hooks/useFormAnalytics";
import { formatCustomerName, formatEventName, formatLocation } from "@/utils/textFormatters";

type FormData = z.infer<typeof formSchema>;

const STEPS = [
  { id: 'contact', title: 'Contact', description: 'Your details' },
  { id: 'event', title: 'Event', description: 'Date & type' },
  { id: 'service', title: 'Service', description: 'How we help' },
  { id: 'menu', title: 'Menu', description: 'Perfect selections' },
  { id: 'final', title: 'Final', description: 'Additional info' },
  { id: 'review', title: 'Review', description: 'Final check' },
];

export const AlternativeQuoteForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedQuoteId, setSubmittedQuoteId] = useState<string | null>(null);
  const [isReadyToSubmit, setIsReadyToSubmit] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [eventData, setEventData] = useState<any>(null);
  const { toast } = useToast();
  const { trackFieldInteraction, trackFormSubmission } = useFormAnalytics({ formType: 'regular_event' });

  const { ref: formRef, isVisible: formVisible } = useScrollAnimation({
    threshold: 0.1,
    triggerOnce: true
  });

  const formAnimationClass = useAnimationClass('scale-fade', formVisible);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contact_name: "",
      email: "",
      phone: "",
      event_name: "",
      event_type: "birthday",
      event_date: "",
      start_time: "",
      guest_count: 1,
      location: "",
      service_type: undefined,
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
      tables_chairs_requested: false,
      linens_requested: false,
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

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const handleNext = async () => {
    const currentStepData = getCurrentStepData();
    const isValid = await form.trigger(currentStepData);
    
    if (isValid) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      
      if (currentStep < STEPS.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    if (stepIndex <= Math.max(...completedSteps, currentStep)) {
      setCurrentStep(stepIndex);
    }
  };

  const getCurrentStepData = (): (keyof FormData)[] => {
    switch (currentStep) {
      case 0:
        return ['contact_name', 'email', 'phone'];
      case 1:
        return ['event_name', 'event_type', 'event_date', 'start_time', 'guest_count', 'location'];
      case 2:
        return ['service_type'];
      case 3:
        return []; // Menu step - selections are optional
      case 4:
        return []; // Final step - additional info is optional
      case 5:
        return ['contact_name', 'email', 'phone', 'event_name', 'event_type', 'event_date', 'start_time', 'guest_count', 'location', 'service_type']; // Review step - validate all required fields
      default:
        return [];
    }
  };

  const onSubmit = async (data: FormData) => {
    console.log('🚀 onSubmit called with currentStep:', currentStep, 'isReadyToSubmit:', isReadyToSubmit);
    
    // Multiple layers of protection against unwanted submission
    if (currentStep !== STEPS.length - 1) {
      console.log('🚫 GUARD 1: Blocking submission - not on review step. Current step:', currentStep);
      return;
    }
    
    if (!isReadyToSubmit) {
      console.log('🚫 GUARD 2: Blocking submission - not ready to submit');
      return;
    }
    
    if (isSubmitting) {
      console.log('🚫 GUARD 3: Blocking submission - already submitting');
      return;
    }
    
    console.log('🚀 === FORM SUBMISSION STARTED ===');
    console.log('📋 Form data:', data);
    console.log('🚨 Form errors:', form.formState.errors);
    console.log('✅ Form is valid:', form.formState.isValid);
    console.log('🔍 Current step:', currentStep);
    console.log('💎 Service type value:', data.service_type);
    
    // Manual validation trigger to ensure we catch all errors
    const validationResult = await form.trigger();
    console.log('🔍 Manual validation result:', validationResult);
    
    // Check for validation errors
    const errors = form.formState.errors;
    if (Object.keys(errors).length > 0) {
      console.error('❌ Form validation errors:', errors);
      toast({
        title: "Please Fix Form Errors",
        description: "Some required fields are missing or invalid. Please check your form.",
        variant: "destructive",
      });
      return;
    }

    if (!validationResult) {
      console.error('❌ Form validation failed');
      toast({
        title: "Form Validation Failed",
        description: "Please check all required fields and try again.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('💾 Preparing database insertion...');
      console.log('🔗 Supabase client status:', !!supabase);
      
      // Insert into database with correct field mapping
      const insertPayload = {
        contact_name: formatCustomerName(data.contact_name),
        email: data.email,
        phone: data.phone,
        event_name: formatEventName(data.event_name),
        event_type: data.event_type,
        event_date: data.event_date,
        start_time: data.start_time,
        guest_count: data.guest_count,
        location: formatLocation(data.location),
        service_type: data.service_type,
        serving_start_time: data.serving_start_time || null,
        // wait_staff_requested: data.wait_staff_requested,
        // wait_staff_requirements: data.wait_staff_requirements,
        // wait_staff_setup_areas: data.wait_staff_setup_areas,
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
        tables_chairs_requested: data.tables_chairs_requested,
        linens_requested: data.linens_requested,
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
        status: 'pending' as const
      };
      
      console.log('📝 Database insert payload:', insertPayload);
      
      const { data: insertedData, error } = await supabase.from('quote_requests').insert([insertPayload]).select();

      if (error) {
        console.error('❌ Database insertion error:', error);
        throw error;
      }
      
      const quoteId = insertedData?.[0]?.id;
      setSubmittedQuoteId(quoteId);
      console.log('✅ Quote inserted successfully with ID:', quoteId);
      console.log('📊 Inserted data:', insertedData);
      
      // Store event data for success page
      setEventData({
        eventName: data.event_name,
        eventDate: data.event_date,
        startTime: data.start_time,
        location: data.location,
        contactName: data.contact_name
      });
      
      // Track analytics
      await trackFormSubmission(quoteId);
      
      toast({
        title: "Quote Saved Successfully!",
        description: "Your quote request has been saved. Sending notifications...",
      });

      // Send confirmation email to customer
      console.log('📧 Sending confirmation email to customer...');
      try {
        const { error: confirmError } = await supabase.functions.invoke('send-quote-confirmation', {
          body: { quote_id: quoteId }
        });
        
        if (confirmError) {
          console.error('⚠️  Confirmation email failed:', confirmError);
        } else {
          console.log('✅ Confirmation email sent to customer');
        }
      } catch (emailError) {
        console.error('⚠️  Error sending confirmation email:', emailError);
      }

      // Send email notifications with retry logic
      let emailSuccess = false;
      const maxRetries = 3;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const emailPayload = { ...data, quote_id: quoteId };
          console.log(`📧 Sending email notification (attempt ${attempt})...`);
          console.log('📧 Email payload:', emailPayload);
          
          const { data: emailData, error: emailError } = await supabase.functions.invoke('send-quote-notification', {
            body: emailPayload
          });
          
          if (emailError) {
            console.error(`❌ Email error (attempt ${attempt}):`, emailError);
            throw emailError;
          }
          
          console.log('✅ Email notification sent successfully:', emailData);
          emailSuccess = true;
          break;
        } catch (emailError) {
          console.error(`❌ Email notification attempt ${attempt} failed:`, emailError);
          
          if (attempt === maxRetries) {
            // Final attempt failed - show warning but don't fail submission
            toast({
              title: "Quote submitted successfully!",
              description: "However, email confirmation may be delayed. We'll contact you within 48 hours.",
            });
          } else {
            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
          }
        }
      }

      setIsSubmitted(true);
      
      if (emailSuccess) {
        toast({
          title: "✅ Quote Request Submitted!",
          description: "We'll respond within 48 hours. Check your email for confirmation.",
        });
      }
    } catch (error) {
      console.error('❌ Fatal error during form submission:', error);
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Please try again or contact us at (843) 970-0265.",
        variant: "destructive",
      });
      // Reset submission state on error
      setIsSubmitted(false);
      setSubmittedQuoteId(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return <SuccessStep estimatedCost={null} quoteId={submittedQuoteId} eventData={eventData} />;
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <ContactStep form={form} trackFieldInteraction={trackFieldInteraction} />;
      case 1:
        return <EventDetailsStep form={form} trackFieldInteraction={trackFieldInteraction} />;
      case 2:
        return <ServiceSelectionStep form={form} trackFieldInteraction={trackFieldInteraction} />;
      case 3:
        return <MenuSelectionStep form={form} trackFieldInteraction={trackFieldInteraction} />;
      case 4:
        return <FinalStep form={form} />;
      case 5:
        return <ReviewStep form={form} estimatedCost={null} />;
      default:
        return null;
    }
  };

  return (
    <div ref={formRef} className={`space-y-8 ${formAnimationClass}`}>
      {/* Progress Header */}
      <Card className="neumorphic-card-1 border-0 bg-gradient-to-r from-card/50 via-card to-card/50 backdrop-blur-sm">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg font-elegant">Smart Quote Builder</CardTitle>
                <p className="text-sm text-muted-foreground">Step {currentStep + 1} of {STEPS.length}</p>
              </div>
            </div>
          </div>
          
          <Progress value={progress} className="h-2 mb-4" />
          
          {/* Step Navigation */}
          <div className="flex justify-center">
            <div className="flex items-center gap-2 md:gap-4 overflow-x-auto pb-2">
              {STEPS.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => handleStepClick(index)}
                  disabled={index > Math.max(...completedSteps, currentStep)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-300 min-w-[80px] ${
                    index === currentStep
                      ? 'bg-primary/10 text-primary'
                      : completedSteps.includes(index)
                      ? 'bg-muted/50 text-foreground hover:bg-muted'
                      : 'text-muted-foreground opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index === currentStep
                      ? 'bg-primary text-primary-foreground'
                      : completedSteps.includes(index)
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {completedSteps.includes(index) ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-medium">{step.title}</div>
                    <div className="text-xs opacity-80 hidden md:block">{step.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Step Content */}
      <Card className="neumorphic-card-2 border-0 bg-gradient-to-br from-card via-card/95 to-muted/20">
        <CardContent className="p-6 md:p-8">
          <FormProvider {...form}>
            <form onSubmit={(e) => {
              console.log('🚨 Form onSubmit triggered:', { currentStep, isReadyToSubmit, isSubmitting });
              
              // Prevent all automatic form submissions
              e.preventDefault();
              e.stopPropagation();
              
              // Only allow manual submission on final step when ready
              if (currentStep !== STEPS.length - 1) {
                console.log('🚫 FORM GUARD: Preventing submission - not on final step');
                return false;
              }
              
              if (!isReadyToSubmit) {
                console.log('🚫 FORM GUARD: Preventing submission - not ready to submit');
                return false;
              }
              
              console.log('✅ Form submission allowed - calling handleSubmit');
              return form.handleSubmit(onSubmit)(e);
            }} className="space-y-8">
              {renderStepContent()}
            
            <Separator className="my-8" />
            
            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex items-center gap-2 neumorphic-button-secondary"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>
              
              {currentStep === STEPS.length - 1 ? (
                <div className="flex flex-col gap-3">
                  {!isReadyToSubmit ? (
                    <Button
                      type="button"
                      onClick={() => {
                        console.log('📋 User clicked "Review & Confirm" button');
                        setIsReadyToSubmit(true);
                      }}
                      className="flex items-center gap-2 neumorphic-button-primary bg-gradient-primary hover:shadow-glow transition-all duration-300"
                    >
                      Review & Confirm Quote Request
                      <Check className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => {
                        console.log('🚀 User clicked "Submit Quote Request" button');
                        if (isSubmitting) {
                          console.log('🚫 Already submitting, ignoring click');
                          return;
                        }
                        form.handleSubmit(onSubmit)();
                      }}
                      disabled={isSubmitting}
                      className="flex items-center gap-2 neumorphic-button-primary bg-gradient-primary hover:shadow-glow transition-all duration-300"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Submitting Your Quote...
                        </>
                      ) : (
                        <>
                          Submit Quote Request
                          <Sparkles className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  )}
                  {isReadyToSubmit && !isSubmitting && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        console.log('📝 User clicked "Edit Details" button');
                        setIsReadyToSubmit(false);
                      }}
                      className="text-xs"
                    >
                      Edit Details
                    </Button>
                  )}
                </div>
              ) : (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 neumorphic-button-primary"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  );
};

export { AlternativeQuoteForm as RegularEventQuoteForm };