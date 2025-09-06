import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LineItem {
  id?: string;
  title: string;
  description: string;
  category: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface InvoiceData {
  id?: string;
  invoice_number?: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  line_items: LineItem[];
  status?: string;
  due_date?: string;
  stripe_invoice_id?: string;
  pdf_url?: string;
}

export function useInvoiceEditing() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const saveInvoiceChanges = useCallback(async (invoiceId: string, updatedInvoice: InvoiceData) => {
    setIsSaving(true);
    try {
      // Update the invoice in the database
      const { error: invoiceError } = await supabase
        .from('invoices')
        .update({
          subtotal: updatedInvoice.subtotal,
          tax_amount: updatedInvoice.tax_amount,
          total_amount: updatedInvoice.total_amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', invoiceId);

      if (invoiceError) throw invoiceError;

      // Delete existing line items
      const { error: deleteError } = await supabase
        .from('invoice_line_items')
        .delete()
        .eq('invoice_id', invoiceId);

      if (deleteError) throw deleteError;

      // Insert updated line items
      const lineItemsToInsert = updatedInvoice.line_items.map(item => ({
        invoice_id: invoiceId,
        title: item.title,
        description: item.description,
        category: item.category,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price
      }));

      const { error: insertError } = await supabase
        .from('invoice_line_items')
        .insert(lineItemsToInsert);

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: "Invoice updated successfully",
      });

      return true;
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast({
        title: "Error",
        description: "Failed to save invoice changes",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const toggleEditMode = useCallback(() => {
    setIsEditMode(prev => !prev);
  }, []);

  const exitEditMode = useCallback(() => {
    setIsEditMode(false);
  }, []);

  return {
    isEditMode,
    isSaving,
    toggleEditMode,
    exitEditMode,
    saveInvoiceChanges
  };
}