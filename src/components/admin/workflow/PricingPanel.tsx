import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { format } from 'date-fns';
import { EnhancedEstimateLineItems } from '../EnhancedEstimateLineItems';
import { IntegratedChangeRequestPanel } from './IntegratedChangeRequestPanel';
import { EditableEventDetails } from './EditableEventDetails';
import { EstimateVersionComparison } from './EstimateVersionComparison';
import { requiresSeparateContract } from '@/utils/contractRequirements';
import { formatEventName } from '@/utils/textFormatters';
import { 
  FileText, 
  CheckCircle2, 
  Heart,
  Sparkles,
  AlertCircle,
  DollarSign
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
  onQuoteUpdate?: (updates: Partial<Quote>) => void;
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
  quickCalculatePerPerson,
  onQuoteUpdate
}: PricingPanelProps) {
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
    <div className="space-y-4">
      {/* Wedding Template Quick Selector (only for weddings, before invoice) */}
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

      {/* Main Unified Pricing Card */}
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                {formatEventName(quote.event_name)}
              </span>
              <Badge variant="outline">{quote.status}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Editable Event Details - Always Visible */}
            <EditableEventDetails quote={quote} onQuoteUpdate={onQuoteUpdate} />

            {/* Version Comparison - Shows recent changes */}
            {invoice && (
              <EstimateVersionComparison 
                invoiceId={invoice.id}
                showLatestChange={true}
              />
            )}

            {/* Collapsible Change Requests (only if they exist) */}
            {invoice && (
              <IntegratedChangeRequestPanel 
                invoiceId={invoice.id}
                onChangeProcessed={onChangeProcessed}
                defaultCollapsed={true}
                compact={true}
              />
            )}

            {/* Line Items - Main Focus */}
            <div className="pt-4">
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
                requiresContract={localRequiresContract}
                contractReason={contractCheck.reason}
                onContractToggleChange={handleContractToggle}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      {invoice && lineItems.length > 0 && (
        <div className="space-y-3">
          <div className="flex gap-3">
            <Button onClick={onBack} variant="outline" className="flex-1">
              ← Back to Quotes
            </Button>
            <Button 
              onClick={onSendEstimate} 
              className="flex-1 gap-2"
              disabled={lineItems.length === 0 || isModified}
            >
              <CheckCircle2 className="h-4 w-4" />
              Send Estimate to Customer
            </Button>
          </div>

          {isModified && (
            <Alert className="border-amber-500/50 bg-amber-500/10">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-sm text-amber-800 dark:text-amber-200">
                You have unsaved changes. Please save your pricing before sending the estimate.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {!invoice && (
        <div className="flex justify-end">
          <Button onClick={onBack} variant="outline">
            ← Back to Quotes
          </Button>
        </div>
      )}
    </div>
  );
}
