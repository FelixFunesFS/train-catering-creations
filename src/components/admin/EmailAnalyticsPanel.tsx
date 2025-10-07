import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, MailOpen, Eye, Clock, TrendingUp, AlertCircle } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface EmailEvent {
  id: string;
  event_type: string;
  entity_id: string;
  metadata: any;
  created_at: string;
}

interface InvoiceData {
  id: string;
  invoice_number: string;
  document_type: string;
  email_opened_at: string | null;
  email_opened_count: number;
  estimate_viewed_at: string | null;
  estimate_viewed_count: number;
  quote_requests: {
    contact_name: string;
    email: string;
    event_name: string;
    event_date: string;
  } | null;
}

export function EmailAnalyticsPanel() {
  const { data: emailEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ['email-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('event_type', 'email_opened')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as EmailEvent[];
    }
  });

  const { data: invoicesData, isLoading: invoicesLoading } = useQuery({
    queryKey: ['invoices-email-tracking'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          id,
          invoice_number,
          document_type,
          email_opened_at,
          email_opened_count,
          estimate_viewed_at,
          estimate_viewed_count,
          quote_request_id,
          quote_requests!quote_request_id (
            contact_name,
            email,
            event_name,
            event_date
          )
        `)
        .eq('document_type', 'estimate')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as InvoiceData[];
    }
  });

  if (eventsLoading || invoicesLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </Card>
          ))}
        </div>
        <Card className="p-6">
          <Skeleton className="h-6 w-48 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  const emailStats = calculateEmailStats(invoicesData || []);
  const unopenedEmails = (invoicesData || []).filter(inv => !inv.email_opened_at);
  const unviewedEstimates = (invoicesData || []).filter(inv => !inv.estimate_viewed_at);
  const recentlyViewed = (invoicesData || [])
    .filter(inv => inv.estimate_viewed_at)
    .sort((a, b) => new Date(b.estimate_viewed_at!).getTime() - new Date(a.estimate_viewed_at!).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Emails Sent</p>
              <p className="text-2xl font-bold">{emailStats.totalSent}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <MailOpen className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Open Rate</p>
              <p className="text-2xl font-bold">{emailStats.openRate}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Eye className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estimate Views</p>
              <p className="text-2xl font-bold">{emailStats.totalViews}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-500/10 rounded-lg">
              <AlertCircle className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Unviewed Estimates</p>
              <p className="text-2xl font-bold">{unviewedEstimates.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recently Viewed Estimates */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Recently Viewed Estimates</h3>
        </div>
        
        {recentlyViewed.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No estimates viewed yet</p>
        ) : (
          <div className="space-y-3">
            {recentlyViewed.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex-1">
                  <p className="font-medium">{invoice.quote_requests?.contact_name}</p>
                  <p className="text-sm text-muted-foreground">{invoice.quote_requests?.event_name}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">{invoice.estimate_viewed_count} views</p>
                    <p className="text-xs text-muted-foreground">
                      {invoice.estimate_viewed_at && formatDistanceToNow(new Date(invoice.estimate_viewed_at), { addSuffix: true })}
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-300">
                    Viewed
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Unviewed Estimates */}
      {unviewedEstimates.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <h3 className="text-lg font-semibold">Unviewed Estimates</h3>
            <Badge variant="outline" className="ml-auto">{unviewedEstimates.length}</Badge>
          </div>
          
          <div className="space-y-3">
            {unviewedEstimates.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex-1">
                  <p className="font-medium">{invoice.quote_requests?.contact_name}</p>
                  <p className="text-sm text-muted-foreground">{invoice.quote_requests?.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Event: {invoice.quote_requests?.event_name} • {format(new Date(invoice.quote_requests?.event_date), 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-orange-500/10 text-orange-700 border-orange-300">
                    Not Viewed
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Email Engagement by Type */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Email Engagement Timeline</h3>
        </div>
        
        {!emailEvents || emailEvents.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No email events tracked yet</p>
        ) : (
          <div className="space-y-2">
            {emailEvents.slice(0, 10).map((event) => (
              <div key={event.id} className="flex items-center gap-3 p-2 border-l-2 border-primary/30 pl-3">
                <MailOpen className="h-4 w-4 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {event.metadata?.email_type === 'estimate_ready' ? 'Estimate Email' : 'Email'} opened
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {event.metadata?.email_type || 'unknown'}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function calculateEmailStats(invoices: InvoiceData[]) {
  const totalSent = invoices.length;
  const totalOpened = invoices.filter(inv => inv.email_opened_at).length;
  const totalViews = invoices.reduce((sum, inv) => sum + (inv.estimate_viewed_count || 0), 0);
  const openRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0;

  return {
    totalSent,
    totalOpened,
    totalViews,
    openRate
  };
}
