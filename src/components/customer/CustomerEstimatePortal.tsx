import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { 
  CheckCircle, 
  MessageSquare, 
  Edit3, 
  CreditCard, 
  Download,
  AlertCircle,
  Clock,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EstimateData {
  id: string;
  invoice_number: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  status: string;
  due_date: string;
  customer_access_token: string;
  quote_requests: {
    id: string;
    contact_name: string;
    event_name: string;
    event_date: string;
    guest_count: number;
    location: string;
    email: string;
  };
  invoice_line_items: Array<{
    id: string;
    title: string;
    description: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    category: string;
  }>;
}

export function CustomerEstimatePortal() {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const [estimate, setEstimate] = useState<EstimateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showChangeRequest, setShowChangeRequest] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [changeType, setChangeType] = useState<string>('');
  const [changeDescription, setChangeDescription] = useState('');
  const [submittingChange, setSubmittingChange] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (token) {
      fetchEstimate();
      setupRealtimeUpdates();
    }
  }, [token]);

  const fetchEstimate = async () => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          quote_requests(id, contact_name, event_name, event_date, guest_count, location, email),
          invoice_line_items(id, title, description, quantity, unit_price, total_price, category)
        `)
        .eq('customer_access_token', token)
        .eq('document_type', 'estimate')
        .single();

      if (error) throw error;
      setEstimate(data as any);
    } catch (error) {
      console.error('Error fetching estimate:', error);
      toast({
        title: "Error",
        description: "Failed to load estimate",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeUpdates = () => {
    const channel = supabase
      .channel('estimate-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invoices',
          filter: `customer_access_token=eq.${token}`
        },
        (payload) => {
          console.log('Estimate updated:', payload);
          fetchEstimate(); // Refetch when estimate is updated
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleApproveEstimate = async () => {
    if (!estimate) return;

    try {
      const { error } = await supabase
        .from('invoices')
        .update({ 
          status: 'customer_approved',
          customer_feedback: { approved_at: new Date().toISOString() }
        })
        .eq('id', estimate.id);

      if (error) throw error;

      toast({
        title: "Estimate Approved!",
        description: "Thank you for approving the estimate. We'll prepare your invoice shortly.",
      });

      fetchEstimate();
    } catch (error) {
      console.error('Error approving estimate:', error);
      toast({
        title: "Error",
        description: "Failed to approve estimate. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSubmitChangeRequest = async () => {
    if (!estimate || !changeType || !changeDescription) {
      toast({
        title: "Missing Information",
        description: "Please select a change type and provide details.",
        variant: "destructive"
      });
      return;
    }

    setSubmittingChange(true);
    try {
      const changeRequestData = {
        invoice_id: estimate.id,
        customer_email: estimate.quote_requests.email,
        request_type: changeType,
        customer_comments: changeDescription,
        requested_changes: {
          selected_items: selectedItems,
          change_type: changeType,
          description: changeDescription,
          submitted_at: new Date().toISOString()
        },
        status: 'pending'
      };

      const { error } = await supabase
        .from('change_requests')
        .insert(changeRequestData);

      if (error) throw error;

      toast({
        title: "Change Request Submitted",
        description: "Your change request has been sent. We'll review it and get back to you soon.",
      });

      setShowChangeRequest(false);
      setSelectedItems([]);
      setChangeType('');
      setChangeDescription('');
    } catch (error) {
      console.error('Error submitting change request:', error);
      toast({
        title: "Error",
        description: "Failed to submit change request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmittingChange(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'entree': 'bg-blue-100 text-blue-800',
      'appetizer': 'bg-green-100 text-green-800',
      'dessert': 'bg-purple-100 text-purple-800',
      'service': 'bg-orange-100 text-orange-800',
      'rental': 'bg-gray-100 text-gray-800',
      'other': 'bg-slate-100 text-slate-800'
    };
    return colors[category] || colors['other'];
  };

  const getStatusDisplay = () => {
    switch (estimate?.status) {
      case 'sent':
        return { label: 'Awaiting Review', color: 'bg-blue-100 text-blue-800', icon: Clock };
      case 'viewed':
        return { label: 'Viewed', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle };
      case 'customer_approved':
        return { label: 'Approved', color: 'bg-green-100 text-green-800', icon: CheckCircle };
      case 'revision_requested':
        return { label: 'Revision Requested', color: 'bg-orange-100 text-orange-800', icon: RefreshCw };
      default:
        return { label: estimate?.status || 'Unknown', color: 'bg-gray-100 text-gray-800', icon: AlertCircle };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your estimate...</p>
        </div>
      </div>
    );
  }

  if (!estimate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Estimate Not Found</h1>
          <p className="text-muted-foreground">The requested estimate could not be found or has expired.</p>
        </div>
      </div>
    );
  }

  const statusDisplay = getStatusDisplay();
  const StatusIcon = statusDisplay.icon;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Soul Train's Eatery</h1>
          <p className="text-lg text-muted-foreground mb-4">Catering Estimate</p>
          <div className="flex items-center justify-center gap-2">
            <StatusIcon className="w-5 h-5" />
            <Badge className={statusDisplay.color}>
              {statusDisplay.label}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Estimate */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Information */}
            <Card>
              <CardHeader>
                <CardTitle>Event Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Event Name:</span>
                    <p className="font-medium">{estimate.quote_requests.event_name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Contact:</span>
                    <p className="font-medium">{estimate.quote_requests.contact_name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Date:</span>
                    <p className="font-medium">{new Date(estimate.quote_requests.event_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Guest Count:</span>
                    <p className="font-medium">{estimate.quote_requests.guest_count}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm text-muted-foreground">Location:</span>
                    <p className="font-medium">{estimate.quote_requests.location}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Line Items */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Service Details</CardTitle>
                  {estimate.status === 'sent' || estimate.status === 'viewed' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowChangeRequest(!showChangeRequest)}
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Request Changes
                    </Button>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {estimate.invoice_line_items.map((item, index) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {showChangeRequest && (
                              <input
                                type="checkbox"
                                checked={selectedItems.includes(item.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedItems([...selectedItems, item.id]);
                                  } else {
                                    setSelectedItems(selectedItems.filter(id => id !== item.id));
                                  }
                                }}
                                className="rounded"
                              />
                            )}
                            <h3 className="font-medium">{item.title}</h3>
                            <Badge variant="secondary" className={getCategoryColor(item.category)}>
                              {item.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                          <p className="text-sm">
                            Quantity: {item.quantity} × {formatCurrency(item.unit_price / 100)}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-medium text-lg">{formatCurrency(item.total_price / 100)}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Change Request Form */}
                  {showChangeRequest && (
                    <Card className="border-orange-200 bg-orange-50">
                      <CardHeader>
                        <CardTitle className="text-orange-800">Request Changes</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="change-type">Type of Change</Label>
                          <Select value={changeType} onValueChange={setChangeType}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select change type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="menu_modification">Menu Item Modification</SelectItem>
                              <SelectItem value="quantity_change">Quantity Change</SelectItem>
                              <SelectItem value="dietary_accommodation">Dietary Accommodation</SelectItem>
                              <SelectItem value="service_addition">Additional Service</SelectItem>
                              <SelectItem value="date_change">Date/Time Change</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="change-description">Describe Your Requested Changes</Label>
                          <Textarea
                            id="change-description"
                            value={changeDescription}
                            onChange={(e) => setChangeDescription(e.target.value)}
                            placeholder="Please provide details about the changes you'd like to make..."
                            rows={4}
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            onClick={handleSubmitChangeRequest}
                            disabled={submittingChange || !changeType || !changeDescription}
                          >
                            {submittingChange ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                Submitting...
                              </>
                            ) : (
                              <>
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Submit Request
                              </>
                            )}
                          </Button>
                          <Button variant="outline" onClick={() => setShowChangeRequest(false)}>
                            Cancel
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Pricing Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(estimate.subtotal / 100)}</span>
                  </div>
                  {estimate.tax_amount > 0 && (
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>{formatCurrency(estimate.tax_amount / 100)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-xl">
                    <span>Total:</span>
                    <span>{formatCurrency(estimate.total_amount / 100)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Per Person:</span>
                    <span>{formatCurrency(estimate.total_amount / 100 / estimate.quote_requests.guest_count)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions Sidebar */}
          <div className="space-y-6">
            {/* Primary Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {estimate.status === 'sent' || estimate.status === 'viewed' ? (
                  <>
                    <Button onClick={handleApproveEstimate} className="w-full bg-green-600 hover:bg-green-700">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve Estimate
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => setShowChangeRequest(true)}>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Request Changes
                    </Button>
                  </>
                ) : estimate.status === 'customer_approved' ? (
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-green-800 font-medium">Estimate Approved!</p>
                    <p className="text-sm text-green-600">We'll prepare your invoice and payment options.</p>
                  </div>
                ) : null}

                <Button variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Questions?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium">Soul Train's Eatery</p>
                    <p className="text-muted-foreground">Charleston's trusted catering partner</p>
                  </div>
                  <div>
                    <p className="font-medium">Phone:</p>
                    <p className="text-muted-foreground">(843) 970-0265</p>
                  </div>
                  <div>
                    <p className="font-medium">Email:</p>
                    <p className="text-muted-foreground">soultrainseatery@gmail.com</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-2">
                  <p>• Review all service details carefully</p>
                  <p>• Contact us with any questions</p>
                  <p>• Request changes if needed</p>
                  <p>• Approve to proceed with booking</p>
                  <p>• Complete payment to secure your date</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}