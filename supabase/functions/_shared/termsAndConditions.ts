/**
 * SINGLE SOURCE OF TRUTH: Catering Agreement Terms & Conditions
 * 
 * This file is the canonical source for all terms displayed to customers.
 * All edge functions and frontend components should use these terms.
 * 
 * Keep in sync with:
 * - src/hooks/useCateringAgreement.ts (frontend fallback - should match DEFAULT_TERMS)
 * - src/components/shared/StandardTermsAndConditions.tsx (frontend display)
 */

export interface TermsSection {
  title: string;
  description?: string;
  items?: string[];
}

export interface CateringTerms {
  agreement_title: string;
  intro_text: string;
  sections: TermsSection[];
  acceptance_text: string;
  closing_text: string;
  owner_signature: {
    name: string;
    title: string;
  };
}

export const DEFAULT_TERMS: CateringTerms = {
  agreement_title: "Catering Services Agreement",
  intro_text: "This Catering Services Agreement (\"Agreement\") is entered into by and between Soul Train's Eatery (\"Caterer\") and the undersigned client (\"Client\"). By approving this estimate, you agree to the following terms and conditions:",
  sections: [
    {
      title: "Booking & Payments",
      items: [
        "A non-refundable deposit of 10% is required to secure your event date in our calendar. This deposit will be credited towards your final payment.",
        "50% of the total (including deposit) is required no later than 30 days prior to event date.",
        "The remaining balance (50%) is due no later than 14 days prior to the event date.",
        "Accepted payment methods: Credit/Debit Card, ACH Bank Transfer, Check, Cash.",
        "A 3% processing fee applies to credit card payments over $1,000."
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
      title: "Guest Count & Menu Changes",
      items: [
        "Please notify us promptly of any changes in guest count to facilitate necessary adjustments.",
        "Final guest count must be confirmed 7 days before the event.",
        "Guest count increases may be accommodated based on availability (additional charges apply).",
        "Menu changes must be requested at least 7 days before the event."
      ]
    },
    {
      title: "Service Window & Timing",
      items: [
        "If there is a delay in the start time of the event, the service duration will commence as per the time stipulated in this Agreement.",
        "A service window of 3 hours, inclusive of set-up and breakdown, applies for events with fewer than 400 guests.",
        "Extended service beyond the 3-hour window may incur a charge of $100 per additional hour."
      ]
    },
    {
      title: "Cancellation Policy",
      items: [
        "Cancellations more than 14 days before event: Deposit forfeited only.",
        "Cancellations 8-14 days before event: 50% of total amount forfeited.",
        "Cancellations within 7 days of event: 100% of total amount forfeited.",
        "Rescheduling requests must be made at least 14 days in advance.",
        "One complimentary reschedule allowed per booking (subject to availability)."
      ]
    },
    {
      title: "Customization",
      description: "We understand that every event is unique. If there are any provisions in this Agreement that do not suit your requirements, please communicate with us to tailor our services to make your event special. We are committed to ensuring your satisfaction."
    }
  ],
  acceptance_text: "By approving this estimate, you acknowledge and agree to the terms set out in this Agreement.",
  closing_text: "Thank you for choosing Soul Train's Eatery. We look forward to serving you!",
  owner_signature: {
    name: "Dominick Ward",
    title: "Owner, Soul Train's Eatery"
  }
};

/**
 * Get government-specific additional terms
 */
export function getGovernmentTerms(): TermsSection {
  return {
    title: "Government Contract Terms",
    items: [
      "Payment terms: Net 30 days after event completion.",
      "No deposit required for government contracts.",
      "Tax-exempt status honored with valid documentation.",
      "Purchase Order (PO) number required for invoicing."
    ]
  };
}

/**
 * Get all terms sections, optionally including government terms
 */
export function getTermsSections(isGovernment: boolean = false): TermsSection[] {
  const sections = [...DEFAULT_TERMS.sections];
  if (isGovernment) {
    sections.push(getGovernmentTerms());
  }
  return sections;
}

/**
 * Get a brief summary of key terms for email display
 */
export function getTermsSummary(): string[] {
  return [
    "10% non-refundable deposit secures your date",
    "50% of total (including deposit) due 30 days before event — an additional 40% payment",
    "Remaining balance (50%) due 14 days before event",
    "Cancellation within 7 days forfeits full amount"
  ];
}

/**
 * Generate HTML for terms summary in emails
 */
export function generateTermsSummaryHTML(portalUrl?: string): string {
  const summaryPoints = getTermsSummary();
  
  return `
    <div style="margin-top: 20px; padding: 16px; background-color: #f8f9fa; border-radius: 8px; border-left: 4px solid #DC143C;">
      <h4 style="margin: 0 0 12px 0; font-size: 14px; color: #333;">📋 Key Terms Summary</h4>
      <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #555; line-height: 1.6;">
        ${summaryPoints.map(point => `<li>${point}</li>`).join('')}
      </ul>
      ${portalUrl ? `
      <p style="margin: 12px 0 0 0; font-size: 12px; color: #666;">
        <a href="${portalUrl}" style="color: #DC143C; text-decoration: underline;">View full Terms & Conditions in your portal</a>
      </p>
      ` : ''}
    </div>
  `;
}

/**
 * Generate full terms for PDF - returns array of sections with title and items
 */
export function getTermsForPDF(isGovernment: boolean = false): { title: string; items: string[] }[] {
  const sections = getTermsSections(isGovernment);
  
  return sections.map(section => ({
    title: section.title.toUpperCase(),
    items: section.items || (section.description ? [section.description] : [])
  }));
}
