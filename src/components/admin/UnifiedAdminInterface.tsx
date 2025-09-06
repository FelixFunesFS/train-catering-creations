import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { InvoiceManagementTab } from '@/components/admin/InvoiceManagementTab';
import { NewRequestsWorkflow } from '@/components/admin/NewRequestsWorkflow';
import { UnifiedQuoteWorkflow } from '@/components/admin/UnifiedQuoteWorkflow';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  LayoutDashboard, 
  FileText, 
  Target,
  DollarSign,
  Calendar,
  Users,
  LogOut
} from 'lucide-react';

interface UnifiedAdminData {
  quotes: any[];
  invoices: any[];
  notifications: any[];
  analytics: any;
}

export function UnifiedAdminInterface() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') || 'new-requests');
  const [data, setData] = useState<UnifiedAdminData>({
    quotes: [],
    invoices: [],
    notifications: [],
    analytics: {}
  });
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const { toast } = useToast();
  const { user, signOut } = useAuth();

  useEffect(() => {
    fetchAllData();
  }, []);

  // Listen for URL parameter changes
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams, activeTab]);

  // Update URL when tab changes
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    if (newTab === 'new-requests') {
      setSearchParams({});
    } else {
      setSearchParams({ tab: newTab });
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel for better performance
      const [quotesResult, invoicesResult, analyticsResult] = await Promise.all([
        // Fetch quotes
        supabase
          .from('quote_requests')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(50),
        
        // Fetch invoices with related data  
        supabase
          .from('invoices')
          .select(`
            *,
            customers!inner(name, email),
            quote_requests!quote_request_id(event_name, event_date, contact_name)
          `)
          .order('updated_at', { ascending: false })
          .limit(50),
        
        // Calculate analytics
        calculateAnalytics()
      ]);

      if (quotesResult.error) throw quotesResult.error;
      if (invoicesResult.error) throw invoicesResult.error;

      // Generate mock notifications based on data
      const notifications = generateNotifications(quotesResult.data, invoicesResult.data);

      setData({
        quotes: quotesResult.data,
        invoices: invoicesResult.data,
        notifications,
        analytics: analyticsResult
      });

    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin data. Please refresh the page.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = async () => {
    try {
      // Get summary statistics
      const [invoiceStats, quoteStats] = await Promise.all([
        supabase
          .from('invoices')
          .select('total_amount, status, created_at'),
        
        supabase
          .from('quote_requests')
          .select('status, created_at, estimated_total')
      ]);

      const today = new Date();
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      const totalRevenue = invoiceStats.data?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0;
      const monthlyRevenue = invoiceStats.data?.filter(inv => 
        new Date(inv.created_at) >= thirtyDaysAgo
      ).reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0;

      const activeInvoices = invoiceStats.data?.filter(inv => 
        ['sent', 'viewed', 'approved'].includes(inv.status)
      ).length || 0;

      const upcomingEvents = quoteStats.data?.filter(quote => 
        quote.status === 'confirmed'
      ).length || 0;

      return {
        totalRevenue,
        monthlyRevenue,
        activeInvoices,
        upcomingEvents,
        totalQuotes: quoteStats.data?.length || 0,
        totalInvoices: invoiceStats.data?.length || 0
      };

    } catch (error) {
      console.error('Error calculating analytics:', error);
      return {};
    }
  };

  const generateNotifications = (quotes: any[], invoices: any[]) => {
    const notifications = [];
    
    // Overdue invoices
    const overdue = invoices.filter(inv => 
      inv.due_date && new Date(inv.due_date) < new Date() && inv.status !== 'paid'
    );
    
    if (overdue.length > 0) {
      notifications.push({
        id: 'overdue-invoices',
        type: 'payment',
        title: 'Overdue Invoices',
        message: `${overdue.length} invoice(s) are overdue and require attention`,
        priority: 'high',
        read: false,
        created_at: new Date().toISOString(),
        action_url: '#invoices',
        action_label: 'Review Invoices'
      });
    }

    // New quote requests
    const newQuotes = quotes.filter(quote => 
      quote.status === 'pending' && 
      new Date(quote.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );

    if (newQuotes.length > 0) {
      notifications.push({
        id: 'new-quotes',
        type: 'quote',
        title: 'New Quote Requests',
        message: `${newQuotes.length} new quote request(s) received in the last 24 hours`,
        priority: 'medium',
        read: false,
        created_at: new Date().toISOString(),
        action_url: '#quotes',
        action_label: 'Review Quotes'
      });
    }

    // Upcoming events
    const upcoming = quotes.filter(quote => {
      if (!quote.event_date) return false;
      const eventDate = new Date(quote.event_date);
      const now = new Date();
      const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      return eventDate <= threeDaysFromNow && eventDate > now;
    });

    if (upcoming.length > 0) {
      notifications.push({
        id: 'upcoming-events',
        type: 'event',
        title: 'Upcoming Events',
        message: `${upcoming.length} event(s) happening in the next 3 days`,
        priority: 'medium',
        read: false,
        created_at: new Date().toISOString(),
        action_url: '#quotes',
        action_label: 'View Events'
      });
    }

    return notifications;
  };

  const getTabCounts = () => {
    return {
      newRequests: data.quotes.filter(q => q.status === 'pending' && !data.invoices.some(inv => inv.quote_request_id === q.id)).length,
      estimatesInProgress: data.quotes.filter(q => 
        data.invoices.some(inv => 
          inv.quote_request_id === q.id && 
          (inv.is_draft || ['sent', 'viewed'].includes(inv.status))
        )
      ).length,
      invoicesActive: data.quotes.filter(q => 
        data.invoices.some(inv => 
          inv.quote_request_id === q.id && 
          !inv.is_draft && 
          ['approved', 'customer_approved'].includes(inv.status)
        )
      ).length,
      paymentTracking: data.quotes.filter(q => 
        data.invoices.some(inv => 
          inv.quote_request_id === q.id && 
          ['paid', 'completed'].includes(inv.status)
        )
      ).length
    };
  };

  const tabCounts = getTabCounts();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar data={data} />
        
        <div className="flex-1 flex flex-col min-w-0 relative">
          {/* Header */}
          <header className="sticky top-0 z-50 shrink-0 h-14 lg:h-16 flex items-center justify-between border-b bg-background px-3 lg:px-6">
            <div className="flex items-center gap-2 lg:gap-4 min-w-0">
              <SidebarTrigger className="lg:hidden p-1 shrink-0 h-8 w-8" />
              <div className="min-w-0">
                <h1 className="text-base lg:text-xl font-bold text-foreground truncate">Admin Dashboard</h1>
                <p className="text-xs text-muted-foreground hidden sm:block truncate">Soul Train's Eatery Management</p>
              </div>
            </div>
            <div className="flex items-center gap-2 lg:gap-4">
              <span className="text-xs lg:text-sm text-muted-foreground hidden sm:block truncate">
                {user?.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="gap-1 lg:gap-2 text-xs lg:text-sm px-2 lg:px-3"
              >
                <LogOut className="h-3 w-3 lg:h-4 lg:w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={signOut}
                className="flex items-center gap-1 lg:gap-2 h-8 lg:h-9 px-2 lg:px-3"
              >
                <LogOut className="h-3 w-3 lg:h-4 lg:w-4" />
                <span className="hidden lg:inline">Sign Out</span>
              </Button>
            </div>
          </header>

          {/* Main Content Container */}
          <main className="flex-1 relative overflow-hidden">
            {/* Mobile Tab Navigation */}
            <div className="lg:hidden sticky top-14 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="px-3 py-2">
                <div className="grid grid-cols-4 gap-1 bg-muted rounded-lg p-1">
                  <button
                    onClick={() => handleTabChange('new-requests')}
                    className={`flex flex-col items-center gap-1 px-1 py-2 rounded-md text-xs transition-all relative ${
                      activeTab === 'new-requests' 
                        ? 'bg-background text-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <div className="relative">
                      <FileText className="h-4 w-4" />
                      {tabCounts.newRequests > 0 && (
                        <Badge variant="secondary" className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center">
                          {tabCounts.newRequests}
                        </Badge>
                      )}
                    </div>
                    <span>New</span>
                  </button>
                  <button
                    onClick={() => handleTabChange('estimates-progress')}
                    className={`flex flex-col items-center gap-1 px-1 py-2 rounded-md text-xs transition-all relative ${
                      activeTab === 'estimates-progress' 
                        ? 'bg-background text-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <div className="relative">
                      <Target className="h-4 w-4" />
                      {tabCounts.estimatesInProgress > 0 && (
                        <Badge variant="secondary" className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center">
                          {tabCounts.estimatesInProgress}
                        </Badge>
                      )}
                    </div>
                    <span>Estimate</span>
                  </button>
                  <button
                    onClick={() => handleTabChange('invoices-active')}
                    className={`flex flex-col items-center gap-1 px-1 py-2 rounded-md text-xs transition-all relative ${
                      activeTab === 'invoices-active' 
                        ? 'bg-background text-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <div className="relative">
                      <DollarSign className="h-4 w-4" />
                      {tabCounts.invoicesActive > 0 && (
                        <Badge variant="secondary" className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center">
                          {tabCounts.invoicesActive}
                        </Badge>
                      )}
                    </div>
                    <span>Invoice</span>
                  </button>
                  <button
                    onClick={() => handleTabChange('payment-tracking')}
                    className={`flex flex-col items-center gap-1 px-1 py-2 rounded-md text-xs transition-all relative ${
                      activeTab === 'payment-tracking' 
                        ? 'bg-background text-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <div className="relative">
                      <Users className="h-4 w-4" />
                      {tabCounts.paymentTracking > 0 && (
                        <Badge variant="secondary" className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center">
                          {tabCounts.paymentTracking}
                        </Badge>
                      )}
                    </div>
                    <span>Payment</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Content Container */}
            <div className="relative z-10 flex-1 overflow-hidden">
              <div className="h-full overflow-y-auto scrollbar-thin scrollbar-track-muted scrollbar-thumb-muted-foreground/20">
                <div className="p-3 lg:p-6 min-h-full">
                  {/* Desktop Tab Navigation */}
                  <Tabs value={activeTab} onValueChange={handleTabChange} className="hidden lg:block">
                    <TabsList className="grid w-full grid-cols-4 mb-6">
                      <TabsTrigger value="new-requests" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        New Requests
                        {tabCounts.newRequests > 0 && (
                          <Badge variant="secondary" className="ml-1">
                            {tabCounts.newRequests}
                          </Badge>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="estimates-progress" className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Estimates in Progress
                        {tabCounts.estimatesInProgress > 0 && (
                          <Badge variant="secondary" className="ml-1">
                            {tabCounts.estimatesInProgress}
                          </Badge>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="invoices-active" className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Invoices Active
                        {tabCounts.invoicesActive > 0 && (
                          <Badge variant="secondary" className="ml-1">
                            {tabCounts.invoicesActive}
                          </Badge>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="payment-tracking" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Payment Tracking
                        {tabCounts.paymentTracking > 0 && (
                          <Badge variant="secondary" className="ml-1">
                            {tabCounts.paymentTracking}
                          </Badge>
                        )}
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  {/* Tab Content */}
                  <div className="min-h-0">
                    {activeTab === 'new-requests' && (
                      <NewRequestsWorkflow 
                        quotes={data.quotes.filter(q => q.status === 'pending' && !data.invoices.some(inv => inv.quote_request_id === q.id))}
                        loading={loading}
                        onRefresh={fetchAllData}
                        selectedItems={selectedItems}
                        onSelectionChange={setSelectedItems}
                        invoices={data.invoices}
                      />
                    )}

                    {activeTab === 'estimates-progress' && (
                      <InvoiceManagementTab 
                        invoices={data.invoices.filter(i => i.is_draft === true || ['sent', 'viewed'].includes(i.status))}
                        loading={loading}
                        onRefresh={fetchAllData}
                        title="Estimates in Progress"
                        description="Estimates awaiting completion or customer approval"
                      />
                    )}

                    {activeTab === 'invoices-active' && (
                      <InvoiceManagementTab 
                        invoices={data.invoices.filter(i => !i.is_draft && ['approved', 'customer_approved'].includes(i.status))}
                        loading={loading}
                        onRefresh={fetchAllData}
                        title="Active Invoices"
                        description="Customer-approved invoices awaiting payment"
                      />
                    )}

                    {activeTab === 'payment-tracking' && (
                      <InvoiceManagementTab 
                        invoices={data.invoices.filter(i => ['paid', 'completed'].includes(i.status))}
                        loading={loading}
                        onRefresh={fetchAllData}
                        title="Payment Tracking"
                        description="Completed payments and finalized events"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}