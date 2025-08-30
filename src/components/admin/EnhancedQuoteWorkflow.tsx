import React from 'react';
import { StreamlinedWorkflowManager } from './StreamlinedWorkflowManager';

interface EnhancedQuoteWorkflowProps {
  quote: any;
  invoice?: any;
  onRefresh?: () => void;
}

export function EnhancedQuoteWorkflow({ quote, invoice, onRefresh }: EnhancedQuoteWorkflowProps) {
  return (
    <StreamlinedWorkflowManager 
      quote={quote} 
      invoice={invoice}
      onRefresh={onRefresh}
    />
  );
}