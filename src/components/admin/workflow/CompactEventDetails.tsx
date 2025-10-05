import React from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown, Calendar, Users, MapPin, Mail, Phone, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { formatEventName, formatLocation, formatCustomerName } from '@/utils/textFormatters';
import { formatPhoneNumber } from '@/utils/phoneFormatter';

interface Quote {
  event_name: string;
  contact_name: string;
  event_date: string;
  guest_count: number;
  location: string;
  email: string;
  phone: string;
  start_time?: string;
  special_requests?: string;
  event_type: string;
}

interface CompactEventDetailsProps {
  quote: Quote;
  defaultOpen?: boolean;
}

export function CompactEventDetails({ quote, defaultOpen = false }: CompactEventDetailsProps) {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="space-y-2">
      <CollapsibleTrigger asChild>
        <Button 
          variant="ghost" 
          className="w-full justify-between px-0 hover:bg-transparent"
        >
          <span className="text-sm font-medium flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Event Details
          </span>
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm bg-muted/30 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
            <div>
              <div className="font-medium text-xs text-muted-foreground">Date & Time</div>
              <div>{format(new Date(quote.event_date), 'PPP')}</div>
              {quote.start_time && <div className="text-xs text-muted-foreground">{quote.start_time}</div>}
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Users className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
            <div>
              <div className="font-medium text-xs text-muted-foreground">Guest Count</div>
              <div>{quote.guest_count} guests</div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
            <div>
              <div className="font-medium text-xs text-muted-foreground">Location</div>
              <div className="break-words">{formatLocation(quote.location)}</div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Mail className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
            <div>
              <div className="font-medium text-xs text-muted-foreground">Contact</div>
              <div>{formatCustomerName(quote.contact_name)}</div>
              <div className="text-xs text-muted-foreground break-all">{quote.email}</div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Phone className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
            <div>
              <div className="font-medium text-xs text-muted-foreground">Phone</div>
              <div>{formatPhoneNumber(quote.phone)}</div>
            </div>
          </div>

          {quote.special_requests && (
            <div className="md:col-span-3 flex items-start gap-2">
              <FileText className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
              <div>
                <div className="font-medium text-xs text-muted-foreground">Special Requests</div>
                <div className="text-xs">{quote.special_requests}</div>
              </div>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
