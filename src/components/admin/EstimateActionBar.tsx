import { useState } from "react";
import { Eye, Send, Save, ArrowLeft, Edit3, Download } from "lucide-react";
import { SimplifiedActionButton } from "./SimplifiedActionButton";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface EstimateActionBarProps {
  context: "creation" | "preview" | "management";
  status?: string;
  hasUnsavedChanges?: boolean;
  isAutoSaving?: boolean;
  isSaving?: boolean;
  invoiceId?: string;
  onBack?: () => void;
  onPreview?: () => void;
  onSave?: () => void;
  onSend?: () => void;
  onEdit?: () => void;
  onDownload?: () => void;
  className?: string;
}

export function EstimateActionBar({
  context,
  status = "draft",
  hasUnsavedChanges = false,
  isAutoSaving = false,
  isSaving = false,
  invoiceId,
  onBack,
  onPreview,
  onSave,
  onSend,
  onEdit,
  onDownload,
  className
}: EstimateActionBarProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleAction = async (actionId: string, action?: () => void | Promise<void>) => {
    if (!action) return;
    
    setIsLoading(actionId);
    try {
      await action();
    } finally {
      setIsLoading(null);
    }
  };

  const getPrimaryAction = () => {
    switch (context) {
      case "creation":
        return {
          id: "send",
          label: "Send to Customer",
          icon: <Send className="h-4 w-4" />,
          action: onSend,
          disabled: !invoiceId || hasUnsavedChanges || isAutoSaving
        };
      case "preview":
        if (status === "draft") {
          return {
            id: "send",
            label: "Send to Customer", 
            icon: <Send className="h-4 w-4" />,
            action: onSend,
            disabled: false
          };
        } else if (status === "sent") {
          return {
            id: "follow-up",
            label: "Send Follow-up",
            icon: <Send className="h-4 w-4" />,
            action: onSend,
            disabled: false
          };
        }
        return null;
      case "management":
        return {
          id: "edit",
          label: "Edit Estimate",
          icon: <Edit3 className="h-4 w-4" />,
          action: onEdit,
          disabled: false
        };
      default:
        return null;
    }
  };

  const getSecondaryActions = () => {
    const actions = [];
    
    if (context === "creation") {
      actions.push(
        {
          id: "preview",
          label: "Preview",
          icon: <Eye className="h-4 w-4" />,
          action: onPreview,
          disabled: !invoiceId || hasUnsavedChanges || isAutoSaving
        },
        {
          id: "save",
          label: hasUnsavedChanges ? "Save Changes" : "Saved",
          icon: <Save className="h-4 w-4" />,
          action: onSave,
          disabled: !hasUnsavedChanges || isAutoSaving,
          isLoading: isSaving || isAutoSaving,
          loadingText: isAutoSaving ? "Auto-saving..." : "Saving..."
        }
      );
    } else if (context === "preview") {
      actions.push(
        {
          id: "edit",
          label: "Edit",
          icon: <Edit3 className="h-4 w-4" />,
          action: onEdit,
          disabled: false
        },
        {
          id: "download",
          label: "Download PDF",
          icon: <Download className="h-4 w-4" />,
          action: onDownload,
          disabled: false
        }
      );
    } else if (context === "management") {
      actions.push(
        {
          id: "preview",
          label: "Preview",
          icon: <Eye className="h-4 w-4" />,
          action: onPreview,
          disabled: false
        },
        {
          id: "download",
          label: "Download PDF",
          icon: <Download className="h-4 w-4" />,
          action: onDownload,
          disabled: false
        }
      );
    }
    
    return actions;
  };

  const primaryAction = getPrimaryAction();
  const secondaryActions = getSecondaryActions();

  return (
    <div className={cn("flex items-center justify-between w-full", className)}>
      {/* Back Navigation */}
      <div className="flex items-center">
        {onBack && (
          <>
            <SimplifiedActionButton
              variant="tertiary"
              onClick={onBack}
              icon={<ArrowLeft className="h-4 w-4" />}
            >
              Back
            </SimplifiedActionButton>
            <Separator orientation="vertical" className="h-6 mx-4" />
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        {/* Secondary Actions */}
        {secondaryActions.map((action) => (
          <SimplifiedActionButton
            key={action.id}
            variant="secondary"
            onClick={() => handleAction(action.id, action.action)}
            icon={action.icon}
            disabled={action.disabled}
            isLoading={action.isLoading || isLoading === action.id}
            loadingText={action.loadingText}
          >
            {action.label}
          </SimplifiedActionButton>
        ))}

        {/* Primary Action */}
        {primaryAction && (
          <SimplifiedActionButton
            variant="primary"
            onClick={() => handleAction(primaryAction.id, primaryAction.action)}
            icon={primaryAction.icon}
            disabled={primaryAction.disabled}
            isLoading={isLoading === primaryAction.id}
          >
            {primaryAction.label}
          </SimplifiedActionButton>
        )}
      </div>
    </div>
  );
}