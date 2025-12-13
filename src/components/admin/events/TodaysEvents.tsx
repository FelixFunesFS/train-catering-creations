import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEvents } from '@/hooks/useEvents';
import { useUpdateQuoteStatus } from '@/hooks/useQuotes';
import { useToast } from '@/hooks/use-toast';
import { CalendarCheck, Play, CheckCircle, MapPin, Users, Clock, Loader2 } from 'lucide-react';

export function TodaysEvents() {
  const { data: events, isLoading } = useEvents();
  const updateStatus = useUpdateQuoteStatus();
  const { toast } = useToast();

  const today = format(new Date(), 'yyyy-MM-dd');
  
  const todaysEvents = events?.filter(event => event.event_date === today) || [];

  const handleStatusChange = async (quoteId: string, newStatus: 'in_progress' | 'completed') => {
    try {
      await updateStatus.mutateAsync({ quoteId, status: newStatus });
      toast({
        title: 'Status Updated',
        description: `Event marked as ${newStatus.replace('_', ' ')}`,
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-blue-500/10 text-blue-700 border-blue-500/20">Confirmed</Badge>;
      case 'in_progress':
        return <Badge className="bg-amber-500/10 text-amber-700 border-amber-500/20">In Progress</Badge>;
      case 'completed':
        return <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20">Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-primary" />
            Today's Events
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarCheck className="h-5 w-5 text-primary" />
          Today's Events
          {todaysEvents.length > 0 && (
            <Badge variant="secondary" className="ml-auto">{todaysEvents.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {todaysEvents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CalendarCheck className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No events scheduled for today</p>
          </div>
        ) : (
          <div className="space-y-4">
            {todaysEvents.map((event) => (
              <div 
                key={event.quote_id} 
                className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{event.event_name}</h4>
                    <p className="text-sm text-muted-foreground">{event.contact_name}</p>
                  </div>
                  {getStatusBadge(event.quote_status || 'pending')}
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {event.start_time || 'TBD'}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    {event.guest_count} guests
                  </div>
                  <div className="flex items-center gap-1.5 col-span-2 sm:col-span-1">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>
                </div>

                {/* Quick Status Actions */}
                {event.quote_status !== 'completed' && event.quote_status !== 'cancelled' && (
                  <div className="flex gap-2">
                    {event.quote_status === 'confirmed' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleStatusChange(event.quote_id!, 'in_progress')}
                        disabled={updateStatus.isPending}
                        className="flex-1"
                      >
                        <Play className="h-3.5 w-3.5 mr-1.5" />
                        Start Event
                      </Button>
                    )}
                    {(event.quote_status === 'confirmed' || event.quote_status === 'in_progress') && (
                      <Button 
                        size="sm" 
                        variant="default"
                        onClick={() => handleStatusChange(event.quote_id!, 'completed')}
                        disabled={updateStatus.isPending}
                        className="flex-1"
                      >
                        <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                        Complete
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
