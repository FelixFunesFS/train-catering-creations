import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  Clock,
  DollarSign,
  AlertCircle,
  FileText,
  RefreshCw
} from 'lucide-react';
import { formatCurrency } from '@/lib/changeRequestUtils';

interface ChangeRequest {
  id: string;
  invoice_id: string;
  customer_email: string;
  request_type: string;
  priority: string;
  status: string;
  customer_comments: string;
  requested_changes: any;
  estimated_cost_change: number;
  admin_response: string;
  created_at: string;
  invoice_number?: string;
  event_name?: string;
}

interface IntegratedChangeRequestPanelProps {
  invoiceId: string;
  onChangeProcessed?: () => void;
}

export function IntegratedChangeRequestPanel({ 
  invoiceId, 
  onChangeProcessed 
}: IntegratedChangeRequestPanelProps) {
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ChangeRequest | null>(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [costChange, setCostChange] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchChangeRequests();
    setupRealtimeSubscription();
  }, [invoiceId]);

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`change_requests_${invoiceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'change_requests',
          filter: `invoice_id=eq.${invoiceId}`
        },
        () => {
          fetchChangeRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchChangeRequests = async () => {
    try {
      setLoading(true);
      
      // Fetch change requests
      const { data: requests, error: requestsError } = await supabase
        .from('change_requests')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;

      // Fetch invoice details
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('invoice_number, quote_request_id')
        .eq('id', invoiceId)
        .single();

      if (invoiceError) throw invoiceError;

      // Fetch quote request details
      let eventName = 'Unknown Event';
      if (invoice?.quote_request_id) {
        const { data: quote } = await supabase
          .from('quote_requests')
          .select('event_name')
          .eq('id', invoice.quote_request_id)
          .single();
        
        if (quote) eventName = quote.event_name;
      }

      // Combine data
      const enrichedRequests = requests?.map(req => ({
        ...req,
        invoice_number: invoice?.invoice_number,
        event_name: eventName
      })) || [];

      setChangeRequests(enrichedRequests);
    } catch (error) {
      console.error('Error fetching change requests:', error);
      toast({
        title: "Error",
        description: "Failed to load change requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createNewEstimateVersion = async (requestId: string, newTotal: number) => {
    try {
      // Get current invoice and line items
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('*, invoice_line_items(*)')
        .eq('id', invoiceId)
        .single();

      if (invoiceError) throw invoiceError;

      // Get the latest version number
      const { data: versions } = await supabase
        .from('estimate_versions')
        .select('version_number')
        .eq('invoice_id', invoiceId)
        .order('version_number', { ascending: false })
        .limit(1);

      const nextVersion = versions && versions.length > 0 ? versions[0].version_number + 1 : 1;

      // Create new estimate version
      const { error: versionError } = await supabase
        .from('estimate_versions')
        .insert({
          invoice_id: invoiceId,
          change_request_id: requestId,
          version_number: nextVersion,
          line_items: invoice.invoice_line_items || [],
          subtotal: invoice.subtotal,
          tax_amount: invoice.tax_amount,
          total_amount: newTotal,
          status: 'active',
          notes: `Version ${nextVersion} - Created from change request`,
          created_by: 'admin'
        });

      if (versionError) throw versionError;

      // Update invoice total (revised estimate ready to resend)
      await supabase
        .from('invoices')
        .update({ 
          total_amount: newTotal,
          status: 'pending_review',
          workflow_status: 'pending_review'
        })
        .eq('id', invoiceId);

      return true;
    } catch (error) {
      console.error('Error creating estimate version:', error);
      return false;
    }
  };

  const handleApproveRequest = async (request: ChangeRequest) => {
    if (!adminResponse.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide an admin response",
        variant: "destructive"
      });
      return;
    }

    setProcessing(true);
    try {
      const newTotal = (await getCurrentTotal()) + costChange;

      // Create new estimate version
      const versionCreated = await createNewEstimateVersion(request.id, newTotal);
      
      if (!versionCreated) {
        throw new Error('Failed to create estimate version');
      }

      // Update change request status
      const { error: updateError } = await supabase
        .from('change_requests')
        .update({
          status: 'approved',
          admin_response: adminResponse,
          estimated_cost_change: costChange,
          reviewed_at: new Date().toISOString(),
          reviewed_by: 'admin',
          completed_at: new Date().toISOString()
        })
        .eq('id', request.id);

      if (updateError) throw updateError;

      // Update invoice status to indicate customer requested changes were addressed
      await supabase
        .from('invoices')
        .update({ 
          workflow_status: 'pending_review',
          status: 'pending_review'
        })
        .eq('id', invoiceId);

      // Log workflow state change
      await supabase
        .from('workflow_state_log')
        .insert({
          entity_type: 'invoices',
          entity_id: invoiceId,
          previous_status: 'customer_requested_changes',
          new_status: 'pending_review',
          changed_by: 'admin',
          change_reason: `Approved change request and created new version: ${request.customer_comments}`,
          metadata: {
            change_request_id: request.id,
            cost_change: costChange
          }
        });

      toast({
        title: "Success",
        description: "Change request approved and new estimate version created",
      });

      setSelectedRequest(null);
      setAdminResponse('');
      setCostChange(0);
      fetchChangeRequests();
      onChangeProcessed?.();
    } catch (error) {
      console.error('Error approving change request:', error);
      toast({
        title: "Error",
        description: "Failed to approve change request",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectRequest = async (request: ChangeRequest) => {
    if (!adminResponse.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a reason for rejection",
        variant: "destructive"
      });
      return;
    }

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('change_requests')
        .update({
          status: 'rejected',
          admin_response: adminResponse,
          reviewed_at: new Date().toISOString(),
          reviewed_by: 'admin',
          completed_at: new Date().toISOString()
        })
        .eq('id', request.id);

      if (error) throw error;

      // Log workflow state change
      await supabase
        .from('workflow_state_log')
        .insert({
          entity_type: 'invoices',
          entity_id: invoiceId,
          previous_status: 'customer_requested_changes',
          new_status: 'sent',
          changed_by: 'admin',
          change_reason: `Rejected change request: ${adminResponse}`,
          metadata: { change_request_id: request.id }
        });

      toast({
        title: "Success",
        description: "Change request rejected",
      });

      setSelectedRequest(null);
      setAdminResponse('');
      setCostChange(0);
      fetchChangeRequests();
      onChangeProcessed?.();
    } catch (error) {
      console.error('Error rejecting change request:', error);
      toast({
        title: "Error",
        description: "Failed to reject change request",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const getCurrentTotal = async (): Promise<number> => {
    const { data } = await supabase
      .from('invoices')
      .select('total_amount')
      .eq('id', invoiceId)
      .single();
    
    return data?.total_amount || 0;
  };

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { variant: 'secondary' as const, icon: Clock, label: 'Pending Review' },
      approved: { variant: 'default' as const, icon: CheckCircle, label: 'Approved' },
      rejected: { variant: 'destructive' as const, icon: XCircle, label: 'Rejected' }
    };

    const { variant, icon: Icon, label } = config[status as keyof typeof config] || config.pending;

    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'text-red-600 bg-red-50 border-red-200',
      medium: 'text-orange-600 bg-orange-50 border-orange-200',
      low: 'text-blue-600 bg-blue-50 border-blue-200'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading change requests...</div>
        </CardContent>
      </Card>
    );
  }

  const pendingRequests = changeRequests.filter(r => r.status === 'pending');
  const processedRequests = changeRequests.filter(r => r.status !== 'pending');

  return (
    <div className="space-y-4">
      {/* Pending Requests - High Priority */}
      {pendingRequests.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertCircle className="h-5 w-5" />
              Action Required: {pendingRequests.length} Pending Change Request{pendingRequests.length !== 1 ? 's' : ''}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingRequests.map((request) => (
              <Card 
                key={request.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedRequest?.id === request.id ? 'ring-2 ring-primary' : ''
                } ${getPriorityColor(request.priority)}`}
                onClick={() => setSelectedRequest(request)}
              >
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        <span className="font-medium">{request.event_name}</span>
                        <Badge variant="outline" className="text-xs">
                          {request.request_type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        From: {request.customer_email}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(request.status)}
                      <Badge variant="outline" className={getPriorityColor(request.priority)}>
                        {request.priority} priority
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Customer Comments:</span>
                      <p className="text-muted-foreground mt-1">{request.customer_comments}</p>
                    </div>

                    {request.requested_changes && (
                      <div>
                        <span className="font-medium">Requested Changes:</span>
                        <pre className="text-xs bg-background p-2 rounded mt-1 overflow-auto">
                          {JSON.stringify(request.requested_changes, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>

                  {/* Action Panel for Selected Request */}
                  {selectedRequest?.id === request.id && request.status === 'pending' && (
                    <div className="mt-4 pt-4 border-t space-y-3">
                      <div>
                        <label className="text-sm font-medium">Admin Response *</label>
                        <Textarea
                          value={adminResponse}
                          onChange={(e) => setAdminResponse(e.target.value)}
                          placeholder="Explain how you'll handle this request..."
                          className="mt-1"
                          rows={3}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium">Cost Impact (cents)</label>
                        <Input
                          type="number"
                          value={costChange}
                          onChange={(e) => setCostChange(parseInt(e.target.value) || 0)}
                          placeholder="Enter cost change in cents"
                          className="mt-1"
                        />
                        {costChange !== 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Impact: {formatCurrency(costChange)} {costChange > 0 ? 'increase' : 'decrease'}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleApproveRequest(request)}
                          disabled={processing}
                          className="flex-1"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          {processing ? 'Processing...' : 'Approve & Create New Version'}
                        </Button>
                        <Button
                          onClick={() => handleRejectRequest(request)}
                          disabled={processing}
                          variant="destructive"
                          className="flex-1"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          {processing ? 'Processing...' : 'Reject Request'}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Processed Requests History */}
      {processedRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Request History ({processedRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {processedRequests.map((request) => (
              <div 
                key={request.id}
                className="p-3 border rounded-lg bg-muted/30 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{request.event_name}</span>
                  {getStatusBadge(request.status)}
                </div>
                <p className="text-xs text-muted-foreground">{request.customer_comments}</p>
                {request.admin_response && (
                  <div className="text-xs">
                    <span className="font-medium">Admin Response: </span>
                    <span className="text-muted-foreground">{request.admin_response}</span>
                  </div>
                )}
                {request.estimated_cost_change !== 0 && (
                  <div className="text-xs flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    <span>Cost Impact: {formatCurrency(request.estimated_cost_change)}</span>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {changeRequests.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No change requests for this estimate</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
