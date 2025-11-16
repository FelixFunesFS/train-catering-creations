interface QuoteRequest {
  id: string;
  guest_count: number;
  service_type: string;
  primary_protein?: string;
  secondary_protein?: string;
  sides?: any;
  appetizers?: any;
  desserts?: any;
  drinks?: any;
  wait_staff_requested?: boolean;
  ceremony_included?: boolean;
  cocktail_hour?: boolean;
  plates_requested?: boolean;
  cups_requested?: boolean;
  napkins_requested?: boolean;
  chafers_requested?: boolean;
  serving_utensils_requested?: boolean;
  ice_requested?: boolean;
}

interface MenuLineItem {
  title: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  category: string;
}

export class MenuLineItemsGenerator {
  static generateFromQuote(quote: QuoteRequest): MenuLineItem[] {
    const items: MenuLineItem[] = [];
    const guestCount = quote.guest_count;
    
    // 1. MAIN MEAL PACKAGE (First 2 proteins + First 2 sides + All drinks)
    const mainMealComponents: string[] = [];
    
    // Collect first 2 proteins
    if (quote.primary_protein) {
      mainMealComponents.push(this.formatMenuItem(quote.primary_protein));
    }
    if (quote.secondary_protein) {
      mainMealComponents.push(this.formatMenuItem(quote.secondary_protein));
    }
    
    // Collect first 2 sides
    const sides = Array.isArray(quote.sides) ? quote.sides : [];
    const first2Sides = sides.slice(0, 2);
    first2Sides.forEach(side => {
      mainMealComponents.push(this.formatMenuItem(side));
    });
    
    // Collect all drinks
    const drinks = Array.isArray(quote.drinks) ? quote.drinks : [];
    drinks.forEach(drink => {
      mainMealComponents.push(this.formatMenuItem(drink));
    });
    
    // Create Main Meal Package if we have any components
    if (mainMealComponents.length > 0) {
      items.push({
        title: 'Main Meal Package',
        description: mainMealComponents.join(', '),
        quantity: guestCount,
        unit_price: 0,
        total_price: 0,
        category: 'Main Meal'
      });
    }
    
    // 2. ADDITIONAL SIDES (beyond first 2)
    const additionalSides = sides.slice(2);
    if (additionalSides.length > 0) {
      items.push({
        title: `Additional Sides (${additionalSides.length})`,
        description: additionalSides.map(s => this.formatMenuItem(s)).join(', '),
        quantity: guestCount,
        unit_price: 0,
        total_price: 0,
        category: 'Side'
      });
    }
    
    // 3. APPETIZERS (grouped - first 2 and additional)
    const appetizers = Array.isArray(quote.appetizers) ? quote.appetizers : [];
    if (appetizers.length > 0) {
      const first2Apps = appetizers.slice(0, 2);
      const additionalApps = appetizers.slice(2);
      
      items.push({
        title: `Appetizers (${first2Apps.length})`,
        description: first2Apps.map(a => this.formatMenuItem(a)).join(', '),
        quantity: guestCount,
        unit_price: 0,
        total_price: 0,
        category: 'Appetizer'
      });
      
      if (additionalApps.length > 0) {
        items.push({
          title: `Additional Appetizers (${additionalApps.length})`,
          description: additionalApps.map(a => this.formatMenuItem(a)).join(', '),
          quantity: guestCount,
          unit_price: 0,
          total_price: 0,
          category: 'Appetizer'
        });
      }
    }
    
    // 4. DESSERTS (grouped - first 2 and additional)
    const desserts = Array.isArray(quote.desserts) ? quote.desserts : [];
    if (desserts.length > 0) {
      const first2Desserts = desserts.slice(0, 2);
      const additionalDesserts = desserts.slice(2);
      
      items.push({
        title: `Desserts (${first2Desserts.length})`,
        description: first2Desserts.map(d => this.formatMenuItem(d)).join(', '),
        quantity: guestCount,
        unit_price: 0,
        total_price: 0,
        category: 'Dessert'
      });
      
      if (additionalDesserts.length > 0) {
        items.push({
          title: `Additional Desserts (${additionalDesserts.length})`,
          description: additionalDesserts.map(d => this.formatMenuItem(d)).join(', '),
          quantity: guestCount,
          unit_price: 0,
          total_price: 0,
          category: 'Dessert'
        });
      }
    }
    
    // 5. SERVICE TYPE (Delivery, Setup, Full-Service)
    items.push({
      title: this.formatServiceType(quote.service_type),
      description: `Service for ${guestCount} guests`,
      quantity: 1,
      unit_price: 0,
      total_price: 0,
      category: 'Service'
    });
    
    // 6. WAIT STAFF (if requested)
    if (quote.wait_staff_requested) {
      const staffCount = Math.ceil(guestCount / 25);
      const estimatedHours = 4;
      items.push({
        title: 'Wait Staff Service',
        description: `Estimated ${staffCount} staff members for ${estimatedHours} hours`,
        quantity: staffCount * estimatedHours,
        unit_price: 0,
        total_price: 0,
        category: 'Service'
      });
    }
    
    // 7. CEREMONY SERVICE (if included)
    if (quote.ceremony_included) {
      items.push({
        title: 'Ceremony Service',
        description: 'Food service during ceremony',
        quantity: 1,
        unit_price: 0,
        total_price: 0,
        category: 'Service'
      });
    }
    
    // 8. COCKTAIL HOUR (if included)
    if (quote.cocktail_hour) {
      items.push({
        title: 'Cocktail Hour Service',
        description: 'Pre-reception cocktail hour catering',
        quantity: 1,
        unit_price: 0,
        total_price: 0,
        category: 'Service'
      });
    }
    
    // 9. SUPPLIES & EQUIPMENT
    const supplies: string[] = [];
    if (quote.plates_requested) supplies.push('Plates');
    if (quote.cups_requested) supplies.push('Cups');
    if (quote.napkins_requested) supplies.push('Napkins');
    if (quote.serving_utensils_requested) supplies.push('Serving Utensils');
    
    if (supplies.length > 0) {
      items.push({
        title: 'Disposable Supplies',
        description: `${supplies.join(', ')} for ${guestCount} guests`,
        quantity: guestCount,
        unit_price: 0,
        total_price: 0,
        category: 'Supplies'
      });
    }
    
    if (quote.chafers_requested) {
      const sidesCount = sides.length;
      const chaferCount = Math.ceil(sidesCount / 2);
      items.push({
        title: 'Chafer Rental',
        description: `${chaferCount} chafers for buffet service`,
        quantity: chaferCount,
        unit_price: 0,
        total_price: 0,
        category: 'Equipment'
      });
    }
    
    if (quote.ice_requested) {
      items.push({
        title: 'Ice Service',
        description: 'Ice for beverages',
        quantity: 1,
        unit_price: 0,
        total_price: 0,
        category: 'Supplies'
      });
    }
    
    return items;
  }
  
  private static formatMenuItem(item: string): string {
    return item
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  private static formatServiceType(serviceType: string): string {
    const mapping: Record<string, string> = {
      'drop-off': 'Drop-Off Delivery',
      'delivery-only': 'Delivery Only',
      'delivery-setup': 'Delivery & Setup',
      'full-service': 'Full-Service Catering'
    };
    return mapping[serviceType] || serviceType;
  }
}
