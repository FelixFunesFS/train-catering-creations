import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useEventChecklist(quoteRequestId: string) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTasks();
  }, [quoteRequestId]);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('event_timeline_tasks')
        .select('*')
        .eq('quote_request_id', quoteRequestId)
        .order('due_date', { ascending: true });

      if (error) throw error;
      setTasks(data || []);
    } catch (err: any) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData: {
    task_name: string;
    task_type: string;
    due_date?: string;
    notes?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('event_timeline_tasks')
        .insert({
          quote_request_id: quoteRequestId,
          ...taskData,
          completed: false
        })
        .select()
        .single();

      if (error) throw error;

      setTasks([...tasks, data]);
      toast({
        title: 'Task Created',
        description: 'Task has been added to the timeline'
      });

      return data;
    } catch (err: any) {
      console.error('Error creating task:', err);
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive'
      });
      throw err;
    }
  };

  const updateTask = async (taskId: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('event_timeline_tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;

      setTasks(tasks.map(t => t.id === taskId ? data : t));
      return data;
    } catch (err: any) {
      console.error('Error updating task:', err);
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive'
      });
      throw err;
    }
  };

  const toggleTask = async (taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const updates = {
        completed: !task.completed,
        completed_at: !task.completed ? new Date().toISOString() : null,
        completed_by: 'admin'
      };

      await updateTask(taskId, updates);

      toast({
        title: updates.completed ? 'Task Completed' : 'Task Reopened',
        description: task.task_name
      });
    } catch (err: any) {
      console.error('Error toggling task:', err);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('event_timeline_tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      setTasks(tasks.filter(t => t.id !== taskId));
      toast({
        title: 'Task Deleted',
        description: 'Task has been removed'
      });
    } catch (err: any) {
      console.error('Error deleting task:', err);
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive'
      });
      throw err;
    }
  };

  const generateStandardChecklist = async (eventDate: string, eventType: string) => {
    const standardTasks = [
      {
        task_name: 'Confirm final guest count',
        task_type: 'confirmation',
        due_date: new Date(new Date(eventDate).setDate(new Date(eventDate).getDate() - 3)).toISOString(),
        notes: 'Contact client to confirm final headcount'
      },
      {
        task_name: 'Finalize menu selections',
        task_type: 'menu',
        due_date: new Date(new Date(eventDate).setDate(new Date(eventDate).getDate() - 3)).toISOString(),
        notes: 'Confirm all menu items and dietary requirements'
      },
      {
        task_name: 'Order ingredients',
        task_type: 'preparation',
        due_date: new Date(new Date(eventDate).setDate(new Date(eventDate).getDate() - 2)).toISOString(),
        notes: 'Place all orders with suppliers'
      },
      {
        task_name: 'Prep non-perishables',
        task_type: 'preparation',
        due_date: new Date(new Date(eventDate).setDate(new Date(eventDate).getDate() - 1)).toISOString(),
        notes: 'Prepare items that can be made ahead'
      },
      {
        task_name: 'Confirm venue access time',
        task_type: 'logistics',
        due_date: new Date(new Date(eventDate).setDate(new Date(eventDate).getDate() - 1)).toISOString(),
        notes: 'Verify setup time and location details'
      },
      {
        task_name: 'Pack equipment and supplies',
        task_type: 'logistics',
        due_date: new Date(eventDate).toISOString(),
        notes: 'Check all serving equipment, linens, utensils'
      },
      {
        task_name: 'Final food prep',
        task_type: 'preparation',
        due_date: new Date(eventDate).toISOString(),
        notes: 'Complete all cooking and food preparation'
      },
      {
        task_name: 'Setup at venue',
        task_type: 'execution',
        due_date: new Date(eventDate).toISOString(),
        notes: 'Arrive and setup service area'
      },
      {
        task_name: 'Event service',
        task_type: 'execution',
        due_date: new Date(eventDate).toISOString(),
        notes: 'Serve guests and maintain service standards'
      },
      {
        task_name: 'Cleanup and breakdown',
        task_type: 'execution',
        due_date: new Date(eventDate).toISOString(),
        notes: 'Clean area and pack all equipment'
      },
      {
        task_name: 'Send thank you email',
        task_type: 'follow_up',
        due_date: new Date(new Date(eventDate).setDate(new Date(eventDate).getDate() + 1)).toISOString(),
        notes: 'Thank client and request feedback'
      }
    ];

    try {
      for (const task of standardTasks) {
        await createTask(task);
      }

      toast({
        title: 'Checklist Generated',
        description: `${standardTasks.length} tasks added to event timeline`
      });
    } catch (err: any) {
      console.error('Error generating checklist:', err);
    }
  };

  return {
    tasks,
    loading,
    createTask,
    updateTask,
    toggleTask,
    deleteTask,
    generateStandardChecklist,
    refetch: fetchTasks
  };
}
