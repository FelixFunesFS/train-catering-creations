import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Zap,
  Shield,
  RefreshCw,
  Play
} from 'lucide-react';
import { runSystemHealthCheck, generateTestData, SystemHealthCheck, TestResult } from '@/utils/testingUtilities';

export function SystemHealthMonitor() {
  const [healthCheck, setHealthCheck] = useState<SystemHealthCheck | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastRun, setLastRun] = useState<Date | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    runHealthCheck();
  }, []);

  const runHealthCheck = async () => {
    setLoading(true);
    try {
      const results = await runSystemHealthCheck();
      setHealthCheck(results);
      setLastRun(new Date());
      
      toast({
        title: "Health Check Complete",
        description: `Overall status: ${results.overall}`,
        variant: results.overall === 'critical' ? 'destructive' : 'default'
      });
    } catch (error) {
      console.error('Health check failed:', error);
      toast({
        title: "Health Check Failed",
        description: "Unable to complete system health check",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateTestDataHandler = async () => {
    try {
      const result = await generateTestData();
      toast({
        title: "Test Data Generation",
        description: result.message,
        variant: result.status === 'passed' ? 'default' : 'destructive'
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate test data",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      passed: 'default',
      warning: 'secondary',
      failed: 'destructive'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getOverallStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const categorizeTests = (tests: TestResult[]) => {
    return {
      connectivity: tests.filter(t => t.testName.includes('Connectivity') || t.testName.includes('Table Integrity')),
      business: tests.filter(t => t.testName.includes('Quote Validation') || t.testName.includes('Pricing')),
      performance: tests.filter(t => t.testName.includes('Performance')),
      security: tests.filter(t => t.testName.includes('Security')),
      functions: tests.filter(t => t.testName.includes('Edge Function'))
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Health Monitor</h2>
          {lastRun && (
            <p className="text-sm text-muted-foreground">
              Last checked: {lastRun.toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button onClick={generateTestDataHandler} variant="outline" size="sm">
            <Play className="h-4 w-4 mr-2" />
            Generate Test Data
          </Button>
          <Button onClick={runHealthCheck} disabled={loading} size="sm">
            {loading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Run Health Check
          </Button>
        </div>
      </div>

      {/* Overall Status */}
      {healthCheck && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Activity className={`h-8 w-8 ${getOverallStatusColor(healthCheck.overall)}`} />
                <div>
                  <h3 className={`text-xl font-bold ${getOverallStatusColor(healthCheck.overall)}`}>
                    System Status: {healthCheck.overall.toUpperCase()}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {healthCheck.summary.passed} passed, {healthCheck.summary.warnings} warnings, {healthCheck.summary.failed} failed
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">
                  {Math.round((healthCheck.summary.passed / healthCheck.tests.length) * 100)}%
                </div>
                <p className="text-sm text-muted-foreground">Tests Passing</p>
              </div>
            </div>
            <Progress 
              value={(healthCheck.summary.passed / healthCheck.tests.length) * 100} 
              className="mt-4"
            />
          </CardContent>
        </Card>
      )}

      {/* Detailed Results */}
      {healthCheck && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="connectivity">
              <Database className="h-4 w-4 mr-1" />
              Database
            </TabsTrigger>
            <TabsTrigger value="business">
              <CheckCircle className="h-4 w-4 mr-1" />
              Business Logic
            </TabsTrigger>
            <TabsTrigger value="performance">
              <Zap className="h-4 w-4 mr-1" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="h-4 w-4 mr-1" />
              Security
            </TabsTrigger>
            <TabsTrigger value="functions">
              <Activity className="h-4 w-4 mr-1" />
              Functions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-green-600">Passed Tests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{healthCheck.summary.passed}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-yellow-600">Warnings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{healthCheck.summary.warnings}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-red-600">Failed Tests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{healthCheck.summary.failed}</div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Test Results */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {healthCheck.tests.slice(-5).map((test, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(test.status)}
                        <div>
                          <div className="font-medium">{test.testName}</div>
                          <div className="text-sm text-muted-foreground">{test.message}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(test.status)}
                        <span className="text-xs text-muted-foreground">
                          {test.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Category-specific tabs */}
          {Object.entries(categorizeTests(healthCheck.tests)).map(([category, tests]) => (
            <TabsContent key={category} value={category} className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="capitalize">{category} Tests</CardTitle>
                </CardHeader>
                <CardContent>
                  {tests.length > 0 ? (
                    <div className="space-y-3">
                      {tests.map((test, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(test.status)}
                              <span className="font-medium">{test.testName}</span>
                            </div>
                            {getStatusBadge(test.status)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{test.message}</p>
                          {test.details && (
                            <details className="text-xs">
                              <summary className="cursor-pointer text-muted-foreground">View Details</summary>
                              <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                                {JSON.stringify(test.details, null, 2)}
                              </pre>
                            </details>
                          )}
                          <div className="text-xs text-muted-foreground mt-2">
                            {test.timestamp.toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No {category} tests available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}

      {loading && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mr-3" />
              <span>Running system health check...</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}