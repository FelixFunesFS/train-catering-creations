import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, MapPin, Clock, ArrowRight, DollarSign, MessageSquare, Utensils, Settings } from 'lucide-react';
import { formatCurrency } from '@/lib/changeRequestUtils';

interface ChangesSummaryCardProps {
  originalDetails: any;
  requestedChanges: any;
  customerComments?: string;
  estimatedCostChange?: number;
}

export function ChangesSummaryCard({ 
  originalDetails, 
  requestedChanges, 
  customerComments,
  estimatedCostChange 
}: ChangesSummaryCardProps) {
  const hasStructuredChanges = 
    requestedChanges?.event_date || 
    requestedChanges?.guest_count || 
    requestedChanges?.location || 
    requestedChanges?.start_time;

  const hasTextChanges = 
    (requestedChanges?.menu_changes && typeof requestedChanges.menu_changes === 'string') || 
    requestedChanges?.service_changes || 
    requestedChanges?.dietary_changes;

  const hasStructuredMenuChanges = 
    requestedChanges?.menu_changes && typeof requestedChanges.menu_changes === 'object';

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Requested Changes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Structured Changes (Before → After) */}
        {hasStructuredChanges && (
          <div className="space-y-3">
            {requestedChanges.event_date && (
              <ChangeItem
                icon={<Calendar className="h-4 w-4" />}
                label="Event Date"
                before={originalDetails?.event_date ? new Date(originalDetails.event_date).toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                }) : 'Not set'}
                after={new Date(requestedChanges.event_date).toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              />
            )}

            {requestedChanges.guest_count && (
              <ChangeItem
                icon={<Users className="h-4 w-4" />}
                label="Guest Count"
                before={originalDetails?.guest_count ? `${originalDetails.guest_count} guests` : 'Not set'}
                after={`${requestedChanges.guest_count} guests`}
                highlight={requestedChanges.guest_count > (originalDetails?.guest_count || 0) ? 'increase' : 'decrease'}
              />
            )}

            {requestedChanges.location && (
              <ChangeItem
                icon={<MapPin className="h-4 w-4" />}
                label="Location"
                before={originalDetails?.location || 'Not set'}
                after={requestedChanges.location}
              />
            )}

            {requestedChanges.start_time && (
              <ChangeItem
                icon={<Clock className="h-4 w-4" />}
                label="Start Time"
                before={originalDetails?.start_time || 'Not set'}
                after={requestedChanges.start_time}
              />
            )}
          </div>
        )}

        {/* Structured Menu Changes */}
        {hasStructuredMenuChanges && (
          <div className="space-y-3 pt-3 border-t">
            <div className="flex items-start gap-3 text-sm">
              <Utensils className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1 space-y-3">
                <div className="font-medium text-foreground">Menu Changes:</div>
                
                {/* Protein Removals */}
                {requestedChanges.menu_changes.proteins?.remove?.length > 0 && (
                  <div className="pl-4">
                    <p className="font-medium text-xs text-muted-foreground mb-1">Remove Proteins:</p>
                    <div className="flex flex-wrap gap-1">
                      {requestedChanges.menu_changes.proteins.remove.map((item: string, idx: number) => (
                        <Badge key={idx} variant="destructive" className="text-xs">✕ {item}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Appetizers Removals */}
                {requestedChanges.menu_changes.appetizers?.remove?.length > 0 && (
                  <div className="pl-4">
                    <p className="font-medium text-xs text-muted-foreground mb-1">Remove Appetizers:</p>
                    <div className="flex flex-wrap gap-1">
                      {requestedChanges.menu_changes.appetizers.remove.map((item: string, idx: number) => (
                        <Badge key={idx} variant="destructive" className="text-xs">✕ {item}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sides Removals */}
                {requestedChanges.menu_changes.sides?.remove?.length > 0 && (
                  <div className="pl-4">
                    <p className="font-medium text-xs text-muted-foreground mb-1">Remove Sides:</p>
                    <div className="flex flex-wrap gap-1">
                      {requestedChanges.menu_changes.sides.remove.map((item: string, idx: number) => (
                        <Badge key={idx} variant="destructive" className="text-xs">✕ {item}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Desserts Removals */}
                {requestedChanges.menu_changes.desserts?.remove?.length > 0 && (
                  <div className="pl-4">
                    <p className="font-medium text-xs text-muted-foreground mb-1">Remove Desserts:</p>
                    <div className="flex flex-wrap gap-1">
                      {requestedChanges.menu_changes.desserts.remove.map((item: string, idx: number) => (
                        <Badge key={idx} variant="destructive" className="text-xs">✕ {item}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Drinks Removals */}
                {requestedChanges.menu_changes.drinks?.remove?.length > 0 && (
                  <div className="pl-4">
                    <p className="font-medium text-xs text-muted-foreground mb-1">Remove Drinks:</p>
                    <div className="flex flex-wrap gap-1">
                      {requestedChanges.menu_changes.drinks.remove.map((item: string, idx: number) => (
                        <Badge key={idx} variant="destructive" className="text-xs">✕ {item}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Service Options Changes */}
                {requestedChanges.menu_changes.service_options && Object.keys(requestedChanges.menu_changes.service_options).length > 0 && (
                  <div className="pl-4">
                    <p className="font-medium text-xs text-muted-foreground mb-1">Service Options:</p>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(requestedChanges.menu_changes.service_options).map(([key, value]: [string, any], idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {key.replace(/_/g, ' ')}: {value ? '✓' : '✗'}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Custom Requests */}
                {requestedChanges.menu_changes.custom_requests && (
                  <div className="pl-4">
                    <p className="font-medium text-xs text-muted-foreground mb-1">Custom Requests:</p>
                    <p className="text-sm text-muted-foreground italic whitespace-pre-wrap">
                      {requestedChanges.menu_changes.custom_requests}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Text-based Changes (Legacy & Other) */}
        {hasTextChanges && (
          <div className="space-y-3 pt-3 border-t">
            {requestedChanges.menu_changes && typeof requestedChanges.menu_changes === 'string' && (
              <TextChangeItem
                icon={<Utensils className="h-4 w-4" />}
                label="Menu Changes"
                content={requestedChanges.menu_changes}
              />
            )}

            {requestedChanges.service_changes && (
              <TextChangeItem
                icon={<Settings className="h-4 w-4" />}
                label="Service Changes"
                content={requestedChanges.service_changes}
              />
            )}

            {requestedChanges.dietary_changes && (
              <TextChangeItem
                icon={<MessageSquare className="h-4 w-4" />}
                label="Dietary Requirements"
                content={requestedChanges.dietary_changes}
              />
            )}
          </div>
        )}

        {/* Customer Comments */}
        {customerComments && (
          <div className="pt-3 border-t">
            <TextChangeItem
              icon={<MessageSquare className="h-4 w-4" />}
              label="Additional Comments"
              content={customerComments}
            />
          </div>
        )}

        {/* Cost Impact */}
        {estimatedCostChange !== undefined && estimatedCostChange !== 0 && (
          <div className="pt-3 border-t">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Estimated Cost Impact:</span>
              <Badge 
                variant={estimatedCostChange > 0 ? "destructive" : "default"}
                className={estimatedCostChange > 0 ? "" : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"}
              >
                {estimatedCostChange > 0 ? '+' : ''}{formatCurrency(Math.abs(estimatedCostChange))}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ChangeItemProps {
  icon: React.ReactNode;
  label: string;
  before: string;
  after: string;
  highlight?: 'increase' | 'decrease';
}

function ChangeItem({ icon, label, before, after, highlight }: ChangeItemProps) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <div className="text-muted-foreground mt-0.5">{icon}</div>
      <div className="flex-1 space-y-1">
        <div className="font-medium text-foreground">{label}</div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-muted-foreground line-through">{before}</span>
          <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
          <span 
            className={`font-medium ${
              highlight === 'increase' ? 'text-orange-600 dark:text-orange-400' : 
              highlight === 'decrease' ? 'text-green-600 dark:text-green-400' : 
              'text-foreground'
            }`}
          >
            {after}
          </span>
        </div>
      </div>
    </div>
  );
}

interface TextChangeItemProps {
  icon: React.ReactNode;
  label: string;
  content: string;
}

function TextChangeItem({ icon, label, content }: TextChangeItemProps) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <div className="text-muted-foreground mt-0.5">{icon}</div>
      <div className="flex-1 space-y-1">
        <div className="font-medium text-foreground">{label}</div>
        <p className="text-muted-foreground whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
}
