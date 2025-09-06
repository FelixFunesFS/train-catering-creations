import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface BatchOperation<T> {
  id: string;
  operation: 'create' | 'update' | 'delete';
  data: T;
  optimisticId?: string;
}

interface UseBatchOperationsProps<T> {
  tableName: string;
  onSuccess?: (results: T[]) => void;
  onError?: (error: Error) => void;
  batchSize?: number;
}

export function useBatchOperations<T extends { id?: string }>({
  tableName,
  onSuccess,
  onError,
  batchSize = 50
}: UseBatchOperationsProps<T>) {
  const [operations, setOperations] = useState<BatchOperation<T>[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const { toast } = useToast();

  // Add operation to batch
  const addOperation = useCallback((operation: Omit<BatchOperation<T>, 'id'>) => {
    const batchOp: BatchOperation<T> = {
      ...operation,
      id: `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    setOperations(prev => [...prev, batchOp]);
    return batchOp.id;
  }, []);

  // Add multiple operations
  const addOperations = useCallback((operations: Omit<BatchOperation<T>, 'id'>[]) => {
    const batchOps = operations.map(op => ({
      ...op,
      id: `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }));
    
    setOperations(prev => [...prev, ...batchOps]);
    return batchOps.map(op => op.id);
  }, []);

  // Remove operation from batch
  const removeOperation = useCallback((operationId: string) => {
    setOperations(prev => prev.filter(op => op.id !== operationId));
  }, []);

  // Clear all operations
  const clearOperations = useCallback(() => {
    setOperations([]);
    setProcessedCount(0);
  }, []);

  // Process a single batch
  const processBatch = async (batch: BatchOperation<T>[]) => {
    const creates = batch.filter(op => op.operation === 'create');
    const updates = batch.filter(op => op.operation === 'update');
    const deletes = batch.filter(op => op.operation === 'delete');
    
    const results: T[] = [];

    try {
      // Process creates
      if (creates.length > 0) {
        const { data: createResults, error: createError } = await (supabase as any)
          .from(tableName)
          .insert(creates.map(op => op.data))
          .select();
        
        if (createError) throw createError;
        if (createResults) results.push(...(createResults as T[]));
      }

      // Process updates  
      if (updates.length > 0) {
        for (const update of updates) {
          if (update.data.id) {
            const { data: updateResult, error: updateError } = await (supabase as any)
              .from(tableName)
              .update(update.data)
              .eq('id', update.data.id)
              .select()
              .single();
            
            if (updateError) throw updateError;
            if (updateResult) results.push(updateResult as T);
          }
        }
      }

      // Process deletes
      if (deletes.length > 0) {
        const deleteIds = deletes
          .map(op => op.data.id)
          .filter(id => id !== undefined) as string[];
        
        if (deleteIds.length > 0) {
          const { error: deleteError } = await (supabase as any)
            .from(tableName)
            .delete()
            .in('id', deleteIds);
          
          if (deleteError) throw deleteError;
        }
      }

      return results;
    } catch (error) {
      console.error('Batch processing error:', error);
      throw error;
    }
  };

  // Execute all batched operations
  const executeBatch = useCallback(async () => {
    if (operations.length === 0) {
      toast({
        title: "No Operations",
        description: "No operations to process",
        variant: "default"
      });
      return [];
    }

    setIsProcessing(true);
    setProcessedCount(0);

    try {
      const batches: BatchOperation<T>[][] = [];
      for (let i = 0; i < operations.length; i += batchSize) {
        batches.push(operations.slice(i, i + batchSize));
      }

      const allResults: T[] = [];
      
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        const batchResults = await processBatch(batch);
        allResults.push(...batchResults);
        
        setProcessedCount(prev => prev + batch.length);
        
        // Small delay between batches to prevent overwhelming the database
        if (i < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      onSuccess?.(allResults);
      
      toast({
        title: "Batch Complete",
        description: `Successfully processed ${operations.length} operations`,
        duration: 3000
      });

      // Clear operations after successful execution
      clearOperations();
      
      return allResults;
    } catch (error) {
      const err = error as Error;
      onError?.(err);
      
      toast({
        title: "Batch Failed",
        description: `Failed to process operations: ${err.message}`,
        variant: "destructive",
        duration: 5000
      });
      
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [operations, batchSize, tableName, onSuccess, onError, toast, clearOperations]);

  // Get batch summary
  const getBatchSummary = useCallback(() => {
    const creates = operations.filter(op => op.operation === 'create').length;
    const updates = operations.filter(op => op.operation === 'update').length;
    const deletes = operations.filter(op => op.operation === 'delete').length;
    
    return {
      total: operations.length,
      creates,
      updates,
      deletes,
      estimatedBatches: Math.ceil(operations.length / batchSize)
    };
  }, [operations, batchSize]);

  // Get progress percentage
  const getProgress = useCallback(() => {
    if (operations.length === 0) return 0;
    return Math.round((processedCount / operations.length) * 100);
  }, [operations.length, processedCount]);

  return {
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
  };
}