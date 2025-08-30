import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { CustomerStatusTimeline } from '@/components/customer/CustomerStatusTimeline';
import { CustomerDocuments } from '@/components/customer/CustomerDocuments';
import { CustomerPaymentSchedule } from '@/components/customer/CustomerPaymentSchedule';
import { ChangeRequestModal } from '@/components/customer/ChangeRequestModal';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Calendar, 
  DollarSign, 
  FileText, 
  MapPin, 
  Users, 
  Clock,
  Edit,
  Mail,
  Phone,
  ChevronRight
} from 'lucide-react';

interface CustomerData {
  quote: any;
  invoice: any;
  payments: any[];
  documents: any[];
  changeRequests: any[];
}

export function CustomerPortal() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [showChangeRequest, setShowChangeRequest] = useState(false);
  const { toast } = useToast();
  
  const email = searchParams.get('email');
  const invoiceId = searchParams.get('invoice_id');

  useEffect(() => {
    if (email || invoiceId) {
      fetchCustomerData();
    }
  }, [email, invoiceId]);

  const fetchCustomerData = async () => {
    setLoading(true);
    try {
      // Fetch quote and invoice data
      let query = supabase
        .from('invoices')
        .select(`
          *,
          quote_requests!inner(*),
          customers!inner(*)
        `);

      if (email) {
        query = query.eq('customers.email', email);
      } else if (invoiceId) {
        query = query.eq('id', invoiceId);
      }

      const { data: invoiceData, error: invoiceError } = await query.single();
      
      if (invoiceError) throw invoiceError;

      // Fetch related data
      const [paymentsResult, documentsResult, changeRequestsResult] = await Promise.all([
        supabase
          .from('payment_transactions')
          .select('*')
          .eq('invoice_id', invoiceData.id),
        
        // Mock documents for now - would be from storage
        Promise.resolve({ data: [], error: null }),
        
        supabase
          .from('change_requests')
          .select('*')
          .eq('invoice_id', invoiceData.id)
          .order('created_at', { ascending: false })
      ]);

      setCustomerData({
        quote: invoiceData.quote_requests,
        invoice: invoiceData,
        payments: paymentsResult.data || [],
        documents: documentsResult.data || [],
        changeRequests: changeRequestsResult.data || []
      });

    } catch (error) {
      console.error('Error fetching customer data:', error);
      toast({
        title: "Error",
        description: "Failed to load your information. Please try again.",
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getNextStepGuidance = () => {
    if (!customerData) return null;
    
    const status = customerData.invoice.status;
    
    switch (status) {
      case 'sent':
        return {
          title: 'Review Your Estimate',
          description: 'Please review the details of your catering estimate and let us know if you have any questions.',
          action: 'Questions or changes needed?',
          actionButton: 'Request Changes'
        };
      case 'viewed':
        return {
          title: 'Waiting for Your Approval',
          description: 'We\'re ready to move forward once you approve the estimate.',
          action: 'Ready to proceed?',
          actionButton: 'Contact Us to Approve'
        };
      case 'approved':
        return {
          title: 'Payment Required',
          description: 'Your estimate has been approved! Please submit your deposit to secure your event date.',
          action: 'Secure your date',
          actionButton: 'Make Payment'
        };
      case 'deposit_paid':
        return {
          title: 'Event Confirmed!',
          description: 'Thank you for your deposit. Your event is confirmed and we\'ll be in touch with final details.',
          action: 'Have questions?',
          actionButton: 'Contact Us'
        };
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your information...</p>
        </div>
      </div>
    );
  }

  if (!customerData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Information Not Found</h2>
            <p className="text-muted-foreground mb-4">
              We couldn't find your information. Please check your link or contact us for assistance.
            </p>
            <Button onClick={() => window.location.href = 'mailto:soultrainseatery@gmail.com'}>
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const nextStep = getNextStepGuidance();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {customerData.quote.event_name}
              </h1>
              <p className="text-muted-foreground">
                Event portal for {customerData.quote.contact_name}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge 
                status={customerData.invoice.status} 
                isDraft={customerData.invoice.is_draft}
                size="lg"
              />
              <Button
                onClick={() => setShowChangeRequest(true)}
                variant="outline"
                size="sm"
              >
                <Edit className="h-4 w-4 mr-2" />
                Request Changes
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Next Steps Banner */}
        {nextStep && (
          <Card className="mb-8 border-l-4 border-l-primary bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-lg mb-1">{nextStep.title}</h3>
                  <p className="text-muted-foreground mb-2">{nextStep.description}</p>
                  <p className="text-sm font-medium text-primary">{nextStep.action}</p>
                </div>
                <Button className="w-fit">
                  {nextStep.actionButton}
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Event Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Event Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{formatDate(customerData.quote.event_date)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{customerData.quote.start_time || 'Time TBD'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{customerData.quote.guest_count} guests</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{customerData.quote.location}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Estimate Total:</span>
                <span className="font-semibold">{formatCurrency(customerData.invoice.total_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status:</span>
                <StatusBadge 
                  status={customerData.invoice.status} 
                  isDraft={customerData.invoice.is_draft}
                  size="sm"
                />
              </div>
              {customerData.invoice.due_date && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Due Date:</span>
                  <span className="text-sm">{formatDate(customerData.invoice.due_date)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="h-5 w-5 text-purple-600" />
                Contact Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{customerData.quote.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{customerData.quote.phone}</span>
              </div>
              <div className="pt-2">
                <Button variant="outline" size="sm" className="w-full">
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Catering Team
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="timeline" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="timeline">Status & Timeline</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="changes">Change Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="timeline">
            <CustomerStatusTimeline 
              invoice={customerData.invoice}
              quote={customerData.quote}
            />
          </TabsContent>

          <TabsContent value="documents">
            <CustomerDocuments 
              invoice={customerData.invoice}
              documents={customerData.documents}
            />
          </TabsContent>

          <TabsContent value="payments">
            <CustomerPaymentSchedule 
              invoice={customerData.invoice}
              payments={customerData.payments}
            />
          </TabsContent>

          <TabsContent value="changes">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Change Requests</CardTitle>
                  <Button onClick={() => setShowChangeRequest(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    New Request
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {customerData.changeRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium mb-2">No Change Requests</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      You haven't submitted any change requests yet.
                    </p>
                    <Button onClick={() => setShowChangeRequest(true)}>
                      Submit Your First Request
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {customerData.changeRequests.map((request) => (
                      <Card key={request.id} className="border-l-4 border-l-orange-400">
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">{request.request_type}</h4>
                            <Badge variant="outline">{request.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {request.customer_comments}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Submitted {formatDate(request.created_at)}
                          </p>
                          {request.admin_response && (
                            <div className="mt-3 p-3 bg-muted rounded">
                              <p className="text-sm font-medium mb-1">Response:</p>
                              <p className="text-sm">{request.admin_response}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Change Request Modal */}
      <ChangeRequestModal
        isOpen={showChangeRequest}
        onClose={() => setShowChangeRequest(false)}
        invoiceId={customerData.invoice.id}
        customerEmail={customerData.quote.email}
        onSubmit={fetchCustomerData}
      />
    </div>
  );
}

export default CustomerPortal;