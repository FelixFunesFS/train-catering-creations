import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CustomerInfoCard } from '@/components/admin/CustomerInfoCard';
import { MenuEditForm } from '@/components/admin/MenuEditForm';
import { ConsolidatedWorkflowManager } from '@/components/admin/ConsolidatedWorkflowManager';
import { ManualPricingForm } from '@/components/admin/ManualPricingForm';
import { RevisionHistoryPanel } from '@/components/admin/RevisionHistoryPanel';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  ArrowLeft, 
  Edit, 
  FileText, 
  CreditCard,
  Settings,
  ChefHat,
  StickyNote,
  MessageSquare,
  Calendar,
  CheckCircle
} from 'lucide-react';

export default function QuoteDetails() {
  const { quoteId } = useParams();
  const navigate = useNavigate();
  const [quote, setQuote] = useState<any>(null);
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('pricing'); // Default to pricing for new requests
  const { toast } = useToast();

  useEffect(() => {
    if (quoteId) {
      fetchQuote();
    }
  }, [quoteId]);

  // Auto-set tab based on quote status and whether pricing is complete
  useEffect(() => {
    if (quote) {
      // For new/pending requests without pricing, default to pricing tab
      if ((quote.status === 'pending' || quote.status === 'under_review') && (!quote.estimated_total || quote.estimated_total === 0)) {
        setActiveTab('pricing');
      }
      // For requests with pricing but not reviewed, default to workflow
      else if (quote.status === 'pending' && quote.estimated_total > 0) {
        setActiveTab('workflow');
      }
      // For other statuses, keep current tab or default to details
      else if (activeTab === 'pricing' && quote.estimated_total > 0) {
        setActiveTab('workflow');
      }
    }
  }, [quote?.status, quote?.estimated_total]);

  const fetchQuote = async () => {
    try {
      const { data: quoteData, error: quoteError } = await supabase
        .from('quote_requests')
        .select('*')
        .eq('id', quoteId)
        .single();

      if (quoteError) throw quoteError;
      setQuote(quoteData);

      // Fetch related invoice if exists
      const { data: invoiceData } = await supabase
        .from('invoices')
        .select('*')
        .eq('quote_request_id', quoteId)
        .maybeSingle();

      setInvoice(invoiceData);
    } catch (error) {
      console.error('Error fetching quote:', error);
      toast({
        title: "Error",
        description: "Failed to load quote details",
        variant: "destructive"
      });
      navigate('/admin/unified');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = async () => {
    try {
      await supabase.functions.invoke('generate-invoice-from-quote', {
        body: { quote_request_id: quoteId }
      });
      
      toast({
        title: "Invoice Created",
        description: "Invoice has been generated from the quote",
      });
      
      // Navigate to invoice creation page
      navigate(`/admin/invoice-creation/${quoteId}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create invoice. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleStatusUpdate = async (newStatus: 'pending' | 'reviewed' | 'quoted' | 'confirmed' | 'completed' | 'cancelled') => {
    try {
      const { error } = await supabase
        .from('quote_requests')
        .update({ status: newStatus })
        .eq('id', quoteId);

      if (error) throw error;

      setQuote({ ...quote, status: newStatus });
      toast({
        title: "Status Updated",
        description: `Quote status updated to ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Quote not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: 'Quotes', href: '/admin/unified?tab=quotes' },
    { label: quote.event_name, current: true }
  ];

  const getNextAction = () => {
    switch (quote.status) {
      case 'pending':
        return { action: () => handleStatusUpdate('reviewed'), label: 'Mark as Reviewed', icon: CheckCircle };
      case 'reviewed':
        return { action: handleCreateInvoice, label: 'Create Invoice', icon: FileText };
      default:
        return null;
    }
  };

  const nextAction = getNextAction();

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/unified?tab=quotes')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Quotes
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{quote.event_name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-muted-foreground">Quote Request Details</p>
              <Badge variant={quote.status === 'confirmed' ? 'default' : 'outline'}>
                {quote.status}
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {nextAction && (
            <Button onClick={nextAction.action}>
              <nextAction.icon className="h-4 w-4 mr-2" />
              {nextAction.label}
            </Button>
          )}
          <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
            <Edit className="h-4 w-4 mr-2" />
            {isEditing ? 'Cancel Edit' : 'Edit Quote'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="pricing" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Pricing
                {(!quote?.estimated_total || quote.estimated_total === 0) && (
                  <span className="w-2 h-2 bg-primary rounded-full ml-1"></span>
                )}
              </TabsTrigger>
              <TabsTrigger value="workflow" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Workflow
              </TabsTrigger>
              <TabsTrigger value="details" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Details
              </TabsTrigger>
              <TabsTrigger value="menu" className="flex items-center gap-2">
                <ChefHat className="h-4 w-4" />
                Menu
              </TabsTrigger>
              <TabsTrigger value="notes" className="flex items-center gap-2">
                <StickyNote className="h-4 w-4" />
                Notes
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pricing">
              <div className="space-y-6">
                <ManualPricingForm
                  quote={quote}
                  onPricingUpdate={(total) => {
                    setQuote({ ...quote, estimated_total: total });
                    // Auto-switch to workflow tab after pricing is complete
                    if (total > 0) {
                      setTimeout(() => setActiveTab('workflow'), 1500);
                    }
                  }}
                />
                
                {/* Pricing completion hint */}
                {(!quote?.estimated_total || quote.estimated_total === 0) && (
                  <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 text-primary">
                        <CreditCard className="h-5 w-5" />
                        <div>
                          <p className="font-medium">Complete pricing to continue</p>
                          <p className="text-sm text-muted-foreground">Add line items and save to proceed with the workflow</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="workflow">
              <ConsolidatedWorkflowManager 
                quote={quote} 
                invoice={invoice}
                onRefresh={fetchQuote}
              />
            </TabsContent>

            <TabsContent value="details">
              <CustomerInfoCard quote={quote} />
            </TabsContent>

            <TabsContent value="menu">
              <Card>
                <CardHeader>
                  <CardTitle>Menu Details</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <MenuEditForm
                      quote={quote}
                      onSave={(menuData) => {
                        setQuote({ ...quote, ...menuData });
                        setIsEditing(false);
                        toast({
                          title: "Success",
                          description: "Menu updated successfully"
                        });
                      }}
                      onCancel={() => setIsEditing(false)}
                    />
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold mb-2">Primary Protein</h4>
                          <p className="text-muted-foreground">{quote.primary_protein || 'Not specified'}</p>
                        </div>
                        {quote.secondary_protein && (
                          <div>
                            <h4 className="font-semibold mb-2">Secondary Protein</h4>
                            <p className="text-muted-foreground">{quote.secondary_protein}</p>
                          </div>
                        )}
                      </div>
                      {/* Add more menu details as needed */}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes">
              <Card>
                <CardHeader>
                  <CardTitle>Admin Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Admin notes functionality coming soon.</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <RevisionHistoryPanel quoteId={quoteId || ''} />
            </TabsContent>

          </Tabs>
        </div>
        
        {/* Sidebar - Summary & Quick Actions */}
        <div className="lg:col-span-1 space-y-6">
          {/* Quick Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Quick Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">
                    {quote?.guest_count || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Guests</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    ${((quote?.estimated_total || 0) / 100).toFixed(0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Estimate</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Event Date:</span>
                  <span className="text-sm font-medium">
                    {quote?.event_date ? new Date(quote.event_date).toLocaleDateString() : 'TBD'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Status:</span>
                  <Badge variant={quote?.status === 'confirmed' ? 'default' : 'outline'}>
                    {quote?.status || 'pending'}
                  </Badge>
                </div>
              </div>

              {/* Pricing Status Indicator */}
              {(!quote?.estimated_total || quote.estimated_total === 0) && (
                <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-2 text-primary text-sm">
                    <CreditCard className="h-4 w-4" />
                    <span className="font-medium">Pricing Required</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Complete pricing to continue workflow
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Workflow shortcut when pricing is complete */}
          {quote?.estimated_total > 0 && activeTab === 'pricing' && (
            <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
              <CardContent className="pt-6">
                <div className="text-center space-y-3">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto" />
                  <div>
                    <p className="font-medium text-green-900 dark:text-green-100">Pricing Complete!</p>
                    <p className="text-sm text-green-700 dark:text-green-200">Ready for next steps</p>
                  </div>
                  <Button 
                    onClick={() => setActiveTab('workflow')}
                    className="w-full"
                    variant="outline"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    View Workflow
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}