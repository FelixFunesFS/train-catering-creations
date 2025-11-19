import React from 'react';
import { UnifiedWorkflowManager } from './UnifiedWorkflowManager';

interface StreamlinedWorkflowDashboardProps {
  onBack: () => void;
}

export function StreamlinedWorkflowDashboard({ onBack }: StreamlinedWorkflowDashboardProps) {
  // Extract URL parameters for quote selection
  const urlParams = new URLSearchParams(window.location.search);
  const quoteId = urlParams.get('quoteId');
  const mode = urlParams.get('mode') as 'pricing' | 'default' || 'default';

  return (
    <div className="container mx-auto px-4 py-6">
      <UnifiedWorkflowManager 
        selectedQuoteId={quoteId || undefined}
        mode={mode}
      />
    </div>
  );
}