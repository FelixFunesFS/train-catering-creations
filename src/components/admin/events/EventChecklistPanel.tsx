import { useState } from 'react';
import { format, parseISO, isPast, isToday } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, ListChecks, Calendar, AlertCircle, 
  CheckCircle2, Circle, Loader2, ChevronDown, ChevronUp
} from 'lucide-react';
import { useEventChecklist } from '@/hooks/useEventChecklist';

interface EventChecklistPanelProps {
  quoteId: string;
  eventDate: string;
  eventType: string;
  compact?: boolean;
  allowExpand?: boolean;
}

// Task type colors matching database CHECK constraint values
const taskTypeColors: Record<string, string> = {
  pre_event: 'bg-blue-100 text-blue-700 border-blue-200',
  day_of: 'bg-orange-100 text-orange-700 border-orange-200',
  post_event: 'bg-green-100 text-green-700 border-green-200',
};

const taskTypeLabels: Record<string, string> = {
  pre_event: 'Pre-Event',
  day_of: 'Day Of',
  post_event: 'Post-Event',
};

export function EventChecklistPanel({ 
  quoteId, 
  eventDate, 
  eventType,
  compact = false,
  allowExpand = false
}: EventChecklistPanelProps) {
  const { tasks, loading, toggleTask, createTask, generateStandardChecklist } = useEventChecklist(quoteId);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handleGenerateChecklist = async () => {
    setIsGenerating(true);
    try {
      await generateStandardChecklist(eventDate, eventType);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddTask = async () => {
    if (!newTaskName.trim()) return;
    await createTask({
      task_name: newTaskName.trim(),
      task_type: 'pre_event', // Default to pre_event for manually added tasks
    });
    setNewTaskName('');
    setShowAddTask(false);
  };

  const getTaskDueStatus = (dueDate: string | null) => {
    if (!dueDate) return null;
    const date = parseISO(dueDate);
    if (isToday(date)) return 'today';
    if (isPast(date)) return 'overdue';
    return 'upcoming';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Compact view for summary panel
  if (compact && !isExpanded) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <ListChecks className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{completedCount}/{totalCount} tasks</span>
          </div>
          <div className="flex items-center gap-2">
            {totalCount > 0 && (
              <span className="text-xs text-muted-foreground">
                {Math.round(progressPercent)}%
              </span>
            )}
            {allowExpand && totalCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 px-2 text-xs"
                onClick={() => setIsExpanded(true)}
              >
                <ChevronDown className="h-3 w-3 mr-1" />
                View
              </Button>
            )}
          </div>
        </div>
        {totalCount > 0 && (
          <Progress value={progressPercent} className="h-1.5" />
        )}
        {totalCount === 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-xs"
            onClick={handleGenerateChecklist}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              <Plus className="h-3 w-3 mr-1" />
            )}
            Generate Checklist
          </Button>
        )}
      </div>
    );
  }

  // Expanded compact view - show tasks inline with collapse option
  if (compact && isExpanded) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <ListChecks className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{completedCount}/{totalCount} tasks</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 px-2 text-xs"
            onClick={() => setIsExpanded(false)}
          >
            <ChevronUp className="h-3 w-3 mr-1" />
            Collapse
          </Button>
        </div>
        {totalCount > 0 && (
          <Progress value={progressPercent} className="h-1.5" />
        )}
        <div className="space-y-1.5 max-h-64 overflow-y-auto">
          {tasks.map((task) => {
            const dueStatus = getTaskDueStatus(task.due_date);
            return (
              <div 
                key={task.id}
                className={`flex items-center gap-2 p-1.5 rounded text-xs ${
                  task.completed ? 'opacity-50' : ''
                }`}
              >
                <button onClick={() => toggleTask(task.id)} className="shrink-0">
                  {task.completed ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground hover:text-primary" />
                  )}
                </button>
                <span className={task.completed ? 'line-through' : ''}>{task.task_name}</span>
                {dueStatus === 'overdue' && !task.completed && (
                  <AlertCircle className="h-3 w-3 text-destructive ml-auto shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Full view
  return (
    <div className="space-y-4">
      {/* Header with progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-medium flex items-center gap-2">
            <ListChecks className="h-4 w-4" />
            Event Prep Checklist
          </h4>
          <span className="text-sm text-muted-foreground">
            {completedCount}/{totalCount} complete
          </span>
        </div>
        {totalCount > 0 && (
          <Progress value={progressPercent} className="h-2" />
        )}
      </div>

      {/* Empty state */}
      {totalCount === 0 && (
        <div className="text-center py-6 border rounded-lg bg-muted/20">
          <ListChecks className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground mb-3">No tasks yet</p>
          <Button 
            onClick={handleGenerateChecklist}
            disabled={isGenerating}
            size="sm"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Generate Standard Checklist
          </Button>
        </div>
      )}

      {/* Task list */}
      {totalCount > 0 && (
        <div className="space-y-2">
          {tasks.map((task) => {
            const dueStatus = getTaskDueStatus(task.due_date);
            
            return (
              <div 
                key={task.id}
                className={`flex items-start gap-3 p-2 rounded-lg border transition-colors ${
                  task.completed ? 'bg-muted/30 opacity-60' : 'bg-card hover:bg-muted/10'
                }`}
              >
                <button 
                  onClick={() => toggleTask(task.id)}
                  className="mt-0.5 shrink-0"
                >
                  {task.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
                  )}
                </button>
                
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${task.completed ? 'line-through' : ''}`}>
                    {task.task_name}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <Badge 
                      variant="outline" 
                      className={`text-[10px] px-1.5 ${taskTypeColors[task.task_type] || 'bg-gray-100 text-gray-700'}`}
                    >
                      {taskTypeLabels[task.task_type] || task.task_type}
                    </Badge>
                    
                    {task.due_date && (
                      <span className={`flex items-center gap-1 text-xs ${
                        dueStatus === 'overdue' && !task.completed 
                          ? 'text-destructive' 
                          : dueStatus === 'today' && !task.completed
                          ? 'text-amber-600'
                          : 'text-muted-foreground'
                      }`}>
                        {dueStatus === 'overdue' && !task.completed && (
                          <AlertCircle className="h-3 w-3" />
                        )}
                        <Calendar className="h-3 w-3" />
                        {format(parseISO(task.due_date), 'MMM d')}
                      </span>
                    )}
                  </div>
                  
                  {task.notes && (
                    <p className="text-xs text-muted-foreground mt-1">{task.notes}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add task */}
      {totalCount > 0 && (
        <>
          {showAddTask ? (
            <div className="flex gap-2">
              <Input
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
                placeholder="New task name..."
                className="text-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
              />
              <Button size="sm" onClick={handleAddTask}>Add</Button>
              <Button size="sm" variant="ghost" onClick={() => setShowAddTask(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowAddTask(true)}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          )}
        </>
      )}
    </div>
  );
}
