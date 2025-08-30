import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Zap, 
  Settings, 
  Clock, 
  Mail, 
  CreditCard, 
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  trigger: string;
  action: string;
  lastRun?: string;
  successCount: number;
  errorCount: number;
}

export function WorkflowAutomationManager() {
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    initializeAutomationRules();
  }, []);

  const initializeAutomationRules = () => {
    // Initialize with predefined automation rules
    const defaultRules: AutomationRule[] = [
      {
        id: 'welcome-email',
        name: 'Welcome Email',
        description: 'Send welcome email with portal access when quote is submitted',
        enabled: true,
        trigger: 'quote_submitted',
        action: 'send_welcome_email',
        successCount: 45,
        errorCount: 2
      },
      {
        id: 'estimate-notification',
        name: 'Estimate Ready Notification',
        description: 'Notify customer when estimate is ready for review',
        enabled: true,
        trigger: 'estimate_created',
        action: 'send_estimate_notification',
        successCount: 38,
        errorCount: 1
      },
      {
        id: 'payment-reminder',
        name: 'Payment Reminder',
        description: 'Send payment reminder 24 hours after estimate approval',
        enabled: true,
        trigger: 'estimate_approved_24h',
        action: 'send_payment_reminder',
        successCount: 28,
        errorCount: 0
      },
      {
        id: 'auto-status-progression',
        name: 'Auto Status Progression',
        description: 'Automatically progress quotes through review stages',
        enabled: true,
        trigger: 'quote_reviewed',
        action: 'create_estimate',
        successCount: 42,
        errorCount: 3
      },
      {
        id: 'event-confirmation',
        name: 'Event Confirmation',
        description: 'Send event confirmation and final details after payment',
        enabled: true,
        trigger: 'payment_received',
        action: 'send_event_confirmation',
        successCount: 35,
        errorCount: 1
      },
      {
        id: 'follow-up-survey',
        name: 'Post-Event Follow-up',
        description: 'Send satisfaction survey 3 days after event completion',
        enabled: false,
        trigger: 'event_completed_3d',
        action: 'send_survey',
        successCount: 0,
        errorCount: 0
      }
    ];

    setAutomationRules(defaultRules);
    setLoading(false);
  };

  const toggleAutomation = async (ruleId: string, enabled: boolean) => {
    try {
      setAutomationRules(prev => 
        prev.map(rule => 
          rule.id === ruleId ? { ...rule, enabled } : rule
        )
      );

      toast({
        title: enabled ? "Automation Enabled" : "Automation Disabled",
        description: `Rule "${automationRules.find(r => r.id === ruleId)?.name}" has been ${enabled ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update automation rule",
        variant: "destructive"
      });
    }
  };

  const runAutomation = async (ruleId: string) => {
    try {
      const rule = automationRules.find(r => r.id === ruleId);
      if (!rule) return;

      toast({
        title: "Running Automation",
        description: `Executing "${rule.name}" automation...`,
      });

      // Simulate automation execution
      await new Promise(resolve => setTimeout(resolve, 2000));

      setAutomationRules(prev => 
        prev.map(r => 
          r.id === ruleId 
            ? { ...r, successCount: r.successCount + 1, lastRun: new Date().toISOString() }
            : r
        )
      );

      toast({
        title: "Automation Complete",
        description: `"${rule.name}" executed successfully`,
      });
    } catch (error) {
      toast({
        title: "Automation Failed",
        description: "Failed to execute automation rule",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (rule: AutomationRule) => {
    if (!rule.enabled) return 'text-gray-400';
    if (rule.errorCount > 0) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusIcon = (rule: AutomationRule) => {
    if (!rule.enabled) return Pause;
    if (rule.errorCount > 0) return AlertCircle;
    return CheckCircle;
  };

  const getTriggerIcon = (trigger: string) => {
    switch (trigger) {
      case 'quote_submitted':
        return Mail;
      case 'estimate_created':
        return CreditCard;
      case 'estimate_approved_24h':
        return Clock;
      case 'payment_received':
        return CheckCircle;
      default:
        return Zap;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-3 bg-muted rounded w-3/4"></div>
                <div className="h-8 bg-muted rounded w-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const activeRules = automationRules.filter(rule => rule.enabled).length;
  const totalExecutions = automationRules.reduce((sum, rule) => sum + rule.successCount, 0);
  const totalErrors = automationRules.reduce((sum, rule) => sum + rule.errorCount, 0);

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Active Rules</span>
            </div>
            <div className="text-2xl font-bold">{activeRules}</div>
            <div className="text-sm text-muted-foreground">
              of {automationRules.length} total
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Play className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Executions</span>
            </div>
            <div className="text-2xl font-bold">{totalExecutions}</div>
            <div className="text-sm text-muted-foreground">
              successful runs
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium">Errors</span>
            </div>
            <div className="text-2xl font-bold">{totalErrors}</div>
            <div className="text-sm text-muted-foreground">
              {totalExecutions > 0 ? `${((totalErrors / (totalExecutions + totalErrors)) * 100).toFixed(1)}% error rate` : 'No errors'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Success Rate</span>
            </div>
            <div className="text-2xl font-bold">
              {totalExecutions + totalErrors > 0 ? `${((totalExecutions / (totalExecutions + totalErrors)) * 100).toFixed(1)}%` : '100%'}
            </div>
            <div className="text-sm text-muted-foreground">
              reliability score
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Automation Rules */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Automation Rules</h3>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configure Rules
          </Button>
        </div>

        {automationRules.map((rule) => {
          const StatusIcon = getStatusIcon(rule);
          const TriggerIcon = getTriggerIcon(rule.trigger);
          
          return (
            <Card key={rule.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${rule.enabled ? 'bg-blue-50' : 'bg-gray-50'}`}>
                      <TriggerIcon className={`h-4 w-4 ${rule.enabled ? 'text-blue-600' : 'text-gray-400'}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{rule.name}</h4>
                        <StatusIcon className={`h-4 w-4 ${getStatusColor(rule)}`} />
                        <Badge variant={rule.enabled ? 'default' : 'secondary'}>
                          {rule.enabled ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">
                        {rule.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>✅ {rule.successCount} successful</span>
                        {rule.errorCount > 0 && (
                          <span>❌ {rule.errorCount} errors</span>
                        )}
                        {rule.lastRun && (
                          <span>Last run: {new Date(rule.lastRun).toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 ml-4">
                    <Switch
                      checked={rule.enabled}
                      onCheckedChange={(enabled) => toggleAutomation(rule.id, enabled)}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => runAutomation(rule.id)}
                      disabled={!rule.enabled}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Test
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
              <Mail className="h-5 w-5 mb-2 text-blue-600" />
              <div className="text-left">
                <p className="font-medium">Send Bulk Reminders</p>
                <p className="text-sm text-muted-foreground">Send payment reminders to all pending customers</p>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
              <CheckCircle className="h-5 w-5 mb-2 text-green-600" />
              <div className="text-left">
                <p className="font-medium">Auto-Progress Quotes</p>
                <p className="text-sm text-muted-foreground">Automatically move reviewed quotes to estimate stage</p>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
              <Clock className="h-5 w-5 mb-2 text-purple-600" />
              <div className="text-left">
                <p className="font-medium">Schedule Follow-ups</p>
                <p className="text-sm text-muted-foreground">Queue post-event surveys for completed events</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}