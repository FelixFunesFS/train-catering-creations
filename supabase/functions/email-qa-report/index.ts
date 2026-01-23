/**
 * Email QA Report
 *
 * Generates a JSON report of all email templates (preheader, hero, and key copy)
 * and flags common duplication issues (e.g., phone/email in body when footer already contains it).
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import {
  EMAIL_CONFIGS,
  getEmailContentBlocks,
  generateStandardEmail,
  type EmailType,
} from "../_shared/emailTemplates.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Variant = "customer" | "admin";

interface EmailQaReportRequest {
  include_html?: boolean;
}

const FOOTER_ANCHOR = "A Family-Run Business Since Day One";
const PHONE = "(843) 970-0265";
const EMAIL = "soultrainseatery@gmail.com";

function countOccurrences(haystack: string, needle: string): number {
  if (!needle) return 0;
  return haystack.split(needle).length - 1;
}

function getBodyHtml(html: string): string {
  const idx = html.indexOf(FOOTER_ANCHOR);
  return idx > 0 ? html.slice(0, idx) : html;
}

function getAllEmailTypes(): EmailType[] {
  // EMAIL_CONFIGS is the canonical list of supported email types.
  return Object.keys(EMAIL_CONFIGS) as EmailType[];
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    let includeHtml = false;
    if (req.method !== "GET") {
      const body: EmailQaReportRequest = await req.json().catch(() => ({}));
      includeHtml = Boolean(body?.include_html);
    }

    const siteUrl = Deno.env.get("SITE_URL") || "https://soultrainseatery.lovable.app";

    // Minimal sample data; the goal is consistency across templates, not perfect realism.
    const SAMPLE_QUOTE = {
      id: "00000000-0000-0000-0000-000000000000",
      contact_name: "Felix Funes",
      email: "customer@example.com",
      phone: "(843) 555-1212",
      event_name: "Margery Funes 30th",
      event_type: "birthday",
      event_date: "2026-03-14",
      start_time: "17:00",
      location: "Charleston, SC",
      guest_count: 60,
      service_type: "full-service",
      special_requests: "No peanuts.",
      compliance_level: null,
      proteins: ["Fried Chicken"],
      sides: ["Mac & Cheese", "Collard Greens"],
      desserts: ["Banana Pudding"],
      drinks: ["Sweet Tea"],
      appetizers: ["Deviled Eggs"],
      utensils: [],
      extras: [],
      vegetarian_entrees: [],
      dietary_restrictions: [],
      both_proteins_available: false,
    };

    const SAMPLE_INVOICE = {
      id: "11111111-1111-1111-1111-111111111111",
      customer_access_token: "sample-token",
      subtotal: 250000,
      tax_amount: 20000,
      total_amount: 270000,
      workflow_status: "sent",
      invoice_number: "EST-1001",
      due_date: null,
      created_at: new Date().toISOString(),
    };

    const SAMPLE_LINE_ITEMS = [
      {
        id: "li-1",
        title: "Catering Package",
        description: "Soul food catering package",
        quantity: 60,
        unit_price: 4000,
        total_price: 240000,
        category: "package",
        sort_order: 1,
      },
      {
        id: "li-2",
        title: "Service & Staffing",
        description: "On-site full service",
        quantity: 1,
        unit_price: 30000,
        total_price: 30000,
        category: "service",
        sort_order: 2,
      },
    ];

    const SAMPLE_MILESTONES = [
      {
        milestone_type: "deposit",
        percentage: 25,
        amount_cents: 67500,
        is_due_now: true,
        due_date: null,
      },
      {
        milestone_type: "final_payment",
        percentage: 75,
        amount_cents: 202500,
        is_due_now: false,
        due_date: "2026-03-07",
      },
    ];

    const portalUrl = `${siteUrl}/estimate?token=${SAMPLE_INVOICE.customer_access_token}`;

    const report: any[] = [];
    const emailTypes = getAllEmailTypes();

    for (const emailType of emailTypes) {
      const variants: Variant[] = [
        ...(EMAIL_CONFIGS[emailType]?.customer ? (["customer"] as const) : []),
        ...(EMAIL_CONFIGS[emailType]?.admin ? (["admin"] as const) : []),
      ];

      for (const variant of variants) {
        const preset = EMAIL_CONFIGS[emailType]?.[variant];
        if (!preset) continue;

        const { contentBlocks } = getEmailContentBlocks(emailType, variant, {
          quote: SAMPLE_QUOTE,
          invoice: SAMPLE_INVOICE,
          lineItems: SAMPLE_LINE_ITEMS,
          milestones: SAMPLE_MILESTONES,
          portalUrl,
          isUpdated: true,
        });

        const html = generateStandardEmail({
          preheaderText: preset.preheaderText,
          heroSection: preset.heroSection,
          contentBlocks,
          quote: SAMPLE_QUOTE,
          invoice: SAMPLE_INVOICE,
          lineItems: SAMPLE_LINE_ITEMS,
        });

        const bodyHtml = getBodyHtml(html);

        const pleaseReviewCount = countOccurrences(html.toLowerCase(), "please review");

        report.push({
          emailType,
          variant,
          preheaderText: preset.preheaderText,
          hero: preset.heroSection,
          flags: {
            contains_phone_in_body: bodyHtml.includes(PHONE),
            contains_email_in_body: bodyHtml.includes(EMAIL),
            repeated_please_review: pleaseReviewCount >= 2,
          },
          counts: {
            please_review: pleaseReviewCount,
          },
          ...(includeHtml ? { html } : {}),
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        generated_at: new Date().toISOString(),
        notes: {
          footer_anchor: FOOTER_ANCHOR,
          body_definition: `Everything before the first occurrence of "${FOOTER_ANCHOR}" is considered body content.`,
        },
        total: report.length,
        report,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (error) {
    console.error("Error in email-qa-report:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
    );
  }
};

serve(handler);
