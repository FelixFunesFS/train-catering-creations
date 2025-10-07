import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Users, MapPin, Clock, CheckCircle2, Phone, Mail } from 'lucide-react';
import { format, isToday, isTomorrow } from 'date-fns';

interface TodayEvent {
  id: string;
  event_name: string;
  event_date: string;
  start_time: string;
  contact_name: string;
  phone: string;
  email: string;
  guest_count: number;
  location: string;
  workflow_status: string;
  service_type: string;
}

const EVENT_CHECKLIST = [
  'Staff confirmed',
  'Equipment loaded',
  'Menu items prepared',
  'Venue contacted',
  'Final headcount confirmed',
  'Setup time verified',
];

export function TodaysEventsPanel() {
  const [events, setEvents] = useState<TodayEvent[]>([]);
  const [checklist, setChecklist] = useState<Record<string, Set<number>>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTodaysEvents();
  }, []);

  const loadTodaysEvents = async () => {
    try {
      setLoading(true);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 2);

      const { data, error } = await supabase
        .from('quote_requests')
        .select('*')
        .gte('event_date', today.toISOString().split('T')[0])
        .lt('event_date', tomorrow.toISOString().split('T')[0])
        .order('start_time', { ascending: true });

      if (error) throw error;
      setEvents(data as TodayEvent[]);

      // Initialize checklist
      const initialChecklist: Record<string, Set<number>> = {};
      data?.forEach(event => {
        initialChecklist[event.id] = new Set();
      });
      setChecklist(initialChecklist);
    } catch (error) {
      console.error('Error loading today\'s events:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleChecklistItem = (eventId: string, itemIndex: number) => {
    setChecklist(prev => {
      const newChecklist = { ...prev };
      const eventChecklist = new Set(newChecklist[eventId] || []);
      
      if (eventChecklist.has(itemIndex)) {
        eventChecklist.delete(itemIndex);
      } else {
        eventChecklist.add(itemIndex);
      }
      
      newChecklist[eventId] = eventChecklist;
      return newChecklist;
    });
  };

  const getCompletionPercentage = (eventId: string) => {
    const completed = checklist[eventId]?.size || 0;
    return Math.round((completed / EVENT_CHECKLIST.length) * 100);
  };

  if (loading) {
    return <div className="animate-pulse">Loading today's events...</div>;
  }

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Events Today</h3>
          <p className="text-muted-foreground">You're all clear for today!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Today's Events
          </h2>
          <p className="text-muted-foreground">
            {format(new Date(), 'EEEE, MMMM dd, yyyy')}
          </p>
        </div>
        <Badge variant="default" className="text-lg px-4 py-2">
          {events.length} {events.length === 1 ? 'Event' : 'Events'}
        </Badge>
      </div>

      <div className="grid gap-6">
        {events.map(event => {
          const eventDate = new Date(event.event_date);
          const completionPct = getCompletionPercentage(event.id);
          
          return (
            <Card key={event.id} className="border-l-4 border-l-primary">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{event.event_name}</CardTitle>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {event.start_time ? format(new Date(`2000-01-01T${event.start_time}`), 'h:mm a') : 'TBD'}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="h-4 w-4" />
                          {event.guest_count} guests
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {event.location}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          {event.phone}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          {event.email}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <span className="text-2xl font-bold">{completionPct}%</span>
                    </div>
                    <Badge variant={completionPct === 100 ? 'default' : 'secondary'}>
                      {isToday(eventDate) ? 'Today' : isTomorrow(eventDate) ? 'Tomorrow' : format(eventDate, 'MMM dd')}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm mb-3">Event Checklist</h4>
                  {EVENT_CHECKLIST.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded">
                      <Checkbox
                        id={`${event.id}-${idx}`}
                        checked={checklist[event.id]?.has(idx)}
                        onCheckedChange={() => toggleChecklistItem(event.id, idx)}
                      />
                      <label
                        htmlFor={`${event.id}-${idx}`}
                        className={`flex-1 text-sm cursor-pointer ${
                          checklist[event.id]?.has(idx) ? 'line-through text-muted-foreground' : ''
                        }`}
                      >
                        {item}
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
