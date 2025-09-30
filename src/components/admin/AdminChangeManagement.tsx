import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ChangesSummaryCard } from './workflow/ChangesSummaryCard';
import { 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertCircle,
  RefreshCw,
  Eye
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ChangeRequest {
  id: string;
  invoice_id: string;
  customer_email: string;
  request_type: string;
  customer_comments: string;
  admin_response?: string;
  status: string;
  estimated_cost_change?: number;
  created_at: string;
  requested_changes: any;
  original_details: any;
  invoices: {
    invoice_number: string;
    quote_requests: {
      event_name: string;
      contact_name: string;
      event_date: string;
    };
  };
}

interface AdminChangeManagementProps {
  onRefresh?: () => void;
}

export function AdminChangeManagement({ onRefresh }: AdminChangeManagementProps) {
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ChangeRequest | null>(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [costImpact, setCostImpact] = useState<number>(0);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchChangeRequests();
    setupRealtimeUpdates();
  }, []);

  const fetchChangeRequests = async () => {
    try {
      console.log('🔍 Starting to fetch change requests...');
      
      // Step 1: Fetch all change requests (no joins at all)
      const { data: changeRequestsData, error: changeRequestsError } = await supabase
        .from('change_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      console.log('📋 Change requests raw data:', changeRequestsData);
      console.log('❌ Change requests error:', changeRequestsError);

      if (changeRequestsError) {
        console.error('Error fetching change requests:', changeRequestsError);
        throw changeRequestsError;
      }

      if (!changeRequestsData || changeRequestsData.length === 0) {
        console.log('⚠️ No change requests found');
        setChangeRequests([]);
        return;
      }

      // Step 2: Get invoice IDs and fetch invoices separately
      const invoiceIds = changeRequestsData
        .map(cr => cr.invoice_id)
        .filter(Boolean);

      console.log('📄 Invoice IDs to fetch:', invoiceIds);

      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select('id, invoice_number, quote_request_id')
        .in('id', invoiceIds);

      console.log('📄 Invoices data:', invoicesData);
      console.log('❌ Invoices error:', invoicesError);

      if (invoicesError) {
        console.error('Error fetching invoices:', invoicesError);
        throw invoicesError;
      }

      // Step 3: Get quote request IDs and fetch quote requests separately
      const quoteRequestIds = (invoicesData || [])
        .map(inv => inv.quote_request_id)
        .filter(Boolean);

      console.log('📝 Quote request IDs to fetch:', quoteRequestIds);

      const { data: quoteRequestsData, error: quoteRequestsError } = await supabase
        .from('quote_requests')
        .select('id, event_name, contact_name, event_date')
        .in('id', quoteRequestIds);

      console.log('📝 Quote requests data:', quoteRequestsData);
      console.log('❌ Quote requests error:', quoteRequestsError);

      if (quoteRequestsError) {
        console.error('Error fetching quote requests:', quoteRequestsError);
        throw quoteRequestsError;
      }

      // Step 4: Manually combine all the data
      const combinedData = changeRequestsData.map(cr => {
        const invoice = invoicesData?.find(inv => inv.id === cr.invoice_id);
        const quoteRequest = quoteRequestsData?.find(qr => qr.id === invoice?.quote_request_id);
        
        return {
          ...cr,
          invoices: invoice ? {
            invoice_number: invoice.invoice_number,
            quote_request_id: invoice.quote_request_id,
            quote_requests: quoteRequest || {
              event_name: 'Unknown Event',
              contact_name: 'Unknown Contact',
              event_date: ''
            }
          } : null
        };
      });

      console.log('✅ Final combined data:', combinedData);
      setChangeRequests(combinedData as any);
    } catch (error) {
      console.error('💥 Fatal error in fetchChangeRequests:', error);
      toast({
        title: "Error",
        description: `Failed to load change requests: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeUpdates = () => {
    const channel = supabase
      .channel('change-requests-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'change_requests'
        },
        (payload) => {
          console.log('Change request updated:', payload);
          fetchChangeRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleApproveRequest = async (requestId: string) => {
    if (!selectedRequest || !adminResponse) {
      toast({
        title: "Missing Information",
        description: "Please provide an admin response before approving.",
        variant: "destructive"
      });
      return;
    }

    setProcessing(true);
    try {
      const costChangeCents = Math.round(costImpact * 100);

      // Update the change request
      const { error: updateError } = await supabase
        .from('change_requests')
        .update({
          status: 'approved',
          admin_response: adminResponse,
          estimated_cost_change: costChangeCents,
          reviewed_at: new Date().toISOString(),
          reviewed_by: 'admin'
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // Get invoice and quote details
      const { data: invoice } = await supabase
        .from('invoices')
        .select('quote_request_id, total_amount')
        .eq('id', selectedRequest.invoice_id)
        .single();

      if (invoice?.quote_request_id && selectedRequest.requested_changes) {
        // Apply changes to quote_requests
        const changes = selectedRequest.requested_changes;
        const quoteUpdates: any = {};

        if (changes.event_date) quoteUpdates.event_date = changes.event_date;
        if (changes.guest_count) quoteUpdates.guest_count = parseInt(changes.guest_count);
        if (changes.location) quoteUpdates.location = changes.location;
        if (changes.start_time) quoteUpdates.start_time = changes.start_time;

        await supabase
          .from('quote_requests')
          .update({
            ...quoteUpdates,
            status: 'quoted',
            workflow_status: 'estimated'
          })
          .eq('id', invoice.quote_request_id);

        // Update invoice total
        const newTotal = invoice.total_amount + costChangeCents;
        await supabase
          .from('invoices')
          .update({
            total_amount: Math.max(0, newTotal),
            status: 'approved',
            workflow_status: 'approved'
          })
          .eq('id', selectedRequest.invoice_id);
      }

      toast({
        title: "Request Approved",
        description: "Changes applied to quote. Updated estimate is ready to send.",
      });

      fetchChangeRequests();
      setSelectedRequest(null);
      setAdminResponse('');
      setCostImpact(0);
      
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        title: "Error",
        description: "Failed to approve request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    if (!adminResponse) {
      toast({
        title: "Missing Information",
        description: "Please provide a reason for rejection.",
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
          reviewed_by: 'admin'
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Request Rejected",
        description: "Change request has been rejected and customer will be notified.",
      });

      fetchChangeRequests();
      setSelectedRequest(null);
      setAdminResponse('');
      setCostImpact(0);

      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: "Error",
        description: "Failed to reject request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };


  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'pending': { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending Review' },
      'approved': { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Approved' },
      'rejected': { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejected' },
      'in_progress': { color: 'bg-blue-100 text-blue-800', icon: RefreshCw, label: 'In Progress' }
    };

    const config = statusConfig[status] || statusConfig['pending'];
    const StatusIcon = config.icon;

    return (
      <Badge variant="secondary" className={config.color}>
        <StatusIcon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getRequestTypeLabel = (type: string) => {
    const types = {
      'menu_modification': 'Menu Modification',
      'quantity_change': 'Quantity Change',
      'dietary_accommodation': 'Dietary Accommodation',
      'service_addition': 'Additional Service',
      'date_change': 'Date/Time Change',
      'other': 'Other'
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading change requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Change Request Management</h1>
          <p className="text-muted-foreground">Review and process customer change requests</p>
        </div>
        <Button onClick={fetchChangeRequests} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Change Requests List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Change Requests ({changeRequests.filter(r => r.status === 'pending').length} pending)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {changeRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                  <p>No change requests</p>
                </div>
              ) : (
                changeRequests.map((request) => (
                  <div
                    key={request.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                      selectedRequest?.id === request.id ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => setSelectedRequest(request)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-medium">{request.invoices.quote_requests.event_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {request.invoices.quote_requests.contact_name} • {request.customer_email}
                        </p>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Type:</span>
                        <Badge variant="outline">{getRequestTypeLabel(request.request_type)}</Badge>
                      </div>
                      
                      <p className="text-sm line-clamp-2">{request.customer_comments}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Submitted: {new Date(request.created_at).toLocaleDateString()}</span>
                        {request.estimated_cost_change && (
                          <span className={`font-medium ${
                            request.estimated_cost_change > 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            Cost Impact: {request.estimated_cost_change > 0 ? '+' : ''}
                            {formatCurrency(request.estimated_cost_change / 100)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Request Details & Actions */}
        <div className="space-y-4">
          {selectedRequest ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Request Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium">{selectedRequest.invoices.quote_requests.event_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedRequest.invoices.quote_requests.contact_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(selectedRequest.invoices.quote_requests.event_date).toLocaleDateString()}
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-sm font-medium">Request Type:</Label>
                    <p className="text-sm">{getRequestTypeLabel(selectedRequest.request_type)}</p>
                  </div>

                  <ChangesSummaryCard
                    originalDetails={selectedRequest.original_details}
                    requestedChanges={selectedRequest.requested_changes}
                    customerComments={selectedRequest.customer_comments}
                    estimatedCostChange={selectedRequest.estimated_cost_change}
                  />

                  {selectedRequest.admin_response && (
                    <div className="mt-4">
                      <Label className="text-sm font-medium">Admin Response:</Label>
                      <p className="text-sm whitespace-pre-wrap bg-blue-50 p-2 rounded mt-1">
                        {selectedRequest.admin_response}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {selectedRequest.status === 'pending' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Process Request</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="cost-impact">Cost Impact ($)</Label>
                      <Input
                        id="cost-impact"
                        type="number"
                        step="0.01"
                        value={costImpact}
                        onChange={(e) => setCostImpact(parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Positive for additional costs, negative for discounts
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="admin-response">Response to Customer</Label>
                      <Textarea
                        id="admin-response"
                        value={adminResponse}
                        onChange={(e) => setAdminResponse(e.target.value)}
                        placeholder="Explain the changes and any cost implications..."
                        rows={4}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleApproveRequest(selectedRequest.id)}
                        disabled={processing || !adminResponse}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        {processing ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        ) : (
                          <CheckCircle className="w-4 h-4 mr-2" />
                        )}
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleRejectRequest(selectedRequest.id)}
                        disabled={processing || !adminResponse}
                        variant="outline"
                        className="flex-1"
                      >
                        {processing ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2" />
                        ) : (
                          <XCircle className="w-4 h-4 mr-2" />
                        )}
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">Select a change request to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}