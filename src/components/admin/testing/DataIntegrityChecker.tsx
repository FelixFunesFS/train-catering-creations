import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Database, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  FileWarning,
  DollarSign,
  Clock,
  Link2Off
} from 'lucide-react';

interface IntegrityCheck {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'pending' | 'running' | 'passed' | 'warning' | 'failed';
  count?: number;
  details?: string;
  items?: Array<{ id: string; info: string }>;
}

export function DataIntegrityChecker() {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [checks, setChecks] = useState<IntegrityCheck[]>([
    {
      id: 'orphaned_invoices',
      name: 'Orphaned Invoices',
      description: 'Invoices without a linked quote request',
      icon: <Link2Off className="h-5 w-5" />,
      status: 'pending'
    },
    {
      id: 'stuck_workflows',
      name: 'Stuck Workflows',
      description: 'Quotes pending for more than 7 days',
      icon: <Clock className="h-5 w-5" />,
      status: 'pending'
    },
    {
      id: 'payment_mismatches',
      name: 'Payment Mismatches',
      description: 'Invoices where payments don\'t match totals',
      icon: <DollarSign className="h-5 w-5" />,
      status: 'pending'
    },
    {
      id: 'missing_tokens',
      name: 'Missing Access Tokens',
      description: 'Non-draft invoices without customer tokens',
      icon: <FileWarning className="h-5 w-5" />,
      status: 'pending'
    },
    {
      id: 'duplicate_invoices',
      name: 'Duplicate Invoices',
      description: 'Multiple non-draft invoices per quote',
      icon: <AlertTriangle className="h-5 w-5" />,
      status: 'pending'
    },
    {
      id: 'invalid_milestones',
      name: 'Invalid Payment Milestones',
      description: 'Milestones that don\'t sum to 100%',
      icon: <DollarSign className="h-5 w-5" />,
      status: 'pending'
    },
    {
      id: 'zero_totals',
      name: 'Zero Total Invoices',
      description: 'Non-draft invoices with $0 total',
      icon: <AlertTriangle className="h-5 w-5" />,
      status: 'pending'
    },
    {
      id: 'missing_line_items',
      name: 'Missing Line Items',
      description: 'Non-draft invoices without line items',
      icon: <FileWarning className="h-5 w-5" />,
      status: 'pending'
    }
  ]);

  const updateCheck = (id: string, updates: Partial<IntegrityCheck>) => {
    setChecks(prev => prev.map(check => 
      check.id === id ? { ...check, ...updates } : check
    ));
  };

  const runAllChecks = async () => {
    setIsRunning(true);
    
    // Reset all checks
    setChecks(prev => prev.map(c => ({ ...c, status: 'pending', count: undefined, details: undefined, items: undefined })));

    // Run checks in parallel
    await Promise.all([
      checkOrphanedInvoices(),
      checkStuckWorkflows(),
      checkPaymentMismatches(),
      checkMissingTokens(),
      checkDuplicateInvoices(),
      checkInvalidMilestones(),
      checkZeroTotals(),
      checkMissingLineItems()
    ]);

    setIsRunning(false);
    
    const issues = checks.filter(c => c.status === 'warning' || c.status === 'failed');
    toast({
      title: 'Integrity Check Complete',
      description: issues.length > 0 ? `${issues.length} issues found` : 'All checks passed',
      variant: issues.length > 0 ? 'destructive' : 'default'
    });
  };

  const checkOrphanedInvoices = async () => {
    updateCheck('orphaned_invoices', { status: 'running' });
    
    const { data, error } = await supabase
      .from('invoices')
      .select('id, invoice_number, quote_request_id')
      .is('quote_request_id', null);
    
    if (error) {
      updateCheck('orphaned_invoices', { status: 'failed', details: error.message });
      return;
    }
    
    updateCheck('orphaned_invoices', {
      status: data.length > 0 ? 'warning' : 'passed',
      count: data.length,
      details: data.length > 0 ? `${data.length} orphaned invoices` : 'No orphaned invoices',
      items: data.slice(0, 5).map(d => ({ id: d.id, info: d.invoice_number || 'No number' }))
    });
  };

  const checkStuckWorkflows = async () => {
    updateCheck('stuck_workflows', { status: 'running' });
    
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    
    const { data, error } = await supabase
      .from('quote_requests')
      .select('id, contact_name, event_name, created_at')
      .eq('workflow_status', 'pending')
      .lt('created_at', sevenDaysAgo);
    
    if (error) {
      updateCheck('stuck_workflows', { status: 'failed', details: error.message });
      return;
    }
    
    updateCheck('stuck_workflows', {
      status: data.length > 0 ? 'warning' : 'passed',
      count: data.length,
      details: data.length > 0 ? `${data.length} quotes stuck in pending` : 'No stuck workflows',
      items: data.slice(0, 5).map(d => ({ id: d.id, info: `${d.contact_name}: ${d.event_name}` }))
    });
  };

  const checkPaymentMismatches = async () => {
    updateCheck('payment_mismatches', { status: 'running' });
    
    // Get invoices marked as paid
    const { data: paidInvoices, error: invoiceError } = await supabase
      .from('invoices')
      .select('id, invoice_number, total_amount')
      .eq('workflow_status', 'paid');
    
    if (invoiceError) {
      updateCheck('payment_mismatches', { status: 'failed', details: invoiceError.message });
      return;
    }

    const mismatches: Array<{ id: string; info: string }> = [];
    
    for (const invoice of paidInvoices || []) {
      const { data: payments } = await supabase
        .from('payment_transactions')
        .select('amount')
        .eq('invoice_id', invoice.id)
        .eq('status', 'completed');
      
      const totalPaid = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
      
      // Allow small variance for rounding
      if (Math.abs(totalPaid - invoice.total_amount) > 1) {
        mismatches.push({
          id: invoice.id,
          info: `${invoice.invoice_number}: Paid $${totalPaid}, Expected $${invoice.total_amount}`
        });
      }
    }
    
    updateCheck('payment_mismatches', {
      status: mismatches.length > 0 ? 'failed' : 'passed',
      count: mismatches.length,
      details: mismatches.length > 0 ? `${mismatches.length} payment mismatches` : 'All payments match',
      items: mismatches.slice(0, 5)
    });
  };

  const checkMissingTokens = async () => {
    updateCheck('missing_tokens', { status: 'running' });
    
    const { data, error } = await supabase
      .from('invoices')
      .select('id, invoice_number')
      .is('customer_access_token', null)
      .eq('is_draft', false);
    
    if (error) {
      updateCheck('missing_tokens', { status: 'failed', details: error.message });
      return;
    }
    
    updateCheck('missing_tokens', {
      status: data.length > 0 ? 'warning' : 'passed',
      count: data.length,
      details: data.length > 0 ? `${data.length} invoices missing tokens` : 'All invoices have tokens',
      items: data.slice(0, 5).map(d => ({ id: d.id, info: d.invoice_number || 'No number' }))
    });
  };

  const checkDuplicateInvoices = async () => {
    updateCheck('duplicate_invoices', { status: 'running' });
    
    const { data, error } = await supabase
      .from('invoices')
      .select('quote_request_id')
      .eq('is_draft', false)
      .not('quote_request_id', 'is', null);
    
    if (error) {
      updateCheck('duplicate_invoices', { status: 'failed', details: error.message });
      return;
    }

    // Count duplicates
    const quoteCounts: Record<string, number> = {};
    data.forEach(d => {
      if (d.quote_request_id) {
        quoteCounts[d.quote_request_id] = (quoteCounts[d.quote_request_id] || 0) + 1;
      }
    });
    
    const duplicates = Object.entries(quoteCounts).filter(([_, count]) => count > 1);
    
    updateCheck('duplicate_invoices', {
      status: duplicates.length > 0 ? 'failed' : 'passed',
      count: duplicates.length,
      details: duplicates.length > 0 ? `${duplicates.length} quotes with duplicate invoices` : 'No duplicate invoices',
      items: duplicates.slice(0, 5).map(([id, count]) => ({ id, info: `${count} invoices` }))
    });
  };

  const checkInvalidMilestones = async () => {
    updateCheck('invalid_milestones', { status: 'running' });
    
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('id, invoice_number')
      .eq('is_draft', false);
    
    if (error) {
      updateCheck('invalid_milestones', { status: 'failed', details: error.message });
      return;
    }

    const invalid: Array<{ id: string; info: string }> = [];
    
    for (const invoice of invoices || []) {
      const { data: milestones } = await supabase
        .from('payment_milestones')
        .select('percentage')
        .eq('invoice_id', invoice.id);
      
      if (milestones && milestones.length > 0) {
        const totalPercentage = milestones.reduce((sum, m) => sum + (m.percentage || 0), 0);
        if (Math.abs(totalPercentage - 100) > 0.01) {
          invalid.push({
            id: invoice.id,
            info: `${invoice.invoice_number}: ${totalPercentage}% (should be 100%)`
          });
        }
      }
    }
    
    updateCheck('invalid_milestones', {
      status: invalid.length > 0 ? 'warning' : 'passed',
      count: invalid.length,
      details: invalid.length > 0 ? `${invalid.length} invoices with invalid milestones` : 'All milestones valid',
      items: invalid.slice(0, 5)
    });
  };

  const checkZeroTotals = async () => {
    updateCheck('zero_totals', { status: 'running' });
    
    const { data, error } = await supabase
      .from('invoices')
      .select('id, invoice_number, workflow_status')
      .eq('is_draft', false)
      .or('total_amount.eq.0,total_amount.is.null')
      .not('workflow_status', 'in', '(draft,cancelled)');
    
    if (error) {
      updateCheck('zero_totals', { status: 'failed', details: error.message });
      return;
    }
    
    updateCheck('zero_totals', {
      status: data.length > 0 ? 'warning' : 'passed',
      count: data.length,
      details: data.length > 0 ? `${data.length} invoices with $0 total` : 'No zero-total invoices',
      items: data.slice(0, 5).map(d => ({ id: d.id, info: `${d.invoice_number} (${d.workflow_status})` }))
    });
  };

  const checkMissingLineItems = async () => {
    updateCheck('missing_line_items', { status: 'running' });
    
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('id, invoice_number')
      .eq('is_draft', false)
      .not('workflow_status', 'in', '(draft,cancelled)');
    
    if (error) {
      updateCheck('missing_line_items', { status: 'failed', details: error.message });
      return;
    }

    const missing: Array<{ id: string; info: string }> = [];
    
    for (const invoice of invoices || []) {
      const { count } = await supabase
        .from('invoice_line_items')
        .select('*', { count: 'exact', head: true })
        .eq('invoice_id', invoice.id);
      
      if (count === 0) {
        missing.push({
          id: invoice.id,
          info: invoice.invoice_number || 'No number'
        });
      }
    }
    
    updateCheck('missing_line_items', {
      status: missing.length > 0 ? 'warning' : 'passed',
      count: missing.length,
      details: missing.length > 0 ? `${missing.length} invoices without line items` : 'All invoices have line items',
      items: missing.slice(0, 5)
    });
  };

  const getStatusIcon = (status: IntegrityCheck['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-destructive" />;
      case 'running':
        return <RefreshCw className="h-5 w-5 text-primary animate-spin" />;
      default:
        return <Database className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const passedCount = checks.filter(c => c.status === 'passed').length;
  const warningCount = checks.filter(c => c.status === 'warning').length;
  const failedCount = checks.filter(c => c.status === 'failed').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Data Integrity Checker</h2>
          <p className="text-muted-foreground">Validate database consistency and identify issues</p>
        </div>
        <Button onClick={runAllChecks} disabled={isRunning}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
          Run All Checks
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{passedCount}</div>
              <div className="text-sm text-muted-foreground">Passed</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{warningCount}</div>
              <div className="text-sm text-muted-foreground">Warnings</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-destructive">{failedCount}</div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Check Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Integrity Checks
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {checks.map(check => (
            <div key={check.id} className="border rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{getStatusIcon(check.status)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{check.name}</div>
                    <Badge variant={
                      check.status === 'passed' ? 'default' :
                      check.status === 'warning' ? 'secondary' :
                      check.status === 'failed' ? 'destructive' : 'outline'
                    }>
                      {check.count !== undefined ? check.count : check.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{check.description}</p>
                  {check.details && (
                    <p className="text-sm mt-1 font-medium">{check.details}</p>
                  )}
                  {check.items && check.items.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {check.items.map((item, idx) => (
                        <div key={idx} className="text-xs bg-muted px-2 py-1 rounded">
                          <code className="text-muted-foreground">{item.id.slice(0, 8)}...</code>
                          <span className="ml-2">{item.info}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
