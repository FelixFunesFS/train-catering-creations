import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  ArrowLeft,
  Save,
  Send,
  Plus,
  Trash2,
  Eye,
  DollarSign,
  Calendar,
  User,
  Mail,
  Phone,
  MapPin,
  Edit3,
  CheckCircle2,
  Clock,
  AlertCircle,
  CreditCard,
  ExternalLink,
  FileText,
  Download
} from 'lucide-react';

interface LineItem {
  id: string;
  title: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  category?: string;
}

interface InvoiceData {
  id: string;
  invoice_number: string;
  status: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  due_date: string;
  notes?: string;
  stripe_payment_link?: string;
  line_items: LineItem[];
  customer?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
  };
  quote_request?: {
    event_name: string;
    event_date: string;
    location: string;
    guest_count: number;
  };
}

export default function InvoiceManagement() {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');

  useEffect(() => {
    if (invoiceId) {
      fetchInvoiceData();
    }
  }, [invoiceId]);

  const fetchInvoiceData = async () => {
    try {
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select(`
          *,
          customers (
            id,
            name,
            email,
            phone,
            address
          ),
          quote_requests (
            event_name,
            event_date,
            location,
            guest_count
          )
        `)
        .eq('id', invoiceId)
        .single();

      if (invoiceError) throw invoiceError;

      const { data: lineItems, error: lineItemsError } = await supabase
        .from('invoice_line_items')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('created_at');

      if (lineItemsError) throw lineItemsError;

      setInvoice({
        ...invoiceData,
        line_items: lineItems || []
      });
    } catch (error) {
      console.error('Error fetching invoice:', error);
      toast({
        title: "Error",
        description: "Failed to load invoice data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveInvoice = async () => {
    if (!invoice) return;
    
    setIsSaving(true);
    try {
      // Update invoice
      const { error: invoiceError } = await supabase
        .from('invoices')
        .update({
          subtotal: invoice.subtotal,
          tax_amount: invoice.tax_amount,
          total_amount: invoice.total_amount,
          due_date: invoice.due_date,
          notes: invoice.notes,
        })
        .eq('id', invoice.id);

      if (invoiceError) throw invoiceError;

      // Update line items
      for (const item of invoice.line_items) {
        if (item.id.startsWith('temp_')) {
          // Create new item
          const { error } = await supabase
            .from('invoice_line_items')
            .insert({
              invoice_id: invoice.id,
              title: item.title,
              description: item.description,
              quantity: item.quantity,
              unit_price: item.unit_price,
              total_price: item.total_price,
              category: item.category,
            });
          if (error) throw error;
        } else {
          // Update existing item
          const { error } = await supabase
            .from('invoice_line_items')
            .update({
              title: item.title,
              description: item.description,
              quantity: item.quantity,
              unit_price: item.unit_price,
              total_price: item.total_price,
              category: item.category,
            })
            .eq('id', item.id);
          if (error) throw error;
        }
      }

      toast({
        title: "Success",
        description: "Invoice saved successfully",
      });

      await fetchInvoiceData();
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast({
        title: "Error",
        description: "Failed to save invoice",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreatePaymentLink = async () => {
    if (!invoice) return;

    try {
      const { data, error } = await supabase.functions.invoke('create-payment-link', {
        body: { invoice_id: invoice.id }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payment link created successfully",
      });

      await fetchInvoiceData();
    } catch (error) {
      console.error('Error creating payment link:', error);
      toast({
        title: "Error",
        description: "Failed to create payment link",
        variant: "destructive",
      });
    }
  };

  const handleSendInvoice = async () => {
    if (!invoice) return;

    try {
      const { data, error } = await supabase.functions.invoke('send-invoice-email', {
        body: { invoice_id: invoice.id }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Invoice sent successfully",
      });

      await fetchInvoiceData();
    } catch (error) {
      console.error('Error sending invoice:', error);
      toast({
        title: "Error",
        description: "Failed to send invoice",
        variant: "destructive",
      });
    }
  };

  const addLineItem = () => {
    if (!invoice) return;

    const newItem: LineItem = {
      id: `temp_${Date.now()}`,
      title: 'New Item',
      description: '',
      quantity: 1,
      unit_price: 0,
      total_price: 0,
      category: 'other'
    };

    setInvoice({
      ...invoice,
      line_items: [...invoice.line_items, newItem]
    });
    setEditingItem(newItem.id);
  };

  const updateLineItem = (itemId: string, updates: Partial<LineItem>) => {
    if (!invoice) return;

    const updatedItems = invoice.line_items.map(item => {
      if (item.id === itemId) {
        const updated = { ...item, ...updates };
        if (updates.quantity !== undefined || updates.unit_price !== undefined) {
          updated.total_price = updated.quantity * updated.unit_price;
        }
        return updated;
      }
      return item;
    });

    const subtotal = updatedItems.reduce((sum, item) => sum + item.total_price, 0);
    const tax_amount = Math.round(subtotal * 0.08); // 8% tax
    const total_amount = subtotal + tax_amount;

    setInvoice({
      ...invoice,
      line_items: updatedItems,
      subtotal,
      tax_amount,
      total_amount
    });
  };

  const removeLineItem = (itemId: string) => {
    if (!invoice) return;

    const updatedItems = invoice.line_items.filter(item => item.id !== itemId);
    const subtotal = updatedItems.reduce((sum, item) => sum + item.total_price, 0);
    const tax_amount = Math.round(subtotal * 0.08);
    const total_amount = subtotal + tax_amount;

    setInvoice({
      ...invoice,
      line_items: updatedItems,
      subtotal,
      tax_amount,
      total_amount
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'sent':
        return <Send className="h-5 w-5 text-blue-600" />;
      case 'viewed':
        return <Eye className="h-5 w-5 text-purple-600" />;
      case 'overdue':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'sent':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'viewed':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-destructive" />
          <p className="text-foreground">Invoice not found</p>
          <Button onClick={() => navigate('/admin')} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Admin
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-3">
                {getStatusIcon(invoice.status)}
                <div>
                  <h1 className="text-xl font-semibold">
                    {invoice.invoice_number}
                  </h1>
                  <Badge className={getStatusColor(invoice.status)}>
                    {invoice.status}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'edit' ? 'preview' : 'edit')}
              >
                {viewMode === 'edit' ? <Eye className="h-4 w-4 mr-2" /> : <Edit3 className="h-4 w-4 mr-2" />}
                {viewMode === 'edit' ? 'Preview' : 'Edit'}
              </Button>
              
              {viewMode === 'edit' && (
                <Button
                  onClick={handleSaveInvoice}
                  disabled={isSaving}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              )}
              
              {invoice.status === 'draft' && (
                <>
                  <Button
                    onClick={handleCreatePaymentLink}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <CreditCard className="h-4 w-4" />
                    Create Payment Link
                  </Button>
                  
                  <Button
                    onClick={handleSendInvoice}
                    className="flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Send Invoice
                  </Button>
                </>
              )}
              
              {invoice.stripe_payment_link && (
                <Button
                  variant="outline"
                  onClick={() => window.open(invoice.stripe_payment_link, '_blank')}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Payment Link
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Invoice Details - Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer & Event Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Invoice Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Bill To</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{invoice.customer?.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{invoice.customer?.email}</span>
                      </div>
                      {invoice.customer?.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{invoice.customer.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {invoice.quote_request && (
                    <div className="space-y-3">
                      <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Event Details</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{invoice.quote_request.event_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {new Date(invoice.quote_request.event_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{invoice.quote_request.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{invoice.quote_request.guest_count} guests</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Line Items */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Line Items
                </CardTitle>
                {viewMode === 'edit' && (
                  <Button onClick={addLineItem} size="sm" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Item
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invoice.line_items.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      {editingItem === item.id && viewMode === 'edit' ? (
                        <div className="space-y-4">
                          <Input
                            value={item.title}
                            onChange={(e) => updateLineItem(item.id, { title: e.target.value })}
                            placeholder="Item title"
                          />
                          <Textarea
                            value={item.description}
                            onChange={(e) => updateLineItem(item.id, { description: e.target.value })}
                            placeholder="Item description"
                            rows={2}
                          />
                          <div className="grid grid-cols-3 gap-4">
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateLineItem(item.id, { quantity: parseInt(e.target.value) || 0 })}
                              placeholder="Qty"
                            />
                            <Input
                              type="number"
                              value={item.unit_price / 100}
                              onChange={(e) => updateLineItem(item.id, { unit_price: Math.round((parseFloat(e.target.value) || 0) * 100) })}
                              placeholder="Unit Price"
                              step="0.01"
                            />
                            <div className="flex items-center">
                              <span className="font-medium">{formatCurrency(item.total_price)}</span>
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removeLineItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingItem(null)}
                            >
                              Done
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div 
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => viewMode === 'edit' && setEditingItem(item.id)}
                        >
                          <div className="flex-1">
                            <h4 className="font-medium">{item.title}</h4>
                            {item.description && (
                              <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span>Qty: {item.quantity}</span>
                              <span>@ {formatCurrency(item.unit_price)}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{formatCurrency(item.total_price)}</div>
                            {viewMode === 'edit' && (
                              <Edit3 className="h-4 w-4 text-muted-foreground mt-1" />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                {viewMode === 'edit' ? (
                  <Textarea
                    value={invoice.notes || ''}
                    onChange={(e) => setInvoice({ ...invoice, notes: e.target.value })}
                    placeholder="Additional notes or terms..."
                    rows={4}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {invoice.notes || 'No additional notes'}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Totals & Actions */}
          <div className="space-y-6">
            {/* Invoice Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Invoice Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(invoice.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (8%):</span>
                  <span>{formatCurrency(invoice.tax_amount)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium text-lg">
                  <span>Total:</span>
                  <span>{formatCurrency(invoice.total_amount)}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Due: {new Date(invoice.due_date).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
                <Button variant="outline" className="w-full flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Print Invoice
                </Button>
                {invoice.stripe_payment_link && (
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center gap-2"
                    onClick={() => window.open(invoice.stripe_payment_link, '_blank')}
                  >
                    <CreditCard className="h-4 w-4" />
                    View Payment Page
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Payment Status */}
            {invoice.stripe_payment_link && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    {getStatusIcon(invoice.status)}
                    <div>
                      <p className="font-medium capitalize">{invoice.status}</p>
                      <p className="text-sm text-muted-foreground">
                        Payment link created
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}