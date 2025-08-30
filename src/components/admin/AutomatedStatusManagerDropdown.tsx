import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Bot, 
  ArrowRight, 
  CheckCircle, 
  Clock,
  AlertCircle,
  Settings,
  ChevronDown
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

export function AutomatedStatusManagerDropdown({ onStatusUpdate, data }: AutomatedStatusManagerProps) {
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingUpdates, setPendingUpdates] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
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
      }
    ];

    setAutomationRules(defaultRules);
  };

  const checkForAutomatedUpdates = () => {
    const updates: any[] = [];
    // Simplified for header usage
    setPendingUpdates(updates);
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

  const activeRules = automationRules.filter(r => r.enabled).length;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Bot className="h-4 w-4 mr-2" />
          Automation
          {pendingUpdates.length > 0 && (
            <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs">
              {pendingUpdates.length}
            </Badge>
          )}
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96" align="end">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-600" />
            <h4 className="font-medium">Automated Status Management</h4>
          </div>

          {/* Pending Updates */}
          {pendingUpdates.length > 0 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium text-yellow-800 text-sm">
                    {pendingUpdates.length} Updates Ready
                  </span>
                </div>
                <Button
                  onClick={processAutomatedUpdates}
                  disabled={isProcessing}
                  size="sm"
                  className="bg-yellow-600 hover:bg-yellow-700 h-7 text-xs"
                >
                  {isProcessing ? 'Processing...' : 'Apply'}
                </Button>
              </div>
            </div>
          )}

          {/* Quick Rules Toggle */}
          <div className="space-y-2">
            <h5 className="text-sm font-medium flex items-center gap-2">
              <Settings className="h-3 w-3" />
              Quick Rules ({activeRules} active)
            </h5>
            {automationRules.slice(0, 2).map((rule) => (
              <div key={rule.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex-1">
                  <div className="text-xs font-medium">{rule.name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {rule.description}
                  </div>
                </div>
                <Switch
                  id={rule.id}
                  checked={rule.enabled}
                  onCheckedChange={() => toggleRule(rule.id)}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          {/* Status */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle className="h-3 w-3" />
              <span>{activeRules} active rules</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}