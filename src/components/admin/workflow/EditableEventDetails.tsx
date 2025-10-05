import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Clock, Users, MapPin, FileText, CheckCircle2, Loader2, Edit2, Save, X, Mail, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { formatCustomerName, formatLocation, formatEventName } from '@/utils/textFormatters';

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
  const [isEditing, setIsEditing] = useState(false);
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
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus('saving');

    try {
      const { error } = await supabase
        .from('quote_requests')
        .update(formData)
        .eq('id', quote.id);

      if (error) throw error;

      setSaveStatus('saved');
      setIsEditing(false);
      
      Object.keys(formData).forEach(key => {
        onQuoteUpdate?.({ [key]: formData[key as keyof typeof formData] } as Partial<Quote>);
      });

      toast({
        title: "Saved",
        description: "Event details updated successfully",
      });
    } catch (error) {
      console.error('Error updating quote:', error);
      setSaveStatus('idle');
      setFormData({
        contact_name: quote.contact_name || '',
        email: quote.email || '',
        phone: quote.phone || '',
        event_date: quote.event_date || '',
        start_time: quote.start_time || '',
        guest_count: quote.guest_count || 0,
        location: quote.location || '',
        special_requests: quote.special_requests || '',
      });

      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      contact_name: quote.contact_name || '',
      email: quote.email || '',
      phone: quote.phone || '',
      event_date: quote.event_date || '',
      start_time: quote.start_time || '',
      guest_count: quote.guest_count || 0,
      location: quote.location || '',
      special_requests: quote.special_requests || '',
    });
    setIsEditing(false);
  };

  const getSaveStatusIcon = () => {
    switch (saveStatus) {
      case 'saving':
        return <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />;
      case 'saved':
        return <CheckCircle2 className="h-3 w-3 text-green-600" />;
      default:
        return null;
    }
  };

  const getSaveStatusText = () => {
    switch (saveStatus) {
      case 'saving':
        return 'Saving...';
      case 'saved':
        return 'Saved';
      default:
        return '';
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Not set';
    try {
      return format(new Date(dateStr), 'MMMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return 'Not set';
    try {
      const [hours, minutes] = timeStr.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return timeStr;
    }
  };

  // Read-only view
  if (!isEditing) {
    return (
      <div className="space-y-3 p-4 border rounded-lg bg-card">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Event Details
          </h3>
          <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
            <Edit2 className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex items-start gap-2">
            <Phone className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="space-y-0.5 min-w-0">
              <p className="text-xs text-muted-foreground">Contact Name</p>
              <p className="text-sm font-medium truncate">{formatCustomerName(formData.contact_name || 'Not set')}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Mail className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="space-y-0.5 min-w-0">
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium truncate">{formData.email || 'Not set'}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Phone className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="space-y-0.5 min-w-0">
              <p className="text-xs text-muted-foreground">Phone</p>
              <p className="text-sm font-medium">{formData.phone || 'Not set'}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="space-y-0.5 min-w-0">
              <p className="text-xs text-muted-foreground">Event Date</p>
              <p className="text-sm font-medium">{formatDate(formData.event_date)}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="space-y-0.5 min-w-0">
              <p className="text-xs text-muted-foreground">Start Time</p>
              <p className="text-sm font-medium">{formatTime(formData.start_time)}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Users className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="space-y-0.5 min-w-0">
              <p className="text-xs text-muted-foreground">Guest Count</p>
              <p className="text-sm font-medium">{formData.guest_count || 'Not set'}</p>
            </div>
          </div>

          <div className="flex items-start gap-2 sm:col-span-2 lg:col-span-3">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="space-y-0.5 min-w-0">
              <p className="text-xs text-muted-foreground">Location</p>
              <p className="text-sm font-medium">{formatLocation(formData.location || 'Not set')}</p>
            </div>
          </div>

          {formData.special_requests && (
            <div className="flex items-start gap-2 sm:col-span-2 lg:col-span-3">
              <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="space-y-0.5 min-w-0">
                <p className="text-xs text-muted-foreground">Special Requests</p>
                <p className="text-sm font-medium">{formData.special_requests}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Edit mode
  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Edit Event Details
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
            placeholder="Any special requests or notes..."
            className="resize-none min-h-[60px]"
            rows={3}
            disabled={saving}
          />
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <Button onClick={handleCancel} variant="outline" size="sm" disabled={saving}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button onClick={handleSave} size="sm" disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>
    </div>
  );
}
