import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, 
  Send, 
  Trash2, 
  Archive, 
  CheckCircle,
  Download,
  Mail,
  CreditCard
} from 'lucide-react';

interface BatchOperationsProps {
  selectedItems: string[];
  onAction: (action: string, itemIds: string[]) => Promise<void>;
  itemType: string; // 'quotes', 'invoices', etc.
}

export function BatchOperations({ selectedItems, onAction, itemType }: BatchOperationsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getAvailableActions = () => {
    interface ActionType {
      id: string;
      label: string;
      icon: any;
      variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
      confirmMessage?: string;
    }
    
    const baseActions: ActionType[] = [
      {
        id: 'delete',
        label: 'Delete Selected',
        icon: Trash2,
        variant: 'destructive' as const,
        confirmMessage: `Are you sure you want to delete ${selectedItems.length} item(s)? This action cannot be undone.`
      },
      {
        id: 'archive',
        label: 'Archive',
        icon: Archive,
        variant: 'outline' as const
      }
    ];

    if (itemType === 'invoices') {
      return [
        {
          id: 'send_bulk',
          label: 'Send to Customers',
          icon: Send,
          variant: 'default' as const
        },
        {
          id: 'mark_sent',
          label: 'Mark as Sent',
          icon: CheckCircle,
          variant: 'secondary' as const
        },
        {
          id: 'download_pdf',
          label: 'Download PDFs',
          icon: Download,
          variant: 'outline' as const
        },
        {
          id: 'create_payment_links',
          label: 'Create Payment Links',
          icon: CreditCard,
          variant: 'default' as const
        },
        {
          id: 'send_reminders',
          label: 'Send Reminders',
          icon: Mail,
          variant: 'secondary' as const
        },
        ...baseActions
      ];
    }

    if (itemType === 'quotes') {
      return [
        {
          id: 'convert_to_invoice',
          label: 'Convert to Invoices',
          icon: CheckCircle,
          variant: 'default' as const
        },
        {
          id: 'mark_approved',
          label: 'Mark as Approved',
          icon: CheckCircle,
          variant: 'secondary' as const
        },
        {
          id: 'send_follow_up',
          label: 'Send Follow-up',
          icon: Mail,
          variant: 'outline' as const
        },
        ...baseActions
      ];
    }

    return baseActions;
  };

  const handleAction = async (actionId: string) => {
    const action = getAvailableActions().find(a => a.id === actionId);
    
    if (action?.confirmMessage) {
      const confirmed = window.confirm(action.confirmMessage);
      if (!confirmed) return;
    }

    setIsLoading(true);
    try {
      await onAction(actionId, selectedItems);
      toast({
        title: "Batch Operation Complete",
        description: `Successfully applied "${action?.label}" to ${selectedItems.length} item(s)`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete batch operation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const availableActions = getAvailableActions();

  if (selectedItems.length === 0) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Select items to enable batch operations</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Settings className="h-5 w-5" />
          Batch Operations
          <Badge variant="secondary" className="ml-2">
            {selectedItems.length} selected
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {availableActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                variant={action.variant}
                size="sm"
                onClick={() => handleAction(action.id)}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                {action.label}
              </Button>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-4 pt-4 border-t">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Selected:</span>
              <span className="font-medium ml-1">{selectedItems.length}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Type:</span>
              <span className="font-medium ml-1 capitalize">{itemType}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Available Actions:</span>
              <span className="font-medium ml-1">{availableActions.length}</span>
            </div>
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAction('clear_selection', [])}
                className="h-auto p-0 text-muted-foreground hover:text-foreground"
              >
                Clear Selection
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}