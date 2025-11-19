import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, Calendar, DollarSign, Clock, CheckCircle2 } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface RiskEvent {
  id: string;
  event_name: string;
  event_date: string;
  contact_name: string;
  workflow_status: string;
  riskType: 'overdue_payment' | 'upcoming_event' | 'missing_info' | 'pending_approval';
  riskLevel: 'high' | 'medium' | 'low';
  message: string;
  invoices?: any[];
}

export function AtRiskEventsPanel() {
  const [riskEvents, setRiskEvents] = useState<RiskEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadRiskEvents();
  }, []);

  const loadRiskEvents = async () => {
    try {
      setLoading(true);
      const { data: quotes, error } = await supabase
        .from('quote_requests')
        .select(`
          id,
          event_name,
          event_date,
          contact_name,
          workflow_status,
          invoices(id, total_amount, workflow_status, due_date)
        `)
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true });

      if (error) throw error;

      const risks: RiskEvent[] = [];
      const today = new Date();

      quotes?.forEach(quote => {
        const eventDate = new Date(quote.event_date);
        const daysUntilEvent = differenceInDays(eventDate, today);

        // Upcoming event without payment
        if (daysUntilEvent <= 14 && quote.workflow_status !== 'paid') {
          risks.push({
            ...quote,
            riskType: 'upcoming_event',
            riskLevel: daysUntilEvent <= 7 ? 'high' : 'medium',
            message: `Event in ${daysUntilEvent} days - Not yet paid`,
          });
        }

        // Pending approval for too long
        if (quote.workflow_status === 'estimated' && quote.invoices?.[0]) {
          const daysSinceSent = 3; // Default to 3 days if created_at not available
          
          if (daysSinceSent > 3) {
            risks.push({
              ...quote,
              riskType: 'pending_approval',
              riskLevel: daysSinceSent > 7 ? 'high' : 'medium',
              message: `Estimate sent ${daysSinceSent} days ago - No response`,
            });
          }
        }

        // Overdue payment
        quote.invoices?.forEach(invoice => {
          if (invoice.due_date && invoice.workflow_status !== 'paid') {
            const dueDate = new Date(invoice.due_date);
            const daysOverdue = differenceInDays(today, dueDate);
            
            if (daysOverdue > 0) {
              risks.push({
                ...quote,
                riskType: 'overdue_payment',
                riskLevel: 'high',
                message: `Payment ${daysOverdue} days overdue`,
              });
            }
          }
        });
      });

      // Sort by risk level
      risks.sort((a, b) => {
        const levelOrder = { high: 0, medium: 1, low: 2 };
        return levelOrder[a.riskLevel] - levelOrder[b.riskLevel];
      });

      setRiskEvents(risks);
    } catch (error) {
      console.error('Error loading risk events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-amber-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskIcon = (type: string) => {
    switch (type) {
      case 'overdue_payment': return DollarSign;
      case 'upcoming_event': return Calendar;
      case 'pending_approval': return Clock;
      default: return AlertTriangle;
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            At-Risk Events
          </h2>
          <p className="text-muted-foreground">Events requiring immediate attention</p>
        </div>
        <Badge variant="destructive" className="text-lg px-4 py-2">
          {riskEvents.filter(e => e.riskLevel === 'high').length} High Priority
        </Badge>
      </div>

      {riskEvents.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">All Clear!</h3>
            <p className="text-muted-foreground">No events require immediate attention</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {riskEvents.map((event, idx) => {
            const Icon = getRiskIcon(event.riskType);
            
            return (
              <Card 
                key={`${event.id}-${idx}`}
                className="border-l-4 hover:shadow-md transition-shadow cursor-pointer"
                style={{ borderLeftColor: getRiskColor(event.riskLevel).replace('bg-', '') }}
                onClick={() => navigate(`/admin?view=workflow&quoteId=${event.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <h3 className="font-semibold">{event.event_name}</h3>
                        <Badge className={getRiskColor(event.riskLevel)}>
                          {event.riskLevel}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground">{event.message}</p>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(event.event_date), 'MMM dd, yyyy')}
                        </div>
                        <div>{event.contact_name}</div>
                      </div>
                    </div>

                    <Button size="sm" variant="outline">
                      Take Action
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
