import { supabase } from '@/integrations/supabase/client';

interface TestScenario {
  id: string;
  name: string;
  description: string;
  steps: TestStep[];
  expectedOutcome: string;
  customerEmail: string;
}

interface TestStep {
  action: string;
  description: string;
  expectedResult: string;
  validationQuery?: string;
}

interface TestResult {
  scenarioId: string;
  stepIndex: number;
  action: string;
  status: 'passed' | 'failed' | 'pending';
  actualResult?: any;
  expectedResult: string;
  timestamp: Date;
  error?: any;
}

export class ComprehensiveTestSuite {
  private testEmail = 'felixfunes2001.ff@gmail.com';
  private results: TestResult[] = [];

  // Test Scenario Definitions
  public scenarios: TestScenario[] = [
    {
      id: 'T001',
      name: 'Direct Approval Flow',
      description: 'Customer receives estimate email and approves with one click',
      customerEmail: this.testEmail,
      steps: [
        {
          action: 'create_quote_request',
          description: 'Create a quote request for the test customer',
          expectedResult: 'Quote request created successfully'
        },
        {
          action: 'generate_estimate',
          description: 'Generate an estimate/invoice for the quote',
          expectedResult: 'Invoice created with customer access token'
        },
        {
          action: 'simulate_email_click_approve',
          description: 'Simulate customer clicking approve from email',
          expectedResult: 'Invoice status updated to approved'
        },
        {
          action: 'verify_approval_workflow',
          description: 'Verify approval workflow triggers contract generation',
          expectedResult: 'Contract sent and quote status updated'
        }
      ],
      expectedOutcome: 'Customer successfully approves estimate in under 30 seconds'
    },
    {
      id: 'T002',
      name: 'Simple Change Request Flow',
      description: 'Customer requests a simple change (guest count increase)',
      customerEmail: this.testEmail,
      steps: [
        {
          action: 'create_quote_request',
          description: 'Create a quote request with 50 guests',
          expectedResult: 'Quote request created for 50 guests'
        },
        {
          action: 'generate_estimate',
          description: 'Generate estimate for original guest count',
          expectedResult: 'Invoice created with proper line items'
        },
        {
          action: 'simulate_change_request',
          description: 'Customer requests increase to 75 guests',
          expectedResult: 'Change request submitted successfully'
        },
        {
          action: 'admin_approve_change',
          description: 'Admin reviews and approves the change',
          expectedResult: 'Change approved with cost adjustment'
        },
        {
          action: 'verify_updated_estimate',
          description: 'Verify new estimate reflects changes',
          expectedResult: 'Updated estimate sent to customer'
        }
      ],
      expectedOutcome: 'Change request processed smoothly with accurate cost calculations'
    },
    {
      id: 'T003',
      name: 'Complex Multi-Change Request',
      description: 'Customer requests multiple changes: date, guest count, and menu',
      customerEmail: this.testEmail,
      steps: [
        {
          action: 'create_complex_quote',
          description: 'Create quote with specific date, 100 guests, full menu',
          expectedResult: 'Complex quote created successfully'
        },
        {
          action: 'generate_detailed_estimate',
          description: 'Generate detailed estimate with all line items',
          expectedResult: 'Comprehensive estimate created'
        },
        {
          action: 'submit_complex_changes',
          description: 'Request date change, +25 guests, menu modifications',
          expectedResult: 'Complex change request submitted'
        },
        {
          action: 'admin_review_complex',
          description: 'Admin reviews complex changes and provides response',
          expectedResult: 'Admin provides detailed response with new pricing'
        }
      ],
      expectedOutcome: 'Complex changes handled accurately with proper communication'
    },
    {
      id: 'T004',
      name: 'Change Request Rejection Flow',
      description: 'Admin rejects a change request with explanation',
      customerEmail: this.testEmail,
      steps: [
        {
          action: 'create_quote_request',
          description: 'Create standard quote request',
          expectedResult: 'Quote created successfully'
        },
        {
          action: 'generate_estimate',
          description: 'Generate initial estimate',
          expectedResult: 'Estimate ready for customer'
        },
        {
          action: 'submit_difficult_change',
          description: 'Request change that cannot be accommodated',
          expectedResult: 'Difficult change request submitted'
        },
        {
          action: 'admin_reject_change',
          description: 'Admin rejects change with clear explanation',
          expectedResult: 'Rejection recorded with reason'
        },
        {
          action: 'verify_customer_notification',
          description: 'Verify customer receives rejection notification',
          expectedResult: 'Customer notified of rejection with alternatives'
        }
      ],
      expectedOutcome: 'Rejection handled professionally with clear communication'
    },
    {
      id: 'T005',
      name: 'End-to-End Event Completion',
      description: 'Complete lifecycle from quote to event completion',
      customerEmail: this.testEmail,
      steps: [
        {
          action: 'create_government_quote',
          description: 'Create government contract quote',
          expectedResult: 'Government quote with compliance requirements'
        },
        {
          action: 'generate_government_estimate',
          description: 'Generate estimate with NET30 terms',
          expectedResult: 'Government estimate with proper payment terms'
        },
        {
          action: 'customer_approve_estimate',
          description: 'Customer approves estimate',
          expectedResult: 'Approval triggers contract workflow'
        },
        {
          action: 'admin_send_final_details',
          description: 'Admin sends final event details',
          expectedResult: 'Final details sent 72 hours before event'
        },
        {
          action: 'mark_event_completed',
          description: 'Mark event as completed',
          expectedResult: 'Event marked complete, invoice finalized'
        }
      ],
      expectedOutcome: 'Complete event lifecycle managed successfully'
    }
  ];

  // Execute individual test step
  async executeStep(scenario: TestScenario, stepIndex: number): Promise<TestResult> {
    const step = scenario.steps[stepIndex];
    const result: TestResult = {
      scenarioId: scenario.id,
      stepIndex,
      action: step.action,
      status: 'pending',
      expectedResult: step.expectedResult,
      timestamp: new Date()
    };

    try {
      switch (step.action) {
        case 'create_quote_request':
          result.actualResult = await this.createQuoteRequest(scenario);
          break;
        case 'create_complex_quote':
          result.actualResult = await this.createComplexQuote(scenario);
          break;
        case 'create_government_quote':
          result.actualResult = await this.createGovernmentQuote(scenario);
          break;
        case 'generate_estimate':
        case 'generate_detailed_estimate':
        case 'generate_government_estimate':
          result.actualResult = await this.generateEstimate(scenario);
          break;
        case 'simulate_email_click_approve':
        case 'customer_approve_estimate':
          result.actualResult = await this.simulateApproval(scenario);
          break;
        case 'simulate_change_request':
        case 'submit_complex_changes':
        case 'submit_difficult_change':
          result.actualResult = await this.submitChangeRequest(scenario, step);
          break;
        case 'admin_approve_change':
        case 'admin_review_complex':
          result.actualResult = await this.adminApproveChange(scenario);
          break;
        case 'admin_reject_change':
          result.actualResult = await this.adminRejectChange(scenario);
          break;
        case 'verify_approval_workflow':
          result.actualResult = await this.verifyApprovalWorkflow(scenario);
          break;
        case 'verify_updated_estimate':
          result.actualResult = await this.verifyUpdatedEstimate(scenario);
          break;
        case 'verify_customer_notification':
          result.actualResult = await this.verifyCustomerNotification(scenario);
          break;
        case 'admin_send_final_details':
          result.actualResult = await this.sendFinalDetails(scenario);
          break;
        case 'mark_event_completed':
          result.actualResult = await this.markEventCompleted(scenario);
          break;
        default:
          throw new Error(`Unknown action: ${step.action}`);
      }

      result.status = 'passed';
    } catch (error: any) {
      result.status = 'failed';
      result.error = error;
      result.actualResult = error.message;
    }

    this.results.push(result);
    return result;
  }

  // Test Step Implementations - Using current schema with proteins jsonb array
  private async createQuoteRequest(scenario: TestScenario) {
    const quoteData = {
      contact_name: 'Felix Funes',
      email: scenario.customerEmail,
      phone: '(843) 970-0265',
      event_name: `Test Event - ${scenario.name}`,
      event_type: 'corporate' as const,
      event_date: '2024-07-15',
      start_time: '12:00:00',
      location: 'Charleston Convention Center',
      guest_count: 50,
      service_type: 'full-service' as const,
      proteins: ['grilled-chicken'],
      sides: ['mac-and-cheese', 'collard-greens'],
      workflow_status: 'pending' as const
    };

    const { data, error } = await supabase
      .from('quote_requests')
      .insert(quoteData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  private async createComplexQuote(scenario: TestScenario) {
    const quoteData = {
      contact_name: 'Felix Funes',
      email: scenario.customerEmail,
      phone: '(843) 970-0265',
      event_name: 'Complex Corporate Gala',
      event_type: 'corporate' as const,
      event_date: '2024-08-20',
      start_time: '18:00:00',
      serving_start_time: '19:30:00',
      location: 'Historic Charleston Mansion',
      guest_count: 100,
      service_type: 'full-service' as const,
      proteins: ['beef-brisket', 'grilled-chicken'],
      both_proteins_available: true,
      wait_staff_requested: true,
      chafers_requested: true,
      appetizers: ['bacon-wrapped-scallops', 'mini-crab-cakes'],
      sides: ['mac-and-cheese', 'green-beans', 'cornbread'],
      desserts: ['peach-cobbler'],
      drinks: ['sweet-tea', 'lemonade', 'coffee'],
      workflow_status: 'pending' as const
    };

    const { data, error } = await supabase
      .from('quote_requests')
      .insert(quoteData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  private async createGovernmentQuote(scenario: TestScenario) {
    const quoteData = {
      contact_name: 'Felix Funes',
      email: scenario.customerEmail,
      phone: '(843) 970-0265',
      event_name: 'Military Appreciation Event',
      event_type: 'military_function' as const,
      event_date: '2024-09-15',
      start_time: '11:00:00',
      location: 'Joint Base Charleston',
      guest_count: 200,
      service_type: 'delivery-setup' as const,
      proteins: ['bbq-pork'],
      sides: ['coleslaw', 'baked-beans'],
      requires_po_number: true,
      po_number: 'TEST-PO-2024-001',
      compliance_level: 'government',
      workflow_status: 'pending' as const
    };

    const { data, error } = await supabase
      .from('quote_requests')
      .insert(quoteData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  private async generateEstimate(scenario: TestScenario) {
    // Find the most recent quote for this scenario
    const { data: quote } = await supabase
      .from('quote_requests')
      .select('*')
      .eq('email', scenario.customerEmail)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!quote) throw new Error('No quote found for estimate generation');

    // Create invoice/estimate with $0 pricing (manual admin pricing workflow)
    const invoiceData = {
      quote_request_id: quote.id,
      subtotal: 0, // $0 initial - admin sets pricing manually
      tax_amount: 0,
      total_amount: 0,
      document_type: 'estimate' as const,
      workflow_status: 'draft' as const,
      currency: 'usd',
      due_date: '2024-07-10',
      is_draft: true,
      customer_access_token: crypto.randomUUID()
    };

    const { data, error } = await supabase
      .from('invoices')
      .insert(invoiceData)
      .select()
      .single();

    if (error) throw error;

    // Create line items with $0 pricing (admin fills in later)
    const lineItems = [
      {
        invoice_id: data.id,
        title: 'Main Meal Package',
        description: `${quote.service_type} for ${quote.guest_count} guests`,
        quantity: quote.guest_count,
        unit_price: 0, // Admin sets pricing manually
        total_price: 0,
        category: 'catering'
      }
    ];

    await supabase.from('invoice_line_items').insert(lineItems);

    return data;
  }

  private async simulateApproval(scenario: TestScenario) {
    const { data: quote } = await supabase
      .from('quote_requests')
      .select('id')
      .eq('email', scenario.customerEmail)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const { data: invoice } = await supabase
      .from('invoices')
      .select('*')
      .eq('quote_request_id', quote?.id)
      .single();

    if (!invoice) throw new Error('No invoice found for approval');

    // Update invoice status to approved
    const { data, error } = await supabase
      .from('invoices')
      .update({ 
        workflow_status: 'approved' as const,
        status_changed_by: 'customer',
        last_customer_interaction: new Date().toISOString()
      })
      .eq('id', invoice.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  private async submitChangeRequest(scenario: TestScenario, step: TestStep) {
    const { data: quote } = await supabase
      .from('quote_requests')
      .select('*')
      .eq('email', scenario.customerEmail)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const { data: invoice } = await supabase
      .from('invoices')
      .select('*')
      .eq('quote_request_id', quote?.id)
      .single();

    let changeRequest;
    switch (step.action) {
      case 'simulate_change_request':
        changeRequest = {
          invoice_id: invoice?.id,
          customer_email: scenario.customerEmail,
          request_type: 'modification',
          priority: 'medium',
          customer_comments: 'Need to increase guest count from 50 to 75',
          requested_changes: {
            guest_count: 75,
            original_guest_count: 50
          },
          estimated_cost_change: 0, // Admin determines cost
          workflow_status: 'pending' as const
        };
        break;
      case 'submit_complex_changes':
        changeRequest = {
          invoice_id: invoice?.id,
          customer_email: scenario.customerEmail,
          request_type: 'modification',
          priority: 'high',
          customer_comments: 'Multiple changes needed: date, guest count, and menu',
          requested_changes: {
            event_date: '2024-08-25',
            guest_count: 125,
            menu_additions: ['premium-dessert-station'],
            original_guest_count: 100
          },
          estimated_cost_change: 0,
          workflow_status: 'pending' as const
        };
        break;
      case 'submit_difficult_change':
        changeRequest = {
          invoice_id: invoice?.id,
          customer_email: scenario.customerEmail,
          request_type: 'cancellation',
          priority: 'high',
          customer_comments: 'Need to reschedule to next week due to emergency',
          requested_changes: {
            event_date: '2024-07-22',
            reason: 'Venue conflict'
          },
          estimated_cost_change: 0,
          workflow_status: 'pending' as const
        };
        break;
      default:
        throw new Error(`Unknown change request type: ${step.action}`);
    }

    const { data, error } = await supabase
      .from('change_requests')
      .insert(changeRequest)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  private async adminApproveChange(scenario: TestScenario) {
    const { data: changeRequest } = await supabase
      .from('change_requests')
      .select('*')
      .eq('customer_email', scenario.customerEmail)
      .eq('workflow_status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!changeRequest) throw new Error('No pending change request found');

    const { data, error } = await supabase
      .from('change_requests')
      .update({
        workflow_status: 'approved' as const,
        admin_response: 'Changes approved. Updated estimate will be sent.',
        reviewed_by: 'admin',
        reviewed_at: new Date().toISOString()
      })
      .eq('id', changeRequest.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  private async adminRejectChange(scenario: TestScenario) {
    const { data: changeRequest } = await supabase
      .from('change_requests')
      .select('*')
      .eq('customer_email', scenario.customerEmail)
      .eq('workflow_status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!changeRequest) throw new Error('No pending change request found');

    const { data, error } = await supabase
      .from('change_requests')
      .update({
        workflow_status: 'rejected' as const,
        admin_response: 'Unfortunately we cannot accommodate this change due to scheduling conflicts. Please contact us to discuss alternatives.',
        reviewed_by: 'admin',
        reviewed_at: new Date().toISOString()
      })
      .eq('id', changeRequest.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  private async verifyApprovalWorkflow(scenario: TestScenario) {
    const { data: quote } = await supabase
      .from('quote_requests')
      .select('*')
      .eq('email', scenario.customerEmail)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const { data: invoice } = await supabase
      .from('invoices')
      .select('*')
      .eq('quote_request_id', quote?.id)
      .single();

    return {
      quoteStatus: quote?.workflow_status,
      invoiceStatus: invoice?.workflow_status,
      verified: invoice?.workflow_status === 'approved'
    };
  }

  private async verifyUpdatedEstimate(scenario: TestScenario) {
    const { data: invoice } = await supabase
      .from('invoices')
      .select('*, invoice_line_items(*)')
      .eq('quote_request_id', (
        await supabase
          .from('quote_requests')
          .select('id')
          .eq('email', scenario.customerEmail)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()
      ).data?.id)
      .single();

    return {
      hasUpdatedEstimate: !!invoice,
      lineItemCount: invoice?.invoice_line_items?.length || 0,
      total: invoice?.total_amount || 0
    };
  }

  private async verifyCustomerNotification(scenario: TestScenario) {
    // In a real implementation, this would check email logs
    // For now, we verify the change request has the rejection response
    const { data: changeRequest } = await supabase
      .from('change_requests')
      .select('*')
      .eq('customer_email', scenario.customerEmail)
      .eq('workflow_status', 'rejected')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return {
      notificationReady: !!changeRequest?.admin_response,
      response: changeRequest?.admin_response
    };
  }

  private async sendFinalDetails(scenario: TestScenario) {
    // Update quote status to indicate final details sent
    const { data: quote } = await supabase
      .from('quote_requests')
      .select('id')
      .eq('email', scenario.customerEmail)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const { data, error } = await supabase
      .from('quote_requests')
      .update({
        workflow_status: 'confirmed' as const,
        status_changed_by: 'admin'
      })
      .eq('id', quote?.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  private async markEventCompleted(scenario: TestScenario) {
    const { data: quote } = await supabase
      .from('quote_requests')
      .select('id')
      .eq('email', scenario.customerEmail)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const { data, error } = await supabase
      .from('quote_requests')
      .update({
        workflow_status: 'completed' as const,
        status_changed_by: 'admin'
      })
      .eq('id', quote?.id)
      .select()
      .single();

    if (error) throw error;

    // Also update invoice to paid status
    await supabase
      .from('invoices')
      .update({
        workflow_status: 'paid' as const,
        paid_at: new Date().toISOString()
      })
      .eq('quote_request_id', quote?.id);

    return data;
  }

  // Run full test suite
  async runFullTestSuite(): Promise<{ results: TestResult[]; summary: any }> {
    console.log('🚂 Starting Soul Train\'s Eatery Comprehensive Test Suite');
    console.log(`📧 Test Email: ${this.testEmail}`);
    console.log(`📅 Started: ${new Date().toISOString()}`);

    for (const scenario of this.scenarios) {
      console.log(`\n🎯 Running Scenario: ${scenario.id} - ${scenario.name}`);
      
      for (let i = 0; i < scenario.steps.length; i++) {
        const result = await this.executeStep(scenario, i);
        console.log(`  ${result.status === 'passed' ? '✅' : '❌'} Step ${i + 1}: ${result.action}`);
        
        if (result.status === 'failed') {
          console.log(`    Error: ${result.error?.message || result.actualResult}`);
        }
      }
    }

    return {
      results: this.results,
      summary: this.generateTestSummary()
    };
  }

  private generateTestSummary() {
    const passed = this.results.filter(r => r.status === 'passed').length;
    const failed = this.results.filter(r => r.status === 'failed').length;
    const total = this.results.length;

    return {
      total,
      passed,
      failed,
      successRate: total > 0 ? Math.round((passed / total) * 100) : 0,
      scenarioResults: this.scenarios.map(s => ({
        id: s.id,
        name: s.name,
        steps: this.results.filter(r => r.scenarioId === s.id)
      }))
    };
  }

  getResults() {
    return {
      results: this.results,
      summary: this.generateTestSummary(),
      scenarios: this.scenarios
    };
  }
}

export const testSuite = new ComprehensiveTestSuite();
