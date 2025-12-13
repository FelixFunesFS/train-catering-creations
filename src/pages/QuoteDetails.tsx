import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Construction } from 'lucide-react';

export default function QuoteDetails() {
  const { quoteId } = useParams();
  const navigate = useNavigate();
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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
    } catch (error) {
      console.error('Error fetching quote:', error);
      toast({
        title: "Error",
        description: "Failed to load quote details",
        variant: "destructive"
      });
      navigate('/admin');
    } finally {
      setLoading(false);
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

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/admin')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Admin
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{quote.event_name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-muted-foreground">Quote Details</p>
            <Badge variant="outline">{quote.workflow_status}</Badge>
          </div>
        </div>
      </div>

      {/* Placeholder Content */}
      <Card className="max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Construction className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle>Quote Details - Rebuilding</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-6">
            This page is being rebuilt with a cleaner design.
          </p>
          
          {/* Basic quote info from database */}
          <div className="text-left space-y-4 bg-muted/50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Contact</p>
                <p className="font-medium">{quote.contact_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{quote.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Event Date</p>
                <p className="font-medium">{quote.event_date ? new Date(quote.event_date).toLocaleDateString() : 'TBD'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Guest Count</p>
                <p className="font-medium">{quote.guest_count || 'TBD'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">{quote.location || 'TBD'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Service Type</p>
                <p className="font-medium">{quote.service_type || 'TBD'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}