import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChangeRequestService, ChangeRequestInput } from '@/services/ChangeRequestService';
import { ChangeRequestProcessor, ChangeRequest, ApproveChangeOptions } from '@/services/ChangeRequestProcessor';
import { useToast } from '@/hooks/use-toast';

// Re-export types for consumers
export type { ChangeRequest, ApproveChangeOptions };

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

/**
 * Process change requests (approve/reject) with full business logic
 * This hook provides approve and reject functions that handle the complete workflow
 */
export function useProcessChangeRequest() {
  const [processing, setProcessing] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const processor = new ChangeRequestProcessor();

  const approveChangeRequest = async (
    changeRequest: ChangeRequest,
    options: ApproveChangeOptions
  ) => {
    setProcessing(true);
    try {
      const result = await processor.approveChangeRequest(changeRequest, options);
      
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['change-requests'] });
        queryClient.invalidateQueries({ queryKey: ['invoices'] });
        queryClient.invalidateQueries({ queryKey: ['events'] });
        toast({
          title: "Changes Applied",
          description: "Quote has been updated with the approved changes. The updated estimate is ready to send.",
        });
      } else {
        throw new Error(result.error || 'Failed to approve change request');
      }

      return result;
    } catch (error) {
      console.error('Error approving change request:', error);
      toast({
        title: "Error",
        description: "Failed to apply changes. Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setProcessing(false);
    }
  };

  const rejectChangeRequest = async (
    changeRequest: ChangeRequest,
    adminResponse: string
  ) => {
    setProcessing(true);
    try {
      const result = await processor.rejectChangeRequest(changeRequest, adminResponse);
      
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['change-requests'] });
        toast({
          title: "Request Rejected",
          description: "Customer will be notified of the decision.",
        });
      } else {
        throw new Error(result.error || 'Failed to reject change request');
      }

      return result;
    } catch (error) {
      console.error('Error rejecting change request:', error);
      toast({
        title: "Error",
        description: "Failed to reject request. Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setProcessing(false);
    }
  };

  return {
    processing,
    approveChangeRequest,
    rejectChangeRequest
  };
}

/**
 * @deprecated Use useProcessChangeRequest instead
 * Alias for backward compatibility
 */
export const useSimplifiedChangeRequests = useProcessChangeRequest;
