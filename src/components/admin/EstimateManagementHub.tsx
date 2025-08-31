import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Eye, Edit, Send, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { EstimateActionService } from '@/services/EstimateActionService';
import { EmailPreviewModal } from '@/components/admin/EmailPreviewModal';
import EstimateCreation from '@/pages/EstimateCreation';

interface Invoice {
  id: string;
  invoice_number: string;
  status: string;
  total_amount: number;
  is_draft: boolean;
  created_at: string;
  customers?: { name: string; email: string };
  quote_requests?: { 
    id: string;
    event_name: string; 
    event_date: string; 
    contact_name: string;
    location?: string;
    guest_count?: number;
  };
}

export function EstimateManagementHub() {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (invoiceId) {
      fetchInvoice();
    }
  }, [invoiceId]);

  const fetchInvoice = async () => {
    if (!invoiceId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          customers(name, email),
          quote_requests(event_name, event_date, contact_name)
        `)
        .eq('id', invoiceId)
        .single();

      if (error) throw error;
      setInvoice(data as any);
    } catch (error) {
      console.error('Error fetching invoice:', error);
      toast({
        title: "Error",
        description: "Failed to load estimate details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (actionId: string, data?: any) => {
    if (!invoice) return;

    setActionLoading(actionId);
    try {
      const result = await EstimateActionService.executeAction(actionId, invoice.id, data);
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        
        // Refresh invoice data
        await fetchInvoice();
        
        // Close email modal if it was open
        if (actionId === 'send') {
          setShowEmailModal(false);
        }
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Action failed:', error);
      toast({
        title: "Error",
        description: "Action failed. Please try again.",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handlePreview = () => {
    if (!invoice) return;
    window.open(`/estimate-preview/${invoice.id}`, '_blank');
  };

  const handleEdit = () => {
    setActiveTab('edit');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading estimate...</div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Estimate not found</div>
      </div>
    );
  }

  const availableActions = EstimateActionService.getAvailableActions(invoice.status);
  const primaryAction = availableActions.find(action => action.isPrimary);
  const secondaryActions = availableActions.filter(action => !action.isPrimary);
  const statusBadge = EstimateActionService.getStatusBadgeProps(invoice.status);

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
              Estimate {invoice.invoice_number || `#${invoice.id.slice(0, 8)}`}
            </h1>
            <p className="text-muted-foreground">
              {invoice.quote_requests?.event_name} • {invoice.customers?.name || invoice.quote_requests?.contact_name}
            </p>
          </div>
          <Badge variant={statusBadge.variant}>
            {statusBadge.label}
          </Badge>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreview}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Preview
          </Button>
          
          {/* Primary Action */}
          {primaryAction && (
            <Button
              onClick={() => {
                if (primaryAction.id === 'send') {
                  setShowEmailModal(true);
                } else {
                  handleAction(primaryAction.id);
                }
              }}
              disabled={actionLoading === primaryAction.id}
              className="flex items-center gap-2"
            >
              {primaryAction.id === 'send' && <Send className="h-4 w-4" />}
              {primaryAction.id === 'follow-up' && <MessageCircle className="h-4 w-4" />}
              {primaryAction.label}
            </Button>
          )}
        </div>
      </div>

      {/* Tabbed Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Estimate Summary */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Estimate Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Customer:</span>
                    <span className="font-medium">{invoice.customers?.name || invoice.quote_requests?.contact_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <span className="font-medium">{invoice.customers?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Event:</span>
                    <span className="font-medium">{invoice.quote_requests?.event_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Event Date:</span>
                    <span className="font-medium">
                      {invoice.quote_requests?.event_date ? new Date(invoice.quote_requests.event_date).toLocaleDateString() : 'Not set'}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-4">
                    <span className="font-semibold">Total Amount:</span>
                    <span className="font-semibold">${(invoice.total_amount / 100).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {secondaryActions.map((action) => (
                    <Button
                      key={action.id}
                      variant={action.variant}
                      size="sm"
                      onClick={() => handleAction(action.id)}
                      disabled={actionLoading === action.id}
                      className="w-full justify-start"
                    >
                      {action.label}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEdit}
                    className="w-full justify-start"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Estimate
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="edit" className="mt-6">
          <div className="h-[calc(100vh-200px)] overflow-hidden">
            <EstimateCreation />
          </div>
        </TabsContent>

        <TabsContent value="communications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Communications</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Communication history will be displayed here.</p>
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

      {/* Email Preview Modal */}
      {showEmailModal && invoice && (
        <EmailPreviewModal
          isOpen={showEmailModal}
          onClose={() => setShowEmailModal(false)}
          estimateData={{
            id: invoice.id,
            invoice_number: invoice.invoice_number || `#${invoice.id.slice(0, 8)}`,
            status: invoice.status,
            total_amount: invoice.total_amount,
            customers: invoice.customers || { name: '', email: '' },
            quote_requests: {
              event_name: invoice.quote_requests?.event_name || '',
              event_date: invoice.quote_requests?.event_date || '',
              location: invoice.quote_requests?.location || '',
              guest_count: invoice.quote_requests?.guest_count || 0
            }
          }}
          lineItems={[]}
          onEmailSent={() => handleAction('send')}
        />
      )}
    </div>
  );
}