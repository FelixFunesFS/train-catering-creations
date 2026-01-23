import { useState, useCallback, useEffect, useRef } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { ContactInfoStep } from "./steps/ContactInfoStep";
import { EventDetailsStep } from "./steps/EventDetailsStep";
import { ServiceSelectionStep } from "./alternative-form/ServiceSelectionStep";
import { MenuSelectionStep } from "./alternative-form/MenuSelectionStep";
import { SuppliesStep } from "./steps/SuppliesStep";
import { StepProgress } from "./StepProgress";
import { StepNavigation } from "./StepNavigation";
import { ReviewSummaryCard } from "./ReviewSummaryCard";
import { User, Calendar, ChefHat, UtensilsCrossed, Package, ClipboardCheck } from "lucide-react";
import { formSchema } from "./alternative-form/formSchema";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useFormAnalytics } from "@/hooks/useFormAnalytics";
import { formatCustomerName, formatEventName, formatLocation } from "@/utils/textFormatters";
import { cn } from "@/lib/utils";
import { useLocation, useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

type FormData = z.infer<typeof formSchema>;

interface SinglePageQuoteFormProps {
  variant?: 'regular' | 'wedding';
  onSuccess?: (quoteId: string) => void;
  /**
   * fullscreen: mobile wizard with internal scroll + sticky progress/nav
   * embedded: desktop-in-page (no internal scroll, no sticky bars)
   */
  layout?: 'fullscreen' | 'embedded';
  /**
   * container: scroll the form's internal containerRef
   * window: scroll the page to scrollToRef
   */
  scrollMode?: 'container' | 'window';
  scrollToRef?: React.RefObject<HTMLElement>;
}

const STEPS = [
  { id: 'contact', title: 'Contact Info', icon: User, required: true, fields: ['contact_name', 'email', 'phone'] },
  { id: 'event', title: 'Event Details', icon: Calendar, required: true, fields: ['event_name', 'event_type', 'event_date', 'start_time', 'guest_count', 'location'] },
  { id: 'service', title: 'Service Type', icon: ChefHat, required: true, fields: ['service_type'] },
  { id: 'menu', title: 'Menu Selection', icon: UtensilsCrossed, required: false, fields: ['proteins', 'sides'] },
  { id: 'supplies', title: 'Supplies & Details', icon: Package, required: false, fields: [] },
  { id: 'review', title: 'Review & Submit', icon: ClipboardCheck, required: false, fields: [] },
];

export const SinglePageQuoteForm = ({
  variant = 'regular',
  onSuccess,
  layout = 'fullscreen',
  scrollMode = 'container',
  scrollToRef,
}: SinglePageQuoteFormProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { trackFieldInteraction, trackFormSubmission } = useFormAnalytics({ 
    formType: variant === 'wedding' ? 'wedding_event' : 'regular_event' 
  });

  const returnTo = useCallback(() => {
    const params = new URLSearchParams(location.search);
    const v = params.get('returnTo');
    return v && v.startsWith('/') ? v : '/request-quote';
  }, [location.search]);

  const scrollToTop = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (scrollMode === 'window') {
      if (scrollToRef?.current) {
        scrollToRef.current.scrollIntoView({ behavior, block: 'start' });
        return;
      }
      window.scrollTo({ top: 0, behavior });
      return;
    }

    containerRef.current?.scrollTo({ top: 0, behavior });
  }, [scrollMode, scrollToRef]);

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
      service_type: undefined,
      serving_start_time: "",
      proteins: [],
      both_proteins_available: false,
      appetizers: [],
      sides: [],
      desserts: [],
      drinks: [],
      dietary_restrictions: [],
      vegetarian_entrees: [],
      guest_count_with_restrictions: "",
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

  const focusFirstInvalidFieldInStep = useCallback(() => {
    const step = STEPS[currentStep];
    if (!step?.fields?.length) return;

    const errors = form.formState.errors;
    const firstInvalid = step.fields.find((f) => !!errors[f as keyof typeof errors]);
    if (!firstInvalid) return;

    form.setFocus(firstInvalid as any);
  }, [currentStep, form]);

  // Check if current step is valid
  const validateCurrentStep = useCallback(async (): Promise<boolean> => {
    const step = STEPS[currentStep];
    if (!step.required && step.fields.length === 0) return true;
    if (step.fields.length === 0) return true;
    
    const isValid = await form.trigger(step.fields as (keyof FormData)[]);
    return isValid;
  }, [currentStep, form]);

  // Check if step can proceed (has valid data or is optional)
  const canProceed = useCallback((): boolean => {
    const step = STEPS[currentStep];
    if (!step.required) return true;
    
    const values = form.getValues();
    return step.fields.every(field => {
      const value = values[field as keyof FormData];
      if (typeof value === 'string') return value.trim().length > 0;
      if (typeof value === 'number') return value > 0;
      if (Array.isArray(value)) return true; // Arrays are optional
      return !!value;
    });
  }, [currentStep, form]);

  // Navigate to next step
  const handleNext = useCallback(async () => {
    if (isAnimating) return;
    
    const isValid = await validateCurrentStep();
    if (!isValid && STEPS[currentStep].required) {
      toast({
        title: "Please complete this step",
        description: "Fill in all required fields before continuing.",
        variant: "destructive",
      });

      // Ensure the user sees the top of the step + focus the first invalid field.
      requestAnimationFrame(() => {
        scrollToTop('smooth');
        focusFirstInvalidFieldInStep();
      });
      return;
    }

    if (currentStep < STEPS.length - 1) {
      setDirection('forward');
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsAnimating(false);
        requestAnimationFrame(() => scrollToTop('smooth'));
      }, 200);
    }
  }, [currentStep, isAnimating, validateCurrentStep, toast, scrollToTop, focusFirstInvalidFieldInStep]);

  // Navigate to previous step
  const handleBack = useCallback(() => {
    if (isAnimating || currentStep === 0) return;
    
    setDirection('backward');
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(prev => prev - 1);
      setIsAnimating(false);
      requestAnimationFrame(() => scrollToTop('smooth'));
    }, 200);
  }, [currentStep, isAnimating, scrollToTop]);

  // When embedded, ensure the initial mount starts at the form top.
  useEffect(() => {
    if (layout === 'embedded') {
      requestAnimationFrame(() => scrollToTop('auto'));
    }
  }, [layout, scrollToTop]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement) return;
      if (e.target instanceof HTMLInputElement && e.target.type !== 'checkbox') {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleNext();
        }
        return;
      }
      
      if (e.key === 'Enter') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handleBack]);

  const onSubmit = async () => {
    if (isSubmitting) return;
    
    const data = form.getValues();
    const validationResult = await form.trigger();
    const errors = form.formState.errors;
    
    // Only check required fields
    const requiredFields = ['contact_name', 'email', 'phone', 'event_name', 'event_type', 'event_date', 'start_time', 'guest_count', 'location', 'service_type'];
    const hasRequiredErrors = requiredFields.some(field => errors[field as keyof typeof errors]);
    
    if (hasRequiredErrors) {
      toast({
        title: "Please Fix Form Errors",
        description: "Some required fields are missing or invalid.",
        variant: "destructive",
      });

      requestAnimationFrame(() => {
        scrollToTop('smooth');
        focusFirstInvalidFieldInStep();
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const submitPayload = {
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
        proteins: data.proteins || [],
        both_proteins_available: data.both_proteins_available,
        appetizers: data.appetizers || [],
        sides: data.sides || [],
        desserts: data.desserts || [],
        drinks: data.drinks || [],
        dietary_restrictions: data.dietary_restrictions || [],
        vegetarian_entrees: data.vegetarian_entrees || [],
        guest_count_with_restrictions: data.guest_count_with_restrictions,
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
      };
      
      // Use edge function to bypass RLS for public form submissions
      const { data: result, error } = await supabase.functions.invoke('submit-quote-request', {
        body: submitPayload
      });

      if (error) throw error;
      if (!result?.success) throw new Error(result?.error || 'Submission failed');
      
      const quoteId = result.quote_id;

      // Persist event data for the Thank You page (calendar/share actions)
      sessionStorage.setItem(
        "quote_thankyou_eventData",
        JSON.stringify({
          eventName: data.event_name,
          eventDate: data.event_date,
          startTime: data.start_time,
          location: data.location,
          contactName: data.contact_name,
        })
      );
      
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

      if (onSuccess) {
        onSuccess(quoteId);
      }
      
      toast({
        title: "✅ Quote Request Submitted!",
        description: "We'll respond within 48 hours. Check your email for confirmation.",
      });

      // Restore full-site chrome by redirecting to the Thank You page
      navigate(`/request-quote/thank-you?quoteId=${encodeURIComponent(quoteId)}`, { replace: true });
    } catch (error: any) {
      console.error('Form submission error:', error);
      const errorMessage = error?.message || error?.details || error?.hint || 
        (typeof error === 'string' ? error : 'Unknown error');
      toast({
        title: "Submission Failed",
        description: `${errorMessage}. Please try again or contact us at (843) 970-0265.`,
        variant: "destructive",
      });
      sessionStorage.removeItem("quote_thankyou_eventData");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    const animationClass = isAnimating
      ? direction === 'forward'
        ? 'animate-slide-out-left'
        : 'animate-slide-out-right'
      : direction === 'forward'
        ? 'animate-slide-in-right'
        : 'animate-slide-in-left';

    const content = (() => {
      switch (currentStep) {
        case 0:
          return <ContactInfoStep form={form} trackFieldInteraction={trackFieldInteraction} />;
        case 1:
          return <EventDetailsStep form={form} trackFieldInteraction={trackFieldInteraction} variant={variant} />;
        case 2:
          return (
            <div className="w-full max-w-lg mx-auto">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <ChefHat className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-elegant font-semibold">Choose your service type</h2>
                <p className="text-muted-foreground mt-2">Select how you'd like us to cater your event</p>
              </div>
              <ServiceSelectionStep form={form} trackFieldInteraction={trackFieldInteraction} />
            </div>
          );
        case 3:
          return (
            <div className="w-full max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <UtensilsCrossed className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-elegant font-semibold">Build your menu</h2>
                <p className="text-muted-foreground mt-2">Select proteins, sides, and extras for your guests</p>
              </div>
              <MenuSelectionStep form={form} trackFieldInteraction={trackFieldInteraction} variant={variant} />
            </div>
          );
        case 4:
          return <SuppliesStep form={form} variant={variant} />;
        case 5:
          return (
            <div className="w-full max-w-lg mx-auto">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <ClipboardCheck className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-elegant font-semibold">Review your request</h2>
                <p className="text-muted-foreground mt-2">Make sure everything looks good before submitting</p>
              </div>
              <ReviewSummaryCard form={form} variant={variant} />
            </div>
          );
        default:
          return null;
      }
    })();

    return (
      <div 
        key={currentStep}
        className={cn("w-full", animationClass)}
      >
        {content}
      </div>
    );
  };

  return (
    <div className={cn(layout === 'fullscreen' ? "min-h-screen flex flex-col" : "w-full")}>      
      {/* Mobile Exit Bar (only for fullscreen mobile wizard) */}
      {layout === 'fullscreen' && isMobile && (
        <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => navigate(returnTo())}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Exit
            </Button>
            <div className="text-sm font-medium text-foreground">
              {variant === 'wedding' ? 'Wedding Quote' : 'Event Quote'}
            </div>
            <div className="w-[64px]" />
          </div>
        </div>
      )}

      {/* Progress */}
      <div className={cn(
        layout === 'fullscreen'
          ? "sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-4 border-b"
          : "bg-background/95 backdrop-blur-sm py-4 border-b rounded-lg"
      )}>
        <div className="max-w-2xl mx-auto px-4">
          <StepProgress
            currentStep={currentStep}
            totalSteps={STEPS.length}
            stepTitles={STEPS.map(s => s.title)}
          />
        </div>
      </div>

      {/* Step Content */}
      <div
        ref={containerRef}
        className={cn(
          layout === 'fullscreen'
            ? "flex-1 min-h-0 overflow-y-auto py-8 px-4"
            : "py-8 px-4"
        )}
      >
        <FormProvider {...form}>
          <Form {...form}>
            <form onSubmit={(e) => e.preventDefault()} className={cn(layout === 'fullscreen' ? "min-h-full flex flex-col" : "")}>              
              <div className={cn(layout === 'fullscreen' ? "flex-1 flex items-start justify-center" : "flex items-start justify-center")}>                
                {renderStep()}
              </div>
            </form>
          </Form>
        </FormProvider>
      </div>

      {/* Navigation */}
      <div className={cn(
        layout === 'fullscreen'
          ? "sticky bottom-0 z-10 bg-background/95 backdrop-blur-sm py-4 px-4 border-t"
          : "bg-background/95 backdrop-blur-sm py-4 px-4 border-t rounded-lg"
      )}>
        <StepNavigation
          currentStep={currentStep}
          totalSteps={STEPS.length}
          onNext={handleNext}
          onBack={handleBack}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          canProceed={canProceed()}
          isOptionalStep={!STEPS[currentStep].required}
        />
      </div>
    </div>
  );
};
