import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Clock, Users, MapPin, FileText, CheckCircle2, Loader2, Edit3 } from 'lucide-react';
import { format } from 'date-fns';

interface Quote {
  id: string;
  event_name: string;
  contact_name: string;
  email: string;
  phone: string;
  event_date: string;
  start_time: string;
  guest_count: number;
  location: string;
  special_requests?: string;
}

interface EditableEventDetailsProps {
  quote: Quote;
  onQuoteUpdate?: (updates: Partial<Quote>) => void;
}

export function EditableEventDetails({ quote, onQuoteUpdate }: EditableEventDetailsProps) {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    contact_name: quote.contact_name || '',
    email: quote.email || '',
    phone: quote.phone || '',
    event_date: quote.event_date || '',
    start_time: quote.start_time || '',
    guest_count: quote.guest_count || 0,
    location: quote.location || '',
    special_requests: quote.special_requests || '',
  });

  // Show "saved" status briefly after saving
  useEffect(() => {
    if (saveStatus === 'saved') {
      const timer = setTimeout(() => setSaveStatus('idle'), 2000);
      return () => clearTimeout(timer);
    }
  }, [saveStatus]);

  const handleFieldChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setEditingField(field);
  };

  const handleFieldBlur = async (field: keyof typeof formData) => {
    setEditingField(null);
    
    // Only save if value actually changed
    if (formData[field] === quote[field]) return;

    setSaving(true);
    setSaveStatus('saving');

    try {
      const { error } = await supabase
        .from('quote_requests')
        .update({ [field]: formData[field] })
        .eq('id', quote.id);

      if (error) throw error;

      setSaveStatus('saved');
      onQuoteUpdate?.({ [field]: formData[field] } as Partial<Quote>);

      toast({
        title: "Saved",
        description: "Event details updated successfully",
      });
    } catch (error) {
      console.error('Error updating quote:', error);
      setSaveStatus('idle');
      
      // Revert to original value
      setFormData(prev => ({ ...prev, [field]: quote[field] }));

      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getSaveStatusIcon = () => {
    switch (saveStatus) {
      case 'saving':
        return <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />;
      case 'saved':
        return <CheckCircle2 className="h-3 w-3 text-green-600" />;
      default:
        return <Edit3 className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getSaveStatusText = () => {
    switch (saveStatus) {
      case 'saving':
        return 'Saving...';
      case 'saved':
        return 'Saved';
      default:
        return 'Click to edit';
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Event Details
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {getSaveStatusIcon()}
          <span>{getSaveStatusText()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Contact Name */}
        <div className="space-y-1.5">
          <Label htmlFor="contact_name" className="text-xs">
            Contact Name *
          </Label>
          <Input
            id="contact_name"
            value={formData.contact_name}
            onChange={(e) => handleFieldChange('contact_name', e.target.value)}
            onBlur={() => handleFieldBlur('contact_name')}
            placeholder="Full name"
            className="h-9"
            disabled={saving}
          />
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs">
            Email *
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleFieldChange('email', e.target.value)}
            onBlur={() => handleFieldBlur('email')}
            placeholder="email@example.com"
            className="h-9"
            disabled={saving}
          />
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-xs flex items-center gap-1">
            Phone *
          </Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleFieldChange('phone', e.target.value)}
            onBlur={() => handleFieldBlur('phone')}
            placeholder="(843) 555-1234"
            className="h-9"
            disabled={saving}
          />
        </div>

        {/* Event Date */}
        <div className="space-y-1.5">
          <Label htmlFor="event_date" className="text-xs flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Event Date *
          </Label>
          <Input
            id="event_date"
            type="date"
            value={formData.event_date}
            onChange={(e) => handleFieldChange('event_date', e.target.value)}
            onBlur={() => handleFieldBlur('event_date')}
            className="h-9"
            disabled={saving}
          />
        </div>

        {/* Start Time */}
        <div className="space-y-1.5">
          <Label htmlFor="start_time" className="text-xs flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Start Time
          </Label>
          <Input
            id="start_time"
            type="time"
            value={formData.start_time}
            onChange={(e) => handleFieldChange('start_time', e.target.value)}
            onBlur={() => handleFieldBlur('start_time')}
            className="h-9"
            disabled={saving}
          />
        </div>

        {/* Guest Count */}
        <div className="space-y-1.5">
          <Label htmlFor="guest_count" className="text-xs flex items-center gap-1">
            <Users className="h-3 w-3" />
            Guest Count *
          </Label>
          <Input
            id="guest_count"
            type="number"
            min="0"
            value={formData.guest_count}
            onChange={(e) => handleFieldChange('guest_count', parseInt(e.target.value) || 0)}
            onBlur={() => handleFieldBlur('guest_count')}
            className="h-9"
            disabled={saving}
          />
        </div>

        {/* Location */}
        <div className="space-y-1.5 md:col-span-3">
          <Label htmlFor="location" className="text-xs flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            Location *
          </Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => handleFieldChange('location', e.target.value)}
            onBlur={() => handleFieldBlur('location')}
            placeholder="Event venue address"
            className="h-9"
            disabled={saving}
          />
        </div>

        {/* Special Requests */}
        <div className="space-y-1.5 md:col-span-3">
          <Label htmlFor="special_requests" className="text-xs">
            Special Requests
          </Label>
          <Textarea
            id="special_requests"
            value={formData.special_requests}
            onChange={(e) => handleFieldChange('special_requests', e.target.value)}
            onBlur={() => handleFieldBlur('special_requests')}
            placeholder="Any special requests or notes..."
            className="resize-none min-h-[60px]"
            rows={3}
            disabled={saving}
          />
        </div>
      </div>
    </div>
  );
}
