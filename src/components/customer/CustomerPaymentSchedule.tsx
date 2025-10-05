import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TaxCalculationService } from '@/services/TaxCalculationService';
import { 
  DollarSign, 
  Calendar, 
  CheckCircle, 
  Clock,
  CreditCard,
  AlertCircle
} from 'lucide-react';

interface CustomerPaymentScheduleProps {
  invoice: any;
  payments: any[];
  lineItems: any[];
}

export function CustomerPaymentSchedule({ invoice, payments, lineItems }: CustomerPaymentScheduleProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getPaymentSchedule = () => {
    // Calculate total from line items (single source of truth)
    const subtotal = lineItems.reduce((sum, item) => sum + item.total_price, 0);
    const isGovContract = invoice.quote_requests?.compliance_level === 'government' || 
                          invoice.quote_requests?.requires_po_number;
    const taxCalc = TaxCalculationService.calculateTax(subtotal, isGovContract);
    const totalAmount = taxCalc.totalAmount;
    
    const depositAmount = Math.round(totalAmount * 0.5); // 50% deposit
    const finalAmount = totalAmount - depositAmount;
    
    const eventDate = new Date(invoice.quote_requests?.event_date || Date.now());
    const depositDueDate = new Date();
    depositDueDate.setDate(depositDueDate.getDate() + 7); // 7 days from now
    
    const finalDueDate = new Date(eventDate);
    finalDueDate.setDate(finalDueDate.getDate() - 7); // 7 days before event

    const schedule = [
      {
        id: 'deposit',
        title: 'Deposit Payment',
        description: '50% deposit to secure your event date',
        amount: depositAmount,
        dueDate: depositDueDate,
        status: ['deposit_paid', 'confirmed'].includes(invoice.status) ? 'paid' : 
                invoice.status === 'approved' ? 'due' : 'pending',
        paymentMethod: 'Credit Card',
        required: true
      },
      {
        id: 'final',
        title: 'Final Payment',
        description: 'Remaining balance due before event',
        amount: finalAmount,
        dueDate: finalDueDate,
        status: invoice.status === 'confirmed' && payments.some(p => p.amount === finalAmount) ? 'paid' : 
                ['deposit_paid', 'confirmed'].includes(invoice.status) ? 'scheduled' : 'pending',
        paymentMethod: 'Credit Card or Check',
        required: true
      }
    ];

    return schedule;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'due':
        return <AlertCircle className="h-5 w-5 text-orange-600" />;
      case 'scheduled':
        return <Calendar className="h-5 w-5 text-blue-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'due':
        return <Badge className="bg-orange-100 text-orange-800">Due Now</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const paymentSchedule = getPaymentSchedule();
  const nextPaymentDue = paymentSchedule.find(p => p.status === 'due');

  return (
    <div className="space-y-6">
      {/* Payment Due Alert */}
      {nextPaymentDue && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription>
            <div className="font-medium text-orange-800 mb-1">Payment Due</div>
            <div className="text-orange-700">
              Your {nextPaymentDue.title.toLowerCase()} of {formatCurrency(nextPaymentDue.amount)} is due by {formatDate(nextPaymentDue.dueDate.toISOString())}.
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Payment Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Payment Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paymentSchedule.map((payment, index) => (
              <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  {getStatusIcon(payment.status)}
                  <div>
                    <h3 className="font-medium">{payment.title}</h3>
                    <p className="text-sm text-muted-foreground">{payment.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-muted-foreground">
                        Due: {formatDate(payment.dueDate.toISOString())}
                      </span>
                      <span className="text-sm text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">{payment.paymentMethod}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-semibold text-lg">{formatCurrency(payment.amount)}</div>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusBadge(payment.status)}
                  </div>
                  {payment.status === 'due' && (
                    <Button size="sm" className="mt-2">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay Now
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Payment Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            // Calculate total from line items
            const subtotal = lineItems.reduce((sum, item) => sum + item.total_price, 0);
            const isGovContract = invoice.quote_requests?.compliance_level === 'government' || 
                                  invoice.quote_requests?.requires_po_number;
            const taxCalc = TaxCalculationService.calculateTax(subtotal, isGovContract);
            const totalAmount = taxCalc.totalAmount;
            const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
            
            return (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="font-semibold text-lg text-blue-900">
                    {formatCurrency(totalAmount)}
                  </div>
                  <div className="text-sm text-blue-700">Total Amount</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="font-semibold text-lg text-green-900">
                    {formatCurrency(totalPaid)}
                  </div>
                  <div className="text-sm text-green-700">Amount Paid</div>
                </div>
                
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="font-semibold text-lg text-orange-900">
                    {formatCurrency(totalAmount - totalPaid)}
                  </div>
                  <div className="text-sm text-orange-700">Remaining Balance</div>
                </div>
              </div>
            );
          })()}
          
          
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Payment Methods Accepted:</span>
              <div className="flex items-center gap-2">
                <span className="text-sm">Credit Cards, Bank Transfer, Check</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      {payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium">Payment Received</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(payment.transaction_date)} • {payment.payment_method}
                      </div>
                    </div>
                  </div>
                  <div className="font-semibold text-green-700">
                    {formatCurrency(payment.amount)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}