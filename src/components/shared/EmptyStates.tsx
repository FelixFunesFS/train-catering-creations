import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Calendar, AlertCircle, Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        {icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

export function NoAtRiskEvents() {
  return (
    <EmptyState
      title="All Clear! 🎉"
      description="No events require immediate attention. Great work!"
      icon={<CheckCircle2 className="h-16 w-16 text-green-500" />}
    />
  );
}

export function NoEventsToday() {
  return (
    <EmptyState
      title="Enjoy Your Day Off! ☀️"
      description="No events scheduled for today. Time to prepare for upcoming events."
      icon={<Calendar className="h-16 w-16 text-blue-500" />}
    />
  );
}

export function NoPendingQuotes() {
  return (
    <EmptyState
      title="All Caught Up! ✅"
      description="No pending quote requests at the moment."
      icon={<Inbox className="h-16 w-16 text-gray-400" />}
    />
  );
}

export function NoChangeRequests() {
  return (
    <EmptyState
      title="No Change Requests"
      description="All customers are happy with their estimates!"
      icon={<CheckCircle2 className="h-16 w-16 text-green-500" />}
    />
  );
}
