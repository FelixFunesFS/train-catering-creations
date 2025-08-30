import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ConsolidatedWorkflowManager } from '@/components/admin/ConsolidatedWorkflowManager';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { 
  ArrowLeft,
  Calendar,
  Users,
  MapPin,
  Utensils,
  Clock,
  Phone,
  Mail,
  DollarSign,
  FileText,
  Loader2
} from 'lucide-react';

interface Quote {
  id: string;
  contact_name: string;
  email: string;
  phone: string;
  event_name: string;
  event_date: string;
  event_type: string;
  guest_count: number;
  location: string;
  service_type: string;
  start_time: string;
  status: string;
  workflow_status?: string;
  estimated_total: number;
  final_total: number;
  special_requests?: string;
  dietary_restrictions?: any;
  primary_protein?: string;
  secondary_protein?: string;
  sides?: any;
  appetizers?: any;
  desserts?: any;
  drinks?: any;
  created_at: string;
  updated_at: string;
}

export default function QuoteDetailPage() {
  const { quoteId } = useParams<{ quoteId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [relatedInvoices, setRelatedInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (quoteId) {
      fetchQuoteDetails();
    }
  }, [quoteId]);

  const fetchQuoteDetails = async () => {
    setLoading(true);
    try {
      // Fetch quote details
      const { data: quoteData, error: quoteError } = await supabase
        .from('quote_requests')
        .select('*')
        .eq('id', quoteId)
        .single();

      if (quoteError) throw quoteError;
      if (!quoteData) throw new Error('Quote not found');

      // Fetch related invoices
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select(`
          *,
          customers!customer_id(name, email)
        `)
        .eq('quote_request_id', quoteId)
        .order('created_at', { ascending: false });

      if (invoicesError) throw invoicesError;

      setQuote(quoteData);
      setRelatedInvoices(invoicesData || []);
    } catch (error) {
      console.error('Error fetching quote details:', error);
      toast({
        title: "Error",
        description: "Failed to load quote details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return 'Not specified';
    const time = new Date(`1970-01-01T${timeString}`);
    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading quote details...</span>
        </div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Quote Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The quote you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/admin?tab=quotes')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Quotes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin?tab=quotes')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Quotes
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {quote.event_name}
                </h1>
                <p className="text-muted-foreground">
                  Quote Request #{quote.id.split('-')[0]}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={quote.workflow_status || quote.status} />
              <Button 
                onClick={() => navigate(`/admin/estimate-creation/${quote.id}`)}
                variant="outline"
              >
                <FileText className="h-4 w-4 mr-2" />
                Create Estimate
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Event Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{formatDate(quote.event_date)}</p>
                        <p className="text-sm text-muted-foreground">Event Date</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{formatTime(quote.start_time)}</p>
                        <p className="text-sm text-muted-foreground">Start Time</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{quote.guest_count} guests</p>
                        <p className="text-sm text-muted-foreground">Expected Attendance</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{quote.location}</p>
                        <p className="text-sm text-muted-foreground">Venue</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Utensils className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{quote.service_type}</p>
                        <p className="text-sm text-muted-foreground">Service Type</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{quote.event_type}</p>
                        <p className="text-sm text-muted-foreground">Event Type</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{quote.contact_name}</p>
                        <p className="text-sm text-muted-foreground">Contact Person</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{quote.email}</p>
                        <p className="text-sm text-muted-foreground">Email Address</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{quote.phone}</p>
                        <p className="text-sm text-muted-foreground">Phone Number</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Menu Details */}
            <Card>
              <CardHeader>
                <CardTitle>Menu Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {quote.primary_protein && (
                  <div>
                    <h4 className="font-medium mb-2">Primary Protein</h4>
                    <p className="text-sm text-muted-foreground">{quote.primary_protein}</p>
                  </div>
                )}
                {quote.secondary_protein && (
                  <div>
                    <h4 className="font-medium mb-2">Secondary Protein</h4>
                    <p className="text-sm text-muted-foreground">{quote.secondary_protein}</p>
                  </div>
                )}
                {quote.sides && Array.isArray(quote.sides) && quote.sides.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Sides</h4>
                    <div className="flex flex-wrap gap-2">
                      {quote.sides.map((side, index) => (
                        <Badge key={index} variant="outline">{side}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {quote.appetizers && Array.isArray(quote.appetizers) && quote.appetizers.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Appetizers</h4>
                    <div className="flex flex-wrap gap-2">
                      {quote.appetizers.map((app, index) => (
                        <Badge key={index} variant="outline">{app}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {quote.desserts && Array.isArray(quote.desserts) && quote.desserts.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Desserts</h4>
                    <div className="flex flex-wrap gap-2">
                      {quote.desserts.map((dessert, index) => (
                        <Badge key={index} variant="outline">{dessert}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {quote.drinks && Array.isArray(quote.drinks) && quote.drinks.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Beverages</h4>
                    <div className="flex flex-wrap gap-2">
                      {quote.drinks.map((drink, index) => (
                        <Badge key={index} variant="outline">{drink}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {quote.dietary_restrictions && Array.isArray(quote.dietary_restrictions) && quote.dietary_restrictions.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Dietary Restrictions</h4>
                    <div className="flex flex-wrap gap-2">
                      {quote.dietary_restrictions.map((restriction, index) => (
                        <Badge key={index} variant="secondary">{restriction}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {quote.special_requests && (
                  <div>
                    <h4 className="font-medium mb-2">Special Requests</h4>
                    <p className="text-sm text-muted-foreground">{quote.special_requests}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Related Invoices */}
            {relatedInvoices.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Related Invoices & Estimates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {relatedInvoices.map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{invoice.invoice_number || `Invoice ${invoice.id.split('-')[0]}`}</p>
                          <p className="text-sm text-muted-foreground">
                            {invoice.is_draft ? 'Draft' : 'Finalized'} • Created {new Date(invoice.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold">{formatCurrency(invoice.total_amount)}</span>
                          <StatusBadge status={invoice.workflow_status || invoice.status} size="sm" />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/estimate-preview/${invoice.id}`)}
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Streamlined Workflow */}
            <ConsolidatedWorkflowManager 
              quote={quote} 
              invoice={relatedInvoices[0]} 
              onRefresh={fetchQuoteDetails}
            />

            {/* Pricing Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Pricing Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {quote.estimated_total > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Estimated Total</span>
                    <span className="font-medium">{formatCurrency(quote.estimated_total)}</span>
                  </div>
                )}
                {quote.final_total > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Final Total</span>
                    <span className="font-semibold text-lg">{formatCurrency(quote.final_total)}</span>
                  </div>
                )}
                {relatedInvoices.length > 0 && (
                  <div className="pt-3 border-t">
                    <p className="text-sm font-medium mb-2">Invoice Totals</p>
                    {relatedInvoices.map((invoice) => (
                      <div key={invoice.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {invoice.is_draft ? 'Draft' : 'Final'}
                        </span>
                        <span className="font-medium">{formatCurrency(invoice.total_amount)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quote History */}
            <Card>
              <CardHeader>
                <CardTitle>Quote Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Submitted</span>
                    <span>{new Date(quote.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Updated</span>
                    <span>{new Date(quote.updated_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <StatusBadge status={quote.workflow_status || quote.status} size="sm" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}