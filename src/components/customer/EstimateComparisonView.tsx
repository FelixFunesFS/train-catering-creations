import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  ArrowRight, 
  Plus, 
  Minus, 
  Edit,
  TrendingUp,
  TrendingDown,
  Equal,
  Eye,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

interface EstimateVersion {
  id: string;
  version_number: number;
  line_items: any[];
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  status: string;
  created_at: string;
  is_current?: boolean;
}

interface EstimateComparisonViewProps {
  invoiceId: string;
  oldVersionId?: string;
  newVersionId?: string;
  onClose?: () => void;
}

interface ComparisonItem {
  type: 'added' | 'removed' | 'modified' | 'unchanged';
  oldItem?: any;
  newItem?: any;
  changes?: string[];
}

export function EstimateComparisonView({
  invoiceId,
  oldVersionId,
  newVersionId,
  onClose
}: EstimateComparisonViewProps) {
  const [versions, setVersions] = useState<EstimateVersion[]>([]);
  const [selectedOldVersion, setSelectedOldVersion] = useState<EstimateVersion | null>(null);
  const [selectedNewVersion, setSelectedNewVersion] = useState<EstimateVersion | null>(null);
  const [comparison, setComparison] = useState<ComparisonItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVersions();
  }, [invoiceId]);

  const fetchVersions = async () => {
    try {
      const { data, error } = await supabase
        .from('estimate_versions')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('version_number', { ascending: false });

      if (error) throw error;

      setVersions((data || []) as EstimateVersion[]);

      // Auto-select versions if provided
      if (oldVersionId && newVersionId) {
        const oldVer = data?.find(v => v.id === oldVersionId) as EstimateVersion;
        const newVer = data?.find(v => v.id === newVersionId) as EstimateVersion;
        if (oldVer && newVer) {
          setSelectedOldVersion(oldVer);
          setSelectedNewVersion(newVer);
        }
      } else if (data && data.length >= 2) {
        // Default to comparing latest two versions
        setSelectedNewVersion(data[0] as EstimateVersion);
        setSelectedOldVersion(data[1] as EstimateVersion);
      }
    } catch (error) {
      console.error('Error fetching versions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedOldVersion && selectedNewVersion) {
      generateComparison();
    }
  }, [selectedOldVersion, selectedNewVersion]);

  const generateComparison = () => {
    if (!selectedOldVersion || !selectedNewVersion) return;

    const oldItems = (selectedOldVersion.line_items as any[]) || [];
    const newItems = (selectedNewVersion.line_items as any[]) || [];
    const comparisonItems: ComparisonItem[] = [];

    // Track processed items to avoid duplicates
    const processedNewItems = new Set<number>();

    // Find removed and modified items
    oldItems.forEach((oldItem, oldIndex) => {
      const newItemIndex = newItems.findIndex(newItem => 
        newItem.description === oldItem.description
      );

      if (newItemIndex === -1) {
        // Item was removed
        comparisonItems.push({
          type: 'removed',
          oldItem: oldItem
        });
      } else {
        // Item exists, check if modified
        const newItem = newItems[newItemIndex];
        processedNewItems.add(newItemIndex);

        const changes: string[] = [];
        if (oldItem.quantity !== newItem.quantity) {
          changes.push(`Quantity: ${oldItem.quantity} → ${newItem.quantity}`);
        }
        if (oldItem.unit_price !== newItem.unit_price) {
          changes.push(`Unit Price: $${(oldItem.unit_price / 100).toFixed(2)} → $${(newItem.unit_price / 100).toFixed(2)}`);
        }
        if (oldItem.total !== newItem.total) {
          changes.push(`Total: $${(oldItem.total / 100).toFixed(2)} → $${(newItem.total / 100).toFixed(2)}`);
        }

        comparisonItems.push({
          type: changes.length > 0 ? 'modified' : 'unchanged',
          oldItem: oldItem,
          newItem: newItem,
          changes: changes.length > 0 ? changes : undefined
        });
      }
    });

    // Find added items
    newItems.forEach((newItem, newIndex) => {
      if (!processedNewItems.has(newIndex)) {
        comparisonItems.push({
          type: 'added',
          newItem: newItem
        });
      }
    });

    setComparison(comparisonItems);
  };

  const getChangeIcon = (type: ComparisonItem['type']) => {
    switch (type) {
      case 'added':
        return <Plus className="h-4 w-4 text-green-600" />;
      case 'removed':
        return <Minus className="h-4 w-4 text-red-600" />;
      case 'modified':
        return <Edit className="h-4 w-4 text-amber-600" />;
      default:
        return <Equal className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getChangeColor = (type: ComparisonItem['type']) => {
    switch (type) {
      case 'added':
        return 'border-l-green-500 bg-green-50/50 dark:bg-green-950/20';
      case 'removed':
        return 'border-l-red-500 bg-red-50/50 dark:bg-red-950/20';
      case 'modified':
        return 'border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20';
      default:
        return 'border-l-muted bg-muted/10';
    }
  };

  const formatCurrency = (amount: number) => `$${(amount / 100).toFixed(2)}`;

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading comparison...</p>
        </CardContent>
      </Card>
    );
  }

  if (versions.length < 2) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">Not enough versions to compare</p>
          <p className="text-muted-foreground text-sm mt-1">
            Comparisons will be available once your estimate has multiple versions
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ArrowLeft className="h-5 w-5" />
              Estimate Comparison
            </CardTitle>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Old Version Selector */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Previous Version
              </label>
              <select
                className="w-full p-2 border rounded-md bg-background"
                value={selectedOldVersion?.id || ''}
                onChange={(e) => {
                  const version = versions.find(v => v.id === e.target.value);
                  setSelectedOldVersion(version || null);
                }}
              >
                {versions.map((version) => (
                  <option key={version.id} value={version.id}>
                    Version {version.version_number} - {formatDistanceToNow(new Date(version.created_at), { addSuffix: true })}
                  </option>
                ))}
              </select>
            </div>

            {/* New Version Selector */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Current Version
              </label>
              <select
                className="w-full p-2 border rounded-md bg-background"
                value={selectedNewVersion?.id || ''}
                onChange={(e) => {
                  const version = versions.find(v => v.id === e.target.value);
                  setSelectedNewVersion(version || null);
                }}
              >
                {versions.map((version) => (
                  <option key={version.id} value={version.id}>
                    Version {version.version_number} - {formatDistanceToNow(new Date(version.created_at), { addSuffix: true })}
                    {version.is_current && ' (Current)'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {selectedOldVersion && selectedNewVersion && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Subtotal Change</p>
                  <p className="text-lg font-medium">
                    {formatCurrency(selectedNewVersion.subtotal - selectedOldVersion.subtotal)}
                  </p>
                </div>
                {selectedNewVersion.subtotal > selectedOldVersion.subtotal ? (
                  <TrendingUp className="h-8 w-8 text-red-500" />
                ) : selectedNewVersion.subtotal < selectedOldVersion.subtotal ? (
                  <TrendingDown className="h-8 w-8 text-green-500" />
                ) : (
                  <Equal className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tax Change</p>
                  <p className="text-lg font-medium">
                    {formatCurrency(selectedNewVersion.tax_amount - selectedOldVersion.tax_amount)}
                  </p>
                </div>
                {selectedNewVersion.tax_amount > selectedOldVersion.tax_amount ? (
                  <TrendingUp className="h-8 w-8 text-red-500" />
                ) : selectedNewVersion.tax_amount < selectedOldVersion.tax_amount ? (
                  <TrendingDown className="h-8 w-8 text-green-500" />
                ) : (
                  <Equal className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Change</p>
                  <p className="text-lg font-medium">
                    {formatCurrency(selectedNewVersion.total_amount - selectedOldVersion.total_amount)}
                  </p>
                </div>
                {selectedNewVersion.total_amount > selectedOldVersion.total_amount ? (
                  <TrendingUp className="h-8 w-8 text-red-500" />
                ) : selectedNewVersion.total_amount < selectedOldVersion.total_amount ? (
                  <TrendingDown className="h-8 w-8 text-green-500" />
                ) : (
                  <Equal className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Line Items Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {comparison.map((item, index) => (
                <div key={index}>
                  <div className={`p-4 rounded-lg border-l-4 ${getChangeColor(item.type)}`}>
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {getChangeIcon(item.type)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">
                              {item.newItem?.description || item.oldItem?.description}
                            </h4>
                            
                            {item.type === 'added' && item.newItem && (
                              <div className="mt-2 text-sm text-muted-foreground">
                                <p>Quantity: {item.newItem.quantity}</p>
                                <p>Unit Price: {formatCurrency(item.newItem.unit_price)}</p>
                                <p className="font-medium">Total: {formatCurrency(item.newItem.total)}</p>
                              </div>
                            )}
                            
                            {item.type === 'removed' && item.oldItem && (
                              <div className="mt-2 text-sm text-muted-foreground line-through">
                                <p>Quantity: {item.oldItem.quantity}</p>
                                <p>Unit Price: {formatCurrency(item.oldItem.unit_price)}</p>
                                <p className="font-medium">Total: {formatCurrency(item.oldItem.total)}</p>
                              </div>
                            )}
                            
                            {item.type === 'modified' && item.changes && (
                              <div className="mt-2 space-y-1">
                                {item.changes.map((change, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {change}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            
                            {item.type === 'unchanged' && item.newItem && (
                              <div className="mt-2 text-sm text-muted-foreground">
                                <p>Quantity: {item.newItem.quantity} • Unit Price: {formatCurrency(item.newItem.unit_price)} • Total: {formatCurrency(item.newItem.total)}</p>
                              </div>
                            )}
                          </div>
                          
                          <Badge variant={
                            item.type === 'added' ? 'default' :
                            item.type === 'removed' ? 'destructive' :
                            item.type === 'modified' ? 'secondary' : 'outline'
                          }>
                            {item.type === 'added' ? 'Added' :
                             item.type === 'removed' ? 'Removed' :
                             item.type === 'modified' ? 'Modified' : 'Unchanged'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {index < comparison.length - 1 && <Separator className="my-3" />}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}