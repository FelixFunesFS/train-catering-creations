import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { generateCustomerSummary, ChangeItem, ChangeSource, ChangeContext } from '@/utils/changeSummaryGenerator';
import { Phone, Mail, User, MessageSquare, FileEdit, Loader2 } from 'lucide-react';

interface ChangeContextModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (context: ChangeContext) => void;
  changes: ChangeItem[];
  isLoading?: boolean;
}

const SOURCE_OPTIONS: { value: ChangeSource; label: string; icon: React.ReactNode }[] = [
  { value: 'phone', label: 'Phone Call', icon: <Phone className="h-4 w-4" /> },
  { value: 'email', label: 'Email Request', icon: <Mail className="h-4 w-4" /> },
  { value: 'portal_change_request', label: 'Portal Change Request', icon: <FileEdit className="h-4 w-4" /> },
  { value: 'in_person', label: 'In-Person Discussion', icon: <User className="h-4 w-4" /> },
  { value: 'admin_adjustment', label: 'Admin Adjustment', icon: <MessageSquare className="h-4 w-4" /> },
];

export function ChangeContextModal({ 
  open, 
  onClose, 
  onConfirm, 
  changes,
  isLoading 
}: ChangeContextModalProps) {
  const [initials, setInitials] = useState('');
  const [source, setSource] = useState<ChangeSource>('phone');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [includeInCustomerNotes, setIncludeInCustomerNotes] = useState(true);
  
  // Auto-generate summary based on changes and context
  const autoSummary = useMemo(() => {
    return generateCustomerSummary(changes, { initials: initials || 'Admin', source });
  }, [changes, initials, source]);
  
  const [customerSummary, setCustomerSummary] = useState('');
  
  // Update customer summary when auto-summary changes
  useMemo(() => {
    if (!customerSummary || customerSummary === generateCustomerSummary(changes, { initials: '', source })) {
      setCustomerSummary(autoSummary);
    }
  }, [autoSummary]);

  const showContactEmail = source === 'email';
  const showContactPhone = source === 'phone';
  
  const isValid = initials.trim().length >= 2;

  const handleConfirm = () => {
    const contactInfo = showContactEmail 
      ? contactEmail 
      : showContactPhone 
        ? contactPhone 
        : undefined;

    onConfirm({
      initials: initials.trim().toUpperCase(),
      source,
      contactEmail: showContactEmail ? contactEmail : undefined,
      contactPhone: showContactPhone ? contactPhone : undefined,
      internalNote: internalNote.trim() || undefined,
      customerSummary: includeInCustomerNotes ? customerSummary : undefined,
      includeInCustomerNotes,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-1rem)] sm:max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>Document This Change</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Changes Preview */}
          <div className="bg-muted/50 rounded-lg p-3 text-sm">
            <p className="font-medium text-xs text-muted-foreground mb-1">Changes detected:</p>
            <ul className="space-y-1">
              {changes.slice(0, 5).map((change, i) => (
                <li key={i} className="text-xs">
                  • {change.field.replace(/_/g, ' ')}
                </li>
              ))}
              {changes.length > 5 && (
                <li className="text-xs text-muted-foreground">
                  + {changes.length - 5} more...
                </li>
              )}
            </ul>
          </div>

          {/* Admin Initials */}
          <div className="space-y-2">
            <Label htmlFor="initials">Your Initials *</Label>
            <Input
              id="initials"
              value={initials}
              onChange={(e) => setInitials(e.target.value.slice(0, 3))}
              placeholder="e.g., JD"
              maxLength={3}
              className="w-24"
            />
          </div>

          {/* Change Source */}
          <div className="space-y-2">
            <Label>How was this change requested? *</Label>
            <Select value={source} onValueChange={(v) => setSource(v as ChangeSource)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SOURCE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <span className="flex items-center gap-2">
                      {opt.icon}
                      {opt.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Conditional Contact Fields */}
          {showContactEmail && (
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Requester's Email (optional)</Label>
              <Input
                id="contactEmail"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="who@example.com"
              />
            </div>
          )}

          {showContactPhone && (
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Caller's Phone (optional)</Label>
              <Input
                id="contactPhone"
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>
          )}

          {/* Internal Note */}
          <div className="space-y-2">
            <Label htmlFor="internalNote">Internal Note (optional)</Label>
            <Textarea
              id="internalNote"
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
              placeholder="Additional context for admin reference..."
              rows={2}
              className="text-sm"
            />
          </div>

          {/* Customer Summary */}
          <div className="space-y-2 border-t pt-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeInNotes"
                checked={includeInCustomerNotes}
                onCheckedChange={(checked) => setIncludeInCustomerNotes(checked === true)}
              />
              <Label htmlFor="includeInNotes" className="text-sm font-normal cursor-pointer">
                Add summary to customer-facing notes
              </Label>
            </div>
            
            {includeInCustomerNotes && (
              <Textarea
                value={customerSummary}
                onChange={(e) => setCustomerSummary(e.target.value)}
                placeholder="Summary shown to customer..."
                rows={3}
                className="text-sm"
              />
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!isValid || isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Change
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
