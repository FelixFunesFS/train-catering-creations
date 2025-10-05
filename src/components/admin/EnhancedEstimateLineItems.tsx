import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

import { 
  DollarSign,
  Plus,
  Trash2,
  Calculator,
  Building2,
  Save,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Shield,
  FileText
} from 'lucide-react';
import { type LineItem } from '@/utils/invoiceFormatters';

interface EnhancedEstimateLineItemsProps {
  lineItems: LineItem[];
  subtotal: number;
  taxAmount: number;
  grandTotal: number;
  updateLineItem: (itemId: string, updates: Partial<LineItem>) => void;
  addLineItem: () => void;
  removeLineItem: (itemId: string) => void;
  addTemplateItem: (template: any) => void;
  quickCalculatePerPerson: () => void;
  isGovernmentContract: boolean;
  onGovernmentToggle: (checked: boolean) => void;
  guestCount?: number;
  isModified: boolean;
  triggerAutoSave: () => void;
  requiresContract?: boolean;
  contractReason?: string;
  onContractToggleChange?: (checked: boolean) => void;
}

export function EnhancedEstimateLineItems({
  lineItems,
  subtotal,
  taxAmount,
  grandTotal,
  updateLineItem,
  addLineItem,
  removeLineItem,
  addTemplateItem,
  quickCalculatePerPerson,
  isGovernmentContract,
  onGovernmentToggle,
  guestCount = 0,
  isModified,
  triggerAutoSave,
  requiresContract,
  contractReason,
  onContractToggleChange
}: EnhancedEstimateLineItemsProps) {
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<Record<string, string>>({});
  
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  // Removed category grouping logic - using flat table structure


  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'package': return 'bg-gradient-to-r from-primary/10 to-primary/5 text-primary border-primary/20';
      case 'appetizers': return 'bg-gradient-to-r from-orange-100 to-orange-50 text-orange-800 border-orange-200 dark:from-orange-900 dark:to-orange-800 dark:text-orange-200';
      case 'sides': return 'bg-gradient-to-r from-green-100 to-green-50 text-green-800 border-green-200 dark:from-green-900 dark:to-green-800 dark:text-green-200';
      case 'beverages': return 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 border-blue-200 dark:from-blue-900 dark:to-blue-800 dark:text-blue-200';
      case 'desserts': return 'bg-gradient-to-r from-pink-100 to-pink-50 text-pink-800 border-pink-200 dark:from-pink-900 dark:to-pink-800 dark:text-pink-200';
      case 'service': return 'bg-gradient-to-r from-purple-100 to-purple-50 text-purple-800 border-purple-200 dark:from-purple-900 dark:to-purple-800 dark:text-purple-200';
      case 'equipment': return 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800 border-gray-200 dark:from-gray-900 dark:to-gray-800 dark:text-gray-200';
      default: return 'bg-gradient-to-r from-muted/10 to-muted/5 text-muted-foreground border-muted/20';
    }
  };

  const getCategoryBadge = (category: string) => {
    const colorClass = getCategoryColor(category);
    return (
      <Badge className={colorClass} variant="outline">
        {category}
      </Badge>
    );
  };

  // Quick templates for common line items (zero pricing for manual input)
  const getCommonLineItems = () => [
    { title: 'Service Fee', category: 'service' as const, description: 'Professional service and setup - requires manual pricing', unitPrice: 0 },
    { title: 'Equipment Rental', category: 'equipment' as const, description: 'Tables, chairs, linens, etc. - requires manual pricing', unitPrice: 0 },
    { title: 'Wait Staff', category: 'service' as const, description: 'Professional wait staff service - requires manual pricing', unitPrice: 0 },
    { title: 'Delivery Fee', category: 'service' as const, description: 'Delivery and setup - requires manual pricing', unitPrice: 0 },
    { title: 'Cleanup Service', category: 'service' as const, description: 'Post-event cleanup - requires manual pricing', unitPrice: 0 }
  ];

  const handleAddTemplateItem = (template: { title: string; category: 'food' | 'service' | 'equipment' | 'other'; description: string; unitPrice: number }) => {
    const newItem: LineItem = {
      id: `item_${Date.now()}`,
      title: template.title,
      description: template.description,
      quantity: 1,
      unit_price: 0, // Always zero for manual pricing
      total_price: 0, // Always zero for manual pricing
      category: template.category
    };

    addTemplateItem(newItem);
  };

  const handleQuickCalculate = () => {
    if (!guestCount) {
      toast({
        title: "Guest Count Required",
        description: "Please ensure guest count is set in the event details",
        variant: "destructive"
      });
      return;
    }
    quickCalculatePerPerson();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Line Items & Pricing
          {isModified && (
            <Badge variant="outline" className="ml-auto">
              <AlertCircle className="h-3 w-3 mr-1" />
              Unsaved Changes
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Government Contract Toggle */}
        <div className="flex items-center justify-between p-4 border border-border rounded-lg">
          <div className="flex items-center space-x-2">
            <Building2 className="h-4 w-4" />
            <Label htmlFor="government-contract" className="font-medium">
              Government Contract
            </Label>
          </div>
          <Switch
            id="government-contract"
            checked={isGovernmentContract}
            onCheckedChange={onGovernmentToggle}
          />
        </div>

        <Separator />

        {/* Contract Requirement Toggle */}
        {requiresContract !== undefined && onContractToggleChange && (
          <>
            <Alert>
              <AlertDescription className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1 text-sm">Contract Requirement</h4>
                    <p className="text-xs text-muted-foreground">{contractReason}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="requires-contract"
                      checked={requiresContract}
                      onCheckedChange={onContractToggleChange}
                    />
                    <Label htmlFor="requires-contract" className="text-xs whitespace-nowrap">
                      {requiresContract ? 'Contract' : 'T&C Only'}
                    </Label>
                  </div>
                </div>
                {!requiresContract && (
                  <p className="text-xs text-muted-foreground border-t pt-2 mt-2">
                    Customer will accept Terms & Conditions when approving the estimate (no separate contract needed)
                  </p>
                )}
              </AlertDescription>
            </Alert>

            <Separator />
          </>
        )}


        {/* Line Items by Category */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Line Items by Category ({lineItems.length})</Label>
            <Button 
              variant="outline" 
              size="sm"
              onClick={addLineItem}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Custom Item
            </Button>
          </div>

          {lineItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No line items yet</p>
              <p className="text-sm">Add items using the buttons above or add custom items</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              {/* Main Header */}
              <div className="px-4 py-3 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-base">All Line Items</h3>
                  <Badge variant="secondary" className="text-xs">
                    {lineItems.length} {lineItems.length === 1 ? 'item' : 'items'}
                  </Badge>
                </div>
                <span className="font-semibold text-sm">
                  ${(subtotal / 100).toFixed(2)}
                </span>
              </div>

              {/* Table Header (Desktop) */}
              <div className="hidden md:grid grid-cols-12 gap-3 px-3 py-2 text-xs font-semibold text-foreground border-b">
                <div className="col-span-3">Title</div>
                <div className="col-span-4">Description</div>
                <div className="col-span-1 text-center">Quantity</div>
                <div className="col-span-2 text-right">Unit Price</div>
                <div className="col-span-1 text-right">Total</div>
                <div className="col-span-1"></div>
              </div>

              {/* All Items - Flat Table */}
              <div className="divide-y">
                {lineItems.map((item: LineItem, idx: number) => (
                        <div 
                          key={item.id} 
                          className="px-3 py-2 hover:bg-muted/5 transition-colors"
                        >
                          {/* Desktop Layout */}
                          <div className="hidden md:grid grid-cols-12 gap-3 items-start">
                            <div className="col-span-3">
                              <Input
                                value={item.title}
                                onChange={(e) => updateLineItem(item.id, { title: e.target.value })}
                                placeholder="Item title"
                                className="h-8 text-sm"
                                onFocus={() => setEditingItem(item.id)}
                                onBlur={() => setEditingItem(null)}
                              />
                            </div>
                            
                            <div className="col-span-4">
                              <Textarea
                                value={item.description}
                                onChange={(e) => updateLineItem(item.id, { description: e.target.value })}
                                placeholder="Full description"
                                className="text-xs resize-none min-h-[60px]"
                                rows={3}
                              />
                            </div>
                            
                            <div className="col-span-1">
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateLineItem(item.id, { quantity: parseInt(e.target.value) || 0 })}
                                min="0"
                                className="h-8 text-center text-sm"
                              />
                            </div>
                            
                            <div className="col-span-2">
                              <div className="relative">
                                <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">$</span>
                                <Input
                                  type="text"
                                  value={editingValues[`${item.id}-unit_price`] !== undefined 
                                    ? editingValues[`${item.id}-unit_price`] 
                                    : (item.unit_price / 100).toFixed(2)}
                                  onChange={(e) => {
                                    const value = e.target.value.replace(/[^0-9.]/g, '');
                                    setEditingValues(prev => ({ ...prev, [`${item.id}-unit_price`]: value }));
                                  }}
                                  onFocus={() => {
                                    setEditingValues(prev => ({ ...prev, [`${item.id}-unit_price`]: (item.unit_price / 100).toFixed(2) }));
                                  }}
                                  onBlur={() => {
                                    const value = editingValues[`${item.id}-unit_price`];
                                    if (value !== undefined) {
                                      const numValue = parseFloat(value || '0');
                                      if (!isNaN(numValue)) {
                                        updateLineItem(item.id, { unit_price: Math.round(numValue * 100) });
                                      }
                                      setEditingValues(prev => {
                                        const newState = { ...prev };
                                        delete newState[`${item.id}-unit_price`];
                                        return newState;
                                      });
                                    }
                                  }}
                                  className="pl-6 h-8 text-right text-sm"
                                />
                              </div>
                            </div>
                            
                            <div className="col-span-1 text-right pt-1">
                              <div className="text-sm font-semibold">
                                ${(item.total_price / 100).toFixed(2)}
                              </div>
                            </div>
                            
                            <div className="col-span-1 flex justify-end">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeLineItem(item.id)}
                                className="h-8 w-8 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>

                          {/* Mobile Layout */}
                          <div className="md:hidden space-y-3">
                            <div className="space-y-2">
                              <Label className="text-xs">Title</Label>
                              <Input
                                value={item.title}
                                onChange={(e) => updateLineItem(item.id, { title: e.target.value })}
                                placeholder="Item title"
                                className="text-sm"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label className="text-xs">Description</Label>
                              <Textarea
                                value={item.description}
                                onChange={(e) => updateLineItem(item.id, { description: e.target.value })}
                                placeholder="Full description"
                                className="text-xs resize-none"
                                rows={3}
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-2">
                                <Label className="text-xs">Quantity</Label>
                                <Input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => updateLineItem(item.id, { quantity: parseInt(e.target.value) || 0 })}
                                  min="0"
                                  className="text-sm"
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label className="text-xs">Unit Price</Label>
                                <div className="relative">
                                  <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">$</span>
                                  <Input
                                    type="text"
                                    value={editingValues[`${item.id}-unit_price`] !== undefined 
                                      ? editingValues[`${item.id}-unit_price`] 
                                      : (item.unit_price / 100).toFixed(2)}
                                    onChange={(e) => {
                                      const value = e.target.value.replace(/[^0-9.]/g, '');
                                      setEditingValues(prev => ({ ...prev, [`${item.id}-unit_price`]: value }));
                                    }}
                                    onFocus={() => {
                                      setEditingValues(prev => ({ ...prev, [`${item.id}-unit_price`]: (item.unit_price / 100).toFixed(2) }));
                                    }}
                                    onBlur={() => {
                                      const value = editingValues[`${item.id}-unit_price`];
                                      if (value !== undefined) {
                                        const numValue = parseFloat(value || '0');
                                        if (!isNaN(numValue)) {
                                          updateLineItem(item.id, { unit_price: Math.round(numValue * 100) });
                                        }
                                        setEditingValues(prev => {
                                          const newState = { ...prev };
                                          delete newState[`${item.id}-unit_price`];
                                          return newState;
                                        });
                                      }
                                    }}
                                    className="pl-6 text-right text-sm"
                                  />
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-center pt-2 border-t">
                              <span className="text-xs font-medium">Total</span>
                              <span className="font-bold text-sm">
                                ${(item.total_price / 100).toFixed(2)}
                              </span>
                            </div>
                            
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removeLineItem(item.id)}
                              className="w-full"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove Item
                            </Button>
                          </div>
                        </div>
                      ))}
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Real-time Totals */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm">Subtotal:</span>
            <span className="font-medium">${(subtotal / 100).toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm">Tax Amount (8%):</span>
            <span className="font-medium">${(taxAmount / 100).toFixed(2)}</span>
          </div>
          
          <Separator />
          
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Total Amount:</span>
            <span className="text-primary">${(grandTotal / 100).toFixed(2)}</span>
          </div>

          {guestCount > 0 && (
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>Per Guest:</span>
              <span>${(grandTotal / 100 / guestCount).toFixed(2)}</span>
            </div>
          )}

          {!isGovernmentContract && (
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>Deposit Required (25%):</span>
              <span>${(grandTotal * 0.25 / 100).toFixed(2)}</span>
            </div>
          )}

          {/* Manual Save Button */}
          {isModified && (
            <Button
              onClick={triggerAutoSave}
              className="w-full"
              variant="default"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}