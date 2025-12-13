import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ChangeRequestData {
  requestType: string;
  requestedChanges: any;
  customerComments?: string;
  priority?: string;
}

export function useChangeRequest(invoiceId: string, customerEmail: string) {
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const submitChangeRequest = async (data: ChangeRequestData) => {
    try {
      setSubmitting(true);

      const { data: changeRequest, error } = await supabase
        .from('change_requests')
        .insert({
          invoice_id: invoiceId,
          customer_email: customerEmail,
          request_type: data.requestType,
          requested_changes: data.requestedChanges,
          customer_comments: data.customerComments,
          priority: data.priority || 'medium',
          workflow_status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;


      toast({
        title: 'Change Request Submitted',
        description: 'We\'ll review your request and get back to you within 24 hours.'
      });

      return changeRequest;
    } catch (err: any) {
      console.error('Error submitting change request:', err);
      toast({
        title: 'Submission Failed',
        description: err.message,
        variant: 'destructive'
      });
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const acceptEstimate = async () => {
    try {
      setSubmitting(true);

      // Update invoice workflow_status
      const { error } = await supabase
        .from('invoices')
        .update({
          workflow_status: 'approved',
          last_customer_action: new Date().toISOString(),
          customer_feedback: { accepted: true, accepted_at: new Date().toISOString() }
        })
        .eq('id', invoiceId);

      if (error) throw error;


      toast({
        title: 'Estimate Accepted',
        description: 'Thank you! We\'ll be in touch soon to finalize the details.'
      });

      // Return success without immediately triggering refetch
      return true;

    } catch (err: any) {
      console.error('Error accepting estimate:', err);
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive'
      });
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  return { submitChangeRequest, acceptEstimate, submitting };
}
