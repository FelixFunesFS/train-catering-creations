import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Clock, ArrowRight, Plus, Minus, Edit3 } from 'lucide-react';

interface HistoryEntry {
  id: string;
  field_name: string;
  old_value: string;
  new_value: string;
  change_timestamp: string;
  changed_by: string;
  change_reason: string;
}

interface ChangeHistoryTimelineProps {
  requestId: string;
  quoteId: string;
}

const getFieldIcon = (fieldName: string) => {
  if (fieldName === 'line_item_added') return Plus;
  if (fieldName === 'line_item_removed') return Minus;
  if (fieldName === 'line_item_modified') return Edit3;
  return Clock;
};

const getFieldBadgeVariant = (fieldName: string): 'default' | 'secondary' | 'outline' | 'destructive' => {
  if (fieldName === 'line_item_added') return 'default';
  if (fieldName === 'line_item_removed') return 'destructive';
  if (fieldName === 'line_item_modified') return 'secondary';
  return 'outline';
};

const formatFieldName = (fieldName: string): string => {
  if (fieldName === 'line_item_added') return 'Item Added';
  if (fieldName === 'line_item_removed') return 'Item Removed';
  if (fieldName === 'line_item_modified') return 'Item Modified';
  return fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export function ChangeHistoryTimeline({ requestId, quoteId }: ChangeHistoryTimelineProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [requestId, quoteId]);

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('quote_request_history')
        .select('*')
        .eq('quote_request_id', quoteId)
        .order('change_timestamp', { ascending: false });

      if (!error && data) {
        setHistory(data);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading history...</p>;
  }

  if (history.length === 0) {
    return <p className="text-sm text-muted-foreground">No change history recorded</p>;
  }

  return (
    <div className="space-y-3 mt-2">
      {history.map((entry) => {
        const Icon = getFieldIcon(entry.field_name);
        const badgeVariant = getFieldBadgeVariant(entry.field_name);
        const formattedFieldName = formatFieldName(entry.field_name);
        const isLineItemChange = entry.field_name.startsWith('line_item_');

        return (
          <div key={entry.id} className="flex items-start gap-3 text-sm border-l-2 pl-3 py-2" 
               style={{ borderColor: isLineItemChange ? 'hsl(var(--primary))' : 'hsl(var(--border))' }}>
            <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${
              entry.field_name === 'line_item_added' ? 'text-green-600' :
              entry.field_name === 'line_item_removed' ? 'text-red-600' :
              entry.field_name === 'line_item_modified' ? 'text-blue-600' :
              'text-muted-foreground'
            }`} />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Badge variant={badgeVariant} className="text-xs">
                  {formattedFieldName}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(entry.change_timestamp).toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground">
                  by {entry.changed_by}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {entry.old_value && (
                  <>
                    <span className="line-through text-muted-foreground text-xs">{entry.old_value}</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                  </>
                )}
                <span className={`font-medium text-xs ${!entry.old_value ? 'text-green-700' : ''}`}>
                  {entry.new_value || '(removed)'}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
