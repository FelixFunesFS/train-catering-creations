import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface ChangesSummaryBannerProps {
  updatedAt: string;
  changeCount?: number;
  status?: 'approved' | 'pending' | 'rejected';
}

export function ChangesSummaryBanner({ 
  updatedAt, 
  changeCount = 0,
  status = 'approved' 
}: ChangesSummaryBannerProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'approved':
        return {
          icon: CheckCircle2,
          variant: 'default' as const,
          bgClass: 'bg-green-50 border-green-200',
          textClass: 'text-green-900',
          iconClass: 'text-green-600',
          message: 'Your estimate has been updated based on your requested changes.'
        };
      case 'pending':
        return {
          icon: Clock,
          variant: 'secondary' as const,
          bgClass: 'bg-orange-50 border-orange-200',
          textClass: 'text-orange-900',
          iconClass: 'text-orange-600',
          message: 'Your change request is being reviewed.'
        };
      case 'rejected':
        return {
          icon: AlertCircle,
          variant: 'destructive' as const,
          bgClass: 'bg-red-50 border-red-200',
          textClass: 'text-red-900',
          iconClass: 'text-red-600',
          message: 'Your change request was reviewed. Please see the response below.'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Alert className={config.bgClass}>
      <Icon className={`h-4 w-4 ${config.iconClass}`} />
      <AlertDescription className={config.textClass}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex-1">
            <p className="font-medium">{config.message}</p>
            <p className="text-sm mt-1 opacity-90">
              Last updated: {format(new Date(updatedAt), 'PPp')}
            </p>
          </div>
          {changeCount > 0 && (
            <Badge variant={config.variant} className="shrink-0">
              {changeCount} {changeCount === 1 ? 'change' : 'changes'}
            </Badge>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
