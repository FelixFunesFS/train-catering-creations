import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Clock, ChevronRight, Mail, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatEventName, formatCustomerName, formatLocation } from "@/utils/textFormatters";

interface Quote {
  id: string;
  contact_name: string;
  email: string;
  phone: string;
  event_name: string;
  event_date: string;
  guest_count: number;
  location: string;
  service_type: string;
  status: string;
  created_at: string;
  invoices?: Array<{ id: string; is_draft: boolean; status: string }>;
}

interface StreamlinedQuoteManagerProps {
  quotes: Quote[];
  loading: boolean;
  onRefresh: () => void;
}

export function StreamlinedQuoteManager({ quotes, loading, onRefresh }: StreamlinedQuoteManagerProps) {
  const [processing, setProcessing] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Categorize quotes with improved logic
  const newQuotes = quotes.filter(q => 
    q.status === 'pending' && !q.invoices?.length
  );
  
  const inProgress = quotes.filter(q => 
    q.status === 'quoted' || 
    q.status === 'reviewed' ||
    (q.invoices?.length && q.status !== 'completed')
  );
  
  const completed = quotes.filter(q => 
    q.status === 'completed' || 
    q.status === 'confirmed' ||
    q.invoices?.some(inv => inv.status === 'paid')
  );

  const createEstimate = async (quoteId: string) => {
    setProcessing(prev => new Set([...prev, quoteId]));
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-invoice-from-quote', {
        body: { quote_request_id: quoteId }
      });

      if (error) throw error;

      toast({
        title: "Estimate Created",
        description: "Draft estimate ready for review.",
      });

      onRefresh();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error Creating Estimate",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setProcessing(prev => {
        const newSet = new Set(prev);
        newSet.delete(quoteId);
        return newSet;
      });
    }
  };

  const QuoteCard = ({ quote }: { quote: Quote }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{formatEventName(quote.event_name)}</CardTitle>
            <p className="text-sm text-muted-foreground">{formatCustomerName(quote.contact_name)}</p>
          </div>
          <Badge variant={quote.status === 'pending' ? 'destructive' : 'default'}>
            {quote.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            {new Date(quote.event_date).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            {quote.guest_count} guests
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            {formatLocation(quote.location).substring(0, 25)}...
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            {quote.service_type.replace('-', ' ')}
          </div>
        </div>
        
        <div className="flex gap-2 text-xs">
          <span className="flex items-center gap-1">
            <Mail className="h-3 w-3" />
            {quote.email}
          </span>
          <span className="flex items-center gap-1">
            <Phone className="h-3 w-3" />
            {quote.phone}
          </span>
        </div>

        {quote.status === 'pending' && (
          <Button 
            onClick={() => createEstimate(quote.id)}
            disabled={processing.has(quote.id)}
            className="w-full"
            size="sm"
          >
            {processing.has(quote.id) ? "Creating..." : "Create Estimate"}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return <div className="text-center py-8">Loading quotes...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">New Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{newQuotes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{inProgress.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{completed.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quote Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* New Requests */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-destructive">New Requests</h3>
          {newQuotes.length > 0 ? (
            newQuotes.map(quote => <QuoteCard key={quote.id} quote={quote} />)
          ) : (
            <p className="text-muted-foreground text-center py-8">No new requests</p>
          )}
        </div>

        {/* In Progress */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-warning">In Progress</h3>
          {inProgress.length > 0 ? (
            inProgress.map(quote => <QuoteCard key={quote.id} quote={quote} />)
          ) : (
            <p className="text-muted-foreground text-center py-8">No quotes in progress</p>
          )}
        </div>

        {/* Completed */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-success">Completed</h3>
          {completed.slice(0, 5).map(quote => <QuoteCard key={quote.id} quote={quote} />)}
          {completed.length > 5 && (
            <p className="text-sm text-muted-foreground text-center">
              +{completed.length - 5} more completed
            </p>
          )}
        </div>
      </div>
    </div>
  );
}