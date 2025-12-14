import { useState } from 'react';
import { Database } from '@/integrations/supabase/types';
import { useUpdateQuote } from '@/hooks/useQuotes';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

type QuoteRequest = Database['public']['Tables']['quote_requests']['Row'];

interface CustomerEditorProps {
  quote: QuoteRequest;
  onSave: () => void;
}

export function CustomerEditor({ quote, onSave }: CustomerEditorProps) {
  const [formData, setFormData] = useState({
    contact_name: quote.contact_name,
    email: quote.email,
    phone: quote.phone,
    location: quote.location,
    event_date: quote.event_date,
    start_time: quote.start_time,
    guest_count: quote.guest_count,
  });

  const updateQuote = useUpdateQuote();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await updateQuote.mutateAsync({
      quoteId: quote.id,
      updates: formData,
    });
    
    onSave();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Contact Section */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Customer Contact</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="contact_name">Name</Label>
            <Input
              id="contact_name"
              value={formData.contact_name}
              onChange={(e) => setFormData(prev => ({ ...prev, contact_name: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              required
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Event Details Section */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Event Details</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="event_date">Event Date</Label>
            <Input
              id="event_date"
              type="date"
              value={formData.event_date}
              onChange={(e) => setFormData(prev => ({ ...prev, event_date: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="start_time">Start Time</Label>
            <Input
              id="start_time"
              type="time"
              value={formData.start_time}
              onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="guest_count">Guest Count</Label>
            <Input
              id="guest_count"
              type="number"
              min="1"
              value={formData.guest_count}
              onChange={(e) => setFormData(prev => ({ ...prev, guest_count: parseInt(e.target.value) || 0 }))}
              required
            />
          </div>
        </div>
      </div>
      
      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={updateQuote.isPending}>
          {updateQuote.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </form>
  );
}
