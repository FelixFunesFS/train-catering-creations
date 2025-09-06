import { useState, useCallback, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CacheConfig {
  staleTime?: number;
  gcTime?: number;
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  refetchOnMount?: boolean;
}

interface OptimisticQueryOptions<T> extends CacheConfig {
  queryKey: string[];
  queryFn: () => Promise<T>;
  updateFn: (data: T) => Promise<T>;
  onSuccess?: (data: T) => void;
  onError?: (error: Error, previousData: T | undefined) => void;
}

export function useOptimisticQuery<T>({
  queryKey,
  queryFn,
  updateFn,
  onSuccess,
  onError,
  staleTime = 5 * 60 * 1000, // 5 minutes
  gcTime = 10 * 60 * 1000, // 10 minutes
  enabled = true,
  refetchOnWindowFocus = false,
  refetchOnMount = true
}: OptimisticQueryOptions<T>) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const previousDataRef = useRef<T>();

  // Main query
  const query = useQuery({
    queryKey,
    queryFn,
    staleTime,
    gcTime,
    enabled,
    refetchOnWindowFocus,
    refetchOnMount
  });

  // Handle success in useEffect
  useEffect(() => {
    if (query.data) {
      previousDataRef.current = query.data;
      onSuccess?.(query.data);
    }
  }, [query.data, onSuccess]);

  // Optimistic update mutation
  const mutation = useMutation({
    mutationFn: updateFn,
    onMutate: async (newData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value
      const previousData = queryClient.getQueryData<T>(queryKey);
      previousDataRef.current = previousData;

      // Optimistically update cache
      queryClient.setQueryData(queryKey, newData);

      return { previousData };
    },
    onError: (error, newData, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      
      onError?.(error as Error, context?.previousData);
      
      toast({
        title: "Update Failed",
        description: "Changes have been reverted. Please try again.",
        variant: "destructive"
      });
    },
    onSuccess: (data) => {
      // Update cache with server response
      queryClient.setQueryData(queryKey, data);
      onSuccess?.(data);
      
      toast({
        title: "Success",
        description: "Changes saved successfully",
        duration: 2000
      });
    },
    onSettled: () => {
      // Always refetch to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey });
    }
  });

  // Optimistic update function
  const updateOptimistically = useCallback(async (newData: T) => {
    return mutation.mutateAsync(newData);
  }, [mutation]);

  // Immediate update without server call (for UI responsiveness)
  const updateImmediately = useCallback((newData: T) => {
    queryClient.setQueryData(queryKey, newData);
  }, [queryClient, queryKey]);

  // Rollback to previous state
  const rollback = useCallback(() => {
    if (previousDataRef.current) {
      queryClient.setQueryData(queryKey, previousDataRef.current);
    }
  }, [queryClient, queryKey]);

  // Refresh data
  const refresh = useCallback(() => {
    return queryClient.refetchQueries({ queryKey });
  }, [queryClient, queryKey]);

  // Invalidate and refetch
  const invalidate = useCallback(() => {
    return queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  return {
    ...query,
    updateOptimistically,
    updateImmediately,
    rollback,
    refresh,
    invalidate,
    isUpdating: mutation.isPending,
    updateError: mutation.error
  };
}

// Hook for managing cache with real-time updates
export function useRealtimeQuery<T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  config: CacheConfig & {
    tableName?: string;
    filter?: string;
    realtimeConfig?: {
      event: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
      schema?: string;
    };
  } = {}
) {
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);

  const query = useQuery({
    queryKey,
    queryFn,
    staleTime: config.staleTime || 30 * 1000, // 30 seconds for realtime data
    gcTime: config.gcTime || 5 * 60 * 1000, // 5 minutes
    enabled: config.enabled,
    refetchOnWindowFocus: config.refetchOnWindowFocus || false,
    refetchOnMount: config.refetchOnMount || true
  });

  // Set up real-time subscription
  useEffect(() => {
    if (!config.tableName || !config.realtimeConfig) return;

    const channel = supabase
      .channel(`realtime-${queryKey.join('-')}`)
      .on(
        'postgres_changes' as any,
        {
          event: config.realtimeConfig.event,
          schema: config.realtimeConfig.schema || 'public',
          table: config.tableName,
          filter: config.filter
        },
        (payload: any) => {
          // Invalidate and refetch on any change
          queryClient.invalidateQueries({ queryKey });
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [config.tableName, config.filter, config.realtimeConfig, queryKey, queryClient]);

  return query;
}

// Cache preloading utility
export function useCachePreloader() {
  const queryClient = useQueryClient();

  const preloadQuery = useCallback(
    (queryKey: string[], queryFn: () => Promise<any>, config: CacheConfig = {}) => {
      return queryClient.prefetchQuery({
        queryKey,
        queryFn,
        staleTime: config.staleTime || 5 * 60 * 1000,
        gcTime: config.gcTime || 10 * 60 * 1000
      });
    },
    [queryClient]
  );

  const preloadQueries = useCallback(async (
    queries: Array<{
      queryKey: string[];
      queryFn: () => Promise<any>;
      config?: CacheConfig;
    }>
  ) => {
    return Promise.all(
      queries.map(({ queryKey, queryFn, config }) => 
        preloadQuery(queryKey, queryFn, config)
      )
    );
  }, [preloadQuery]);

  return {
    preloadQuery,
    preloadQueries
  };
}