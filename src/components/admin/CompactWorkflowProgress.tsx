import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  CheckCircle,
  Circle,
  Clock,
  Info,
  ArrowRight
} from 'lucide-react';

interface CompactWorkflowProgressProps {
  progress: number;
  currentPhase: 'quote' | 'approved' | 'execution';
  nextAction?: {
    action: string;
    title: string;
    description: string;
    icon: React.ComponentType<any>;
    canExecute: boolean;
    estimatedTime?: string;
  } | null;
  onActionClick?: () => void;
}

export function CompactWorkflowProgress({ 
  progress, 
  currentPhase, 
  nextAction,
  onActionClick 
}: CompactWorkflowProgressProps) {
  const getPhaseDisplay = () => {
    switch (currentPhase) {
      case 'quote': return { label: 'Quote', color: 'bg-blue-500' };
      case 'approved': return { label: 'Approved', color: 'bg-green-500' };
      case 'execution': return { label: 'Execution', color: 'bg-purple-500' };
    }
  };

  const phaseDisplay = getPhaseDisplay();

  return (
    <div className="flex items-center gap-4">
      {/* Progress Indicator */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="p-2 h-auto">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Circle className="h-8 w-8 text-muted-foreground" />
                <div 
                  className={`absolute inset-1 rounded-full ${phaseDisplay.color} opacity-20`}
                />
                <div 
                  className={`absolute inset-1 rounded-full ${phaseDisplay.color}`}
                  style={{ 
                    clipPath: `polygon(50% 50%, 50% 0%, ${50 + (progress * 50) / 100}% 0%, ${50 + (progress * 50) / 100}% ${progress < 50 ? 0 : 100}%, ${progress < 50 ? 50 : 50 + ((progress - 50) * 50) / 100}% ${progress < 50 ? 50 - ((progress * 50) / 100) : 100}%, 50% 50%)` 
                  }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                  {progress}%
                </span>
              </div>
              <div className="text-left">
                <div className="text-xs font-medium">{phaseDisplay.label} Phase</div>
                <div className="text-xs text-muted-foreground">Workflow Progress</div>
              </div>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Overall Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            
            <div className="flex gap-2">
              <Badge variant={currentPhase === 'quote' ? 'default' : 'outline'}>
                Quote
              </Badge>
              <Badge variant={currentPhase === 'approved' ? 'default' : 'outline'}>
                Approved
              </Badge>
              <Badge variant={currentPhase === 'execution' ? 'default' : 'outline'}>
                Execution
              </Badge>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Next Action */}
      {nextAction && (
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant={nextAction.canExecute ? "default" : "secondary"} 
              size="sm"
              className="gap-2"
            >
              <nextAction.icon className="h-4 w-4" />
              {nextAction.title}
              {nextAction.estimatedTime && (
                <Badge variant="secondary" className="ml-1">
                  <Clock className="h-3 w-3 mr-1" />
                  {nextAction.estimatedTime}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
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

              {nextAction.action !== 'set_pricing' && onActionClick && (
                <Button
                  onClick={onActionClick}
                  disabled={!nextAction.canExecute}
                  className="w-full"
                  size="sm"
                >
                  <nextAction.icon className="h-4 w-4 mr-2" />
                  Execute Action
                </Button>
              )}
              
              {nextAction.action === 'set_pricing' && (
                <div className="flex items-start gap-2 p-2 bg-muted rounded-lg">
                  <Info className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    Complete the pricing form to continue with the workflow.
                  </p>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}