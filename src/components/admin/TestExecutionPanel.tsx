import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Play, CheckCircle, XCircle, Clock } from 'lucide-react';
import { executeTestPlan, runTestScenario, validateSystem } from '@/utils/testRunner';

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

export function TestExecutionPanel() {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [currentTest, setCurrentTest] = useState<string>('');

  const runFullTestSuite = async () => {
    setIsRunning(true);
    setCurrentTest('Running comprehensive test suite...');
    
    try {
      const results = await executeTestPlan();
      setTestResults(results);
    } catch (error) {
      console.error('Test execution failed:', error);
      setTestResults({ error: error.message });
    } finally {
      setIsRunning(false);
      setCurrentTest('');
    }
  };

  const runQuickValidation = async () => {
    setIsRunning(true);
    setCurrentTest('Running quick system validation...');
    
    try {
      const results = await validateSystem();
      setTestResults({ validation: results });
    } catch (error) {
      console.error('Validation failed:', error);
      setTestResults({ error: error.message });
    } finally {
      setIsRunning(false);
      setCurrentTest('');
    }
  };

  const runIndividualTest = async (scenarioId: string) => {
    setIsRunning(true);
    setCurrentTest(`Running scenario ${scenarioId}...`);
    
    try {
      const results = await runTestScenario(scenarioId);
      setTestResults({ scenario: { id: scenarioId, results } });
    } catch (error) {
      console.error('Individual test failed:', error);
      setTestResults({ error: error.message });
    } finally {
      setIsRunning(false);
      setCurrentTest('');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-yellow-500';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Comprehensive Test Execution</CardTitle>
          <CardDescription>
            Execute end-to-end tests for the customer request workflow using felixfunes2001.ff@gmail.com
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={runFullTestSuite} 
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              Run Full Test Suite
            </Button>
            
            <Button 
              variant="outline"
              onClick={runQuickValidation} 
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              Quick Validation
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Button 
              variant="outline"
              size="sm"
              onClick={() => runIndividualTest('T001')} 
              disabled={isRunning}
            >
              Test Direct Approval
            </Button>
            <Button 
              variant="outline"
              size="sm"
              onClick={() => runIndividualTest('T002')} 
              disabled={isRunning}
            >
              Test Simple Changes
            </Button>
            <Button 
              variant="outline"
              size="sm"
              onClick={() => runIndividualTest('T003')} 
              disabled={isRunning}
            >
              Test Complex Changes
            </Button>
          </div>

          {isRunning && (
            <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">{currentTest}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {testResults && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            {testResults.error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800">Error: {testResults.error}</p>
              </div>
            )}

            {testResults.validation && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(testResults.validation.systemValid ? 'passed' : 'failed')}>
                    System {testResults.validation.systemValid ? 'Valid' : 'Invalid'}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  {testResults.validation.results?.map((result: TestResult, index: number) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded">
                      {getStatusIcon(result.status)}
                      <span className="text-sm">{result.action}</span>
                      <Badge variant="outline">{result.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {testResults.summary && (
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{testResults.summary.passedSteps}</div>
                    <div className="text-sm text-muted-foreground">Passed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{testResults.summary.failedSteps}</div>
                    <div className="text-sm text-muted-foreground">Failed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{testResults.summary.totalSteps}</div>
                    <div className="text-sm text-muted-foreground">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{testResults.summary.successRate}%</div>
                    <div className="text-sm text-muted-foreground">Success Rate</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Scenario Results</h4>
                  {testResults.summary.scenarios?.map((scenario: any) => (
                    <div key={scenario.scenarioId} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <span className="font-medium">{scenario.name}</span>
                        <div className="text-sm text-muted-foreground">
                          {scenario.passed}/{scenario.totalSteps} steps passed
                        </div>
                      </div>
                      <Badge className={getStatusColor(scenario.success ? 'passed' : 'failed')}>
                        {scenario.success ? 'Success' : 'Failed'}
                      </Badge>
                    </div>
                  ))}
                </div>

                {testResults.results && (
                  <div className="space-y-2">
                    <h4 className="font-semibold">Detailed Results</h4>
                    <div className="max-h-64 overflow-y-auto space-y-1">
                      {testResults.results.map((result: TestResult, index: number) => (
                        <div key={index} className="flex items-center gap-2 p-2 text-sm border rounded">
                          {getStatusIcon(result.status)}
                          <span className="flex-1">{result.action}</span>
                          <Badge variant="outline">{result.status}</Badge>
                          {result.status === 'failed' && result.error && (
                            <span className="text-red-600 text-xs truncate max-w-32">
                              {result.error.message || result.actualResult}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {testResults.scenario && (
              <div className="space-y-4">
                <h3 className="font-semibold">Scenario {testResults.scenario.id} Results</h3>
                <div className="space-y-2">
                  {testResults.scenario.results.map((result: TestResult, index: number) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded">
                      {getStatusIcon(result.status)}
                      <span className="flex-1">{result.action}</span>
                      <Badge variant="outline">{result.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}