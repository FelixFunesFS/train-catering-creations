/**
 * MenuItemService - Data access and utility functions for menu items
 * Handles menu data retrieval and ID/name conversions
 */

import { getMenuItems, additionalMenuItems } from '@/data/menuData';

export interface MenuItem {
  id: string;
  name: string;
  isPopular?: boolean;
  isVegetarian?: boolean;
}

export class MenuItemService {
  private static idToNameMap: Record<string, string> | null = null;

  /**
   * Get all menu items organized by category
   */
  static getAllMenuItems() {
    try {
      const items = getMenuItems();
      if (!items || typeof items !== 'object') {
        console.error('Invalid menu items structure');
        return this.getEmptyMenuStructure();
      }
      return items;
    } catch (error) {
      console.error('Error loading menu items:', error);
      return this.getEmptyMenuStructure();
    }
  }

  /**
   * Get empty menu structure as fallback
   */
  private static getEmptyMenuStructure() {
    return {
      appetizers: [],
      entrees: [],
      sides: [],
      desserts: []
    };
  }

  /**
   * Create ID to Name mapping for display
   */
  private static createIdToNameMap(): Record<string, string> {
    if (this.idToNameMap) return this.idToNameMap;

    const map: Record<string, string> = {};
    const allItems = this.getAllMenuItems();
    
    // Add all menu items from main categories
    Object.values(allItems).forEach(items => {
      items.forEach(item => {
        map[item.id] = item.name;
      });
    });
    
    // Add drinks
    additionalMenuItems.drinks.forEach(drink => {
      map[drink.id] = drink.name;
    });
    
    this.idToNameMap = map;
    return map;
  }

  /**
   * Convert name to ID format
   */
  static nameToId(name: string): string {
    const idMap = this.createIdToNameMap();
    // First check if it's already an ID
    if (idMap[name]) return name;
    // Otherwise convert name to ID
    return name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  }

  /**
   * Get display name from ID or name
   */
  static getDisplayName(idOrName: string): string {
    if (!idOrName) return '';
    
    try {
      const idMap = this.createIdToNameMap();
      return idMap[idOrName] || idOrName;
    } catch (error) {
      console.error('Error getting display name:', error);
      return idOrName;
    }
  }

  /**
   * Get menu options organized by category with metadata
   */
  static getMenuOptions() {
    const allItems = this.getAllMenuItems();
    
    return {
      appetizers: allItems.appetizers.map(item => ({ 
        id: item.id, 
        name: item.name, 
        isPopular: item.isPopular, 
        isVegetarian: item.isVegetarian 
      })),
      sides: allItems.sides.map(item => ({ 
        id: item.id, 
        name: item.name, 
        isPopular: item.isPopular, 
        isVegetarian: item.isVegetarian 
      })),
      desserts: allItems.desserts.map(item => ({ 
        id: item.id, 
        name: item.name, 
        isPopular: item.isPopular, 
        isVegetarian: item.isVegetarian 
      })),
      drinks: additionalMenuItems.drinks.map(drink => ({ 
        id: drink.id, 
        name: drink.name, 
        isPopular: drink.isPopular 
      })),
      proteins: allItems.entrees.map(item => ({ 
        id: item.id, 
        name: item.name, 
        isPopular: item.isPopular, 
        isVegetarian: item.isVegetarian 
      }))
    };
  }

  /**
   * Get available items not in quote or already added
   */
  static getAvailableItems(
    category: string,
    currentItems: string[],
    addedItems: string[]
  ): MenuItem[] {
    const menuOptions = this.getMenuOptions();
    const categoryKey = category.toLowerCase() as keyof ReturnType<typeof this.getMenuOptions>;
    const allItems = menuOptions[categoryKey] || [];
    
    // Normalize current items to IDs
    const normalizedCurrent = currentItems.map(item => this.nameToId(item));
    
    // Filter out items already present or added
    return allItems.filter(item => 
      !normalizedCurrent.includes(item.id) && !addedItems.includes(item.id)
    );
  }

  /**
   * Separate items into popular and regular
   */
  static separateByPopularity(items: MenuItem[]): { popular: MenuItem[], regular: MenuItem[] } {
    return {
      popular: items.filter(item => item.isPopular),
      regular: items.filter(item => !item.isPopular)
    };
  }
}
