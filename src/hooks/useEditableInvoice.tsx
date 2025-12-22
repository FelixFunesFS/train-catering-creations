import { useState, useCallback, useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';
import { useInvoiceTotalSync } from './useInvoiceTotalSync';

type LineItem = Database['public']['Tables']['invoice_line_items']['Row'];

export interface LocalLineItem extends LineItem {
  isDirty?: boolean;
}

interface EditableInvoiceState {
  localLineItems: Map<string, LocalLineItem>;
  customerNotes: string;
  adminNotes: string;
  originalCustomerNotes: string;
  originalAdminNotes: string;
}

interface UseEditableInvoiceReturn {
  // Local state
  localLineItems: LocalLineItem[];
  customerNotes: string;
  adminNotes: string;
  
  // Updaters (local only - no DB calls)
  updateLineItem: (id: string, updates: Partial<Pick<LineItem, 'unit_price' | 'quantity' | 'description'>>) => void;
  setCustomerNotes: (notes: string) => void;
  setAdminNotes: (notes: string) => void;
  
  // Dirty tracking
  hasUnsavedChanges: boolean;
  dirtyItemIds: Set<string>;
  
  // Actions
  saveAllChanges: () => Promise<boolean>;
  discardAllChanges: () => void;
  
  // Sync original data when it changes externally
  syncFromSource: (lineItems: LineItem[], notes: string | null) => void;
  
  // Status
  isSaving: boolean;
}

export function useEditableInvoice(
  invoiceId: string | undefined,
  sourceLineItems: LineItem[] = [],
  sourceNotes: string | null = null
): UseEditableInvoiceReturn {
  const queryClient = useQueryClient();
  const { syncInvoiceTotals } = useInvoiceTotalSync();
  
  const [state, setState] = useState<EditableInvoiceState>({
    localLineItems: new Map(),
    customerNotes: sourceNotes || '',
    adminNotes: '',
    originalCustomerNotes: sourceNotes || '',
    originalAdminNotes: '',
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Initialize local state when sourceLineItems first load
  useEffect(() => {
    // Only initialize if we have data and haven't initialized yet for this invoice
    if (!isInitialized && (sourceLineItems.length > 0 || sourceNotes !== null)) {
      const itemsMap = new Map<string, LocalLineItem>();
      sourceLineItems.forEach(item => {
        itemsMap.set(item.id, { ...item, isDirty: false });
      });
      
      setState({
        localLineItems: itemsMap,
        customerNotes: sourceNotes || '',
        adminNotes: '',
        originalCustomerNotes: sourceNotes || '',
        originalAdminNotes: '',
      });
      setIsInitialized(true);
    }
  }, [sourceLineItems, sourceNotes, isInitialized]);
  
  // Reset initialization when invoice changes
  useEffect(() => {
    setIsInitialized(false);
  }, [invoiceId]);
  
  // Handle new/deleted items from external sources (e.g., AddLineItemModal)
  useEffect(() => {
    if (!isInitialized) return;
    
    // Check for items that don't have dirty changes
    const hasDirtyItems = Array.from(state.localLineItems.values()).some(item => item.isDirty);
    const notesChanged = state.customerNotes !== state.originalCustomerNotes;
    
    // If no unsaved changes, sync new items and remove deleted items
    if (!hasDirtyItems && !notesChanged) {
      const currentIds = new Set(state.localLineItems.keys());
      const sourceIds = new Set(sourceLineItems.map(i => i.id));
      
      // Check if there are differences
      const hasNewItems = sourceLineItems.some(item => !currentIds.has(item.id));
      const hasDeletedItems = Array.from(currentIds).some(id => !sourceIds.has(id));
      
      if (hasNewItems || hasDeletedItems) {
        const itemsMap = new Map<string, LocalLineItem>();
        sourceLineItems.forEach(item => {
          itemsMap.set(item.id, { ...item, isDirty: false });
        });
        
        setState(prev => ({
          ...prev,
          localLineItems: itemsMap,
          customerNotes: sourceNotes || prev.customerNotes,
          originalCustomerNotes: sourceNotes || prev.originalCustomerNotes,
        }));
      }
    }
  }, [sourceLineItems, sourceNotes, isInitialized, state.localLineItems, state.customerNotes, state.originalCustomerNotes]);
  
  // Sync from source - called when external data loads/changes and there are no unsaved changes
  const syncFromSource = useCallback((lineItems: LineItem[], notes: string | null) => {
    setState(prev => {
      // Only sync if there are no dirty items
      const hasDirtyItems = Array.from(prev.localLineItems.values()).some(item => item.isDirty);
      const notesChanged = prev.customerNotes !== prev.originalCustomerNotes;
      
      if (hasDirtyItems || notesChanged) {
        // Don't overwrite if user has unsaved changes
        return prev;
      }
      
      const itemsMap = new Map<string, LocalLineItem>();
      lineItems.forEach(item => {
        itemsMap.set(item.id, { ...item, isDirty: false });
      });
      
      return {
        ...prev,
        localLineItems: itemsMap,
        customerNotes: notes || '',
        originalCustomerNotes: notes || '',
      };
    });
  }, []);
  
  // Update a line item locally (no DB call)
  const updateLineItem = useCallback((id: string, updates: Partial<Pick<LineItem, 'unit_price' | 'quantity' | 'description'>>) => {
    setState(prev => {
      const item = prev.localLineItems.get(id);
      if (!item) return prev;
      
      const updatedItem: LocalLineItem = {
        ...item,
        ...updates,
        isDirty: true,
      };
      
      // Recalculate total_price if quantity or unit_price changed
      if ('quantity' in updates || 'unit_price' in updates) {
        const newQty = updates.quantity ?? item.quantity;
        const newPrice = updates.unit_price ?? item.unit_price;
        updatedItem.total_price = newQty * newPrice;
      }
      
      const newMap = new Map(prev.localLineItems);
      newMap.set(id, updatedItem);
      
      return { ...prev, localLineItems: newMap };
    });
  }, []);
  
  // Set customer notes
  const setCustomerNotes = useCallback((notes: string) => {
    setState(prev => ({ ...prev, customerNotes: notes }));
  }, []);
  
  // Set admin notes
  const setAdminNotes = useCallback((notes: string) => {
    setState(prev => ({ ...prev, adminNotes: notes }));
  }, []);
  
  // Computed: get array of local line items
  const localLineItems = useMemo(() => {
    return Array.from(state.localLineItems.values());
  }, [state.localLineItems]);
  
  // Computed: get set of dirty item IDs
  const dirtyItemIds = useMemo(() => {
    const ids = new Set<string>();
    state.localLineItems.forEach((item, id) => {
      if (item.isDirty) ids.add(id);
    });
    return ids;
  }, [state.localLineItems]);
  
  // Computed: has unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    const hasDirtyItems = dirtyItemIds.size > 0;
    const notesChanged = state.customerNotes !== state.originalCustomerNotes;
    const adminNotesChanged = state.adminNotes !== state.originalAdminNotes;
    return hasDirtyItems || notesChanged || adminNotesChanged;
  }, [dirtyItemIds, state.customerNotes, state.originalCustomerNotes, state.adminNotes, state.originalAdminNotes]);
  
  // Save all changes to the database
  const saveAllChanges = useCallback(async (): Promise<boolean> => {
    if (!invoiceId) {
      toast.error('No invoice to save');
      return false;
    }
    
    setIsSaving(true);
    
    try {
      // Collect all dirty line items
      const dirtyItems = Array.from(state.localLineItems.values()).filter(item => item.isDirty);
      
      // Batch update line items
      if (dirtyItems.length > 0) {
        const updates = dirtyItems.map(item => ({
          id: item.id,
          unit_price: item.unit_price,
          quantity: item.quantity,
          total_price: item.total_price,
          description: item.description,
        }));
        
        // Update each line item
        for (const update of updates) {
          const { error } = await supabase
            .from('invoice_line_items')
            .update({
              unit_price: update.unit_price,
              quantity: update.quantity,
              total_price: update.total_price,
              description: update.description,
            })
            .eq('id', update.id);
            
          if (error) throw error;
        }
      }
      
      // Update invoice notes if changed
      const notesChanged = state.customerNotes !== state.originalCustomerNotes;
      if (notesChanged) {
        const { error } = await supabase
          .from('invoices')
          .update({ notes: state.customerNotes })
          .eq('id', invoiceId);
          
        if (error) throw error;
      }
      
      // Force recalculate invoice totals using shared sync utility
      await syncInvoiceTotals(invoiceId);
      
      // Mark all items as clean and update originals
      setState(prev => {
        const cleanMap = new Map<string, LocalLineItem>();
        prev.localLineItems.forEach((item, id) => {
          cleanMap.set(id, { ...item, isDirty: false });
        });
        return {
          ...prev,
          localLineItems: cleanMap,
          originalCustomerNotes: prev.customerNotes,
          originalAdminNotes: prev.adminNotes,
        };
      });
      
      toast.success('All changes saved');
      return true;
      
    } catch (error: any) {
      console.error('Error saving changes:', error);
      toast.error('Failed to save changes: ' + error.message);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [invoiceId, state, queryClient]);
  
  // Discard all changes
  const discardAllChanges = useCallback(() => {
    setState(prev => {
      // Reset all items to non-dirty (they'll be refreshed from source)
      const cleanMap = new Map<string, LocalLineItem>();
      prev.localLineItems.forEach((item, id) => {
        cleanMap.set(id, { ...item, isDirty: false });
      });
      return {
        ...prev,
        localLineItems: cleanMap,
        customerNotes: prev.originalCustomerNotes,
        adminNotes: prev.originalAdminNotes,
      };
    });
    
    // Force refresh from server
    if (invoiceId) {
      queryClient.invalidateQueries({ queryKey: ['line-items', invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoice', invoiceId] });
    }
    
    toast.info('Changes discarded');
  }, [invoiceId, queryClient]);
  
  return {
    localLineItems,
    customerNotes: state.customerNotes,
    adminNotes: state.adminNotes,
    updateLineItem,
    setCustomerNotes,
    setAdminNotes,
    hasUnsavedChanges,
    dirtyItemIds,
    saveAllChanges,
    discardAllChanges,
    syncFromSource,
    isSaving,
  };
}
