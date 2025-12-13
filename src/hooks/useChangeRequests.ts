import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChangeRequestService, ChangeRequestInput } from '@/services/ChangeRequestService';
import { useToast } from '@/hooks/use-toast';

/**
 * Fetch all change requests with optional status filter
 */
export function useChangeRequests(status?: string) {
  return useQuery({
    queryKey: ['change-requests', status],
    queryFn: () => ChangeRequestService.getChangeRequests(status),
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Fetch change requests for a specific invoice
 */
export function useChangeRequestsByInvoice(invoiceId: string | undefined) {
  return useQuery({
    queryKey: ['change-requests', 'invoice', invoiceId],
    queryFn: () => ChangeRequestService.getChangeRequestsByInvoice(invoiceId!),
    enabled: !!invoiceId,
    staleTime: 30 * 1000,
  });
}

/**
 * Fetch pending change requests count
 */
export function usePendingChangeRequestsCount() {
  return useQuery({
    queryKey: ['change-requests', 'pending-count'],
    queryFn: () => ChangeRequestService.getPendingCount(),
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Submit a new change request
 */
export function useSubmitChangeRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (input: ChangeRequestInput) => 
      ChangeRequestService.submitChangeRequest(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['change-requests'] });
      toast({
        title: 'Change Request Submitted',
        description: "We'll review your request and get back to you shortly.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Submission Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Update a change request (admin action)
 */
export function useUpdateChangeRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ 
      id, 
      updates 
    }: { 
      id: string; 
      updates: {
        workflow_status?: string;
        admin_response?: string;
        reviewed_by?: string;
        reviewed_at?: string;
        completed_at?: string;
      };
    }) => ChangeRequestService.updateChangeRequest(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['change-requests'] });
      toast({
        title: 'Change Request Updated',
        description: 'The change request has been updated.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
