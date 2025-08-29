import { convertMenuIdToReadableText, createMealBundleDescription } from './menuNLP';
import { formatPhoneNumber } from './phoneFormatter';

export interface LineItem {
  id: string;
  title: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  category?: string;
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
  primary_protein?: string;
  secondary_protein?: string;
  appetizers: any[];
  sides: any[];
  desserts: any[];
  drinks: any[];
  special_requests?: string;
  estimated_total: number;
  both_proteins_available?: boolean;
}

// Professional name formatting
export const formatCustomerName = (name: string): string => {
  if (!name) return '';
  return name.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

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
    'full_service': 'Full Service Catering',
    'drop_off': 'Drop Off Service',
    'drop_off_with_setup': 'Drop Off with Setup Service'
  };
  
  return serviceTypes[serviceType] || 'Catering Service';
};

// Create meal bundle for 2 proteins
export const createMealBundle = (quote: QuoteRequest): LineItem => {
  const proteins = [quote.primary_protein, quote.secondary_protein].filter(Boolean);
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

// Group multiple appetizers
export const createAppetizersGroup = (appetizers: string[], guestCount: number): LineItem => {
  const formattedAppetizers = appetizers.map(formatMenuDescription);
  
  return {
    id: `appetizers_group_${Date.now()}`,
    title: formattedAppetizers.length > 1 ? 'Appetizers' : 'Appetizer',
    description: formattedAppetizers.join(', '),
    quantity: 1,
    unit_price: 0,
    total_price: 0,
    category: 'appetizer'
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

// Main function to generate professional line items
export const generateProfessionalLineItems = (quote: QuoteRequest): LineItem[] => {
  const lineItems: LineItem[] = [];
  
  // Check if we have 2 proteins for meal bundle
  const hasTwoProteins = quote.primary_protein && quote.secondary_protein;
  
  if (hasTwoProteins) {
    // Create meal bundle for 2 proteins
    lineItems.push(createMealBundle(quote));
    
    // Handle extra sides (beyond first 2)
    if (quote.sides && quote.sides.length > 2) {
      const extraSides = quote.sides.slice(2);
      lineItems.push(createExtraSidesGroup(extraSides, quote.guest_count));
    }
  } else {
    // Single protein - handle individually
    if (quote.primary_protein) {
      lineItems.push({
        id: `protein_${Date.now()}`,
        title: 'Entree',
        description: formatMenuDescription(quote.primary_protein),
        quantity: quote.guest_count,
        unit_price: 0,
        total_price: 0,
        category: 'protein'
      });
    }
    
    // Add all sides individually for single protein
    quote.sides?.forEach((side, index) => {
      lineItems.push({
        id: `side_${Date.now()}_${index}`,
        title: 'Side Dish',
        description: formatMenuDescription(side),
        quantity: quote.guest_count,
        unit_price: 0,
        total_price: 0,
        category: 'side'
      });
    });
    
    // Add drinks
    quote.drinks?.forEach((drink, index) => {
      lineItems.push({
        id: `drink_${Date.now()}_${index}`,
        title: 'Beverage',
        description: formatMenuDescription(drink),
        quantity: quote.guest_count,
        unit_price: 0,
        total_price: 0,
        category: 'drink'
      });
    });
  }
  
  // Add appetizers (grouped if multiple)
  if (quote.appetizers && quote.appetizers.length > 0) {
    lineItems.unshift(createAppetizersGroup(quote.appetizers, quote.guest_count));
  }
  
  // Add desserts (grouped if multiple)
  if (quote.desserts && quote.desserts.length > 0) {
    lineItems.push(createDessertsGroup(quote.desserts, quote.guest_count));
  }
  
  // Add service charge
  lineItems.push(createServiceCharge(quote.service_type));
  
  return lineItems;
};