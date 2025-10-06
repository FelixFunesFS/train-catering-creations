import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ChangeRequestProcessor } from '@/services/ChangeRequestProcessor';

export interface ChangeRequest {
  id: string;
  invoice_id: string;
  customer_email: string;
  request_type: string;
  priority: string;
  workflow_status: string;
  customer_comments: string;
  requested_changes: any;
  original_details?: any;
  estimated_cost_change: number;
  admin_response?: string;
  created_at: string;
  updated_at: string;
}

interface ApproveChangeOptions {
  adminResponse: string;
  finalCostChange?: number;
}

export function useSimplifiedChangeRequests(invoiceId?: string) {
  const [processing, setProcessing] = useState(false);
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
