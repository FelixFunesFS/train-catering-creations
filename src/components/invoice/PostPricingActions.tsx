import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Send,
  FileText,
  Save,
  Eye,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign
} from 'lucide-react';

interface PostPricingActionsProps {
  totalAmount: number;
  isGovernmentContract: boolean;
  depositRequired: number;
  onSaveAsDraft: () => void;
  onGeneratePreview: () => void;
  onSendEstimate: () => void;
  onScheduleFollow: () => void;
  hasPendingItems: boolean;
}

export default function PostPricingActions({
  totalAmount,
  isGovernmentContract,
  depositRequired,
  onSaveAsDraft,
  onGeneratePreview,
  onSendEstimate,
  onScheduleFollow,
  hasPendingItems
}: PostPricingActionsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  if (hasPendingItems) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-500" />
            Complete Pricing First
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Set prices for all line items to unlock workflow actions.
          </p>
          <Button 
            onClick={onSaveAsDraft} 
            variant="outline" 
            className="w-full"
          >
            <Save className="h-4 w-4 mr-2" />
            Save as Draft
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          Ready to Send
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Summary */}
        <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-green-700 dark:text-green-300">
              Total: {formatCurrency(totalAmount)}
            </span>
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
              Ready
            </Badge>
          </div>
          {!isGovernmentContract && (
            <p className="text-xs text-green-600 dark:text-green-400">
              Deposit: {formatCurrency(depositRequired)} (25%)
            </p>
          )}
          {isGovernmentContract && (
            <p className="text-xs text-green-600 dark:text-green-400">
              Net 30 payment terms
            </p>
          )}
        </div>

        <Separator />

        {/* Primary Actions */}
        <div className="space-y-3">
          <Button 
            onClick={onSendEstimate} 
            className="w-full"
            size="lg"
          >
            <Send className="h-4 w-4 mr-2" />
            Send Estimate to Customer
          </Button>
          
          <div className="grid grid-cols-2 gap-2">
            <Button 
              onClick={onGeneratePreview} 
              variant="outline"
              size="sm"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button 
              onClick={onSaveAsDraft} 
              variant="outline"
              size="sm"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
          </div>
        </div>

        <Separator />

        {/* Follow-up Actions */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Follow-up Actions
          </h4>
          <Button 
            onClick={onScheduleFollow} 
            variant="ghost" 
            size="sm"
            className="w-full justify-start"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Follow-up
          </Button>
        </div>

        {/* Workflow Preview */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Next Steps Preview
          </h4>
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Customer receives professional estimate</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
              <span>Customer approves via email link</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
              <span>
                {isGovernmentContract 
                  ? 'Contract confirmed (Net 30)' 
                  : 'Deposit payment processed'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
              <span>Event automatically scheduled</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}