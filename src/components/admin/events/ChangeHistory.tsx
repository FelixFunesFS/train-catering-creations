import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, History, Phone, Mail, FileEdit, User, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ChangeSource } from '@/utils/changeSummaryGenerator';

interface ChangeHistoryProps {
  quoteId: string;
}

interface HistoryEntry {
  id: string;
  field_name: string;
  old_value: string | null;
  new_value: string | null;
  changed_by: string | null;
  change_reason: string | null;
  change_timestamp: string;
  change_source: ChangeSource | null;
  contact_info: string | null;
  customer_summary: string | null;
}

const SOURCE_ICONS: Record<string, React.ReactNode> = {
  phone: <Phone className="h-3 w-3" />,
  email: <Mail className="h-3 w-3" />,
  portal_change_request: <FileEdit className="h-3 w-3" />,
  in_person: <User className="h-3 w-3" />,
  admin_adjustment: <MessageSquare className="h-3 w-3" />,
};

const SOURCE_COLORS: Record<string, string> = {
  phone: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  email: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  portal_change_request: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  in_person: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  admin_adjustment: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
};

export function ChangeHistory({ quoteId }: ChangeHistoryProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { data: history, isLoading } = useQuery({
    queryKey: ['quote-history', quoteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quote_request_history')
        .select('*')
        .eq('quote_request_id', quoteId)
        .order('change_timestamp', { ascending: false });
      
      if (error) throw error;
      return data as HistoryEntry[];
    },
    enabled: !!quoteId,
  });

  const formatValue = (value: string | null): string => {
    if (!value) return '—';
    
    // Try to parse JSON arrays
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map(v => 
          typeof v === 'string' 
            ? v.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
            : v
        ).join(', ');
      }
    } catch {
      // Not JSON, return as-is
    }
    
    return value;
  };

  const formatFieldName = (field: string): string => {
    return field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const historyCount = history?.length || 0;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border rounded-lg">
      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          <History className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-sm">Change History</span>
        </div>
        {historyCount > 0 && (
          <Badge variant="secondary" className="text-xs">
            {historyCount} {historyCount === 1 ? 'change' : 'changes'}
          </Badge>
        )}
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <ScrollArea className="max-h-[300px]">
          <div className="px-3 pb-3 space-y-2">
            {isLoading ? (
              <p className="text-sm text-muted-foreground py-2">Loading history...</p>
            ) : historyCount === 0 ? (
              <p className="text-sm text-muted-foreground py-2">No changes recorded yet.</p>
            ) : (
              history?.map((entry) => (
                <div 
                  key={entry.id} 
                  className="border rounded-lg p-3 text-sm space-y-2 bg-muted/20"
                >
                  {/* Header: Date, Initials, Source */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(entry.change_timestamp), { addSuffix: true })}
                      </span>
                      {entry.changed_by && (
                        <Badge variant="outline" className="text-xs font-mono">
                          {entry.changed_by}
                        </Badge>
                      )}
                    </div>
                    {entry.change_source && (
                      <Badge 
                        variant="secondary" 
                        className={`text-xs flex items-center gap-1 ${SOURCE_COLORS[entry.change_source] || ''}`}
                      >
                        {SOURCE_ICONS[entry.change_source]}
                        {entry.change_source.replace(/_/g, ' ')}
                      </Badge>
                    )}
                  </div>

                  {/* Contact Info */}
                  {entry.contact_info && (
                    <p className="text-xs text-muted-foreground">
                      Contact: {entry.contact_info}
                    </p>
                  )}

                  {/* Field Change */}
                  <div className="bg-background rounded p-2">
                    <p className="font-medium text-xs text-muted-foreground mb-1">
                      {formatFieldName(entry.field_name)}
                    </p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-destructive/70 line-through">
                        {formatValue(entry.old_value)}
                      </span>
                      <span className="text-muted-foreground">→</span>
                      <span className="text-primary font-medium">
                        {formatValue(entry.new_value)}
                      </span>
                    </div>
                  </div>

                  {/* Change Reason / Internal Note */}
                  {entry.change_reason && (
                    <p className="text-xs italic text-muted-foreground">
                      {entry.change_reason}
                    </p>
                  )}

                  {/* Customer Summary */}
                  {entry.customer_summary && (
                    <div className="text-xs bg-primary/5 border border-primary/20 rounded p-2">
                      <span className="font-medium">Customer note: </span>
                      {entry.customer_summary}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CollapsibleContent>
    </Collapsible>
  );
}
