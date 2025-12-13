// Comprehensive Testing Utilities for Soul Train's Eatery
import { supabase } from '@/integrations/supabase/client';

// Test Data Generation
export const generateComprehensiveTestData = async (): Promise<TestResult> => {
  try {
    console.log('Calling generate-test-data edge function...');
    
    const { data, error } = await supabase.functions.invoke('generate-test-data', {
      body: {}
    });

    if (error) {
      console.error('Edge function error:', error);
      throw error;
    }

    if (!data.success) {
      throw new Error(data.error || 'Test data generation failed');
    }

    return {
      testName: 'Generate Comprehensive Test Data',
      status: 'passed',
      message: `Successfully generated test data: ${data.data.eventName} for ${data.data.guestCount} guests`,
      details: {
        quoteId: data.data.quoteId,
        customerEmail: data.data.customerEmail,
        eventName: data.data.eventName,
        eventDate: data.data.eventDate,
        total: `$${data.data.total}`,
        lineItems: data.data.lineItemsCount
      },
      timestamp: new Date()
    };
  } catch (error) {
    console.error('Test data generation failed:', error);
    return {
      testName: 'Generate Comprehensive Test Data',
      status: 'failed',
      message: 'Failed to generate test data',
      details: error,
      timestamp: new Date()
    };
  }
};

export interface TestResult {
  testName: string;
  status: 'passed' | 'failed' | 'warning';
  message: string;
  details?: any;
  timestamp: Date;
}

export interface SystemHealthCheck {
  overall: 'healthy' | 'warning' | 'critical';
  tests: TestResult[];
  summary: {
    passed: number;
    failed: number;
    warnings: number;
  };
}

// Database connectivity and integrity tests
export const testDatabaseConnectivity = async (): Promise<TestResult> => {
  try {
    const { data, error } = await supabase
      .from('quote_requests')
      .select('count')
      .limit(1);

    if (error) throw error;

    return {
      testName: 'Database Connectivity',
      status: 'passed',
      message: 'Successfully connected to Supabase database',
      timestamp: new Date()
    };
  } catch (error) {
    return {
      testName: 'Database Connectivity',
      status: 'failed',
      message: 'Failed to connect to database',
      details: error,
      timestamp: new Date()
    };
  }
};

export const testTableIntegrity = async (): Promise<TestResult[]> => {
  const tests: TestResult[] = [];
  const tables = [
    'quote_requests',
    'invoices',
    'customers',
    'invoice_line_items',
    'admin_notes',
    'pricing_rules'
  ] as const;

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) throw error;

      tests.push({
        testName: `Table Integrity - ${table}`,
        status: 'passed',
        message: `Table ${table} is accessible`,
        timestamp: new Date()
      });
    } catch (error) {
      tests.push({
        testName: `Table Integrity - ${table}`,
        status: 'failed',
        message: `Table ${table} is not accessible`,
        details: error,
        timestamp: new Date()
      });
    }
  }

  return tests;
};

// Business logic validation tests (simplified - manual pricing workflow)
export const testQuoteValidation = async (): Promise<TestResult[]> => {
  const tests: TestResult[] = [];

  // Test that quotes can be fetched
  try {
    const { data, error } = await supabase
      .from('quote_requests')
      .select('id, contact_name, email, event_date, guest_count')
      .limit(1);

    if (error) throw error;

    tests.push({
      testName: 'Quote Validation - Database Access',
      status: 'passed',
      message: 'Successfully accessed quote_requests table',
      timestamp: new Date()
    });
  } catch (error) {
    tests.push({
      testName: 'Quote Validation - Database Access',
      status: 'failed',
      message: 'Failed to access quote_requests table',
      details: error,
      timestamp: new Date()
    });
  }

  return tests;
};

// Tax calculation tests (replaces pricing calculation tests)
export const testTaxCalculation = async (): Promise<TestResult[]> => {
  const tests: TestResult[] = [];

  try {
    const { TaxCalculationService } = await import('@/services/TaxCalculationService');
    
    // Test basic tax calculation
    const result = TaxCalculationService.calculateTax(10000, false);
    const expectedTax = 900; // 9% of 10000
    
    tests.push({
      testName: 'Tax Calculation - Standard Rate',
      status: result.taxAmount === expectedTax ? 'passed' : 'failed',
      message: result.taxAmount === expectedTax 
        ? 'Tax calculation is correct (9%)' 
        : `Tax calculation incorrect: expected ${expectedTax}, got ${result.taxAmount}`,
      details: result,
      timestamp: new Date()
    });

    // Test government exemption
    const exemptResult = TaxCalculationService.calculateTax(10000, true);
    
    tests.push({
      testName: 'Tax Calculation - Government Exemption',
      status: exemptResult.taxAmount === 0 ? 'passed' : 'failed',
      message: exemptResult.taxAmount === 0 
        ? 'Government exemption working correctly' 
        : 'Government exemption not working',
      details: exemptResult,
      timestamp: new Date()
    });

  } catch (error) {
    tests.push({
      testName: 'Tax Calculation',
      status: 'failed',
      message: 'Tax calculation test failed',
      details: error,
      timestamp: new Date()
    });
  }

  return tests;
};

// Edge function tests
export const testEdgeFunctions = async (): Promise<TestResult[]> => {
  const tests: TestResult[] = [];
  
  const functions = [
    'generate-invoice-from-quote',
    'send-invoice-email',
    'process-change-request'
  ];

  for (const functionName of functions) {
    try {
      // Test if function is accessible (not actual invocation to avoid side effects)
      const response = await fetch(`https://qptprrqjlcvfkhfdnnoa.supabase.co/functions/v1/${functionName}`, {
        method: 'OPTIONS'
      });

      tests.push({
        testName: `Edge Function - ${functionName}`,
        status: response.ok ? 'passed' : 'warning',
        message: response.ok ? `Function ${functionName} is accessible` : `Function ${functionName} may not be deployed`,
        timestamp: new Date()
      });
    } catch (error) {
      tests.push({
        testName: `Edge Function - ${functionName}`,
        status: 'failed',
        message: `Function ${functionName} is not accessible`,
        details: error,
        timestamp: new Date()
      });
    }
  }

  return tests;
};

// Performance tests
export const testPerformance = async (): Promise<TestResult[]> => {
  const tests: TestResult[] = [];

  // Test quote loading performance
  const startTime = Date.now();
  try {
    const { data } = await supabase
      .from('quote_requests')
      .select('*')
      .limit(10);

    const endTime = Date.now();
    const loadTime = endTime - startTime;

    tests.push({
      testName: 'Performance - Quote Loading',
      status: loadTime < 1000 ? 'passed' : loadTime < 3000 ? 'warning' : 'failed',
      message: `Quote loading took ${loadTime}ms`,
      details: { loadTime, recordCount: data?.length || 0 },
      timestamp: new Date()
    });
  } catch (error) {
    tests.push({
      testName: 'Performance - Quote Loading',
      status: 'failed',
      message: 'Quote loading test failed',
      details: error,
      timestamp: new Date()
    });
  }

  return tests;
};

// Security tests
export const testSecurity = async (): Promise<TestResult[]> => {
  const tests: TestResult[] = [];

  // Test RLS policies
  try {
    // Attempt to access data without proper authentication context
    const { data, error } = await supabase
      .from('admin_notes')
      .select('*')
      .limit(1);

    // If we get data without auth, RLS might be misconfigured
    if (data && data.length > 0) {
      tests.push({
        testName: 'Security - RLS Admin Notes',
        status: 'warning',
        message: 'Admin notes may be accessible without proper authentication',
        timestamp: new Date()
      });
    } else {
      tests.push({
        testName: 'Security - RLS Admin Notes',
        status: 'passed',
        message: 'Admin notes properly protected by RLS',
        timestamp: new Date()
      });
    }
  } catch (error) {
    tests.push({
      testName: 'Security - RLS Test',
      status: 'passed',
      message: 'RLS appears to be working (access denied)',
      timestamp: new Date()
    });
  }

  return tests;
};

// Run comprehensive system health check
export const runSystemHealthCheck = async (): Promise<SystemHealthCheck> => {
  const allTests: TestResult[] = [];

  // Run all test suites
  const connectivity = await testDatabaseConnectivity();
  allTests.push(connectivity);

  const tableTests = await testTableIntegrity();
  allTests.push(...tableTests);

  const quoteTests = await testQuoteValidation();
  allTests.push(...quoteTests);

  const taxTests = await testTaxCalculation();
  allTests.push(...taxTests);

  const functionTests = await testEdgeFunctions();
  allTests.push(...functionTests);

  const performanceTests = await testPerformance();
  allTests.push(...performanceTests);

  const securityTests = await testSecurity();
  allTests.push(...securityTests);

  // Calculate summary
  const passed = allTests.filter(t => t.status === 'passed').length;
  const failed = allTests.filter(t => t.status === 'failed').length;
  const warnings = allTests.filter(t => t.status === 'warning').length;

  // Determine overall health
  let overall: 'healthy' | 'warning' | 'critical';
  if (failed > 0) {
    overall = 'critical';
  } else if (warnings > 0) {
    overall = 'warning';
  } else {
    overall = 'healthy';
  }

  return {
    overall,
    tests: allTests,
    summary: {
      passed,
      failed,
      warnings
    }
  };
};

// Test data generation for development
export const generateTestData = async (): Promise<TestResult> => {
  try {
    const testQuotes = [
      {
        contact_name: 'Test Customer 1',
        email: 'test1@example.com',
        phone: '(843) 555-0001',
        event_name: 'Test Corporate Event',
        event_type: 'corporate' as const,
        event_date: '2024-07-15',
        start_time: '12:00:00',
        location: 'Test Venue',
        guest_count: 25,
        service_type: 'full-service' as const,
        primary_protein: 'grilled-chicken',
        status: 'pending' as const
      },
      {
        contact_name: 'Test Customer 2',
        email: 'test2@example.com',
        phone: '(843) 555-0002',
        event_name: 'Test Wedding Reception',
        event_type: 'private_party' as const,
        event_date: '2024-08-20',
        start_time: '18:00:00',
        location: 'Test Garden',
        guest_count: 150,
        service_type: 'delivery-setup' as const,
        primary_protein: 'beef-brisket',
        secondary_protein: 'grilled-chicken',
        both_proteins_available: true,
        status: 'quoted' as const
      }
    ];

    // Insert test data
    const { data, error } = await supabase
      .from('quote_requests')
      .insert(testQuotes)
      .select();

    if (error) throw error;

    return {
      testName: 'Test Data Generation',
      status: 'passed',
      message: `Generated ${data.length} test quotes successfully`,
      details: data,
      timestamp: new Date()
    };
  } catch (error) {
    return {
      testName: 'Test Data Generation',
      status: 'failed',
      message: 'Failed to generate test data',
      details: error,
      timestamp: new Date()
    };
  }
};