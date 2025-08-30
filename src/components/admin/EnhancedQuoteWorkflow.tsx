import React from 'react';
import { ConsolidatedWorkflowManager } from './ConsolidatedWorkflowManager';

interface EnhancedQuoteWorkflowProps {
  quote: any;
  invoice?: any;
  onRefresh?: () => void;
}

export function EnhancedQuoteWorkflow({ quote, invoice, onRefresh }: EnhancedQuoteWorkflowProps) {
  return (
    <ConsolidatedWorkflowManager 
      quote={quote} 
      invoice={invoice}
      onRefresh={onRefresh}
    />
  );
}