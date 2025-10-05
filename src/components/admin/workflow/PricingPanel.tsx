import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { EnhancedEstimateLineItems } from '../EnhancedEstimateLineItems';
import { IntegratedChangeRequestPanel } from './IntegratedChangeRequestPanel';
import { requiresSeparateContract } from '@/utils/contractRequirements';
import { formatEventName, formatLocation, formatCustomerName, formatEventType } from '@/utils/textFormatters';
import { formatPhoneNumber } from '@/utils/phoneFormatter';
import { 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  Shield, 
  CheckCircle2, 
  Heart,
  Users,
  Sparkles
} from 'lucide-react';

interface Quote {
  id: string;
  event_name: string;
  contact_name: string;
  event_date: string;
  guest_count: number;
  location: string;
  status?: string;
  event_type: string;
  email: string;
  phone: string;
  start_time: string;
  service_type?: string;
  wait_staff_requested?: boolean;
  primary_protein?: string;
  secondary_protein?: string;
  sides?: string[];
  special_requests?: string;
  compliance_level?: string;
}

interface Invoice {
  id: string;
  quote_request_id: string;
  status: string;
}

interface LineItem {
  id?: string;
  title: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  category: string;
}

interface PricingPanelProps {
  quote: Quote;
  invoice: Invoice | null;
  lineItems: LineItem[];
  totals: { subtotal: number; tax_amount: number; total_amount: number };
  isModified: boolean;
  isGovernmentContract: boolean;
  loading: boolean;
  requiresContract?: boolean;
  onRequiresContractChange?: (requires: boolean) => void;
  onGenerateInvoice: () => void;
  onSavePricing: () => void;
  onSendEstimate: () => void;
  onBack: () => void;
  onGovernmentToggle: () => void;
  onChangeProcessed: () => void;
  updateLineItem: (id: string, updates: Partial<LineItem>) => void;
  addLineItem: () => void;
  removeLineItem: (id: string) => void;
  addTemplateItem: (template: any) => void;
  triggerAutoSave: () => void;
  quickCalculatePerPerson: (guestCount: number) => void;
}

const weddingTemplates = [
  {
    id: 'classic-wedding',
    name: 'Classic Wedding',
    icon: Heart,
    basePrice: 45,
    items: [
      { title: 'Appetizer Display', description: 'Assorted appetizers', category: 'appetizers', quantity: 1 },
      { title: 'Main Course Buffet', description: 'Choice of proteins', category: 'package', quantity: 1 },
      { title: 'Side Dishes', description: 'Two side selections', category: 'package', quantity: 1 },
      { title: 'Wedding Cake Service', description: 'Cutting and serving', category: 'desserts', quantity: 1 },
    ]
  },
  {
    id: 'elegant-wedding',
    name: 'Elegant Wedding',
    icon: Sparkles,
    basePrice: 65,
    items: [
      { title: 'Premium Appetizers', description: 'Gourmet selection', category: 'appetizers', quantity: 1 },
      { title: 'Plated Dinner Service', description: 'Chef choice proteins', category: 'package', quantity: 1 },
      { title: 'Premium Sides', description: 'Three selections', category: 'package', quantity: 1 },
      { title: 'Dessert Bar', description: 'Assorted desserts', category: 'desserts', quantity: 1 },
      { title: 'Wait Staff Service', description: 'Full service', category: 'service', quantity: 1 },
    ]
  },
];

export function PricingPanel({
  quote,
  invoice,
  lineItems,
  totals,
  isModified,
  isGovernmentContract,
  loading,
  requiresContract: requiresContractProp,
  onRequiresContractChange,
  onGenerateInvoice,
  onSavePricing,
  onSendEstimate,
  onBack,
  onGovernmentToggle,
  onChangeProcessed,
  updateLineItem,
  addLineItem,
  removeLineItem,
  addTemplateItem,
  triggerAutoSave,
  quickCalculatePerPerson
}: PricingPanelProps) {
  const [reviewExpanded, setReviewExpanded] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  
  const contractCheck = requiresSeparateContract(quote, totals.total_amount);
  const [localRequiresContract, setLocalRequiresContract] = useState(
    requiresContractProp !== undefined ? requiresContractProp : contractCheck.requiresSeparateContract
  );

  const handleContractToggle = (checked: boolean) => {
    setLocalRequiresContract(checked);
    onRequiresContractChange?.(checked);
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = weddingTemplates.find(t => t.id === templateId);
    if (!template) return;

    const pricePerGuest = template.basePrice * 100; // Convert to cents
    const templateItems = template.items.map(item => ({
      title: item.title,
      description: item.description,
      category: item.category,
      quantity: quote.guest_count,
      unit_price: Math.round(pricePerGuest / template.items.length),
      total_price: Math.round((pricePerGuest / template.items.length) * quote.guest_count)
    }));

    templateItems.forEach(item => addTemplateItem(item));
    setSelectedTemplate(templateId);
  };

  const isWeddingEvent = quote.event_type === 'wedding' || quote.event_type === 'second_wedding';

  return (
    <div className="space-y-6">
      {/* Change Requests Panel */}
      {invoice && (
        <IntegratedChangeRequestPanel 
          invoiceId={invoice.id}
          onChangeProcessed={onChangeProcessed}
        />
      )}

      {/* Quote Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Pricing for {formatEventName(quote.event_name)}</span>
            <Badge variant="outline">{quote.status}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="font-medium">Contact</div>
              <div className="text-muted-foreground">{formatCustomerName(quote.contact_name)}</div>
            </div>
            <div>
              <div className="font-medium">Event Date</div>
              <div className="text-muted-foreground">
                {format(new Date(quote.event_date), 'PPP')}
              </div>
            </div>
            <div>
              <div className="font-medium">Guest Count</div>
              <div className="text-muted-foreground">{quote.guest_count} guests</div>
            </div>
            <div>
              <div className="font-medium">Location</div>
              <div className="text-muted-foreground">{formatLocation(quote.location)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wedding Template Quick Selector (only for weddings) */}
      {isWeddingEvent && !selectedTemplate && lineItems.length === 0 && invoice && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Quick Start: Wedding Templates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Save time by starting with a wedding template, then customize as needed.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {weddingTemplates.map(template => {
                const Icon = template.icon;
                return (
                  <Button
                    key={template.id}
                    variant="outline"
                    className="h-auto p-4 justify-start"
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    <div className="flex items-start gap-3 text-left">
                      <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-semibold">{template.name}</div>
                        <div className="text-xs text-muted-foreground">
                          ${template.basePrice}/guest • {template.items.length} items
                        </div>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
            <p className="text-xs text-center text-muted-foreground">
              Or skip templates and build from scratch below
            </p>
          </CardContent>
        </Card>
      )}

      {/* Pricing Management */}
      {!invoice ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-muted-foreground">No invoice exists for this quote.</div>
              <Button onClick={onGenerateInvoice} disabled={loading}>
                Generate Invoice
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <EnhancedEstimateLineItems
          lineItems={lineItems.map(item => ({ ...item, id: item.id || '' }))}
          updateLineItem={updateLineItem}
          addLineItem={addLineItem}
          removeLineItem={removeLineItem}
          addTemplateItem={addTemplateItem}
          subtotal={totals.subtotal}
          taxAmount={totals.tax_amount}
          grandTotal={totals.total_amount}
          guestCount={quote.guest_count}
          isModified={isModified}
          triggerAutoSave={triggerAutoSave}
          quickCalculatePerPerson={() => quickCalculatePerPerson(quote.guest_count)}
          isGovernmentContract={isGovernmentContract}
          onGovernmentToggle={onGovernmentToggle}
        />
      )}

      {/* Expandable Review Section */}
      {invoice && lineItems.length > 0 && (
        <Collapsible open={reviewExpanded} onOpenChange={setReviewExpanded}>
          <Card>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Final Review & Send
                    {localRequiresContract ? (
                      <Badge variant="outline" className="gap-1 ml-2">
                        <Shield className="h-3 w-3" />
                        Contract Required
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1 ml-2">
                        <FileText className="h-3 w-3" />
                        T&C in Estimate
                      </Badge>
                    )}
                  </CardTitle>
                  {reviewExpanded ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <CardContent className="space-y-6">
                {/* Contract Requirement Toggle */}
                <Alert>
                  <AlertDescription className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">Contract Requirement</h4>
                        <p className="text-sm text-muted-foreground">{contractCheck.reason}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          id="requires-contract"
                          checked={localRequiresContract}
                          onCheckedChange={handleContractToggle}
                        />
                        <Label htmlFor="requires-contract" className="text-sm whitespace-nowrap">
                          {localRequiresContract ? 'Contract' : 'T&C Only'}
                        </Label>
                      </div>
                    </div>
                    {!localRequiresContract && (
                      <p className="text-xs text-muted-foreground border-t pt-2 mt-2">
                        Customer will accept Terms & Conditions when approving the estimate (no separate contract needed)
                      </p>
                    )}
                  </AlertDescription>
                </Alert>

                <Separator />

                {/* Event & Contact Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-3">Event Details</h4>
                      <div className="text-sm space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Event:</span>
                          <span className="font-medium">{formatEventName(quote.event_name)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Type:</span>
                          <span className="font-medium">{formatEventType(quote.event_type)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Date:</span>
                          <span className="font-medium">{format(new Date(quote.event_date), 'PPP')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Guests:</span>
                          <span className="font-medium">{quote.guest_count}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-3">Contact Information</h4>
                      <div className="text-sm space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Name:</span>
                          <span className="font-medium">{formatCustomerName(quote.contact_name)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Email:</span>
                          <span className="font-medium text-xs">{quote.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Phone:</span>
                          <span className="font-medium">{formatPhoneNumber(quote.phone)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Pricing Summary */}
                <div>
                  <h4 className="font-semibold mb-3">Final Pricing</h4>
                  <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Line Items ({lineItems.length})</span>
                      <span className="font-medium">${(totals.subtotal / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax (9.5%)</span>
                      <span className="font-medium">${(totals.tax_amount / 100).toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>${(totals.total_amount / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Per Guest</span>
                      <span>${(totals.total_amount / quote.guest_count / 100).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Send Estimate Button */}
                <div className="flex gap-3">
                  <Button onClick={() => setReviewExpanded(false)} variant="outline">
                    Edit Pricing
                  </Button>
                  <Button onClick={onSendEstimate} className="flex-1 gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Send Estimate to Customer
                  </Button>
                </div>

                {!localRequiresContract && (
                  <p className="text-xs text-muted-foreground text-center">
                    Estimate will include Terms & Conditions. Customer can approve and pay without signing a separate contract.
                  </p>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Action Buttons */}
      {invoice && !reviewExpanded && (
        <div className="flex gap-3">
          <Button onClick={onBack} variant="outline">
            Back to Quotes
          </Button>
          <Button 
            onClick={() => setReviewExpanded(true)} 
            disabled={!lineItems.length || totals.total_amount === 0}
            className="flex-1"
          >
            Review & Send Estimate
          </Button>
        </div>
      )}
    </div>
  );
}
