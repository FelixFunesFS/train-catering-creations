import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Calendar, Users, UtensilsCrossed, AlertCircle } from 'lucide-react';

interface RequestChangesModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: any;
  quote: any;
  onSuccess?: () => void;
}

export function RequestChangesModal({ isOpen, onClose, invoice, quote, onSuccess }: RequestChangesModalProps) {
  const [requestType, setRequestType] = useState<'menu' | 'date' | 'guest_count' | 'other'>('menu');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast({
        title: "Description Required",
        description: "Please describe what changes you'd like to make.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('change_requests')
        .insert({
          invoice_id: invoice.id,
          customer_email: quote.email,
          request_type: requestType === 'other' ? 'modification' : 'modification',
          priority: urgency ? 'high' : 'medium',
          status: 'pending',
          customer_comments: description,
          original_details: {
            event_date: quote.event_date,
            guest_count: quote.guest_count,
            location: quote.location,
          },
          requested_changes: {
            change_type: requestType,
            description: description,
            urgency: urgency,
          },
        });

      if (error) throw error;

      toast({
        title: "Request Submitted",
        description: "We'll review your changes and get back to you within 24 hours.",
      });

      onSuccess?.();
      onClose();
      setDescription('');
      setRequestType('menu');
      setUrgency(false);
    } catch (error: any) {
      console.error('Error submitting change request:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Request Changes
          </DialogTitle>
          <DialogDescription>
            Let us know what changes you'd like to make to your event. We'll review and send you an updated estimate.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Change Type Selection */}
          <div className="space-y-3">
            <Label>What would you like to change?</Label>
            <RadioGroup value={requestType} onValueChange={(value: any) => setRequestType(value)}>
              <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="menu" id="menu" />
                <Label htmlFor="menu" className="flex items-center gap-2 cursor-pointer flex-1">
                  <UtensilsCrossed className="h-4 w-4" />
                  Menu Items (add, remove, or swap items)
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="date" id="date" />
                <Label htmlFor="date" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Calendar className="h-4 w-4" />
                  Event Date or Time
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="guest_count" id="guest_count" />
                <Label htmlFor="guest_count" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Users className="h-4 w-4" />
                  Guest Count
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other" className="cursor-pointer flex-1">
                  Other Changes
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Describe Your Changes *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide details about the changes you'd like to make..."
              rows={5}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Be as specific as possible to help us provide an accurate updated quote.
            </p>
          </div>

          {/* Urgency Checkbox */}
          <div className="flex items-start space-x-2 p-3 rounded-lg border bg-muted/30">
            <Checkbox
              id="urgency"
              checked={urgency}
              onCheckedChange={(checked) => setUrgency(checked as boolean)}
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor="urgency"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                This is time-sensitive
              </Label>
              <p className="text-xs text-muted-foreground">
                Mark this if your event is within 2 weeks or changes are urgent
              </p>
            </div>
          </div>

          {/* Info Alert */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              After submission, we'll review your request and email you an updated estimate with new pricing within 24 hours (or sooner for urgent requests).
            </AlertDescription>
          </Alert>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
