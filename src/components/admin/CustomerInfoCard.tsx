import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, MapPin, Calendar, Clock, Users, Utensils, Star, CalendarDays, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CustomerInfoCardProps {
  quote: any;
  isCompact?: boolean;
}

export function CustomerInfoCard({ quote, isCompact = false }: CustomerInfoCardProps) {
  const { toast } = useToast();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const formatTimeField = (timeString: string) => {
    if (!timeString) return 'Not specified';
    try {
      const [hours, minutes] = timeString.split(':');
      const hour24 = parseInt(hours);
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
      const ampm = hour24 >= 12 ? 'PM' : 'AM';
      return `${hour12}:${minutes} ${ampm}`;
    } catch {
      return timeString;
    }
  };

  if (isCompact) {
    return (
      <Card className="neumorphic-card-1">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">{quote.contact_name}</span>
            </div>
            <Badge variant={quote.status === 'confirmed' ? 'default' : 'secondary'} className="text-xs">
              {quote.status}
            </Badge>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span>{quote.event_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span>{new Date(quote.event_date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-3 w-3 text-muted-foreground" />
              <span>{quote.guest_count} guests</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="neumorphic-card-2">
      <CardHeader>
        <CardTitle className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Customer & Event Overview
          </div>
          <Badge 
            variant={quote.status === 'confirmed' ? 'default' : 
                     quote.status === 'pending' ? 'secondary' : 'outline'}
            className="capitalize px-3 py-1"
          >
            {quote.status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Contact Information Section */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide border-b pb-2">
              Contact Details
            </h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <User className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <label className="text-xs font-medium text-muted-foreground">Name</label>
                  <p className="text-sm font-medium mt-1 truncate">{quote.contact_name}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(quote.contact_name, 'Name')}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <label className="text-xs font-medium text-muted-foreground">Email</label>
                  <p className="text-sm font-medium mt-1 truncate">{quote.email}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => window.open(`mailto:${quote.email}`, '_blank')}
                  className="h-6 w-6 p-0"
                >
                  <Mail className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <label className="text-xs font-medium text-muted-foreground">Phone</label>
                  <p className="text-sm font-medium mt-1">{quote.phone}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => window.open(`tel:${quote.phone}`, '_self')}
                  className="h-6 w-6 p-0"
                >
                  <Phone className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <label className="text-xs font-medium text-muted-foreground">Location</label>
                  <p className="text-sm font-medium mt-1">{quote.location}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(quote.location, 'Location')}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Event Information Section */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide border-b pb-2">
              Event Details
            </h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <label className="text-xs font-medium text-muted-foreground">Event Name</label>
                  <p className="text-sm font-medium mt-1 truncate">{quote.event_name}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Star className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <label className="text-xs font-medium text-muted-foreground">Event Type</label>
                  <p className="text-sm font-medium mt-1 capitalize">{quote.event_type.replace('_', ' ')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CalendarDays className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <label className="text-xs font-medium text-muted-foreground">Date</label>
                  <p className="text-sm font-medium mt-1">{new Date(quote.event_date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <label className="text-xs font-medium text-muted-foreground">Start Time</label>
                  <p className="text-sm font-medium mt-1">{formatTimeField(quote.start_time)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Service & Status Section */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide border-b pb-2">
              Service & Status
            </h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Users className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <label className="text-xs font-medium text-muted-foreground">Guest Count</label>
                  <p className="text-sm font-medium mt-1">{quote.guest_count} guests</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Utensils className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <label className="text-xs font-medium text-muted-foreground">Service Type</label>
                  <p className="text-sm font-medium mt-1 capitalize">{quote.service_type.replace('_', ' ')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <label className="text-xs font-medium text-muted-foreground">Calendar Status</label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`h-2 w-2 rounded-full ${
                      quote.calendar_sync_status === 'synced' ? 'bg-green-500' : 
                      quote.calendar_sync_status === 'pending' ? 'bg-yellow-500' : 'bg-gray-400'
                    }`} />
                    <span className="text-sm font-medium capitalize">
                      {quote.calendar_sync_status?.replace('_', ' ') || 'Not Synced'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <label className="text-xs font-medium text-muted-foreground">Created</label>
                  <p className="text-sm font-medium mt-1">{new Date(quote.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(`tel:${quote.phone}`, '_self')}
              className="flex items-center gap-2"
            >
              <Phone className="h-3 w-3" />
              Call Customer
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(`mailto:${quote.email}`, '_blank')}
              className="flex items-center gap-2"
            >
              <Mail className="h-3 w-3" />
              Email Customer
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyToClipboard(`${quote.contact_name} - ${quote.event_name} - ${new Date(quote.event_date).toLocaleDateString()}`, 'Event details')}
              className="flex items-center gap-2"
            >
              <Copy className="h-3 w-3" />
              Copy Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}