import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useEstimateVersioning } from '@/hooks/useEstimateVersioning';
import { 
  History, 
  GitBranch, 
  Download, 
  Eye, 
  RotateCcw, 
  Archive, 
  Plus, 
  Minus, 
  Edit,
  DollarSign,
  Calendar,
  FileText
} from 'lucide-react';

interface EstimateVersioningPanelProps {
  invoiceId: string;
  currentLineItems: any[];
  currentSubtotal: number;
  currentTaxAmount: number;
  currentTotalAmount: number;
  onVersionRestored?: (version: any) => void;
}

export function EstimateVersioningPanel({
  invoiceId,
  currentLineItems,
  currentSubtotal,
  currentTaxAmount,
  currentTotalAmount,
  onVersionRestored
}: EstimateVersioningPanelProps) {
  const [selectedComparison, setSelectedComparison] = useState<[string, string] | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const {
    versions,
    currentVersion,
    loading,
    createVersion,
    revertToVersion,
    compareVersions,
    getVersionSummary,
    archiveVersion,
    exportVersionHistory
  } = useEstimateVersioning({
    invoiceId,
    onVersionChanged: onVersionRestored
  });

  const handleCreateVersion = async () => {
    const result = await createVersion(
      currentLineItems,
      currentSubtotal,
      currentTaxAmount,
      currentTotalAmount,
      'Manual version created by admin'
    );
    
    if (result) {
      setShowCreateDialog(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  const getVersionComparison = () => {
    if (!selectedComparison || selectedComparison.length !== 2) return null;
    
    const version1 = versions.find(v => v.id === selectedComparison[0]);
    const version2 = versions.find(v => v.id === selectedComparison[1]);
    
    if (!version1 || !version2) return null;
    
    return compareVersions(version1, version2);
  };

  const comparison = getVersionComparison();

  return (
    <div className="space-y-6">
      {/* Version Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Estimate Versions
            </CardTitle>
            <div className="flex gap-2">
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <History className="h-4 w-4 mr-2" />
                    Create Version
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Version</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Alert>
                      <FileText className="h-4 w-4" />
                      <AlertDescription>
                        This will create a snapshot of the current estimate state as version {versions.length + 1}.
                        Previous versions will be marked as superseded.
                      </AlertDescription>
                    </Alert>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Items:</span>
                        <span className="ml-2 font-medium">{currentLineItems.length}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total:</span>
                        <span className="ml-2 font-medium">{formatCurrency(currentTotalAmount)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleCreateVersion} disabled={loading}>
                        Create Version
                      </Button>
                      <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="outline" size="sm" onClick={exportVersionHistory}>
                <Download className="h-4 w-4 mr-2" />
                Export History
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {currentVersion && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Current Version</p>
                <p className="font-medium">v{currentVersion.version_number}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Versions</p>
                <p className="font-medium">{versions.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">{new Date(currentVersion.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Total</p>
                <p className="font-medium">{formatCurrency(currentVersion.total_amount)}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Version List */}
      <Card>
        <CardHeader>
          <CardTitle>Version History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-muted rounded"></div>
              ))}
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <GitBranch className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No versions created yet</p>
              <p className="text-xs">Create your first version to start tracking changes</p>
            </div>
          ) : (
            <div className="space-y-4">
              {versions.map((version) => {
                const summary = getVersionSummary(version);
                const isActive = version.status === 'active';
                
                return (
                  <div
                    key={version.id}
                    className={`border rounded-lg p-4 ${
                      isActive ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium">Version {version.version_number}</h4>
                        <Badge variant={isActive ? 'default' : 'outline'}>
                          {version.status}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        {!isActive && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => revertToVersion(version.id)}
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Restore
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => archiveVersion(version.id)}
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Items:</span>
                        <span className="ml-2">{summary.itemCount}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total:</span>
                        <span className="ml-2 font-medium">{summary.formattedTotal}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Created:</span>
                        <span className="ml-2">{summary.createdAt}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">By:</span>
                        <span className="ml-2">{version.created_by}</span>
                      </div>
                    </div>

                    {version.notes && (
                      <div className="mt-3 p-2 bg-muted rounded text-sm">
                        <span className="text-muted-foreground">Notes:</span>
                        <span className="ml-2">{version.notes}</span>
                      </div>
                    )}

                    <div className="mt-3 flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        {summary.categories.join(', ')}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Version Comparison */}
      {versions.length >= 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Compare Versions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Version A</label>
                <select
                  className="w-full mt-1 p-2 border rounded"
                  value={selectedComparison?.[0] || ''}
                  onChange={(e) => {
                    const newSelection = e.target.value;
                    if (newSelection && selectedComparison?.[1]) {
                      setSelectedComparison([newSelection, selectedComparison[1]]);
                    } else if (newSelection) {
                      setSelectedComparison([newSelection, selectedComparison?.[1] || '']);
                    }
                  }}
                >
                  <option value="">Select version</option>
                  {versions.map(v => (
                    <option key={v.id} value={v.id}>
                      Version {v.version_number} - {formatCurrency(v.total_amount)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Version B</label>
                <select
                  className="w-full mt-1 p-2 border rounded"
                  value={selectedComparison?.[1] || ''}
                  onChange={(e) => {
                    const newSelection = e.target.value;
                    if (newSelection && selectedComparison?.[0]) {
                      setSelectedComparison([selectedComparison[0], newSelection]);
                    } else if (newSelection) {
                      setSelectedComparison([selectedComparison?.[0] || '', newSelection]);
                    }
                  }}
                >
                  <option value="">Select version</option>
                  {versions.map(v => (
                    <option key={v.id} value={v.id}>
                      Version {v.version_number} - {formatCurrency(v.total_amount)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {comparison && (
              <div className="space-y-4 border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {comparison.added.length > 0 && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded">
                      <h5 className="font-medium text-green-800 flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Added ({comparison.added.length})
                      </h5>
                      <ul className="text-sm text-green-700 mt-2">
                        {comparison.added.map((item, i) => (
                          <li key={i}>{item.title}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {comparison.removed.length > 0 && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded">
                      <h5 className="font-medium text-red-800 flex items-center gap-2">
                        <Minus className="h-4 w-4" />
                        Removed ({comparison.removed.length})
                      </h5>
                      <ul className="text-sm text-red-700 mt-2">
                        {comparison.removed.map((item, i) => (
                          <li key={i}>{item.title}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {comparison.modified.length > 0 && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                      <h5 className="font-medium text-blue-800 flex items-center gap-2">
                        <Edit className="h-4 w-4" />
                        Modified ({comparison.modified.length})
                      </h5>
                      <ul className="text-sm text-blue-700 mt-2">
                        {comparison.modified.map((item, i) => (
                          <li key={i}>{item.title}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {comparison.priceChange !== 0 && (
                  <Alert>
                    <DollarSign className="h-4 w-4" />
                    <AlertDescription>
                      <span className="font-medium">Price Change: </span>
                      <span className={comparison.priceChange > 0 ? 'text-red-600' : 'text-green-600'}>
                        {comparison.priceChange > 0 ? '+' : ''}{formatCurrency(comparison.priceChange)}
                      </span>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}