import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useEventChecklist } from '@/hooks/useEventChecklist';
import { Plus, CheckCircle2, Circle, Calendar, Trash2, Loader2, ListChecks } from 'lucide-react';
import { format, isPast, isFuture, isToday } from 'date-fns';

interface EventChecklistManagerProps {
  quoteRequestId: string;
  eventDate: string;
  eventType: string;
}

export function EventChecklistManager({ quoteRequestId, eventDate, eventType }: EventChecklistManagerProps) {
  const { tasks, loading, createTask, toggleTask, deleteTask, generateStandardChecklist } = useEventChecklist(quoteRequestId);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({
    task_name: '',
    task_type: 'preparation',
    due_date: '',
    notes: ''
  });

  const handleAddTask = async () => {
    await createTask(newTask);
    setNewTask({ task_name: '', task_type: 'preparation', due_date: '', notes: '' });
    setShowAddTask(false);
  };

  const getTaskStatus = (task: any) => {
    if (task.completed) return 'completed';
    if (!task.due_date) return 'no-date';
    if (isPast(new Date(task.due_date)) && !task.completed) return 'overdue';
    if (isToday(new Date(task.due_date))) return 'due-today';
    return 'upcoming';
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      completed: <Badge variant="default">Completed</Badge>,
      overdue: <Badge variant="destructive">Overdue</Badge>,
      'due-today': <Badge className="bg-orange-600">Due Today</Badge>,
      upcoming: <Badge variant="outline">Upcoming</Badge>,
      'no-date': <Badge variant="secondary">No Date</Badge>
    };
    return badges[status as keyof typeof badges];
  };

  const groupedTasks = tasks.reduce((acc, task) => {
    const type = task.task_type || 'other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(task);
    return acc;
  }, {} as Record<string, any[]>);

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Progress */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ListChecks className="h-5 w-5" />
                Event Preparation Checklist
              </CardTitle>
              <CardDescription>
                Track all tasks leading up to and during the event
              </CardDescription>
            </div>
            {tasks.length === 0 && (
              <Button onClick={() => generateStandardChecklist(eventDate, eventType)}>
                Generate Checklist
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{completedCount} of {totalCount} tasks completed</span>
              <span>{completionPercentage}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks by Category */}
      {Object.entries(groupedTasks).map(([type, typeTasks]: [string, any[]]) => (
        <Card key={type}>
          <CardHeader>
            <CardTitle className="text-lg capitalize">{type.replace('_', ' ')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {typeTasks.map(task => {
              const status = getTaskStatus(task);
              return (
                <div key={task.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {task.task_name}
                      </p>
                      {getStatusBadge(status)}
                    </div>
                    {task.notes && (
                      <p className="text-sm text-muted-foreground mt-1">{task.notes}</p>
                    )}
                    {task.due_date && (
                      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(task.due_date), 'MMM dd, yyyy')}
                      </p>
                    )}
                    {task.completed && task.completed_at && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Completed {format(new Date(task.completed_at), 'MMM dd, yyyy')}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteTask(task.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}

      {/* Add Task */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add Custom Task</CardTitle>
        </CardHeader>
        <CardContent>
          {showAddTask ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Task name"
                  value={newTask.task_name}
                  onChange={(e) => setNewTask({ ...newTask, task_name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={newTask.task_type}
                  onChange={(e) => setNewTask({ ...newTask, task_type: e.target.value })}
                >
                  <option value="preparation">Preparation</option>
                  <option value="confirmation">Confirmation</option>
                  <option value="logistics">Logistics</option>
                  <option value="execution">Execution</option>
                  <option value="follow_up">Follow-up</option>
                </select>
                <Input
                  type="date"
                  value={newTask.due_date}
                  onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                />
              </div>
              <Textarea
                placeholder="Notes (optional)"
                value={newTask.notes}
                onChange={(e) => setNewTask({ ...newTask, notes: e.target.value })}
                rows={2}
              />
              <div className="flex gap-2">
                <Button onClick={handleAddTask} disabled={!newTask.task_name}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
                <Button variant="outline" onClick={() => setShowAddTask(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={() => setShowAddTask(true)} variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Custom Task
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
