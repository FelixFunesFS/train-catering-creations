import { useState, useCallback, useEffect } from 'react';
import { useLineItemManagement } from '@/hooks/useLineItemManagement';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface LineItem {
  id?: string;
  title: string;
  description: string;
  category: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface PricingTemplate {
  id: string;
  name: string;
  description: string;
  items: LineItem[];
}

interface UseEnhancedPricingManagementProps {
  initialLineItems: LineItem[];
  guestCount?: number;
  taxRate?: number;
  autoSave?: boolean;
  invoiceId?: string;
  onTotalsChange?: (totals: { subtotal: number; tax_amount: number; total_amount: number }) => void;
}

export function useEnhancedPricingManagement({
  initialLineItems,
  guestCount = 50,
  taxRate = 8.0,
  autoSave = false,
  invoiceId,
  onTotalsChange
}: UseEnhancedPricingManagementProps) {
  const [pricingRules, setPricingRules] = useState([]);
  const [templates, setTemplates] = useState<PricingTemplate[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [validationErrors, setValidationErrors] = useState<any[]>([]);
  const { toast } = useToast();

  // Use the existing line item management hook
  const lineItemHook = useLineItemManagement({
    initialLineItems,
    taxRate,
    autoSave,
    autoSaveDelay: 2000,
    invoiceId,
    onTotalsChange
  });

  useEffect(() => {
    // Remove pricing rules loading - using manual pricing only
    loadTemplates();
  }, []);

  // Remove pricing rules loading - manual pricing only
  const loadPricingRules = () => {
    // No automatic pricing rules - manual pricing only
    setPricingRules([]);
  };

  const loadTemplates = () => {
    // Load default templates with structure only (no pricing)
    const defaultTemplates: PricingTemplate[] = [
      {
        id: 'casual-buffet',
        name: 'Casual Buffet Package',
        description: 'Perfect for informal gatherings - prices must be set manually',
        items: []
      },
      {
        id: 'formal-dinner',
        name: 'Formal Plated Service',
        description: 'Elegant sit-down dining - prices must be set manually',
        items: []
      },
      {
        id: 'corporate-lunch',
        name: 'Corporate Lunch',
        description: 'Professional catering - prices must be set manually',
        items: []
      }
    ];
    setTemplates(defaultTemplates);
  };

  // Remove automatic pricing calculation - manual pricing only
  const calculatePricingFromRules = useCallback((itemName: string) => {
    // Always return 0 for manual pricing
    return 0;
  }, []);

  const addItemFromTemplate = useCallback((templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    // Get predefined items for this template
    const templateItemNames = getTemplateItemNames(templateId);
    
    templateItemNames.forEach(itemName => {
      const price = calculatePricingFromRules(itemName);
      const newItem: LineItem = {
        title: itemName,
        description: `${templateId} template item`,
        category: getCategoryForItem(itemName),
        quantity: 1,
        unit_price: price,
        total_price: price
      };
      lineItemHook.addLineItem(newItem);
    });

    toast({
      title: "Template Applied",
      description: `Added ${templateItemNames.length} items from ${template.name} - manual pricing required`,
    });
  }, [templates, lineItemHook, toast]);

  const getTemplateItemNames = (templateId: string): string[] => {
    const templates: { [key: string]: string[] } = {
      'casual-buffet': ['Pulled Pork', 'Fried Chicken', 'Mac and Cheese', 'Coleslaw', 'Cornbread', 'Sweet Tea', 'Buffet Service'],
      'formal-dinner': ['Beef Brisket', 'Green Beans', 'Mashed Potatoes', 'Cornbread', 'Peach Cobbler', 'Coffee Service', 'Plated Service'],
      'corporate-lunch': ['Fried Chicken', 'Potato Salad', 'Green Beans', 'Cornbread', 'Soft Drinks', 'Delivery & Setup']
    };
    return templates[templateId] || [];
  };

  const getCategoryForItem = (itemName: string): string => {
    const categoryMap: { [key: string]: string } = {
      'Pulled Pork': 'protein',
      'Fried Chicken': 'protein',
      'Beef Brisket': 'protein',
      'Mac and Cheese': 'side',
      'Coleslaw': 'side',
      'Green Beans': 'side',
      'Mashed Potatoes': 'side',
      'Potato Salad': 'side',
      'Cornbread': 'side',
      'Peach Cobbler': 'dessert',
      'Sweet Tea': 'drink',
      'Soft Drinks': 'drink',
      'Coffee Service': 'drink',
      'Buffet Service': 'service',
      'Plated Service': 'service',
      'Delivery & Setup': 'service'
    };
    return categoryMap[itemName] || 'other';
  };

  const validatePricing = useCallback(() => {
    const errors = [];
    const lineItems = lineItemHook.lineItems;

    // Check for zero prices
    const zeroPriceItems = lineItems.filter(item => item.unit_price === 0 || item.total_price === 0);
    if (zeroPriceItems.length > 0) {
      errors.push({
        type: 'error',
        message: `${zeroPriceItems.length} items have zero pricing`,
        items: zeroPriceItems
      });
    }

    // Check for missing essential categories
    const categories = new Set(lineItems.map(item => item.category));
    const essentialCategories = ['protein', 'service'];
    const missing = essentialCategories.filter(cat => !categories.has(cat));
    
    if (missing.length > 0) {
      errors.push({
        type: 'warning',
        message: `Missing essential categories: ${missing.join(', ')}`,
        items: []
      });
    }

    // Check per-person pricing reasonableness
    if (guestCount > 0) {
      const total = lineItems.reduce((sum, item) => sum + item.total_price, 0);
      const perPerson = total / guestCount;
      
      if (perPerson < 1500) {
        errors.push({
          type: 'info',
          message: `Low per-person cost: $${(perPerson / 100).toFixed(2)}`,
          items: []
        });
      }
    }

    setValidationErrors(errors);
    return errors;
  }, [lineItemHook.lineItems, guestCount]);

  const applyBulkDiscount = useCallback((percentage: number, itemIds?: string[]) => {
    const targetItems = itemIds || Array.from(selectedItems);
    const multiplier = 1 - (percentage / 100);

    targetItems.forEach(itemId => {
      const item = lineItemHook.lineItems.find(i => i.id === itemId);
      if (item) {
        const newUnitPrice = Math.round(item.unit_price * multiplier);
        lineItemHook.updateLineItem(itemId, {
          unit_price: newUnitPrice,
          total_price: newUnitPrice * item.quantity
        });
      }
    });

    toast({
      title: "Discount Applied",
      description: `Applied ${percentage}% discount to ${targetItems.length} items`,
    });
  }, [selectedItems, lineItemHook, toast]);

  // Remove auto-fix functionality - manual pricing only
  const fixZeroPriceItems = useCallback(() => {
    toast({
      title: "Manual Pricing Required",
      description: "Please set prices manually for each item. No automatic pricing is available.",
      variant: "destructive"
    });
  }, [toast]);

  const duplicateSelectedItems = useCallback(() => {
    const targetItems = Array.from(selectedItems);
    targetItems.forEach(itemId => {
      const item = lineItemHook.lineItems.find(i => i.id === itemId);
      if (item) {
        const duplicatedItem = {
          ...item,
          id: undefined,
          title: `${item.title} (Copy)`
        };
        lineItemHook.addLineItem(duplicatedItem);
      }
    });

    setSelectedItems(new Set());
    toast({
      title: "Items Duplicated",
      description: `Created ${targetItems.length} duplicate items`,
    });
  }, [selectedItems, lineItemHook, toast]);

  const deleteSelectedItems = useCallback(() => {
    const targetItems = Array.from(selectedItems);
    targetItems.forEach(itemId => {
      lineItemHook.removeLineItem(itemId);
    });

    setSelectedItems(new Set());
    toast({
      title: "Items Deleted",
      description: `Removed ${targetItems.length} items`,
    });
  }, [selectedItems, lineItemHook, toast]);

  return {
    // Expose all line item management functionality
    ...lineItemHook,
    
    // Manual pricing functionality (no automatic pricing)
    pricingRules: [], // Always empty for manual pricing
    templates,
    selectedItems,
    setSelectedItems,
    validationErrors,
    
    // Manual pricing methods
    addItemFromTemplate,
    validatePricing,
    applyBulkDiscount,
    fixZeroPriceItems, // Now shows warning instead of auto-fixing
    duplicateSelectedItems,
    deleteSelectedItems,
    calculatePricingFromRules, // Always returns 0
    
    // Bulk operations
    bulkUpdateCategory: (category: string, itemIds?: string[]) => {
      const targetItems = itemIds || Array.from(selectedItems);
      targetItems.forEach(itemId => {
        lineItemHook.updateLineItem(itemId, { category });
      });
    },
    
    bulkUpdateQuantity: (quantity: number, itemIds?: string[]) => {
      const targetItems = itemIds || Array.from(selectedItems);
      targetItems.forEach(itemId => {
        const item = lineItemHook.lineItems.find(i => i.id === itemId);
        if (item) {
          lineItemHook.updateLineItem(itemId, {
            quantity,
            total_price: item.unit_price * quantity
          });
        }
      });
    }
  };
}