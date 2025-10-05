import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Clock, ArrowRight } from 'lucide-react';

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
      {history.map((entry) => (
        <div key={entry.id} className="flex items-start gap-3 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Badge variant="outline" className="text-xs">
                {entry.field_name}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {new Date(entry.change_timestamp).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {entry.old_value && (
                <>
                  <span className="line-through text-muted-foreground">{entry.old_value}</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                </>
              )}
              <span className="font-medium">{entry.new_value || '(removed)'}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
