import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/useDebounce';
import { LineItemsService } from '@/services/LineItemsService';
import { InvoiceTotalsRecalculator } from '@/services/InvoiceTotalsRecalculator';

interface LineItem {
  id?: string;
  title: string;
  description: string;
  category: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface UseLineItemManagementProps {
  initialLineItems: LineItem[];
  autoSave?: boolean;
  invoiceId?: string;
}

export function useLineItemManagement({
  initialLineItems,
  autoSave = false,
  invoiceId
}: UseLineItemManagementProps) {
  const [lineItems, setLineItems] = useState<LineItem[]>(initialLineItems);
  const [isModified, setIsModified] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [lastCalculated, setLastCalculated] = useState<Date>(new Date());
  const { toast } = useToast();

  // Sync lineItems when initialLineItems changes (e.g., after fetching from database)
  useEffect(() => {
    if (initialLineItems && initialLineItems.length > 0) {
      console.log('🔍 DEBUG: Syncing lineItems from initialLineItems:', initialLineItems.length);
      setLineItems(initialLineItems);
    }
  }, [initialLineItems]);

  // Auto-save function using LineItemsService
  const performAutoSave = useCallback(async () => {
    if (!autoSave || !invoiceId || !isModified) {
      console.log('⏭️ Skipping auto-save:', { autoSave, invoiceId, isModified });
      return;
    }

    try {
      setIsCalculating(true);
      console.log('💾 Starting auto-save with LineItemsService...', { 
        invoiceId, 
        itemCount: lineItems.length
      });
      
      // Use LineItemsService to replace all line items
      const lineItemsToSave = lineItems.map(item => ({
        title: item.title,
        description: item.description || '',
        category: item.category || 'other',
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price
      }));

      await LineItemsService.replaceLineItems(invoiceId, lineItemsToSave);
      console.log('✅ Line items saved via LineItemsService');
      
      // Recalculate invoice totals after auto-save
      await InvoiceTotalsRecalculator.recalculateInvoice(invoiceId);
      
      setIsModified(false);
      setLastCalculated(new Date());
      
      // Wait briefly for trigger to complete
      await new Promise(resolve => setTimeout(resolve, 300));
      
      toast({
        title: "Auto-saved",
        description: "Changes automatically saved",
        duration: 1500
      });
    } catch (error) {
      console.error('❌ Auto-save failed:', error);
      toast({
        title: "Save failed",
        description: "Could not save changes. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCalculating(false);
    }
  }, [autoSave, invoiceId, isModified, lineItems, toast]);

  // Setup debounced auto-save
  const { trigger: triggerAutoSave, cancel: cancelAutoSave } = useDebounce({
    callback: performAutoSave,
    delay: 2000,
    dependencies: [lineItems, isModified]
  });

  // Note: Totals are NOT calculated here - they come from database after InvoiceTotalsRecalculator runs
  const calculateTotals = useCallback(() => {
    // Placeholder for backwards compatibility - actual totals come from database
    setIsCalculating(false);
  }, []);

  // Update line item
  const updateLineItem = useCallback((itemId: string, updates: Partial<LineItem>) => {
    setLineItems(prevItems => {
      const updatedItems = prevItems.map(item => {
        if (item.id === itemId) {
          const updated = { ...item, ...updates };
          // Recalculate total price if quantity or unit price changed
          if (updates.quantity !== undefined || updates.unit_price !== undefined) {
            updated.total_price = updated.quantity * updated.unit_price;
          }
          return updated;
        }
        return item;
      });
      
      setIsModified(true);
      return updatedItems;
    });
  }, []);

  // Add new line item
  const addLineItem = useCallback((template?: Partial<LineItem>) => {
    const newItem: LineItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: template?.title || 'New Item',
      description: template?.description || '',
      category: template?.category || 'other',
      quantity: template?.quantity || 1,
      unit_price: template?.unit_price || 0,
      total_price: template?.total_price || 0
    };

    setLineItems(prevItems => {
      const updatedItems = [...prevItems, newItem];
      setIsModified(true);
      return updatedItems;
    });

    return newItem.id;
  }, []);

  // Remove line item
  const removeLineItem = useCallback((itemId: string) => {
    setLineItems(prevItems => {
      const updatedItems = prevItems.filter(item => item.id !== itemId);
      setIsModified(true);
      return updatedItems;
    });
  }, []);

  // Add common line item templates
  const addTemplateItem = useCallback((templateType: string, guestCount?: number) => {
    const templates: Record<string, Partial<LineItem>> = {
      'service_fee': {
        title: 'Service Fee',
        description: 'Professional catering service including setup and cleanup',
        category: 'service',
        quantity: 1,
        unit_price: 15000, // $150.00
        total_price: 15000
      },
      'equipment_rental': {
        title: 'Equipment Rental',
        description: 'Tables, chairs, linens, and serving equipment',
        category: 'equipment',
        quantity: 1,
        unit_price: 10000, // $100.00
        total_price: 10000
      },
      'per_person_catering': {
        title: 'Per-Person Catering',
        description: 'Complete catering package per guest',
        category: 'catering',
        quantity: guestCount || 50,
        unit_price: 2500, // $25.00 per person
        total_price: (guestCount || 50) * 2500
      },
      'delivery_fee': {
        title: 'Delivery Fee',
        description: 'Transportation and delivery of catering items',
        category: 'service',
        quantity: 1,
        unit_price: 5000, // $50.00
        total_price: 5000
      }
    };

    const template = templates[templateType];
    if (template) {
      return addLineItem(template);
    }
    return null;
  }, [addLineItem]);

  // Quick calculate per person pricing
  const quickCalculatePerPerson = useCallback((guestCount: number, pricePerPerson: number = 25) => {
    // Clear existing items and add standard catering items
    const standardItems: Partial<LineItem>[] = [
      {
        title: 'Per-Person Catering',
        description: 'Complete catering package including appetizers, main course, sides, and service',
        category: 'catering',
        quantity: guestCount,
        unit_price: pricePerPerson * 100, // Convert to cents
        total_price: guestCount * pricePerPerson * 100
      },
      {
        title: 'Service Fee',
        description: 'Professional catering service including setup, serving, and cleanup',
        category: 'service',
        quantity: 1,
        unit_price: 15000, // $150.00
        total_price: 15000
      }
    ];

    setLineItems(standardItems as LineItem[]);
    setIsModified(true);
  }, []);

  // Validate line items
  const validateLineItems = useCallback(() => {
    const errors: string[] = [];
    
    if (lineItems.length === 0) {
      errors.push('At least one line item is required');
    }

    lineItems.forEach((item, index) => {
      if (!item.title?.trim()) {
        errors.push(`Line item ${index + 1}: Title is required`);
      }
      if (item.quantity <= 0) {
        errors.push(`Line item ${index + 1}: Quantity must be greater than 0`);
      }
      if (item.unit_price < 0) {
        errors.push(`Line item ${index + 1}: Unit price cannot be negative`);
      }
    });

    return errors;
  }, [lineItems]);

  // Reset to initial state
  const resetLineItems = useCallback(() => {
    setLineItems(initialLineItems);
    setIsModified(false);
  }, [initialLineItems]);

  // Get common line item templates
  const getCommonTemplates = useCallback(() => [
    { id: 'service_fee', name: 'Service Fee', category: 'service' },
    { id: 'equipment_rental', name: 'Equipment Rental', category: 'equipment' },
    { id: 'per_person_catering', name: 'Per-Person Catering', category: 'catering' },
    { id: 'delivery_fee', name: 'Delivery Fee', category: 'service' }
  ], []);

  return {
    lineItems,
    isModified,
    isCalculating,
    lastCalculated,
    updateLineItem,
    addLineItem,
    removeLineItem,
    addTemplateItem,
    quickCalculatePerPerson,
    validateLineItems,
    resetLineItems,
    getCommonTemplates,
    triggerAutoSave,
    cancelAutoSave
  };
}