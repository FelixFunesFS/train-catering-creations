import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw,
  Plus,
  Minus,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useBatchOperations } from '@/hooks/useBatchOperations';

interface BatchOperationManagerProps<T> {
  tableName: string;
  title?: string;
  onSuccess?: (results: T[]) => void;
  onError?: (error: Error) => void;
  batchSize?: number;
  children?: React.ReactNode;
}

export function BatchOperationManager<T extends { id?: string }>({
  tableName,
  title = "Batch Operations",
  onSuccess,
  onError,
  batchSize = 50,
  children
}: BatchOperationManagerProps<T>) {
  const [showDetails, setShowDetails] = useState(false);
  
  const {
    operations,
    isProcessing,
    processedCount,
    addOperation,
    addOperations,
    removeOperation,
    clearOperations,
    executeBatch,
    getBatchSummary,
    getProgress
  } = useBatchOperations<T>({
    tableName,
    onSuccess,
    onError,
    batchSize
  });

  const summary = getBatchSummary();
  const progress = getProgress();

  const getOperationIcon = (operation: 'create' | 'update' | 'delete') => {
    switch (operation) {
      case 'create':
        return <Plus className="h-4 w-4 text-green-600" />;
      case 'update':
        return <Edit className="h-4 w-4 text-blue-600" />;
      case 'delete':
        return <Trash2 className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getOperationColor = (operation: 'create' | 'update' | 'delete') => {
    switch (operation) {
      case 'create':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'update':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'delete':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            {title}
            {operations.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {operations.length}
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {operations.length > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  {showDetails ? 'Hide' : 'Show'} Details
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearOperations}
                  disabled={isProcessing}
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Clear
                </Button>
                
                <Button
                  onClick={executeBatch}
                  disabled={isProcessing || operations.length === 0}
                  className="min-w-[100px]"
                >
                  {isProcessing ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Execute Batch
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress */}
        {isProcessing && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Processing operations...</span>
              <span>{processedCount} of {operations.length}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Summary */}
        {operations.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-primary">{summary.total}</div>
              <div className="text-sm text-muted-foreground">Total Operations</div>
            </div>
            
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{summary.creates}</div>
              <div className="text-sm text-muted-foreground">Creates</div>
            </div>
            
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{summary.updates}</div>
              <div className="text-sm text-muted-foreground">Updates</div>
            </div>
            
            <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{summary.deletes}</div>
              <div className="text-sm text-muted-foreground">Deletes</div>
            </div>
          </div>
        )}

        {/* Batch Info */}
        {operations.length > 0 && (
          <div className="p-4 bg-muted/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <span className="font-medium text-sm">Batch Information</span>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Operations will be processed in {summary.estimatedBatches} batch(es) of {batchSize} items each.</p>
              <p>Estimated processing time: ~{Math.ceil(summary.estimatedBatches * 0.5)} seconds</p>
            </div>
          </div>
        )}

        {/* Operation Details */}
        {showDetails && operations.length > 0 && (
          <div>
            <h4 className="font-medium mb-3">Operation Details</h4>
            <ScrollArea className="h-64 w-full">
              <div className="space-y-2">
                {operations.map((operation, index) => (
                  <div key={operation.id}>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getOperationIcon(operation.operation)}
                        <div>
                          <Badge className={getOperationColor(operation.operation)} variant="secondary">
                            {operation.operation.toUpperCase()}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">
                            Operation #{index + 1}
                          </p>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOperation(operation.id)}
                        disabled={isProcessing}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {index < operations.length - 1 && <Separator className="my-2" />}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Empty State */}
        {operations.length === 0 && (
          <div className="text-center py-8">
            <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground mb-2">No operations queued</p>
            <p className="text-sm text-muted-foreground">
              Add operations using the controls above to batch process them efficiently
            </p>
          </div>
        )}

        {/* Custom Content */}
        {children}
      </CardContent>
    </Card>
  );
}