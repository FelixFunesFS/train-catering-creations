import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSimplifiedChangeRequests, ChangeRequest as BaseChangeRequest } from '@/hooks/useSimplifiedChangeRequests';
import { formatCurrency } from '@/lib/changeRequestUtils';
import { ChangesSummaryCard } from './ChangesSummaryCard';
import { 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  Clock,
  DollarSign,
  AlertCircle,
  FileText,
  ChevronDown
} from 'lucide-react';

interface ExtendedChangeRequest extends BaseChangeRequest {
  event_name?: string;
  invoice_number?: string;
}

interface IntegratedChangeRequestPanelProps {
  invoiceId: string;
  onChangeProcessed?: () => void;
  defaultCollapsed?: boolean;
  compact?: boolean;
}

export function IntegratedChangeRequestPanel({ 
  invoiceId, 
  onChangeProcessed,
  defaultCollapsed = true,
  compact = false
}: IntegratedChangeRequestPanelProps) {
  const [changeRequests, setChangeRequests] = useState<ExtendedChangeRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ExtendedChangeRequest | null>(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [costChange, setCostChange] = useState<string>('0');
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(!defaultCollapsed);
  const { toast } = useToast();
  const { processing, approveChangeRequest, rejectChangeRequest } = useSimplifiedChangeRequests();

  useEffect(() => {
    fetchChangeRequests();
    const cleanup = setupRealtimeSubscription();
    return cleanup;
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

  const handleApproveRequest = async () => {
    if (!selectedRequest || !adminResponse.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide an admin response",
        variant: "destructive"
      });
      return;
    }

    try {
      const costChangeCents = parseInt(costChange) || 0;
      
      await approveChangeRequest(selectedRequest, {
        adminResponse,
        finalCostChange: costChangeCents
      });

      // Reset form
      setSelectedRequest(null);
      setAdminResponse('');
      setCostChange('0');
      
      // Refresh data
      await fetchChangeRequests();
      onChangeProcessed?.();
    } catch (error) {
      // Error already handled by the hook
      console.error('Error in handleApproveRequest:', error);
    }
  };

  const handleRejectRequest = async () => {
    if (!selectedRequest || !adminResponse.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a reason for rejection",
        variant: "destructive"
      });
      return;
    }

    try {
      await rejectChangeRequest(selectedRequest, adminResponse);

      // Reset form
      setSelectedRequest(null);
      setAdminResponse('');
      setCostChange('0');
      
      // Refresh data
      await fetchChangeRequests();
      onChangeProcessed?.();
    } catch (error) {
      // Error already handled by the hook
      console.error('Error in handleRejectRequest:', error);
    }
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
      high: 'border-red-200 bg-red-50',
      medium: 'border-orange-200 bg-orange-50',
      low: 'border-blue-200 bg-blue-50'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  // Removed - using ChangesSummaryCard component instead

  if (loading) {
    return compact ? (
      <div className="text-sm text-muted-foreground py-2">Loading change requests...</div>
    ) : (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading change requests...</div>
        </CardContent>
      </Card>
    );
  }

  const pendingRequests = changeRequests.filter(r => r.status === 'pending');
  const processedRequests = changeRequests.filter(r => r.status !== 'pending');

  // No change requests at all
  if (changeRequests.length === 0) {
    return null; // Don't show anything if there are no change requests
  }

  // Compact mode for integration into other cards
  if (compact) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border-t pt-4">
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-full justify-between px-0 hover:bg-transparent"
          >
            <span className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Change Requests
              {pendingRequests.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {pendingRequests.length} pending
                </Badge>
              )}
            </span>
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="space-y-3 mt-3">
          {/* Pending Requests */}
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
                      <span className="font-medium text-sm">{request.event_name}</span>
                      <Badge variant="outline" className="text-xs">
                        {request.request_type.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      From: {request.customer_email}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(request.status)}
                    <Badge variant="outline" className="text-xs">
                      {request.priority} priority
                    </Badge>
                  </div>
                </div>

                <ChangesSummaryCard
                  originalDetails={request.original_details}
                  requestedChanges={request.requested_changes}
                  customerComments={request.customer_comments}
                  estimatedCostChange={request.estimated_cost_change}
                />

                {/* Action Panel for Selected Request */}
                {selectedRequest?.id === request.id && request.status === 'pending' && (
                  <div className="mt-4 pt-4 border-t space-y-3">
                    <div>
                      <Label htmlFor="admin-response" className="text-sm font-medium">
                        Admin Response *
                      </Label>
                      <Textarea
                        id="admin-response"
                        value={adminResponse}
                        onChange={(e) => setAdminResponse(e.target.value)}
                        placeholder="Explain how you'll handle this request..."
                        className="mt-1"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="cost-change" className="text-sm font-medium">
                        Cost Impact (in cents)
                      </Label>
                      <Input
                        id="cost-change"
                        type="number"
                        value={costChange}
                        onChange={(e) => setCostChange(e.target.value)}
                        placeholder="Enter cost change in cents"
                        className="mt-1"
                      />
                      {parseInt(costChange) !== 0 && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          Impact: {formatCurrency(parseInt(costChange))} {parseInt(costChange) > 0 ? 'increase' : 'decrease'}
                        </p>
                      )}
                    </div>

                    <Separator />

                    <div className="flex gap-2">
                      <Button
                        onClick={handleApproveRequest}
                        disabled={processing || !adminResponse.trim()}
                        className="flex-1"
                        size="sm"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {processing ? 'Processing...' : 'Approve'}
                      </Button>
                      <Button
                        onClick={handleRejectRequest}
                        disabled={processing || !adminResponse.trim()}
                        variant="destructive"
                        className="flex-1"
                        size="sm"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        {processing ? 'Processing...' : 'Reject'}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {/* Processed Requests - Collapsed */}
          {processedRequests.length > 0 && (
            <div className="space-y-2 pt-2 border-t">
              <div className="text-xs font-medium text-muted-foreground">
                Request History ({processedRequests.length})
              </div>
              {processedRequests.map((request) => (
                <div 
                  key={request.id}
                  className="p-2 border rounded text-xs bg-muted/20"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{request.event_name}</span>
                    {getStatusBadge(request.status)}
                  </div>
                  <p className="text-muted-foreground line-clamp-2">{request.customer_comments}</p>
                </div>
              ))}
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  // Full standalone mode (original behavior)
  return (
    <div className="space-y-4">
      {/* Pending Requests - High Priority */}
      {pendingRequests.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/30">
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
                          {request.request_type.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        From: {request.customer_email}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(request.status)}
                      <Badge variant="outline" className="text-xs">
                        {request.priority} priority
                      </Badge>
                    </div>
                  </div>

                   <ChangesSummaryCard
                    originalDetails={request.original_details}
                    requestedChanges={request.requested_changes}
                    customerComments={request.customer_comments}
                    estimatedCostChange={request.estimated_cost_change}
                  />

                  {/* Action Panel for Selected Request */}
                  {selectedRequest?.id === request.id && request.status === 'pending' && (
                    <div className="mt-4 pt-4 border-t space-y-3">
                      <div>
                        <Label htmlFor="admin-response" className="text-sm font-medium">
                          Admin Response *
                        </Label>
                        <Textarea
                          id="admin-response"
                          value={adminResponse}
                          onChange={(e) => setAdminResponse(e.target.value)}
                          placeholder="Explain how you'll handle this request and when the customer can expect the updated quote..."
                          className="mt-1"
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label htmlFor="cost-change" className="text-sm font-medium">
                          Cost Impact (in cents)
                        </Label>
                        <Input
                          id="cost-change"
                          type="number"
                          value={costChange}
                          onChange={(e) => setCostChange(e.target.value)}
                          placeholder="Enter cost change in cents (e.g., 500 for $5.00)"
                          className="mt-1"
                        />
                        {parseInt(costChange) !== 0 && (
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            Impact: {formatCurrency(parseInt(costChange))} {parseInt(costChange) > 0 ? 'increase' : 'decrease'}
                          </p>
                        )}
                      </div>

                      <Separator />

                      <div className="flex gap-2">
                        <Button
                          onClick={handleApproveRequest}
                          disabled={processing || !adminResponse.trim()}
                          className="flex-1"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          {processing ? 'Processing...' : 'Approve & Update Quote'}
                        </Button>
                        <Button
                          onClick={handleRejectRequest}
                          disabled={processing || !adminResponse.trim()}
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
    </div>
  );
}
