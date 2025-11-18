import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const SUPABASE_URL = "https://qptprrqjlcvfkhfdnnoa.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwdHBycnFqbGN2ZmtoZmRubm9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1NjMzNTcsImV4cCI6MjA2OTEzOTM1N30.5ZMvbmhEkcmn_s_Q8ZI3KOPGZD1_kmH0OCUVL3gK3rE";

// Create test-specific Supabase client
export const testSupabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Test data cleanup utilities
 */
export class TestDataCleanup {
  private createdQuoteIds: string[] = [];
  private createdInvoiceIds: string[] = [];
  private createdCustomerIds: string[] = [];

  /**
   * Track a quote ID for cleanup
   */
  trackQuote(quoteId: string) {
    this.createdQuoteIds.push(quoteId);
  }

  /**
   * Track an invoice ID for cleanup
   */
  trackInvoice(invoiceId: string) {
    this.createdInvoiceIds.push(invoiceId);
  }

  /**
   * Track a customer ID for cleanup
   */
  trackCustomer(customerId: string) {
    this.createdCustomerIds.push(customerId);
  }

  /**
   * Clean up all test data in correct order (respecting foreign keys)
   */
  async cleanupAll() {
    const results = {
      success: true,
      errors: [] as string[],
    };

    // Clean up in reverse dependency order
    
    // 1. Delete payment transactions
    if (this.createdInvoiceIds.length > 0) {
      const { error: txError } = await testSupabase
        .from('payment_transactions')
        .delete()
        .in('invoice_id', this.createdInvoiceIds);
      if (txError) results.errors.push(`Payment transactions: ${txError.message}`);
    }

    // 2. Delete payment milestones
    if (this.createdInvoiceIds.length > 0) {
      const { error: msError } = await testSupabase
        .from('payment_milestones')
        .delete()
        .in('invoice_id', this.createdInvoiceIds);
      if (msError) results.errors.push(`Payment milestones: ${msError.message}`);
    }

    // 3. Delete invoice line items
    if (this.createdInvoiceIds.length > 0) {
      const { error: lineError } = await testSupabase
        .from('invoice_line_items')
        .delete()
        .in('invoice_id', this.createdInvoiceIds);
      if (lineError) results.errors.push(`Line items: ${lineError.message}`);
    }

    // 4. Delete invoices
    if (this.createdInvoiceIds.length > 0) {
      const { error: invError } = await testSupabase
        .from('invoices')
        .delete()
        .in('id', this.createdInvoiceIds);
      if (invError) results.errors.push(`Invoices: ${invError.message}`);
    }

    // 5. Delete change requests
    if (this.createdInvoiceIds.length > 0) {
      const { error: changeError } = await testSupabase
        .from('change_requests')
        .delete()
        .in('invoice_id', this.createdInvoiceIds);
      if (changeError) results.errors.push(`Change requests: ${changeError.message}`);
    }

    // 6. Delete quote requests
    if (this.createdQuoteIds.length > 0) {
      const { error: quoteError } = await testSupabase
        .from('quote_requests')
        .delete()
        .in('id', this.createdQuoteIds);
      if (quoteError) results.errors.push(`Quote requests: ${quoteError.message}`);
    }

    // 7. Delete customers (if tracked)
    if (this.createdCustomerIds.length > 0) {
      const { error: custError } = await testSupabase
        .from('customers')
        .delete()
        .in('id', this.createdCustomerIds);
      if (custError) results.errors.push(`Customers: ${custError.message}`);
    }

    // Clear tracking arrays
    this.createdQuoteIds = [];
    this.createdInvoiceIds = [];
    this.createdCustomerIds = [];

    if (results.errors.length > 0) {
      results.success = false;
      console.error('Cleanup errors:', results.errors);
    }

    return results;
  }

  /**
   * Clean up quotes with specific email pattern (e.g., test emails)
   */
  static async cleanupTestQuotesByEmail(emailPattern: string) {
    const { error } = await testSupabase
      .from('quote_requests')
      .delete()
      .like('email', `%${emailPattern}%`);
    
    if (error) {
      console.error('Failed to cleanup test quotes:', error);
      return { success: false, error };
    }

    return { success: true };
  }
}

/**
 * Helper to wait for database operations to complete
 */
export const waitForDb = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Verify quote exists and has expected status
 */
export async function verifyQuoteStatus(quoteId: string, expectedStatus: string) {
  const { data, error } = await testSupabase
    .from('quote_requests')
    .select('workflow_status')
    .eq('id', quoteId)
    .single();

  if (error) throw new Error(`Failed to verify quote: ${error.message}`);
  if (!data) throw new Error(`Quote ${quoteId} not found`);
  if (data.workflow_status !== expectedStatus) {
    throw new Error(`Expected status ${expectedStatus}, got ${data.workflow_status}`);
  }

  return true;
}

/**
 * Verify invoice exists and has expected status
 */
export async function verifyInvoiceStatus(invoiceId: string, expectedStatus: string) {
  const { data, error } = await testSupabase
    .from('invoices')
    .select('workflow_status')
    .eq('id', invoiceId)
    .single();

  if (error) throw new Error(`Failed to verify invoice: ${error.message}`);
  if (!data) throw new Error(`Invoice ${invoiceId} not found`);
  if (data.workflow_status !== expectedStatus) {
    throw new Error(`Expected status ${expectedStatus}, got ${data.workflow_status}`);
  }

  return true;
}

/**
 * Get payment milestones for an invoice
 */
export async function getPaymentMilestones(invoiceId: string) {
  const { data, error } = await testSupabase
    .from('payment_milestones')
    .select('*')
    .eq('invoice_id', invoiceId)
    .order('milestone_type');

  if (error) throw new Error(`Failed to get milestones: ${error.message}`);
  return data || [];
}

/**
 * Get line items for an invoice
 */
export async function getInvoiceLineItems(invoiceId: string) {
  const { data, error } = await testSupabase
    .from('invoice_line_items')
    .select('*')
    .eq('invoice_id', invoiceId)
    .order('category, created_at');

  if (error) throw new Error(`Failed to get line items: ${error.message}`);
  return data || [];
}
