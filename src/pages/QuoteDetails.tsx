import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CustomerInfoCard } from '@/components/admin/CustomerInfoCard';
import { MenuEditForm } from '@/components/admin/MenuEditForm';
import { CustomerWorkflowManager } from '@/components/admin/CustomerWorkflowManager';
import { AutomatedPricingEngine } from '@/components/admin/AutomatedPricingEngine';
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
  const [activeTab, setActiveTab] = useState('details');
  const { toast } = useToast();

  useEffect(() => {
    if (quoteId) {
      fetchQuote();
    }
  }, [quoteId]);

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
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="details" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Details
              </TabsTrigger>
              <TabsTrigger value="menu" className="flex items-center gap-2">
                <ChefHat className="h-4 w-4" />
                Menu
              </TabsTrigger>
              <TabsTrigger value="pricing" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Pricing
              </TabsTrigger>
              <TabsTrigger value="notes" className="flex items-center gap-2">
                <StickyNote className="h-4 w-4" />
                Notes
              </TabsTrigger>
              <TabsTrigger value="communication" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Messages
              </TabsTrigger>
            </TabsList>

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

        <TabsContent value="pricing">
          <AutomatedPricingEngine
            quote={quote}
            onPricingUpdate={(pricing) => {
              console.log('Pricing updated:', pricing);
            }}
            onValidationComplete={(validation) => {
              console.log('Validation complete:', validation);
            }}
          />
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

        <TabsContent value="communication">
          <Card>
            <CardHeader>
              <CardTitle>Communication</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Communication panel coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>

          </Tabs>
        </div>
        
        {/* Sidebar - Customer Workflow */}
        <div className="lg:col-span-1">
          <CustomerWorkflowManager 
            quote={quote} 
            invoice={invoice}
            onRefresh={fetchQuote}
          />
        </div>
      </div>
    </div>
  );
}