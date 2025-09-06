import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  MessageSquare,
  DollarSign,
  Calendar,
  FileText,
  Eye,
  ArrowRight
} from 'lucide-react';
import { formatCurrency } from '@/lib/changeRequestUtils';

interface ChangeRequest {
  id: string;
  invoice_id: string;
  customer_email: string;
  request_type: string;
  status: string;
  priority: string;
  customer_comments: string;
  admin_response: string | null;
  estimated_cost_change: number;
  requested_changes: any;
  original_details: any;
  created_at: string;
  updated_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  completed_at: string | null;
  // Related invoice data
  invoice?: {
    invoice_number: string;
    total_amount: number;
    status: string;
    quote_requests?: {
      event_name: string;
      event_date: string;
      contact_name: string;
    };
  };
}

interface ChangeRequestsTabProps {
  loading?: boolean;
  onRefresh?: () => void;
}

export function ChangeRequestsTab({ loading: externalLoading, onRefresh }: ChangeRequestsTabProps) {
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [adminResponses, setAdminResponses] = useState<{[key: string]: string}>({});
  const [costChanges, setCostChanges] = useState<{[key: string]: number}>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchChangeRequests();
  }, []);

  const fetchChangeRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('change_requests')
        .select(`
          *,
          invoices!inner(
            invoice_number,
            total_amount,
            status,
            quote_requests!quote_request_id(
              event_name,
              event_date,
              contact_name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChangeRequests(data || []);
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

  const handleProcessChangeRequest = async (
    requestId: string, 
    action: 'approve' | 'reject' | 'request_more_info'
  ) => {
    const request = changeRequests.find(r => r.id === requestId);
    if (!request) return;

    setProcessingId(requestId);
    try {
      // Call the edge function to process the change request
      const { data, error } = await supabase.functions.invoke('process-change-request', {
        body: {
          request_id: requestId,
          action: action,
          admin_response: adminResponses[requestId] || '',
          estimated_cost_change: action === 'approve' ? (costChanges[requestId] || 0) : 0,
          new_estimate_data: action === 'approve' ? request.requested_changes : null
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Change request ${action}d successfully. Customer has been notified.`,
      });

      // Clear admin inputs
      setAdminResponses(prev => ({ ...prev, [requestId]: '' }));
      setCostChanges(prev => ({ ...prev, [requestId]: 0 }));

      // Refresh data
      await fetchChangeRequests();
      onRefresh?.();

    } catch (error) {
      console.error('Error processing change request:', error);
      toast({
        title: "Error",
        description: "Failed to process change request",
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'approved': return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-300';
      case 'needs_more_info': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'needs_more_info': return <MessageSquare className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const pendingRequests = changeRequests.filter(r => r.status === 'pending');
  const processedRequests = changeRequests.filter(r => r.status !== 'pending');

  if (loading || externalLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Loading Change Requests...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{pendingRequests.length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Priority</p>
                <p className="text-2xl font-bold">
                  {changeRequests.filter(r => r.priority === 'high' && r.status === 'pending').length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved Today</p>
                <p className="text-2xl font-bold">
                  {changeRequests.filter(r => 
                    r.status === 'approved' && 
                    new Date(r.updated_at).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold">{changeRequests.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Requests Section */}
      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending Change Requests ({pendingRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingRequests.map((request) => (
              <div key={request.id} className="border rounded-lg p-4 bg-card">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1 space-y-3">
                    {/* Header Info */}
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={getStatusColor(request.status)}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1 capitalize">{request.status.replace('_', ' ')}</span>
                      </Badge>
                      <Badge className={getPriorityColor(request.priority)}>
                        {request.priority.toUpperCase()} Priority
                      </Badge>
                      <Badge variant="outline">{request.request_type}</Badge>
                    </div>

                    {/* Invoice & Event Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Invoice: {request.invoice?.invoice_number || 'N/A'}</p>
                        <p className="text-muted-foreground">Current Total: {formatCurrency(request.invoice?.total_amount || 0)}</p>
                        <p className="text-muted-foreground">Customer: {request.customer_email}</p>
                      </div>
                      <div>
                        <p className="font-medium">Event: {request.invoice?.quote_requests?.event_name || 'N/A'}</p>
                        <p className="text-muted-foreground">
                          Date: {request.invoice?.quote_requests?.event_date 
                            ? new Date(request.invoice.quote_requests.event_date).toLocaleDateString()
                            : 'N/A'
                          }
                        </p>
                        <p className="text-muted-foreground">Contact: {request.invoice?.quote_requests?.contact_name || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Customer Comments */}
                    <div>
                      <p className="font-medium text-sm mb-1">Customer Comments:</p>
                      <p className="text-sm bg-muted p-2 rounded border">{request.customer_comments}</p>
                    </div>

                    {/* Requested Changes */}
                    {request.requested_changes && (
                      <div>
                        <p className="font-medium text-sm mb-1">Requested Changes:</p>
                        <div className="text-sm bg-muted p-2 rounded border">
                          <pre className="whitespace-pre-wrap text-xs">
                            {JSON.stringify(request.requested_changes, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Estimated Cost Change */}
                    {request.estimated_cost_change !== 0 && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span className={`font-medium ${request.estimated_cost_change > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {request.estimated_cost_change > 0 ? '+' : ''}{formatCurrency(request.estimated_cost_change)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Panel */}
                  <div className="lg:w-80 space-y-3 border-t lg:border-t-0 lg:border-l pt-3 lg:pt-0 lg:pl-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Admin Response</label>
                      <Textarea
                        placeholder="Response to customer..."
                        value={adminResponses[request.id] || ''}
                        onChange={(e) => setAdminResponses(prev => ({
                          ...prev,
                          [request.id]: e.target.value
                        }))}
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1 block">Cost Change ($)</label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={costChanges[request.id] || ''}
                        onChange={(e) => setCostChanges(prev => ({
                          ...prev,
                          [request.id]: parseFloat(e.target.value) || 0
                        }))}
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => handleProcessChangeRequest(request.id, 'approve')}
                        disabled={processingId === request.id}
                        className="w-full"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve Changes
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleProcessChangeRequest(request.id, 'request_more_info')}
                        disabled={processingId === request.id}
                        className="w-full"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Request More Info
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleProcessChangeRequest(request.id, 'reject')}
                        disabled={processingId === request.id}
                        className="w-full"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject Changes
                      </Button>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      <p>Created: {new Date(request.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recent Processed Requests */}
      {processedRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Processed Requests ({processedRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {processedRequests.slice(0, 10).map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(request.status)}>
                      {getStatusIcon(request.status)}
                      <span className="ml-1 capitalize">{request.status.replace('_', ' ')}</span>
                    </Badge>
                    <div>
                      <p className="font-medium text-sm">{request.invoice?.quote_requests?.event_name || 'Unknown Event'}</p>
                      <p className="text-xs text-muted-foreground">{request.customer_email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {request.estimated_cost_change !== 0 && (
                        <span className={request.estimated_cost_change > 0 ? 'text-red-600' : 'text-green-600'}>
                          {request.estimated_cost_change > 0 ? '+' : ''}{formatCurrency(request.estimated_cost_change)}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(request.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {changeRequests.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Change Requests</h3>
            <p className="text-muted-foreground">
              When customers request changes to their estimates, they'll appear here for your review.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}