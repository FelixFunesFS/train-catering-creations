import { useState, useMemo } from 'react';
import { Database } from '@/integrations/supabase/types';
import { useUpdateQuote } from '@/hooks/useQuotes';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, Circle, Truck, Package, Users } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ChangeContextModal } from './ChangeContextModal';
import { detectChanges, ChangeItem, ChangeContext } from '@/utils/changeSummaryGenerator';
import { HistoryLogger } from '@/services/HistoryLogger';

type QuoteRequest = Database['public']['Tables']['quote_requests']['Row'];
type ServiceType = Database['public']['Enums']['service_type'];

const SERVICE_OPTIONS: { id: ServiceType; name: string; description: string; icon: React.ReactNode; badge?: string }[] = [
  { id: 'drop-off', name: 'Drop-Off Service', description: 'Food delivered, you handle setup', icon: <Package className="h-4 w-4" /> },
  { id: 'delivery-setup', name: 'Delivery + Setup', description: 'We deliver and set up everything', icon: <Truck className="h-4 w-4" />, badge: 'Most Popular' },
  { id: 'full-service', name: 'Full-Service Catering', description: 'Complete service with staff', icon: <Users className="h-4 w-4" />, badge: 'Premium' },
];

const TRACKED_FIELDS = ['contact_name', 'email', 'phone', 'location', 'event_date', 'start_time', 'guest_count', 'service_type'];

interface CustomerEditorProps {
  quote: QuoteRequest;
  invoiceId?: string;
  onSave: () => void;
}

export function CustomerEditor({ quote, invoiceId, onSave }: CustomerEditorProps) {
  const [formData, setFormData] = useState({
    contact_name: quote.contact_name,
    email: quote.email,
    phone: quote.phone,
    location: quote.location,
    event_date: quote.event_date,
    start_time: quote.start_time,
    guest_count: quote.guest_count,
    service_type: quote.service_type,
  });

  // Store original for change detection
  const originalData = useMemo(() => ({
    contact_name: quote.contact_name,
    email: quote.email,
    phone: quote.phone,
    location: quote.location,
    event_date: quote.event_date,
    start_time: quote.start_time,
    guest_count: quote.guest_count,
    service_type: quote.service_type,
  }), [quote]);

  const [showChangeModal, setShowChangeModal] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<ChangeItem[]>([]);
  const [isLogging, setIsLogging] = useState(false);

  const updateQuote = useUpdateQuote();
  const historyLogger = useMemo(() => new HistoryLogger(), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Detect changes
    const changes = detectChanges(originalData, formData, TRACKED_FIELDS);
    
    if (changes.length > 0) {
      // Show modal to capture context
      setPendingChanges(changes);
      setShowChangeModal(true);
    } else {
      // No changes, just save
      await updateQuote.mutateAsync({ quoteId: quote.id, updates: formData });
      onSave();
    }
  };

  const handleConfirmChange = async (context: ChangeContext) => {
    setIsLogging(true);
    try {
      // Log changes with context
      await historyLogger.logChangeWithContext(
        quote.id,
        invoiceId || null,
        pendingChanges,
        context
      );

      // Save the actual changes
      await updateQuote.mutateAsync({ quoteId: quote.id, updates: formData });
      
      setShowChangeModal(false);
      onSave();
    } catch (error) {
      console.error('Error saving changes:', error);
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <>
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

        <Separator />

        {/* Service Type Section */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Service Type</h4>
          <div className="grid gap-2">
            {SERVICE_OPTIONS.map((option) => (
              <div
                key={option.id}
                className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                  formData.service_type === option.id 
                    ? 'border-primary bg-primary/5' 
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => setFormData(prev => ({ ...prev, service_type: option.id }))}
              >
                {formData.service_type === option.id ? (
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  {option.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{option.name}</span>
                    {option.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                        {option.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={updateQuote.isPending}>
            {updateQuote.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </form>

      <ChangeContextModal
        open={showChangeModal}
        onClose={() => setShowChangeModal(false)}
        onConfirm={handleConfirmChange}
        changes={pendingChanges}
        isLoading={isLogging || updateQuote.isPending}
      />
    </>
  );
}
