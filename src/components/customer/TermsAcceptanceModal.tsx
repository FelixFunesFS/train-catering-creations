import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, CheckCircle2 } from 'lucide-react';

interface TermsAcceptanceModalProps {
  open: boolean;
  onAccept: () => void;
  onCancel: () => void;
  eventType: 'standard' | 'wedding' | 'government';
  loading?: boolean;
}

export function TermsAcceptanceModal({ open, onAccept, onCancel, eventType, loading }: TermsAcceptanceModalProps) {
  const [accepted, setAccepted] = useState(false);

  const getTermsContent = () => {
    const commonTerms = `
      <h3>Payment Terms</h3>
      <ul>
        <li>50% deposit required to secure your event date</li>
        <li>Final payment due 14 days before event</li>
        <li>Accepted payment methods: Credit/Debit Card, ACH Transfer</li>
      </ul>

      <h3>Cancellation Policy</h3>
      <ul>
        <li>30+ days before event: Full refund minus $250 administrative fee</li>
        <li>15-29 days before event: 50% refund</li>
        <li>Less than 14 days: No refund</li>
      </ul>

      <h3>Service Agreement</h3>
      <ul>
        <li>Soul Train's Eatery will provide catering services as outlined in your estimate</li>
        <li>Menu selections must be finalized 14 days before event</li>
        <li>Guest count changes accepted up to 7 days before event</li>
        <li>We reserve the right to substitute menu items due to availability</li>
      </ul>

      <h3>Liability</h3>
      <ul>
        <li>Soul Train's Eatery is fully licensed and insured</li>
        <li>We are not responsible for venue-related issues</li>
        <li>Additional fees may apply for last-minute changes</li>
      </ul>
    `;

    if (eventType === 'wedding') {
      return `
        <h2>Wedding Catering Service Agreement</h2>
        <p>This agreement is between Soul Train's Eatery and you (the Client) for catering services at your wedding event.</p>
        
        <h3>Wedding-Specific Terms</h3>
        <ul>
          <li>Complimentary tasting session for up to 4 guests (scheduled 60+ days before event)</li>
          <li>Final guest count required 7 days before wedding</li>
          <li>Ceremony service available with advance notice</li>
          <li>Cocktail hour service coordination included</li>
        </ul>
        
        ${commonTerms}
      `;
    }

    if (eventType === 'government') {
      return `
        <h2>Government Contract Catering Agreement</h2>
        <p>This agreement is between Soul Train's Eatery and the Government Agency for catering services.</p>
        
        <h3>Government Contract Terms</h3>
        <ul>
          <li>Payment Terms: Net-30 from invoice date</li>
          <li>Purchase Order required before service</li>
          <li>All compliance documentation will be provided</li>
          <li>Special dietary and security requirements accommodated</li>
        </ul>
        
        ${commonTerms}
      `;
    }

    return `
      <h2>Catering Service Agreement</h2>
      <p>This agreement is between Soul Train's Eatery and you (the Client) for catering services at your event.</p>
      ${commonTerms}
    `;
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Terms & Conditions
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-96 pr-4">
          <div 
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: getTermsContent() }}
          />
        </ScrollArea>

        <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
          <Checkbox
            id="accept-terms"
            checked={accepted}
            onCheckedChange={(checked) => setAccepted(checked as boolean)}
          />
          <label
            htmlFor="accept-terms"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            I have read and agree to the Terms & Conditions outlined above
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={onAccept} 
            disabled={!accepted || loading}
            className="gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            Accept & Approve Estimate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
