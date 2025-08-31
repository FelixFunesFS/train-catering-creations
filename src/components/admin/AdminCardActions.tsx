import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';

interface AdminCardActionsProps {
  quote: any;
  invoices?: any[];
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

export function AdminCardActions({ 
  quote, 
  invoices = [], 
  variant = 'default',
  size = 'default'
}: AdminCardActionsProps) {
  const navigate = useNavigate();
  
  const hasEstimate = invoices.some(inv => inv.quote_request_id === quote.id);
  
  const handleSetPricing = () => {
    navigate(`/admin/estimates/quote/${quote.id}`);
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