/**
 * Centralized text formatting utilities for professional display
 */

/**
 * Format category names for display
 */
export const formatCategory = (category: string): string => {
  const categoryMap: Record<string, string> = {
    'package': 'Package',
    'appetizers': 'Appetizers',
    'appetizer': 'Appetizers',
    'sides': 'Sides',
    'side': 'Sides',
    'beverages': 'Beverages',
    'desserts': 'Desserts',
    'dessert': 'Desserts',
    'service': 'Service',
    'service_addon': 'Service Add-on',
    'equipment': 'Equipment',
    'meal_bundle': 'Meal Bundle',
    'other': 'Other'
  };
  
  return categoryMap[category.toLowerCase()] || 
         category.charAt(0).toUpperCase() + category.slice(1);
};

/**
 * Format event type for display
 */
export const formatEventType = (eventType: string): string => {
  const eventTypeMap: Record<string, string> = {
    'wedding': 'Wedding',
    'second_wedding': 'Second Wedding',
    'birthday': 'Birthday',
    'corporate': 'Corporate Event',
    'graduation': 'Graduation',
    'anniversary': 'Anniversary',
    'baby_shower': 'Baby Shower',
    'bridal_shower': 'Bridal Shower',
    'retirement': 'Retirement',
    'holiday': 'Holiday',
    'other': 'Other Event'
  };
  
  return eventTypeMap[eventType.toLowerCase()] || 
         eventType
           .replace(/_/g, ' ')
           .split(' ')
           .map(word => word.charAt(0).toUpperCase() + word.slice(1))
           .join(' ');
};

/**
 * Ensure title case for line item titles
 */
export const formatLineItemTitle = (title: string): string => {
  const minorWords = ['a', 'an', 'and', 'the', 'with', 'for', 'of'];
  
  return title
    .split(' ')
    .map((word, index) => {
      // Always capitalize first word and words not in minorWords list
      if (index === 0 || !minorWords.includes(word.toLowerCase())) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
      return word.toLowerCase();
    })
    .join(' ');
};

/**
 * Format event name for display (Title Case)
 */
export const formatEventName = (name: string): string => {
  if (!name) return '';
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Format location with intelligent title casing
 * Handles: "charleston, sc" → "Charleston, SC"
 */
export const formatLocation = (location: string): string => {
  if (!location) return '';
  
  // Split by comma for city, state handling
  const parts = location.split(',').map(part => part.trim());
  
  return parts.map((part, index) => {
    // Last part is often a state abbreviation (keep uppercase)
    if (index === parts.length - 1 && part.length === 2) {
      return part.toUpperCase();
    }
    
    // Title case for everything else
    return part
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }).join(', ');
};

/**
 * Format customer name for display (Title Case)
 */
export const formatCustomerName = (name: string): string => {
  if (!name) return '';
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};
