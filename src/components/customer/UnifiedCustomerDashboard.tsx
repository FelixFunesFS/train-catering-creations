import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CustomerNotificationCenter } from './CustomerNotificationCenter';
import { EstimateComparisonView } from './EstimateComparisonView';
import { QuoteApprovalFlow } from './QuoteApprovalFlow';
import { ChangeRequestForm } from './ChangeRequestForm';
import { PaymentPortal } from './PaymentPortal';
import { 
  CheckCircle, 
  Clock, 
  FileText, 
  Download,
  CreditCard,
  MessageSquare,
  Star,
  Edit,
  Bell,
  History,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  ChevronRight
} from 'lucide-react';

interface CustomerData {
  quote?: {
    id: string;
    contact_name: string;
    email: string;
    event_name: string;
    event_date: string;
    guest_count: number;
    location: string;
    service_type: string;
    estimated_total: number;
    status: string;
    [key: string]: any;
  };
  invoice?: {
    id: string;
    invoice_number: string;
    total_amount: number;
    due_date: string;
    status: string;
    quote_request_id?: string;
    [key: string]: any;
  };
  customer?: {
    id: string;
    name: string;
    email: string;
    [key: string]: any;
  };
}

export function UnifiedCustomerDashboard() {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<CustomerData>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showComparison, setShowComparison] = useState(false);
  const { toast } = useToast();

  const quoteId = searchParams.get('quote');
  const invoiceId = searchParams.get('invoice');
  const customerEmail = searchParams.get('email');
  const token = searchParams.get('token');

  useEffect(() => {
    if (quoteId || invoiceId || customerEmail || token) {
      fetchCustomerData();
    }
  }, [quoteId, invoiceId, customerEmail, token]);

  const fetchCustomerData = async () => {
    setLoading(true);
    try {
      let customerData: CustomerData = {};

      if (token) {
        // Token-based access
        const { data: invoiceData, error } = await supabase
          .from('invoices')
          .select(`
            *,
            quote_requests (*)
          `)
          .eq('customer_access_token', token)
          .single();

        if (error) throw error;

        if (invoiceData) {
          customerData.invoice = invoiceData;
        if (invoiceData.quote_requests) {
          customerData.quote = invoiceData.quote_requests as any;
        }
        }
      } else {
        // Standard parameter-based access
        if (quoteId) {
          const quoteResponse = await supabase
            .from('quote_requests')
            .select('*')
            .eq('id', quoteId)
            .single();
          
          if (quoteResponse.data) {
            customerData.quote = quoteResponse.data;
            
            const invoiceResponse = await supabase
              .from('invoices')
              .select('*')
              .eq('quote_request_id', quoteResponse.data.id)
              .single();
            
            if (invoiceResponse.data) {
              customerData.invoice = invoiceResponse.data;
            }
          }
        }

        if (invoiceId && !customerData.invoice) {
          const invoiceResponse = await supabase
            .from('invoices')
            .select('*')
            .eq('id', invoiceId)
            .single();
          
          if (invoiceResponse.data) {
            customerData.invoice = invoiceResponse.data;

            if (invoiceResponse.data.quote_request_id) {
              const quoteResponse = await supabase
                .from('quote_requests')
                .select('*')
                .eq('id', invoiceResponse.data.quote_request_id)
                .single();
              
              if (quoteResponse.data) {
                customerData.quote = quoteResponse.data;
              }
            }
          }
        }
      }

      setData(customerData);
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

  const getProgressSteps = () => {
    if (data.invoice) {
      const steps = [
        { 
          label: 'Quote Requested', 
          completed: true,
          description: 'Initial request submitted'
        },
        { 
          label: 'Quote Confirmed', 
          completed: true,
          description: 'Quote approved by customer'
        },
        { 
          label: 'Invoice Sent', 
          completed: true,
          description: 'Invoice created and sent'
        },
        { 
          label: 'Payment', 
          completed: data.invoice.status === 'paid',
          description: 'Payment processing'
        },
        { 
          label: 'Event Confirmed', 
          completed: data.invoice.status === 'paid',
          description: 'Event scheduled and confirmed'
        }
      ];
      return steps;
    }

    if (data.quote) {
      const steps = [
        { 
          label: 'Quote Requested', 
          completed: true,
          description: 'Initial request submitted'
        },
        { 
          label: 'Under Review', 
          completed: data.quote.status !== 'pending',
          description: 'Team reviewing requirements'
        },
        { 
          label: 'Quote Ready', 
          completed: ['quoted', 'confirmed'].includes(data.quote.status),
          description: 'Quote prepared and sent'
        },
        { 
          label: 'Confirmation', 
          completed: data.quote.status === 'confirmed',
          description: 'Awaiting customer approval'
        },
        { 
          label: 'Invoice Creation', 
          completed: false,
          description: 'Final invoice preparation'
        }
      ];
      return steps;
    }

    return [];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'pending': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'quoted': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatCurrency = (amount: number) => `$${(amount / 100).toLocaleString()}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <div className="space-y-2">
            <p className="text-lg font-medium">Loading your dashboard...</p>
            <p className="text-sm text-muted-foreground">Fetching your latest information</p>
          </div>
        </div>
      </div>
    );
  }

  const steps = getProgressSteps();
  const completedSteps = steps.filter(step => step.completed).length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Header */}
      <header className="bg-gradient-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-elegant font-bold">Soul Train's Eatery</h1>
              <p className="text-primary-foreground/80 text-sm lg:text-base">Customer Dashboard</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 text-right">
              {data.quote && (
                <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                  <p className="text-xs text-primary-foreground/70">Quote ID</p>
                  <p className="font-mono text-sm lg:text-base font-medium">
                    #{data.quote.id?.slice(-8).toUpperCase()}
                  </p>
                </div>
              )}
              
              {data.invoice && (
                <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                  <p className="text-xs text-primary-foreground/70">Invoice Number</p>
                  <p className="font-mono text-sm lg:text-base font-medium">
                    {data.invoice.invoice_number}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 lg:space-y-8">
        {/* Enhanced Progress Section */}
        <Card className="neumorphic-card-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg lg:text-xl">
              <TrendingUp className="h-5 w-5 lg:h-6 lg:w-6 text-primary" />
              Your Event Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-3">
                <span className="font-medium">Overall Progress</span>
                <span className="font-bold text-primary">{Math.round(progressPercentage)}% Complete</span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
            </div>

            {/* Mobile-optimized progress steps */}
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center gap-3 lg:flex-col lg:items-center lg:text-center lg:gap-2">
                  <div className={`
                    w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center flex-shrink-0
                    transition-all duration-300
                    ${step.completed 
                      ? 'bg-primary text-primary-foreground shadow-md' 
                      : 'bg-muted text-muted-foreground'
                    }
                  `}>
                    {step.completed ? (
                      <CheckCircle className="h-5 w-5 lg:h-6 lg:w-6" />
                    ) : (
                      <Clock className="h-5 w-5 lg:h-6 lg:w-6" />
                    )}
                  </div>
                  
                  <div className="flex-1 lg:flex-none">
                    <p className="text-sm lg:text-xs font-medium leading-tight">{step.label}</p>
                    <p className="text-xs text-muted-foreground mt-1 lg:hidden">{step.description}</p>
                  </div>
                  
                  {/* Connection line for mobile */}
                  {index < steps.length - 1 && (
                    <ChevronRight className="h-4 w-4 text-muted-foreground lg:hidden" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto lg:h-10">
            <TabsTrigger value="overview" className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm py-2 lg:py-0">
              <Star className="h-3 w-3 lg:h-4 lg:w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            
            <TabsTrigger value="notifications" className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm py-2 lg:py-0">
              <Bell className="h-3 w-3 lg:h-4 lg:w-4" />
              <span className="hidden sm:inline">Updates</span>
            </TabsTrigger>
            
            <TabsTrigger value="quote" className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm py-2 lg:py-0">
              <FileText className="h-3 w-3 lg:h-4 lg:w-4" />
              <span className="hidden sm:inline">Details</span>
            </TabsTrigger>
            
            {data.quote?.status === 'quoted' && (
              <TabsTrigger value="changes" className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm py-2 lg:py-0">
                <Edit className="h-3 w-3 lg:h-4 lg:w-4" />
                <span className="hidden sm:inline">Changes</span>
              </TabsTrigger>
            )}
            
            {(data.invoice || data.quote?.status === 'confirmed') && (
              <TabsTrigger value="payment" className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm py-2 lg:py-0">
                <CreditCard className="h-3 w-3 lg:h-4 lg:w-4" />
                <span className="hidden sm:inline">Payment</span>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Event Summary Card */}
                {data.quote && (
                  <Card className="neumorphic-card-2">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between text-lg lg:text-xl">
                        <span>Event Summary</span>
                        <Badge className={getStatusColor(data.quote.status)}>
                          {data.quote.status.charAt(0).toUpperCase() + data.quote.status.slice(1)}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                          <Star className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <p className="text-sm text-muted-foreground">Event Name</p>
                            <p className="font-medium">{data.quote.event_name}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <Calendar className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <p className="text-sm text-muted-foreground">Event Date</p>
                            <p className="font-medium">{new Date(data.quote.event_date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <Users className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <p className="text-sm text-muted-foreground">Guest Count</p>
                            <p className="font-medium">{data.quote.guest_count} guests</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <p className="text-sm text-muted-foreground">Location</p>
                            <p className="font-medium">{data.quote.location}</p>
                          </div>
                        </div>
                      </div>

                      {data.quote.estimated_total && (
                        <div className="pt-6 border-t">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-5 w-5 text-primary" />
                              <span className="text-lg font-medium">Estimated Total</span>
                            </div>
                            <span className="text-2xl lg:text-3xl font-bold text-primary">
                              {formatCurrency(data.quote.estimated_total)}
                            </span>
                          </div>
                        </div>
                      )}

                      {data.quote.status === 'quoted' && (
                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                          <Button 
                            onClick={() => {/* Handle approve */}} 
                            className="flex-1 neumorphic-button-primary"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve Quote
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => setActiveTab('changes')}
                            className="flex-1"
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Request Changes
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Invoice Summary */}
                {data.invoice && (
                  <Card className="neumorphic-card-2">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between text-lg lg:text-xl">
                        <span>Invoice Summary</span>
                        <Badge className={getStatusColor(data.invoice.status)}>
                          {data.invoice.status.charAt(0).toUpperCase() + data.invoice.status.slice(1)}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-6 w-6 text-primary" />
                          <span className="text-lg font-medium">Total Amount</span>
                        </div>
                        <span className="text-2xl lg:text-3xl font-bold text-primary">
                          {formatCurrency(data.invoice.total_amount)}
                        </span>
                      </div>

                      {data.invoice.due_date && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-muted-foreground" />
                            <span>Due Date</span>
                          </div>
                          <span className="font-medium">
                            {new Date(data.invoice.due_date).toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        {data.invoice.status !== 'paid' && (
                          <Button 
                            onClick={() => setActiveTab('payment')} 
                            className="flex-1 neumorphic-button-primary"
                          >
                            <CreditCard className="h-4 w-4 mr-2" />
                            Make Payment
                          </Button>
                        )}
                        
                        <Button variant="outline" className="flex-1">
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </Button>
                        
                        {data.invoice && (
                          <Button 
                            variant="secondary" 
                            onClick={() => setShowComparison(true)}
                            className="flex-1"
                          >
                            <History className="h-4 w-4 mr-2" />
                            View Changes
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <Card className="neumorphic-card-1">
                  <CardHeader>
                    <CardTitle className="text-base">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setActiveTab('notifications')}
                    >
                      <Bell className="h-4 w-4 mr-2" />
                      View Updates
                    </Button>
                    
                    {data.invoice && (
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => setShowComparison(true)}
                      >
                        <History className="h-4 w-4 mr-2" />
                        Compare Versions
                      </Button>
                    )}
                    
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Download Documents
                    </Button>
                  </CardContent>
                </Card>

                {/* Contact Information */}
                <Card className="neumorphic-card-1">
                  <CardHeader>
                    <CardTitle className="text-base">Contact Us</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">(843) 970-0265</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">soultrainseatery@gmail.com</p>
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t">
                      <p className="text-sm text-muted-foreground">
                        Proudly serving Charleston's Lowcountry and surrounding areas
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <CustomerNotificationCenter
              customerEmail={customerEmail || data.quote?.email}
              invoiceId={invoiceId || data.invoice?.id}
              quoteId={quoteId || data.quote?.id}
            />
          </TabsContent>

          <TabsContent value="quote">
            {showComparison && data.invoice ? (
              <EstimateComparisonView
                invoiceId={data.invoice.id}
                onClose={() => setShowComparison(false)}
              />
            ) : data.quote ? (
              <QuoteApprovalFlow
                quote={data.quote}
                onApprovalChange={(approved, comments) => {
                  fetchCustomerData();
                  if (approved) {
                    setActiveTab('overview');
                  }
                }}
              />
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No quote information available.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="changes">
            {data.quote ? (
            <ChangeRequestForm
              quote={data.quote}
              onRequestSubmitted={() => {
                toast({
                  title: "Request Submitted",
                  description: "We'll review your changes and get back to you soon.",
                });
                setActiveTab('overview');
              }}
            />
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No quote available for change requests.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="payment">
            {data.invoice ? (
            <PaymentPortal
              quote={data.quote}
              invoice={data.invoice}
            />
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">Payment will be available once your quote is approved.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}