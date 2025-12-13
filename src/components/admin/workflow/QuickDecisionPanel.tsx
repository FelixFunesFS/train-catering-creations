/**
 * QuickDecisionPanel - Streamlined 2-click approval interface for admins
 * Auto-calculates costs, provides templates, handles common scenarios instantly
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  Zap,
  DollarSign,
  AlertTriangle,
  GitCompare
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { AutoApprovalEngine } from '@/services/AutoApprovalEngine';
import { ResponseTemplateService } from '@/services/ResponseTemplates';
import { useProcessChangeRequest } from '@/hooks/useChangeRequests';
import { useEstimateVersioning } from '@/hooks/useEstimateVersioning';
import { UnifiedLineItemsTable } from '@/components/shared/UnifiedLineItemsTable';

interface QuickDecisionPanelProps {
  invoiceId: string;
  onChangeProcessed?: () => void;
}

export function QuickDecisionPanel({ invoiceId, onChangeProcessed }: QuickDecisionPanelProps) {
  const [changeRequests, setChangeRequests] = useState<any[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [quote, setQuote] = useState<any>(null);
  const [autoApprovalResult, setAutoApprovalResult] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [adminResponse, setAdminResponse] = useState('');
  const [costChange, setCostChange] = useState('0');
  const [loading, setLoading] = useState(true);
  const [showComparison, setShowComparison] = useState(false);

  const { processing, approveChangeRequest, rejectChangeRequest } = useProcessChangeRequest();
  
  // Get versioning data for comparison view
  const { versions, generateLineDiff } = useEstimateVersioning({
    invoiceId: invoiceId || '',
    onVersionChanged: () => {}
  });

  useEffect(() => {
    fetchData();
  }, [invoiceId]);

  useEffect(() => {
    if (selectedRequest && quote) {
      const result = AutoApprovalEngine.evaluate(
        selectedRequest.requested_changes,
        quote,
        selectedRequest.request_type
      );
      setAutoApprovalResult(result);
      
      if (result.suggestedResponse) {
        setAdminResponse(result.suggestedResponse);
      }
      if (result.costImpact !== undefined) {
        setCostChange(result.costImpact.toString());
      }
    }
  }, [selectedRequest, quote]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const { data: requests } = await supabase
        .from('change_requests')
        .select('*')
        .eq('invoice_id', invoiceId)
        .eq('workflow_status', 'pending')
        .order('created_at', { ascending: false });

      const { data: invoice } = await supabase
        .from('invoices')
        .select('quote_request_id')
        .eq('id', invoiceId)
        .single();

      if (invoice?.quote_request_id) {
        const { data: quoteData } = await supabase
          .from('quote_requests')
          .select('*')
          .eq('id', invoice.quote_request_id)
          .single();
        
        setQuote(quoteData);
      }

      setChangeRequests(requests || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load change requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = ResponseTemplateService.getTemplate(templateId);
    if (template) {
      setAdminResponse(template.message);
    }
  };

  const handleAutoApprove = async () => {
    if (!selectedRequest || !autoApprovalResult?.canAutoApprove) return;

    await approveChangeRequest(selectedRequest, {
      adminResponse: adminResponse || autoApprovalResult.suggestedResponse,
      finalCostChange: autoApprovalResult.costImpact || 0
    });

    setSelectedRequest(null);
    await fetchData();
    onChangeProcessed?.();
  };

  const handleQuickApprove = async () => {
    if (!selectedRequest || !adminResponse.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a response",
        variant: "destructive"
      });
      return;
    }

    await approveChangeRequest(selectedRequest, {
      adminResponse,
      finalCostChange: parseInt(costChange) || 0
    });

    setSelectedRequest(null);
    setAdminResponse('');
    setCostChange('0');
    await fetchData();
    onChangeProcessed?.();
  };

  const handleQuickReject = async () => {
    if (!selectedRequest || !adminResponse.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a reason",
        variant: "destructive"
      });
      return;
    }

    await rejectChangeRequest(selectedRequest, adminResponse);

    setSelectedRequest(null);
    setAdminResponse('');
    await fetchData();
    onChangeProcessed?.();
  };

  if (loading) {
    return <Card><CardContent className="py-8 text-center">Loading...</CardContent></Card>;
  }

  if (changeRequests.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No pending change requests
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {changeRequests.map((request) => (
        <Card 
          key={request.id}
          className={`cursor-pointer transition-all ${
            selectedRequest?.id === request.id ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => setSelectedRequest(request)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span className="font-medium">{request.customer_email}</span>
                </div>
                <p className="text-sm text-muted-foreground">{request.customer_comments}</p>
              </div>
              <Badge>{request.request_type}</Badge>
            </div>

            {selectedRequest?.id === request.id && (
              <>
                {/* Line Item Preview Toggle */}
                <div className="mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowComparison(!showComparison)}
                    className="gap-2 w-full"
                  >
                    <GitCompare className="h-4 w-4" />
                    {showComparison ? 'Hide' : 'Show'} Line Item Preview
                  </Button>
                </div>

                {/* Comparison View */}
                {showComparison && versions.length >= 2 && (
                  <Card className="mb-4 bg-muted/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">📊 Before vs After Changes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <UnifiedLineItemsTable
                        items={(versions[versions.length - 1].line_items as any[]) || []}
                        mode="view"
                        changeData={generateLineDiff(versions[versions.length - 2], versions[versions.length - 1])}
                        groupByCategory={true}
                      />
                    </CardContent>
                  </Card>
                )}

                {autoApprovalResult && (
                  <Card className={`mb-4 ${autoApprovalResult.canAutoApprove ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' : 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800'}`}>
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2">
                        {autoApprovalResult.canAutoApprove ? (
                          <Zap className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {autoApprovalResult.canAutoApprove ? 'Auto-Approval Available' : 'Manual Review Required'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">{autoApprovalResult.reason}</p>
                          {autoApprovalResult.costImpact !== undefined && (
                            <div className="flex items-center gap-1 mt-2 text-sm">
                              <DollarSign className="h-3 w-3" />
                              <span>
                                Cost Impact: {autoApprovalResult.costImpact > 0 ? '+' : ''}
                                ${(Math.abs(autoApprovalResult.costImpact) / 100).toFixed(2)}
                              </span>
                            </div>
                          )}
                        </div>
                        {autoApprovalResult.canAutoApprove && (
                          <Button 
                            size="sm"
                            onClick={handleAutoApprove}
                            disabled={processing}
                          >
                            <Zap className="h-3 w-3 mr-1" />
                            Auto-Approve
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Separator className="my-4" />

                <div className="space-y-3">
                  <div>
                    <Label className="text-sm">Response Template</Label>
                    <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select a template..." />
                      </SelectTrigger>
                      <SelectContent>
                        {ResponseTemplateService.getAllTemplates().map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="admin-response">Response</Label>
                    <Textarea
                      id="admin-response"
                      value={adminResponse}
                      onChange={(e) => setAdminResponse(e.target.value)}
                      placeholder="Your response to the customer..."
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="cost-change">Cost Change (cents)</Label>
                    <Input
                      id="cost-change"
                      type="number"
                      value={costChange}
                      onChange={(e) => setCostChange(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={handleQuickApprove}
                      disabled={processing || !adminResponse.trim()}
                      className="flex-1"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={handleQuickReject}
                      disabled={processing || !adminResponse.trim()}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
