import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface SubscriptionConfig {
  table: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
  onUpdate?: (payload: any) => void;
}

/**
 * Optimized realtime subscription hook with deduplication and shared channels
 * 
 * Benefits:
 * - Prevents duplicate subscriptions to same table
 * - Shares channel across multiple components
 * - Automatic cleanup on unmount
 * - Reduced database connections
 * 
 * @example
 * const { data, loading } = useOptimizedRealtimeSubscription({
 *   table: 'invoices',
 *   event: 'UPDATE',
 *   filter: `id=eq.${invoiceId}`,
 *   onUpdate: (payload) => console.log('Invoice updated:', payload)
 * });
 */

// Global channel registry to share subscriptions
const channelRegistry = new Map<string, RealtimeChannel>();
const listenerCounts = new Map<string, number>();

export function useOptimizedRealtimeSubscription({
  table,
  event = '*',
  filter,
  onUpdate
}: SubscriptionConfig) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  
  // Create unique channel key based on table, event, and filter
  const channelKey = `${table}:${event}:${filter || 'all'}`;

  useEffect(() => {
    let channel: RealtimeChannel;
    
    // Check if channel already exists in registry
    if (channelRegistry.has(channelKey)) {
      channel = channelRegistry.get(channelKey)!;
      listenerCounts.set(channelKey, (listenerCounts.get(channelKey) || 0) + 1);
    } else {
      // Create new channel
      channel = supabase.channel(`realtime:${channelKey}`);
      
      // Configure subscription
      const subscriptionConfig: any = {
        event,
        schema: 'public',
        table
      };
      
      if (filter) {
        subscriptionConfig.filter = filter;
      }
      
      channel
        .on('postgres_changes', subscriptionConfig, (payload) => {
          setData(payload.new || payload.old);
          if (onUpdate) {
            onUpdate(payload);
          }
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setLoading(false);
          } else if (status === 'CHANNEL_ERROR') {
            setError(new Error('Subscription failed'));
            setLoading(false);
          }
        });
      
      channelRegistry.set(channelKey, channel);
      listenerCounts.set(channelKey, 1);
    }
    
    channelRef.current = channel;

    // Cleanup function
    return () => {
      const count = listenerCounts.get(channelKey) || 0;
      
      if (count <= 1) {
        // Last listener, remove channel completely
        channel.unsubscribe();
        channelRegistry.delete(channelKey);
        listenerCounts.delete(channelKey);
      } else {
        // Decrement listener count
        listenerCounts.set(channelKey, count - 1);
      }
    };
  }, [table, event, filter, channelKey]);

  return { data, loading, error };
}

/**
 * Specialized hook for invoice updates with automatic refetch
 */
export function useInvoiceRealtimeSync(invoiceId: string, onSync?: () => void) {
  return useOptimizedRealtimeSubscription({
    table: 'invoices',
    event: 'UPDATE',
    filter: `id=eq.${invoiceId}`,
    onUpdate: (payload) => {
      console.log('Invoice updated via realtime:', payload.new);
      if (onSync) {
        onSync();
      }
    }
  });
}

/**
 * Specialized hook for line items updates with automatic recalculation trigger
 */
export function useLineItemsRealtimeSync(invoiceId: string, onSync?: () => void) {
  return useOptimizedRealtimeSubscription({
    table: 'invoice_line_items',
    event: '*',
    filter: `invoice_id=eq.${invoiceId}`,
    onUpdate: (payload) => {
      console.log('Line items changed via realtime:', payload);
      if (onSync) {
        onSync();
      }
    }
  });
}

/**
 * Clear all realtime subscriptions (useful for logout or error recovery)
 */
export function clearAllRealtimeSubscriptions() {
  channelRegistry.forEach((channel) => {
    channel.unsubscribe();
  });
  channelRegistry.clear();
  listenerCounts.clear();
}
