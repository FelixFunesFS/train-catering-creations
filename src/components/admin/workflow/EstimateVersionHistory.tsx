import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { History, Download, RotateCcw, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface EstimateVersion {
  id: string;
  version_number: number;
  line_items: any;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  created_at: string;
  notes: string | null;
  status: string;
  change_request_id: string | null;
}

interface EstimateVersionHistoryProps {
  invoiceId: string;
  onClose?: () => void;
  onRevert?: (versionId: string) => void;
}

export function EstimateVersionHistory({ 
  invoiceId, 
  onClose,
  onRevert 
}: EstimateVersionHistoryProps) {
  const [versions, setVersions] = useState<EstimateVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadVersionHistory();
  }, [invoiceId]);

  const loadVersionHistory = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('estimate_versions')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('version_number', { ascending: false });

      if (error) throw error;

      setVersions(data || []);
    } catch (error) {
      console.error('Error loading version history:', error);
      toast({
        title: "Error",
        description: "Failed to load version history",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      // Create CSV content
      const headers = ['Version', 'Date', 'Item Count', 'Total', 'Status', 'Notes'];
      const rows = versions.map(v => [
        v.version_number,
        format(new Date(v.created_at), 'yyyy-MM-dd HH:mm:ss'),
        Array.isArray(v.line_items) ? v.line_items.length : 0,
        `$${(v.total_amount / 100).toFixed(2)}`,
        v.status,
        v.notes || ''
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `estimate-history-${invoiceId}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: "Version history has been downloaded"
      });
    } catch (error) {
      console.error('Error exporting history:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export version history",
        variant: "destructive"
      });
    }
  };

  const handleRevert = (versionId: string) => {
    if (onRevert) {
      onRevert(versionId);
    } else {
      toast({
        title: "Revert Not Available",
        description: "Revert functionality is not configured",
        variant: "destructive"
      });
    }
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const getStatusBadge = (status: string, isCurrent: boolean) => {
    if (isCurrent) {
      return <Badge variant="default">Current</Badge>;
    }
    
    switch (status) {
      case 'archived':
        return <Badge variant="secondary">Archived</Badge>;
      case 'superseded':
        return <Badge variant="outline">Superseded</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Card className="max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Complete Version History
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-1" />
              Export CSV
            </Button>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading version history...
          </div>
        ) : versions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No version history available</p>
          </div>
        ) : (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {versions.map((version, idx) => (
                <Card key={version.id} className={idx === 0 ? 'border-primary/50 bg-primary/5' : ''}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">Version {version.version_number}</h3>
                          {getStatusBadge(version.status, idx === 0)}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(version.created_at), 'MMM d, yyyy \'at\' h:mm a')}
                        </div>
                      </div>
                      {idx !== 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRevert(version.id)}
                          className="gap-1"
                        >
                          <RotateCcw className="h-3 w-3" />
                          Revert to this version
                        </Button>
                      )}
                    </div>

                    {version.notes && (
                      <div className="text-sm text-muted-foreground mb-2">
                        • {version.notes}
                      </div>
                    )}

                    {version.change_request_id && (
                      <div className="text-xs text-muted-foreground mb-2">
                        Change Request: {version.change_request_id.substring(0, 8)}...
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-4 pt-3 border-t text-sm">
                      <div>
                        <div className="text-xs text-muted-foreground">Line Items</div>
                        <div className="font-semibold">
                          {Array.isArray(version.line_items) ? version.line_items.length : 0}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Subtotal</div>
                        <div className="font-semibold">{formatCurrency(version.subtotal)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Total</div>
                        <div className="font-semibold">{formatCurrency(version.total_amount)}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
