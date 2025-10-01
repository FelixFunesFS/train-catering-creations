import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { generateProfessionalLineItems } from '@/utils/invoiceFormatters';

export interface ChangeRequest {
  id: string;
  invoice_id: string;
  customer_email: string;
  request_type: string;
  priority: string;
  status: string;
  customer_comments: string;
  requested_changes: any;
  original_details?: any;
  estimated_cost_change: number;
  admin_response?: string;
  created_at: string;
  updated_at: string;
}

interface ApproveChangeOptions {
  adminResponse: string;
  finalCostChange?: number;
}

export function useSimplifiedChangeRequests(invoiceId?: string) {
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const applyChangesToQuote = async (
    changeRequest: ChangeRequest,
    options: ApproveChangeOptions
  ) => {
    try {
      // Get the invoice and associated quote
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('id, quote_request_id, total_amount')
        .eq('id', changeRequest.invoice_id)
        .single();

      if (invoiceError || !invoice?.quote_request_id) {
        throw new Error('Invoice or associated quote not found');
      }

      // Get current quote data
      const { data: currentQuote, error: quoteError } = await supabase
        .from('quote_requests')
        .select('*')
        .eq('id', invoice.quote_request_id)
        .single();

      if (quoteError || !currentQuote) {
        throw new Error('Quote request not found');
      }

      // Parse requested changes and build update object
      const changes = changeRequest.requested_changes || {};
      const quoteUpdates: any = {};

      // Apply each requested change
      if (changes.event_date) quoteUpdates.event_date = changes.event_date;
      if (changes.guest_count) quoteUpdates.guest_count = parseInt(changes.guest_count);
      if (changes.location) quoteUpdates.location = changes.location;
      if (changes.start_time) quoteUpdates.start_time = changes.start_time;

      // Handle structured menu changes
      if (changes.menu_changes) {
        const menuChanges = changes.menu_changes;
        
        // Update proteins
        if (menuChanges.proteins?.remove?.includes('primary')) {
          quoteUpdates.primary_protein = null;
        }
        if (menuChanges.proteins?.remove?.includes('secondary')) {
          quoteUpdates.secondary_protein = null;
        }

        // Helper to parse array fields
        const parseArrayField = (field: any): string[] => {
          if (Array.isArray(field)) return field;
          if (typeof field === 'string') {
            try {
              const parsed = JSON.parse(field);
              return Array.isArray(parsed) ? parsed : [];
            } catch {
              return [];
            }
          }
          return [];
        };

        // Update menu item arrays - remove specified items
        if (menuChanges.appetizers?.remove?.length > 0) {
          const currentAppetizers = parseArrayField(currentQuote.appetizers);
          quoteUpdates.appetizers = currentAppetizers.filter(
            (item: string) => !menuChanges.appetizers.remove.includes(item)
          );
        }

        if (menuChanges.sides?.remove?.length > 0) {
          const currentSides = parseArrayField(currentQuote.sides);
          quoteUpdates.sides = currentSides.filter(
            (item: string) => !menuChanges.sides.remove.includes(item)
          );
        }

        if (menuChanges.desserts?.remove?.length > 0) {
          const currentDesserts = parseArrayField(currentQuote.desserts);
          quoteUpdates.desserts = currentDesserts.filter(
            (item: string) => !menuChanges.desserts.remove.includes(item)
          );
        }

        if (menuChanges.drinks?.remove?.length > 0) {
          const currentDrinks = parseArrayField(currentQuote.drinks);
          quoteUpdates.drinks = currentDrinks.filter(
            (item: string) => !menuChanges.drinks.remove.includes(item)
          );
        }

        // Update service options
        if (menuChanges.service_options) {
          Object.keys(menuChanges.service_options).forEach(key => {
            quoteUpdates[key] = menuChanges.service_options[key];
          });
        }

        // Store custom requests in custom_menu_requests field
        if (menuChanges.custom_requests) {
          quoteUpdates.custom_menu_requests = currentQuote.custom_menu_requests
            ? `${currentQuote.custom_menu_requests}\n\nADDITIONAL REQUEST: ${menuChanges.custom_requests}`
            : menuChanges.custom_requests;
        }
      }

      // Update quote status to indicate it's been modified
      quoteUpdates.status = 'quoted';
      quoteUpdates.workflow_status = 'estimated';
      quoteUpdates.last_status_change = new Date().toISOString();

      // Apply updates to quote_requests
      const { error: updateQuoteError } = await supabase
        .from('quote_requests')
        .update(quoteUpdates)
        .eq('id', invoice.quote_request_id);

      if (updateQuoteError) throw updateQuoteError;

      // Fetch updated quote to regenerate line items
      const { data: updatedQuote, error: fetchQuoteError } = await supabase
        .from('quote_requests')
        .select('*')
        .eq('id', invoice.quote_request_id)
        .single();

      if (fetchQuoteError || !updatedQuote) {
        throw new Error('Failed to fetch updated quote');
      }

      // Parse JSON fields for line item generation
      const parseJsonField = (field: any): any[] => {
        if (Array.isArray(field)) return field;
        if (typeof field === 'string') {
          try {
            const parsed = JSON.parse(field);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        }
        return [];
      };

      const quoteForLineItems = {
        ...updatedQuote,
        appetizers: parseJsonField(updatedQuote.appetizers),
        sides: parseJsonField(updatedQuote.sides),
        desserts: parseJsonField(updatedQuote.desserts),
        drinks: parseJsonField(updatedQuote.drinks),
        dietary_restrictions: parseJsonField(updatedQuote.dietary_restrictions),
        utensils: parseJsonField(updatedQuote.utensils),
        extras: parseJsonField(updatedQuote.extras)
      };

      // Delete existing quote line items
      const { error: deleteLineItemsError } = await supabase
        .from('quote_line_items')
        .delete()
        .eq('quote_request_id', invoice.quote_request_id);

      if (deleteLineItemsError) {
        console.error('Error deleting old line items:', deleteLineItemsError);
      }

      // Regenerate quote line items with updated data
      const newLineItems = generateProfessionalLineItems(quoteForLineItems as any);
      
      if (newLineItems.length > 0) {
        const lineItemsToInsert = newLineItems.map(item => ({
          quote_request_id: invoice.quote_request_id,
          title: item.title,
          description: item.description,
          category: item.category || 'other',
          quantity: item.quantity || 1,
          unit_price: item.unit_price || 0,
          total_price: item.total_price || 0
        }));

        const { error: insertLineItemsError } = await supabase
          .from('quote_line_items')
          .insert(lineItemsToInsert);

        if (insertLineItemsError) {
          console.error('Error inserting new line items:', insertLineItemsError);
        }
      }

      // Log detailed history entries for menu changes
      const historyEntries = [];
      
      if (changes.menu_changes) {
        const menuChanges = changes.menu_changes;
        
        // Log protein removals
        if (menuChanges.proteins?.remove) {
          const removedProteins = [];
          if (menuChanges.proteins.remove.includes('primary') && currentQuote.primary_protein) {
            removedProteins.push(currentQuote.primary_protein);
          }
          if (menuChanges.proteins.remove.includes('secondary') && currentQuote.secondary_protein) {
            removedProteins.push(currentQuote.secondary_protein);
          }
          
          if (removedProteins.length > 0) {
            historyEntries.push({
              quote_request_id: invoice.quote_request_id,
              field_name: 'proteins',
              old_value: removedProteins.join(', '),
              new_value: null,
              changed_by: 'admin',
              change_reason: `Change Request #${changeRequest.id.substring(0, 8)} - Removed proteins`
            });
          }
        }

        // Log protein additions
        if (menuChanges.proteins?.add) {
          const addedProteins = [];
          if (menuChanges.proteins.add.primary) addedProteins.push(menuChanges.proteins.add.primary);
          if (menuChanges.proteins.add.secondary) addedProteins.push(menuChanges.proteins.add.secondary);
          
          if (addedProteins.length > 0) {
            historyEntries.push({
              quote_request_id: invoice.quote_request_id,
              field_name: 'proteins',
              old_value: null,
              new_value: addedProteins.join(', '),
              changed_by: 'admin',
              change_reason: `Change Request #${changeRequest.id.substring(0, 8)} - Added proteins`
            });
          }
        }

        // Log menu item changes for each category
        const categories = ['appetizers', 'sides', 'desserts', 'drinks'];
        for (const category of categories) {
          if (menuChanges[category]?.remove?.length > 0) {
            historyEntries.push({
              quote_request_id: invoice.quote_request_id,
              field_name: category,
              old_value: menuChanges[category].remove.join(', '),
              new_value: null,
              changed_by: 'admin',
              change_reason: `Change Request #${changeRequest.id.substring(0, 8)} - Removed ${category}`
            });
          }
          
          if (menuChanges[category]?.add?.length > 0) {
            historyEntries.push({
              quote_request_id: invoice.quote_request_id,
              field_name: category,
              old_value: null,
              new_value: menuChanges[category].add.join(', '),
              changed_by: 'admin',
              change_reason: `Change Request #${changeRequest.id.substring(0, 8)} - Added ${category}`
            });
          }
        }
      }

      // Log event detail changes
      if (changes.event_date && changes.event_date !== currentQuote.event_date) {
        historyEntries.push({
          quote_request_id: invoice.quote_request_id,
          field_name: 'event_date',
          old_value: currentQuote.event_date,
          new_value: changes.event_date,
          changed_by: 'admin',
          change_reason: `Change Request #${changeRequest.id.substring(0, 8)} - Event date changed`
        });
      }

      if (changes.guest_count && parseInt(changes.guest_count) !== currentQuote.guest_count) {
        historyEntries.push({
          quote_request_id: invoice.quote_request_id,
          field_name: 'guest_count',
          old_value: String(currentQuote.guest_count),
          new_value: changes.guest_count,
          changed_by: 'admin',
          change_reason: `Change Request #${changeRequest.id.substring(0, 8)} - Guest count changed`
        });
      }

      if (changes.location && changes.location !== currentQuote.location) {
        historyEntries.push({
          quote_request_id: invoice.quote_request_id,
          field_name: 'location',
          old_value: currentQuote.location,
          new_value: changes.location,
          changed_by: 'admin',
          change_reason: `Change Request #${changeRequest.id.substring(0, 8)} - Location changed`
        });
      }

      // Insert all history entries
      if (historyEntries.length > 0) {
        const { error: historyError } = await supabase
          .from('quote_request_history')
          .insert(historyEntries);

        if (historyError) {
          console.error('Error logging history:', historyError);
        }
      }

      // Calculate new invoice total
      const costChangeCents = (options.finalCostChange || changeRequest.estimated_cost_change || 0);
      const newTotal = Math.max(0, invoice.total_amount + costChangeCents);

      // Update invoice with new total
      const { error: updateInvoiceError } = await supabase
        .from('invoices')
        .update({
          total_amount: newTotal,
          status: 'approved',
          workflow_status: 'approved',
          updated_at: new Date().toISOString(),
          status_changed_by: 'admin'
        })
        .eq('id', changeRequest.invoice_id);

      if (updateInvoiceError) throw updateInvoiceError;

      // Mark change request as approved
      const { error: updateRequestError } = await supabase
        .from('change_requests')
        .update({
          status: 'approved',
          admin_response: options.adminResponse,
          estimated_cost_change: costChangeCents,
          reviewed_at: new Date().toISOString(),
          reviewed_by: 'admin',
          updated_at: new Date().toISOString()
        })
        .eq('id', changeRequest.id);

      if (updateRequestError) throw updateRequestError;

      // Log the workflow state change
      await supabase.from('workflow_state_log').insert({
        entity_type: 'change_requests',
        entity_id: changeRequest.id,
        previous_status: 'pending',
        new_status: 'approved',
        changed_by: 'admin',
        change_reason: `Change request approved: ${options.adminResponse.substring(0, 100)}`,
        metadata: {
          invoice_id: changeRequest.invoice_id,
          quote_id: invoice.quote_request_id,
          cost_change: costChangeCents,
          applied_changes: Object.keys(quoteUpdates)
        }
      });

      return { success: true, newTotal, appliedChanges: quoteUpdates };
    } catch (error) {
      console.error('Error applying changes to quote:', error);
      throw error;
    }
  };

  const approveChangeRequest = async (
    changeRequest: ChangeRequest,
    options: ApproveChangeOptions
  ) => {
    setProcessing(true);
    try {
      const result = await applyChangesToQuote(changeRequest, options);
      
      toast({
        title: "Changes Applied",
        description: "Quote has been updated with the approved changes. The updated estimate is ready to send.",
      });

      return result;
    } catch (error) {
      console.error('Error approving change request:', error);
      toast({
        title: "Error",
        description: "Failed to apply changes. Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setProcessing(false);
    }
  };

  const rejectChangeRequest = async (
    changeRequest: ChangeRequest,
    adminResponse: string
  ) => {
    setProcessing(true);
    try {
      const { error } = await supabase
        .from('change_requests')
        .update({
          status: 'rejected',
          admin_response: adminResponse,
          reviewed_at: new Date().toISOString(),
          reviewed_by: 'admin',
          updated_at: new Date().toISOString()
        })
        .eq('id', changeRequest.id);

      if (error) throw error;

      // Log the rejection
      await supabase.from('workflow_state_log').insert({
        entity_type: 'change_requests',
        entity_id: changeRequest.id,
        previous_status: 'pending',
        new_status: 'rejected',
        changed_by: 'admin',
        change_reason: `Change request rejected: ${adminResponse.substring(0, 100)}`
      });

      toast({
        title: "Request Rejected",
        description: "Customer will be notified of the decision.",
      });

      return { success: true };
    } catch (error) {
      console.error('Error rejecting change request:', error);
      toast({
        title: "Error",
        description: "Failed to reject request. Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setProcessing(false);
    }
  };

  return {
    processing,
    approveChangeRequest,
    rejectChangeRequest
  };
}
