import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, AlertCircle, Send, Eye, ThumbsUp, CreditCard, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface EstimateStatusIndicatorProps {
  status: string;
  hasChangeRequests?: boolean;
  hasManualOverrides?: boolean;
  showProgress?: boolean;
}

const statusConfig = {
  draft: {
    label: "Draft",
    color: "bg-muted text-muted-foreground",
    icon: FileText,
    progress: 20,
    description: "Estimate is being prepared"
  },
  sent: {
    label: "Sent",
    color: "bg-blue-500 text-white",
    icon: Send,
    progress: 40,
    description: "Sent to customer for review"
  },
  under_review: {
    label: "Under Review",
    color: "bg-yellow-500 text-white",
    icon: Eye,
    progress: 60,
    description: "Customer is reviewing the estimate"
  },
  customer_approved: {
    label: "Approved",
    color: "bg-green-500 text-white",
    icon: ThumbsUp,
    progress: 80,
    description: "Customer has approved the estimate"
  },
  paid: {
    label: "Paid",
    color: "bg-emerald-600 text-white",
    icon: CreditCard,
    progress: 100,
    description: "Payment received, ready for execution"
  }
};

export const EstimateStatusIndicator = ({ 
  status, 
  hasChangeRequests = false, 
  hasManualOverrides = false,
  showProgress = false 
}: EstimateStatusIndicatorProps) => {
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
  const Icon = config.icon;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-full", config.color)}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{config.label}</span>
            {hasChangeRequests && (
              <Badge variant="outline" className="text-xs">
                <AlertCircle className="h-3 w-3 mr-1" />
                Changes Requested
              </Badge>
            )}
            {hasManualOverrides && (
              <Badge variant="secondary" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                Modified
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{config.description}</p>
        </div>
      </div>

      {showProgress && (
        <Card>
          <CardContent className="pt-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Estimate Progress</span>
                <span>{config.progress}%</span>
              </div>
              <Progress value={config.progress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};