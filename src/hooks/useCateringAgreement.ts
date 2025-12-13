import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CateringAgreementSection {
  title: string;
  description?: string;
  items?: string[];
}

export interface CateringAgreementTerms {
  agreement_title: string;
  intro_text: string;
  sections: CateringAgreementSection[];
  acceptance_text: string;
  closing_text: string;
  owner_signature: {
    name: string;
    title: string;
  };
}

// Default terms in case database fetch fails
const DEFAULT_TERMS: CateringAgreementTerms = {
  agreement_title: "Catering Services Agreement",
  intro_text: "This Catering Services Agreement (\"Agreement\") is entered into by and between Soul Train's Eatery (\"Caterer\") and the undersigned client (\"Client\"). By engaging the services of the Caterer, you agree to the following terms and conditions:",
  sections: [
    {
      title: "Booking and Payments",
      items: [
        "A non-refundable deposit of 10% is required to secure your event date in our calendar. This deposit will be credited towards your final payment.",
        "50% Required no later than 30 days prior to event date.",
        "The final payment is due no later than 14 days prior to the event date."
      ]
    },
    {
      title: "Services",
      description: "The Caterer shall ensure the following:",
      items: [
        "The provision of fresh food maintained at appropriate temperatures.",
        "If applicable, the setting up of a buffet line and service to all guests until everyone has had the opportunity to dine.",
        "A clean-up of the buffet/food area after service.",
        "For drop-off and set-up services, delivery and arrangement of items at the correct temperatures."
      ]
    },
    {
      title: "Adjustments",
      items: [
        "Please notify us promptly of any changes in guest count to facilitate necessary adjustments.",
        "If there is a delay in the start time of the event, the service duration will commence as per the time stipulated in this Agreement.",
        "A service window of 3 hours, inclusive of set-up and breakdown, applies for events with fewer than 400 guests.",
        "Extended service beyond the 3-hour window may incur a charge of $100 per additional hour."
      ]
    },
    {
      title: "Customization",
      description: "We understand that every event is unique. If there are any provisions in this Agreement that do not suit your requirements, please communicate with us to tailor our services to make your event special. We are committed to ensuring your satisfaction."
    }
  ],
  acceptance_text: "By making the required deposit, you acknowledge and agree to the terms set out in this Agreement.",
  closing_text: "Thank you for choosing Soul Train's Eatery. We look forward to serving you!!",
  owner_signature: {
    name: "Dominick Ward",
    title: "Owner, Soul Train's Eatery"
  }
};

export function useCateringAgreement() {
  return useQuery({
    queryKey: ['catering-agreement-terms'],
    queryFn: async (): Promise<CateringAgreementTerms> => {
      const { data, error } = await supabase
        .from('business_config')
        .select('config_value')
        .eq('config_key', 'catering_agreement_terms')
        .maybeSingle();
      
      if (error || !data) {
        console.warn('Using default catering agreement terms:', error?.message);
        return DEFAULT_TERMS;
      }
      
      return data.config_value as unknown as CateringAgreementTerms;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

// Export default terms for use in edge functions
export { DEFAULT_TERMS };
