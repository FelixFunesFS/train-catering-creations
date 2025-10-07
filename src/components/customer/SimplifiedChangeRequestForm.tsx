/**
 * SimplifiedChangeRequestForm - Optimized 3-step change request workflow
 * Minimal UI, progressive disclosure, smart defaults
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Calendar, 
  Users, 
  UtensilsCrossed, 
  MessageSquare, 
  ArrowRight,
  ArrowLeft,
  Check,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { QuickMenuSelector } from './menu-change/QuickMenuSelector';

type ChangeType = 'menu_swap' | 'event_details' | 'custom_request';

interface SimplifiedChangeRequestFormProps {
  quote: any;
  invoice: any;
  onRequestSubmitted: () => void;
}

export function SimplifiedChangeRequestForm({ 
  quote, 
  invoice, 
  onRequestSubmitted 
}: SimplifiedChangeRequestFormProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [changeType, setChangeType] = useState<ChangeType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 2 data
  const [menuSwaps, setMenuSwaps] = useState<any>(null);
  const [eventUpdates, setEventUpdates] = useState({
    event_date: quote.event_date || '',
    guest_count: quote.guest_count?.toString() || '',
    start_time: quote.start_time || '',
    location: quote.location || ''
  });
  const [customRequest, setCustomRequest] = useState('');

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const requestedChanges: any = {};
      let comments = '';

      // Build request based on change type
      if (changeType === 'menu_swap' && menuSwaps) {
        requestedChanges.menu_changes = menuSwaps;
        comments = 'Menu substitution request';
      } else if (changeType === 'event_details') {
        if (eventUpdates.event_date !== quote.event_date) {
          requestedChanges.event_date = eventUpdates.event_date;
        }
        if (eventUpdates.guest_count !== quote.guest_count?.toString()) {
          requestedChanges.guest_count = parseInt(eventUpdates.guest_count);
        }
        if (eventUpdates.start_time !== quote.start_time) {
          requestedChanges.start_time = eventUpdates.start_time;
        }
        if (eventUpdates.location !== quote.location) {
          requestedChanges.location = eventUpdates.location;
        }
        comments = 'Event details update';
      } else if (changeType === 'custom_request') {
        comments = customRequest;
      }

      const { error } = await supabase
        .from('change_requests')
        .insert({
          invoice_id: invoice.id,
          customer_email: quote.email,
          request_type: changeType === 'menu_swap' ? 'menu_modification' : 
                        changeType === 'event_details' ? 'event_modification' : 'custom',
          priority: 'medium',
          status: 'pending',
          customer_comments: comments,
          requested_changes: requestedChanges,
          estimated_cost_change: 0,
          original_details: {
            event_date: quote.event_date,
            guest_count: quote.guest_count,
            location: quote.location,
            start_time: quote.start_time
          }
        });

      if (error) throw error;

      // Update invoice status
      await supabase
        .from('invoices')
        .update({
          workflow_status: 'viewed',
          status: 'viewed',
          last_customer_action: new Date().toISOString()
        })
        .eq('id', invoice.id);

      toast({
        title: "Request Submitted!",
        description: "We'll review your changes and send an updated quote within 24 hours.",
      });

      onRequestSubmitted();
    } catch (error) {
      console.error('Error submitting change request:', error);
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 1: Change Type Selection
  const renderStep1 = () => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">What would you like to change?</p>
      
      <RadioGroup value={changeType || ''} onValueChange={(v) => setChangeType(v as ChangeType)}>
        <Card className={`cursor-pointer hover:bg-muted/50 ${changeType === 'menu_swap' ? 'ring-2 ring-primary' : ''}`}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <RadioGroupItem value="menu_swap" id="menu_swap" className="mt-1" />
              <Label htmlFor="menu_swap" className="cursor-pointer flex-1">
                <div className="flex items-center gap-2 font-medium mb-1">
                  <UtensilsCrossed className="h-4 w-4" />
                  Quick Menu Swap
                </div>
                <p className="text-sm text-muted-foreground">
                  Substitute proteins, sides, or appetizers
                </p>
              </Label>
            </div>
          </CardContent>
        </Card>

        <Card className={`cursor-pointer hover:bg-muted/50 ${changeType === 'event_details' ? 'ring-2 ring-primary' : ''}`}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <RadioGroupItem value="event_details" id="event_details" className="mt-1" />
              <Label htmlFor="event_details" className="cursor-pointer flex-1">
                <div className="flex items-center gap-2 font-medium mb-1">
                  <Calendar className="h-4 w-4" />
                  Event Details Update
                </div>
                <p className="text-sm text-muted-foreground">
                  Change date, time, location, or guest count
                </p>
              </Label>
            </div>
          </CardContent>
        </Card>

        <Card className={`cursor-pointer hover:bg-muted/50 ${changeType === 'custom_request' ? 'ring-2 ring-primary' : ''}`}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <RadioGroupItem value="custom_request" id="custom_request" className="mt-1" />
              <Label htmlFor="custom_request" className="cursor-pointer flex-1">
                <div className="flex items-center gap-2 font-medium mb-1">
                  <MessageSquare className="h-4 w-4" />
                  Custom Request
                </div>
                <p className="text-sm text-muted-foreground">
                  Something else? Tell us what you need
                </p>
              </Label>
            </div>
          </CardContent>
        </Card>
      </RadioGroup>

      <Button 
        onClick={() => setStep(2)} 
        disabled={!changeType}
        className="w-full"
        size="lg"
      >
        Continue <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );

  // Step 2: Contextual Input
  const renderStep2 = () => {
    if (changeType === 'menu_swap') {
      return (
        <div className="space-y-4">
          <QuickMenuSelector 
            quote={quote}
            onChange={setMenuSwaps}
          />
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <Button onClick={() => setStep(3)} disabled={!menuSwaps} className="flex-1">
              Review <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      );
    }

    if (changeType === 'event_details') {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="event_date">Event Date</Label>
              <Input
                id="event_date"
                type="date"
                value={eventUpdates.event_date}
                onChange={(e) => setEventUpdates(prev => ({ ...prev, event_date: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time</Label>
              <Input
                id="start_time"
                type="time"
                value={eventUpdates.start_time}
                onChange={(e) => setEventUpdates(prev => ({ ...prev, start_time: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="guest_count">Guest Count</Label>
              <Input
                id="guest_count"
                type="number"
                min="1"
                value={eventUpdates.guest_count}
                onChange={(e) => setEventUpdates(prev => ({ ...prev, guest_count: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={eventUpdates.location}
                onChange={(e) => setEventUpdates(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <Button onClick={() => setStep(3)} className="flex-1">
              Review <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      );
    }

    if (changeType === 'custom_request') {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="custom_request">What would you like to change?</Label>
            <Textarea
              id="custom_request"
              value={customRequest}
              onChange={(e) => setCustomRequest(e.target.value)}
              placeholder="Please describe the changes you'd like to make..."
              rows={5}
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <Button onClick={() => setStep(3)} disabled={!customRequest.trim()} className="flex-1">
              Review <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      );
    }

    return null;
  };

  // Step 3: Review & Submit
  const renderStep3 = () => (
    <div className="space-y-4">
      <Card className="bg-muted/30">
        <CardContent className="p-4 space-y-3">
          <h4 className="font-medium">Summary</h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {changeType === 'menu_swap' ? 'Menu Changes' :
                 changeType === 'event_details' ? 'Event Updates' : 'Custom Request'}
              </Badge>
            </div>

            {changeType === 'event_details' && (
              <div className="space-y-1 text-muted-foreground">
                {eventUpdates.event_date !== quote.event_date && (
                  <div>• New Date: {new Date(eventUpdates.event_date).toLocaleDateString()}</div>
                )}
                {eventUpdates.guest_count !== quote.guest_count?.toString() && (
                  <div>• New Guest Count: {eventUpdates.guest_count}</div>
                )}
                {eventUpdates.start_time !== quote.start_time && (
                  <div>• New Time: {eventUpdates.start_time}</div>
                )}
              </div>
            )}

            {changeType === 'custom_request' && (
              <p className="text-muted-foreground">{customRequest}</p>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
            <Clock className="h-4 w-4" />
            <span>Expected response: Within 24 hours</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting}
          className="flex-1"
          size="lg"
        >
          {isSubmitting ? 'Submitting...' : (
            <>
              <Check className="h-4 w-4 mr-2" /> Submit Request
            </>
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Changes</CardTitle>
        <div className="flex items-center gap-2 mt-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 flex-1 rounded-full transition-colors ${
                step >= s ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </CardContent>
    </Card>
  );
}
