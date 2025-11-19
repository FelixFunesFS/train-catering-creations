import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CustomerInfoCard } from '@/components/admin/CustomerInfoCard';
import { MenuEditForm } from '@/components/admin/MenuEditForm';
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
  const [activeTab, setActiveTab] = useState('details'); // Default to details for read-only view
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

  const handleCreateInvoice = () => {
    // Navigate back to admin with pricing focus
    navigate(`/admin?quoteId=${quoteId}&mode=pricing`);
  };

  const handleStatusUpdate = async (newStatus: 'pending' | 'under_review' | 'quoted' | 'confirmed' | 'completed' | 'cancelled') => {
    try {
      const { error } = await supabase
        .from('quote_requests')
        .update({ workflow_status: newStatus })
        .eq('id', quoteId);

      if (error) throw error;

      setQuote({ ...quote, workflow_status: newStatus });
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
    switch (quote.workflow_status) {
      case 'pending':
        return { action: () => handleStatusUpdate('under_review'), label: 'Mark as Under Review', icon: CheckCircle };
      case 'under_review':
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
              <Badge variant={quote.workflow_status === 'confirmed' ? 'default' : 'outline'}>
                {quote.workflow_status}
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={handleCreateInvoice} className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Edit Pricing
          </Button>
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
            <TabsList className="grid w-full grid-cols-4">
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

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}