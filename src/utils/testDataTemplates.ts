/**
 * Test Data Templates for Quote Request Generator
 * Contains realistic data templates for Corporate, Wedding, and Military events
 */

import { Database } from "@/integrations/supabase/types";

type QuoteWorkflowStatus = Database["public"]["Enums"]["quote_workflow_status"];

export interface QuoteTemplate {
  contact_name: string;
  event_name: string;
  event_type: Database["public"]["Enums"]["event_type"];
  guest_count: number;
  service_type: Database["public"]["Enums"]["service_type"];
  primary_protein: string[];
  secondary_protein?: string[];
  both_proteins_available?: boolean;
  sides: string[];
  appetizers?: string[];
  desserts?: string[];
  drinks: string[];
  plates_requested: boolean;
  cups_requested: boolean;
  napkins_requested?: boolean;
  serving_utensils_requested?: boolean;
  chafers_requested?: boolean;
  ice_requested?: boolean;
  special_requests?: string;
  referral_source?: string;
  ceremony_included?: boolean;
  cocktail_hour?: boolean;
  wait_staff_requested?: boolean;
  bussing_tables_needed?: boolean;
  separate_serving_area?: boolean;
  dietary_restrictions?: string[];
  guest_count_with_restrictions?: string;
  compliance_level?: string;
  requires_po_number?: boolean;
  po_number?: string;
}

// CORPORATE EVENT TEMPLATES
export const corporateTemplates: QuoteTemplate[] = [
  {
    contact_name: "Jennifer Martinez",
    event_name: "ABC Corporation Annual Picnic",
    event_type: "corporate",
    guest_count: 150,
    service_type: "full-service",
    primary_protein: ["pulled_pork", "bbq_chicken"],
    sides: ["mac_and_cheese", "collard_greens", "coleslaw", "cornbread"],
    appetizers: ["deviled_eggs", "fried_green_tomatoes"],
    drinks: ["sweet_tea", "lemonade", "water"],
    plates_requested: true,
    cups_requested: true,
    napkins_requested: true,
    serving_utensils_requested: true,
    special_requests: "Please set up under the oak trees. Will need extra seating for 160 (buffer).",
    referral_source: "previous_customer",
  },
  {
    contact_name: "Robert Chen",
    event_name: "Retirement Celebration - Mr. Williams",
    event_type: "retirement",
    guest_count: 75,
    service_type: "delivery-setup",
    primary_protein: ["fried_chicken", "pulled_pork"],
    sides: ["green_beans", "potato_salad", "baked_beans", "dinner_rolls"],
    appetizers: ["cheese_platter"],
    desserts: ["banana_pudding", "peach_cobbler"],
    drinks: ["sweet_tea", "coffee", "water"],
    plates_requested: true,
    cups_requested: true,
    napkins_requested: true,
    chafers_requested: true,
    special_requests: "Celebrating 40 years of service. Need setup by 5:30 PM.",
    referral_source: "google_search",
  },
  {
    contact_name: "TechStart Solutions",
    event_name: "Holiday Party 2025",
    event_type: "holiday_party",
    guest_count: 200,
    service_type: "full-service",
    primary_protein: ["herb_roasted_chicken", "honey_glazed_ham"],
    both_proteins_available: true,
    sides: ["garlic_mashed_potatoes", "green_bean_almandine", "candied_yams", "dinner_rolls"],
    appetizers: ["shrimp_cocktail", "spinach_artichoke_dip", "cheese_platter"],
    desserts: ["assorted_pies", "cookies"],
    drinks: ["punch", "sweet_tea", "coffee", "water"],
    plates_requested: true,
    cups_requested: true,
    napkins_requested: true,
    serving_utensils_requested: true,
    wait_staff_requested: true,
    bussing_tables_needed: true,
    dietary_restrictions: ["vegetarian", "gluten_free"],
    guest_count_with_restrictions: "15",
    special_requests: "Company holiday party. Need elegant presentation. 15 vegetarian/gluten-free meals.",
    referral_source: "social_media",
  },
  {
    contact_name: "Sarah Thompson",
    event_name: "Client Appreciation Lunch",
    event_type: "corporate",
    guest_count: 50,
    service_type: "drop-off",
    primary_protein: ["grilled_chicken_sandwiches"],
    sides: ["caesar_salad", "pasta_salad", "fresh_fruit"],
    desserts: ["cookies", "brownies"],
    drinks: ["sweet_tea", "lemonade", "water"],
    plates_requested: true,
    cups_requested: true,
    napkins_requested: true,
    special_requests: "Drop off at noon. Simple setup, boxed lunches preferred if possible.",
    referral_source: "local_business_referral",
  },
  {
    contact_name: "Michael Patterson",
    event_name: "Team Building BBQ",
    event_type: "corporate",
    guest_count: 100,
    service_type: "full-service",
    primary_protein: ["pulled_pork", "bbq_ribs", "grilled_chicken"],
    sides: ["coleslaw", "baked_beans", "mac_and_cheese", "cornbread"],
    appetizers: ["wings", "deviled_eggs"],
    desserts: ["banana_pudding"],
    drinks: ["sweet_tea", "lemonade", "water"],
    plates_requested: true,
    cups_requested: true,
    napkins_requested: true,
    serving_utensils_requested: true,
    ice_requested: true,
    special_requests: "Outdoor event at the park. Need full setup including serving line.",
    referral_source: "friend_family_referral",
  },
];

// WEDDING EVENT TEMPLATES
export const weddingTemplates: QuoteTemplate[] = [
  {
    contact_name: "Sarah & Michael Johnson",
    event_name: "Johnson Wedding Reception",
    event_type: "wedding",
    guest_count: 180,
    service_type: "full-service",
    ceremony_included: true,
    cocktail_hour: true,
    primary_protein: ["herb_roasted_chicken", "grilled_salmon"],
    both_proteins_available: true,
    sides: ["garlic_mashed_potatoes", "green_beans_almandine", "caesar_salad", "dinner_rolls"],
    appetizers: ["shrimp_cocktail", "bruschetta", "cheese_platter"],
    desserts: ["wedding_cake", "assorted_miniatures"],
    drinks: ["champagne", "wine", "beer", "sweet_tea", "lemonade", "coffee"],
    plates_requested: true,
    cups_requested: true,
    napkins_requested: true,
    chafers_requested: true,
    wait_staff_requested: true,
    bussing_tables_needed: true,
    separate_serving_area: true,
    dietary_restrictions: ["vegetarian", "shellfish_allergy"],
    guest_count_with_restrictions: "5",
    special_requests: "Navy blue and gold wedding colors. Bride has shellfish allergy. 5 vegetarian guests.",
    referral_source: "social_media",
  },
  {
    contact_name: "Emily & David Martinez",
    event_name: "Martinez Intimate Wedding",
    event_type: "wedding",
    guest_count: 60,
    service_type: "delivery-setup",
    ceremony_included: false,
    cocktail_hour: true,
    primary_protein: ["filet_mignon", "herb_roasted_chicken"],
    both_proteins_available: true,
    sides: ["garlic_mashed_potatoes", "roasted_vegetables", "garden_salad"],
    appetizers: ["bruschetta", "stuffed_mushrooms"],
    desserts: ["wedding_cake"],
    drinks: ["champagne", "wine", "sweet_tea", "coffee"],
    plates_requested: true,
    cups_requested: true,
    napkins_requested: true,
    chafers_requested: true,
    special_requests: "Small intimate garden wedding. Elegant plated service preferred.",
    referral_source: "previous_customer",
  },
  {
    contact_name: "Amanda & Christopher Hayes",
    event_name: "Hayes Black-Tie Reception",
    event_type: "black_tie",
    guest_count: 250,
    service_type: "full-service",
    ceremony_included: false,
    cocktail_hour: true,
    primary_protein: ["filet_mignon", "lobster_tail", "herb_roasted_chicken"],
    both_proteins_available: true,
    sides: ["garlic_mashed_potatoes", "asparagus", "caesar_salad", "dinner_rolls"],
    appetizers: ["shrimp_cocktail", "oysters", "cheese_platter", "bruschetta"],
    desserts: ["wedding_cake", "chocolate_fountain", "assorted_miniatures"],
    drinks: ["champagne", "premium_wine", "premium_spirits", "sweet_tea", "coffee"],
    plates_requested: true,
    cups_requested: true,
    napkins_requested: true,
    chafers_requested: true,
    wait_staff_requested: true,
    bussing_tables_needed: true,
    separate_serving_area: true,
    dietary_restrictions: ["vegetarian", "gluten_free", "kosher"],
    guest_count_with_restrictions: "20",
    special_requests: "Formal black-tie event. White linens, elegant presentation. 20 guests with dietary restrictions (vegetarian, gluten-free, kosher options needed).",
    referral_source: "website",
  },
];

// MILITARY FUNCTION TEMPLATES
export const militaryTemplates: QuoteTemplate[] = [
  {
    contact_name: "Capt. Robert Hayes",
    event_name: "Military Retirement Ceremony - Col. Anderson",
    event_type: "military_function",
    guest_count: 100,
    service_type: "full-service",
    primary_protein: ["herb_roasted_chicken", "honey_glazed_ham"],
    both_proteins_available: true,
    sides: ["garlic_mashed_potatoes", "green_beans", "dinner_rolls", "garden_salad"],
    appetizers: ["cheese_platter", "vegetable_platter"],
    desserts: ["sheet_cake", "cookies"],
    drinks: ["punch", "sweet_tea", "coffee", "water"],
    plates_requested: true,
    cups_requested: true,
    napkins_requested: true,
    serving_utensils_requested: true,
    chafers_requested: true,
    compliance_level: "government",
    requires_po_number: true,
    po_number: "MIL-2025-1234",
    special_requests: "Formal military retirement ceremony. Need setup by 11:00 AM. Government contract, PO number provided.",
    referral_source: "local_business_referral",
  },
  {
    contact_name: "MSgt. Jennifer Williams",
    event_name: "Charleston Air Force Base Family Day",
    event_type: "military_function",
    guest_count: 300,
    service_type: "delivery-setup",
    primary_protein: ["pulled_pork", "bbq_chicken", "hot_dogs"],
    sides: ["coleslaw", "baked_beans", "potato_salad", "chips"],
    desserts: ["watermelon", "cookies"],
    drinks: ["lemonade", "sweet_tea", "water"],
    plates_requested: true,
    cups_requested: true,
    napkins_requested: true,
    serving_utensils_requested: true,
    ice_requested: true,
    compliance_level: "government",
    requires_po_number: true,
    po_number: "AFB-2025-5678",
    special_requests: "Base family day event. Outdoor BBQ setup. Kid-friendly menu. Government PO required.",
    referral_source: "previous_customer",
  },
  {
    contact_name: "Col. Marcus Thompson",
    event_name: "Annual Military Ball",
    event_type: "military_function",
    guest_count: 200,
    service_type: "full-service",
    primary_protein: ["filet_mignon", "herb_roasted_chicken", "grilled_salmon"],
    both_proteins_available: true,
    sides: ["garlic_mashed_potatoes", "roasted_vegetables", "caesar_salad", "dinner_rolls"],
    appetizers: ["shrimp_cocktail", "cheese_platter", "bruschetta"],
    desserts: ["assorted_pies", "chocolate_mousse"],
    drinks: ["wine", "beer", "sweet_tea", "coffee", "water"],
    plates_requested: true,
    cups_requested: true,
    napkins_requested: true,
    chafers_requested: true,
    wait_staff_requested: true,
    bussing_tables_needed: true,
    separate_serving_area: true,
    dietary_restrictions: ["vegetarian", "halal"],
    guest_count_with_restrictions: "12",
    compliance_level: "government",
    requires_po_number: true,
    po_number: "MIL-BALL-2025-9012",
    special_requests: "Formal military ball. Elegant presentation required. 12 guests need vegetarian/halal options. Government contract.",
    referral_source: "local_business_referral",
  },
];

// Charleston-area locations
export const charlestonLocations = [
  "1234 Meeting Street, Charleston, SC 29401",
  "Charleston Harbor Resort & Marina, 20 Patriots Point Rd, Mt Pleasant, SC 29464",
  "Magnolia Plantation and Gardens, 3550 Ashley River Rd, Charleston, SC 29414",
  "Boone Hall Plantation, 1235 Long Point Rd, Mt Pleasant, SC 29464",
  "The Cedar Room, 701 E Bay St, Charleston, SC 29403",
  "Harborside East, 21 Patriots Point Rd, Mt Pleasant, SC 29464",
  "Lowndes Grove Plantation, 266 St Margaret St, Charleston, SC 29403",
  "Middleton Place, 4300 Ashley River Rd, Charleston, SC 29414",
  "Charleston Yacht Club, 1 Lockwood Dr, Charleston, SC 29401",
  "Riverfront Park, 1061 Everglades Ave, Mt Pleasant, SC 29464",
  "Palmetto Islands County Park, 444 Needlerush Pkwy, Mt Pleasant, SC 29464",
  "The Gaillard Center, 95 Calhoun St, Charleston, SC 29401",
  "Charleston Air Force Base, Joint Base Charleston, SC 29404",
  "The Citadel, 171 Moultrie St, Charleston, SC 29409",
  "Patriot's Point Naval & Maritime Museum, 40 Patriots Point Rd, Mt Pleasant, SC 29464",
];

// Contact name variations
export const corporateContactNames = [
  "Jennifer Martinez",
  "Robert Chen",
  "Sarah Thompson",
  "Michael Patterson",
  "Lisa Anderson",
  "David Wilson",
  "Amanda Foster",
  "James Cooper",
  "Maria Garcia",
  "Christopher Lee",
];

export const weddingContactNames = [
  "Sarah & Michael Johnson",
  "Emily & David Martinez",
  "Amanda & Christopher Hayes",
  "Jessica & Ryan Thompson",
  "Lauren & Matthew Wilson",
  "Rebecca & Daniel Anderson",
  "Olivia & Jacob Miller",
  "Rachel & Benjamin Davis",
];

export const militaryContactNames = [
  "Capt. Robert Hayes",
  "MSgt. Jennifer Williams",
  "Col. Marcus Thompson",
  "Lt. Sarah Anderson",
  "Maj. David Foster",
  "CMSgt. Patricia Johnson",
  "Capt. Michael Rodriguez",
  "Lt.Col. James Mitchell",
];
