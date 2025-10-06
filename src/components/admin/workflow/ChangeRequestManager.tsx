import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FileEdit, Clock, CheckCircle, X, MessageSquare, DollarSign } from "lucide-react";
const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount / 100);

interface ChangeRequest {
  id: string;
  customer_email: string;
  request_type: string;
  workflow_status: string;
  priority: string;
  customer_comments: string;
  admin_response: string | null;
  estimated_cost_change: number;
  requested_changes: any;
  created_at: string;
  reviewed_at: string | null;
}

interface ChangeRequestManagerProps {
  invoiceId: string;
  onChangeProcessed?: () => void;
}

export const ChangeRequestManager = ({ invoiceId, onChangeProcessed }: ChangeRequestManagerProps) => {
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [adminResponse, setAdminResponse] = useState("");
  const [estimatedCostChange, setEstimatedCostChange] = useState<number>(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchChangeRequests();
  }, [invoiceId]);

  const fetchChangeRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('change_requests')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChangeRequests(data || []);
    } catch (error) {
      console.error('Error fetching change requests:', error);
      toast({
        title: "Error",
        description: "Failed to load change requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveChange = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      const { error } = await supabase
        .from('change_requests')
        .update({
          status: 'approved',
          admin_response: adminResponse,
          estimated_cost_change: estimatedCostChange,
          reviewed_at: new Date().toISOString(),
          reviewed_by: 'admin'
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Change Request Approved",
        description: "The change request has been approved. You can now create a revised estimate.",
      });

      await fetchChangeRequests();
      onChangeProcessed?.();
      setAdminResponse("");
      setEstimatedCostChange(0);
    } catch (error) {
      console.error('Error approving change request:', error);
      toast({
        title: "Error",
        description: "Failed to approve change request",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectChange = async (requestId: string) => {
    setProcessingId(requestId);
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
        title: "Change Request Rejected",
        description: "The change request has been rejected.",
      });

      await fetchChangeRequests();
      setAdminResponse("");
    } catch (error) {
      console.error('Error rejecting change request:', error);
      toast({
        title: "Error",
        description: "Failed to reject change request",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div>Loading change requests...</div>;
  }

  if (changeRequests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileEdit className="h-5 w-5" />
            Change Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No change requests for this estimate.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileEdit className="h-5 w-5" />
          Change Requests ({changeRequests.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {changeRequests.map((request) => (
          <div key={request.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(request.workflow_status)}>
                    {request.workflow_status}
                  </Badge>
                  <Badge variant="outline" className={getPriorityColor(request.priority)}>
                    {request.priority} priority
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {request.request_type}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  From: {request.customer_email}
                </p>
                <p className="text-sm text-muted-foreground">
                  <Clock className="h-3 w-3 inline mr-1" />
                  {new Date(request.created_at).toLocaleDateString()}
                </p>
              </div>
              {request.estimated_cost_change !== 0 && (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Cost Impact</p>
                  <p className={`font-medium ${request.estimated_cost_change > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {request.estimated_cost_change > 0 ? '+' : ''}{formatCurrency(request.estimated_cost_change)}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div>
                <h4 className="font-medium flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  Customer Comments
                </h4>
                <p className="text-sm bg-muted p-2 rounded">{request.customer_comments}</p>
              </div>

              {request.requested_changes && (
                <div>
                  <h4 className="font-medium">Requested Changes</h4>
                  <pre className="text-sm bg-muted p-2 rounded overflow-auto">
                    {JSON.stringify(request.requested_changes, null, 2)}
                  </pre>
                </div>
              )}

              {request.admin_response && (
                <div>
                  <h4 className="font-medium">Admin Response</h4>
                  <p className="text-sm bg-blue-50 p-2 rounded">{request.admin_response}</p>
                </div>
              )}
            </div>

            {request.workflow_status === 'pending' && (
              <div className="space-y-3 pt-3 border-t">
                <Textarea
                  placeholder="Enter your response to the customer..."
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  className="min-h-[80px]"
                />
                
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm">Estimated cost change:</span>
                  <input
                    type="number"
                    value={estimatedCostChange}
                    onChange={(e) => setEstimatedCostChange(Number(e.target.value))}
                    className="border rounded px-2 py-1 w-32"
                    placeholder="0"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleApproveChange(request.id)}
                    disabled={processingId === request.id || !adminResponse}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Change
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleRejectChange(request.id)}
                    disabled={processingId === request.id || !adminResponse}
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject Change
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};