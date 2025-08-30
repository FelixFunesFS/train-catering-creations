import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, 
  Send, 
  Trash2, 
  CheckCircle,
  Download,
  Mail,
  CreditCard,
  ChevronDown
} from 'lucide-react';

interface BatchOperationsDropdownProps {
  selectedItems: string[];
  onAction: (action: string, itemIds: string[]) => Promise<void>;
  itemType: string;
}

export function BatchOperationsDropdown({ selectedItems, onAction, itemType }: BatchOperationsDropdownProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const getAvailableActions = () => {
    const baseActions = [
      { id: 'delete', label: 'Delete Selected', icon: Trash2, variant: 'destructive' as const },
    ];

    if (itemType === 'invoices') {
      return [
        { id: 'send_bulk', label: 'Send to Customers', icon: Send, variant: 'default' as const },
        { id: 'mark_sent', label: 'Mark as Sent', icon: CheckCircle, variant: 'secondary' as const },
        { id: 'download_pdf', label: 'Download PDFs', icon: Download, variant: 'outline' as const },
        { id: 'create_payment_links', label: 'Payment Links', icon: CreditCard, variant: 'default' as const },
        { id: 'send_reminders', label: 'Send Reminders', icon: Mail, variant: 'secondary' as const },
        ...baseActions
      ];
    }

    if (itemType === 'quotes') {
      return [
        { id: 'convert_to_invoice', label: 'Convert to Invoices', icon: CheckCircle, variant: 'default' as const },
        { id: 'mark_approved', label: 'Mark as Approved', icon: CheckCircle, variant: 'secondary' as const },
        { id: 'send_follow_up', label: 'Send Follow-up', icon: Mail, variant: 'outline' as const },
        ...baseActions
      ];
    }

    return baseActions;
  };

  const handleAction = async (actionId: string) => {
    const action = getAvailableActions().find(a => a.id === actionId);
    
    if (action?.variant === 'destructive') {
      const confirmed = window.confirm(`Are you sure you want to delete ${selectedItems.length} item(s)? This action cannot be undone.`);
      if (!confirmed) return;
    }

    setIsLoading(true);
    try {
      await onAction(actionId, selectedItems);
      toast({
        title: "Batch Operation Complete",
        description: `Successfully applied "${action?.label}" to ${selectedItems.length} item(s)`,
      });
      setIsOpen(false);
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
    return null;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Batch Actions
          <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
            {selectedItems.length}
          </Badge>
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="end">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <h4 className="font-medium text-sm">Batch Operations</h4>
            <Badge variant="secondary" className="ml-auto text-xs">
              {selectedItems.length} selected
            </Badge>
          </div>

          <div className="space-y-1">
            {availableActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAction(action.id)}
                  disabled={isLoading}
                  className={`w-full justify-start h-8 ${
                    action.variant === 'destructive' ? 'text-destructive hover:text-destructive' : ''
                  }`}
                >
                  <Icon className="h-3 w-3 mr-2" />
                  {action.label}
                </Button>
              );
            })}
          </div>

          <div className="pt-2 border-t">
            <div className="text-xs text-muted-foreground">
              Type: <span className="font-medium capitalize">{itemType}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAction('clear_selection', [])}
              className="h-6 p-0 text-xs text-muted-foreground hover:text-foreground mt-1"
            >
              Clear Selection
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}