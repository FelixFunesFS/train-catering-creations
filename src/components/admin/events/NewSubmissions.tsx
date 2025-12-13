import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Inbox, Clock, Users, MapPin } from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';
import { EventDetail } from './EventDetail';
import { format, formatDistanceToNow } from 'date-fns';
import { EventSummary } from '@/services/EventDataService';

export function NewSubmissions() {
  const { data: events, isLoading } = useEvents();
  const [selectedQuote, setSelectedQuote] = useState<EventSummary | null>(null);
  
  const newSubmissions = events?.filter(
    (event) => event.quote_status === 'pending' || event.quote_status === 'under_review'
  ) || [];

  const [isOpen, setIsOpen] = useState(newSubmissions.length > 0);

  if (isLoading || newSubmissions.length === 0) {
    return null;
  }

  return (
    <>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <Card className="border-primary/20 bg-primary/5">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-primary/10 transition-colors rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <Inbox className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">New Submissions</CardTitle>
                    <p className="text-sm text-muted-foreground">Quotes awaiting review</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="destructive" className="text-sm px-3 py-1">
                    {newSubmissions.length} pending
                  </Badge>
                  {isOpen ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <CardContent className="space-y-3 pt-0">
              {newSubmissions.map((submission) => (
                <div
                  key={submission.quote_id}
                  className="flex items-center justify-between p-4 bg-card rounded-lg border"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{submission.contact_name}</span>
                      <Badge variant="outline" className="text-xs">
                        {submission.quote_status === 'pending' ? 'New' : 'Under Review'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{submission.event_name}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(submission.event_date), 'MMM d, yyyy')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {submission.guest_count} guests
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {submission.location}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Submitted {formatDistanceToNow(new Date(submission.quote_created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <Button size="sm" onClick={() => setSelectedQuote(submission)}>
                    Review
                  </Button>
                </div>
              ))}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {selectedQuote && (
        <EventDetail quote={selectedQuote as any} onClose={() => setSelectedQuote(null)} />
      )}
    </>
  );
}
