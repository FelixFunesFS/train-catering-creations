/**
 * Brand Messaging Utilities for Soul Train's Eatery
 * 
 * Ensures consistent, warm Southern hospitality tone across all customer touchpoints
 */

export const BRAND_CONTACT = {
  phone: '(843) 970-0265',
  phoneRaw: '8439700265',
  email: 'soultrainseatery@gmail.com',
  name: "Soul Train's Eatery",
  tagline: "Charleston's Trusted Catering Partner",
  serviceArea: "Proudly serving Charleston's Lowcountry and surrounding areas"
} as const;

export const BRAND_SERVICES = [
  'Weddings',
  'Graduations', 
  'Military Functions & Ceremonies',
  'Corporate Events',
  'Social Gatherings'
] as const;

/**
 * Error messages with warm, helpful tone (no technical jargon)
 */
export const ERROR_MESSAGES = {
  general: `Oops! Something's not quite right. Give us a call at ${BRAND_CONTACT.phone} and we'll help you out.`,
  
  network: `We're having trouble connecting right now. Please check your internet and try again, or call us at ${BRAND_CONTACT.phone}.`,
  
  notFound: `We couldn't find what you're looking for. Let's get you sorted - reach out at ${BRAND_CONTACT.email}.`,
  
  accessDenied: `Hmm, we can't access that right now. Drop us a line at ${BRAND_CONTACT.email} and we'll help.`,
  
  expired: `This link has expired, but don't worry! Contact us at ${BRAND_CONTACT.phone} and we'll send you a fresh one.`,
  
  payment: `We had trouble processing that payment. Please try again or contact us at ${BRAND_CONTACT.phone} for assistance.`,
  
  validation: `Looks like we need a bit more information. Please check the form and try again.`,
  
  saveError: `We couldn't save those changes right now. Please try again in a moment.`
} as const;

/**
 * Success messages with enthusiasm and personality
 */
export const SUCCESS_MESSAGES = {
  quoteSent: "Great! Your quote request is on its way to us. We'll be in touch soon!",
  
  estimateApproved: "Wonderful! We're excited to help make your event special. Next step: let's talk payment details.",
  
  paymentReceived: "Thank you! Your payment has been received. We can't wait for your event!",
  
  changeRequested: "Got it! We've received your change request and will review it right away.",
  
  changeApproved: "Perfect! We've updated your estimate with the changes you requested.",
  
  contractSigned: "All set! Your contract is signed. Now let's get ready for an amazing event!",
  
  saveSuccess: "Great! Your changes have been saved.",
  
  emailSent: "Email sent! They should receive it shortly.",
  
  dataUpdated: "Perfect! Everything's been updated."
} as const;

/**
 * Loading messages with personality (instead of generic "Loading...")
 */
export const LOADING_MESSAGES = {
  fetchingEstimate: "Getting your estimate ready...",
  
  processingPayment: "Processing your payment securely...",
  
  savingChanges: "Saving your changes...",
  
  sendingEmail: "Sending your email...",
  
  generatingContract: "Preparing your contract...",
  
  loadingDetails: "Loading the details...",
  
  checkingStatus: "Checking the status..."
} as const;

/**
 * Customer portal welcome messages
 */
export const WELCOME_MESSAGES = {
  portal: `Welcome! We're excited to help make your event special.`,
  
  estimate: `Here's your personalized estimate. Take your time reviewing it, and let us know if you have any questions.`,
  
  contract: `Your contract is ready for review. Once you're happy with everything, we'll get you signed and scheduled.`,
  
  payment: `Let's get the payment details sorted. We offer flexible payment options to make this easy for you.`,
  
  dashboard: `Welcome back! Here's everything related to your upcoming event.`
} as const;

/**
 * Call-to-action messages (buttons, links)
 */
export const CTA_MESSAGES = {
  approveEstimate: "Yes, Let's Do This!",
  
  requestChanges: "Request Changes",
  
  makePayment: "Proceed to Payment",
  
  signContract: "Sign Contract",
  
  contactUs: "Get in Touch",
  
  viewEstimate: "View Your Estimate",
  
  downloadInvoice: "Download Invoice",
  
  submitQuote: "Send My Quote Request"
} as const;

/**
 * Helper text for forms and inputs
 */
export const HELPER_TEXT = {
  quoteForm: `Tell us about your event! The more details you share, the better we can serve you.`,
  
  changeRequest: `What would you like to adjust? We're here to make sure everything is perfect for your event.`,
  
  dietaryRestrictions: `Any allergies or special dietary needs? We want everyone at your event to enjoy the food.`,
  
  guestCount: `An approximate count is fine - we'll finalize details closer to your event date.`,
  
  eventDate: `We recommend booking at least 2-3 weeks in advance, but give us a call if your event is sooner!`
} as const;

/**
 * About section snippet (for footer/about pages)
 */
export const ABOUT_SNIPPET = `Soul Train's Eatery is a family-run catering business rooted in authentic Southern cooking. We're proud to be Charleston's trusted catering partner for weddings, graduations, military functions, corporate events, and social gatherings. Our passion is bringing people together around exceptional food and warm hospitality.` as const;

/**
 * Format contact link for phone
 */
export function formatPhoneLink(phone: string = BRAND_CONTACT.phone): string {
  return `tel:${phone.replace(/\D/g, '')}`;
}

/**
 * Format contact link for email
 */
export function formatEmailLink(email: string = BRAND_CONTACT.email, subject?: string): string {
  const baseUrl = `mailto:${email}`;
  return subject ? `${baseUrl}?subject=${encodeURIComponent(subject)}` : baseUrl;
}

/**
 * Get contextual help message based on workflow step
 */
export function getContextualHelp(step: string): string {
  const helpMessages: Record<string, string> = {
    'quote-form': HELPER_TEXT.quoteForm,
    'estimate-review': WELCOME_MESSAGES.estimate,
    'change-request': HELPER_TEXT.changeRequest,
    'payment': WELCOME_MESSAGES.payment,
    'contract': WELCOME_MESSAGES.contract
  };
  
  return helpMessages[step] || `Questions? Call us at ${BRAND_CONTACT.phone} - we're here to help!`;
}
