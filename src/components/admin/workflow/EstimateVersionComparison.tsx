import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';
import { ChevronDown, ChevronRight, Plus, Trash2, Edit3, History } from 'lucide-react';
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
}

interface VersionChange {
  type: 'added' | 'removed' | 'modified';
  title: string;
  oldPrice?: number;
  newPrice?: number;
  oldQuantity?: number;
  newQuantity?: number;
}

interface EstimateVersionComparisonProps {
  invoiceId: string;
  showLatestChange?: boolean;
  onHistoryClick?: () => void;
}

export function EstimateVersionComparison({ 
  invoiceId, 
  showLatestChange = true,
  onHistoryClick 
}: EstimateVersionComparisonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [oldVersion, setOldVersion] = useState<EstimateVersion | null>(null);
  const [newVersion, setNewVersion] = useState<EstimateVersion | null>(null);
  const [changes, setChanges] = useState<VersionChange[]>([]);

  useEffect(() => {
    loadVersions();
  }, [invoiceId]);

  const loadVersions = async () => {
    try {
      setLoading(true);
      
      // Fetch the last two versions
      const { data: versions, error } = await supabase
        .from('estimate_versions')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('version_number', { ascending: false })
        .limit(2);

      if (error) throw error;

      if (versions && versions.length >= 2) {
        const [newer, older] = versions;
        setNewVersion(newer);
        setOldVersion(older);
        
        // Calculate changes - ensure line_items is an array
        const olderItems = Array.isArray(older.line_items) ? older.line_items : [];
        const newerItems = Array.isArray(newer.line_items) ? newer.line_items : [];
        const calculatedChanges = calculateChanges(olderItems, newerItems);
        setChanges(calculatedChanges);
      } else {
        // Not enough versions to compare
        setOldVersion(null);
        setNewVersion(null);
        setChanges([]);
      }
    } catch (error) {
      console.error('Error loading versions:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateChanges = (oldItems: any[], newItems: any[]): VersionChange[] => {
    const changes: VersionChange[] = [];
    
    // Create maps for quick lookup
    const oldMap = new Map(oldItems.map(item => [`${item.title}-${item.category}`, item]));
    const newMap = new Map(newItems.map(item => [`${item.title}-${item.category}`, item]));

    // Find added items
    newItems.forEach(newItem => {
      const key = `${newItem.title}-${newItem.category}`;
      if (!oldMap.has(key)) {
        changes.push({
          type: 'added',
          title: newItem.title,
          newPrice: newItem.total_price
        });
      }
    });

    // Find removed items
    oldItems.forEach(oldItem => {
      const key = `${oldItem.title}-${oldItem.category}`;
      if (!newMap.has(key)) {
        changes.push({
          type: 'removed',
          title: oldItem.title,
          oldPrice: oldItem.total_price
        });
      }
    });

    // Find modified items
    oldItems.forEach(oldItem => {
      const key = `${oldItem.title}-${oldItem.category}`;
      const newItem = newMap.get(key);
      
      if (newItem && (oldItem.total_price !== newItem.total_price || oldItem.quantity !== newItem.quantity)) {
        changes.push({
          type: 'modified',
          title: oldItem.title,
          oldPrice: oldItem.total_price,
          newPrice: newItem.total_price,
          oldQuantity: oldItem.quantity,
          newQuantity: newItem.quantity
        });
      }
    });

    return changes;
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const getTotalImpact = () => {
    if (!oldVersion || !newVersion) return 0;
    return newVersion.total_amount - oldVersion.total_amount;
  };

  // Don't render if no versions to compare
  if (!oldVersion || !newVersion || changes.length === 0) {
    return null;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-primary/20 bg-primary/5">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-primary/10 transition-colors">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-base">
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                📊 Recent Changes
                <Badge variant="secondary" className="text-xs">
                  {changes.length} {changes.length === 1 ? 'change' : 'changes'}
                </Badge>
              </span>
              {onHistoryClick && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onHistoryClick();
                  }}
                  className="gap-1"
                >
                  <History className="h-3 w-3" />
                  Full History
                </Button>
              )}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-3">
            <div className="text-xs text-muted-foreground">
              Version {oldVersion.version_number} → Version {newVersion.version_number} 
              <span className="ml-2">
                ({format(new Date(newVersion.created_at), 'MMM d, yyyy \'at\' h:mm a')})
              </span>
            </div>

            <div className="space-y-2">
              <div className="font-semibold text-sm">Changes Made:</div>
              
              {changes.map((change, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm">
                  {change.type === 'added' && (
                    <>
                      <Plus className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="font-medium">Added:</span> {change.title}
                        <span className="text-muted-foreground ml-2">
                          {formatCurrency(change.newPrice || 0)}
                        </span>
                      </div>
                    </>
                  )}
                  
                  {change.type === 'removed' && (
                    <>
                      <Trash2 className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="font-medium">Removed:</span> {change.title}
                        <span className="text-muted-foreground ml-2 line-through">
                          {formatCurrency(change.oldPrice || 0)}
                        </span>
                      </div>
                    </>
                  )}
                  
                  {change.type === 'modified' && (
                    <>
                      <Edit3 className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="font-medium">Modified:</span> {change.title}
                        <span className="text-muted-foreground ml-2">
                          {change.oldQuantity !== change.newQuantity && (
                            <span>Qty: {change.oldQuantity} → {change.newQuantity} </span>
                          )}
                          {formatCurrency(change.oldPrice || 0)} → {formatCurrency(change.newPrice || 0)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-3 border-t flex justify-between items-center">
              <span className="font-semibold text-sm">Total Impact:</span>
              <span className={`font-bold ${getTotalImpact() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {getTotalImpact() >= 0 ? '+' : ''}{formatCurrency(getTotalImpact())}
                {getTotalImpact() === 0 && ' (needs pricing)'}
              </span>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
