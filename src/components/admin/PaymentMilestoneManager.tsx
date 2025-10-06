import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Clock, 
  CreditCard, 
  CheckCircle, 
  AlertCircle, 
  DollarSign,
  Calendar,
  FileText,
  Download
} from 'lucide-react';
import { buildPaymentSchedule, determineCustomerType, generateInvoiceSchedule } from '@/utils/paymentScheduling';
import { PaymentScheduleDisplay } from './PaymentScheduleDisplay';
import { formatCurrency } from '@/lib/utils';

interface PaymentMilestone {
  id: string;
  invoice_id: string;
  milestone_type: string;
  percentage: number;
  amount_cents: number;
  due_date: string | null;
  is_due_now: boolean;
  is_net30: boolean;
  description: string;
  status: string;
}

interface Invoice {
  id: string;
  quote_request_id: string;
  total_amount: number;
  workflow_status: string;
  document_type: string;
  customer_access_token: string;
}

interface PaymentMilestoneManagerProps {
  invoiceId: string;
  quoteRequest: any;
  onContractGenerated?: () => void;
  onPaymentProcessed?: () => void;
}

export function PaymentMilestoneManager({ 
  invoiceId, 
  quoteRequest, 
  onContractGenerated,
  onPaymentProcessed 
}: PaymentMilestoneManagerProps) {
  const [milestones, setMilestones] = useState<PaymentMilestone[]>([]);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadPaymentData();
  }, [invoiceId]);

  const loadPaymentData = async () => {
    try {
      setLoading(true);

      // Load invoice data
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .single();

      if (invoiceError) throw invoiceError;
      setInvoice(invoiceData);

      // Load existing milestones
      const { data: milestonesData, error: milestonesError } = await supabase
        .from('payment_milestones')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('due_date', { ascending: true });

      if (milestonesError) throw milestonesError;
      
      // If no milestones exist and invoice is approved, generate them
      if ((!milestonesData || milestonesData.length === 0) && invoiceData.workflow_status === 'approved') {
        await generatePaymentSchedule(invoiceData);
      } else {
        setMilestones(milestonesData || []);
      }
    } catch (error) {
      console.error('Error loading payment data:', error);
      toast({
        title: "Error",
        description: "Failed to load payment information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generatePaymentSchedule = async (invoiceData: Invoice) => {
    try {
      // Determine customer type
      const customerType = determineCustomerType(quoteRequest.email, quoteRequest.compliance_level === 'government');
      
      // Build payment schedule
      const schedule = buildPaymentSchedule(
        new Date(quoteRequest.event_date),
        customerType,
        new Date(), // Current date as approval date
        invoiceData.total_amount
      );

      // Convert to milestones and save to database
      const milestonesToCreate = schedule.rules.map(rule => ({
        invoice_id: invoiceId,
        milestone_type: rule.type.toLowerCase(),
        percentage: rule.percentage,
        amount_cents: Math.round((invoiceData.total_amount * rule.percentage) / 100),
        due_date: rule.due_date === 'NOW' ? null : 
                  rule.due_date === 'NET_30_AFTER_EVENT' ? null :
                  (rule.due_date as Date).toISOString().split('T')[0],
        is_due_now: rule.due_date === 'NOW',
        is_net30: rule.due_date === 'NET_30_AFTER_EVENT',
        description: rule.description,
        status: rule.due_date === 'NOW' ? 'pending' : 'draft'
      }));

      const { data: newMilestones, error } = await supabase
        .from('payment_milestones')
        .insert(milestonesToCreate)
        .select('*');

      if (error) throw error;

      setMilestones(newMilestones);
      
      toast({
        title: "Success",
        description: "Payment schedule generated successfully",
      });
    } catch (error) {
      console.error('Error generating payment schedule:', error);
      toast({
        title: "Error",
        description: "Failed to generate payment schedule",
        variant: "destructive"
      });
    }
  };

  const createPaymentLink = async (milestoneId: string) => {
    try {
      setActionLoading(`payment-${milestoneId}`);
      
      const milestone = milestones.find(m => m.id === milestoneId);
      if (!milestone) throw new Error('Milestone not found');

      const { data, error } = await supabase.functions.invoke('create-payment-link', {
        body: {
          milestone_id: milestoneId,
          amount: milestone.amount_cents,
          currency: 'usd',
          customer_email: quoteRequest.email,
          description: `${milestone.description} - ${quoteRequest.event_name}`,
          metadata: {
            invoice_id: invoiceId,
            milestone_id: milestoneId,
            quote_request_id: quoteRequest.id
          }
        }
      });

      if (error) throw error;

      // Update milestone status to 'sent'
      const { error: updateError } = await supabase
        .from('payment_milestones')
        .update({ status: 'sent' })
        .eq('id', milestoneId);

      if (updateError) throw updateError;

      toast({
        title: "Payment Link Created",
        description: "Payment link has been sent to customer",
      });

      // Refresh data
      await loadPaymentData();
    } catch (error) {
      console.error('Error creating payment link:', error);
      toast({
        title: "Error",
        description: "Failed to create payment link",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const generateContract = async () => {
    try {
      setActionLoading('contract');

      const { data, error } = await supabase.functions.invoke('generate-contract', {
        body: {
          invoice_id: invoiceId,
          quote_request_id: quoteRequest.id,
          customer_data: {
            name: quoteRequest.contact_name,
            email: quoteRequest.email,
            phone: quoteRequest.phone,
            event_name: quoteRequest.event_name,
            event_date: quoteRequest.event_date,
            location: quoteRequest.location,
            guest_count: quoteRequest.guest_count
          },
          payment_schedule: milestones
        }
      });

      if (error) throw error;

      toast({
        title: "Contract Generated",
        description: "Service contract has been generated and is ready for signature",
      });

      onContractGenerated?.();
    } catch (error) {
      console.error('Error generating contract:', error);
      toast({
        title: "Error",
        description: "Failed to generate contract",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const downloadPaymentSchedule = () => {
    const csvContent = [
      ['Milestone Type', 'Description', 'Percentage', 'Amount', 'Due Date', 'Status'],
      ...milestones.map(m => [
        m.milestone_type,
        m.description,
        `${m.percentage}%`,
        formatCurrency(m.amount_cents / 100),
        m.due_date || (m.is_net30 ? 'Net 30 after event' : 'Due now'),
        m.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment-schedule-${quoteRequest.event_name}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 animate-spin" />
            <span>Loading payment information...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const customerType = determineCustomerType(quoteRequest.email, quoteRequest.compliance_level === 'government');
  const pendingMilestones = milestones.filter(m => m.status === 'pending' || m.is_due_now);
  const totalPaid = milestones.filter(m => m.status === 'paid').reduce((sum, m) => sum + m.amount_cents, 0);
  const totalRemaining = (invoice?.total_amount || 0) - totalPaid;

  return (
    <div className="space-y-6">
      {/* Payment Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Payment Overview
            <Badge variant="outline">{customerType === 'GOV' ? 'Government' : 'Standard'}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {formatCurrency((invoice?.total_amount || 0) / 100)}
              </div>
              <div className="text-sm text-muted-foreground">Total Contract Value</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totalPaid / 100)}
              </div>
              <div className="text-sm text-muted-foreground">Amount Paid</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(totalRemaining / 100)}
              </div>
              <div className="text-sm text-muted-foreground">Remaining Balance</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Schedule */}
      <PaymentScheduleDisplay
        milestones={milestones}
        customerType={customerType}
        totalAmount={invoice?.total_amount || 0}
        eventDate={quoteRequest.event_date}
      />

      {/* Actions */}
      {milestones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Pending Payments */}
              {pendingMilestones.length > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {pendingMilestones.length} payment(s) ready to be processed
                  </AlertDescription>
                </Alert>
              )}

              {/* Payment Buttons */}
              <div className="flex flex-wrap gap-2">
                {pendingMilestones.map(milestone => (
                  <Button
                    key={milestone.id}
                    onClick={() => createPaymentLink(milestone.id)}
                    disabled={actionLoading === `payment-${milestone.id}`}
                    className="gap-2"
                  >
                    <CreditCard className="h-4 w-4" />
                    {actionLoading === `payment-${milestone.id}` 
                      ? 'Creating...' 
                      : `Collect ${milestone.description}`
                    }
                  </Button>
                ))}

                {/* Contract Generation */}
                {totalPaid > 0 && (
                  <Button
                    variant="outline"
                    onClick={generateContract}
                    disabled={actionLoading === 'contract'}
                    className="gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    {actionLoading === 'contract' ? 'Generating...' : 'Generate Contract'}
                  </Button>
                )}

                {/* Download Schedule */}
                <Button
                  variant="outline"
                  onClick={downloadPaymentSchedule}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Schedule
                </Button>
              </div>

              {/* Government Notice */}
              {customerType === 'GOV' && (
                <Alert>
                  <Calendar className="h-4 w-4" />
                  <AlertDescription>
                    Government contract: Payment will be processed Net 30 after event completion.
                    Invoice will be automatically generated after the event.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}