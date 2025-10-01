/**
 * MenuChangeManager - Business logic for menu change operations
 * Follows Single Responsibility Principle - handles only menu change logic
 */

export interface MenuChanges {
  proteins: { remove: string[], add: string[], substitute: Record<string, string> };
  appetizers: { remove: string[], add: string[], substitute: Record<string, string> };
  sides: { remove: string[], add: string[], substitute: Record<string, string> };
  desserts: { remove: string[], add: string[], substitute: Record<string, string> };
  drinks: { remove: string[], add: string[], substitute: Record<string, string> };
  dietary_restrictions: { add: string[] };
  service_options: Record<string, boolean>;
  custom_requests: string;
}

export interface Quote {
  primary_protein?: string;
  secondary_protein?: string;
  appetizers?: any;
  sides?: any;
  desserts?: any;
  drinks?: any;
}

export class MenuChangeManager {
  /**
   * Initialize empty menu changes structure
   */
  static createEmptyChanges(): MenuChanges {
    return {
      proteins: { remove: [], add: [], substitute: {} },
      appetizers: { remove: [], add: [], substitute: {} },
      sides: { remove: [], add: [], substitute: {} },
      desserts: { remove: [], add: [], substitute: {} },
      drinks: { remove: [], add: [], substitute: {} },
      dietary_restrictions: { add: [] },
      service_options: {},
      custom_requests: ''
    };
  }

  /**
   * Check if any changes have been made
   */
  static hasChanges(changes: MenuChanges): boolean {
    return (
      changes.proteins.remove.length > 0 ||
      changes.proteins.add.length > 0 ||
      changes.appetizers.remove.length > 0 ||
      changes.appetizers.add.length > 0 ||
      changes.sides.remove.length > 0 ||
      changes.sides.add.length > 0 ||
      changes.desserts.remove.length > 0 ||
      changes.desserts.add.length > 0 ||
      changes.drinks.remove.length > 0 ||
      changes.drinks.add.length > 0 ||
      Object.keys(changes.service_options).length > 0 ||
      changes.custom_requests.trim().length > 0
    );
  }

  /**
   * Toggle removal of an item
   */
  static toggleRemoval(
    changes: MenuChanges,
    category: keyof Pick<MenuChanges, 'proteins' | 'appetizers' | 'sides' | 'desserts' | 'drinks'>,
    itemId: string
  ): MenuChanges {
    const updated = { ...changes };
    const removeList = updated[category].remove || [];
    
    if (removeList.includes(itemId)) {
      updated[category].remove = removeList.filter((i: string) => i !== itemId);
    } else {
      updated[category].remove = [...removeList, itemId];
    }
    
    return updated;
  }

  /**
   * Add an item to a category
   */
  static addItem(
    changes: MenuChanges,
    category: keyof Pick<MenuChanges, 'proteins' | 'appetizers' | 'sides' | 'desserts' | 'drinks'>,
    itemId: string
  ): MenuChanges {
    if (!itemId) return changes;
    
    const updated = { ...changes };
    const addList = updated[category].add || [];
    
    if (!addList.includes(itemId)) {
      updated[category].add = [...addList, itemId];
    }
    
    return updated;
  }

  /**
   * Remove an added item
   */
  static removeAddition(
    changes: MenuChanges,
    category: keyof Pick<MenuChanges, 'proteins' | 'appetizers' | 'sides' | 'desserts' | 'drinks'>,
    itemId: string
  ): MenuChanges {
    const updated = { ...changes };
    updated[category].add = (updated[category].add || []).filter((i: string) => i !== itemId);
    return updated;
  }

  /**
   * Update service options
   */
  static toggleService(
    changes: MenuChanges,
    service: string,
    checked: boolean
  ): MenuChanges {
    return {
      ...changes,
      service_options: {
        ...changes.service_options,
        [service]: checked
      }
    };
  }

  /**
   * Update custom requests
   */
  static updateCustomRequests(
    changes: MenuChanges,
    value: string
  ): MenuChanges {
    return { ...changes, custom_requests: value };
  }

  /**
   * Parse proteins from quote field
   */
  static parseProteins(proteinField: any): string[] {
    if (!proteinField) return [];
    if (typeof proteinField === 'string') {
      return proteinField.split(',').map(p => p.trim()).filter(Boolean);
    }
    return [];
  }

  /**
   * Format array field from quote
   */
  static formatArrayField(field: any): string[] {
    if (Array.isArray(field)) return field;
    if (typeof field === 'string') {
      try {
        const parsed = JSON.parse(field);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return field.split(',').map(item => item.trim()).filter(Boolean);
      }
    }
    return [];
  }

  /**
   * Get all proteins from quote
   */
  static getAllProteins(quote: Quote): string[] {
    const primary = this.parseProteins(quote.primary_protein);
    const secondary = this.parseProteins(quote.secondary_protein);
    return [...primary, ...secondary];
  }

  /**
   * Get current menu items from quote by category
   */
  static getCurrentItems(quote: Quote, category: string): string[] {
    switch (category) {
      case 'proteins':
        return this.getAllProteins(quote);
      case 'appetizers':
        return this.formatArrayField(quote.appetizers);
      case 'sides':
        return this.formatArrayField(quote.sides);
      case 'desserts':
        return this.formatArrayField(quote.desserts);
      case 'drinks':
        return this.formatArrayField(quote.drinks);
      default:
        return [];
    }
  }
}
