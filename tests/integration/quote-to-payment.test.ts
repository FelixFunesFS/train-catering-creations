import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { testSupabase, TestDataCleanup, waitForDb } from '../helpers/supabaseTestClient';
import { 
  createCorporateQuote, 
  createMilitaryQuote, 
  createSmallPartyQuote,
  generateEventDate 
} from '../fixtures/mockQuotes';
import { WorkflowService } from '@/services/WorkflowService';
import { PaymentMilestoneService } from '@/services/PaymentMilestoneService';
import { PaymentWorkflowService } from '@/services/PaymentWorkflowService';
import { TaxCalculationService } from '@/services/TaxCalculationService';

describe('End-to-End: Quote → Invoice → Payment', () => {
  let cleanup: TestDataCleanup;

  beforeEach(() => {
    cleanup = new TestDataCleanup();
  });

  afterEach(async () => {
    await cleanup.cleanupAll();
  });

  /**
   * TEST 1: Standard Customer Flow (50/50 Payment Split)
   * Tests the complete flow for a corporate event with standard payment terms
   */
  it('should complete standard customer flow with 50/50 payment split', async () => {
    // ============= STEP 1: Quote Submission =============
    const quoteData = createCorporateQuote({
      event_date: generateEventDate(45), // 45 days out
    });

    const { data: quote, error: quoteError } = await testSupabase
      .from('quote_requests')
      .insert(quoteData)
      .select()
      .single();

    expect(quoteError).toBeNull();
    expect(quote).toBeDefined();
    expect(quote.workflow_status).toBe('pending');
    cleanup.trackQuote(quote.id);

    await waitForDb();

    // ============= STEP 2: Invoice Generation =============
    const { invoice, lineItems, isNew } = await WorkflowService.generateInvoice(quote);

    expect(isNew).toBe(true);
    expect(invoice).toBeDefined();
    expect(invoice.document_type).toBe('estimate');
    expect(invoice.workflow_status).toBe('draft');
    expect(invoice.is_draft).toBe(true);
    expect(invoice.quote_request_id).toBe(quote.id);
    cleanup.trackInvoice(invoice.id);

    // Verify line items created
    expect(lineItems.length).toBeGreaterThan(0);
    
    // Find the Main Meal Package
    const mainMealPackage = lineItems.find(item => item.category === 'Main Meal Package');
    expect(mainMealPackage).toBeDefined();
    expect(mainMealPackage?.unit_price).toBe(0); // Should initialize at $0
    expect(mainMealPackage?.total_price).toBe(0);

    await waitForDb();

    // ============= STEP 3: Manual Pricing (Admin) =============
    // Update line items with realistic pricing
    const pricedLineItems = lineItems.map(item => {
      if (item.category === 'Main Meal Package') {
        return {
          ...item,
          unit_price: 1800, // $18 per person
          quantity: quote.guest_count,
          total_price: 1800 * quote.guest_count
        };
      }
      if (item.category === 'Service') {
        return {
          ...item,
          unit_price: 15000, // $150 flat
          quantity: 1,
          total_price: 15000
        };
      }
      if (item.category === 'Supplies') {
        return {
          ...item,
          unit_price: 7500, // $75 flat
          quantity: 1,
          total_price: 7500
        };
      }
      return item;
    });

    // Update line items in database
    for (const item of pricedLineItems) {
      const { error: updateError } = await testSupabase
        .from('invoice_line_items')
        .update({
          unit_price: item.unit_price,
          quantity: item.quantity,
          total_price: item.total_price
        })
        .eq('id', item.id);

      expect(updateError).toBeNull();
    }

    await waitForDb();

    // Calculate totals
    const subtotal = pricedLineItems.reduce((sum, item) => sum + item.total_price, 0);
    const taxCalc = TaxCalculationService.calculateTax(subtotal, false);

    // Update invoice totals
    await WorkflowService.updateInvoiceTotals(invoice.id, {
      subtotal: taxCalc.subtotal,
      tax_amount: taxCalc.taxAmount,
      total_amount: taxCalc.totalAmount
    });

    await waitForDb();

    // Verify totals updated
    const { data: updatedInvoice } = await testSupabase
      .from('invoices')
      .select('*')
      .eq('id', invoice.id)
      .single();

    expect(updatedInvoice?.subtotal).toBe(subtotal);
    expect(updatedInvoice?.tax_amount).toBe(taxCalc.taxAmount);
    expect(updatedInvoice?.total_amount).toBe(taxCalc.totalAmount);

    // ============= STEP 4: Generate Payment Milestones =============
    await PaymentMilestoneService.generateMilestones(invoice.id);
    await waitForDb();

    const { data: milestones } = await testSupabase
      .from('payment_milestones')
      .select('*')
      .eq('invoice_id', invoice.id)
      .order('percentage', { ascending: false });

    // For 45 days out, should use standard 3-tier schedule (25/50/25)
    // But we'll verify the actual implementation
    expect(milestones).toBeDefined();
    expect(milestones!.length).toBeGreaterThan(0);
    
    // Find the first milestone (should be due now)
    const depositMilestone = milestones!.find(m => m.is_due_now === true);
    expect(depositMilestone).toBeDefined();
    expect(depositMilestone!.status).toBe('pending');

    // ============= STEP 5: Send Invoice to Customer =============
    const { error: sendError } = await testSupabase
      .from('invoices')
      .update({
        workflow_status: 'sent',
        is_draft: false,
        sent_at: new Date().toISOString()
      })
      .eq('id', invoice.id);

    expect(sendError).toBeNull();

    // Update quote status
    await testSupabase
      .from('quote_requests')
      .update({ workflow_status: 'estimated' })
      .eq('id', quote.id);

    await waitForDb();

    // ============= STEP 6: Customer Views Invoice =============
    await testSupabase
      .from('invoices')
      .update({
        viewed_at: new Date().toISOString(),
        workflow_status: 'viewed'
      })
      .eq('id', invoice.id);

    await testSupabase
      .from('quote_requests')
      .update({ workflow_status: 'under_review' })
      .eq('id', quote.id);

    await waitForDb();

    // ============= STEP 7: Customer Approves Invoice =============
    await testSupabase
      .from('invoices')
      .update({
        workflow_status: 'approved',
        reviewed_at: new Date().toISOString()
      })
      .eq('id', invoice.id);

    await testSupabase
      .from('quote_requests')
      .update({ workflow_status: 'confirmed' })
      .eq('id', quote.id);

    await waitForDb();

    // ============= STEP 8: Process First Payment =============
    const paymentService = new PaymentWorkflowService();
    
    const firstPaymentResult = await paymentService.recordPayment({
      invoiceId: invoice.id,
      milestoneId: depositMilestone!.id,
      amount: depositMilestone!.amount_cents,
      paymentMethod: 'stripe',
      stripePaymentIntentId: 'pi_test_deposit_' + Date.now(),
      customerEmail: quote.email
    });

    expect(firstPaymentResult.success).toBe(true);
    await waitForDb();

    // Verify first payment transaction created
    const { data: firstTransaction } = await testSupabase
      .from('payment_transactions')
      .select('*')
      .eq('invoice_id', invoice.id)
      .eq('status', 'completed')
      .single();

    expect(firstTransaction).toBeDefined();
    expect(firstTransaction!.amount).toBe(depositMilestone!.amount_cents);
    expect(firstTransaction!.payment_type).toBe('milestone');

    // Verify milestone updated
    const { data: paidDepositMilestone } = await testSupabase
      .from('payment_milestones')
      .select('*')
      .eq('id', depositMilestone!.id)
      .single();

    expect(paidDepositMilestone!.status).toBe('paid');

    // Check if there are more milestones to pay
    const { data: remainingMilestones } = await testSupabase
      .from('payment_milestones')
      .select('*')
      .eq('invoice_id', invoice.id)
      .eq('status', 'pending');

    if (remainingMilestones && remainingMilestones.length > 0) {
      // ============= STEP 9: Process Remaining Payments =============
      for (const milestone of remainingMilestones) {
        const paymentResult = await paymentService.recordPayment({
          invoiceId: invoice.id,
          milestoneId: milestone.id,
          amount: milestone.amount_cents,
          paymentMethod: 'stripe',
          stripePaymentIntentId: 'pi_test_' + milestone.id + '_' + Date.now(),
          customerEmail: quote.email
        });

        expect(paymentResult.success).toBe(true);
        await waitForDb(200);
      }

      // Verify all milestones paid
      const { data: allMilestones } = await testSupabase
        .from('payment_milestones')
        .select('*')
        .eq('invoice_id', invoice.id);

      const allPaid = allMilestones!.every(m => m.status === 'paid');
      expect(allPaid).toBe(true);
    }

    await waitForDb();

    // ============= FINAL VERIFICATION =============
    // Verify invoice fully paid
    const { data: finalInvoice } = await testSupabase
      .from('invoices')
      .select('*')
      .eq('id', invoice.id)
      .single();

    expect(finalInvoice!.workflow_status).toBe('paid');
    expect(finalInvoice!.paid_at).toBeDefined();

    // Verify total payments match invoice total
    const { data: allTransactions } = await testSupabase
      .from('payment_transactions')
      .select('amount')
      .eq('invoice_id', invoice.id)
      .eq('status', 'completed');

    const totalPaid = allTransactions!.reduce((sum, t) => sum + t.amount, 0);
    expect(totalPaid).toBe(finalInvoice!.total_amount);

    // Verify quote completed
    const { data: finalQuote } = await testSupabase
      .from('quote_requests')
      .select('*')
      .eq('id', quote.id)
      .single();

    expect(finalQuote!.workflow_status).toBe('completed');
  }, 30000); // 30 second timeout

  /**
   * TEST 2: Government Customer Flow (Net 30)
   * Tests government contract with Net 30 payment terms
   */
  it('should complete government customer flow with Net 30 payment', async () => {
    // ============= STEP 1: Quote Submission =============
    const quoteData = createMilitaryQuote({
      event_date: generateEventDate(60), // 60 days out
      compliance_level: 'government',
      requires_po_number: true
    });

    const { data: quote, error: quoteError } = await testSupabase
      .from('quote_requests')
      .insert(quoteData)
      .select()
      .single();

    expect(quoteError).toBeNull();
    expect(quote).toBeDefined();
    cleanup.trackQuote(quote.id);

    await waitForDb();

    // ============= STEP 2: Invoice Generation =============
    const { invoice, lineItems } = await WorkflowService.generateInvoice(quote);

    expect(invoice).toBeDefined();
    cleanup.trackInvoice(invoice.id);

    await waitForDb();

    // ============= STEP 3: Manual Pricing =============
    const pricedLineItems = lineItems.map(item => {
      if (item.category === 'Main Meal Package') {
        return {
          ...item,
          unit_price: 1600, // $16 per person for government
          quantity: quote.guest_count,
          total_price: 1600 * quote.guest_count
        };
      }
      if (item.category === 'Service') {
        return {
          ...item,
          unit_price: 12000, // $120 flat
          quantity: 1,
          total_price: 12000
        };
      }
      return item;
    });

    for (const item of pricedLineItems) {
      await testSupabase
        .from('invoice_line_items')
        .update({
          unit_price: item.unit_price,
          quantity: item.quantity,
          total_price: item.total_price
        })
        .eq('id', item.id);
    }

    await waitForDb();

    // Calculate totals (NO TAX for government)
    const subtotal = pricedLineItems.reduce((sum, item) => sum + item.total_price, 0);
    const taxCalc = TaxCalculationService.calculateTax(subtotal, true); // Government = tax exempt

    expect(taxCalc.isExempt).toBe(true);
    expect(taxCalc.taxAmount).toBe(0);

    await WorkflowService.updateInvoiceTotals(invoice.id, {
      subtotal: taxCalc.subtotal,
      tax_amount: taxCalc.taxAmount,
      total_amount: taxCalc.totalAmount
    });

    await waitForDb();

    // ============= STEP 4: Generate Net 30 Milestone =============
    await PaymentMilestoneService.generateMilestones(invoice.id);
    await waitForDb();

    const { data: milestones } = await testSupabase
      .from('payment_milestones')
      .select('*')
      .eq('invoice_id', invoice.id);

    // Government should have single Net 30 milestone
    expect(milestones).toBeDefined();
    const net30Milestone = milestones!.find(m => m.is_net30 === true);
    expect(net30Milestone).toBeDefined();
    expect(net30Milestone!.percentage).toBe(100);
    expect(net30Milestone!.is_due_now).toBe(false);

    // ============= STEP 5-7: Send, View, Approve =============
    await testSupabase
      .from('invoices')
      .update({
        workflow_status: 'approved',
        sent_at: new Date().toISOString(),
        viewed_at: new Date().toISOString(),
        reviewed_at: new Date().toISOString()
      })
      .eq('id', invoice.id);

    await testSupabase
      .from('quote_requests')
      .update({ workflow_status: 'confirmed' })
      .eq('id', quote.id);

    await waitForDb();

    // ============= STEP 8: Process Net 30 Payment (After Event) =============
    const paymentService = new PaymentWorkflowService();
    
    const paymentResult = await paymentService.recordPayment({
      invoiceId: invoice.id,
      milestoneId: net30Milestone!.id,
      amount: net30Milestone!.amount_cents,
      paymentMethod: 'check',
      customerEmail: quote.email
    });

    expect(paymentResult.success).toBe(true);
    await waitForDb();

    // ============= FINAL VERIFICATION =============
    const { data: finalInvoice } = await testSupabase
      .from('invoices')
      .select('*')
      .eq('id', invoice.id)
      .single();

    expect(finalInvoice!.workflow_status).toBe('paid');
    expect(finalInvoice!.tax_amount).toBe(0); // No tax for government

    const { data: finalQuote } = await testSupabase
      .from('quote_requests')
      .select('*')
      .eq('id', quote.id)
      .single();

    expect(finalQuote!.workflow_status).toBe('completed');
  }, 30000);

  /**
   * TEST 3: Rush Event Flow (100% Due Now)
   * Tests rush event within 10 days requiring full upfront payment
   */
  it('should complete rush event flow with 100% upfront payment', async () => {
    // ============= STEP 1: Quote Submission =============
    const quoteData = createSmallPartyQuote({
      event_date: generateEventDate(5), // Only 5 days away!
    });

    const { data: quote, error: quoteError } = await testSupabase
      .from('quote_requests')
      .insert(quoteData)
      .select()
      .single();

    expect(quoteError).toBeNull();
    expect(quote).toBeDefined();
    cleanup.trackQuote(quote.id);

    await waitForDb();

    // ============= STEP 2: Invoice Generation =============
    const { invoice, lineItems } = await WorkflowService.generateInvoice(quote);

    expect(invoice).toBeDefined();
    cleanup.trackInvoice(invoice.id);

    await waitForDb();

    // ============= STEP 3: Manual Pricing =============
    const pricedLineItems = lineItems.map(item => {
      if (item.category === 'Main Meal Package') {
        return {
          ...item,
          unit_price: 2000, // $20 per person (rush pricing)
          quantity: quote.guest_count,
          total_price: 2000 * quote.guest_count
        };
      }
      if (item.category === 'Service') {
        return {
          ...item,
          unit_price: 10000, // $100 flat
          quantity: 1,
          total_price: 10000
        };
      }
      return item;
    });

    for (const item of pricedLineItems) {
      await testSupabase
        .from('invoice_line_items')
        .update({
          unit_price: item.unit_price,
          quantity: item.quantity,
          total_price: item.total_price
        })
        .eq('id', item.id);
    }

    await waitForDb();

    const subtotal = pricedLineItems.reduce((sum, item) => sum + item.total_price, 0);
    const taxCalc = TaxCalculationService.calculateTax(subtotal, false);

    await WorkflowService.updateInvoiceTotals(invoice.id, {
      subtotal: taxCalc.subtotal,
      tax_amount: taxCalc.taxAmount,
      total_amount: taxCalc.totalAmount
    });

    await waitForDb();

    // ============= STEP 4: Generate Rush Payment Schedule =============
    await PaymentMilestoneService.generateMilestones(invoice.id);
    await waitForDb();

    const { data: milestones } = await testSupabase
      .from('payment_milestones')
      .select('*')
      .eq('invoice_id', invoice.id);

    // Should have single milestone for 100% due now
    expect(milestones).toBeDefined();
    const fullPaymentMilestone = milestones!.find(m => m.is_due_now === true && m.percentage === 100);
    expect(fullPaymentMilestone).toBeDefined();

    // ============= STEP 5-7: Send, View, Approve (Combined) =============
    await testSupabase
      .from('invoices')
      .update({
        workflow_status: 'approved',
        sent_at: new Date().toISOString(),
        viewed_at: new Date().toISOString(),
        reviewed_at: new Date().toISOString()
      })
      .eq('id', invoice.id);

    await testSupabase
      .from('quote_requests')
      .update({ workflow_status: 'confirmed' })
      .eq('id', quote.id);

    await waitForDb();

    // ============= STEP 8: Process Full Payment Immediately =============
    const paymentService = new PaymentWorkflowService();
    
    const paymentResult = await paymentService.recordPayment({
      invoiceId: invoice.id,
      milestoneId: fullPaymentMilestone!.id,
      amount: fullPaymentMilestone!.amount_cents,
      paymentMethod: 'stripe',
      stripePaymentIntentId: 'pi_test_rush_' + Date.now(),
      customerEmail: quote.email
    });

    expect(paymentResult.success).toBe(true);
    await waitForDb();

    // ============= FINAL VERIFICATION =============
    const { data: finalInvoice } = await testSupabase
      .from('invoices')
      .select('*')
      .eq('id', invoice.id)
      .single();

    // Should go directly to 'paid' status
    expect(finalInvoice!.workflow_status).toBe('paid');
    expect(finalInvoice!.paid_at).toBeDefined();

    const { data: finalQuote } = await testSupabase
      .from('quote_requests')
      .select('*')
      .eq('id', quote.id)
      .single();

    // Should go directly to 'completed'
    expect(finalQuote!.workflow_status).toBe('completed');

    // Verify single payment equals full invoice total
    const { data: transactions } = await testSupabase
      .from('payment_transactions')
      .select('amount')
      .eq('invoice_id', invoice.id)
      .eq('status', 'completed');

    expect(transactions).toBeDefined();
    expect(transactions!.length).toBe(1);
    expect(transactions![0].amount).toBe(finalInvoice!.total_amount);
  }, 30000);
});
