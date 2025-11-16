/**
 * Automated Test Data Generator for Quote Requests
 * Generates realistic test quotes for Corporate, Wedding, and Military events
 */

import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import {
  corporateTemplates,
  weddingTemplates,
  militaryTemplates,
  charlestonLocations,
  corporateContactNames,
  weddingContactNames,
  militaryContactNames,
  QuoteTemplate,
} from "./testDataTemplates";

type QuoteWorkflowStatus = Database["public"]["Enums"]["quote_workflow_status"];

export interface TestDataOptions {
  count?: number; // Total quotes to generate (default: 10)
  scenarios?: ("corporate" | "wedding" | "military" | "mixed")[]; // Event types
  dateRange?: {
    startDays: number; // Days from now (default: 7)
    endDays: number; // Days from now (default: 90)
  };
  statusDistribution?: {
    pending: number; // % in pending status
    under_review: number; // % in under_review status
    quoted: number; // % in quoted status
    approved: number; // % in approved status
    paid: number; // % in paid status
  };
  skipEmails?: boolean; // Don't trigger email notifications (default: true)
}

export interface GenerationResult {
  success: number;
  failed: number;
  errors: string[];
  quoteIds: string[];
  summary: {
    corporate: number;
    wedding: number;
    military: number;
  };
}

// Helper: Generate random date within range
function generateEventDate(startDays: number, endDays: number): string {
  const now = new Date();
  const randomDays = Math.floor(Math.random() * (endDays - startDays + 1)) + startDays;
  const eventDate = new Date(now.getTime() + randomDays * 24 * 60 * 60 * 1000);
  return eventDate.toISOString().split("T")[0];
}

// Helper: Generate random time
function generateTime(startHour: number = 10, endHour: number = 19): string {
  const hour = Math.floor(Math.random() * (endHour - startHour + 1)) + startHour;
  const minute = Math.random() > 0.5 ? "00" : "30";
  return `${hour.toString().padStart(2, "0")}:${minute}`;
}

// Helper: Generate serving start time (1-2 hours after start time)
function generateServingStartTime(startTime: string): string {
  const [hours, minutes] = startTime.split(":").map(Number);
  const hoursDelay = Math.random() > 0.5 ? 1 : 2;
  const newHours = (hours + hoursDelay) % 24;
  return `${newHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

// Helper: Pick random location
function getRandomLocation(): string {
  return charlestonLocations[Math.floor(Math.random() * charlestonLocations.length)];
}

// Helper: Generate phone number
function generatePhone(): string {
  const areaCode = "843";
  const exchange = Math.floor(Math.random() * 900 + 100);
  const number = Math.floor(Math.random() * 9000 + 1000);
  return `(${areaCode}) ${exchange}-${number}`;
}

// Helper: Assign workflow status based on distribution
function assignWorkflowStatus(
  index: number,
  total: number,
  distribution: TestDataOptions["statusDistribution"]
): QuoteWorkflowStatus {
  const defaults = {
    pending: 40,
    under_review: 20,
    quoted: 20,
    approved: 15,
    paid: 5,
  };

  const dist = distribution || defaults;
  const percentage = (index / total) * 100;

  if (percentage < dist.pending) return "pending";
  if (percentage < dist.pending + dist.under_review) return "under_review";
  if (percentage < dist.pending + dist.under_review + dist.quoted) return "quoted";
  if (percentage < dist.pending + dist.under_review + dist.quoted + dist.approved) return "approved";
  return "paid";
}

// Helper: Generate contact name based on template
function generateContactName(
  template: QuoteTemplate,
  scenario: "corporate" | "wedding" | "military"
): string {
  if (scenario === "corporate") {
    return corporateContactNames[Math.floor(Math.random() * corporateContactNames.length)];
  } else if (scenario === "wedding") {
    return weddingContactNames[Math.floor(Math.random() * weddingContactNames.length)];
  } else {
    return militaryContactNames[Math.floor(Math.random() * militaryContactNames.length)];
  }
}

// Helper: Generate test email
function generateTestEmail(scenario: string, index: number): string {
  const prefix = scenario.substring(0, 4);
  const timestamp = Date.now().toString().slice(-6);
  return `test-${prefix}-${timestamp}-${index}@soultrain-test.com`;
}

// Main generation function
export async function generateTestQuotes(
  options: TestDataOptions = {}
): Promise<GenerationResult> {
  const {
    count = 10,
    scenarios = ["mixed"],
    dateRange = { startDays: 7, endDays: 90 },
    statusDistribution,
    skipEmails = true,
  } = options;

  const result: GenerationResult = {
    success: 0,
    failed: 0,
    errors: [],
    quoteIds: [],
    summary: {
      corporate: 0,
      wedding: 0,
      military: 0,
    },
  };

  // Determine which templates to use
  let templates: { template: QuoteTemplate; scenario: "corporate" | "wedding" | "military" }[] = [];

  if (scenarios.includes("mixed") || scenarios.length === 0) {
    // Mix all scenarios
    corporateTemplates.forEach((t) => templates.push({ template: t, scenario: "corporate" }));
    weddingTemplates.forEach((t) => templates.push({ template: t, scenario: "wedding" }));
    militaryTemplates.forEach((t) => templates.push({ template: t, scenario: "military" }));
  } else {
    if (scenarios.includes("corporate")) {
      corporateTemplates.forEach((t) => templates.push({ template: t, scenario: "corporate" }));
    }
    if (scenarios.includes("wedding")) {
      weddingTemplates.forEach((t) => templates.push({ template: t, scenario: "wedding" }));
    }
    if (scenarios.includes("military")) {
      militaryTemplates.forEach((t) => templates.push({ template: t, scenario: "military" }));
    }
  }

  if (templates.length === 0) {
    result.errors.push("No valid templates found for selected scenarios");
    return result;
  }

  // Generate quotes
  for (let i = 0; i < count; i++) {
    try {
      // Pick random template
      const { template, scenario } = templates[Math.floor(Math.random() * templates.length)];

      // Generate base data
      const eventDate = generateEventDate(dateRange.startDays, dateRange.endDays);
      const startTime = generateTime();
      const servingStartTime = template.service_type === "full-service" 
        ? generateServingStartTime(startTime) 
        : null;

      const contactName = generateContactName(template, scenario);
      const email = generateTestEmail(scenario, i);
      const phone = generatePhone();
      const location = getRandomLocation();
      const workflowStatus = assignWorkflowStatus(i, count, statusDistribution);

      // Build quote request
      const quoteData: Database["public"]["Tables"]["quote_requests"]["Insert"] = {
        contact_name: contactName,
        email: email,
        phone: phone,
        event_name: template.event_name,
        event_type: template.event_type,
        event_date: eventDate,
        start_time: startTime,
        serving_start_time: servingStartTime,
        guest_count: template.guest_count,
        location: location,
        service_type: template.service_type,
        
        // Proteins
        primary_protein: template.primary_protein?.[0] || null,
        secondary_protein: template.secondary_protein?.[0] || null,
        both_proteins_available: template.both_proteins_available || false,
        
        // Menu items (as JSONB arrays)
        sides: template.sides ? JSON.parse(JSON.stringify(template.sides)) : [],
        appetizers: template.appetizers ? JSON.parse(JSON.stringify(template.appetizers)) : [],
        desserts: template.desserts ? JSON.parse(JSON.stringify(template.desserts)) : [],
        drinks: template.drinks ? JSON.parse(JSON.stringify(template.drinks)) : [],
        dietary_restrictions: template.dietary_restrictions 
          ? JSON.parse(JSON.stringify(template.dietary_restrictions)) 
          : [],
        
        // Additional services
        plates_requested: template.plates_requested || false,
        cups_requested: template.cups_requested || false,
        napkins_requested: template.napkins_requested || false,
        serving_utensils_requested: template.serving_utensils_requested || false,
        chafers_requested: template.chafers_requested || false,
        ice_requested: template.ice_requested || false,
        
        // Setup requirements
        separate_serving_area: template.separate_serving_area || false,
        bussing_tables_needed: template.bussing_tables_needed || false,
        wait_staff_requested: template.wait_staff_requested || false,
        
        // Wedding-specific
        ceremony_included: template.ceremony_included || false,
        cocktail_hour: template.cocktail_hour || false,
        
        // Military-specific
        compliance_level: template.compliance_level || "standard",
        requires_po_number: template.requires_po_number || false,
        po_number: template.po_number || null,
        
        // Additional info
        special_requests: template.special_requests || null,
        referral_source: template.referral_source || "other",
        guest_count_with_restrictions: template.guest_count_with_restrictions || null,
        
        // Workflow
        workflow_status: workflowStatus,
        status_changed_by: "test_generator",
      };

      // Insert into database
      const { data, error } = await supabase
        .from("quote_requests")
        .insert(quoteData)
        .select("id")
        .single();

      if (error) {
        result.failed++;
        result.errors.push(`Failed to insert quote ${i + 1}: ${error.message}`);
      } else {
        result.success++;
        result.quoteIds.push(data.id);
        result.summary[scenario]++;
      }

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (err) {
      result.failed++;
      result.errors.push(`Error generating quote ${i + 1}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return result;
}

// Cleanup function: Remove all test quotes
export async function clearTestQuotes(): Promise<{ deleted: number; error?: string }> {
  try {
    const { data, error } = await supabase
      .from("quote_requests")
      .delete()
      .like("email", "%@soultrain-test.com")
      .select("id");

    if (error) {
      return { deleted: 0, error: error.message };
    }

    return { deleted: data?.length || 0 };
  } catch (err) {
    return { 
      deleted: 0, 
      error: err instanceof Error ? err.message : String(err) 
    };
  }
}

// Get count of existing test quotes
export async function getTestQuoteCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from("quote_requests")
      .select("id", { count: "exact", head: true })
      .like("email", "%@soultrain-test.com");

    if (error) {
      console.error("Error counting test quotes:", error);
      return 0;
    }

    return count || 0;
  } catch (err) {
    console.error("Error in getTestQuoteCount:", err);
    return 0;
  }
}
