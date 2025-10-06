import { supabase } from '@/integrations/supabase/client';

// Simple test execution function that can be called immediately
export async function executeComprehensiveTests() {
  console.log('🚀 Starting Comprehensive Test Execution for Soul Train\'s Eatery');
  console.log('📧 Test Customer: felixfunes2001.ff@gmail.com');
  console.log('⏰ Start Time:', new Date().toISOString());

  const testResults = {
    startTime: new Date(),
    results: [] as any[],
    errors: [] as any[],
    summary: {
      total: 0,
      passed: 0,
      failed: 0
    }
  };

  // Test 1: Create Quote Request
  try {
    console.log('\n📝 Test 1: Creating Quote Request...');
    const quoteData = {
      contact_name: 'Felix Funes',
      email: 'felixfunes2001.ff@gmail.com',
      phone: '(843) 970-0265',
      event_name: 'Test Corporate Event - E2E Validation',
      event_type: 'corporate' as const,
      event_date: '2024-07-15',
      start_time: '12:00:00',
      location: 'Charleston Convention Center',
      guest_count: 50,
      service_type: 'full-service' as const,
      primary_protein: 'grilled-chicken',
      status: 'pending' as const
    };

    const { data: quote, error } = await supabase
      .from('quote_requests')
      .insert(quoteData)
      .select()
      .single();

    if (error) throw error;
    
    testResults.results.push({
      test: 'Create Quote Request',
      status: 'passed',
      data: quote,
      timestamp: new Date()
    });
    testResults.summary.passed++;
    console.log('✅ Quote Request Created:', quote.id);
  } catch (error) {
    testResults.results.push({
      test: 'Create Quote Request',
      status: 'failed',
      error: error.message,
      timestamp: new Date()
    });
    testResults.errors.push(error);
    testResults.summary.failed++;
    console.log('❌ Quote Request Failed:', error.message);
  }

  // Test 2: Generate Estimate/Invoice
  try {
    console.log('\n💰 Test 2: Generating Estimate...');
    
    // Get the most recent quote
    const { data: recentQuote } = await supabase
      .from('quote_requests')
      .select('*')
      .eq('email', 'felixfunes2001.ff@gmail.com')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!recentQuote) throw new Error('No quote found for estimate generation');

    const invoiceData = {
      quote_request_id: recentQuote.id,
      subtotal: recentQuote.guest_count * 2500, // $25 per person
      tax_amount: Math.round(recentQuote.guest_count * 2500 * 0.08), // 8% tax
      total_amount: Math.round(recentQuote.guest_count * 2500 * 1.08),
      document_type: 'estimate',
      status: 'draft',
      currency: 'usd',
      due_date: '2024-07-10',
      is_draft: false,
      customer_access_token: crypto.randomUUID()
    };

    const { data: invoice, error } = await supabase
      .from('invoices')
      .insert(invoiceData)
      .select()
      .single();

    if (error) throw error;

    // Create line items
    const lineItems = [
      {
        invoice_id: invoice.id,
        title: 'Catering Service',
        description: `${recentQuote.service_type} for ${recentQuote.guest_count} guests`,
        quantity: recentQuote.guest_count,
        unit_price: 2500,
        total_price: recentQuote.guest_count * 2500,
        category: 'catering'
      }
    ];

    await supabase.from('invoice_line_items').insert(lineItems);

    testResults.results.push({
      test: 'Generate Estimate',
      status: 'passed',
      data: { invoice, lineItems },
      timestamp: new Date()
    });
    testResults.summary.passed++;
    console.log('✅ Estimate Generated:', invoice.id, `Token: ${invoice.customer_access_token}`);
  } catch (error) {
    testResults.results.push({
      test: 'Generate Estimate',
      status: 'failed',
      error: error.message,
      timestamp: new Date()
    });
    testResults.errors.push(error);
    testResults.summary.failed++;
    console.log('❌ Estimate Generation Failed:', error.message);
  }

  // Test 3: Simulate Customer Approval
  try {
    console.log('\n👍 Test 3: Simulating Customer Approval...');
    
    const { data: invoice } = await supabase
      .from('invoices')
      .select('*')
      .eq('quote_request_id', (
        await supabase
          .from('quote_requests')
          .select('id')
          .eq('email', 'felixfunes2001.ff@gmail.com')
          .order('created_at', { ascending: false })
          .limit(1)
          .single()
      ).data?.id)
      .single();

    if (!invoice) throw new Error('No invoice found for approval');

    const { data: approvedInvoice, error } = await supabase
      .from('invoices')
      .update({ 
        status: 'approved',
        status_changed_by: 'customer',
        last_customer_action: new Date().toISOString()
      })
      .eq('id', invoice.id)
      .select()
      .single();

    if (error) throw error;

    testResults.results.push({
      test: 'Customer Approval',
      status: 'passed',
      data: approvedInvoice,
      timestamp: new Date()
    });
    testResults.summary.passed++;
    console.log('✅ Customer Approval Simulated:', approvedInvoice.workflow_status);
  } catch (error) {
    testResults.results.push({
      test: 'Customer Approval',
      status: 'failed',
      error: error.message,
      timestamp: new Date()
    });
    testResults.errors.push(error);
    testResults.summary.failed++;
    console.log('❌ Customer Approval Failed:', error.message);
  }

  // Test 4: Submit Change Request
  try {
    console.log('\n🔄 Test 4: Submitting Change Request...');
    
    const { data: invoice } = await supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const changeRequest = {
      invoice_id: invoice?.id,
      customer_email: 'felixfunes2001.ff@gmail.com',
      request_type: 'modification',
      priority: 'medium',
      customer_comments: 'Need to increase guest count from 50 to 75 people',
      requested_changes: {
        guest_count: 75,
        original_guest_count: 50,
        reason: 'More attendees confirmed'
      },
      estimated_cost_change: 62500 // 25 guests * $25
    };

    const { data: changeReq, error } = await supabase
      .from('change_requests')
      .insert(changeRequest)
      .select()
      .single();

    if (error) throw error;

    testResults.results.push({
      test: 'Submit Change Request',
      status: 'passed',
      data: changeReq,
      timestamp: new Date()
    });
    testResults.summary.passed++;
    console.log('✅ Change Request Submitted:', changeReq.id);
  } catch (error) {
    testResults.results.push({
      test: 'Submit Change Request',
      status: 'failed',
      error: error.message,
      timestamp: new Date()
    });
    testResults.errors.push(error);
    testResults.summary.failed++;
    console.log('❌ Change Request Failed:', error.message);
  }

  // Test 5: Admin Approve Change
  try {
    console.log('\n✅ Test 5: Admin Approving Change...');
    
    const { data: changeRequest } = await supabase
      .from('change_requests')
      .select('*')
      .eq('customer_email', 'felixfunes2001.ff@gmail.com')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!changeRequest) throw new Error('No pending change request found');

    const { data: approvedChange, error } = await supabase
      .from('change_requests')
      .update({
        status: 'approved',
        admin_response: 'Changes approved. Guest count updated to 75. Additional cost: $625.00',
        reviewed_by: 'admin',
        reviewed_at: new Date().toISOString()
      })
      .eq('id', changeRequest.id)
      .select()
      .single();

    if (error) throw error;

    testResults.results.push({
      test: 'Admin Approve Change',
      status: 'passed',
      data: approvedChange,
      timestamp: new Date()
    });
    testResults.summary.passed++;
    console.log('✅ Change Request Approved:', approvedChange.workflow_status);
  } catch (error) {
    testResults.results.push({
      test: 'Admin Approve Change',
      status: 'failed',
      error: error.message,
      timestamp: new Date()
    });
    testResults.errors.push(error);
    testResults.summary.failed++;
    console.log('❌ Admin Approval Failed:', error.message);
  }

  // Calculate totals
  testResults.summary.total = testResults.summary.passed + testResults.summary.failed;
  const successRate = Math.round((testResults.summary.passed / testResults.summary.total) * 100);

  console.log('\n🎯 Test Execution Complete!');
  console.log('📊 Summary:');
  console.log(`   Total Tests: ${testResults.summary.total}`);
  console.log(`   ✅ Passed: ${testResults.summary.passed}`);
  console.log(`   ❌ Failed: ${testResults.summary.failed}`);
  console.log(`   📈 Success Rate: ${successRate}%`);
  console.log(`   ⏱️  Duration: ${Date.now() - testResults.startTime.getTime()}ms`);

  if (testResults.errors.length > 0) {
    console.log('\n🚨 Errors Encountered:');
    testResults.errors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error.message}`);
    });
  }

  // Key Findings
  console.log('\n🔍 Key Findings:');
  if (successRate >= 80) {
    console.log('   ✅ System is functioning well for end-to-end workflow');
  } else {
    console.log('   ⚠️  System has issues that need attention');
  }

  const approvalTest = testResults.results.find(r => r.test === 'Customer Approval');
  if (approvalTest?.status === 'passed') {
    console.log('   ✅ One-click approval workflow is working');
  }

  const changeTest = testResults.results.find(r => r.test === 'Submit Change Request');
  if (changeTest?.status === 'passed') {
    console.log('   ✅ Change request system is operational');
  }

  return testResults;
}

// Run the tests immediately when this module is imported
// Note: This will execute when the utility is called
export { executeComprehensiveTests as default };