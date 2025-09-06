import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/useDebounce';
import { useOptimisticUpdates } from '@/hooks/useOptimisticUpdates';

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
  taxRate?: number;
  isGovernmentContract?: boolean;
  onTotalsChange?: (totals: { subtotal: number; tax_amount: number; total_amount: number }) => void;
  autoSave?: boolean;
  autoSaveDelay?: number;
  invoiceId?: string;
}

export function useLineItemManagement({
  initialLineItems,
  taxRate = 8.0,
  isGovernmentContract = false,
  onTotalsChange,
  autoSave = false,
  autoSaveDelay = 2000,
  invoiceId
}: UseLineItemManagementProps) {
  const [lineItems, setLineItems] = useState<LineItem[]>(initialLineItems);
  const [isModified, setIsModified] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [lastCalculated, setLastCalculated] = useState<Date>(new Date());
  const { toast } = useToast();

  // Auto-save function for debounced saving
  const performAutoSave = useCallback(async () => {
    if (!autoSave || !invoiceId || !isModified) return;

    try {
      setIsCalculating(true);
      
      // Delete existing line items
      await supabase
        .from('invoice_line_items')
        .delete()
        .eq('invoice_id', invoiceId);

      // Insert updated line items
      if (lineItems.length > 0) {
        const lineItemsToInsert = lineItems.map(item => ({
          invoice_id: invoiceId,
          title: item.title,
          description: item.description || '',
          category: item.category || 'other',
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price
        }));

        await supabase
          .from('invoice_line_items')
          .insert(lineItemsToInsert);
      }

      setIsModified(false);
      setLastCalculated(new Date());
      
      toast({
        title: "Auto-saved",
        description: "Changes automatically saved",
        duration: 1500
      });
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsCalculating(false);
    }
  }, [autoSave, invoiceId, isModified, lineItems, toast]);

  // Setup debounced auto-save
  const { trigger: triggerAutoSave, cancel: cancelAutoSave } = useDebounce({
    callback: performAutoSave,
    delay: autoSaveDelay,
    dependencies: [lineItems, isModified]
  });

  // Calculate totals with animation feedback
  const calculateTotals = useCallback((items: LineItem[]) => {
    setIsCalculating(true);
    
    // Simulate brief calculation time for UX feedback
    setTimeout(() => {
      const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
      const tax_amount = isGovernmentContract ? 0 : Math.round(subtotal * (taxRate / 100));
      const total_amount = subtotal + tax_amount;
      
      const totals = { subtotal, tax_amount, total_amount };
      onTotalsChange?.(totals);
      setLastCalculated(new Date());
      setIsCalculating(false);
      
      return totals;
    }, 100);
  }, [taxRate, isGovernmentContract, onTotalsChange]);

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
      
      calculateTotals(updatedItems);
      setIsModified(true);
      return updatedItems;
    });
  }, [calculateTotals]);

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
      calculateTotals(updatedItems);
      setIsModified(true);
      return updatedItems;
    });

    return newItem.id;
  }, [calculateTotals]);

  // Remove line item
  const removeLineItem = useCallback((itemId: string) => {
    setLineItems(prevItems => {
      const updatedItems = prevItems.filter(item => item.id !== itemId);
      calculateTotals(updatedItems);
      setIsModified(true);
      return updatedItems;
    });
  }, [calculateTotals]);

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
    calculateTotals(standardItems as LineItem[]);
    setIsModified(true);
  }, [calculateTotals]);

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
    calculateTotals(initialLineItems);
    setIsModified(false);
  }, [initialLineItems, calculateTotals]);

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
    calculateTotals: () => calculateTotals(lineItems),
    triggerAutoSave,
    cancelAutoSave
  };
}