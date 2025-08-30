import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { 
  Bot, 
  Calendar, 
  CreditCard, 
  TrendingUp, 
  Zap, 
  Clock, 
  DollarSign, 
  Users,
  CheckCircle,
  AlertTriangle,
  Settings
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AutomationRule {
  id: string;
  name: string;
  type: 'quote_generation' | 'scheduling' | 'payment' | 'follow_up';
  enabled: boolean;
  trigger: string;
  action: string;
  success_rate: number;
  last_executed: string;
}

interface AutomationMetrics {
  total_rules: number;
  active_rules: number;
  executions_today: number;
  success_rate: number;
  time_saved_hours: number;
  revenue_generated: number;
}

export function ProcessAutomationTab() {
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  const [metrics, setMetrics] = useState<AutomationMetrics>({
    total_rules: 0,
    active_rules: 0,
    executions_today: 0,
    success_rate: 0,
    time_saved_hours: 0,
    revenue_generated: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAutomationData();
  }, []);

  const fetchAutomationData = async () => {
    try {
      // Simulate automation rules data
      const rules: AutomationRule[] = [
        {
          id: '1',
          name: 'AI Quote Generation',
          type: 'quote_generation',
          enabled: true,
          trigger: 'New quote request received',
          action: 'Generate detailed quote using AI pricing',
          success_rate: 94,
          last_executed: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          name: 'Smart Calendar Scheduling',
          type: 'scheduling',
          enabled: true,
          trigger: 'Quote approved by customer',
          action: 'Auto-schedule event and send calendar invites',
          success_rate: 98,
          last_executed: '2024-01-15T09:15:00Z'
        },
        {
          id: '3',
          name: 'Payment Automation',
          type: 'payment',
          enabled: true,
          trigger: 'Invoice due date approaching',
          action: 'Send payment reminder and process scheduled payments',
          success_rate: 87,
          last_executed: '2024-01-15T08:00:00Z'
        },
        {
          id: '4',
          name: 'Follow-up Automation',
          type: 'follow_up',
          enabled: false,
          trigger: 'Event completed',
          action: 'Send satisfaction survey and request review',
          success_rate: 92,
          last_executed: '2024-01-14T16:30:00Z'
        }
      ];

      setAutomationRules(rules);
      
      // Calculate metrics
      const activeRules = rules.filter(r => r.enabled).length;
      const avgSuccessRate = rules.reduce((acc, r) => acc + r.success_rate, 0) / rules.length;
      
      setMetrics({
        total_rules: rules.length,
        active_rules: activeRules,
        executions_today: 47,
        success_rate: Math.round(avgSuccessRate),
        time_saved_hours: 23.5,
        revenue_generated: 15420
      });
    } catch (error) {
      console.error('Error fetching automation data:', error);
      toast.error('Failed to load automation data');
    } finally {
      setLoading(false);
    }
  };

  const toggleRule = async (ruleId: string, enabled: boolean) => {
    try {
      setAutomationRules(prev => 
        prev.map(rule => 
          rule.id === ruleId ? { ...rule, enabled } : rule
        )
      );
      
      toast.success(`Automation rule ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error toggling rule:', error);
      toast.error('Failed to update automation rule');
    }
  };

  const triggerManualExecution = async (ruleId: string) => {
    try {
      const rule = automationRules.find(r => r.id === ruleId);
      if (!rule) return;

      toast.success(`Manually triggered: ${rule.name}`);
      
      // Update last executed time
      setAutomationRules(prev => 
        prev.map(r => 
          r.id === ruleId 
            ? { ...r, last_executed: new Date().toISOString() }
            : r
        )
      );
    } catch (error) {
      console.error('Error executing rule:', error);
      toast.error('Failed to execute automation rule');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'quote_generation': return <Bot className="h-4 w-4" />;
      case 'scheduling': return <Calendar className="h-4 w-4" />;
      case 'payment': return <CreditCard className="h-4 w-4" />;
      case 'follow_up': return <Users className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'quote_generation': return 'bg-purple-500/10 text-purple-700 border-purple-200';
      case 'scheduling': return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'payment': return 'bg-green-500/10 text-green-700 border-green-200';
      case 'follow_up': return 'bg-orange-500/10 text-orange-700 border-orange-200';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Rules</p>
                <p className="text-2xl font-bold">{metrics.active_rules}</p>
                <p className="text-xs text-muted-foreground">of {metrics.total_rules} total</p>
              </div>
              <Zap className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">{metrics.success_rate}%</p>
                <p className="text-xs text-muted-foreground">{metrics.executions_today} executions today</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Time Saved</p>
                <p className="text-2xl font-bold">{metrics.time_saved_hours}h</p>
                <p className="text-xs text-muted-foreground">this week</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Revenue Impact</p>
                <p className="text-2xl font-bold">${metrics.revenue_generated.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">automated this month</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="rules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rules">Automation Rules</TabsTrigger>
          <TabsTrigger value="ai-settings">AI Settings</TabsTrigger>
          <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Automation Rules</h3>
              <p className="text-sm text-muted-foreground">
                Manage automated workflows and business processes
              </p>
            </div>
            <Button>
              <Zap className="h-4 w-4 mr-2" />
              Create Rule
            </Button>
          </div>

          <div className="space-y-4">
            {automationRules.map((rule) => (
              <Card key={rule.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className={`p-2 rounded-lg ${getTypeColor(rule.type)}`}>
                        {getTypeIcon(rule.type)}
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold">{rule.name}</h4>
                          <Badge variant={rule.enabled ? "default" : "secondary"}>
                            {rule.enabled ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">
                            <strong>Trigger:</strong> {rule.trigger}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            <strong>Action:</strong> {rule.action}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">Success Rate:</span>
                            <Progress value={rule.success_rate} className="w-20" />
                            <span className="text-sm font-medium">{rule.success_rate}%</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              Last: {new Date(rule.last_executed).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => triggerManualExecution(rule.id)}
                        disabled={!rule.enabled}
                      >
                        Run Now
                      </Button>
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={(checked) => toggleRule(rule.id, checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ai-settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bot className="h-5 w-5 mr-2" />
                AI Configuration
              </CardTitle>
              <CardDescription>
                Configure AI-powered automation features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="ai-quotes">AI Quote Generation</Label>
                  <Switch id="ai-quotes" defaultChecked />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pricing-model">Pricing Model Confidence</Label>
                  <div className="flex items-center space-x-4">
                    <Input 
                      id="pricing-model"
                      type="range"
                      min="0"
                      max="100"
                      defaultValue="85"
                      className="flex-1"
                    />
                    <span className="text-sm font-medium w-12">85%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="smart-scheduling">Smart Scheduling</Label>
                  <Switch id="smart-scheduling" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="predictive-analytics">Predictive Analytics</Label>
                  <Switch id="predictive-analytics" defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Performance Analytics
              </CardTitle>
              <CardDescription>
                Track automation effectiveness and ROI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">↑ 34%</div>
                    <div className="text-sm text-muted-foreground">Quote Response Time</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">↑ 28%</div>
                    <div className="text-sm text-muted-foreground">Customer Satisfaction</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">↑ 45%</div>
                    <div className="text-sm text-muted-foreground">Revenue Growth</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold">Automation Impact</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Manual tasks eliminated</span>
                      <span className="font-medium">156 hours/month</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Average quote generation time</span>
                      <span className="font-medium">3.2 minutes</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Customer response rate</span>
                      <span className="font-medium">94%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Revenue per automated process</span>
                      <span className="font-medium">$1,247</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}