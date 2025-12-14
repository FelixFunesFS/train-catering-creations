import { useParams, useNavigate } from 'react-router-dom';
import { useQuote } from '@/hooks/useQuotes';
import { useInvoiceByQuote } from '@/hooks/useInvoices';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { EventEstimateFullView } from '@/components/admin/events/EventEstimateFullView';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useEffect } from 'react';

export function EventEstimateFullViewPage() {
  const { quoteId } = useParams<{ quoteId: string }>();
  const navigate = useNavigate();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  
  const { data: quote, isLoading: quoteLoading, error: quoteError } = useQuote(quoteId);
  const { data: invoice, isLoading: invoiceLoading } = useInvoiceByQuote(quoteId);

  // Redirect mobile users to admin modal view
  useEffect(() => {
    if (!isDesktop && quoteId) {
      navigate(`/admin?view=events&tab=list&quoteId=${quoteId}`, { replace: true });
    }
  }, [isDesktop, quoteId, navigate]);

  const handleClose = () => {
    navigate('/admin?view=events');
  };

  // Don't render on mobile (redirecting)
  if (!isDesktop) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (quoteLoading || invoiceLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (quoteError || !quote) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
            <h2 className="text-lg font-semibold">Event Not Found</h2>
            <p className="text-sm text-muted-foreground">
              {quoteError?.message || 'The requested event could not be found.'}
            </p>
            <Button onClick={handleClose} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <EventEstimateFullView 
      quote={quote} 
      invoice={invoice} 
      onClose={handleClose} 
    />
  );
}
