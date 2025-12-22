import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import {
  generateStandardEmail,
  generateEventDetailsCard,
  generateMenuSection,
  generateLineItemsTable,
  generateServiceAddonsSection,
  EMAIL_CONFIGS,
  type EmailType,
  type StandardEmailConfig,
  type ContentBlock,
  formatCurrency,
  formatDate,
} from "../_shared/emailTemplates.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Sample data for email previews
const SAMPLE_QUOTE = {
  id: "sample-quote-id",
  contact_name: "Sarah Johnson",
  email: "sarah.johnson@example.com",
  phone: "(843) 555-0123",
  event_name: "Johnson Family Reunion",
  event_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
  start_time: "14:00",
  location: "Magnolia Gardens, 1500 Ashley River Rd, Charleston, SC 29407",
  guest_count: 75,
  service_type: "full-service",
  special_requests: "Please include extra napkins and serving utensils for the buffet line.",
  wait_staff_requested: true,
  bussing_tables_needed: true,
  ceremony_included: false,
  cocktail_hour: true,
  both_proteins_available: true,
  compliance_level: "standard",
};

const SAMPLE_LINE_ITEMS = [
  { id: "1", title: "Smoked Brisket", description: "Slow-smoked Texas-style brisket", category: "Proteins", quantity: 75, unit_price: 1500, total_price: 112500 },
  { id: "2", title: "Pulled Pork", description: "Carolina-style pulled pork", category: "Proteins", quantity: 75, unit_price: 1200, total_price: 90000 },
  { id: "3", title: "Mac & Cheese", description: "Creamy Southern mac & cheese", category: "Sides", quantity: 75, unit_price: 500, total_price: 37500 },
  { id: "4", title: "Collard Greens", description: "Traditional slow-cooked collards", category: "Sides", quantity: 75, unit_price: 400, total_price: 30000 },
  { id: "5", title: "Cornbread", description: "Sweet honey cornbread", category: "Sides", quantity: 75, unit_price: 250, total_price: 18750 },
  { id: "6", title: "Sweet Tea", description: "Southern sweet tea", category: "Beverages", quantity: 75, unit_price: 200, total_price: 15000 },
  { id: "7", title: "Wait Staff (3 servers)", description: "Professional service for 3 hours", category: "Service Items", quantity: 1, unit_price: 45000, total_price: 45000 },
];

const SAMPLE_INVOICE = {
  id: "sample-invoice-id",
  invoice_number: "INV-2025-0042",
  subtotal: 348750,
  tax_amount: 31388,
  total_amount: 380138,
  due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  workflow_status: "sent",
  customer_access_token: "sample-token",
};

const SAMPLE_MILESTONES = [
  { id: "m1", milestone_type: "deposit", percentage: 10, amount_cents: 38014, status: "paid", due_date: null },
  { id: "m2", milestone_type: "mid_payment", percentage: 50, amount_cents: 190069, status: "pending", due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
  { id: "m3", milestone_type: "final_payment", percentage: 40, amount_cents: 152055, status: "pending", due_date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
];

// Generate email preview based on type and variant
function generateEmailPreview(emailType: EmailType, variant: 'customer' | 'admin'): { html: string; subject: string } {
  const siteUrl = Deno.env.get('SITE_URL') || 'https://soultrainseatery.lovable.app';
  const config = EMAIL_CONFIGS[emailType];
  const variantConfig = config?.[variant];

  if (!variantConfig) {
    // Fallback for types that don't have this variant
    return {
      html: `<html><body><p>No ${variant} template defined for ${emailType}</p></body></html>`,
      subject: `No template: ${emailType}`
    };
  }

  let contentBlocks: ContentBlock[] = [];
  let ctaButton: { text: string; href: string; variant: 'primary' | 'secondary' } | undefined;

  // Build content blocks based on email type
  switch (emailType) {
    case 'quote_received':
      contentBlocks = [
        { type: 'text', data: { html: `
          <p style="margin:0 0 16px 0;font-size:15px;color:#333;">
            <strong>${SAMPLE_QUOTE.contact_name}</strong> has submitted a new quote request for 
            <strong>${SAMPLE_QUOTE.event_name}</strong>.
          </p>
        `}},
        { type: 'event_details' },
        { type: 'service_addons' },
      ];
      ctaButton = { text: 'View in Admin Dashboard', href: `${siteUrl}/admin?view=events`, variant: 'primary' };
      break;

    case 'quote_confirmation':
      contentBlocks = [
        { type: 'text', data: { html: `
          <p style="margin:0 0 16px 0;font-size:15px;color:#333;">
            Dear ${SAMPLE_QUOTE.contact_name},
          </p>
          <p style="margin:0 0 16px 0;font-size:15px;color:#333;">
            Thank you for choosing Soul Train's Eatery for your upcoming event! We've received your catering request 
            and our team is already working on your custom estimate.
          </p>
          <p style="margin:0 0 16px 0;font-size:15px;color:#333;">
            <strong>What happens next?</strong><br>
            Our team will review your request and prepare a detailed estimate. You'll receive an email 
            within 24-48 hours with your personalized quote.
          </p>
        `}},
        { type: 'event_details' },
      ];
      break;

    case 'estimate_ready':
      contentBlocks = [
        { type: 'text', data: { html: `
          <p style="margin:0 0 16px 0;font-size:15px;color:#333;">
            Dear ${SAMPLE_QUOTE.contact_name},
          </p>
          <p style="margin:0 0 16px 0;font-size:15px;color:#333;">
            Great news! Your personalized catering estimate is ready for review. We've carefully 
            crafted a menu and service package tailored to your ${SAMPLE_QUOTE.event_name}.
          </p>
        `}},
        { type: 'event_details' },
        { type: 'menu_with_pricing' },
      ];
      ctaButton = { text: 'Review Your Estimate', href: `${siteUrl}/estimate?token=sample-token`, variant: 'primary' };
      break;

    case 'estimate_reminder':
      contentBlocks = [
        { type: 'text', data: { html: `
          <p style="margin:0 0 16px 0;font-size:15px;color:#333;">
            Dear ${SAMPLE_QUOTE.contact_name},
          </p>
          <p style="margin:0 0 16px 0;font-size:15px;color:#333;">
            Just a friendly reminder that your catering estimate for <strong>${SAMPLE_QUOTE.event_name}</strong> 
            is still waiting for your review!
          </p>
          <p style="margin:0 0 16px 0;font-size:15px;color:#333;">
            Your event is coming up on <strong>${formatDate(SAMPLE_QUOTE.event_date)}</strong>. 
            To ensure we can accommodate your request, please review and approve your estimate soon.
          </p>
        `}},
        { type: 'event_details' },
      ];
      ctaButton = { text: 'Review Your Estimate', href: `${siteUrl}/estimate?token=sample-token`, variant: 'primary' };
      break;

    case 'approval_confirmation':
      if (variant === 'customer') {
        contentBlocks = [
          { type: 'status_badge', data: { status: 'approved', title: 'Estimate Approved!', description: 'Your catering order has been confirmed. Next step: complete your deposit payment.' }},
          { type: 'text', data: { html: `
            <p style="margin:16px 0;font-size:15px;color:#333;">
              Dear ${SAMPLE_QUOTE.contact_name},
            </p>
            <p style="margin:0 0 16px 0;font-size:15px;color:#333;">
              Thank you for approving your estimate! We're excited to cater your 
              <strong>${SAMPLE_QUOTE.event_name}</strong>.
            </p>
            <p style="margin:0 0 16px 0;font-size:15px;color:#333;">
              <strong>Payment Schedule:</strong><br>
              • 10% Deposit: ${formatCurrency(SAMPLE_MILESTONES[0].amount_cents)} (due now)<br>
              • 50% Mid-Payment: ${formatCurrency(SAMPLE_MILESTONES[1].amount_cents)} (due ${formatDate(SAMPLE_MILESTONES[1].due_date)})<br>
              • 40% Final Payment: ${formatCurrency(SAMPLE_MILESTONES[2].amount_cents)} (due ${formatDate(SAMPLE_MILESTONES[2].due_date)})
            </p>
          `}},
          { type: 'event_details' },
        ];
        ctaButton = { text: 'Make Deposit Payment', href: `${siteUrl}/estimate?token=sample-token`, variant: 'primary' };
      } else {
        contentBlocks = [
          { type: 'status_badge', data: { status: 'approved', title: 'Customer Approved Estimate', description: `${SAMPLE_QUOTE.contact_name} has approved their estimate for ${SAMPLE_QUOTE.event_name}.` }},
          { type: 'event_details' },
          { type: 'text', data: { html: `
            <p style="margin:16px 0;font-size:15px;color:#333;">
              <strong>Total Amount:</strong> ${formatCurrency(SAMPLE_INVOICE.total_amount)}<br>
              <strong>Payment Status:</strong> Awaiting deposit
            </p>
          `}},
        ];
        ctaButton = { text: 'View in Dashboard', href: `${siteUrl}/admin?view=events`, variant: 'primary' };
      }
      break;

    case 'payment_received':
      if (variant === 'customer') {
        contentBlocks = [
          { type: 'status_badge', data: { status: 'approved', title: 'Payment Received!', description: `We've received your payment of ${formatCurrency(SAMPLE_MILESTONES[0].amount_cents)}.` }},
          { type: 'text', data: { html: `
            <p style="margin:16px 0;font-size:15px;color:#333;">
              Dear ${SAMPLE_QUOTE.contact_name},
            </p>
            <p style="margin:0 0 16px 0;font-size:15px;color:#333;">
              Thank you for your payment! Your event is now confirmed on our calendar.
            </p>
          `}},
          { type: 'event_details' },
        ];
      } else {
        contentBlocks = [
          { type: 'status_badge', data: { status: 'approved', title: 'Payment Received', description: `${SAMPLE_QUOTE.contact_name} has made a payment of ${formatCurrency(SAMPLE_MILESTONES[0].amount_cents)}.` }},
          { type: 'event_details' },
          { type: 'text', data: { html: `
            <p style="margin:16px 0;font-size:15px;color:#333;">
              <strong>Invoice:</strong> ${SAMPLE_INVOICE.invoice_number}<br>
              <strong>Amount Paid:</strong> ${formatCurrency(SAMPLE_MILESTONES[0].amount_cents)}<br>
              <strong>Remaining Balance:</strong> ${formatCurrency(SAMPLE_INVOICE.total_amount - SAMPLE_MILESTONES[0].amount_cents)}
            </p>
          `}},
        ];
        ctaButton = { text: 'View Payment Details', href: `${siteUrl}/admin?view=billing`, variant: 'primary' };
      }
      break;

    case 'payment_reminder':
      contentBlocks = [
        { type: 'status_badge', data: { status: 'pending', title: 'Payment Reminder', description: `Your payment of ${formatCurrency(SAMPLE_MILESTONES[1].amount_cents)} is due ${formatDate(SAMPLE_MILESTONES[1].due_date)}.` }},
        { type: 'text', data: { html: `
          <p style="margin:16px 0;font-size:15px;color:#333;">
            Dear ${SAMPLE_QUOTE.contact_name},
          </p>
          <p style="margin:0 0 16px 0;font-size:15px;color:#333;">
            This is a friendly reminder that your payment for <strong>${SAMPLE_QUOTE.event_name}</strong> is due soon.
          </p>
        `}},
        { type: 'event_details' },
      ];
      ctaButton = { text: 'Make Payment Now', href: `${siteUrl}/estimate?token=sample-token`, variant: 'primary' };
      break;

    case 'event_reminder':
      if (variant === 'customer') {
        contentBlocks = [
          { type: 'text', data: { html: `
            <p style="margin:0 0 16px 0;font-size:15px;color:#333;">
              Dear ${SAMPLE_QUOTE.contact_name},
            </p>
            <p style="margin:0 0 16px 0;font-size:15px;color:#333;">
              Your event is just around the corner! We're getting everything ready to make 
              <strong>${SAMPLE_QUOTE.event_name}</strong> a memorable occasion.
            </p>
          `}},
          { type: 'event_details' },
          { type: 'service_addons' },
          { type: 'text', data: { html: `
            <p style="margin:16px 0;font-size:15px;color:#333;">
              If you have any last-minute questions or changes, please don't hesitate to contact us 
              at <a href="tel:+18439700265">(843) 970-0265</a>.
            </p>
          `}},
        ];
      } else {
        contentBlocks = [
          { type: 'text', data: { html: `
            <p style="margin:0 0 16px 0;font-size:15px;color:#333;">
              <strong>${SAMPLE_QUOTE.event_name}</strong> is coming up soon! Here are the event details:
            </p>
          `}},
          { type: 'event_details' },
          { type: 'service_addons' },
        ];
        ctaButton = { text: 'View Event Details', href: `${siteUrl}/admin?view=events`, variant: 'primary' };
      }
      break;

    case 'change_request_submitted':
      if (variant === 'customer') {
        contentBlocks = [
          { type: 'status_badge', data: { status: 'info', title: 'Change Request Received', description: "We've received your change request and will review it shortly." }},
          { type: 'text', data: { html: `
            <p style="margin:16px 0;font-size:15px;color:#333;">
              Dear ${SAMPLE_QUOTE.contact_name},
            </p>
            <p style="margin:0 0 16px 0;font-size:15px;color:#333;">
              Thank you for submitting your change request. Our team will review it and get back to you 
              within 24-48 hours with an updated estimate if needed.
            </p>
          `}},
          { type: 'event_details' },
        ];
      } else {
        contentBlocks = [
          { type: 'status_badge', data: { status: 'pending', title: 'New Change Request', description: `${SAMPLE_QUOTE.contact_name} has requested changes to their order.` }},
          { type: 'text', data: { html: `
            <p style="margin:16px 0;font-size:15px;color:#333;">
              <strong>Request Type:</strong> Menu Modification<br>
              <strong>Customer Comments:</strong> "I'd like to add an appetizer course and increase the guest count by 10."
            </p>
          `}},
          { type: 'event_details' },
        ];
        ctaButton = { text: 'Review Change Request', href: `${siteUrl}/admin?view=events`, variant: 'primary' };
      }
      break;

    case 'change_request_response':
      contentBlocks = [
        { type: 'status_badge', data: { status: 'approved', title: 'Change Request Approved', description: "We've updated your order based on your request." }},
        { type: 'text', data: { html: `
          <p style="margin:16px 0;font-size:15px;color:#333;">
            Dear ${SAMPLE_QUOTE.contact_name},
          </p>
          <p style="margin:0 0 16px 0;font-size:15px;color:#333;">
            Great news! We've reviewed and approved your change request. Your updated estimate 
            is now available for review.
          </p>
        `}},
        { type: 'event_details' },
      ];
      ctaButton = { text: 'View Updated Estimate', href: `${siteUrl}/estimate?token=sample-token`, variant: 'primary' };
      break;

    case 'admin_notification':
      contentBlocks = [
        { type: 'text', data: { html: `
          <p style="margin:0 0 16px 0;font-size:15px;color:#333;">
            <strong>Notification Type:</strong> Customer Action Required<br>
            <strong>Event:</strong> ${SAMPLE_QUOTE.event_name}<br>
            <strong>Customer:</strong> ${SAMPLE_QUOTE.contact_name}
          </p>
          <p style="margin:0 0 16px 0;font-size:15px;color:#333;">
            A customer action requires your attention. Please review the details in the admin dashboard.
          </p>
        `}},
        { type: 'event_details' },
      ];
      ctaButton = { text: 'View in Dashboard', href: `${siteUrl}/admin?view=events`, variant: 'primary' };
      break;

    case 'event_followup':
      contentBlocks = [
        { type: 'text', data: { html: `
          <p style="margin:0 0 16px 0;font-size:15px;color:#333;">
            Dear ${SAMPLE_QUOTE.contact_name},
          </p>
          <p style="margin:0 0 16px 0;font-size:15px;color:#333;">
            Thank you so much for choosing Soul Train's Eatery for your ${SAMPLE_QUOTE.event_name}! 
            We hope everyone enjoyed the food and that your event was everything you dreamed of.
          </p>
          <p style="margin:0 0 16px 0;font-size:15px;color:#333;">
            We'd love to hear how we did! Your feedback helps us continue to provide the best 
            Southern catering experience in the Lowcountry.
          </p>
          <p style="margin:0 0 16px 0;font-size:15px;color:#333;">
            <em>— The Soul Train's Eatery Family</em>
          </p>
        `}},
      ];
      break;

    default:
      contentBlocks = [
        { type: 'text', data: { html: `<p>No preview available for ${emailType}</p>` }},
      ];
  }

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

    console.log(`Generating email preview: ${emailType} (${variant})`);

    const { html, subject } = generateEmailPreview(emailType as EmailType, variant);

    return new Response(
      JSON.stringify({ html, subject, emailType, variant }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error) {
    console.error("Error generating email preview:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);