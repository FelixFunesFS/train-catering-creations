import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { BatchOperations } from './BatchOperations';
import { Menu, Settings } from 'lucide-react';

interface MobileAdminActionsProps {
  selectedItems: string[];
  onBatchAction: (action: string, itemIds: string[]) => Promise<void>;
  onStatusUpdate: (itemId: string, newStatus: string) => Promise<void>;
  itemType: string;
  data: any;
}

export function MobileAdminActions({
  selectedItems,
  onBatchAction,
  onStatusUpdate,
  itemType,
  data
}: MobileAdminActionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-80">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Admin Actions
            </SheetTitle>
          </SheetHeader>
          
          <div className="space-y-6 mt-6">
            {/* Batch Operations */}

            {selectedItems.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium">Batch Operations</h3>
                <BatchOperations
                  selectedItems={selectedItems}
                  onAction={onBatchAction}
                  itemType={itemType}
                />
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}