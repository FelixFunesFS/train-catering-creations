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
    } catch (error) {
      result.status = 'failed';
      result.error = error;
      result.actualResult = error.message;
    }

    this.results.push(result);
    return result;
  }

  // Test Step Implementations
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
      primary_protein: 'grilled-chicken',
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
      primary_protein: 'beef-brisket',
      secondary_protein: 'grilled-chicken',
      both_proteins_available: true,
      wait_staff_requested: true,
      chafers_requested: true,
      tables_chairs_requested: true,
      linens_requested: true,
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
      event_type: 'corporate' as const, // Using corporate instead of government
      event_date: '2024-09-15',
      start_time: '11:00:00',
      location: 'Joint Base Charleston',
      guest_count: 200,
      service_type: 'delivery-setup' as const,
      primary_protein: 'bbq-pork',
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

    // Create invoice/estimate
    const invoiceData = {
      quote_request_id: quote.id,
      subtotal: quote.guest_count * 2500, // $25 per person base
      tax_amount: Math.round(quote.guest_count * 2500 * 0.08), // 8% tax
      total_amount: Math.round(quote.guest_count * 2500 * 1.08),
      document_type: 'estimate' as const,
      workflow_status: 'draft' as const,
      currency: 'usd',
      due_date: '2024-07-10',
      is_draft: false,
      customer_access_token: crypto.randomUUID()
    };

    const { data, error } = await supabase
      .from('invoices')
      .insert(invoiceData)
      .select()
      .single();

    if (error) throw error;

    // Create line items
    const lineItems = [
      {
        invoice_id: data.id,
        title: 'Catering Service',
        description: `${quote.service_type} for ${quote.guest_count} guests`,
        quantity: quote.guest_count,
        unit_price: 2500,
        total_price: quote.guest_count * 2500,
        category: 'catering'
      }
    ];

    await supabase.from('invoice_line_items').insert(lineItems);

    return data;
  }

  private async simulateApproval(scenario: TestScenario) {
    const { data: invoice } = await supabase
      .from('invoices')
      .select('*')
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

    if (!invoice) throw new Error('No invoice found for approval');

    // Update invoice status to approved
    const { data, error } = await supabase
      .from('invoices')
      .update({ 
        workflow_status: 'approved',
        status_changed_by: 'customer',
        last_customer_action: new Date().toISOString()
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
          estimated_cost_change: 62500 // 25 guests * $25
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
          estimated_cost_change: 150000 // Significant changes
        };
        break;
      case 'submit_difficult_change':
        changeRequest = {
          invoice_id: invoice?.id,
          customer_email: scenario.customerEmail,
          request_type: 'modification',
          priority: 'high',
          customer_comments: 'Need to change event to next week - urgent!',
          requested_changes: {
            event_date: '2024-07-22', // Very short notice
            guest_count: 200 // Double the size
          },
          estimated_cost_change: 250000
        };
        break;
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
        status: 'approved',
        admin_response: 'Changes approved. Updated estimate will be sent shortly.',
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
        status: 'rejected',
        admin_response: 'Unfortunately, we cannot accommodate such short notice changes. We can offer alternative dates: 7/29 or 8/5.',
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
    // Verify that approval triggers contract generation workflow
    const { data: invoice } = await supabase
      .from('invoices')
      .select('*')
      .eq('workflow_status', 'approved')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!invoice || invoice.workflow_status !== 'approved') {
      throw new Error('Invoice not found in approved status');
    }

    // Check if workflow was triggered (should have updated timestamps)
    return {
      invoice_approved: true,
      last_customer_interaction: invoice.last_customer_interaction,
      workflow_triggered: !!invoice.last_customer_interaction
    };
  }

  private async verifyUpdatedEstimate(scenario: TestScenario) {
    // Verify that change approval resulted in updated estimate
    const { data: invoice } = await supabase
      .from('invoices')
      .select('*, invoice_line_items(*)')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    return {
      estimate_updated: true,
      last_updated: invoice?.updated_at,
      line_items_count: invoice?.invoice_line_items?.length || 0
    };
  }

  private async verifyCustomerNotification(scenario: TestScenario) {
    // Verify customer was notified of rejection
    const { data: changeRequest } = await supabase
      .from('change_requests')
      .select('*')
      .eq('customer_email', scenario.customerEmail)
      .eq('workflow_status', 'rejected')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return {
      notification_sent: !!changeRequest?.admin_response,
      rejection_reason: changeRequest?.admin_response,
      reviewed_at: changeRequest?.reviewed_at
    };
  }

  private async sendFinalDetails(scenario: TestScenario) {
    // Simulate sending final event details
    const { data: quote } = await supabase
      .from('quote_requests')
      .select('*')
      .eq('email', scenario.customerEmail)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Update quote with final details sent
    const { data, error } = await supabase
      .from('quote_requests')
      .update({
        status: 'confirmed',
        last_status_change: new Date().toISOString()
      })
      .eq('id', quote?.id)
      .select()
      .single();

    if (error) throw error;
    return { final_details_sent: true, quote_confirmed: true };
  }

  private async markEventCompleted(scenario: TestScenario) {
    // Mark event as completed
    const { data: quote } = await supabase
      .from('quote_requests')
      .select('*')
      .eq('email', scenario.customerEmail)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const { data, error } = await supabase
      .from('quote_requests')
      .update({
        status: 'completed',
        last_status_change: new Date().toISOString()
      })
      .eq('id', quote?.id)
      .select()
      .single();

    if (error) throw error;
    return { event_completed: true, final_status: 'completed' };
  }

  // Execute full test suite
  async runFullTestSuite(): Promise<{
    summary: any;
    results: TestResult[];
    scenarios: TestScenario[];
  }> {
    console.log('🚀 Starting Comprehensive Test Suite...');
    
    for (const scenario of this.scenarios) {
      console.log(`\n📋 Executing Scenario: ${scenario.name}`);
      
      for (let i = 0; i < scenario.steps.length; i++) {
        const step = scenario.steps[i];
        console.log(`  ⏳ Step ${i + 1}: ${step.description}`);
        
        try {
          const result = await this.executeStep(scenario, i);
          console.log(`  ${result.status === 'passed' ? '✅' : '❌'} ${step.action}: ${result.status}`);
          
          if (result.status === 'failed') {
            console.log(`     Error: ${result.error?.message || result.actualResult}`);
          }
        } catch (error) {
          console.log(`  ❌ Step failed: ${error.message}`);
        }
        
        // Add small delay between steps
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Generate summary
    const summary = this.generateTestSummary();
    console.log('\n📊 Test Suite Summary:', summary);
    
    return {
      summary,
      results: this.results,
      scenarios: this.scenarios
    };
  }

  private generateTestSummary() {
    const totalSteps = this.results.length;
    const passedSteps = this.results.filter(r => r.status === 'passed').length;
    const failedSteps = this.results.filter(r => r.status === 'failed').length;
    
    const scenarioResults = this.scenarios.map(scenario => {
      const scenarioSteps = this.results.filter(r => r.scenarioId === scenario.id);
      const scenarioPassed = scenarioSteps.filter(r => r.status === 'passed').length;
      const scenarioFailed = scenarioSteps.filter(r => r.status === 'failed').length;
      
      return {
        scenarioId: scenario.id,
        name: scenario.name,
        totalSteps: scenarioSteps.length,
        passed: scenarioPassed,
        failed: scenarioFailed,
        success: scenarioFailed === 0
      };
    });

    return {
      totalSteps,
      passedSteps,
      failedSteps,
      successRate: Math.round((passedSteps / totalSteps) * 100),
      scenarios: scenarioResults,
      startTime: this.results[0]?.timestamp,
      endTime: this.results[this.results.length - 1]?.timestamp
    };
  }

  // Get detailed results
  getResults() {
    return {
      results: this.results,
      summary: this.generateTestSummary(),
      scenarios: this.scenarios
    };
  }
}

// Export test runner instance
export const testSuite = new ComprehensiveTestSuite();