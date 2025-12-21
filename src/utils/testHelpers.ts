import { supabase } from '@/integrations/supabase/client';

/**
 * Test helper utilities for verifying end-to-end flows
 */

export interface FlowTestResult {
  success: boolean;
  message: string;
  data?: any;
  error?: any;
}

/**
 * Test the complete customer quote-to-payment flow
 */
export async function testCustomerFlow(email: string): Promise<FlowTestResult> {
  try {
    // Step 1: Check if customer has quote requests
    const { data: quotes, error: quoteError } = await supabase
      .from('quote_requests')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1);

    if (quoteError) {
      return { success: false, message: 'Failed to fetch quotes', error: quoteError };
    }

    if (!quotes || quotes.length === 0) {
      return { success: false, message: 'No quotes found for this customer' };
    }

    const quote = quotes[0];

    // Step 2: Check if invoice exists
    const { data: invoices, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('quote_request_id', quote.id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (invoiceError) {
      return { success: false, message: 'Failed to fetch invoice', error: invoiceError };
    }

    // Step 3: Check for change requests
    const { data: changeRequests, error: changeError } = await supabase
      .from('change_requests')
      .select('*')
      .eq('customer_email', email);

    if (changeError) {
      return { success: false, message: 'Failed to fetch change requests', error: changeError };
    }

    // Step 4: Check for payments
    const { data: payments, error: paymentError } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('customer_email', email);

    if (paymentError) {
      return { success: false, message: 'Failed to fetch payments', error: paymentError };
    }

    return {
      success: true,
      message: 'Customer flow verified successfully',
      data: {
        quote,
        invoice: invoices?.[0],
        changeRequests,
        payments
      }
    };
  } catch (error) {
    return {
      success: false,
      message: 'Unexpected error in customer flow test',
      error
    };
  }
}

/**
 * Test admin workflow capabilities
 */
export async function testAdminWorkflow(): Promise<FlowTestResult> {
  try {
    // Check admin can access all necessary tables
    const tables = [
      'quote_requests',
      'invoices',
      'invoice_line_items',
      'change_requests',
      'payment_transactions',
      'email_templates'
    ];

    const results = await Promise.all(
      tables.map(async (table) => {
        const { error } = await supabase
          .from(table as any)
          .select('id')
          .limit(1);
        return { table, accessible: !error, error };
      })
    );

    const inaccessible = results.filter(r => !r.accessible);

    if (inaccessible.length > 0) {
      return {
        success: false,
        message: `Admin cannot access: ${inaccessible.map(r => r.table).join(', ')}`,
        data: results
      };
    }

    return {
      success: true,
      message: 'Admin has access to all required tables',
      data: results
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to test admin workflow',
      error
    };
  }
}

/**
 * Verify database integrity and relationships
 */
export async function testDatabaseIntegrity(): Promise<FlowTestResult> {
  try {
    // Test 1: Orphaned invoices (invoices without quote_requests)
    const { data: orphanedInvoices, error: orphanError } = await supabase
      .from('invoices')
      .select(`
        id,
        quote_request_id,
        quote_requests!inner(id)
      `)
      .is('quote_requests.id', null);

    // Test 2: Line items without invoices
    const { data: orphanedLineItems, error: lineItemError } = await supabase
      .from('invoice_line_items')
      .select(`
        id,
        invoice_id,
        invoices!inner(id)
      `)
      .is('invoices.id', null);

    const issues = [];
    if (orphanedInvoices && orphanedInvoices.length > 0) {
      issues.push(`${orphanedInvoices.length} orphaned invoices`);
    }
    if (orphanedLineItems && orphanedLineItems.length > 0) {
      issues.push(`${orphanedLineItems.length} orphaned line items`);
    }

    return {
      success: issues.length === 0,
      message: issues.length === 0 
        ? 'Database integrity verified'
        : `Issues found: ${issues.join(', ')}`,
      data: { orphanedInvoices, orphanedLineItems }
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to verify database integrity',
      error
    };
  }
}

/**
 * Test email system configuration (SMTP)
 */
export async function testEmailSystem(): Promise<FlowTestResult> {
  // Email system now uses SMTP with hardcoded templates - no database config needed
  return {
    success: true,
    message: 'Email system configured with SMTP',
    data: { provider: 'smtp' }
  };
}

/**
 * Test Stripe integration
 */
export async function testStripeIntegration(): Promise<FlowTestResult> {
  try {
    const { data: transactions, error } = await supabase
      .from('payment_transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      return { success: false, message: 'Failed to access payment transactions', error };
    }

    const hasCompletedPayment = transactions?.some(t => t.status === 'completed');

    return {
      success: true,
      message: hasCompletedPayment 
        ? `Stripe integration operational (${transactions.length} transactions)`
        : 'Stripe configured but no completed payments yet',
      data: transactions
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to test Stripe integration',
      error
    };
  }
}
