import { useState } from 'react';
import { format } from 'date-fns';
import { useChangeRequests, useUpdateChangeRequest } from '@/hooks/useChangeRequests';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertCircle, CheckCircle, Clock, Eye, MessageSquare, XCircle, Loader2 } from 'lucide-react';

import { Json } from '@/integrations/supabase/types';

interface ChangeRequest {
  id: string;
  customer_email: string;
  request_type: string;
  requested_changes: Json;
  customer_comments: string | null;
  workflow_status: string;
  priority: string;
  created_at: string;
  admin_response: string | null;
  invoice_id: string | null;
}

export function ChangeRequestsPanel() {
  const { data: requests, isLoading } = useChangeRequests();
  const updateRequest = useUpdateChangeRequest();
  
  const [selectedRequest, setSelectedRequest] = useState<ChangeRequest | null>(null);
  const [adminResponse, setAdminResponse] = useState('');

  const pendingRequests = requests?.filter(r => r.workflow_status === 'pending') || [];
  const otherRequests = requests?.filter(r => r.workflow_status !== 'pending') || [];

  const handleApprove = async () => {
    if (!selectedRequest) return;
    
    await updateRequest.mutateAsync({
      id: selectedRequest.id,
      updates: {
        workflow_status: 'approved',
        admin_response: adminResponse || 'Your request has been approved.',
        reviewed_at: new Date().toISOString(),
        reviewed_by: 'admin',
      },
    });
    
    setSelectedRequest(null);
    setAdminResponse('');
  };

  const handleReject = async () => {
    if (!selectedRequest || !adminResponse.trim()) return;
    
    await updateRequest.mutateAsync({
      id: selectedRequest.id,
      updates: {
        workflow_status: 'rejected',
        admin_response: adminResponse,
        reviewed_at: new Date().toISOString(),
        reviewed_by: 'admin',
      },
    });
    
    setSelectedRequest(null);
    setAdminResponse('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-500/10 text-green-700"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-500/10 text-red-700"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRequestTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'modification': 'Menu/Service Change',
      'date_change': 'Date Change',
      'guest_count': 'Guest Count Change',
      'cancellation': 'Cancellation Request',
    };
    return labels[type] || type;
  };

  const renderRequestCard = (request: ChangeRequest) => (
    <Card key={request.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {getStatusBadge(request.workflow_status)}
              <Badge variant="secondary">{getRequestTypeLabel(request.request_type)}</Badge>
            </div>
            
            <p className="font-medium text-sm">{request.customer_email}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {format(new Date(request.created_at), 'MMM d, yyyy h:mm a')}
            </p>
            
            {request.customer_comments && (
              <p className="text-sm mt-2 text-muted-foreground line-clamp-2">
                "{request.customer_comments}"
              </p>
            )}
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setSelectedRequest(request);
              setAdminResponse(request.admin_response || '');
            }}
          >
            <Eye className="h-4 w-4 mr-1" />
            Review
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending Requests */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
          <h2 className="text-lg font-semibold">Pending Requests</h2>
          {pendingRequests.length > 0 && (
            <Badge variant="destructive">{pendingRequests.length}</Badge>
          )}
        </div>
        
        {pendingRequests.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No pending change requests</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {pendingRequests.map(renderRequestCard)}
          </div>
        )}
      </section>

      {/* Resolved Requests */}
      {otherRequests.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4">Resolved Requests</h2>
          <div className="space-y-3">
            {otherRequests.map(renderRequestCard)}
          </div>
        </section>
      )}

      {/* Review Dialog */}
      {selectedRequest && (
        <Dialog open onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Review Change Request</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {getStatusBadge(selectedRequest.workflow_status)}
                <Badge variant="secondary">{getRequestTypeLabel(selectedRequest.request_type)}</Badge>
              </div>

              <div className="text-sm">
                <p className="text-muted-foreground">Customer:</p>
                <p className="font-medium">{selectedRequest.customer_email}</p>
              </div>

              <div className="text-sm">
                <p className="text-muted-foreground">Submitted:</p>
                <p>{format(new Date(selectedRequest.created_at), 'MMMM d, yyyy h:mm a')}</p>
              </div>

              {selectedRequest.customer_comments && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Customer Comments:</p>
                  <p className="text-sm bg-muted/50 p-3 rounded-lg">
                    "{selectedRequest.customer_comments}"
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground mb-1">Requested Changes:</p>
                <pre className="text-xs bg-muted/50 p-3 rounded-lg overflow-auto max-h-32">
                  {JSON.stringify(selectedRequest.requested_changes, null, 2)}
                </pre>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium mb-2">Admin Response</p>
                <Textarea
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  placeholder="Enter your response to the customer..."
                  rows={3}
                  disabled={selectedRequest.workflow_status !== 'pending'}
                />
              </div>
            </div>

            <DialogFooter>
              {selectedRequest.workflow_status === 'pending' ? (
                <>
                  <Button 
                    variant="outline" 
                    onClick={handleReject}
                    disabled={!adminResponse.trim() || updateRequest.isPending}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Decline
                  </Button>
                  <Button 
                    onClick={handleApprove}
                    disabled={updateRequest.isPending}
                  >
                    {updateRequest.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                  Close
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
