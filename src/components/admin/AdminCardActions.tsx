import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';

interface AdminCardActionsProps {
  quote: any;
  invoices?: any[];
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  onSetPricing?: (quoteId: string) => void;
}

export function AdminCardActions({ 
  quote, 
  invoices = [], 
  variant = 'default',
  size = 'default',
  onSetPricing
}: AdminCardActionsProps) {
  const hasEstimate = invoices.some(inv => inv.quote_request_id === quote.id);
  
  const handleSetPricing = () => {
    if (onSetPricing) {
      onSetPricing(quote.id);
    }
  };

  return (
    <Button 
      variant={variant}
      size={size}
      onClick={handleSetPricing}
      className="w-full"
    >
      <Edit className="h-4 w-4 mr-2" />
      {hasEstimate ? 'Edit Pricing' : 'Set Pricing'}
    </Button>
  );
}