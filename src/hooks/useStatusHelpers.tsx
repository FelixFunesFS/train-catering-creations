import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook for working with workflow statuses
 * Uses database functions for status labels and validation
 */
export function useStatusHelpers() {
  const getStatusLabel = useCallback(async (status: string): Promise<string> => {
    try {
      const { data, error } = await supabase.rpc('get_status_label', { status });
      if (error) throw error;
      return data || status;
    } catch (error) {
      console.error('Error getting status label:', error);
      // Fallback to basic formatting
      return status.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    }
  }, []);

  const getNextStatuses = useCallback(async (
    currentStatus: string, 
    entityType: 'quote' | 'invoice'
  ): Promise<string[]> => {
    try {
      const { data, error } = await supabase.rpc('get_next_statuses', {
        current_status: currentStatus,
        entity_type: entityType
      });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting next statuses:', error);
      return [];
    }
  }, []);

  const isValidTransition = useCallback(async (
    entityType: 'quote' | 'invoice',
    fromStatus: string,
    toStatus: string
  ): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('is_valid_status_transition', {
        entity_type: entityType,
        from_status: fromStatus,
        to_status: toStatus
      });
      if (error) throw error;
      return data || false;
    } catch (error) {
      console.error('Error validating status transition:', error);
      return false;
    }
  }, []);

  return {
    getStatusLabel,
    getNextStatuses,
    isValidTransition
  };
}
