import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Calendar, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TimelineTask {
  id: string;
  task_name: string;
  task_type: string;
  due_date: string | null;
  completed: boolean;
  completed_at: string | null;
  completed_by: string | null;
  notes: string | null;
  days_before_event: number | null;
}

interface TimelineTasksPanelProps {
  quoteId: string;
  eventDate: string;
  onBack?: () => void;
}

export function TimelineTasksPanel({ quoteId, eventDate, onBack }: TimelineTasksPanelProps) {
  const [tasks, setTasks] = useState<TimelineTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [taskNotes, setTaskNotes] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchTasks();
  }, [quoteId]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('event_timeline_tasks')
        .select('*')
        .eq('quote_request_id', quoteId)
        .order('due_date', { ascending: true });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error",
        description: "Failed to load timeline tasks",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskComplete = async (taskId: string, currentStatus: boolean) => {
    try {
      const update: any = {
        completed: !currentStatus,
        completed_at: !currentStatus ? new Date().toISOString() : null,
        completed_by: !currentStatus ? 'admin' : null
      };

      if (taskNotes[taskId]) {
        update.notes = taskNotes[taskId];
      }

      const { error } = await supabase
        .from('event_timeline_tasks')
        .update(update)
        .eq('id', taskId);

      if (error) throw error;

      await fetchTasks();
      toast({
        title: !currentStatus ? "Task Completed" : "Task Reopened",
        description: !currentStatus ? "Task marked as complete" : "Task marked as incomplete"
      });
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive"
      });
    }
  };

  const getTaskStatus = (task: TimelineTask) => {
    if (task.completed) return 'completed';
    if (!task.due_date) return 'scheduled';
    
    const dueDate = new Date(task.due_date);
    const today = new Date();
    
    if (dueDate < today) return 'overdue';
    if (dueDate.getTime() - today.getTime() < 3 * 24 * 60 * 60 * 1000) return 'due-soon';
    return 'scheduled';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'overdue':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Overdue</Badge>;
      case 'due-soon':
        return <Badge className="bg-orange-500"><Calendar className="w-3 h-3 mr-1" />Due Soon</Badge>;
      default:
        return <Badge variant="outline"><Circle className="w-3 h-3 mr-1" />Scheduled</Badge>;
    }
  };

  const groupedTasks = tasks.reduce((acc, task) => {
    if (!acc[task.task_type]) acc[task.task_type] = [];
    acc[task.task_type].push(task);
    return acc;
  }, {} as { [key: string]: TimelineTask[] });

  const completedCount = tasks.filter(t => t.completed).length;
  const overdueCount = tasks.filter(t => getTaskStatus(t) === 'overdue').length;

  if (loading) {
    return <Card><CardContent className="py-8 text-center">Loading tasks...</CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Event Timeline Tasks</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {completedCount} of {tasks.length} tasks completed
              {overdueCount > 0 && <span className="text-destructive ml-2">• {overdueCount} overdue</span>}
            </p>
          </div>
          {onBack && (
            <Button onClick={onBack} variant="outline">
              Back
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0}%` }}
          />
        </div>

        {/* Grouped Tasks */}
        {Object.entries(groupedTasks).map(([type, typeTasks]) => (
          <div key={type} className="space-y-3">
            <h3 className="font-semibold text-lg capitalize">
              {type.replace(/_/g, ' ')} Tasks
            </h3>
            
            {typeTasks.map((task) => {
              const status = getTaskStatus(task);
              
              return (
                <div 
                  key={task.id} 
                  className={`border rounded-lg p-4 ${
                    task.completed ? 'bg-muted/50' : 'bg-background'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => toggleTaskComplete(task.id, task.completed)}
                      className="mt-1"
                    />
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                            {task.task_name}
                          </p>
                          {task.due_date && (
                            <p className="text-sm text-muted-foreground">
                              Due: {new Date(task.due_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        {getStatusBadge(status)}
                      </div>

                      {task.completed && task.completed_at && (
                        <p className="text-sm text-muted-foreground">
                          Completed on {new Date(task.completed_at).toLocaleDateString()} by {task.completed_by}
                        </p>
                      )}

                      {task.notes && (
                        <div className="bg-muted/50 p-2 rounded text-sm">
                          <strong>Notes:</strong> {task.notes}
                        </div>
                      )}

                      {!task.completed && (
                        <Textarea
                          placeholder="Add notes for this task..."
                          value={taskNotes[task.id] || ''}
                          onChange={(e) => setTaskNotes(prev => ({ ...prev, [task.id]: e.target.value }))}
                          className="text-sm"
                          rows={2}
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {tasks.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No timeline tasks created yet</p>
            <p className="text-sm">Tasks will be created automatically when the event is confirmed</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
