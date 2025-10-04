import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';
import { FileText, Shield, CheckCircle2 } from 'lucide-react';
import { requiresSeparateContract } from '@/utils/contractRequirements';

interface Quote {
  id: string;
  event_name: string;
  event_type: string;
  event_date: string;
  start_time: string;
  guest_count: number;
  location: string;
  contact_name: string;
  email: string;
  phone: string;
  service_type: string;
  wait_staff_requested?: boolean;
  primary_protein?: string;
  secondary_protein?: string;
  sides?: string[];
  special_requests?: string;
  compliance_level?: string;
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

interface ReviewPanelProps {
  quote: Quote;
  lineItems: LineItem[];
  totals: { subtotal: number; tax_amount: number; total_amount: number };
  isGovernmentContract: boolean;
  requiresContract?: boolean;
  onRequiresContractChange?: (requires: boolean) => void;
  onBack: () => void;
  onSendEstimate: () => void;
}

export function ReviewPanel({
  quote,
  lineItems,
  totals,
  isGovernmentContract,
  requiresContract: requiresContractProp,
  onRequiresContractChange,
  onBack,
  onSendEstimate
}: ReviewPanelProps) {
  const contractCheck = requiresSeparateContract(quote, totals.total_amount);
  const [localRequiresContract, setLocalRequiresContract] = useState(
    requiresContractProp !== undefined ? requiresContractProp : contractCheck.requiresSeparateContract
  );

  const handleContractToggle = (checked: boolean) => {
    setLocalRequiresContract(checked);
    onRequiresContractChange?.(checked);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Final Review</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Review all details before sending to customer
            </p>
          </div>
          {localRequiresContract ? (
            <Badge variant="outline" className="gap-1">
              <Shield className="h-3 w-3" />
              Contract Required
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1">
              <FileText className="h-3 w-3" />
              T&C in Estimate
            </Badge>
          )}
        </div>
      </CardHeader>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Event Details */}
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-3">Event Details</h4>
              <div className="text-sm space-y-2">
                <div className="flex items-start gap-2">
                  <span className="font-medium min-w-[100px]">Event:</span>
                  <span className="text-muted-foreground">{quote.event_name}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium min-w-[100px]">Type:</span>
                  <span className="text-muted-foreground capitalize">
                    {quote.event_type?.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium min-w-[100px]">Date:</span>
                  <span className="text-muted-foreground">
                    {format(new Date(quote.event_date), 'PPP')}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium min-w-[100px]">Time:</span>
                  <span className="text-muted-foreground">{quote.start_time}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium min-w-[100px]">Guests:</span>
                  <span className="text-muted-foreground">{quote.guest_count}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium min-w-[100px]">Location:</span>
                  <span className="text-muted-foreground">{quote.location}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Contact Details */}
            <div>
              <h4 className="font-semibold mb-3">Contact Information</h4>
              <div className="text-sm space-y-2">
                <div className="flex items-start gap-2">
                  <span className="font-medium min-w-[100px]">Name:</span>
                  <span className="text-muted-foreground">{quote.contact_name}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium min-w-[100px]">Email:</span>
                  <span className="text-muted-foreground">{quote.email}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium min-w-[100px]">Phone:</span>
                  <span className="text-muted-foreground">{quote.phone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Service & Menu Details */}
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-3">Service Details</h4>
              <div className="text-sm space-y-2">
                <div className="flex items-start gap-2">
                  <span className="font-medium min-w-[120px]">Service Type:</span>
                  <span className="text-muted-foreground capitalize">
                    {quote.service_type?.replace('_', ' ')}
                  </span>
                </div>
                {quote.wait_staff_requested && (
                  <div className="flex items-start gap-2">
                    <span className="font-medium min-w-[120px]">Wait Staff:</span>
                    <Badge variant="secondary">Requested</Badge>
                  </div>
                )}
                {isGovernmentContract && (
                  <div className="flex items-start gap-2">
                    <span className="font-medium min-w-[120px]">Contract Type:</span>
                    <Badge variant="outline">Government Contract</Badge>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Menu Selections */}
            {(quote.primary_protein || quote.secondary_protein) && (
              <div>
                <h4 className="font-semibold mb-3">Menu</h4>
                <div className="text-sm space-y-2">
                  {quote.primary_protein && (
                    <div className="flex items-start gap-2">
                      <span className="font-medium min-w-[120px]">Primary Protein:</span>
                      <span className="text-muted-foreground">{quote.primary_protein}</span>
                    </div>
                  )}
                  {quote.secondary_protein && (
                    <div className="flex items-start gap-2">
                      <span className="font-medium min-w-[120px]">Secondary:</span>
                      <span className="text-muted-foreground">{quote.secondary_protein}</span>
                    </div>
                  )}
                  {quote.sides && Array.isArray(quote.sides) && quote.sides.length > 0 && (
                    <div className="flex items-start gap-2">
                      <span className="font-medium min-w-[120px]">Sides:</span>
                      <span className="text-muted-foreground">{quote.sides.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {quote.special_requests && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-3">Special Requests</h4>
                  <p className="text-sm text-muted-foreground">{quote.special_requests}</p>
                </div>
              </>
            )}
          </div>
        </div>

        <Separator className="my-6" />

        {/* Pricing Summary */}
        <div>
          <h4 className="font-semibold mb-3">Pricing Summary</h4>
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
        
        <div className="flex gap-3">
          <Button onClick={onBack} variant="outline">
            Back to Pricing
          </Button>
          <Button onClick={onSendEstimate} className="gap-2">
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
    </Card>
  );
}
