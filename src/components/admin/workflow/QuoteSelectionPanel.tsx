import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Users, MapPin, ChevronRight } from 'lucide-react';

interface Quote {
  id: string;
  event_name: string;
  contact_name: string;
  event_date: string;
  guest_count: number;
  location: string;
  status?: string;
}

interface QuoteSelectionPanelProps {
  quotes: Quote[];
  loading: boolean;
  onSelectQuote: (quote: Quote) => void;
}

export function QuoteSelectionPanel({ quotes, loading, onSelectQuote }: QuoteSelectionPanelProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            Loading quotes...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Quote to Process</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {quotes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No quotes available. Please create a quote first.
            </div>
          ) : (
            quotes.map((quote) => (
              <div
                key={quote.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => onSelectQuote(quote)}
              >
                <div className="space-y-1">
                  <div className="font-medium">{quote.event_name}</div>
                  <div className="text-sm text-muted-foreground">
                    {quote.contact_name} • {format(new Date(quote.event_date), 'PPP')}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {quote.guest_count} guests
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {quote.location}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{quote.status}</Badge>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
