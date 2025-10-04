import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, CheckCircle2, Circle, Send, Loader2, Plus, AlertCircle, Filter } from "lucide-react";
import { format, formatDistanceToNow, addDays, addHours, isPast, isToday, isTomorrow } from "date-fns";

interface TimelineTask {
  id: string;
  quote_request_id: string;
  task_name: string;
  task_type: 'pre_event' | 'day_of' | 'post_event';
  due_date: string | null;
  completed: boolean;
  completed_at?: string | null;
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

type FilterType = 'all' | 'behind' | 'on-track';

export function EventTimelineManager() {
  const { toast } = useToast();
  const [events, setEvents] = useState<EventDetails[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [tasks, setTasks] = useState<TimelineTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingReminder, setSendingReminder] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [newTaskName, setNewTaskName] = useState('');
  const [addingTask, setAddingTask] = useState(false);

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

  const addCustomTask = async () => {
    if (!selectedEvent || !newTaskName.trim()) return;

    try {
      setAddingTask(true);
      const { data, error } = await supabase
        .from('event_timeline_tasks')
        .insert({
          quote_request_id: selectedEvent,
          task_name: newTaskName.trim(),
          task_type: 'pre_event',
          due_date: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      setTasks([...tasks, data as TimelineTask]);
      setNewTaskName('');
      
      toast({
        title: "Task Added",
        description: "Custom task created successfully"
      });
    } catch (error: any) {
      console.error('Error adding task:', error);
      toast({
        title: "Error",
        description: "Failed to add task",
        variant: "destructive"
      });
    } finally {
      setAddingTask(false);
    }
  };

  const getTaskUrgency = (task: TimelineTask) => {
    if (!task.due_date || task.completed) return 'none';
    const dueDate = new Date(task.due_date);
    if (isPast(dueDate)) return 'overdue';
    if (isToday(dueDate) || isTomorrow(dueDate)) return 'urgent';
    return 'upcoming';
  };

  const calculateProgress = (eventId: string) => {
    const eventTasks = tasks.filter(t => t.quote_request_id === eventId);
    if (eventTasks.length === 0) return 0;
    const completed = eventTasks.filter(t => t.completed).length;
    return Math.round((completed / eventTasks.length) * 100);
  };

  const getFilteredEvents = () => {
    if (filter === 'all') return events;
    
    const eventsWithProgress = events.map(event => {
      const eventTasks = tasks.length > 0 ? tasks : [];
      const overdueTasks = eventTasks.filter(t => 
        !t.completed && t.due_date && isPast(new Date(t.due_date))
      ).length;
      const progress = calculateProgress(event.id);
      
      return { event, overdueTasks, progress };
    });

    if (filter === 'behind') {
      return eventsWithProgress
        .filter(({ overdueTasks, progress }) => overdueTasks > 0 || progress < 50)
        .map(({ event }) => event);
    }

    return eventsWithProgress
      .filter(({ overdueTasks, progress }) => overdueTasks === 0 && progress >= 50)
      .map(({ event }) => event);
  };

  const selectedEventDetails = events.find(e => e.id === selectedEvent);
  const daysUntilEvent = selectedEventDetails 
    ? Math.ceil((new Date(selectedEventDetails.event_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  
  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const overdueTasks = tasks.filter(t => !t.completed && t.due_date && isPast(new Date(t.due_date)));
  
  const filteredEvents = getFilteredEvents();

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
      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          <Filter className="h-4 w-4 mr-2" />
          All Events ({events.length})
        </Button>
        <Button
          variant={filter === 'behind' ? 'destructive' : 'outline'}
          size="sm"
          onClick={() => setFilter('behind')}
        >
          <AlertCircle className="h-4 w-4 mr-2" />
          Behind Schedule
        </Button>
        <Button
          variant={filter === 'on-track' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('on-track')}
        >
          <CheckCircle2 className="h-4 w-4 mr-2" />
          On Track
        </Button>
      </div>

      {/* Event Selector */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">
          {filter === 'all' ? 'All Upcoming Events' : 
           filter === 'behind' ? 'Events Behind Schedule' : 
           'Events On Track'}
        </h2>
        <div className="grid gap-3">
          {filteredEvents.map(event => {
            const days = Math.ceil((new Date(event.event_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            const isSelected = selectedEvent === event.id;
            const eventProgress = calculateProgress(event.id);
            const eventOverdue = tasks.filter(t => 
              !t.completed && t.due_date && isPast(new Date(t.due_date))
            ).length;
            
            return (
              <div key={event.id} className="space-y-2">
                <Button
                  variant={isSelected ? "default" : "outline"}
                  className="w-full justify-start h-auto p-4"
                  onClick={() => setSelectedEvent(event.id)}
                >
                  <div className="flex items-start justify-between w-full gap-4">
                    <div className="text-left flex-1">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold">{event.event_name}</div>
                        {eventOverdue > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {eventOverdue} overdue
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm opacity-80">
                        {format(new Date(event.event_date), 'MMMM d, yyyy')} • {event.guest_count} guests
                      </div>
                    </div>
                    <Badge variant={days <= 2 ? "destructive" : days <= 7 ? "default" : "secondary"}>
                      {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days} days`}
                    </Badge>
                  </div>
                </Button>
                {isSelected && (
                  <div className="px-4 space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{eventProgress}%</span>
                    </div>
                    <Progress value={eventProgress} className="h-2" />
                  </div>
                )}
              </div>
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
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Event Timeline & Checklist
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {completedTasks} of {totalTasks} tasks completed
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{progressPercent}%</div>
                {overdueTasks.length > 0 && (
                  <Badge variant="destructive" className="mt-1">
                    {overdueTasks.length} overdue
                  </Badge>
                )}
              </div>
            </div>

            <Progress value={progressPercent} className="h-3 mb-6" />

            {/* Add Custom Task */}
            <div className="mb-6 p-4 border rounded-lg bg-muted/50">
              <div className="flex gap-2">
                <Input
                  placeholder="Add custom task..."
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCustomTask()}
                />
                <Button 
                  onClick={addCustomTask} 
                  disabled={!newTaskName.trim() || addingTask}
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              {/* Pre-Event Tasks */}
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-3">PRE-EVENT PREPARATION</h4>
                <div className="space-y-2">
                  {tasks.filter(t => t.task_type === 'pre_event').map(task => {
                    const urgency = getTaskUrgency(task);
                    const borderColor = urgency === 'overdue' ? 'border-destructive' : 
                                       urgency === 'urgent' ? 'border-yellow-500' : 
                                       'border-border';
                    
                    return (
                      <div key={task.id} className={`flex items-start gap-3 p-3 rounded-lg border-2 ${borderColor} bg-card hover:bg-accent/50 transition-colors`}>
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={(checked) => toggleTask(task.id, checked as boolean)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                              {task.task_name}
                            </div>
                            {urgency === 'overdue' && !task.completed && (
                              <Badge variant="destructive" className="text-xs">OVERDUE</Badge>
                            )}
                            {urgency === 'urgent' && !task.completed && (
                              <Badge variant="default" className="text-xs bg-yellow-500">DUE SOON</Badge>
                            )}
                          </div>
                          {task.due_date && (
                            <div className="text-sm text-muted-foreground">
                              Due: {format(new Date(task.due_date), 'MMM d, yyyy h:mm a')}
                            </div>
                          )}
                        </div>
                        {task.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : urgency === 'overdue' ? (
                          <AlertCircle className="h-5 w-5 text-destructive" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Day-Of Tasks */}
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-3">DAY-OF TIMELINE</h4>
                <div className="space-y-2">
                  {tasks.filter(t => t.task_type === 'day_of').map(task => {
                    const urgency = getTaskUrgency(task);
                    const borderColor = urgency === 'overdue' ? 'border-destructive' : 
                                       urgency === 'urgent' ? 'border-yellow-500' : 
                                       'border-border';
                    
                    return (
                      <div key={task.id} className={`flex items-start gap-3 p-3 rounded-lg border-2 ${borderColor} bg-card hover:bg-accent/50 transition-colors`}>
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={(checked) => toggleTask(task.id, checked as boolean)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                              {task.task_name}
                            </div>
                            {urgency === 'overdue' && !task.completed && (
                              <Badge variant="destructive" className="text-xs">OVERDUE</Badge>
                            )}
                            {urgency === 'urgent' && !task.completed && (
                              <Badge variant="default" className="text-xs bg-yellow-500">DUE SOON</Badge>
                            )}
                          </div>
                          {task.due_date && (
                            <div className="text-sm text-muted-foreground">
                              {format(new Date(task.due_date), 'h:mm a')}
                            </div>
                          )}
                        </div>
                        {task.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : urgency === 'overdue' ? (
                          <AlertCircle className="h-5 w-5 text-destructive" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Post-Event Tasks */}
              {tasks.some(t => t.task_type === 'post_event') && (
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-3">POST-EVENT FOLLOW-UP</h4>
                  <div className="space-y-2">
                    {tasks.filter(t => t.task_type === 'post_event').map(task => {
                      const urgency = getTaskUrgency(task);
                      const borderColor = urgency === 'overdue' ? 'border-destructive' : 
                                         urgency === 'urgent' ? 'border-yellow-500' : 
                                         'border-border';
                      
                      return (
                        <div key={task.id} className={`flex items-start gap-3 p-3 rounded-lg border-2 ${borderColor} bg-card hover:bg-accent/50 transition-colors`}>
                          <Checkbox
                            checked={task.completed}
                            onCheckedChange={(checked) => toggleTask(task.id, checked as boolean)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <div className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                                {task.task_name}
                              </div>
                              {urgency === 'overdue' && !task.completed && (
                                <Badge variant="destructive" className="text-xs">OVERDUE</Badge>
                              )}
                              {urgency === 'urgent' && !task.completed && (
                                <Badge variant="default" className="text-xs bg-yellow-500">DUE SOON</Badge>
                              )}
                            </div>
                            {task.due_date && (
                              <div className="text-sm text-muted-foreground">
                                Due: {format(new Date(task.due_date), 'MMM d, yyyy')}
                              </div>
                            )}
                          </div>
                          {task.completed ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : urgency === 'overdue' ? (
                            <AlertCircle className="h-5 w-5 text-destructive" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      );
                    })}
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
