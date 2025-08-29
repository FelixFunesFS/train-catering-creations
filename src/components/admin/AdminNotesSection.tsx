import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StickyNote, Plus, AlertCircle, Clock, DollarSign, Truck, User, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface AdminNotesSectionProps {
  quoteId: string;
}

interface AdminNote {
  id: string;
  note_content: string;
  category: string;
  priority_level: string;
  created_by: string;
  created_at: string;
}

const NOTE_CATEGORIES = [
  { value: 'general', label: 'General', icon: StickyNote },
  { value: 'follow-up', label: 'Follow-up', icon: Clock },
  { value: 'pricing', label: 'Pricing', icon: DollarSign },
  { value: 'logistics', label: 'Logistics', icon: Truck },
  { value: 'menu', label: 'Menu', icon: User },
  { value: 'customer-request', label: 'Customer Request', icon: MessageSquare }
];

const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low', color: 'bg-slate-100 text-slate-800' },
  { value: 'normal', label: 'Normal', color: 'bg-blue-100 text-blue-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' }
];

export function AdminNotesSection({ quoteId }: AdminNotesSectionProps) {
  const [notes, setNotes] = useState<AdminNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [selectedPriority, setSelectedPriority] = useState('normal');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchNotes();
  }, [quoteId]);

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_notes')
        .select('*')
        .eq('quote_request_id', quoteId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load notes: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addNote = async () => {
    if (!newNote.trim()) return;

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('admin_notes')
        .insert({
          quote_request_id: quoteId,
          note_content: newNote.trim(),
          category: selectedCategory,
          priority_level: selectedPriority,
          created_by: 'admin'
        })
        .select()
        .single();

      if (error) throw error;

      setNotes(prev => [data, ...prev]);
      setNewNote('');
      toast({
        title: "Success",
        description: "Note added successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to add note: " + error.message,
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    const categoryData = NOTE_CATEGORIES.find(c => c.value === category);
    return categoryData?.icon || StickyNote;
  };

  const getPriorityColor = (priority: string) => {
    const priorityData = PRIORITY_LEVELS.find(p => p.value === priority);
    return priorityData?.color || 'bg-slate-100 text-slate-800';
  };

  if (loading) {
    return <div className="text-center py-4">Loading notes...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Add New Note */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Admin Note
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NOTE_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center gap-2">
                        <category.icon className="h-4 w-4" />
                        {category.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Priority</label>
              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_LEVELS.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add your note here..."
            rows={3}
          />
          <Button 
            onClick={addNote} 
            disabled={!newNote.trim() || submitting}
            className="w-full"
          >
            {submitting ? 'Adding...' : 'Add Note'}
          </Button>
        </CardContent>
      </Card>

      {/* Notes List */}
      <div className="space-y-3">
        {notes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <StickyNote className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No notes yet. Add your first note above.</p>
          </div>
        ) : (
          notes.map((note) => {
            const CategoryIcon = getCategoryIcon(note.category);
            return (
              <Card key={note.id} className="relative">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <CategoryIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(note.priority_level)}>
                          {note.priority_level}
                        </Badge>
                        <Badge variant="outline">
                          {NOTE_CATEGORIES.find(c => c.value === note.category)?.label}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{note.note_content}</p>
                      <div className="text-xs text-muted-foreground">
                        By {note.created_by}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}