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
  subtotal?: number;
  tax_amount?: number;
  total_amount?: number;
  line_items: LineItem[];
  status?: string;
  due_date?: string;
  stripe_invoice_id?: string;
  pdf_url?: string;
}

interface ValidationError {
  field: string;
  message: string;
}

export function useInvoiceEditing() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const { toast } = useToast();

  // Validate invoice data
  const validateInvoice = useCallback((invoice: InvoiceData): ValidationError[] => {
    const errors: ValidationError[] = [];

    // Validate line items
    if (!invoice.line_items || invoice.line_items.length === 0) {
      errors.push({ field: 'line_items', message: 'At least one line item is required' });
    }

    invoice.line_items?.forEach((item, index) => {
      if (!item.title?.trim()) {
        errors.push({ 
          field: `line_items.${index}.title`, 
          message: `Line item ${index + 1}: Title is required` 
        });
      }
      if (item.quantity <= 0) {
        errors.push({ 
          field: `line_items.${index}.quantity`, 
          message: `Line item ${index + 1}: Quantity must be greater than 0` 
        });
      }
      if (item.unit_price < 0) {
        errors.push({ 
          field: `line_items.${index}.unit_price`, 
          message: `Line item ${index + 1}: Unit price cannot be negative` 
        });
      }
    });

    // Validate totals
    if (invoice.total_amount <= 0) {
      errors.push({ field: 'total_amount', message: 'Total amount must be greater than 0' });
    }

    return errors;
  }, []);

  // Save invoice changes with enhanced validation and optimistic locking
  const saveInvoiceChanges = useCallback(async (invoiceId: string, updatedInvoice: InvoiceData) => {
    setIsSaving(true);
    setValidationErrors([]);

    try {
      // Validate before saving
      const errors = validateInvoice(updatedInvoice);
      if (errors.length > 0) {
        setValidationErrors(errors);
        toast({
          title: "Validation Error",
          description: `Please fix ${errors.length} validation error(s) before saving`,
          variant: "destructive",
        });
        return false;
      }

      // Fetch current version for optimistic locking
      const { data: currentInvoice, error: fetchError } = await supabase
        .from('invoices')
        .select('version')
        .eq('id', invoiceId)
        .single();

      if (fetchError) throw fetchError;

      // Save to database with optimistic locking
      const { data: updateResult, error: invoiceError } = await supabase
        .from('invoices')
        .update({
          subtotal: updatedInvoice.subtotal,
          tax_amount: updatedInvoice.tax_amount,
          total_amount: updatedInvoice.total_amount,
          updated_at: new Date().toISOString(),
          status_changed_by: 'admin'
        })
        .eq('id', invoiceId)
        .eq('version', currentInvoice.version)
        .select();

      if (invoiceError) throw invoiceError;

      // Check if update was successful (optimistic lock check)
      if (!updateResult || updateResult.length === 0) {
        toast({
          title: "Conflict Detected",
          description: "This invoice was modified by another user. Please refresh and try again.",
          variant: "destructive",
        });
        return false;
      }

      // Delete existing line items
      const { error: deleteError } = await supabase
        .from('invoice_line_items')
        .delete()
        .eq('invoice_id', invoiceId);

      if (deleteError) throw deleteError;

      // Insert updated line items
      if (updatedInvoice.line_items && updatedInvoice.line_items.length > 0) {
        const lineItemsToInsert = updatedInvoice.line_items.map(item => ({
          invoice_id: invoiceId,
          title: item.title,
          description: item.description || '',
          category: item.category || 'other',
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price
        }));

        const { error: insertError } = await supabase
          .from('invoice_line_items')
          .insert(lineItemsToInsert);

        if (insertError) throw insertError;
      }

      // Log the change for audit trail
      await supabase
        .from('invoice_audit_log')
        .insert({
          invoice_id: invoiceId,
          field_changed: 'line_items_updated',
          old_value: null,
          new_value: { 
            total_amount: updatedInvoice.total_amount, 
            line_items_count: updatedInvoice.line_items?.length || 0 
          },
          changed_by: 'admin'
        });

      toast({
        title: "Success",
        description: "Invoice updated successfully",
      });

      setHasUnsavedChanges(false);
      return true;
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast({
        title: "Error",
        description: "Failed to save invoice changes. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [toast, validateInvoice]);

  // Enhanced save with backup creation and optimistic locking
  const saveWithBackup = useCallback(async (invoiceId: string, updatedInvoice: InvoiceData) => {
    setIsSaving(true);
    
    try {
      // Create backup of current invoice data with version
      const { data: currentInvoice, error: fetchError } = await supabase
        .from('invoices')
        .select(`
          *,
          invoice_line_items (*)
        `)
        .eq('id', invoiceId)
        .single();

      if (fetchError) throw fetchError;

      // Store backup in estimate_versions table
      await supabase
        .from('estimate_versions')
        .insert({
          invoice_id: invoiceId,
          version_number: Date.now(), // Use timestamp as version
          line_items: currentInvoice.invoice_line_items,
          subtotal: currentInvoice.subtotal,
          tax_amount: currentInvoice.tax_amount,
          total_amount: currentInvoice.total_amount,
          status: 'backup',
          notes: 'Auto-backup before edit'
        });

      // Proceed with normal save
      return await saveInvoiceChanges(invoiceId, updatedInvoice);
    } catch (error) {
      console.error('Error creating backup:', error);
      // Continue with save even if backup fails
      return await saveInvoiceChanges(invoiceId, updatedInvoice);
    }
  }, [saveInvoiceChanges]);

  const toggleEditMode = useCallback(() => {
    if (isEditMode && hasUnsavedChanges) {
      // Warn user about unsaved changes
      const confirmDiscard = window.confirm(
        'You have unsaved changes. Are you sure you want to cancel editing?'
      );
      if (!confirmDiscard) {
        return;
      }
    }
    
    setIsEditMode(prev => !prev);
    setHasUnsavedChanges(false);
    setValidationErrors([]);
  }, [isEditMode, hasUnsavedChanges]);

  const exitEditMode = useCallback(() => {
    setIsEditMode(false);
    setHasUnsavedChanges(false);
    setValidationErrors([]);
  }, []);

  const markAsModified = useCallback(() => {
    setHasUnsavedChanges(true);
  }, []);

  const clearValidationErrors = useCallback(() => {
    setValidationErrors([]);
  }, []);

  const getValidationErrorsForField = useCallback((field: string) => {
    return validationErrors.filter(error => error.field === field);
  }, [validationErrors]);

  return {
    isEditMode,
    isSaving,
    hasUnsavedChanges,
    validationErrors,
    toggleEditMode,
    exitEditMode,
    saveInvoiceChanges,
    saveWithBackup,
    markAsModified,
    clearValidationErrors,
    getValidationErrorsForField,
    validateInvoice
  };
}