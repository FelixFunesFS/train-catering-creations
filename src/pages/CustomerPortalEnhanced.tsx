import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  CheckCircle, 
  Clock, 
  CreditCard, 
  FileText, 
  Calendar,
  MapPin,
  Users,
  Phone,
  Mail,
  Download,
  Eye,
  MessageSquare
} from 'lucide-react';

interface CustomerData {
  quote: any;
  invoice: any;
  estimate: any;
}

export default function CustomerPortalEnhanced() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Auto-fill from URL params
  useEffect(() => {
    const emailParam = searchParams.get('email');
    const codeParam = searchParams.get('code');
    
    if (emailParam) setEmail(emailParam);
    if (codeParam) setAccessCode(codeParam);
    
    // Auto-authenticate if both params are present
    if (emailParam && codeParam) {
      handleAuthentication(emailParam, codeParam);
    }
  }, [searchParams]);

  const handleAuthentication = async (emailValue?: string, codeValue?: string) => {
    const authEmail = emailValue || email;
    const authCode = codeValue || accessCode;
    
    if (!authEmail || !authCode) {
      toast({
        title: "Missing Information",
        description: "Please enter both your email and access code",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Find quote by email and use quote ID as access code verification
      const { data: quotes, error: quoteError } = await supabase
        .from('quote_requests')
        .select('*')
        .eq('email', authEmail);

      if (quoteError) throw quoteError;

      const matchingQuote = quotes?.find(q => q.id.substring(0, 8) === authCode);
      
      if (!matchingQuote) {
        toast({
          title: "Access Denied",
          description: "Invalid email or access code",
          variant: "destructive"
        });
        return;
      }

      // Fetch related invoice and estimate data
      const { data: invoice } = await supabase
        .from('invoices')
        .select('*')
        .eq('quote_request_id', matchingQuote.id)
        .maybeSingle();

      const { data: estimate } = await supabase
        .from('estimate_versions')
        .select('*')
        .eq('invoice_id', invoice?.id)
        .order('version_number', { ascending: false })
        .maybeSingle();

      setCustomerData({
        quote: matchingQuote,
        invoice,
        estimate
      });

      setIsAuthenticated(true);
      toast({
        title: "Welcome!",
        description: "Successfully accessed your event details",
      });

    } catch (error) {
      console.error('Authentication error:', error);
      toast({
        title: "Error",
        description: "Failed to access your information. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveEstimate = async () => {
    if (!customerData?.invoice) return;

    try {
      const { error } = await supabase
        .from('invoices')
        .update({ status: 'approved' })
        .eq('id', customerData.invoice.id);

      if (error) throw error;

      setCustomerData({
        ...customerData,
        invoice: { ...customerData.invoice, status: 'approved' }
      });

      toast({
        title: "Estimate Approved",
        description: "Your estimate has been approved. You can now proceed with payment.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve estimate. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handlePayNow = async () => {
    if (!customerData?.invoice) return;

    try {
      const { data, error } = await supabase.functions.invoke('create-payment-link', {
        body: { 
          invoice_id: customerData.invoice.id,
          amount: customerData.invoice.total_amount 
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create payment link. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getStatusProgress = () => {
    if (!customerData?.quote) return 0;
    
    const statusSteps = ['pending', 'reviewed', 'approved', 'paid', 'confirmed'];
    const currentIndex = statusSteps.indexOf(customerData.quote.status);
    return currentIndex >= 0 ? ((currentIndex + 1) / statusSteps.length) * 100 : 0;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Access Your Event Details</CardTitle>
            <p className="text-muted-foreground">Enter your information to view your quote and estimates</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email Address</label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="accessCode" className="text-sm font-medium">Access Code</label>
              <Input
                id="accessCode"
                placeholder="8-character code from your email"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                maxLength={8}
              />
              <p className="text-xs text-muted-foreground">
                Check your email for the 8-character access code
              </p>
            </div>
            <Button 
              onClick={() => handleAuthentication()} 
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Accessing...' : 'Access My Information'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!customerData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your information...</p>
        </div>
      </div>
    );
  }

  const { quote, invoice, estimate } = customerData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{quote.event_name}</h1>
              <p className="text-gray-600">Event Planning Portal</p>
            </div>
            <Badge variant={quote.status === 'confirmed' ? 'default' : 'outline'} className="text-sm">
              {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Progress Indicator */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Event Planning Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={getStatusProgress()} className="w-full" />
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>Quote Submitted</span>
              <span>Under Review</span>
              <span>Approved</span>
              <span>Payment</span>
              <span>Confirmed</span>
            </div>
          </CardContent>
        </Card>

        {/* Event Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Event Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Event Date</p>
                    <p className="text-muted-foreground">{formatDate(quote.event_date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-muted-foreground">{quote.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Guest Count</p>
                    <p className="text-muted-foreground">{quote.guest_count} guests</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Contact</p>
                    <p className="text-muted-foreground">{quote.contact_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-muted-foreground">{quote.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Event Type</p>
                    <p className="text-muted-foreground">{quote.event_type}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estimate/Invoice Section */}
        {invoice && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                {invoice.status === 'draft' ? 'Estimate' : 'Invoice'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total Amount:</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatCurrency(invoice.total_amount)}
                  </span>
                </div>
                
                {invoice.status === 'sent' && (
                  <div className="flex gap-2">
                    <Button onClick={handleApproveEstimate} className="flex-1">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve Estimate
                    </Button>
                    <Button variant="outline" onClick={() => navigate(`/estimate-preview/${invoice.id}`)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                )}
                
                {invoice.status === 'approved' && (
                  <div className="flex gap-2">
                    <Button onClick={handlePayNow} className="flex-1">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay Now
                    </Button>
                    <Button variant="outline" onClick={() => navigate(`/estimate-preview/${invoice.id}`)}>
                      <Download className="h-4 w-4 mr-2" />
                      Download Invoice
                    </Button>
                  </div>
                )}
                
                {invoice.status === 'paid' && (
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="font-semibold text-green-800">Payment Received!</p>
                    <p className="text-green-600">Your event is confirmed and we're excited to cater for you.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              What Happens Next?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {quote.status === 'pending' && (
                <p className="text-muted-foreground">
                  We're reviewing your quote request and will send you a detailed estimate within 24 hours.
                </p>
              )}
              {quote.status === 'reviewed' && invoice?.status === 'sent' && (
                <p className="text-muted-foreground">
                  Please review your estimate above. Once approved, you can proceed with payment to confirm your event.
                </p>
              )}
              {invoice?.status === 'approved' && (
                <p className="text-muted-foreground">
                  Your estimate is approved! Complete payment to confirm your event booking.
                </p>
              )}
              {invoice?.status === 'paid' && (
                <p className="text-muted-foreground">
                  Thank you for your payment! We'll contact you 1-2 weeks before your event to finalize details.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}