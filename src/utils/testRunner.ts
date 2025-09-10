import { testSuite } from './comprehensiveTestSuite';

// Run the comprehensive test suite
export async function executeTestPlan() {
  console.log('🎯 Executing Comprehensive Test Plan for Soul Train\'s Eatery');
  console.log('📧 Using test email: felixfunes2001.ff@gmail.com');
  console.log('⏰ Started at:', new Date().toISOString());
  
  try {
    const results = await testSuite.runFullTestSuite();
    
    console.log('\n🎉 Test Execution Complete!');
    console.log('📊 Summary:', results.summary);
    
    // Log key findings
    const criticalFailures = results.results.filter(r => 
      r.status === 'failed' && 
      (r.action.includes('approve') || r.action.includes('change_request'))
    );
    
    if (criticalFailures.length > 0) {
      console.log('\n🚨 Critical Issues Found:');
      criticalFailures.forEach(failure => {
        console.log(`  - ${failure.action}: ${failure.actualResult}`);
      });
    }
    
    // Log performance metrics
    const approvalSteps = results.results.filter(r => r.action.includes('approve'));
    if (approvalSteps.length > 0) {
      console.log('\n⚡ Performance Metrics:');
      approvalSteps.forEach(step => {
        console.log(`  - ${step.action}: ${step.status} (${step.timestamp})`);
      });
    }
    
    return results;
  } catch (error) {
    console.error('❌ Test execution failed:', error);
    throw error;
  }
}

// Function to run individual test scenario
export async function runTestScenario(scenarioId: string) {
  console.log(`🎯 Running individual test scenario: ${scenarioId}`);
  
  const scenario = testSuite.scenarios.find(s => s.id === scenarioId);
  if (!scenario) {
    throw new Error(`Scenario ${scenarioId} not found`);
  }
  
  const results = [];
  for (let i = 0; i < scenario.steps.length; i++) {
    const result = await testSuite.executeStep(scenario, i);
    results.push(result);
    console.log(`  ${result.status === 'passed' ? '✅' : '❌'} Step ${i + 1}: ${result.action}`);
  }
  
  return results;
}

// Quick system validation
export async function validateSystem() {
  console.log('🔍 Running quick system validation...');
  
  try {
    // Test quote creation
    const scenario = testSuite.scenarios[0];
    const quoteResult = await testSuite.executeStep(scenario, 0);
    console.log('✅ Quote creation:', quoteResult.status);
    
    // Test estimate generation
    const estimateResult = await testSuite.executeStep(scenario, 1);
    console.log('✅ Estimate generation:', estimateResult.status);
    
    // Test approval simulation
    const approvalResult = await testSuite.executeStep(scenario, 2);
    console.log('✅ Approval workflow:', approvalResult.status);
    
    return {
      systemValid: quoteResult.status === 'passed' && 
                  estimateResult.status === 'passed' && 
                  approvalResult.status === 'passed',
      results: [quoteResult, estimateResult, approvalResult]
    };
  } catch (error) {
    console.error('❌ System validation failed:', error);
    return { systemValid: false, error };
  }
}