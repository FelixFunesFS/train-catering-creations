import { useCallback, useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseOptimisticUpdatesProps<T> {
  initialData: T;
  updateFn: (data: T) => Promise<T>;
  onSuccess?: (data: T) => void;
  onError?: (error: Error, previousData: T) => void;
}

export function useOptimisticUpdates<T>({
  initialData,
  updateFn,
  onSuccess,
  onError
}: UseOptimisticUpdatesProps<T>) {
  const [data, setData] = useState<T>(initialData);
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasError, setHasError] = useState(false);
  const previousDataRef = useRef<T>(initialData);
  const { toast } = useToast();

  // Update data optimistically
  const updateOptimistically = useCallback((newData: T) => {
    // Store previous data for rollback
    previousDataRef.current = data;
    
    // Apply optimistic update
    setData(newData);
    setHasError(false);
    
    return newData;
  }, [data]);

  // Confirm the optimistic update by calling the actual update function
  const confirmUpdate = useCallback(async (optimisticData: T) => {
    setIsUpdating(true);
    
    try {
      const result = await updateFn(optimisticData);
      setData(result);
      onSuccess?.(result);
      
      toast({
        title: "Success",
        description: "Changes saved successfully",
        duration: 2000
      });
      
      return result;
    } catch (error) {
      // Rollback on error
      setData(previousDataRef.current);
      setHasError(true);
      
      onError?.(error as Error, previousDataRef.current);
      
      toast({
        title: "Error",
        description: "Failed to save changes. Reverting to previous state.",
        variant: "destructive",
        duration: 3000
      });
      
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [updateFn, onSuccess, onError, toast]);

  // Combined optimistic update and confirmation
  const performOptimisticUpdate = useCallback(async (newData: T) => {
    const optimisticData = updateOptimistically(newData);
    return await confirmUpdate(optimisticData);
  }, [updateOptimistically, confirmUpdate]);

  // Rollback to previous state
  const rollback = useCallback(() => {
    setData(previousDataRef.current);
    setHasError(false);
  }, []);

  // Reset error state
  const clearError = useCallback(() => {
    setHasError(false);
  }, []);

  return {
    data,
    isUpdating,
    hasError,
    updateOptimistically,
    confirmUpdate,
    performOptimisticUpdate,
    rollback,
    clearError
  };
}