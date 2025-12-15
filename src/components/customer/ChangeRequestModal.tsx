import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChangeRequestService } from '@/services/ChangeRequestService';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface ChangeRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string;
  customerEmail: string;
  onSuccess?: () => void;
}

type RequestType = 'modification' | 'date_change' | 'guest_count_change' | 'cancellation';

const REQUEST_TYPE_OPTIONS: { value: RequestType; label: string; description: string }[] = [
  { value: 'modification', label: 'Menu Modification', description: 'Change menu items or quantities' },
  { value: 'date_change', label: 'Date Change', description: 'Request a different event date' },
  { value: 'guest_count_change', label: 'Guest Count', description: 'Update the number of guests' },
  { value: 'cancellation', label: 'Cancellation', description: 'Cancel this booking' },
];

export function ChangeRequestModal({
  open,
  onOpenChange,
  invoiceId,
  customerEmail,
  onSuccess,
}: ChangeRequestModalProps) {
  const [requestType, setRequestType] = useState<RequestType>('modification');
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!comments.trim()) {
      toast({
        title: 'Please add details',
        description: 'Describe the changes you would like to make',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await ChangeRequestService.submitChangeRequest({
        quoteRequestId: '', // Not used in current implementation
        invoiceId,
        customerEmail,
        requestType,
        customerComments: comments,
        requestedChanges: {
          type: requestType,
          details: comments,
        },
      });

      toast({
        title: 'Request Submitted',
        description: 'We will review your request and get back to you shortly.',
      });

      setComments('');
      setRequestType('modification');
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to submit change request:', error);
      toast({
        title: 'Submission Failed',
        description: 'Unable to submit your request. Please try again or contact us directly.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request Changes</DialogTitle>
          <DialogDescription>
            Let us know what changes you'd like to make to your estimate.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="request-type">Type of Request</Label>
            <Select value={requestType} onValueChange={(v) => setRequestType(v as RequestType)}>
              <SelectTrigger id="request-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REQUEST_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col items-start">
                      <span>{option.label}</span>
                      <span className="text-xs text-muted-foreground">{option.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comments">Details</Label>
            <Textarea
              id="comments"
              placeholder="Please describe the changes you would like..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !comments.trim()}
            className="w-full sm:w-auto"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
