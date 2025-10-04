import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { format, isPast, isToday, isTomorrow } from 'date-fns';
import { Calendar, MapPin, Users, Clock, CheckCircle2, Circle, AlertCircle, FileText, Plus } from 'lucide-react';

interface TimelineTask {
  id: string;
  task_name: string;
  task_type: 'pre-event' | 'day-of' | 'post-event';
  due_date: string | null;
  completed: boolean;
  completed_at: string | null;
  notes: string | null;
  quote_request_id: string;
}

interface EventDetails {
  id: string;
  event_name: string;
  event_date: string;
  contact_name: string;
  email: string;
  location: string;
  guest_count: number;
  event_type: string;
  service_type: string;
}

interface EventDetailModalProps {
  eventId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EventDetailModal({ eventId, open, onOpenChange }: EventDetailModalProps) {
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [tasks, setTasks] = useState<TimelineTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskType, setNewTaskType] = useState<'pre-event' | 'day-of' | 'post-event'>('pre-event');

  useEffect(() => {
    if (eventId && open) {
      fetchEventDetails();
      fetchTasks();
    }
  }, [eventId, open]);

  const fetchEventDetails = async () => {
    if (!eventId) return;
    
    const { data, error } = await supabase
      .from('quote_requests')
      .select('*')
      .eq('id', eventId)
      .single();

    if (!error && data) {
      setEvent(data as EventDetails);
    }
  };

  const fetchTasks = async () => {
    if (!eventId) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('event_timeline_tasks')
      .select('*')
      .eq('quote_request_id', eventId)
      .order('due_date', { ascending: true });

    if (!error && data) {
      setTasks(data as TimelineTask[]);
    }
    setLoading(false);
  };

  const toggleTask = async (taskId: string, completed: boolean) => {
    const { error } = await supabase
      .from('event_timeline_tasks')
      .update({ 
        completed,
        completed_at: completed ? new Date().toISOString() : null
      })
      .eq('id', taskId);

    if (!error) {
      setTasks(tasks.map(task => 
        task.id === taskId 
          ? { ...task, completed, completed_at: completed ? new Date().toISOString() : null }
          : task
      ));
    }
  };

  const addCustomTask = async () => {
    if (!newTaskName.trim() || !eventId) return;

    const { data, error } = await supabase
      .from('event_timeline_tasks')
      .insert({
        quote_request_id: eventId,
        task_name: newTaskName,
        task_type: newTaskType,
        completed: false
      })
      .select()
      .single();

    if (!error && data) {
      setTasks([...tasks, data as TimelineTask]);
      setNewTaskName('');
    }
  };

  const getTaskUrgency = (task: TimelineTask) => {
    if (!task.due_date || task.completed) return 'upcoming';
    const dueDate = new Date(task.due_date);
    if (isPast(dueDate)) return 'overdue';
    if (isToday(dueDate) || isTomorrow(dueDate)) return 'urgent';
    return 'upcoming';
  };

  const calculateProgress = () => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.completed).length;
    return Math.round((completed / tasks.length) * 100);
  };

  const groupedTasks = {
    'pre-event': tasks.filter(t => t.task_type === 'pre-event'),
    'day-of': tasks.filter(t => t.task_type === 'day-of'),
    'post-event': tasks.filter(t => t.task_type === 'post-event')
  };

  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{event.event_name}</DialogTitle>
        </DialogHeader>

        {/* Event Details */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{format(new Date(event.event_date), 'MMMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{event.guest_count} guests</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{event.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{event.event_type} - {event.service_type}</span>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{calculateProgress()}%</span>
          </div>
          <Progress value={calculateProgress()} />
        </div>

        {/* Add Custom Task */}
        <div className="flex gap-2">
          <Input
            placeholder="Add custom task..."
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addCustomTask()}
          />
          <select 
            className="px-3 py-2 border rounded-md bg-background"
            value={newTaskType}
            onChange={(e) => setNewTaskType(e.target.value as 'pre-event' | 'day-of' | 'post-event')}
          >
            <option value="pre-event">Pre-Event</option>
            <option value="day-of">Day-Of</option>
            <option value="post-event">Post-Event</option>
          </select>
          <Button onClick={addCustomTask} size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Task Timeline */}
        <div className="space-y-6">
          {(['pre-event', 'day-of', 'post-event'] as const).map((type) => (
            <div key={type}>
              <h3 className="font-semibold mb-3 capitalize">
                {type.replace('-', ' ')} ({groupedTasks[type].filter(t => t.completed).length}/{groupedTasks[type].length})
              </h3>
              <div className="space-y-2">
                {groupedTasks[type].map((task) => {
                  const urgency = getTaskUrgency(task);
                  return (
                    <div
                      key={task.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                        task.completed ? 'bg-muted/50' : 'bg-background'
                      } ${
                        urgency === 'overdue' ? 'border-destructive' :
                        urgency === 'urgent' ? 'border-orange-500' :
                        'border-border'
                      }`}
                    >
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={(checked) => toggleTask(task.id, checked as boolean)}
                        className="mt-1"
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={task.completed ? 'line-through text-muted-foreground' : ''}>
                            {task.task_name}
                          </span>
                          {!task.completed && urgency === 'overdue' && (
                            <Badge variant="destructive" className="text-xs">Overdue</Badge>
                          )}
                          {!task.completed && urgency === 'urgent' && (
                            <Badge className="text-xs bg-orange-500">Due Soon</Badge>
                          )}
                        </div>
                        {task.due_date && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {format(new Date(task.due_date), 'MMM d, yyyy h:mm a')}
                          </div>
                        )}
                        {task.notes && (
                          <p className="text-xs text-muted-foreground">{task.notes}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
