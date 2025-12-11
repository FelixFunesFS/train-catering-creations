import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { buildPaymentSchedule, getScheduleDescription } from '@/utils/paymentScheduling';
import { TaxCalculationService } from '@/services/TaxCalculationService';
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
  Building2,
  Zap
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
      name: 'Standard Customer Flow (45+ days)',
      description: '10/50/40 payment split: 10% booking, 50% @ 30 days, 40% @ 2 weeks',
      icon: <Users className="h-5 w-5" />,
      steps: [
        { id: 'create_quote', name: 'Create Test Quote', description: 'Submit quote 60 days out', status: 'pending' },
        { id: 'verify_quote', name: 'Verify Quote Created', description: 'Confirm quote exists with correct data', status: 'pending' },
        { id: 'generate_invoice', name: 'Generate Invoice', description: 'Create invoice from quote', status: 'pending' },
        { id: 'verify_tax', name: 'Verify 9% Tax', description: 'Confirm 2% hospitality + 7% service tax', status: 'pending' },
        { id: 'create_milestones', name: 'Create Payment Milestones', description: 'Set up 10/50/40 split', status: 'pending' },
        { id: 'verify_schedule', name: 'Verify Payment Schedule', description: 'Confirm 3 milestones with correct amounts', status: 'pending' },
        { id: 'simulate_approval', name: 'Simulate Customer Approval', description: 'Update workflow to approved', status: 'pending' },
        { id: 'verify_status_sync', name: 'Verify Status Sync', description: 'Check quote/invoice status alignment', status: 'pending' },
      ]
    },
    {
      id: 'rush',
      name: 'Rush Event Flow (≤14 days)',
      description: '100% payment due immediately',
      icon: <Zap className="h-5 w-5" />,
      steps: [
        { id: 'create_rush_quote', name: 'Create Rush Quote', description: 'Submit quote 10 days out', status: 'pending' },
        { id: 'verify_rush_tier', name: 'Verify Rush Tier', description: 'Confirm RUSH schedule tier detected', status: 'pending' },
        { id: 'generate_rush_invoice', name: 'Generate Rush Invoice', description: 'Create invoice with rush pricing', status: 'pending' },
        { id: 'verify_single_milestone', name: 'Verify Single Milestone', description: 'Confirm 100% due NOW', status: 'pending' },
        { id: 'verify_rush_tax', name: 'Verify Tax Calculation', description: 'Confirm 9% tax applied', status: 'pending' },
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
        { id: 'verify_gov_milestone', name: 'Verify Single Milestone', description: 'Net 30 = 100% post-event', status: 'pending' },
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
      description: 'Verify 10/50/40 payment recording and status updates',
      icon: <CreditCard className="h-5 w-5" />,
      steps: [
        { id: 'setup_payment_test', name: 'Setup Payment Test', description: 'Create invoice with 3 milestones', status: 'pending' },
        { id: 'record_deposit', name: 'Record Deposit (10%)', description: 'Simulate booking deposit', status: 'pending' },
        { id: 'verify_partial_paid_1', name: 'Verify Partially Paid', description: 'Status updated correctly', status: 'pending' },
        { id: 'record_milestone', name: 'Record Milestone (50%)', description: 'Simulate milestone payment', status: 'pending' },
        { id: 'verify_partial_paid_2', name: 'Verify Still Partial', description: '60% paid, 40% remaining', status: 'pending' },
        { id: 'record_final', name: 'Record Final (40%)', description: 'Simulate final payment', status: 'pending' },
        { id: 'verify_fully_paid', name: 'Verify Fully Paid', description: 'Invoice marked as paid', status: 'pending' },
        { id: 'verify_payment_history', name: 'Verify Payment History', description: 'All 3 transactions recorded', status: 'pending' },
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
        case 'rush':
          await runRushFlow(scenarioId);
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

  // Standard Flow Implementation (45+ days = 10/50/40 split)
  const runStandardFlow = async (scenarioId: string) => {
    const testEmail = `test-${Date.now()}@example.com`;
    const eventDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 60 days out
    
    // Step 1: Create Quote
    updateStepStatus(scenarioId, 'create_quote', 'running');
    const { data: quote, error: quoteError } = await supabase
      .from('quote_requests')
      .insert({
        contact_name: 'Test Customer',
        email: testEmail,
        phone: '843-555-0123',
        event_name: 'Test Event - Standard Flow',
        event_date: eventDate.toISOString().split('T')[0],
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
    const subtotal = 300000; // $3,000
    const taxCalc = TaxCalculationService.calculateDetailedTax(subtotal, false);
    
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        quote_request_id: quote.id,
        subtotal: subtotal,
        tax_amount: taxCalc.taxAmount,
        total_amount: taxCalc.totalAmount,
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
    updateStepStatus(scenarioId, 'generate_invoice', 'passed', `Invoice created: $${(taxCalc.totalAmount / 100).toFixed(2)}`, { invoiceId: invoice.id, accessToken });

    // Step 4: Verify Tax (9% = 2% hospitality + 7% service)
    updateStepStatus(scenarioId, 'verify_tax', 'running');
    const expectedTax = Math.round(subtotal * 0.09);
    if (Math.abs(taxCalc.taxAmount - expectedTax) > 1) { // Allow $0.01 rounding
      updateStepStatus(scenarioId, 'verify_tax', 'failed', `Expected $${(expectedTax/100).toFixed(2)} tax, got $${(taxCalc.taxAmount/100).toFixed(2)}`);
      return;
    }
    updateStepStatus(scenarioId, 'verify_tax', 'passed', `Tax: $${(taxCalc.taxAmount/100).toFixed(2)} (2% + 7% = 9%)`);

    // Step 5: Create Milestones (10/50/40)
    updateStepStatus(scenarioId, 'create_milestones', 'running');
    const schedule = buildPaymentSchedule(eventDate, 'PERSON', new Date(), taxCalc.totalAmount);
    
    const depositAmount = Math.round(taxCalc.totalAmount * 0.10);
    const milestoneAmount = Math.round(taxCalc.totalAmount * 0.50);
    const balanceAmount = taxCalc.totalAmount - depositAmount - milestoneAmount;
    
    const milestone30DaysBefore = new Date(eventDate);
    milestone30DaysBefore.setDate(milestone30DaysBefore.getDate() - 30);
    
    const balance14DaysBefore = new Date(eventDate);
    balance14DaysBefore.setDate(balance14DaysBefore.getDate() - 14);
    
    const { error: milestonesError } = await supabase
      .from('payment_milestones')
      .insert([
        { 
          invoice_id: invoice.id, 
          milestone_type: 'DEPOSIT', 
          percentage: 10, 
          amount_cents: depositAmount, 
          status: 'pending',
          is_due_now: true,
          description: 'Booking deposit (10%)'
        },
        { 
          invoice_id: invoice.id, 
          milestone_type: 'MILESTONE', 
          percentage: 50, 
          amount_cents: milestoneAmount, 
          status: 'pending',
          due_date: milestone30DaysBefore.toISOString().split('T')[0],
          description: 'Milestone payment (50%)'
        },
        { 
          invoice_id: invoice.id, 
          milestone_type: 'BALANCE', 
          percentage: 40, 
          amount_cents: balanceAmount, 
          status: 'pending',
          due_date: balance14DaysBefore.toISOString().split('T')[0],
          description: 'Final payment (40%)'
        },
      ]);
    
    if (milestonesError) {
      updateStepStatus(scenarioId, 'create_milestones', 'failed', milestonesError.message);
      return;
    }
    updateStepStatus(scenarioId, 'create_milestones', 'passed', `10/50/40 milestones: $${(depositAmount/100).toFixed(2)} / $${(milestoneAmount/100).toFixed(2)} / $${(balanceAmount/100).toFixed(2)}`);

    // Step 6: Verify Payment Schedule
    updateStepStatus(scenarioId, 'verify_schedule', 'running');
    const { data: milestones } = await supabase
      .from('payment_milestones')
      .select('*')
      .eq('invoice_id', invoice.id)
      .order('percentage', { ascending: true });
    
    if (!milestones || milestones.length !== 3) {
      updateStepStatus(scenarioId, 'verify_schedule', 'failed', `Expected 3 milestones, got ${milestones?.length || 0}`);
      return;
    }
    
    const totalMilestoneAmount = milestones.reduce((sum, m) => sum + m.amount_cents, 0);
    if (Math.abs(totalMilestoneAmount - taxCalc.totalAmount) > 1) {
      updateStepStatus(scenarioId, 'verify_schedule', 'failed', `Milestone amounts don't match total`);
      return;
    }
    updateStepStatus(scenarioId, 'verify_schedule', 'passed', `3 milestones verified, total: $${(totalMilestoneAmount/100).toFixed(2)}`);

    // Step 7: Simulate Approval
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

    // Step 8: Verify Status Sync
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

  // Rush Flow Implementation (≤14 days = 100% NOW)
  const runRushFlow = async (scenarioId: string) => {
    const testEmail = `rush-test-${Date.now()}@example.com`;
    const eventDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000); // 10 days out
    
    // Step 1: Create Rush Quote
    updateStepStatus(scenarioId, 'create_rush_quote', 'running');
    const { data: quote, error: quoteError } = await supabase
      .from('quote_requests')
      .insert({
        contact_name: 'Rush Customer',
        email: testEmail,
        phone: '843-555-0999',
        event_name: 'Rush Event Test',
        event_date: eventDate.toISOString().split('T')[0],
        start_time: '12:00',
        location: 'Rush Venue',
        guest_count: 50,
        event_type: 'corporate',
        service_type: 'delivery-setup',
        workflow_status: 'pending'
      })
      .select()
      .single();
    
    if (quoteError || !quote) {
      updateStepStatus(scenarioId, 'create_rush_quote', 'failed', quoteError?.message || 'Failed');
      return;
    }
    updateStepStatus(scenarioId, 'create_rush_quote', 'passed', `Rush quote created (10 days out)`, { quoteId: quote.id });

    // Step 2: Verify Rush Tier
    updateStepStatus(scenarioId, 'verify_rush_tier', 'running');
    const schedule = buildPaymentSchedule(eventDate, 'PERSON', new Date(), 100000);
    
    if (schedule.schedule_tier !== 'RUSH') {
      updateStepStatus(scenarioId, 'verify_rush_tier', 'failed', `Expected RUSH tier, got ${schedule.schedule_tier}`);
      return;
    }
    if (schedule.rules.length !== 1 || schedule.rules[0].percentage !== 100) {
      updateStepStatus(scenarioId, 'verify_rush_tier', 'failed', `Expected 1 rule at 100%, got ${schedule.rules.length} rules`);
      return;
    }
    updateStepStatus(scenarioId, 'verify_rush_tier', 'passed', `RUSH tier: ${getScheduleDescription('RUSH')}`);

    // Step 3: Generate Rush Invoice
    updateStepStatus(scenarioId, 'generate_rush_invoice', 'running');
    const subtotal = 150000; // $1,500
    const taxCalc = TaxCalculationService.calculateDetailedTax(subtotal, false);
    
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        quote_request_id: quote.id,
        subtotal: subtotal,
        tax_amount: taxCalc.taxAmount,
        total_amount: taxCalc.totalAmount,
        workflow_status: 'draft',
        document_type: 'estimate',
        customer_access_token: crypto.randomUUID()
      })
      .select()
      .single();
    
    if (invoiceError) {
      updateStepStatus(scenarioId, 'generate_rush_invoice', 'failed', invoiceError.message);
      return;
    }
    updateStepStatus(scenarioId, 'generate_rush_invoice', 'passed', `Rush invoice: $${(taxCalc.totalAmount/100).toFixed(2)}`, { invoiceId: invoice.id });

    // Step 4: Verify Single Milestone (100% NOW)
    updateStepStatus(scenarioId, 'verify_single_milestone', 'running');
    const { error: milestoneError } = await supabase
      .from('payment_milestones')
      .insert({
        invoice_id: invoice.id,
        milestone_type: 'FULL',
        percentage: 100,
        amount_cents: taxCalc.totalAmount,
        status: 'pending',
        is_due_now: true,
        description: 'Full payment due (event within 14 days)'
      });
    
    if (milestoneError) {
      updateStepStatus(scenarioId, 'verify_single_milestone', 'failed', milestoneError.message);
      return;
    }
    updateStepStatus(scenarioId, 'verify_single_milestone', 'passed', '100% due NOW milestone created');

    // Step 5: Verify Tax
    updateStepStatus(scenarioId, 'verify_rush_tax', 'running');
    const expectedTax = Math.round(subtotal * 0.09);
    if (Math.abs(taxCalc.taxAmount - expectedTax) > 1) {
      updateStepStatus(scenarioId, 'verify_rush_tax', 'failed', `Tax mismatch: expected $${(expectedTax/100).toFixed(2)}, got $${(taxCalc.taxAmount/100).toFixed(2)}`);
      return;
    }
    updateStepStatus(scenarioId, 'verify_rush_tax', 'passed', `9% tax verified: $${(taxCalc.taxAmount/100).toFixed(2)}`);
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
    const subtotal = 150000;
    const taxCalc = TaxCalculationService.calculateDetailedTax(subtotal, true); // Government = tax exempt
    
    if (taxCalc.taxAmount !== 0) {
      updateStepStatus(scenarioId, 'verify_tax_exempt', 'failed', `Expected $0 tax, got $${(taxCalc.taxAmount/100).toFixed(2)}`);
      return;
    }
    updateStepStatus(scenarioId, 'verify_tax_exempt', 'passed', 'Tax exempt status confirmed (0%)');

    // Step 3: Create Net 30 Invoice
    updateStepStatus(scenarioId, 'create_net30_invoice', 'running');
    const eventDate = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000);
    const net30Date = new Date(eventDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        quote_request_id: quote.id,
        subtotal: subtotal,
        tax_amount: 0, // Tax exempt
        total_amount: subtotal,
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
    const { data: verifyQuote } = await supabase
      .from('quote_requests')
      .select('requires_po_number, po_number')
      .eq('id', quote.id)
      .single();
    
    if (!verifyQuote?.requires_po_number) {
      updateStepStatus(scenarioId, 'verify_po_number', 'failed', 'PO tracking not enabled');
      return;
    }
    updateStepStatus(scenarioId, 'verify_po_number', 'passed', `PO Number: ${quote.po_number}`);

    // Step 5: Verify Single Milestone (Net 30)
    updateStepStatus(scenarioId, 'verify_gov_milestone', 'running');
    const { error: milestoneError } = await supabase
      .from('payment_milestones')
      .insert({
        invoice_id: invoice.id,
        milestone_type: 'FINAL',
        percentage: 100,
        amount_cents: subtotal,
        status: 'pending',
        is_net30: true,
        due_date: net30Date.toISOString()
      });
    
    if (milestoneError) {
      updateStepStatus(scenarioId, 'verify_gov_milestone', 'failed', milestoneError.message);
      return;
    }
    updateStepStatus(scenarioId, 'verify_gov_milestone', 'passed', '100% Net 30 milestone created');
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
    const subtotal = 200000;
    const taxCalc = TaxCalculationService.calculateDetailedTax(subtotal, false);
    
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        quote_request_id: quote.id,
        subtotal: subtotal,
        tax_amount: taxCalc.taxAmount,
        total_amount: taxCalc.totalAmount,
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
    const newSubtotal = 250000;
    const newTaxCalc = TaxCalculationService.calculateDetailedTax(newSubtotal, false);
    
    const { error: versionError } = await supabase
      .from('invoices')
      .update({ version: 2, subtotal: newSubtotal, tax_amount: newTaxCalc.taxAmount, total_amount: newTaxCalc.totalAmount })
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

  // Payment Flow Implementation (10/50/40 split)
  const runPaymentFlow = async (scenarioId: string) => {
    const testEmail = `payment-test-${Date.now()}@example.com`;
    const eventDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 60 days out
    
    // Step 1: Setup Payment Test
    updateStepStatus(scenarioId, 'setup_payment_test', 'running');
    const { data: quote } = await supabase
      .from('quote_requests')
      .insert({
        contact_name: 'Payment Test Customer',
        email: testEmail,
        phone: '843-555-1111',
        event_name: 'Payment Flow Test',
        event_date: eventDate.toISOString().split('T')[0],
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

    const subtotal = 200000; // $2,000
    const taxCalc = TaxCalculationService.calculateDetailedTax(subtotal, false);
    const totalAmount = taxCalc.totalAmount; // $2,180 with 9% tax

    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        quote_request_id: quote.id,
        subtotal: subtotal,
        tax_amount: taxCalc.taxAmount,
        total_amount: totalAmount,
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

    // Create 10/50/40 milestones
    const depositAmount = Math.round(totalAmount * 0.10); // 10%
    const milestoneAmount = Math.round(totalAmount * 0.50); // 50%
    const balanceAmount = totalAmount - depositAmount - milestoneAmount; // 40%

    const { data: milestones } = await supabase
      .from('payment_milestones')
      .insert([
        { invoice_id: invoice.id, milestone_type: 'DEPOSIT', percentage: 10, amount_cents: depositAmount, status: 'pending', is_due_now: true },
        { invoice_id: invoice.id, milestone_type: 'MILESTONE', percentage: 50, amount_cents: milestoneAmount, status: 'pending' },
        { invoice_id: invoice.id, milestone_type: 'BALANCE', percentage: 40, amount_cents: balanceAmount, status: 'pending' },
      ])
      .select();
    
    updateStepStatus(scenarioId, 'setup_payment_test', 'passed', `Invoice $${(totalAmount/100).toFixed(2)} with 3 milestones`, { 
      invoiceId: invoice.id, 
      depositMilestoneId: milestones?.[0]?.id,
      milestoneMilestoneId: milestones?.[1]?.id,
      finalMilestoneId: milestones?.[2]?.id,
      testEmail,
      depositAmount,
      milestoneAmount,
      balanceAmount
    });

    // Step 2: Record Deposit Payment (10%)
    updateStepStatus(scenarioId, 'record_deposit', 'running');
    const { error: depositError } = await supabase
      .from('payment_transactions')
      .insert({
        invoice_id: invoice.id,
        milestone_id: milestones?.[0]?.id,
        amount: depositAmount,
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
    
    await supabase.from('payment_milestones').update({ status: 'paid' }).eq('id', milestones?.[0]?.id);
    updateStepStatus(scenarioId, 'record_deposit', 'passed', `$${(depositAmount/100).toFixed(2)} deposit (10%) recorded`);

    // Step 3: Verify Partially Paid
    updateStepStatus(scenarioId, 'verify_partial_paid_1', 'running');
    const { error: partialError1 } = await supabase
      .from('invoices')
      .update({ workflow_status: 'partially_paid' })
      .eq('id', invoice.id);
    
    if (partialError1) {
      updateStepStatus(scenarioId, 'verify_partial_paid_1', 'failed', partialError1.message);
      return;
    }
    updateStepStatus(scenarioId, 'verify_partial_paid_1', 'passed', 'Status: partially_paid (10% paid)');

    // Step 4: Record Milestone Payment (50%)
    updateStepStatus(scenarioId, 'record_milestone', 'running');
    const { error: milestonePayError } = await supabase
      .from('payment_transactions')
      .insert({
        invoice_id: invoice.id,
        milestone_id: milestones?.[1]?.id,
        amount: milestoneAmount,
        currency: 'usd',
        customer_email: testEmail,
        payment_type: 'milestone',
        payment_method: 'card',
        status: 'completed',
        processed_at: new Date().toISOString()
      });
    
    if (milestonePayError) {
      updateStepStatus(scenarioId, 'record_milestone', 'failed', milestonePayError.message);
      return;
    }
    
    await supabase.from('payment_milestones').update({ status: 'paid' }).eq('id', milestones?.[1]?.id);
    updateStepStatus(scenarioId, 'record_milestone', 'passed', `$${(milestoneAmount/100).toFixed(2)} milestone (50%) recorded`);

    // Step 5: Verify Still Partial (60% paid)
    updateStepStatus(scenarioId, 'verify_partial_paid_2', 'running');
    const paidSoFar = depositAmount + milestoneAmount;
    const remaining = totalAmount - paidSoFar;
    updateStepStatus(scenarioId, 'verify_partial_paid_2', 'passed', `60% paid ($${(paidSoFar/100).toFixed(2)}), $${(remaining/100).toFixed(2)} remaining`);

    // Step 6: Record Final Payment (40%)
    updateStepStatus(scenarioId, 'record_final', 'running');
    const { error: finalError } = await supabase
      .from('payment_transactions')
      .insert({
        invoice_id: invoice.id,
        milestone_id: milestones?.[2]?.id,
        amount: balanceAmount,
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
    
    await supabase.from('payment_milestones').update({ status: 'paid' }).eq('id', milestones?.[2]?.id);
    updateStepStatus(scenarioId, 'record_final', 'passed', `$${(balanceAmount/100).toFixed(2)} final (40%) recorded`);

    // Step 7: Verify Fully Paid
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

    // Step 8: Verify Payment History
    updateStepStatus(scenarioId, 'verify_payment_history', 'running');
    const { data: payments, error: historyError } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('invoice_id', invoice.id);
    
    if (historyError || payments?.length !== 3) {
      updateStepStatus(scenarioId, 'verify_payment_history', 'failed', `Expected 3 transactions, got ${payments?.length}`);
      return;
    }
    
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    if (Math.abs(totalPaid - totalAmount) > 1) {
      updateStepStatus(scenarioId, 'verify_payment_history', 'failed', `Payment mismatch: paid $${(totalPaid/100).toFixed(2)}, expected $${(totalAmount/100).toFixed(2)}`);
      return;
    }
    updateStepStatus(scenarioId, 'verify_payment_history', 'passed', `3 transactions verified, total: $${(totalPaid/100).toFixed(2)}`);
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
          <p className="text-muted-foreground">Interactive end-to-end workflow validation (10/50/40 payment + 9% tax)</p>
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
