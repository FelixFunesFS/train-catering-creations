import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { InvoiceManagementTab } from '@/components/admin/InvoiceManagementTab';
import { NewRequestsWorkflow } from '@/components/admin/NewRequestsWorkflow';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  LayoutDashboard, 
  FileText, 
  TrendingUp,
  Users,
  Calendar,
  Target
} from 'lucide-react';

interface UnifiedAdminData {
  quotes: any[];
  invoices: any[];
  notifications: any[];
  analytics: any;
}

export function UnifiedAdminInterface() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') || 'overview');
  const [data, setData] = useState<UnifiedAdminData>({
    quotes: [],
    invoices: [],
    notifications: [],
    analytics: {}
  });
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const { toast } = useToast();

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
    if (newTab === 'overview') {
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

  const handleBatchAction = async (action: string, itemIds: string[]) => {
    console.log('Batch action:', action, 'Items:', itemIds);
    // Implementation would depend on the specific action
    toast({
      title: "Batch Action",
      description: `Applied ${action} to ${itemIds.length} items`,
    });
    setSelectedItems([]);
    await fetchAllData(); // Refresh data
  };

  const handleStatusProgression = async (itemId: string, newStatus: string) => {
    console.log('Status progression:', itemId, 'to', newStatus);
    // Implementation would update the item status
    toast({
      title: "Status Updated",
      description: `Item status updated to ${newStatus}`,
    });
    await fetchAllData(); // Refresh data
  };

  const handleNotificationAction = (notification: any) => {
    // Handle notification clicks
    if (notification.action_url === '#invoices') {
      handleTabChange('in-progress');
    } else if (notification.action_url === '#quotes') {
      handleTabChange('requests');
    }
  };

  const getTabCounts = () => {
    return {
      quotes: data.quotes.filter(q => ['pending', 'reviewed'].includes(q.status)).length,
      invoices: data.invoices.length,
      notifications: data.notifications.filter(n => !n.read).length
    };
  };

  const tabCounts = getTabCounts();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar data={data} />
        
        <div className="flex-1 flex flex-col min-w-0 relative">
          {/* Header - Fixed z-index hierarchy */}
          <header className="sticky top-0 z-50 shrink-0 h-14 lg:h-16 flex items-center justify-between border-b bg-background px-3 lg:px-6">
            <div className="flex items-center gap-2 lg:gap-4 min-w-0">
              <SidebarTrigger className="lg:hidden p-1 shrink-0 h-8 w-8" />
              <div className="min-w-0">
                <h1 className="text-base lg:text-xl font-bold text-foreground truncate">Admin Dashboard</h1>
                <p className="text-xs text-muted-foreground hidden sm:block truncate">Catering Management</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1 lg:gap-2 shrink-0">
              {/* Simplified header actions */}
            </div>
          </header>

          {/* Main Content Container */}
          <main className="flex-1 relative overflow-hidden">
            {/* Mobile Tab Navigation */}
            <div className="lg:hidden sticky top-14 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="px-3 py-2">
                <div className="grid grid-cols-3 gap-1 bg-muted rounded-lg p-1">
                  <button
                    onClick={() => handleTabChange('overview')}
                    className={`flex flex-col items-center gap-1 px-2 py-2 rounded-md text-xs transition-all ${
                      activeTab === 'overview' 
                        ? 'bg-background text-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Overview</span>
                  </button>
                  <button
                    onClick={() => handleTabChange('requests')}
                    className={`flex flex-col items-center gap-1 px-2 py-2 rounded-md text-xs transition-all relative ${
                      activeTab === 'requests' 
                        ? 'bg-background text-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <div className="relative">
                      <FileText className="h-4 w-4" />
                      {tabCounts.quotes > 0 && (
                        <Badge variant="secondary" className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center">
                          {tabCounts.quotes}
                        </Badge>
                      )}
                    </div>
                    <span>Requests</span>
                  </button>
                  <button
                    onClick={() => handleTabChange('in-progress')}
                    className={`flex flex-col items-center gap-1 px-2 py-2 rounded-md text-xs transition-all relative ${
                      activeTab === 'in-progress' 
                        ? 'bg-background text-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <div className="relative">
                      <Target className="h-4 w-4" />
                      {tabCounts.invoices > 0 && (
                        <Badge variant="secondary" className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center">
                          {tabCounts.invoices}
                        </Badge>
                      )}
                    </div>
                    <span>Progress</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Content Container - Proper scroll management */}
            <div className="relative z-10 flex-1 overflow-hidden">
              <div className="h-full overflow-y-auto scrollbar-thin scrollbar-track-muted scrollbar-thumb-muted-foreground/20">
                <div className="p-3 lg:p-6 min-h-full">
                 {/* Desktop Tab Navigation */}
                <Tabs value={activeTab} onValueChange={handleTabChange} className="hidden lg:block">
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="overview" className="flex items-center gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      Overview
                    </TabsTrigger>
                    <TabsTrigger value="requests" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      New Requests
                      {tabCounts.quotes > 0 && (
                        <Badge variant="secondary" className="ml-1">
                          {tabCounts.quotes}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="in-progress" className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      In Progress
                      {tabCounts.invoices > 0 && (
                        <Badge variant="secondary" className="ml-1">
                          {tabCounts.invoices}
                        </Badge>
                      )}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                {/* Tab Content */}
                <div className="min-h-0">
                  {activeTab === 'overview' && (
                    <div className="space-y-4 lg:space-y-6">
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
                        {/* Quick Stats */}
                        <Card>
                          <CardContent className="pt-3 lg:pt-6">
                            <div className="flex items-center gap-1 lg:gap-2">
                              <TrendingUp className="h-3 w-3 lg:h-4 lg:w-4 text-green-600" />
                              <span className="text-xs lg:text-sm font-medium">Total Revenue</span>
                            </div>
                            <div className="text-lg lg:text-2xl font-bold">
                              ${((data.analytics.totalRevenue || 0) / 100).toLocaleString()}
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardContent className="pt-3 lg:pt-6">
                            <div className="flex items-center gap-1 lg:gap-2">
                              <Calendar className="h-3 w-3 lg:h-4 lg:w-4 text-blue-600" />
                              <span className="text-xs lg:text-sm font-medium">This Month</span>
                            </div>
                            <div className="text-lg lg:text-2xl font-bold">
                              ${((data.analytics.monthlyRevenue || 0) / 100).toLocaleString()}
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardContent className="pt-3 lg:pt-6">
                            <div className="flex items-center gap-1 lg:gap-2">
                              <FileText className="h-3 w-3 lg:h-4 lg:w-4 text-purple-600" />
                              <span className="text-xs lg:text-sm font-medium">Active Quotes</span>
                            </div>
                            <div className="text-lg lg:text-2xl font-bold">{data.quotes.length}</div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardContent className="pt-3 lg:pt-6">
                            <div className="flex items-center gap-1 lg:gap-2">
                              <Users className="h-3 w-3 lg:h-4 lg:w-4 text-orange-600" />
                              <span className="text-xs lg:text-sm font-medium">Upcoming Events</span>
                            </div>
                            <div className="text-lg lg:text-2xl font-bold">{data.analytics.upcomingEvents || 0}</div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Recent Activity */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle>Recent Quotes</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {data.quotes.slice(0, 5).map((quote) => (
                                <div key={quote.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                  <div>
                                    <p className="font-medium">{quote.event_name}</p>
                                    <p className="text-sm text-muted-foreground">{quote.contact_name}</p>
                                  </div>
                                  <Badge variant="outline">{quote.status}</Badge>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle>Recent Invoices</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {data.invoices.slice(0, 5).map((invoice) => (
                                <div key={invoice.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                  <div>
                                    <p className="font-medium">{invoice.invoice_number}</p>
                                    <p className="text-sm text-muted-foreground">
                                      ${(invoice.total_amount / 100).toLocaleString()}
                                    </p>
                                  </div>
                                  <Badge variant="outline">{invoice.status}</Badge>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}

                  {activeTab === 'requests' && (
                    <NewRequestsWorkflow 
                      quotes={data.quotes.filter(q => ['pending', 'reviewed'].includes(q.status))}
                      loading={loading}
                      onRefresh={fetchAllData}
                      selectedItems={selectedItems}
                      onSelectionChange={setSelectedItems}
                    />
                  )}

                  {activeTab === 'in-progress' && (
                    <InvoiceManagementTab 
                      invoices={data.invoices}
                      loading={loading}
                      onRefresh={fetchAllData}
                      selectedItems={selectedItems}
                      onSelectionChange={setSelectedItems}
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