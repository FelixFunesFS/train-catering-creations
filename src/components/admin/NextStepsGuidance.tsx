import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Clock,
  RefreshCw,
  HelpCircle
} from 'lucide-react';

interface NextAction {
  action: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  variant: 'default' | 'outline' | 'secondary';
  canExecute: boolean;
  requirements?: string[];
  helpText?: string;
}

interface NextStepsGuidanceProps {
  nextAction: NextAction | null;
  loading: boolean;
  error?: string | null;
  onExecuteAction: (action: string) => void;
  onRetry?: () => void;
  showHelp?: boolean;
}

export function NextStepsGuidance({ 
  nextAction, 
  loading, 
  error, 
  onExecuteAction, 
  onRetry,
  showHelp = false 
}: NextStepsGuidanceProps) {
  if (!nextAction) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p>Workflow completed! No further actions required.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRight className="h-5 w-5" />
          Next Steps
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              {onRetry && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onRetry}
                  className="ml-2"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Retry
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Next Action */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <nextAction.icon className="h-5 w-5 mt-0.5 text-primary" />
            <div className="flex-1">
              <h4 className="font-medium">{nextAction.title}</h4>
              <p className="text-sm text-muted-foreground">{nextAction.description}</p>
            </div>
            <Badge variant={nextAction.canExecute ? "default" : "secondary"}>
              {nextAction.canExecute ? "Ready" : "Blocked"}
            </Badge>
          </div>

          {/* Requirements Check */}
          {nextAction.requirements && nextAction.requirements.length > 0 && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium">Requirements:</p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {nextAction.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Help Text */}
          {showHelp && nextAction.helpText && (
            <Alert>
              <HelpCircle className="h-4 w-4" />
              <AlertDescription>{nextAction.helpText}</AlertDescription>
            </Alert>
          )}

          {/* Action Button */}
          {nextAction.action !== 'await_approval' && (
            <Button
              onClick={() => onExecuteAction(nextAction.action)}
              disabled={loading || !nextAction.canExecute}
              variant={nextAction.variant}
              className="w-full"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <nextAction.icon className="h-4 w-4 mr-2" />
                  {nextAction.title}
                </>
              )}
            </Button>
          )}

          {/* Waiting State */}
          {nextAction.action === 'await_approval' && (
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Clock className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Waiting for customer action. No admin intervention needed at this time.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}