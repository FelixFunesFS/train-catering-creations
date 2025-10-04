/**
 * EstimateVersionService - Manages versioning and snapshots of estimates
 * Creates historical records before changes are applied
 */

import { supabase } from '@/integrations/supabase/client';

export class EstimateVersionService {
  /**
   * Create a snapshot of the current estimate before making changes
   */
  async createSnapshot(
    invoiceId: string,
    changeRequestId?: string,
    createdBy: string = 'admin'
  ): Promise<{ success: boolean; versionId?: string; error?: string }> {
    try {
      // Fetch current invoice state
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .single();

      if (invoiceError || !invoice) {
        throw new Error('Invoice not found');
      }

      // Fetch current line items
      const { data: lineItems, error: lineItemsError } = await supabase
        .from('invoice_line_items')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('created_at', { ascending: true });

      if (lineItemsError) {
        throw new Error('Failed to fetch line items');
      }

      // Get the latest version number
      const { data: existingVersions, error: versionsError } = await supabase
        .from('estimate_versions')
        .select('version_number')
        .eq('invoice_id', invoiceId)
        .order('version_number', { ascending: false })
        .limit(1);

      if (versionsError) {
        throw new Error('Failed to fetch version history');
      }

      const nextVersionNumber = existingVersions && existingVersions.length > 0
        ? existingVersions[0].version_number + 1
        : 1;

      // Create version snapshot
      const { data: newVersion, error: createError } = await supabase
        .from('estimate_versions')
        .insert({
          invoice_id: invoiceId,
          change_request_id: changeRequestId || null,
          version_number: nextVersionNumber,
          line_items: lineItems || [],
          subtotal: invoice.subtotal,
          tax_amount: invoice.tax_amount || 0,
          total_amount: invoice.total_amount,
          status: 'archived',
          notes: `Snapshot before ${changeRequestId ? 'change request approval' : 'manual update'}`,
          created_by: createdBy
        })
        .select('id')
        .single();

      if (createError) {
        throw createError;
      }

      console.log(`Created estimate version ${nextVersionNumber} for invoice ${invoiceId}`);

      return { success: true, versionId: newVersion.id };
    } catch (error) {
      console.error('Error creating estimate snapshot:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Get version history for an invoice
   */
  async getVersionHistory(invoiceId: string) {
    const { data, error } = await supabase
      .from('estimate_versions')
      .select('*')
      .eq('invoice_id', invoiceId)
      .order('version_number', { ascending: false });

    if (error) {
      console.error('Error fetching version history:', error);
      return [];
    }

    return data;
  }
}
