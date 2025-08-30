import React from 'react';
import { WorkflowPhaseManager } from './WorkflowPhaseManager';

interface EnhancedQuoteWorkflowProps {
  quote: any;
  invoice?: any;
  onRefresh?: () => void;
}

export function EnhancedQuoteWorkflow({ quote, invoice, onRefresh }: EnhancedQuoteWorkflowProps) {
  return (
    <WorkflowPhaseManager 
      quote={quote} 
      invoice={invoice}
      onRefresh={onRefresh}
    />
  );
}