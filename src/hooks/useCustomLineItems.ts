import { useMemo } from 'react';
import { useLineItems } from './useLineItems';

// Categories that are auto-generated from menu selections
const AUTO_GENERATED_CATEGORIES = [
  'package', 'proteins', 'sides', 'appetizers', 'desserts', 
  'dietary', 'service', 'supplies', 'equipment', 'beverages'
];

/**
 * Hook to filter and return only custom/manually-added line items
 * These are items that weren't auto-generated from menu selections
 */
export function useCustomLineItems(invoiceId: string | null) {
  const { data: lineItems = [], isLoading, error } = useLineItems(invoiceId);

  const customItems = useMemo(() => {
    return lineItems.filter(item => {
      const category = item.category?.toLowerCase() || '';
      // Custom items have 'food', 'other', or unrecognized categories
      return category === 'food' || 
             category === 'other' || 
             !AUTO_GENERATED_CATEGORIES.includes(category);
    });
  }, [lineItems]);

  return {
    customItems,
    hasCustomItems: customItems.length > 0,
    isLoading,
    error,
  };
}
