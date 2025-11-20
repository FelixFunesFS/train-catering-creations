import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, DollarSign } from 'lucide-react';
import { useSimplifiedChangeRequests, type ChangeRequest } from '@/hooks/useSimplifiedChangeRequests';
import { supabase } from '@/integrations/supabase/client';
import { WorkflowStateManager } from '@/services/WorkflowStateManager';
import { toast } from '@/hooks/use-toast';

interface ChangeRequestProcessorProps {
  changeRequest: ChangeRequest;
  onProcessed: () => void;
}

export function ChangeRequestProcessor({ changeRequest, onProcessed }: ChangeRequestProcessorProps) {
  const [adminResponse, setAdminResponse] = useState('');
  const [finalCostChange, setFinalCostChange] = useState(changeRequest.estimated_cost_change);
  const { processing, approveChangeRequest, rejectChangeRequest } = useSimplifiedChangeRequests();

  const handleApprove = async () => {
    const result = await approveChangeRequest(changeRequest, {
      adminResponse,
      finalCostChange
    });

    if (result.success) {
      // Update the invoice and quote to reflect changes
      if (changeRequest.invoice_id) {
        // Get the invoice
        const { data: invoice } = await supabase
          .from('invoices')
          .select('*, quote_request_id')
          .eq('id', changeRequest.invoice_id)
          .single();

        if (invoice) {
          // Create new estimate version
          const { data: lineItems } = await supabase
            .from('invoice_line_items')
            .select('*')
            .eq('invoice_id', invoice.id);

          await supabase
            .from('estimate_versions')
            .insert({
              invoice_id: invoice.id,
              change_request_id: changeRequest.id,
              version_number: (invoice.version || 1) + 1,
              line_items: lineItems || [],
              subtotal: invoice.subtotal + (finalCostChange || 0),
              tax_amount: Math.round((invoice.subtotal + (finalCostChange || 0)) * 0.074),
              total_amount: invoice.total_amount + (finalCostChange || 0),
              status: 'approved',
              notes: adminResponse,
              created_by: 'admin'
            });

          // Update the invoice
          await supabase
            .from('invoices')
            .update({
              total_amount: invoice.total_amount + (finalCostChange || 0),
              subtotal: invoice.subtotal + (finalCostChange || 0),
              version: (invoice.version || 1) + 1
            })
            .eq('id', invoice.id);

          // Update quote status
          if (invoice.quote_request_id) {
            await WorkflowStateManager.updateQuoteStatus(
              invoice.quote_request_id,
              'estimated',
              'admin',
              'Change request approved - new estimate version created'
            );

            // Send updated estimate to customer
            await supabase.functions.invoke('send-customer-portal-email', {
              body: {
                quote_request_id: invoice.quote_request_id,
                type: 'estimate_ready'
              }
            });

            // Update invoice status to 'sent' so customer can review updated estimate
            await supabase
              .from('invoices')
              .update({
                workflow_status: 'sent',
                last_status_change: new Date().toISOString(),
                status_changed_by: 'admin'
              })
              .eq('id', invoice.id);
          }
        }
      }

      onProcessed();
    }
  };

  const handleReject = async () => {
    if (!adminResponse.trim()) {
      toast({
        title: "Response Required",
        description: "Please provide a reason for rejection.",
        variant: "destructive"
      });
      return;
    }

    await rejectChangeRequest(changeRequest, adminResponse);
    onProcessed();
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Change Request</h3>
            <p className="text-sm text-muted-foreground">
              From: {changeRequest.customer_email}
            </p>
          </div>
          <Badge variant={
            changeRequest.workflow_status === 'pending' ? 'secondary' :
            changeRequest.workflow_status === 'approved' ? 'default' :
            'destructive'
          }>
            {changeRequest.workflow_status}
          </Badge>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="flex items-start gap-2 mb-2">
            <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">Request Type</p>
              <p className="text-sm text-muted-foreground capitalize">
                {changeRequest.request_type}
              </p>
            </div>
            <Badge variant="outline" className="capitalize">
              {changeRequest.priority}
            </Badge>
          </div>

          <div className="flex items-start gap-2 mb-2">
            <DollarSign className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">Estimated Cost Change</p>
              <p className="text-sm text-muted-foreground">
                ${(changeRequest.estimated_cost_change / 100).toFixed(2)}
              </p>
            </div>
          </div>

          <div className="mt-3">
            <p className="text-sm font-medium mb-1">Customer Comments</p>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {changeRequest.customer_comments}
            </p>
          </div>

          {changeRequest.requested_changes && (
            <div className="mt-3">
              <p className="text-sm font-medium mb-1">Requested Changes</p>
              <pre className="text-xs bg-background p-2 rounded overflow-auto">
                {JSON.stringify(changeRequest.requested_changes, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {changeRequest.workflow_status === 'pending' && (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Final Cost Adjustment (cents)</label>
              <input
                type="number"
                value={finalCostChange || 0}
                onChange={(e) => setFinalCostChange(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Admin Response</label>
              <Textarea
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
                placeholder="Provide details about your decision..."
                rows={4}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleApprove}
                disabled={processing}
                className="flex-1"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve Changes
              </Button>
              <Button
                onClick={handleReject}
                disabled={processing}
                variant="destructive"
                className="flex-1"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject Request
              </Button>
            </div>
          </>
        )}

        {changeRequest.admin_response && (
          <div className="mt-4 bg-muted/50 p-4 rounded-lg">
            <p className="text-sm font-medium mb-1">Admin Response</p>
            <p className="text-sm text-muted-foreground">
              {changeRequest.admin_response}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
