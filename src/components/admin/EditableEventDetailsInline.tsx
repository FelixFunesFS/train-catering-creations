import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Check, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Quote {
  id: string;
  contact_name: string;
  email: string;
  phone: string;
  event_name: string;
  event_date: string;
  start_time: string;
  guest_count: number;
  location: string;
  special_requests?: string;
}

interface EditableEventDetailsInlineProps {
  quote: Quote;
  onUpdate?: (updatedQuote: Partial<Quote>) => void;
}

export function EditableEventDetailsInline({ quote, onUpdate }: EditableEventDetailsInlineProps) {
  const [formData, setFormData] = useState({
    contact_name: quote.contact_name || '',
    email: quote.email || '',
    phone: quote.phone || '',
    event_name: quote.event_name || '',
    event_date: quote.event_date || '',
    start_time: quote.start_time || '',
    guest_count: quote.guest_count || 0,
    location: quote.location || '',
    special_requests: quote.special_requests || '',
  });

  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const { toast } = useToast();

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSaveStatus('idle');
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus('saving');

    try {
      const { error } = await supabase
        .from('quote_requests')
        .update({
          contact_name: formData.contact_name,
          email: formData.email,
          phone: formData.phone,
          event_name: formData.event_name,
          event_date: formData.event_date,
          start_time: formData.start_time,
          guest_count: formData.guest_count,
          location: formData.location,
          special_requests: formData.special_requests,
          updated_at: new Date().toISOString()
        })
        .eq('id', quote.id);

      if (error) throw error;

      setSaveStatus('saved');
      toast({
        title: "Details updated",
        description: "Customer information and event details have been saved.",
      });

      onUpdate?.(formData);

      // Reset status after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving quote details:', error);
      setSaveStatus('error');
      toast({
        title: "Failed to save",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {saveStatus === 'error' && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to save changes. Please try again.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Customer Information */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground">Customer Information</h4>
          
          <div>
            <Label htmlFor="contact_name" className="text-xs">Contact Name</Label>
            <Input
              id="contact_name"
              value={formData.contact_name}
              onChange={(e) => handleInputChange('contact_name', e.target.value)}
              placeholder="Full name"
              className="h-9"
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-xs">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="email@example.com"
              className="h-9"
            />
          </div>

          <div>
            <Label htmlFor="phone" className="text-xs">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="(843) 555-1234"
              className="h-9"
            />
          </div>
        </div>

        {/* Event Information */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground">Event Information</h4>
          
          <div>
            <Label htmlFor="event_name" className="text-xs">Event Name</Label>
            <Input
              id="event_name"
              value={formData.event_name}
              onChange={(e) => handleInputChange('event_name', e.target.value)}
              placeholder="Event name"
              className="h-9"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="event_date" className="text-xs">Date</Label>
              <Input
                id="event_date"
                type="date"
                value={formData.event_date}
                onChange={(e) => handleInputChange('event_date', e.target.value)}
                className="h-9"
              />
            </div>
            <div>
              <Label htmlFor="start_time" className="text-xs">Time</Label>
              <Input
                id="start_time"
                type="time"
                value={formData.start_time}
                onChange={(e) => handleInputChange('start_time', e.target.value)}
                className="h-9"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="guest_count" className="text-xs">Guest Count</Label>
            <Input
              id="guest_count"
              type="number"
              value={formData.guest_count}
              onChange={(e) => handleInputChange('guest_count', parseInt(e.target.value) || 0)}
              placeholder="Number of guests"
              className="h-9"
            />
          </div>
        </div>
      </div>

      {/* Full-width fields */}
      <div className="space-y-3">
        <div>
          <Label htmlFor="location" className="text-xs">Event Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            placeholder="Venue address"
            className="h-9"
          />
        </div>

        <div>
          <Label htmlFor="special_requests" className="text-xs">Special Requests</Label>
          <Textarea
            id="special_requests"
            value={formData.special_requests}
            onChange={(e) => handleInputChange('special_requests', e.target.value)}
            placeholder="Any special requests or notes..."
            rows={3}
            className="resize-none"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t">
        <div className="text-xs text-muted-foreground">
          {saveStatus === 'saved' && (
            <span className="flex items-center gap-1 text-green-600">
              <Check className="h-3 w-3" />
              Changes saved
            </span>
          )}
        </div>
        
        <Button
          onClick={handleSave}
          disabled={saving || saveStatus === 'saved'}
          size="sm"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              Saving...
            </>
          ) : saveStatus === 'saved' ? (
            <>
              <Check className="mr-2 h-3 w-3" />
              Saved
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </div>
  );
}
