import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EstimatePreviewModal } from '@/components/admin/EstimatePreviewModal';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Eye, Send, DollarSign, CheckCircle2, Clock } from 'lucide-react';

interface StreamlinedEstimateInterfaceProps {
  quoteId?: string;
  invoiceId?: string;
}

interface EstimateData {
  id: string;
  document_type: 'estimate' | 'invoice';
  status: string;
  total_amount: number;
  customer_email: string;
  customer_name: string;
  event_name: string;
  event_date: string;
  line_items: any[];
}

export function StreamlinedEstimateInterface({ quoteId, invoiceId }: StreamlinedEstimateInterfaceProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [estimateData, setEstimateData] = useState<EstimateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (invoiceId) {
      fetchEstimate();
    } else if (quoteId) {
      checkOrCreateEstimate();
    }
  }, [invoiceId, quoteId]);

  const fetchEstimate = async () => {
    if (!invoiceId) return;
    
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          customers!customer_id(*),
          quote_requests!quote_request_id(*),
          invoice_line_items(*)
        `)
        .eq('id', invoiceId)
        .single();

      if (error) throw error;
      
      setEstimateData({
        id: data.id,
        document_type: (data.document_type === 'invoice' ? 'invoice' : 'estimate') as 'estimate' | 'invoice',
        status: data.status,
        total_amount: data.total_amount,
        customer_email: data.customers?.email || '',
        customer_name: data.customers?.name || data.quote_requests?.contact_name || '',
        event_name: data.quote_requests?.event_name || '',
        event_date: data.quote_requests?.event_date || '',
        line_items: data.invoice_line_items || []
      });
    } catch (error) {
      console.error('Error fetching estimate:', error);
      toast({
        title: "Error",
        description: "Failed to load estimate data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const checkOrCreateEstimate = async () => {
    if (!quoteId) return;
    
    try {
      // Check if estimate already exists
      const { data: existingEstimate } = await supabase
        .from('invoices')
        .select('id')
        .eq('quote_request_id', quoteId)
        .maybeSingle();

      if (existingEstimate) {
        // Redirect to existing estimate
        navigate(`/admin/estimates/${existingEstimate.id}`, { replace: true });
        return;
      }

      // No estimate exists, redirect to creation
      navigate(`/admin/estimates/quote/${quoteId}`, { replace: true });
    } catch (error) {
      console.error('Error checking estimate:', error);
      toast({
        title: "Error",
        description: "Failed to check estimate status",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendEstimate = async () => {
    if (!estimateData) return;

    try {
      const { error } = await supabase.functions.invoke('send-custom-invoice-email', {
        body: {
          invoice_id: estimateData.id,
          custom_subject: `Your Estimate - ${estimateData.event_name}`,
          custom_message: `Dear ${estimateData.customer_name},\n\nThank you for considering Soul Train's Eatery for your upcoming ${estimateData.event_name}. Please review the attached estimate.\n\nWe look forward to making your event delicious!\n\nBest regards,\nSoul Train's Eatery Team`
        }
      });

      if (error) throw error;

      toast({
        title: "Estimate sent!",
        description: "The estimate has been emailed to the customer",
      });

      // Refresh data
      await fetchEstimate();
    } catch (error) {
      console.error('Error sending estimate:', error);
      toast({
        title: "Failed to send estimate",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  const handleCreatePaymentLink = async () => {
    if (!estimateData) return;

    try {
      const { data, error } = await supabase.functions.invoke('create-payment-link', {
        body: {
          invoice_id: estimateData.id,
          amount: estimateData.total_amount,
          customer_email: estimateData.customer_email,
          description: `Payment for ${estimateData.event_name}`
        }
      });

      if (error) throw error;

      // Copy link to clipboard
      await navigator.clipboard.writeText(data.url);
      
      toast({
        title: "Payment link created!",
        description: "Link copied to clipboard",
      });
    } catch (error) {
      console.error('Error creating payment link:', error);
      toast({
        title: "Failed to create payment link",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return { variant: 'secondary' as const, label: 'Draft', icon: Clock };
      case 'sent':
        return { variant: 'default' as const, label: 'Sent', icon: Send };
      case 'approved':
        return { variant: 'default' as const, label: 'Approved', icon: CheckCircle2 };
      case 'paid':
        return { variant: 'default' as const, label: 'Paid', icon: DollarSign };
      default:
        return { variant: 'secondary' as const, label: status, icon: Clock };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!estimateData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Estimate not found</div>
      </div>
    );
  }

  const statusBadge = getStatusBadge(estimateData.status);
  const StatusIcon = statusBadge.icon;

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {estimateData.document_type === 'estimate' ? 'Estimate' : 'Invoice'} #{estimateData.id.slice(0, 8)}
            </h1>
            <p className="text-muted-foreground">
              {estimateData.event_name} • {estimateData.customer_name}
            </p>
          </div>
          <Badge variant={statusBadge.variant} className="flex items-center gap-1">
            <StatusIcon className="h-3 w-3" />
            {statusBadge.label}
          </Badge>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowPreviewModal(true)}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          {estimateData.status === 'draft' && (
            <Button onClick={handleSendEstimate}>
              <Send className="h-4 w-4 mr-2" />
              Send to Customer
            </Button>
          )}
          {estimateData.status !== 'draft' && (
            <Button onClick={handleCreatePaymentLink}>
              <DollarSign className="h-4 w-4 mr-2" />
              Create Payment Link
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Summary Card */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Estimate Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Customer:</span>
                    <span className="font-medium">{estimateData.customer_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <span className="font-medium">{estimateData.customer_email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Event:</span>
                    <span className="font-medium">{estimateData.event_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Event Date:</span>
                    <span className="font-medium">
                      {estimateData.event_date ? new Date(estimateData.event_date).toLocaleDateString() : 'Not set'}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-4">
                    <span className="font-semibold">Total Amount:</span>
                    <span className="font-semibold text-lg text-primary">
                      ${(estimateData.total_amount / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setShowPreviewModal(true)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Estimate
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate(`/admin/estimates/quote/${quoteId || 'edit'}`)}
                  >
                    Edit Details
                  </Button>
                  {estimateData.status !== 'draft' && (
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={handleCreatePaymentLink}
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Payment Link
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="details" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Line Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {estimateData.line_items.map((item, index) => (
                  <div key={index} className="flex justify-between items-start border-b pb-2">
                    <div>
                      <div className="font-medium">{item.title}</div>
                      {item.description && (
                        <div className="text-sm text-muted-foreground">{item.description}</div>
                      )}
                      <div className="text-sm text-muted-foreground">
                        {item.quantity} × ${(item.unit_price / 100).toFixed(2)}
                      </div>
                    </div>
                    <div className="font-medium">${(item.total_price / 100).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Status History</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Status change history will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Preview Modal */}
      {showPreviewModal && estimateData && (
        <EstimatePreviewModal
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          estimate={{
            id: estimateData.id,
            invoice_number: `EST-${estimateData.id.slice(0, 8)}`,
            status: estimateData.status,
            total_amount: estimateData.total_amount,
            customer_name: estimateData.customer_name,
            customer_email: estimateData.customer_email,
            event_details: {
              name: estimateData.event_name,
              date: estimateData.event_date
            },
            line_items: estimateData.line_items
          }}
          quote={null}
          onEmailSent={() => {
            setShowPreviewModal(false);
            fetchEstimate();
          }}
        />
      )}
    </div>
  );
}