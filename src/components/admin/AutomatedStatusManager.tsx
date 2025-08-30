import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Bot, 
  ArrowRight, 
  CheckCircle, 
  Clock,
  AlertCircle,
  Settings
} from 'lucide-react';

interface AutomatedStatusManagerProps {
  onStatusUpdate: (itemId: string, newStatus: string) => Promise<void>;
  data: any;
}

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  fromStatus: string;
  toStatus: string;
  condition: string;
  enabled: boolean;
  triggerType: 'time' | 'action' | 'event';
}

export function AutomatedStatusManager({ onStatusUpdate, data }: AutomatedStatusManagerProps) {
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingUpdates, setPendingUpdates] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    initializeAutomationRules();
    checkForAutomatedUpdates();
  }, [data]);

  const initializeAutomationRules = () => {
    const defaultRules: AutomationRule[] = [
      {
        id: 'auto-approve-viewed',
        name: 'Auto-approve viewed estimates',
        description: 'Automatically mark estimates as approved after customer views them for 24+ hours',
        fromStatus: 'viewed',
        toStatus: 'approved',
        condition: 'viewed_24h_ago',
        enabled: false,
        triggerType: 'time'
      },
      {
        id: 'auto-send-reminders',
        name: 'Send payment reminders',
        description: 'Automatically send payment reminders for overdue invoices',
        fromStatus: 'sent',
        toStatus: 'reminder_sent',
        condition: 'overdue_7_days',
        enabled: true,
        triggerType: 'time'
      },
      {
        id: 'auto-mark-deposited',
        name: 'Confirm payment received',
        description: 'Automatically mark invoices as deposit paid when payment is detected',
        fromStatus: 'approved',
        toStatus: 'deposit_paid',
        condition: 'payment_received',
        enabled: true,
        triggerType: 'event'
      },
      {
        id: 'auto-confirm-events',
        name: 'Confirm upcoming events',
        description: 'Automatically confirm events when deposit is paid and event is within 30 days',
        fromStatus: 'deposit_paid',
        toStatus: 'confirmed',
        condition: 'event_within_30_days',
        enabled: true,
        triggerType: 'time'
      }
    ];

    setAutomationRules(defaultRules);
  };

  const checkForAutomatedUpdates = () => {
    const updates: any[] = [];
    const enabledRules = automationRules.filter(rule => rule.enabled);

    enabledRules.forEach(rule => {
      const applicableItems = findApplicableItems(rule);
      applicableItems.forEach(item => {
        updates.push({
          itemId: item.id,
          itemType: item.type,
          fromStatus: rule.fromStatus,
          toStatus: rule.toStatus,
          ruleName: rule.name,
          reason: rule.description
        });
      });
    });

    setPendingUpdates(updates);
  };

  const findApplicableItems = (rule: AutomationRule) => {
    const applicable: any[] = [];
    const now = new Date();

    // Check invoices
    data.invoices?.forEach((invoice: any) => {
      if (invoice.status === rule.fromStatus) {
        let shouldUpdate = false;

        switch (rule.condition) {
          case 'viewed_24h_ago':
            if (invoice.viewed_at) {
              const viewedDate = new Date(invoice.viewed_at);
              const hoursSinceViewed = (now.getTime() - viewedDate.getTime()) / (1000 * 60 * 60);
              shouldUpdate = hoursSinceViewed >= 24;
            }
            break;

          case 'overdue_7_days':
            if (invoice.due_date) {
              const dueDate = new Date(invoice.due_date);
              const daysPastDue = (now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24);
              shouldUpdate = daysPastDue >= 7;
            }
            break;

          case 'payment_received':
            // This would typically check payment webhooks or transaction records
            shouldUpdate = false; // Placeholder
            break;

          case 'event_within_30_days':
            if (invoice.quote_requests?.event_date) {
              const eventDate = new Date(invoice.quote_requests.event_date);
              const daysUntilEvent = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
              shouldUpdate = daysUntilEvent <= 30 && daysUntilEvent > 0;
            }
            break;
        }

        if (shouldUpdate) {
          applicable.push({ ...invoice, type: 'invoice' });
        }
      }
    });

    // Check quotes
    data.quotes?.forEach((quote: any) => {
      if (quote.status === rule.fromStatus) {
        let shouldUpdate = false;

        switch (rule.condition) {
          case 'no_response_7_days':
            const createdDate = new Date(quote.created_at);
            const daysSinceCreated = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
            shouldUpdate = daysSinceCreated >= 7;
            break;
        }

        if (shouldUpdate) {
          applicable.push({ ...quote, type: 'quote' });
        }
      }
    });

    return applicable;
  };

  const toggleRule = (ruleId: string) => {
    setAutomationRules(prev => 
      prev.map(rule => 
        rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
      )
    );
  };

  const processAutomatedUpdates = async () => {
    if (pendingUpdates.length === 0) return;

    setIsProcessing(true);
    try {
      for (const update of pendingUpdates) {
        await onStatusUpdate(update.itemId, update.toStatus);
      }

      toast({
        title: "Automation Complete",
        description: `Successfully processed ${pendingUpdates.length} automated status updates`,
      });

      setPendingUpdates([]);
    } catch (error) {
      toast({
        title: "Automation Error",
        description: "Some automated updates failed. Please review manually.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-600" />
          Automated Status Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pending Updates */}
        {pendingUpdates.length > 0 && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <span className="font-medium text-yellow-800">
                  {pendingUpdates.length} Automated Updates Ready
                </span>
              </div>
              <Button
                onClick={processAutomatedUpdates}
                disabled={isProcessing}
                size="sm"
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                {isProcessing ? 'Processing...' : 'Apply Updates'}
              </Button>
            </div>
            <div className="space-y-2">
              {pendingUpdates.slice(0, 3).map((update, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Badge variant="outline">{update.fromStatus}</Badge>
                  <ArrowRight className="h-3 w-3" />
                  <Badge variant="outline">{update.toStatus}</Badge>
                  <span className="text-muted-foreground">{update.reason}</span>
                </div>
              ))}
              {pendingUpdates.length > 3 && (
                <p className="text-sm text-muted-foreground">
                  +{pendingUpdates.length - 3} more updates pending...
                </p>
              )}
            </div>
          </div>
        )}

        {/* Automation Rules */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Automation Rules
          </h4>
          {automationRules.map((rule) => (
            <div key={rule.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{rule.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {rule.triggerType}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{rule.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs">{rule.fromStatus}</Badge>
                  <ArrowRight className="h-3 w-3" />
                  <Badge variant="secondary" className="text-xs">{rule.toStatus}</Badge>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id={rule.id}
                  checked={rule.enabled}
                  onCheckedChange={() => toggleRule(rule.id)}
                />
                <Label htmlFor={rule.id} className="text-sm">
                  {rule.enabled ? 'On' : 'Off'}
                </Label>
              </div>
            </div>
          ))}
        </div>

        {/* Status */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4" />
            <span>{automationRules.filter(r => r.enabled).length} active rules</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Last check: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}