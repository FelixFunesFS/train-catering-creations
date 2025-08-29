import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  ArrowRight,
  GitCompare
} from 'lucide-react';

interface QuoteChange {
  field: string;
  old_value: any;
  new_value: any;
  impact: 'high' | 'medium' | 'low';
}

interface SyncConflict {
  invoiceId: string;
  quoteId: string;
  changes: QuoteChange[];
  lastSyncDate: string;
  quoteUpdatedDate: string;
  status: 'needs_review' | 'auto_resolvable' | 'resolved';
}

interface InvoiceQuoteSyncManagerProps {
  quoteId?: string;
  onSyncComplete?: () => void;
}

export function InvoiceQuoteSyncManager({ quoteId, onSyncComplete }: InvoiceQuoteSyncManagerProps) {
  const [conflicts, setConflicts] = useState<SyncConflict[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoSyncing, setAutoSyncing] = useState<{ [key: string]: boolean }>({});
  const { toast } = useToast();

  useEffect(() => {
    if (quoteId) {
      checkSyncStatus();
    }
  }, [quoteId]);

  const checkSyncStatus = async () => {
    setLoading(true);
    try {
      // Fetch invoices that might be out of sync with the quote
      const { data: invoices, error: invoicesError } = await supabase
        .from('invoices')
        .select('*')
        .eq('quote_request_id', quoteId)
        .eq('is_draft', true);

      if (invoicesError) throw invoicesError;

      if (!invoices || invoices.length === 0) {
        setConflicts([]);
        return;
      }

      // Fetch the current quote data
      const { data: quote, error: quoteError } = await supabase
        .from('quote_requests')
        .select('*')
        .eq('id', quoteId)
        .single();

      if (quoteError) throw quoteError;

      // Check for conflicts
      const detectedConflicts: SyncConflict[] = [];

      for (const invoice of invoices) {
        if (invoice.last_quote_sync) {
          const lastSync = new Date(invoice.last_quote_sync);
          const quoteUpdated = new Date(quote.updated_at);

          if (quoteUpdated > lastSync) {
            // Detect specific changes
            const changes = await detectQuoteChanges(invoice, quote, lastSync);
            
            if (changes.length > 0) {
              detectedConflicts.push({
                invoiceId: invoice.id,
                quoteId: quote.id,
                changes,
                lastSyncDate: invoice.last_quote_sync,
                quoteUpdatedDate: quote.updated_at,
                status: changes.some(c => c.impact === 'high') ? 'needs_review' : 'auto_resolvable'
              });
            }
          }
        }
      }

      setConflicts(detectedConflicts);
    } catch (error) {
      console.error('Error checking sync status:', error);
      toast({
        title: "Error",
        description: "Failed to check sync status",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const detectQuoteChanges = async (invoice: any, quote: any, lastSync: Date): Promise<QuoteChange[]> => {
    // Get quote history since last sync
    const { data: history, error } = await supabase
      .from('quote_request_history')
      .select('*')
      .eq('quote_request_id', quote.id)
      .gte('change_timestamp', lastSync.toISOString())
      .order('change_timestamp', { ascending: true });

    if (error || !history) return [];

    const changes: QuoteChange[] = [];
    const impactMap: { [key: string]: 'high' | 'medium' | 'low' } = {
      'guest_count': 'high',
      'event_date': 'high',
      'service_type': 'high',
      'primary_protein': 'medium',
      'secondary_protein': 'medium',
      'appetizers': 'medium',
      'sides': 'low',
      'desserts': 'low',
      'drinks': 'low',
      'dietary_restrictions': 'medium',
      'special_requests': 'low'
    };

    // Group changes by field to get the latest value
    const fieldChanges: { [key: string]: any } = {};
    history.forEach(change => {
      fieldChanges[change.field_name] = {
        old_value: change.old_value,
        new_value: change.new_value,
        impact: impactMap[change.field_name] || 'low'
      };
    });

    // Convert to changes array
    Object.entries(fieldChanges).forEach(([field, change]) => {
      changes.push({
        field,
        old_value: change.old_value,
        new_value: change.new_value,
        impact: change.impact
      });
    });

    return changes;
  };

  const autoResolveConflict = async (conflict: SyncConflict) => {
    setAutoSyncing(prev => ({ ...prev, [conflict.invoiceId]: true }));
    
    try {
      // For auto-resolvable conflicts, update the invoice with new quote data
      await supabase.functions.invoke('sync-invoice-with-quote', {
        body: {
          invoice_id: conflict.invoiceId,
          quote_id: conflict.quoteId,
          auto_resolve: true
        }
      });

      toast({
        title: "Sync Complete",
        description: "Invoice has been automatically updated with quote changes"
      });

      // Remove from conflicts
      setConflicts(prev => prev.filter(c => c.invoiceId !== conflict.invoiceId));
      onSyncComplete?.();
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Failed to automatically sync invoice with quote",
        variant: "destructive"
      });
    } finally {
      setAutoSyncing(prev => ({ ...prev, [conflict.invoiceId]: false }));
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatFieldName = (field: string) => {
    return field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatValue = (value: any) => {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    }
    return String(value || 'None');
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Quote-Invoice Sync Status
        </CardTitle>
        <Button size="sm" variant="outline" onClick={checkSyncStatus} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Check Status
        </Button>
      </CardHeader>
      <CardContent>
        {conflicts.length === 0 ? (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-5 w-5" />
            <span>All invoices are in sync with the quote</span>
          </div>
        ) : (
          <div className="space-y-6">
            {conflicts.map((conflict) => (
              <Alert key={conflict.invoiceId}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Invoice Sync Conflict Detected</h4>
                        <p className="text-sm text-muted-foreground">
                          Quote updated {new Date(conflict.quoteUpdatedDate).toLocaleDateString()}, 
                          last synced {new Date(conflict.lastSyncDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={conflict.status === 'needs_review' ? 'destructive' : 'secondary'}>
                        {conflict.status === 'needs_review' ? 'Needs Review' : 'Auto-Resolvable'}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <h5 className="font-medium text-sm">Changes Detected:</h5>
                      {conflict.changes.map((change, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <Badge className={getImpactColor(change.impact)} variant="outline">
                            {change.impact}
                          </Badge>
                          <span className="font-medium">{formatFieldName(change.field)}:</span>
                          <span className="text-muted-foreground">{formatValue(change.old_value)}</span>
                          <ArrowRight className="h-3 w-3" />
                          <span>{formatValue(change.new_value)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      {conflict.status === 'auto_resolvable' && (
                        <Button 
                          size="sm" 
                          onClick={() => autoResolveConflict(conflict)}
                          disabled={autoSyncing[conflict.invoiceId]}
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          {autoSyncing[conflict.invoiceId] ? 'Syncing...' : 'Auto-Sync'}
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <GitCompare className="h-3 w-3 mr-1" />
                        Review Changes
                      </Button>
                      <Button size="sm" variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        Mark as Reviewed
                      </Button>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}