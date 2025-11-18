import type { Database } from '@/integrations/supabase/types';

type QuoteInsert = Database['public']['Tables']['quote_requests']['Insert'];

/**
 * Base test quote with commonly used values
 */
const baseTestQuote: Partial<QuoteInsert> = {
  contact_name: 'Test User',
  email: 'test@example.com',
  phone: '843-555-0100',
  event_name: 'Test Event',
  event_type: 'corporate',
  guest_count: 50,
  location: '123 Test St, Charleston, SC 29401',
  service_type: 'delivery-setup',
  start_time: '18:00',
  serving_start_time: '18:30',
  workflow_status: 'pending',
};

/**
 * Generate a unique email for test isolation
 */
export function generateTestEmail(suffix?: string) {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `test-${timestamp}-${random}${suffix ? `-${suffix}` : ''}@test.example.com`;
}

/**
 * Generate event date (default: 30 days from now)
 */
export function generateEventDate(daysFromNow: number = 30): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
}

/**
 * Corporate event quote (50-100 guests)
 */
export function createCorporateQuote(overrides?: Partial<QuoteInsert>): QuoteInsert {
  return {
    ...baseTestQuote,
    email: generateTestEmail('corporate'),
    event_name: 'Annual Company Picnic',
    event_type: 'corporate',
    event_date: generateEventDate(45),
    guest_count: 75,
    primary_protein: 'BBQ Chicken',
    secondary_protein: 'Pulled Pork',
    sides: ['Mac & Cheese', 'Collard Greens'],
    drinks: ['Sweet Tea', 'Lemonade'],
    appetizers: null,
    desserts: null,
    service_type: 'delivery-setup',
    wait_staff_requested: false,
    plates_requested: true,
    cups_requested: true,
    napkins_requested: true,
    utensils: ['Forks', 'Spoons'],
    ...overrides,
  } as QuoteInsert;
}

/**
 * Wedding quote (100-200 guests)
 */
export function createWeddingQuote(overrides?: Partial<QuoteInsert>): QuoteInsert {
  return {
    ...baseTestQuote,
    email: generateTestEmail('wedding'),
    event_name: 'Smith-Johnson Wedding Reception',
    event_type: 'wedding',
    event_date: generateEventDate(90),
    guest_count: 150,
    primary_protein: 'Fried Chicken',
    secondary_protein: 'BBQ Ribs',
    sides: ['Mac & Cheese', 'Green Beans', 'Cornbread'],
    drinks: ['Sweet Tea', 'Lemonade', 'Water'],
    appetizers: ['Deviled Eggs'],
    desserts: ['Peach Cobbler', 'Banana Pudding'],
    service_type: 'full-service',
    wait_staff_requested: true,
    ceremony_included: false,
    cocktail_hour: true,
    plates_requested: true,
    cups_requested: true,
    napkins_requested: true,
    chafers_requested: true,
    utensils: ['Forks', 'Knives', 'Spoons'],
    ...overrides,
  } as QuoteInsert;
}

/**
 * Military function quote (government customer)
 */
export function createMilitaryQuote(overrides?: Partial<QuoteInsert>): QuoteInsert {
  return {
    ...baseTestQuote,
    email: generateTestEmail('military'),
    event_name: 'Retirement Ceremony',
    event_type: 'military_function',
    event_date: generateEventDate(60),
    guest_count: 100,
    primary_protein: 'BBQ Chicken',
    secondary_protein: 'Pulled Pork',
    sides: ['Mac & Cheese', 'Green Beans'],
    drinks: ['Sweet Tea', 'Water'],
    service_type: 'delivery-setup',
    compliance_level: 'government',
    requires_po_number: true,
    po_number: 'PO-TEST-12345',
    plates_requested: true,
    cups_requested: true,
    napkins_requested: true,
    utensils: ['Forks', 'Spoons'],
    ...overrides,
  } as QuoteInsert;
}

/**
 * Small private party quote (10-30 guests)
 */
export function createSmallPartyQuote(overrides?: Partial<QuoteInsert>): QuoteInsert {
  return {
    ...baseTestQuote,
    email: generateTestEmail('party'),
    event_name: 'Birthday Celebration',
    event_type: 'birthday',
    event_date: generateEventDate(21),
    guest_count: 20,
    primary_protein: 'Fried Chicken',
    sides: ['Mac & Cheese', 'Collard Greens'],
    drinks: ['Sweet Tea'],
    service_type: 'delivery-only',
    wait_staff_requested: false,
    plates_requested: true,
    cups_requested: true,
    napkins_requested: true,
    utensils: ['Forks'],
    ...overrides,
  } as QuoteInsert;
}

/**
 * Quote with full menu options (testing max complexity)
 */
export function createFullMenuQuote(overrides?: Partial<QuoteInsert>): QuoteInsert {
  return {
    ...baseTestQuote,
    email: generateTestEmail('full-menu'),
    event_name: 'Holiday Party with Full Menu',
    event_type: 'holiday_party',
    event_date: generateEventDate(60),
    guest_count: 100,
    primary_protein: 'BBQ Chicken',
    secondary_protein: 'Pulled Pork',
    both_proteins_available: true,
    sides: ['Mac & Cheese', 'Collard Greens', 'Green Beans', 'Cornbread'],
    drinks: ['Sweet Tea', 'Lemonade', 'Water'],
    appetizers: ['Deviled Eggs', 'Chicken Wings'],
    desserts: ['Peach Cobbler', 'Banana Pudding', 'Sweet Potato Pie'],
    dietary_restrictions: ['Vegetarian option needed', 'Gluten-free'],
    service_type: 'full-service',
    wait_staff_requested: true,
    wait_staff_requirements: '3 servers for 3 hours',
    bussing_tables_needed: true,
    plates_requested: true,
    cups_requested: true,
    napkins_requested: true,
    chafers_requested: true,
    serving_utensils_requested: true,
    ice_requested: true,
    utensils: ['Forks', 'Knives', 'Spoons'],
    special_requests: 'Need setup by 5pm, extra napkins please',
    ...overrides,
  } as QuoteInsert;
}

/**
 * Minimal quote (testing minimum required fields)
 */
export function createMinimalQuote(overrides?: Partial<QuoteInsert>): QuoteInsert {
  return {
    contact_name: 'Minimal Test',
    email: generateTestEmail('minimal'),
    phone: '843-555-0199',
    event_name: 'Simple Event',
    event_type: 'other',
    event_date: generateEventDate(30),
    guest_count: 25,
    location: '456 Simple Ln, Charleston, SC 29403',
    service_type: 'drop-off',
    start_time: '12:00',
    workflow_status: 'pending',
    ...overrides,
  } as QuoteInsert;
}

/**
 * Quote collections for batch testing
 */
export const quoteCollections = {
  /**
   * Varied event types for comprehensive testing
   */
  varietyPack: [
    createCorporateQuote(),
    createWeddingQuote(),
    createMilitaryQuote(),
    createSmallPartyQuote(),
  ],
  
  /**
   * Same event type with different guest counts
   */
  corporateVariations: [
    createCorporateQuote({ guest_count: 30 }),
    createCorporateQuote({ guest_count: 75 }),
    createCorporateQuote({ guest_count: 150 }),
  ],
};
