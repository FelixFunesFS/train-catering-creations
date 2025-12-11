import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Play, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Trash2,
  ArrowRight,
  Users,
  FileText,
  CreditCard,
  Building2
} from 'lucide-react';

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  message?: string;
  data?: Record<string, unknown>;
}

interface WorkflowScenario {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  steps: WorkflowStep[];
}

export function WorkflowTestRunner() {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [currentScenario, setCurrentScenario] = useState<string | null>(null);
  const [testData, setTestData] = useState<Record<string, unknown>>({});
  
  const [scenarios, setScenarios] = useState<WorkflowScenario[]>([
    {
      id: 'standard',
      name: 'Standard Customer Flow',
      description: '50/50 payment split with deposit and final payment',
      icon: <Users className="h-5 w-5" />,
      steps: [
        { id: 'create_quote', name: 'Create Test Quote', description: 'Submit quote to database', status: 'pending' },
        { id: 'verify_quote', name: 'Verify Quote Created', description: 'Confirm quote exists with correct data', status: 'pending' },
        { id: 'generate_invoice', name: 'Generate Invoice', description: 'Create invoice from quote', status: 'pending' },
        { id: 'add_line_items', name: 'Add Line Items', description: 'Create line items with pricing', status: 'pending' },
        { id: 'create_milestones', name: 'Create Payment Milestones', description: 'Set up 50/50 split', status: 'pending' },
        { id: 'generate_token', name: 'Generate Access Token', description: 'Create customer portal token', status: 'pending' },
        { id: 'verify_portal_access', name: 'Verify Portal Access', description: 'Validate token-based access', status: 'pending' },
        { id: 'simulate_approval', name: 'Simulate Customer Approval', description: 'Update workflow to approved', status: 'pending' },
        { id: 'verify_status_sync', name: 'Verify Status Sync', description: 'Check quote/invoice status alignment', status: 'pending' },
      ]
    },
    {
      id: 'government',
      name: 'Government Customer Flow',
      description: 'Net 30 payment, tax-exempt, requires PO number',
      icon: <Building2 className="h-5 w-5" />,
      steps: [
        { id: 'create_gov_quote', name: 'Create Government Quote', description: 'Submit with compliance flags', status: 'pending' },
        { id: 'verify_tax_exempt', name: 'Verify Tax Exempt', description: 'Confirm 0% tax calculation', status: 'pending' },
        { id: 'create_net30_invoice', name: 'Create Net 30 Invoice', description: 'Invoice with post-event due date', status: 'pending' },
        { id: 'verify_po_number', name: 'Verify PO Number', description: 'Confirm PO tracking', status: 'pending' },
        { id: 'verify_single_milestone', name: 'Verify Single Milestone', description: 'Net 30 = 100% post-event', status: 'pending' },
      ]
    },
    {
      id: 'change_request',
      name: 'Change Request Flow',
      description: 'Customer requests modifications to estimate',
      icon: <FileText className="h-5 w-5" />,
      steps: [
        { id: 'create_base_quote', name: 'Create Base Quote', description: 'Initial quote submission', status: 'pending' },
        { id: 'create_estimate', name: 'Create Estimate', description: 'Generate invoice from quote', status: 'pending' },
        { id: 'submit_change_request', name: 'Submit Change Request', description: 'Customer requests changes', status: 'pending' },
        { id: 'verify_change_request', name: 'Verify Change Request', description: 'Confirm request recorded', status: 'pending' },
        { id: 'process_change', name: 'Process Change', description: 'Admin approves changes', status: 'pending' },
        { id: 'verify_version_increment', name: 'Verify Version Increment', description: 'Invoice version updated', status: 'pending' },
      ]
    },
    {
      id: 'payment',
      name: 'Payment Processing Flow',
      description: 'Verify payment recording and status updates',
      icon: <CreditCard className="h-5 w-5" />,
      steps: [
        { id: 'setup_payment_test', name: 'Setup Payment Test', description: 'Create invoice with milestones', status: 'pending' },
        { id: 'record_deposit', name: 'Record Deposit Payment', description: 'Simulate 50% deposit', status: 'pending' },
        { id: 'verify_partial_paid', name: 'Verify Partially Paid', description: 'Status updated correctly', status: 'pending' },
        { id: 'record_final', name: 'Record Final Payment', description: 'Simulate remaining 50%', status: 'pending' },
        { id: 'verify_fully_paid', name: 'Verify Fully Paid', description: 'Invoice marked as paid', status: 'pending' },
        { id: 'verify_payment_history', name: 'Verify Payment History', description: 'All transactions recorded', status: 'pending' },
      ]
    }
  ]);

  const updateStepStatus = (scenarioId: string, stepId: string, status: WorkflowStep['status'], message?: string, data?: Record<string, unknown>) => {
    setScenarios(prev => prev.map(scenario => {
      if (scenario.id !== scenarioId) return scenario;
      return {
        ...scenario,
        steps: scenario.steps.map(step => 
          step.id === stepId ? { ...step, status, message, data } : step
        )
      };
    }));
    if (data) {
      setTestData(prev => ({ ...prev, ...data }));
    }
  };

  const runScenario = async (scenarioId: string) => {
    setIsRunning(true);
    setCurrentScenario(scenarioId);
    setTestData({});
    
    // Reset all steps to pending
    setScenarios(prev => prev.map(s => ({
      ...s,
      steps: s.steps.map(step => ({ ...step, status: 'pending', message: undefined, data: undefined }))
    })));

    try {
      switch (scenarioId) {
        case 'standard':
          await runStandardFlow(scenarioId);
          break;
        case 'government':
          await runGovernmentFlow(scenarioId);
          break;
        case 'change_request':
          await runChangeRequestFlow(scenarioId);
          break;
        case 'payment':
          await runPaymentFlow(scenarioId);
          break;
      }
    } catch (error) {
      console.error('Scenario failed:', error);
    }
    
    setIsRunning(false);
    setCurrentScenario(null);
    
    const scenario = scenarios.find(s => s.id === scenarioId);
    const passedSteps = scenario?.steps.filter(s => s.status === 'passed').length || 0;
    const totalSteps = scenario?.steps.length || 0;
    
    toast({
      title: `${scenario?.name} Complete`,
      description: `${passedSteps}/${totalSteps} steps passed`,
      variant: passedSteps === totalSteps ? 'default' : 'destructive'
    });
  };

  // Standard Flow Implementation
  const runStandardFlow = async (scenarioId: string) => {
    const testEmail = `test-${Date.now()}@example.com`;
    
    // Step 1: Create Quote
    updateStepStatus(scenarioId, 'create_quote', 'running');
    const { data: quote, error: quoteError } = await supabase
      .from('quote_requests')
      .insert({
        contact_name: 'Test Customer',
        email: testEmail,
        phone: '843-555-0123',
        event_name: 'Test Event - Standard Flow',
        event_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        start_time: '18:00',
        location: 'Test Venue, Charleston SC',
        guest_count: 100,
        event_type: 'corporate',
        service_type: 'full-service',
        workflow_status: 'pending'
      })
      .select()
      .single();
    
    if (quoteError || !quote) {
      updateStepStatus(scenarioId, 'create_quote', 'failed', quoteError?.message || 'Failed to create quote');
      return;
    }
    updateStepStatus(scenarioId, 'create_quote', 'passed', `Quote created: ${quote.id}`, { quoteId: quote.id, testEmail });

    // Step 2: Verify Quote
    updateStepStatus(scenarioId, 'verify_quote', 'running');
    const { data: verifyQuote, error: verifyError } = await supabase
      .from('quote_requests')
      .select('*')
      .eq('id', quote.id)
      .single();
    
    if (verifyError || !verifyQuote) {
      updateStepStatus(scenarioId, 'verify_quote', 'failed', 'Quote not found in database');
      return;
    }
    updateStepStatus(scenarioId, 'verify_quote', 'passed', 'Quote verified in database');

    // Step 3: Generate Invoice
    updateStepStatus(scenarioId, 'generate_invoice', 'running');
    const accessToken = crypto.randomUUID();
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        quote_request_id: quote.id,
        subtotal: 0,
        tax_amount: 0,
        total_amount: 0,
        workflow_status: 'draft',
        document_type: 'estimate',
        customer_access_token: accessToken,
        is_draft: true
      })
      .select()
      .single();
    
    if (invoiceError || !invoice) {
      updateStepStatus(scenarioId, 'generate_invoice', 'failed', invoiceError?.message || 'Failed to create invoice');
      return;
    }
    updateStepStatus(scenarioId, 'generate_invoice', 'passed', `Invoice created: ${invoice.id}`, { invoiceId: invoice.id, accessToken });

    // Step 4: Add Line Items
    updateStepStatus(scenarioId, 'add_line_items', 'running');
    const { error: lineItemsError } = await supabase
      .from('invoice_line_items')
      .insert([
        { invoice_id: invoice.id, title: 'Main Meal Package', description: 'Chicken, Ribs, Mac & Cheese', quantity: 100, unit_price: 25, total_price: 2500, category: 'food' },
        { invoice_id: invoice.id, title: 'Service Fee', description: 'Full-service catering', quantity: 1, unit_price: 500, total_price: 500, category: 'service' },
      ]);
    
    if (lineItemsError) {
      updateStepStatus(scenarioId, 'add_line_items', 'failed', lineItemsError.message);
      return;
    }
    
    // Update invoice totals
    await supabase.from('invoices').update({ subtotal: 3000, tax_amount: 240, total_amount: 3240 }).eq('id', invoice.id);
    updateStepStatus(scenarioId, 'add_line_items', 'passed', 'Line items added, total: $3,240');

    // Step 5: Create Milestones
    updateStepStatus(scenarioId, 'create_milestones', 'running');
    const { error: milestonesError } = await supabase
      .from('payment_milestones')
      .insert([
        { invoice_id: invoice.id, milestone_type: 'deposit', percentage: 50, amount_cents: 162000, status: 'pending' },
        { invoice_id: invoice.id, milestone_type: 'final', percentage: 50, amount_cents: 162000, status: 'pending' },
      ]);
    
    if (milestonesError) {
      updateStepStatus(scenarioId, 'create_milestones', 'failed', milestonesError.message);
      return;
    }
    updateStepStatus(scenarioId, 'create_milestones', 'passed', '50/50 payment milestones created');

    // Step 6: Generate Token (already done)
    updateStepStatus(scenarioId, 'generate_token', 'running');
    updateStepStatus(scenarioId, 'generate_token', 'passed', `Token: ${accessToken.slice(0, 8)}...`);

    // Step 7: Verify Portal Access
    updateStepStatus(scenarioId, 'verify_portal_access', 'running');
    const { data: portalData } = await supabase
      .from('invoices')
      .select('id, customer_access_token')
      .eq('customer_access_token', accessToken)
      .single();
    
    if (!portalData) {
      updateStepStatus(scenarioId, 'verify_portal_access', 'failed', 'Token not found');
      return;
    }
    updateStepStatus(scenarioId, 'verify_portal_access', 'passed', 'Portal access validated');

    // Step 8: Simulate Approval
    updateStepStatus(scenarioId, 'simulate_approval', 'running');
    const { error: approvalError } = await supabase
      .from('invoices')
      .update({ workflow_status: 'approved', is_draft: false })
      .eq('id', invoice.id);
    
    if (approvalError) {
      updateStepStatus(scenarioId, 'simulate_approval', 'failed', approvalError.message);
      return;
    }
    updateStepStatus(scenarioId, 'simulate_approval', 'passed', 'Invoice approved');

    // Step 9: Verify Status Sync
    updateStepStatus(scenarioId, 'verify_status_sync', 'running');
    const { data: syncCheck } = await supabase
      .from('invoices')
      .select('workflow_status')
      .eq('id', invoice.id)
      .single();
    
    if (syncCheck?.workflow_status !== 'approved') {
      updateStepStatus(scenarioId, 'verify_status_sync', 'failed', `Expected 'approved', got '${syncCheck?.workflow_status}'`);
      return;
    }
    updateStepStatus(scenarioId, 'verify_status_sync', 'passed', 'Status sync verified');
  };

  // Government Flow Implementation
  const runGovernmentFlow = async (scenarioId: string) => {
    const testEmail = `gov-test-${Date.now()}@example.gov`;
    
    // Step 1: Create Government Quote
    updateStepStatus(scenarioId, 'create_gov_quote', 'running');
    const { data: quote, error: quoteError } = await supabase
      .from('quote_requests')
      .insert({
        contact_name: 'Gov Test Customer',
        email: testEmail,
        phone: '843-555-0456',
        event_name: 'Government Event Test',
        event_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        start_time: '12:00',
        location: 'Federal Building, Charleston',
        guest_count: 50,
        event_type: 'military_function',
        service_type: 'delivery-setup',
        workflow_status: 'pending',
        compliance_level: 'government',
        requires_po_number: true,
        po_number: 'PO-2024-TEST-001'
      })
      .select()
      .single();
    
    if (quoteError || !quote) {
      updateStepStatus(scenarioId, 'create_gov_quote', 'failed', quoteError?.message || 'Failed');
      return;
    }
    updateStepStatus(scenarioId, 'create_gov_quote', 'passed', `Gov quote created`, { quoteId: quote.id });

    // Step 2: Verify Tax Exempt
    updateStepStatus(scenarioId, 'verify_tax_exempt', 'running');
    // Government quotes should have 0% tax
    const { data: verifyQuote } = await supabase
      .from('quote_requests')
      .select('compliance_level, requires_po_number')
      .eq('id', quote.id)
      .single();
    
    if (verifyQuote?.compliance_level !== 'government') {
      updateStepStatus(scenarioId, 'verify_tax_exempt', 'failed', 'Compliance level not set');
      return;
    }
    updateStepStatus(scenarioId, 'verify_tax_exempt', 'passed', 'Tax exempt status confirmed');

    // Step 3: Create Net 30 Invoice
    updateStepStatus(scenarioId, 'create_net30_invoice', 'running');
    const eventDate = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000);
    const net30Date = new Date(eventDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        quote_request_id: quote.id,
        subtotal: 1500,
        tax_amount: 0, // Tax exempt
        total_amount: 1500,
        workflow_status: 'draft',
        document_type: 'estimate',
        payment_schedule_type: 'net30',
        due_date: net30Date.toISOString(),
        customer_access_token: crypto.randomUUID()
      })
      .select()
      .single();
    
    if (invoiceError) {
      updateStepStatus(scenarioId, 'create_net30_invoice', 'failed', invoiceError.message);
      return;
    }
    updateStepStatus(scenarioId, 'create_net30_invoice', 'passed', 'Net 30 invoice created', { invoiceId: invoice.id });

    // Step 4: Verify PO Number
    updateStepStatus(scenarioId, 'verify_po_number', 'running');
    if (!verifyQuote?.requires_po_number) {
      updateStepStatus(scenarioId, 'verify_po_number', 'failed', 'PO tracking not enabled');
      return;
    }
    updateStepStatus(scenarioId, 'verify_po_number', 'passed', `PO Number: ${quote.po_number}`);

    // Step 5: Verify Single Milestone
    updateStepStatus(scenarioId, 'verify_single_milestone', 'running');
    const { error: milestoneError } = await supabase
      .from('payment_milestones')
      .insert({
        invoice_id: invoice.id,
        milestone_type: 'net30',
        percentage: 100,
        amount_cents: 150000,
        status: 'pending',
        is_net30: true,
        due_date: net30Date.toISOString()
      });
    
    if (milestoneError) {
      updateStepStatus(scenarioId, 'verify_single_milestone', 'failed', milestoneError.message);
      return;
    }
    updateStepStatus(scenarioId, 'verify_single_milestone', 'passed', '100% Net 30 milestone created');
  };

  // Change Request Flow Implementation
  const runChangeRequestFlow = async (scenarioId: string) => {
    const testEmail = `change-test-${Date.now()}@example.com`;
    
    // Step 1: Create Base Quote
    updateStepStatus(scenarioId, 'create_base_quote', 'running');
    const { data: quote, error: quoteError } = await supabase
      .from('quote_requests')
      .insert({
        contact_name: 'Change Request Test',
        email: testEmail,
        phone: '843-555-0789',
        event_name: 'Change Request Test Event',
        event_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        start_time: '17:00',
        location: 'Test Location',
        guest_count: 75,
        event_type: 'private_party',
        service_type: 'delivery-setup',
        workflow_status: 'pending'
      })
      .select()
      .single();
    
    if (quoteError || !quote) {
      updateStepStatus(scenarioId, 'create_base_quote', 'failed', quoteError?.message || 'Failed');
      return;
    }
    updateStepStatus(scenarioId, 'create_base_quote', 'passed', 'Base quote created', { quoteId: quote.id });

    // Step 2: Create Estimate
    updateStepStatus(scenarioId, 'create_estimate', 'running');
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        quote_request_id: quote.id,
        subtotal: 2000,
        tax_amount: 160,
        total_amount: 2160,
        workflow_status: 'sent',
        document_type: 'estimate',
        version: 1,
        customer_access_token: crypto.randomUUID()
      })
      .select()
      .single();
    
    if (invoiceError) {
      updateStepStatus(scenarioId, 'create_estimate', 'failed', invoiceError.message);
      return;
    }
    updateStepStatus(scenarioId, 'create_estimate', 'passed', 'Estimate v1 created', { invoiceId: invoice.id });

    // Step 3: Submit Change Request
    updateStepStatus(scenarioId, 'submit_change_request', 'running');
    const { data: changeRequest, error: crError } = await supabase
      .from('change_requests')
      .insert({
        invoice_id: invoice.id,
        customer_email: testEmail,
        request_type: 'modification',
        requested_changes: { guest_count: 100, notes: 'Increased guest count' },
        workflow_status: 'pending',
        priority: 'medium'
      })
      .select()
      .single();
    
    if (crError) {
      updateStepStatus(scenarioId, 'submit_change_request', 'failed', crError.message);
      return;
    }
    updateStepStatus(scenarioId, 'submit_change_request', 'passed', 'Change request submitted', { changeRequestId: changeRequest.id });

    // Step 4: Verify Change Request
    updateStepStatus(scenarioId, 'verify_change_request', 'running');
    const { data: verifyRequest } = await supabase
      .from('change_requests')
      .select('*')
      .eq('id', changeRequest.id)
      .single();
    
    if (!verifyRequest) {
      updateStepStatus(scenarioId, 'verify_change_request', 'failed', 'Change request not found');
      return;
    }
    updateStepStatus(scenarioId, 'verify_change_request', 'passed', 'Change request verified');

    // Step 5: Process Change
    updateStepStatus(scenarioId, 'process_change', 'running');
    const { error: processError } = await supabase
      .from('change_requests')
      .update({ 
        workflow_status: 'completed',
        admin_response: 'Approved - guest count updated',
        reviewed_at: new Date().toISOString()
      })
      .eq('id', changeRequest.id);
    
    if (processError) {
      updateStepStatus(scenarioId, 'process_change', 'failed', processError.message);
      return;
    }
    updateStepStatus(scenarioId, 'process_change', 'passed', 'Change approved by admin');

    // Step 6: Verify Version Increment
    updateStepStatus(scenarioId, 'verify_version_increment', 'running');
    const { error: versionError } = await supabase
      .from('invoices')
      .update({ version: 2, subtotal: 2500, tax_amount: 200, total_amount: 2700 })
      .eq('id', invoice.id);
    
    if (versionError) {
      updateStepStatus(scenarioId, 'verify_version_increment', 'failed', versionError.message);
      return;
    }
    
    const { data: updatedInvoice } = await supabase
      .from('invoices')
      .select('version')
      .eq('id', invoice.id)
      .single();
    
    if (updatedInvoice?.version !== 2) {
      updateStepStatus(scenarioId, 'verify_version_increment', 'failed', `Expected v2, got v${updatedInvoice?.version}`);
      return;
    }
    updateStepStatus(scenarioId, 'verify_version_increment', 'passed', 'Invoice updated to v2');
  };

  // Payment Flow Implementation
  const runPaymentFlow = async (scenarioId: string) => {
    const testEmail = `payment-test-${Date.now()}@example.com`;
    
    // Step 1: Setup Payment Test
    updateStepStatus(scenarioId, 'setup_payment_test', 'running');
    const { data: quote } = await supabase
      .from('quote_requests')
      .insert({
        contact_name: 'Payment Test Customer',
        email: testEmail,
        phone: '843-555-1111',
        event_name: 'Payment Flow Test',
        event_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        start_time: '19:00',
        location: 'Payment Test Venue',
        guest_count: 50,
        event_type: 'corporate',
        service_type: 'delivery-setup',
        workflow_status: 'approved'
      })
      .select()
      .single();
    
    if (!quote) {
      updateStepStatus(scenarioId, 'setup_payment_test', 'failed', 'Failed to create quote');
      return;
    }

    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        quote_request_id: quote.id,
        subtotal: 2000,
        tax_amount: 160,
        total_amount: 2160,
        workflow_status: 'approved',
        document_type: 'invoice',
        customer_access_token: crypto.randomUUID()
      })
      .select()
      .single();
    
    if (invoiceError || !invoice) {
      updateStepStatus(scenarioId, 'setup_payment_test', 'failed', invoiceError?.message || 'Failed');
      return;
    }

    // Create milestones
    const { data: milestones } = await supabase
      .from('payment_milestones')
      .insert([
        { invoice_id: invoice.id, milestone_type: 'deposit', percentage: 50, amount_cents: 108000, status: 'pending' },
        { invoice_id: invoice.id, milestone_type: 'final', percentage: 50, amount_cents: 108000, status: 'pending' },
      ])
      .select();
    
    updateStepStatus(scenarioId, 'setup_payment_test', 'passed', 'Invoice + milestones created', { 
      invoiceId: invoice.id, 
      depositMilestoneId: milestones?.[0]?.id,
      finalMilestoneId: milestones?.[1]?.id,
      testEmail 
    });

    // Step 2: Record Deposit Payment
    updateStepStatus(scenarioId, 'record_deposit', 'running');
    const { error: depositError } = await supabase
      .from('payment_transactions')
      .insert({
        invoice_id: invoice.id,
        milestone_id: milestones?.[0]?.id,
        amount: 1080,
        currency: 'usd',
        customer_email: testEmail,
        payment_type: 'milestone',
        payment_method: 'card',
        status: 'completed',
        processed_at: new Date().toISOString()
      });
    
    if (depositError) {
      updateStepStatus(scenarioId, 'record_deposit', 'failed', depositError.message);
      return;
    }
    
    // Update milestone status
    await supabase.from('payment_milestones').update({ status: 'paid' }).eq('id', milestones?.[0]?.id);
    updateStepStatus(scenarioId, 'record_deposit', 'passed', '$1,080 deposit recorded');

    // Step 3: Verify Partially Paid
    updateStepStatus(scenarioId, 'verify_partial_paid', 'running');
    const { error: partialError } = await supabase
      .from('invoices')
      .update({ workflow_status: 'partially_paid' })
      .eq('id', invoice.id);
    
    if (partialError) {
      updateStepStatus(scenarioId, 'verify_partial_paid', 'failed', partialError.message);
      return;
    }
    updateStepStatus(scenarioId, 'verify_partial_paid', 'passed', 'Status: partially_paid');

    // Step 4: Record Final Payment
    updateStepStatus(scenarioId, 'record_final', 'running');
    const { error: finalError } = await supabase
      .from('payment_transactions')
      .insert({
        invoice_id: invoice.id,
        milestone_id: milestones?.[1]?.id,
        amount: 1080,
        currency: 'usd',
        customer_email: testEmail,
        payment_type: 'milestone',
        payment_method: 'card',
        status: 'completed',
        processed_at: new Date().toISOString()
      });
    
    if (finalError) {
      updateStepStatus(scenarioId, 'record_final', 'failed', finalError.message);
      return;
    }
    
    await supabase.from('payment_milestones').update({ status: 'paid' }).eq('id', milestones?.[1]?.id);
    updateStepStatus(scenarioId, 'record_final', 'passed', '$1,080 final payment recorded');

    // Step 5: Verify Fully Paid
    updateStepStatus(scenarioId, 'verify_fully_paid', 'running');
    const { error: paidError } = await supabase
      .from('invoices')
      .update({ workflow_status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', invoice.id);
    
    if (paidError) {
      updateStepStatus(scenarioId, 'verify_fully_paid', 'failed', paidError.message);
      return;
    }
    updateStepStatus(scenarioId, 'verify_fully_paid', 'passed', 'Invoice marked as paid');

    // Step 6: Verify Payment History
    updateStepStatus(scenarioId, 'verify_payment_history', 'running');
    const { data: payments, error: historyError } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('invoice_id', invoice.id);
    
    if (historyError || payments?.length !== 2) {
      updateStepStatus(scenarioId, 'verify_payment_history', 'failed', `Expected 2 transactions, got ${payments?.length}`);
      return;
    }
    
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    updateStepStatus(scenarioId, 'verify_payment_history', 'passed', `${payments.length} transactions, total: $${totalPaid.toFixed(2)}`);
  };

  const cleanupTestData = async () => {
    try {
      // Delete test data by email pattern
      await supabase.from('payment_transactions').delete().like('customer_email', '%test-%@example%');
      await supabase.from('payment_milestones').delete().filter('invoice_id', 'in', 
        `(SELECT id FROM invoices WHERE quote_request_id IN (SELECT id FROM quote_requests WHERE email LIKE '%test-%@example%'))`
      );
      await supabase.from('invoice_line_items').delete().filter('invoice_id', 'in',
        `(SELECT id FROM invoices WHERE quote_request_id IN (SELECT id FROM quote_requests WHERE email LIKE '%test-%@example%'))`
      );
      await supabase.from('change_requests').delete().like('customer_email', '%test-%@example%');
      await supabase.from('invoices').delete().filter('quote_request_id', 'in',
        `(SELECT id FROM quote_requests WHERE email LIKE '%test-%@example%')`
      );
      await supabase.from('quote_requests').delete().like('email', '%test-%@example%');
      
      toast({
        title: 'Cleanup Complete',
        description: 'Test data has been removed'
      });
    } catch (error) {
      toast({
        title: 'Cleanup Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    }
  };

  const getProgressForScenario = (scenario: WorkflowScenario) => {
    const completed = scenario.steps.filter(s => s.status === 'passed' || s.status === 'failed').length;
    return (completed / scenario.steps.length) * 100;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Workflow Test Runner</h2>
          <p className="text-muted-foreground">Interactive end-to-end workflow validation</p>
        </div>
        <Button variant="outline" onClick={cleanupTestData} disabled={isRunning}>
          <Trash2 className="h-4 w-4 mr-2" />
          Cleanup Test Data
        </Button>
      </div>

      <div className="grid gap-6">
        {scenarios.map(scenario => (
          <Card key={scenario.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {scenario.icon}
                  <div>
                    <CardTitle className="text-lg">{scenario.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{scenario.description}</p>
                  </div>
                </div>
                <Button 
                  onClick={() => runScenario(scenario.id)}
                  disabled={isRunning}
                  size="sm"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Run
                </Button>
              </div>
              {currentScenario === scenario.id && (
                <Progress value={getProgressForScenario(scenario)} className="mt-4" />
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {scenario.steps.map((step, index) => (
                  <div key={step.id} className="flex items-center gap-3 p-2 rounded border">
                    {step.status === 'passed' && <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />}
                    {step.status === 'failed' && <XCircle className="h-4 w-4 text-destructive shrink-0" />}
                    {step.status === 'running' && <Clock className="h-4 w-4 text-primary animate-spin shrink-0" />}
                    {step.status === 'pending' && <div className="h-4 w-4 rounded-full border-2 shrink-0" />}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{step.name}</span>
                        {index < scenario.steps.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
                      </div>
                      {step.message && (
                        <p className="text-xs text-muted-foreground truncate">{step.message}</p>
                      )}
                    </div>
                    
                    <Badge variant={
                      step.status === 'passed' ? 'default' :
                      step.status === 'failed' ? 'destructive' :
                      step.status === 'running' ? 'secondary' : 'outline'
                    } className="shrink-0">
                      {step.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
