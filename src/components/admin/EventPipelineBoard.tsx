import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Users, MapPin, DollarSign, ArrowRight, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { EventPipelineColumnSkeleton } from '@/components/shared/LoadingSkeleton';
import { NoPendingQuotes } from '@/components/shared/EmptyStates';

interface Event {
  id: string;
  event_name: string;
  event_date: string;
  contact_name: string;
  guest_count: number;
  location: string;
  workflow_status: string;
  invoices: Array<{
    id: string;
    total_amount: number;
    workflow_status: string;
  }>;
}

const STATUS_COLUMNS = [
  { id: 'pending', label: 'New Requests', color: 'bg-blue-500' },
  { id: 'under_review', label: 'Under Review', color: 'bg-amber-500' },
  { id: 'quoted', label: 'Quoted', color: 'bg-purple-500' },
  { id: 'estimated', label: 'Estimate Sent', color: 'bg-indigo-500' },
  { id: 'approved', label: 'Approved', color: 'bg-green-500' },
  { id: 'paid', label: 'Paid', color: 'bg-emerald-600' },
  { id: 'confirmed', label: 'Confirmed', color: 'bg-teal-600' },
];

export function EventPipelineBoard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('quote_requests')
        .select(`
          id,
          event_name,
          event_date,
          contact_name,
          guest_count,
          location,
          workflow_status,
          invoices!invoices_quote_request_id_fkey(id, total_amount, workflow_status)
        `)
        .order('event_date', { ascending: true });

      if (error) throw error;
      setEvents(data as Event[]);
    } catch (error) {
      console.error('Error loading events:', error);
      toast({
        title: 'Error',
        description: 'Failed to load events',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getEventsForColumn = (status: string) => {
    return events.filter(event => event.workflow_status === status);
  };

  const handleEventClick = (eventId: string) => {
    navigate(`/admin/quotes/${eventId}`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Event Pipeline</h2>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STATUS_COLUMNS.map((_, idx) => (
            <EventPipelineColumnSkeleton key={idx} />
          ))}
        </div>
      </div>
    );
  }

  const hasEvents = events.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Event Pipeline</h2>
          <p className="text-muted-foreground">Track all events through the workflow</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {events.length} Total Events
        </Badge>
      </div>

      {!hasEvents ? (
        <NoPendingQuotes />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {STATUS_COLUMNS.map(column => {
            const columnEvents = getEventsForColumn(column.id);
            
            return (
              <div key={column.id} className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${column.color}`} />
                  <h3 className="font-semibold text-sm">{column.label}</h3>
                  <Badge variant="secondary" className="ml-auto">
                    {columnEvents.length}
                  </Badge>
                </div>

                <div className="space-y-2 min-h-[200px]">
                  {columnEvents.map(event => (
                    <Card 
                      key={event.id}
                      className="cursor-pointer hover:shadow-md transition-shadow border-l-4"
                      style={{ borderLeftColor: column.color.replace('bg-', '') }}
                      onClick={() => handleEventClick(event.id)}
                    >
                      <CardContent className="p-3 space-y-2">
                        <div className="font-medium text-sm line-clamp-2">
                          {event.event_name}
                        </div>
                        
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(event.event_date), 'MMM dd, yyyy')}
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {event.guest_count} guests
                          </div>
                          
                          <div className="flex items-center gap-1 line-clamp-1">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            {event.location}
                          </div>

                          {event.invoices?.[0] && (
                            <div className="flex items-center gap-1 font-medium text-primary">
                              <DollarSign className="h-3 w-3" />
                              ${(event.invoices[0].total_amount / 100).toFixed(0)}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-xs text-muted-foreground">
                            {event.contact_name}
                          </span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {columnEvents.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No events
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
