import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, CheckCircle2, Timer } from 'lucide-react';
import { format, formatDistanceToNow, isPast, differenceInDays } from 'date-fns';

interface EventCountdownProps {
  quote: any;
  invoice: any;
}

export function EventCountdown({ quote, invoice }: EventCountdownProps) {
  const [timeUntilEvent, setTimeUntilEvent] = useState('');
  
  const eventDate = new Date(quote.event_date);
  const isPaid = invoice.status === 'paid';
  const daysUntil = differenceInDays(eventDate, new Date());
  const isEventPast = isPast(eventDate);

  useEffect(() => {
    const updateCountdown = () => {
      setTimeUntilEvent(formatDistanceToNow(eventDate, { addSuffix: true }));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [eventDate]);

  const getStatusBadge = () => {
    if (isEventPast) {
      return <Badge variant="outline" className="bg-muted">Event Completed</Badge>;
    }
    if (!isPaid) {
      return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Payment Pending</Badge>;
    }
    if (daysUntil <= 7) {
      return <Badge className="bg-green-500">Confirmed - Coming Soon!</Badge>;
    }
    return <Badge className="bg-green-500">Confirmed</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Countdown Card */}
      {!isEventPast && (
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                <Timer className="h-6 w-6 text-primary" />
                <h3 className="text-2xl font-bold">Your Event is {timeUntilEvent}</h3>
              </div>
              
              <div className="flex items-center justify-center gap-4 text-muted-foreground">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary">{Math.max(0, daysUntil)}</div>
                  <div className="text-sm">Days</div>
                </div>
              </div>

              {getStatusBadge()}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Event Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Event Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Event Name</p>
                <p className="text-sm text-muted-foreground">{quote.event_name}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Date</p>
                <p className="text-sm text-muted-foreground">
                  {format(eventDate, 'EEEE, MMMM dd, yyyy')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Time</p>
                <p className="text-sm text-muted-foreground">{quote.start_time}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Location</p>
                <p className="text-sm text-muted-foreground">{quote.location}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Guest Count</p>
                <p className="text-sm text-muted-foreground">{quote.guest_count} guests</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Service Type</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {quote.service_type?.replace('_', ' ')}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* What's Next */}
      {isPaid && !isEventPast && (
        <Card>
          <CardHeader>
            <CardTitle>What Happens Next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Payment Received ✅</p>
                <p className="text-sm text-muted-foreground">
                  Your event is confirmed and locked in our calendar
                </p>
              </div>
            </div>

            {daysUntil > 14 && (
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">2 Weeks Before Event</p>
                  <p className="text-sm text-muted-foreground">
                    We'll reach out to confirm final menu selections and guest count
                  </p>
                </div>
              </div>
            )}

            {daysUntil > 5 && daysUntil <= 14 && (
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Final Preparations Underway</p>
                  <p className="text-sm text-muted-foreground">
                    We're preparing your menu and scheduling our team
                  </p>
                </div>
              </div>
            )}

            {daysUntil <= 5 && daysUntil > 0 && (
              <div className="flex items-start gap-3">
                <Timer className="h-5 w-5 text-amber-500 mt-0.5" />
                <div>
                  <p className="font-medium">Almost Here!</p>
                  <p className="text-sm text-muted-foreground">
                    We're doing final prep and getting everything ready for your event
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Event Day</p>
                <p className="text-sm text-muted-foreground">
                  Our team will arrive early for setup and ensure everything is perfect
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
