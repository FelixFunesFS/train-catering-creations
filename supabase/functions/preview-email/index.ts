/**
 * Email Preview Generator
 * 
 * Uses the shared getEmailContentBlocks() helper - SAME source as send-customer-portal-email.
 * This ensures Settings preview matches EXACTLY what customers receive.
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import {
  generateStandardEmail,
  EMAIL_CONFIGS,
  getEmailContentBlocks,
  type EmailType,
  type StandardEmailConfig,
} from "../_shared/emailTemplates.ts";
import { formatDateToString, addDays } from "../_shared/dateHelpers.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper to get a future date as YYYY-MM-DD string
const getFutureDateString = (daysFromNow: number): string => {
  const today = formatDateToString(new Date());
  return addDays(today, daysFromNow);
};

// Sample data for email previews - includes FULL menu selections
const SAMPLE_QUOTE = {
  id: "sample-quote-id",
  contact_name: "Sarah Johnson",
  email: "sarah.johnson@example.com",
  phone: "(843) 555-0123",
  event_name: "Johnson Family Reunion",
  event_date: getFutureDateString(30), // 30 days from now
  start_time: "14:00",
  location: "Magnolia Gardens, 1500 Ashley River Rd, Charleston, SC 29407",
  guest_count: 75,
  service_type: "full-service",
  special_requests: "Please include extra napkins and serving utensils for the buffet line.",
  // Service add-ons
  wait_staff_requested: true,
  bussing_tables_needed: true,
  ceremony_included: false,
  cocktail_hour: true,
  wait_staff_requirements: "3 servers for 4-hour event",
  // Menu selections (used by menu_summary)
  proteins: ["smoked-brisket", "pulled-pork"],
  sides: ["mac-cheese", "collard-greens", "cornbread"],
  appetizers: ["deviled-eggs", "pimento-cheese"],
  desserts: ["peach-cobbler"],
  drinks: ["sweet-tea", "lemonade"],
  vegetarian_entrees: ["grilled-portobello"],
  both_proteins_available: true,
  guest_count_with_restrictions: "5 vegetarian guests",
  // Supplies
  plates_requested: true,
  cups_requested: true,
  napkins_requested: true,
  serving_utensils_requested: true,
  chafers_requested: true,
  ice_requested: true,
  theme_colors: "Navy blue and gold",
  compliance_level: "standard",
};

// Sample line items structured like REAL invoice data (package-based categories)
const SAMPLE_LINE_ITEMS = [
  { id: "1", title: "Catering Package", description: "Smoked Brisket & Pulled Pork with Mac & Cheese, Collard Greens, Cornbread, and Sweet Tea", category: "package", quantity: 75, unit_price: 3000, total_price: 225000 },
  { id: "2", title: "Vegetarian Entrée Selection", description: "Grilled Portobello", category: "dietary", quantity: 5, unit_price: 1200, total_price: 6000 },
  { id: "3", title: "Appetizer Selection", description: "Deviled Eggs, Pimento Cheese", category: "appetizers", quantity: 75, unit_price: 400, total_price: 30000 },
  { id: "4", title: "Dessert Selection", description: "Peach Cobbler", category: "desserts", quantity: 75, unit_price: 300, total_price: 22500 },
  { id: "5", title: "Full-Service Catering", description: "Professional setup and service", category: "service", quantity: 1, unit_price: 25000, total_price: 25000 },
  { id: "6", title: "Wait Staff Service", description: "3 servers for 4-hour event", category: "service", quantity: 1, unit_price: 45000, total_price: 45000 },
  { id: "7", title: "Supply & Equipment Package", description: "Plates, cups, napkins, serving utensils, chafers, ice", category: "supplies", quantity: 1, unit_price: 10000, total_price: 10000 },
];

const SAMPLE_INVOICE = {
  id: "sample-invoice-id",
  invoice_number: "INV-2025-0042",
  subtotal: 363500, // Sum of all line items
  tax_amount: 32715, // 9% tax
  total_amount: 396215,
  due_date: getFutureDateString(14), // 14 days from now
  workflow_status: "sent",
  customer_access_token: "sample-token",
  version: 1,
};

const SAMPLE_MILESTONES = [
  { id: "m1", milestone_type: "deposit", percentage: 10, amount_cents: 38014, status: "paid", due_date: null, is_due_now: true },
  { id: "m2", milestone_type: "mid_payment", percentage: 50, amount_cents: 190069, status: "pending", due_date: getFutureDateString(14), is_due_now: false },
  { id: "m3", milestone_type: "final_payment", percentage: 40, amount_cents: 152055, status: "pending", due_date: getFutureDateString(28), is_due_now: false },
];

/**
 * Generate email preview using the SAME helper as send-customer-portal-email
 * This ensures preview matches exactly what customers receive
 */
function generateEmailPreview(emailType: EmailType, variant: 'customer' | 'admin'): { html: string; subject: string } {
  const siteUrl = Deno.env.get('SITE_URL') || 'https://www.soultrainseatery.com';
  const config = EMAIL_CONFIGS[emailType];
  const variantConfig = config?.[variant];

  if (!variantConfig) {
    return {
      html: `<html><body><p>No ${variant} template defined for ${emailType}</p></body></html>`,
      subject: `No template: ${emailType}`
    };
  }

  const portalUrl = `${siteUrl}/estimate?token=sample-token`;

  // Use the SAME shared helper as send-customer-portal-email
  const { contentBlocks, ctaButton } = getEmailContentBlocks(emailType, variant, {
    quote: SAMPLE_QUOTE,
    invoice: SAMPLE_INVOICE,
    lineItems: SAMPLE_LINE_ITEMS,
    milestones: SAMPLE_MILESTONES,
    portalUrl,
    isUpdated: false,
    paymentAmount: SAMPLE_MILESTONES[0].amount_cents,
    isFullPayment: false,
  });

  const emailConfig: StandardEmailConfig = {
    preheaderText: variantConfig.preheaderText,
    heroSection: variantConfig.heroSection,
    contentBlocks,
    ctaButton,
    quote: SAMPLE_QUOTE,
    invoice: SAMPLE_INVOICE,
    lineItems: SAMPLE_LINE_ITEMS,
  };

  return {
    html: generateStandardEmail(emailConfig),
    subject: variantConfig.heroSection.title,
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { emailType, variant = 'customer' } = await req.json();

    if (!emailType) {
      return new Response(
        JSON.stringify({ error: "emailType is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`[Preview Email] Type: ${emailType}, Variant: ${variant}`);

    const preview = generateEmailPreview(emailType as EmailType, variant as 'customer' | 'admin');

    return new Response(
      JSON.stringify({
        html: preview.html,
        subject: preview.subject,
        emailType,
        variant,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("[Preview Email] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
