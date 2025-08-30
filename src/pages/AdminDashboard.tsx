import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { QuoteDetailModal } from "@/components/admin/QuoteDetailModal";
import { QuoteViewModal } from "@/components/admin/QuoteViewModal";
import { AdminAnalyticsDashboard } from "@/components/admin/AdminAnalyticsDashboard";
import { NotificationCenter } from "@/components/admin/NotificationCenter";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Search,
  Plus,
  Eye,
  Edit,
  Calendar,
  Phone,
  Mail,
  User,
  MapPin,
  UtensilsCrossed,
  Users,
  Clock,
  Filter,
  Download,
  TrendingUp,
  Bell,
  BarChart3,
  Settings
} from "lucide-react";

type QuoteRequest = Database['public']['Tables']['quote_requests']['Row'];

interface Notification {
  id: string;
  type: 'payment_overdue' | 'change_request' | 'approval_pending' | 'event_reminder' | 'system';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  read: boolean;
  action_url?: string;
  action_label?: string;
  metadata?: any;
}

const AdminDashboard = () => {
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [filteredQuotes, setFilteredQuotes] = useState<QuoteRequest[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);
  const [viewQuote, setViewQuote] = useState<QuoteRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<'overview' | 'quotes' | 'analytics' | 'notifications'>('overview');
  const [invoiceStatus, setInvoiceStatus] = useState<Record<string, string>>({});
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>({});
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuotes();
    fetchAnalyticsData();
    fetchNotifications();
  }, []);

  useEffect(() => {
    filterQuotes();
  }, [quotes, searchTerm, statusFilter, serviceFilter]);

  const fetchQuotes = async () => {
    try {
      const { data, error } = await supabase
        .from('quote_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuotes(data as QuoteRequest[] || []);

      // Fetch invoice status for each quote
      const { data: invoiceData } = await supabase
        .from('invoices')
        .select('quote_request_id, status, is_draft')
        .in('quote_request_id', data?.map(q => q.id) || []);

      const statusMap: Record<string, string> = {};
      invoiceData?.forEach(invoice => {
        if (invoice.quote_request_id) {
          statusMap[invoice.quote_request_id] = invoice.is_draft ? 'draft' : invoice.status;
        }
      });
      setInvoiceStatus(statusMap);
    } catch (error) {
      console.error('Error fetching quotes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch quote requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterQuotes = () => {
    let filtered = quotes;

    if (searchTerm) {
      filtered = filtered.filter(quote =>
        quote.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.event_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(quote => quote.status === statusFilter);
    }

    if (serviceFilter !== "all") {
      filtered = filtered.filter(quote => quote.service_type === serviceFilter);
    }

    setFilteredQuotes(filtered);
  };

  const fetchAnalyticsData = async () => {
    try {
      // Fetch revenue data
      const { data: invoices, error: invoicesError } = await supabase
        .from('invoices')
        .select('total_amount, status, created_at, is_draft')
        .not('is_draft', 'eq', true);

      if (invoicesError) throw invoicesError;

      // Fetch payment data
      const { data: payments, error: paymentsError } = await supabase
        .from('payment_transactions')
        .select('amount, status, created_at')
        .eq('status', 'succeeded');

      if (paymentsError) throw paymentsError;

      // Calculate analytics
      const totalRevenue = payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
      
      const currentMonth = new Date().getMonth();
      const monthlyRevenue = payments?.filter(payment => 
        new Date(payment.created_at).getMonth() === currentMonth
      ).reduce((sum, payment) => sum + payment.amount, 0) || 0;

      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthRevenue = payments?.filter(payment => 
        new Date(payment.created_at).getMonth() === lastMonth
      ).reduce((sum, payment) => sum + payment.amount, 0) || 0;

      const revenueGrowth = lastMonthRevenue > 0 
        ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
        : 0;

      const totalInvoices = invoices?.length || 0;
      const pendingInvoices = invoices?.filter(inv => inv.status === 'draft' || inv.status === 'pending').length || 0;
      const approvedInvoices = invoices?.filter(inv => inv.status === 'approved').length || 0;

      // Calculate upcoming events (next 30 days)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      const { data: upcomingQuotes } = await supabase
        .from('quote_requests')
        .select('event_date')
        .gte('event_date', new Date().toISOString().split('T')[0])
        .lte('event_date', thirtyDaysFromNow.toISOString().split('T')[0]);

      const averageOrderValue = totalInvoices > 0 
        ? invoices.reduce((sum, inv) => sum + inv.total_amount, 0) / totalInvoices 
        : 0;

      const conversionRate = quotes.length > 0 
        ? (approvedInvoices / quotes.length) * 100 
        : 0;

      setAnalyticsData({
        totalRevenue,
        monthlyRevenue,
        revenueGrowth,
        totalInvoices,
        pendingInvoices,
        approvedInvoices,
        overduePauments: 0,
        upcomingEvents: upcomingQuotes?.length || 0,
        averageOrderValue,
        conversionRate
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchNotifications = async () => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'change_request',
        title: 'New Change Request',
        message: 'Customer requested changes for Corporate Lunch event',
        priority: 'high',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        read: false,
        action_url: '/admin/invoices',
        action_label: 'Review'
      },
      {
        id: '2',
        type: 'approval_pending',
        title: 'Estimate Awaiting Approval',
        message: 'Wedding reception estimate ready for customer review',
        priority: 'medium',
        created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        read: false,
        action_url: '/admin/invoices',
        action_label: 'View'
      }
    ];

    setNotifications(mockNotifications);
  };

  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const handleDismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'reviewed': return 'default';
      case 'quoted': return 'default';
      case 'completed': return 'default';
      case 'confirmed': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const getServiceTypeDisplay = (serviceType: string) => {
    switch (serviceType) {
      case 'full-service': return 'Full Service Catering';
      case 'delivery-setup': return 'Delivery + Setup';
      case 'drop-off': return 'Drop-Off Service';
      default: return serviceType;
    }
  };

  const getActionButton = (quote: QuoteRequest) => {
    const hasInvoice = invoiceStatus[quote.id];
    
    if (!hasInvoice && quote.status === 'pending') {
      return (
        <Button
          size="sm"
          onClick={() => navigate(`/admin/invoice-creation/${quote.id}`)}
          className="gap-1"
        >
          <FileText className="h-3 w-3" />
          Generate Estimate
        </Button>
      );
    }
    
    if (hasInvoice === 'draft') {
      return (
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate(`/admin/invoices`)}
          className="gap-1"
        >
          <FileText className="h-3 w-3" />
          View Estimate
        </Button>
      );
    }
    
    if (hasInvoice && hasInvoice !== 'draft') {
      return (
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate(`/admin/invoices`)}
          className="gap-1"
        >
          <FileText className="h-3 w-3" />
          View Invoice
        </Button>
      );
    }
    
    return null;
  };

  const renderQuoteCard = (quote: QuoteRequest) => (
    <div key={quote.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{quote.event_name}</h3>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {quote.contact_name}
            </div>
            <div className="flex items-center gap-1">
              <Mail className="h-4 w-4" />
              {quote.email}
            </div>
            <div className="flex items-center gap-1">
              <Phone className="h-4 w-4" />
              {quote.phone}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={getStatusVariant(quote.status as any)}>
            {quote.status}
          </Badge>
          {getActionButton(quote)}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{format(new Date(quote.event_date), "MMM d, yyyy")}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>{quote.guest_count} guests</span>
        </div>
        <div className="flex items-center gap-2">
          <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
          <span>{getServiceTypeDisplay(quote.service_type as any)}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="truncate">{quote.location}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Submitted {format(new Date(quote.created_at), "MMM d, h:mm a")}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewQuote(quote)}
          >
            <Eye className="h-4 w-4 mr-1" />
            View Details
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedQuote(quote)}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'analytics':
        return (
          <AdminAnalyticsDashboard 
            data={analyticsData}
            className="animate-fade-in"
          />
        );
      
      case 'notifications':
        return (
          <NotificationCenter
            notifications={notifications}
            onMarkAsRead={handleMarkNotificationAsRead}
            onDismiss={handleDismissNotification}
            onRefresh={fetchNotifications}
            className="animate-fade-in"
          />
        );
      
      case 'overview':
      default:
        return (
          <div className="space-y-6 animate-fade-in">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="hover-scale">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Quotes</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{quotes.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {quotes.filter(q => q.status === 'pending').length} pending review
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-scale">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">This Month</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {quotes.filter(q => 
                      new Date(q.created_at).getMonth() === new Date().getMonth()
                    ).length}
                  </div>
                  <p className="text-xs text-muted-foreground">New quote requests</p>
                </CardContent>
              </Card>

              <Card className="hover-scale">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Notifications</CardTitle>
                  <Bell className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {notifications.filter(n => !n.read).length}
                  </div>
                  <p className="text-xs text-muted-foreground">Unread notifications</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent quotes */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Quote Requests</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button onClick={() => navigate('/admin/invoices')} variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Manage Invoices
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="mt-2 text-muted-foreground">Loading quotes...</p>
                    </div>
                  ) : filteredQuotes.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No quotes found</h3>
                      <p className="text-muted-foreground">Quote requests will appear here when submitted</p>
                    </div>
                  ) : (
                    filteredQuotes.slice(0, 5).map((quote) => renderQuoteCard(quote))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb 
          items={[
            { label: "Dashboard", current: true }
          ]} 
        />
        
        {/* Header with Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-elegant font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage catering operations for Soul Train's Eatery</p>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex items-center gap-2">
            <Button
              variant={activeTab === 'overview' ? 'default' : 'outline'}
              onClick={() => setActiveTab('overview')}
              size="sm"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </Button>
            <Button
              variant={activeTab === 'analytics' ? 'default' : 'outline'}
              onClick={() => setActiveTab('analytics')}
              size="sm"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Analytics
            </Button>
            <Button
              variant={activeTab === 'notifications' ? 'default' : 'outline'}
              onClick={() => setActiveTab('notifications')}
              size="sm"
              className="relative"
            >
              <Bell className="h-4 w-4 mr-2" />
              Notifications
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button onClick={() => navigate('/admin/invoices')} variant="default" className="gap-2">
            <FileText className="h-4 w-4" />
            Invoice Management
          </Button>
          <Button onClick={() => navigate('/admin/contracts')} variant="outline" className="gap-2">
            <Settings className="h-4 w-4" />
            Contract Management
          </Button>
          <Button onClick={() => navigate('/admin/invoice-creation')} variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            Create Estimate
          </Button>
        </div>

        {/* Tab Content */}
        {renderTabContent()}

        {/* Modals */}
        {selectedQuote && (
          <QuoteDetailModal
            quote={selectedQuote}
            onClose={() => setSelectedQuote(null)}
            onUpdate={(updatedQuote) => {
              setQuotes(quotes.map(q => q.id === updatedQuote.id ? updatedQuote : q));
            }}
          />
        )}

        {viewQuote && (
          <QuoteViewModal
            quote={viewQuote}
            onClose={() => setViewQuote(null)}
          />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;