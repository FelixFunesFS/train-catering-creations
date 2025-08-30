import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { 
  History, 
  User, 
  Clock, 
  Edit, 
  DollarSign, 
  Workflow,
  MessageSquare,
  FileText
} from 'lucide-react';

interface RevisionHistoryPanelProps {
  quoteId: string;
}

interface HistoryItem {
  id: string;
  timestamp: string;
  type: 'field_change' | 'status_change' | 'pricing_change' | 'workflow_action' | 'communication';
  title: string;
  description: string;
  oldValue?: string;
  newValue?: string;
  changedBy: string;
  icon: React.ComponentType<any>;
}

export function RevisionHistoryPanel({ quoteId }: RevisionHistoryPanelProps) {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRevisionHistory();
  }, [quoteId]);

  const loadRevisionHistory = async () => {
    if (!quoteId) return;

    try {
      setLoading(true);
      
      // Load quote field changes
      const { data: fieldChanges, error: fieldError } = await supabase
        .from('quote_request_history')
        .select('*')
        .eq('quote_request_id', quoteId)
        .order('change_timestamp', { ascending: false });

      if (fieldError) throw fieldError;

      // Load workflow status changes
      const { data: workflowChanges, error: workflowError } = await supabase
        .from('workflow_state_log')
        .select('*')
        .eq('entity_id', quoteId)
        .order('created_at', { ascending: false });

      if (workflowError) throw workflowError;

      // Load workflow step completions
      const { data: stepCompletions, error: stepError } = await supabase
        .from('workflow_step_completion')
        .select('*')
        .eq('quote_request_id', quoteId)
        .order('completed_at', { ascending: false });

      if (stepError) throw stepError;

      // Combine and format all history items
      const allHistoryItems: HistoryItem[] = [];

      // Process field changes
      fieldChanges?.forEach(change => {
        allHistoryItems.push({
          id: change.id,
          timestamp: change.change_timestamp,
          type: 'field_change',
          title: `${formatFieldName(change.field_name)} Updated`,
          description: `Changed from "${change.old_value || 'empty'}" to "${change.new_value}"`,
          oldValue: change.old_value,
          newValue: change.new_value,
          changedBy: change.changed_by || 'admin',
          icon: Edit
        });
      });

      // Process workflow changes
      workflowChanges?.forEach(change => {
        allHistoryItems.push({
          id: change.id,
          timestamp: change.created_at,
          type: 'status_change',
          title: 'Status Changed',
          description: `Status changed from "${change.previous_status || 'none'}" to "${change.new_status}"`,
          oldValue: change.previous_status,
          newValue: change.new_status,
          changedBy: change.changed_by || 'system',
          icon: Workflow
        });
      });

      // Process step completions
      stepCompletions?.forEach(completion => {
        allHistoryItems.push({
          id: completion.id,
          timestamp: completion.completed_at,
          type: 'workflow_action',
          title: 'Step Completed',
          description: `${completion.step_name} was marked as completed`,
          changedBy: completion.completed_by || 'admin',
          icon: getStepIcon(completion.step_id)
        });
      });

      // Sort by timestamp (most recent first)
      allHistoryItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setHistoryItems(allHistoryItems);
    } catch (error) {
      console.error('Error loading revision history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFieldName = (fieldName: string) => {
    return fieldName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getStepIcon = (stepId: string) => {
    switch (stepId) {
      case 'pricing_completed': return DollarSign;
      case 'quote_reviewed': return FileText;
      case 'quote_sent': return MessageSquare;
      default: return Clock;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'field_change': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'status_change': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'workflow_action': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'pricing_change': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'communication': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Revision History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-3">
                <div className="h-8 w-8 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Revision History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          {historyItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No revision history available yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {historyItems.map((item, index) => {
                const Icon = item.icon;
                
                return (
                  <div key={item.id}>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{item.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                          </div>
                          <Badge className={getTypeColor(item.type)} variant="outline">
                            {item.type.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span>{item.changedBy}</span>
                          <span>•</span>
                          <Clock className="h-3 w-3" />
                          <span>{formatTimestamp(item.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {index < historyItems.length - 1 && (
                      <Separator className="my-4" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}