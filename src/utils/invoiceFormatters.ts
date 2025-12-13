import { convertMenuIdToReadableText, createMealBundleDescription } from './menuNLP';
import { formatPhoneNumber } from './phoneFormatter';
import { formatEventType, formatCustomerName as formatCustomerNameUtil } from './textFormatters';

export interface LineItem {
  id: string;
  title: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  category?: string;
  metadata?: {
    isNew?: boolean;
    isModified?: boolean;
    quantityChanged?: boolean;
    previousQuantity?: number;
    previousPrice?: number;
    source?: string;
    sourceField?: string;
  };
}

export interface QuoteRequest {
  id: string;
  contact_name: string;
  email: string;
  phone: string;
  event_name: string;
  event_date: string;
  event_type: string;
  start_time: string;
  location: string;
  guest_count: number;
  service_type: string;
  status?: string;
  workflow_status?: string;
  proteins?: string[]; // JSONB array from database
  appetizers: any[];
  sides: any[];
  desserts: any[];
  drinks: any[];
  special_requests?: string;
  estimated_total: number;
  both_proteins_available?: boolean;
  bussing_tables_needed?: boolean;
  guest_count_with_restrictions?: string;
  chafers_requested?: boolean;
  tables_chairs_requested?: boolean;
  linens_requested?: boolean;
  wait_staff_requested?: boolean;
  dietary_restrictions?: any[];
}

// Professional name formatting (re-export from textFormatters)
export const formatCustomerName = formatCustomerNameUtil;

// Professional phone formatting
export const formatCustomerPhone = (phone: string): string => {
  return formatPhoneNumber(phone);
};

// Clean menu description formatting
export const formatMenuDescription = (description: string): string => {
  if (!description) return '';
  
  // Use NLP utility first, then clean up further
  const cleaned = convertMenuIdToReadableText(description);
  
  // Remove any remaining dashes and ensure proper capitalization
  return cleaned
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .trim();
};

// Format service type professionally
export const formatServiceType = (serviceType: string): string => {
  const serviceTypes: Record<string, string> = {
    'full-service': 'Full Service Catering',
    'delivery-setup': 'Delivery with Setup',
    'drop-off': 'Drop Off Delivery',
    // Legacy support
    'full_service': 'Full Service Catering',
    'drop_off': 'Drop Off Delivery',
    'drop_off_with_setup': 'Delivery with Setup'
  };
  
  return serviceTypes[serviceType] || 'Catering Service';
};

// Create meal bundle for proteins
export const createMealBundle = (quote: QuoteRequest): LineItem => {
  const proteins = getSelectedProteins(quote);
  const sides = Array.isArray(quote.sides) ? quote.sides.slice(0, 2) : [];
  const drinks = Array.isArray(quote.drinks) ? quote.drinks : [];
  
  // Create description WITHOUT guest count (quantity shows this)
  const proteinText = proteins.map(formatMenuDescription).join(' & ');
  const sidesText = sides.slice(0, 2).map(formatMenuDescription).join(' and ');
  const drinkText = drinks.length > 0 ? formatMenuDescription(drinks[0]) : '';
  
  let description = proteinText;
  if (sidesText) description += ` with ${sidesText}`;
  description += ', dinner rolls'; // Always include rolls for meal bundles
  if (drinkText) description += ` and ${drinkText}`;
  
  return {
    id: `meal_bundle_${Date.now()}`,
    title: 'Entree Meals',
    description: description,
    quantity: quote.guest_count,
    unit_price: 0,
    total_price: 0,
    category: 'meal_bundle'
  };
};

// Group multiple appetizers with proper quantity logic
export const createAppetizersGroup = (appetizers: string[], guestCount: number): LineItem => {
  // Separate vegan/vegetarian items from regular appetizers
  const veganVegItems = appetizers.filter(app => 
    app.toLowerCase().includes('vegan') || 
    app.toLowerCase().includes('vegetarian') ||
    app.toLowerCase().includes('veggie')
  );
  
  const regularItems = appetizers.filter(app => 
    !app.toLowerCase().includes('vegan') && 
    !app.toLowerCase().includes('vegetarian') &&
    !app.toLowerCase().includes('veggie')
  );
  
  // Use regular items for main appetizer group
  const formattedAppetizers = regularItems.map(formatMenuDescription);
  
  return {
    id: `appetizers_group_${Date.now()}`,
    title: formattedAppetizers.length > 1 ? 'Appetizers' : 'Appetizer',
    description: formattedAppetizers.join(', '),
    quantity: guestCount, // Updated to use guest count
    unit_price: 0,
    total_price: 0,
    category: 'appetizer'
  };
};

// Create separate line item for vegan/vegetarian appetizers
export const createVeganVegAppetizersGroup = (appetizers: string[], restrictionCount: number): LineItem | null => {
  const veganVegItems = appetizers.filter(app => 
    app.toLowerCase().includes('vegan') || 
    app.toLowerCase().includes('vegetarian') ||
    app.toLowerCase().includes('veggie')
  );
  
  if (veganVegItems.length === 0) return null;
  
  const formattedAppetizers = veganVegItems.map(formatMenuDescription);
  
  return {
    id: `vegan_veg_appetizers_${Date.now()}`,
    title: formattedAppetizers.length > 1 ? 'Vegan/Vegetarian Appetizers' : 'Vegan/Vegetarian Appetizer',
    description: formattedAppetizers.join(', '),
    quantity: restrictionCount, // Use restriction count
    unit_price: 0,
    total_price: 0,
    category: 'appetizer_dietary'
  };
};

// Group multiple desserts
export const createDessertsGroup = (desserts: string[], guestCount: number): LineItem => {
  const formattedDesserts = desserts.map(formatMenuDescription);
  
  return {
    id: `desserts_group_${Date.now()}`,
    title: formattedDesserts.length > 1 ? 'Desserts' : 'Dessert',
    description: formattedDesserts.join(', '),
    quantity: guestCount,
    unit_price: 0,
    total_price: 0,
    category: 'dessert'
  };
};

// Create extra sides group (beyond first 2)
export const createExtraSidesGroup = (sides: string[], guestCount: number): LineItem => {
  const formattedSides = sides.map(formatMenuDescription);
  
  return {
    id: `extra_sides_group_${Date.now()}`,
    title: formattedSides.length > 1 ? 'Additional Sides' : 'Additional Side',
    description: formattedSides.join(', '),
    quantity: guestCount,
    unit_price: 0,
    total_price: 0,
    category: 'side'
  };
};

// Create service charge
export const createServiceCharge = (serviceType: string): LineItem => {
  return {
    id: `service_${Date.now()}`,
    title: 'Service Charge',
    description: formatServiceType(serviceType),
    quantity: 1,
    unit_price: 0,
    total_price: 0,
    category: 'service'
  };
};

// Create bussing tables service add-on
export const createBussingTablesService = (): LineItem => {
  return {
    id: `bussing_service_${Date.now()}`,
    title: 'Table Bussing Service',
    description: 'Professional table clearing and maintenance during event',
    quantity: 1,
    unit_price: 0,
    total_price: 0,
    category: 'service_addon'
  };
};

// Main function to generate professional line items with 5-tier grouping
export const generateProfessionalLineItems = (quote: QuoteRequest): LineItem[] => {
  const lineItems: LineItem[] = [];
  
  // TIER 1: CATERING PACKAGE - Main proteins and included items
  const proteins = getSelectedProteins(quote);
  if (proteins.length > 0) {
    lineItems.push(createCateringPackage(quote, proteins));
  }
  
  // TIER 2: APPETIZER SELECTION - Grouped appetizers
  if (quote.appetizers && quote.appetizers.length > 0) {
    lineItems.push(createAppetizerSelection(quote.appetizers, quote.guest_count));
    
    // Handle dietary restriction appetizers separately if needed
    const dietaryAppetizers = quote.appetizers.filter(app => 
      app.toLowerCase().includes('vegan') || 
      app.toLowerCase().includes('vegetarian') ||
      app.toLowerCase().includes('veggie')
    );
    
    if (dietaryAppetizers.length > 0) {
      const restrictionCount = Math.max(1, Math.floor(quote.guest_count * 0.1));
      lineItems.push(createDietaryAppetizerSelection(dietaryAppetizers, restrictionCount));
    }
  }
  
  // TIER 3: SIDES & BEVERAGES - Grouped by category
  const extraSides = getExtraSides(quote);
  if (extraSides.length > 0) {
    lineItems.push(createSideSelection(extraSides, quote.guest_count));
  }
  
  if (quote.drinks && quote.drinks.length > 0) {
    lineItems.push(createBeverageService(quote.drinks, quote.guest_count));
  }
  
  // TIER 4: DESSERT SELECTION - Grouped desserts
  if (quote.desserts && quote.desserts.length > 0) {
    lineItems.push(createDessertSelection(quote.desserts, quote.guest_count));
  }
  
  // TIER 5: SERVICE FEES - Service type and add-ons
  lineItems.push(createServicePackage(quote));
  
  // Staff services (track source from customer form)
  if (quote.wait_staff_requested) {
    lineItems.push(createServiceAddon('Wait Staff Service', 'Professional wait staff for serving and guest assistance', 'wait_staff_requested'));
  }
  if (quote.bussing_tables_needed) {
    lineItems.push(createServiceAddon('Table Bussing Service', 'Professional table clearing and maintenance during event', 'bussing_tables_needed'));
  }

  // Equipment rentals (track source from customer form)
  if (quote.chafers_requested) {
    lineItems.push(createServiceAddon('Chafers (Food Warmers)', 'Stainless steel chafers to keep food warm throughout service', 'chafers_requested'));
  }
  if ((quote as any).serving_utensils_requested) {
    lineItems.push(createServiceAddon('Serving Utensils', 'Professional serving spoons, tongs, and ladles for buffet service', 'serving_utensils_requested'));
  }

  // Dining supplies (track source from customer form)
  if ((quote as any).plates_requested) {
    lineItems.push(createServiceAddon('Disposable Plates', 'High-quality disposable plates for guest dining', 'plates_requested'));
  }
  if ((quote as any).cups_requested) {
    lineItems.push(createServiceAddon('Disposable Cups', 'Disposable cups for beverage service', 'cups_requested'));
  }
  if ((quote as any).napkins_requested) {
    lineItems.push(createServiceAddon('Disposable Napkins', 'Napkins for guest use during dining', 'napkins_requested'));
  }
  if ((quote as any).ice_requested) {
    lineItems.push(createServiceAddon('Ice Service', 'Bagged ice for beverage service and cooling', 'ice_requested'));
  }
  
  return lineItems;
};

// Helper functions for the new 5-tier structure
function getSelectedProteins(quote: QuoteRequest): string[] {
  // Use proteins JSONB array from database (single source of truth)
  if (Array.isArray(quote.proteins)) {
    return quote.proteins.filter(Boolean);
  }
  return [];
}

function createCateringPackage(quote: QuoteRequest, proteins: string[]): LineItem {
  const proteinText = proteins.map(formatMenuDescription).join(' & ');
  const includedSides = quote.sides?.slice(0, 2) || [];
  const sidesText = includedSides.map(formatMenuDescription).join(' and ');
  
  let description = `${proteinText}`;
  if (sidesText) description += ` with ${sidesText}`;
  description += ', dinner rolls';
  
  // Add dietary accommodations if present
  if (quote.guest_count_with_restrictions) {
    description += ` (includes accommodations for ${quote.guest_count_with_restrictions})`;
  }
  
  return {
    id: `catering_package_${Date.now()}`,
    title: `Catering Package - ${formatEventType(quote.event_type || 'Event')}`,
    description: description,
    quantity: quote.guest_count,
    unit_price: 0,
    total_price: 0,
    category: 'package'
  };
}

function createAppetizerSelection(appetizers: string[], guestCount: number): LineItem {
  // Filter out dietary-specific appetizers
  const regularAppetizers = appetizers.filter(app => 
    !app.toLowerCase().includes('vegan') && 
    !app.toLowerCase().includes('vegetarian') &&
    !app.toLowerCase().includes('veggie')
  );
  
  const formattedAppetizers = regularAppetizers.map(formatMenuDescription);
  
  return {
    id: `appetizer_selection_${Date.now()}`,
    title: 'Appetizer Selection',
    description: formattedAppetizers.join(', '),
    quantity: guestCount,
    unit_price: 0,
    total_price: 0,
    category: 'appetizers'
  };
}

function createDietaryAppetizerSelection(dietaryAppetizers: string[], restrictionCount: number): LineItem {
  const formattedAppetizers = dietaryAppetizers.map(formatMenuDescription);
  
  return {
    id: `dietary_appetizer_selection_${Date.now()}`,
    title: 'Dietary Appetizer Selection',
    description: `${formattedAppetizers.join(', ')} (for guests with dietary restrictions)`,
    quantity: restrictionCount,
    unit_price: 0,
    total_price: 0,
    category: 'appetizers'
  };
}

function getExtraSides(quote: QuoteRequest): string[] {
  // Return sides beyond the first 2 (which are included in the package)
  return quote.sides?.slice(2) || [];
}

function createSideSelection(sides: string[], guestCount: number): LineItem {
  const formattedSides = sides.map(formatMenuDescription);
  
  return {
    id: `side_selection_${Date.now()}`,
    title: 'Additional Side Selection',
    description: formattedSides.join(', '),
    quantity: guestCount,
    unit_price: 0,
    total_price: 0,
    category: 'sides'
  };
}

function createBeverageService(drinks: string[], guestCount: number): LineItem {
  const formattedDrinks = drinks.map(formatMenuDescription);
  
  return {
    id: `beverage_service_${Date.now()}`,
    title: 'Beverage Service',
    description: formattedDrinks.join(', '),
    quantity: guestCount,
    unit_price: 0,
    total_price: 0,
    category: 'beverages'
  };
}

function createDessertSelection(desserts: string[], guestCount: number): LineItem {
  const formattedDesserts = desserts.map(formatMenuDescription);
  
  return {
    id: `dessert_selection_${Date.now()}`,
    title: 'Dessert Selection',
    description: formattedDesserts.join(', '),
    quantity: guestCount,
    unit_price: 0,
    total_price: 0,
    category: 'desserts'
  };
}

function createServicePackage(quote: QuoteRequest): LineItem {
  const serviceTypeFormatted = formatServiceType(quote.service_type);
  
  return {
    id: `service_package_${Date.now()}`,
    title: 'Service Package',
    description: serviceTypeFormatted,
    quantity: 1,
    unit_price: 0,
    total_price: 0,
    category: 'service'
  };
}

function createServiceAddon(title: string, description: string, source?: string): LineItem {
  return {
    id: `service_addon_${Date.now()}`,
    title: title,
    description: description,
    quantity: 1,
    unit_price: 0,
    total_price: 0,
    category: 'service',
    metadata: source ? { source: 'customer_request', sourceField: source } : undefined
  } as any;
}