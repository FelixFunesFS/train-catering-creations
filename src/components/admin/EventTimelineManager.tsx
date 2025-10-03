import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, CheckCircle2, Circle, Send, Loader2 } from "lucide-react";
import { format, formatDistanceToNow, addDays, addHours } from "date-fns";

interface TimelineTask {
  id: string;
  task_name: string;
  task_type: 'pre_event' | 'day_of' | 'post_event';
  due_date: string | null;
  completed: boolean;
  notes: string | null;
}

interface EventDetails {
  id: string;
  event_name: string;
  event_date: string;
  start_time: string;
  contact_name: string;
  email: string;
  location: string;
  guest_count: number;
  status: string;
  primary_protein?: string;
  secondary_protein?: string;
}

export function EventTimelineManager() {
  const { toast } = useToast();
  const [events, setEvents] = useState<EventDetails[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [tasks, setTasks] = useState<TimelineTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingReminder, setSendingReminder] = useState(false);

  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      fetchEventTasks(selectedEvent);
    }
  }, [selectedEvent]);

  const fetchUpcomingEvents = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const thirtyDaysFromNow = addDays(new Date(), 30).toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('quote_requests')
        .select('*')
        .eq('status', 'confirmed')
        .gte('event_date', today)
        .lte('event_date', thirtyDaysFromNow)
        .order('event_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
      
      if (data && data.length > 0 && !selectedEvent) {
        setSelectedEvent(data[0].id);
      }
    } catch (error: any) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEventTasks = async (eventId: string) => {
    try {
      const { data: existingTasks, error: fetchError } = await supabase
        .from('event_timeline_tasks')
        .select('*')
        .eq('quote_request_id', eventId)
        .order('due_date', { ascending: true });

      if (fetchError) throw fetchError;

      // If no tasks exist, generate default ones
      if (!existingTasks || existingTasks.length === 0) {
        await generateDefaultTasks(eventId);
        return;
      }

      setTasks(existingTasks as TimelineTask[]);
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error",
        description: "Failed to load timeline tasks",
        variant: "destructive"
      });
    }
  };

  const generateDefaultTasks = async (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    const eventDate = new Date(event.event_date);
    
    const defaultTasks = [
      {
        quote_request_id: eventId,
        task_name: 'Contract signed',
        task_type: 'pre_event',
        due_date: addDays(eventDate, -7).toISOString()
      },
      {
        quote_request_id: eventId,
        task_name: 'Final payment received',
        task_type: 'pre_event',
        due_date: addDays(eventDate, -3).toISOString()
      },
      {
        quote_request_id: eventId,
        task_name: 'Menu confirmed with customer',
        task_type: 'pre_event',
        due_date: addDays(eventDate, -3).toISOString()
      },
      {
        quote_request_id: eventId,
        task_name: 'Staff assigned',
        task_type: 'pre_event',
        due_date: addDays(eventDate, -2).toISOString()
      },
      {
        quote_request_id: eventId,
        task_name: 'Supplies packed',
        task_type: 'day_of',
        due_date: addDays(eventDate, -1).toISOString()
      },
      {
        quote_request_id: eventId,
        task_name: 'Equipment loaded',
        task_type: 'day_of',
        due_date: eventDate.toISOString()
      },
      {
        quote_request_id: eventId,
        task_name: 'Arrive at venue',
        task_type: 'day_of',
        due_date: event.start_time 
          ? addHours(new Date(`${event.event_date}T${event.start_time}`), -2).toISOString()
          : addHours(eventDate, 8).toISOString()
      },
      {
        quote_request_id: eventId,
        task_name: 'Setup complete',
        task_type: 'day_of',
        due_date: event.start_time 
          ? new Date(`${event.event_date}T${event.start_time}`).toISOString()
          : addHours(eventDate, 10).toISOString()
      },
      {
        quote_request_id: eventId,
        task_name: 'Send thank you email',
        task_type: 'post_event',
        due_date: addDays(eventDate, 1).toISOString()
      }
    ];

    const { data, error } = await supabase
      .from('event_timeline_tasks')
      .insert(defaultTasks)
      .select();

    if (error) {
      console.error('Error generating tasks:', error);
      return;
    }

    setTasks((data as TimelineTask[]) || []);
  };

  const toggleTask = async (taskId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('event_timeline_tasks')
        .update({
          completed,
          completed_at: completed ? new Date().toISOString() : null,
          completed_by: completed ? 'admin' : null
        })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(tasks.map(t => 
        t.id === taskId 
          ? { ...t, completed, completed_at: completed ? new Date().toISOString() : null }
          : t
      ));

      toast({
        title: completed ? "Task Completed" : "Task Reopened",
        description: "Timeline updated successfully"
      });
    } catch (error: any) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive"
      });
    }
  };

  const sendPreEventReminder = async (reminderType: '7-day' | '48-hour') => {
    if (!selectedEvent) return;

    try {
      setSendingReminder(true);
      
      const { error } = await supabase.functions.invoke('send-event-reminders', {
        body: { eventId: selectedEvent, reminderType }
      });

      if (error) throw error;

      toast({
        title: "Reminder Sent",
        description: `${reminderType} reminder sent successfully`
      });
    } catch (error: any) {
      console.error('Error sending reminder:', error);
      toast({
        title: "Error",
        description: "Failed to send reminder",
        variant: "destructive"
      });
    } finally {
      setSendingReminder(false);
    }
  };

  const selectedEventDetails = events.find(e => e.id === selectedEvent);
  const daysUntilEvent = selectedEventDetails 
    ? Math.ceil((new Date(selectedEventDetails.event_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">No Upcoming Events</h3>
        <p className="text-muted-foreground">
          Confirmed events will appear here for timeline management.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Event Selector */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">Upcoming Events ({events.length})</h2>
        <div className="grid gap-2">
          {events.map(event => {
            const days = Math.ceil((new Date(event.event_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            const isSelected = selectedEvent === event.id;
            
            return (
              <Button
                key={event.id}
                variant={isSelected ? "default" : "outline"}
                className="w-full justify-start h-auto p-4"
                onClick={() => setSelectedEvent(event.id)}
              >
                <div className="flex items-start justify-between w-full">
                  <div className="text-left">
                    <div className="font-semibold">{event.event_name}</div>
                    <div className="text-sm opacity-80">
                      {format(new Date(event.event_date), 'MMMM d, yyyy')} • {event.guest_count} guests
                    </div>
                  </div>
                  <Badge variant={days <= 2 ? "destructive" : days <= 7 ? "default" : "secondary"}>
                    {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days} days`}
                  </Badge>
                </div>
              </Button>
            );
          })}
        </div>
      </Card>

      {/* Selected Event Details & Timeline */}
      {selectedEventDetails && (
        <>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold">{selectedEventDetails.event_name}</h2>
                <p className="text-muted-foreground">
                  {format(new Date(selectedEventDetails.event_date), 'EEEE, MMMM d, yyyy')}
                  {selectedEventDetails.start_time && ` at ${selectedEventDetails.start_time}`}
                </p>
              </div>
              <Badge variant={daysUntilEvent <= 2 ? "destructive" : daysUntilEvent <= 7 ? "default" : "secondary"} className="text-lg py-2 px-4">
                {daysUntilEvent === 0 ? 'TODAY' : daysUntilEvent === 1 ? 'TOMORROW' : `${daysUntilEvent} DAYS`}
              </Badge>
            </div>

            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Contact:</span> {selectedEventDetails.contact_name}
              </div>
              <div>
                <span className="text-muted-foreground">Email:</span> {selectedEventDetails.email}
              </div>
              <div>
                <span className="text-muted-foreground">Location:</span> {selectedEventDetails.location}
              </div>
              <div>
                <span className="text-muted-foreground">Guests:</span> {selectedEventDetails.guest_count}
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button
                size="sm"
                variant="outline"
                onClick={() => sendPreEventReminder('7-day')}
                disabled={sendingReminder || daysUntilEvent !== 7}
              >
                <Send className="h-4 w-4 mr-2" />
                Send 7-Day Reminder
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => sendPreEventReminder('48-hour')}
                disabled={sendingReminder || daysUntilEvent !== 2}
              >
                <Send className="h-4 w-4 mr-2" />
                Send 48-Hour Reminder
              </Button>
            </div>
          </Card>

          {/* Timeline Checklist */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Event Timeline & Checklist
            </h3>

            <div className="space-y-6">
              {/* Pre-Event Tasks */}
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-3">PRE-EVENT PREPARATION</h4>
                <div className="space-y-2">
                  {tasks.filter(t => t.task_type === 'pre_event').map(task => (
                    <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={(checked) => toggleTask(task.id, checked as boolean)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {task.task_name}
                        </div>
                        {task.due_date && (
                          <div className="text-sm text-muted-foreground">
                            Due: {format(new Date(task.due_date), 'MMM d, yyyy')}
                          </div>
                        )}
                      </div>
                      {task.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Day-Of Tasks */}
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-3">DAY-OF TIMELINE</h4>
                <div className="space-y-2">
                  {tasks.filter(t => t.task_type === 'day_of').map(task => (
                    <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={(checked) => toggleTask(task.id, checked as boolean)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {task.task_name}
                        </div>
                        {task.due_date && (
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(task.due_date), 'h:mm a')}
                          </div>
                        )}
                      </div>
                      {task.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Post-Event Tasks */}
              {tasks.some(t => t.task_type === 'post_event') && (
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-3">POST-EVENT FOLLOW-UP</h4>
                  <div className="space-y-2">
                    {tasks.filter(t => t.task_type === 'post_event').map(task => (
                      <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={(checked) => toggleTask(task.id, checked as boolean)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                            {task.task_name}
                          </div>
                          {task.due_date && (
                            <div className="text-sm text-muted-foreground">
                              Due: {format(new Date(task.due_date), 'MMM d, yyyy')}
                            </div>
                          )}
                        </div>
                        {task.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
