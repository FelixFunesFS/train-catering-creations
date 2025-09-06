import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Save, 
  X, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Keyboard
} from 'lucide-react';

interface FloatingActionControlsProps {
  isVisible: boolean;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  hasErrors: boolean;
  onSave: () => void;
  onCancel: () => void;
  className?: string;
}

export function FloatingActionControls({
  isVisible,
  isSaving,
  hasUnsavedChanges,
  hasErrors,
  onSave,
  onCancel,
  className = ""
}: FloatingActionControlsProps) {
  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-6 right-6 z-50 animate-fade-in ${className}`}>
      <Card className="p-4 shadow-lg border-border/50 backdrop-blur-sm bg-card/95">
        <div className="flex items-center gap-4">
          {/* Status Indicator */}
          <div className="flex items-center gap-2">
            {isSaving ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Saving...</span>
              </div>
            ) : hasUnsavedChanges ? (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-warning border-warning/50">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Unsaved Changes
                </Badge>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-success">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">All changes saved</span>
              </div>
            )}
          </div>

          <Separator orientation="vertical" className="h-8" />

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onCancel}
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
              <Badge variant="secondary" className="text-xs ml-1">Esc</Badge>
            </Button>

            <Button
              size="sm"
              onClick={onSave}
              disabled={isSaving || hasErrors || !hasUnsavedChanges}
              className="flex items-center gap-2"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Changes
              <Badge variant="secondary" className="text-xs ml-1">Ctrl+S</Badge>
            </Button>
          </div>
        </div>

        {/* Keyboard Shortcuts Hint */}
        <div className="mt-3 pt-3 border-t border-border/50">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Keyboard className="h-3 w-3" />
            <span>Keyboard shortcuts enabled</span>
          </div>
        </div>
      </Card>
    </div>
  );
}