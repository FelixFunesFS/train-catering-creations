import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface StaffAssignment {
  id: string;
  quote_request_id: string;
  staff_name: string;
  role: 'lead_chef' | 'sous_chef' | 'server' | 'driver' | 'setup_crew' | 'bartender';
  arrival_time: string | null;
  notes: string | null;
  confirmed: boolean;
  created_at: string;
  updated_at: string;
}

export interface StaffAssignmentInput {
  staff_name: string;
  role: StaffAssignment['role'];
  arrival_time?: string | null;
  notes?: string | null;
  confirmed?: boolean;
}

/**
 * Hook for fetching staff assignments for an event
 */
export function useStaffAssignments(quoteId: string | null) {
  return useQuery({
    queryKey: ['staff-assignments', quoteId],
    queryFn: async () => {
      if (!quoteId) return [];
      
      const { data, error } = await supabase
        .from('staff_assignments')
        .select('*')
        .eq('quote_request_id', quoteId)
        .order('role', { ascending: true });

      if (error) throw error;
      return data as StaffAssignment[];
    },
    enabled: !!quoteId,
  });
}

/**
 * Hook for creating a staff assignment
 */
export function useCreateStaffAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ quoteId, assignment }: { quoteId: string; assignment: StaffAssignmentInput }) => {
      const { data, error } = await supabase
        .from('staff_assignments')
        .insert({
          quote_request_id: quoteId,
          ...assignment,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['staff-assignments', variables.quoteId] });
      toast.success('Staff member assigned');
    },
    onError: (error) => {
      console.error('Error creating staff assignment:', error);
      toast.error('Failed to assign staff member');
    },
  });
}

/**
 * Hook for updating a staff assignment
 */
export function useUpdateStaffAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      assignmentId, 
      quoteId,
      updates 
    }: { 
      assignmentId: string; 
      quoteId: string;
      updates: Partial<StaffAssignmentInput>;
    }) => {
      const { data, error } = await supabase
        .from('staff_assignments')
        .update(updates)
        .eq('id', assignmentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['staff-assignments', variables.quoteId] });
    },
    onError: (error) => {
      console.error('Error updating staff assignment:', error);
      toast.error('Failed to update staff assignment');
    },
  });
}

/**
 * Hook for deleting a staff assignment
 */
export function useDeleteStaffAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ assignmentId, quoteId }: { assignmentId: string; quoteId: string }) => {
      const { error } = await supabase
        .from('staff_assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['staff-assignments', variables.quoteId] });
      toast.success('Staff member removed');
    },
    onError: (error) => {
      console.error('Error deleting staff assignment:', error);
      toast.error('Failed to remove staff member');
    },
  });
}
