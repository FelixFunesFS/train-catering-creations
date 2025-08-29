import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CalendarPlus, 
  CalendarMinus, 
  RefreshCw, 
  Save, 
  X, 
  Edit,
  History,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Users,
  Clock,
  ChefHat,
  Utensils,
  Settings,
  StickyNote,
  MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MenuEditForm } from './MenuEditForm';
import { AdminNotesSection } from './AdminNotesSection';
import { CommunicationPanel } from './CommunicationPanel';
import type { Database } from '@/integrations/supabase/types';

type QuoteRequest = Database['public']['Tables']['quote_requests']['Row'];

type HistoryEntry = Database['public']['Tables']['quote_request_history']['Row'];

interface QuoteDetailModalProps {
  quote: QuoteRequest;
  onClose: () => void;
  onUpdate: (updatedQuote: QuoteRequest) => void;
}

export function QuoteDetailModal({ quote, onClose, onUpdate }: QuoteDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedQuote, setEditedQuote] = useState(quote);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [isEditingMenu, setIsEditingMenu] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchHistory();
  }, [quote.id]);

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('quote_request_history')
        .select('*')
        .eq('quote_request_id', quote.id)
        .order('change_timestamp', { ascending: false });

      if (error) throw error;
      setHistory(data || []);
    } catch (error: any) {
      console.error('Error fetching history:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('quote_requests')
        .update(editedQuote)
        .eq('id', quote.id);

      if (error) throw error;

      onUpdate(editedQuote);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Quote request updated successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update quote request: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMenuSave = async (menuData: any) => {
    setLoading(true);
    try {
      const updatedQuote = { ...editedQuote, ...menuData };
      
      const { error } = await supabase
        .from('quote_requests')
        .update(menuData)
        .eq('id', quote.id);

      if (error) throw error;

      setEditedQuote(updatedQuote);
      onUpdate(updatedQuote);
      setIsEditingMenu(false);
      toast({
        title: "Success",
        description: "Menu updated successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update menu: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedQuote(quote);
    setIsEditing(false);
  };

  const handleCalendarAction = async (action: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('calendar-sync', {
        body: { action, quoteId: quote.id }
      });

      if (error) throw error;

      toast({
        title: "Calendar Action",
        description: data?.message || "Calendar action completed"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to perform calendar action: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatArrayField = (field: any) => {
    if (!field) return [];
    try {
      return Array.isArray(field) ? field : JSON.parse(field);
    } catch {
      return [];
    }
  };

  const formatTimeField = (time: string | null) => {
    if (!time) return 'Not specified';
    return format(new Date(`1970-01-01T${time}`), 'h:mm a');
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold">
                {editedQuote.event_name}
              </DialogTitle>
              <p className="text-muted-foreground mt-1">
                Quote Request Details
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
              >
                <History className="h-4 w-4 mr-2" />
                History
              </Button>
              
              <Button variant="outline" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {showHistory && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Change History</CardTitle>
            </CardHeader>
            <CardContent className="max-h-60 overflow-y-auto">
              {history.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No changes recorded yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {history.map((entry) => (
                    <div key={entry.id} className="border-l-2 border-primary pl-4 py-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">
                            {entry.field_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </p>
                          <div className="text-sm text-muted-foreground mt-1">
                            <span className="font-medium">From:</span> {entry.old_value || 'Empty'} <br />
                            <span className="font-medium">To:</span> {entry.new_value || 'Empty'}
                          </div>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <p>{entry.changed_by}</p>
                          <p>{format(new Date(entry.change_timestamp), 'MMM dd, yyyy HH:mm')}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="details" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Details
            </TabsTrigger>
            <TabsTrigger value="menu" className="flex items-center gap-2">
              <ChefHat className="h-4 w-4" />
              Menu
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center gap-2">
              <StickyNote className="h-4 w-4" />
              Notes
            </TabsTrigger>
            <TabsTrigger value="communication" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Calendar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <div className="flex justify-end mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit className="h-4 w-4 mr-2" />
                {isEditing ? 'Cancel' : 'Edit Details'}
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Contact Name</Label>
                    {isEditing ? (
                      <Input
                        value={editedQuote.contact_name}
                        onChange={(e) => setEditedQuote({...editedQuote, contact_name: e.target.value})}
                      />
                    ) : (
                      <p className="text-sm bg-muted p-3 rounded-md">{editedQuote.contact_name}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label>Email</Label>
                    {isEditing ? (
                      <Input
                        type="email"
                        value={editedQuote.email}
                        onChange={(e) => setEditedQuote({...editedQuote, email: e.target.value})}
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">{editedQuote.email}</p>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <Label>Phone</Label>
                    {isEditing ? (
                      <Input
                        value={editedQuote.phone}
                        onChange={(e) => setEditedQuote({...editedQuote, phone: e.target.value})}
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">{editedQuote.phone}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Event Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Event Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Event Name</Label>
                    {isEditing ? (
                      <Input
                        value={editedQuote.event_name}
                        onChange={(e) => setEditedQuote({...editedQuote, event_name: e.target.value})}
                      />
                    ) : (
                      <p className="text-sm bg-muted p-3 rounded-md">{editedQuote.event_name}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label>Event Type</Label>
                    {isEditing ? (
                      <Select 
                        value={editedQuote.event_type} 
                        onValueChange={(value) => setEditedQuote({...editedQuote, event_type: value as Database['public']['Enums']['event_type']})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="corporate">Corporate Event</SelectItem>
                          <SelectItem value="private_party">Private Party</SelectItem>
                          <SelectItem value="birthday">Birthday Party</SelectItem>
                          <SelectItem value="baby_shower">Baby Shower</SelectItem>
                          <SelectItem value="bereavement">Bereavement</SelectItem>
                          <SelectItem value="graduation">Graduation</SelectItem>
                          <SelectItem value="retirement">Retirement</SelectItem>
                          <SelectItem value="holiday_party">Holiday Party</SelectItem>
                          <SelectItem value="anniversary">Anniversary</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm bg-muted p-3 rounded-md">{editedQuote.event_type}</p>
                    )}
                  </div>

                  <div>
                    <Label>Event Date</Label>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={editedQuote.event_date}
                        onChange={(e) => setEditedQuote({...editedQuote, event_date: e.target.value})}
                      />
                    ) : (
                      <p className="text-sm bg-muted p-3 rounded-md">
                        {format(new Date(editedQuote.event_date), 'MMMM dd, yyyy')}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Start Time</Label>
                      {isEditing ? (
                        <Input
                          type="time"
                          value={editedQuote.start_time || ''}
                          onChange={(e) => setEditedQuote({...editedQuote, start_time: e.target.value})}
                        />
                      ) : (
                        <p className="text-sm bg-muted p-3 rounded-md">
                          {formatTimeField(editedQuote.start_time)}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label>Serving Time</Label>
                      {isEditing ? (
                        <Input
                          type="time"
                          value={editedQuote.serving_start_time || ''}
                          onChange={(e) => setEditedQuote({...editedQuote, serving_start_time: e.target.value})}
                        />
                      ) : (
                        <p className="text-sm bg-muted p-3 rounded-md">
                          {formatTimeField(editedQuote.serving_start_time)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label>Guest Count</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editedQuote.guest_count}
                        onChange={(e) => setEditedQuote({...editedQuote, guest_count: parseInt(e.target.value)})}
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">{editedQuote.guest_count} guests</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label>Location</Label>
                    {isEditing ? (
                      <Textarea
                        value={editedQuote.location}
                        onChange={(e) => setEditedQuote({...editedQuote, location: e.target.value})}
                        rows={2}
                      />
                    ) : (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                        <p className="text-sm">{editedQuote.location}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Service Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Utensils className="h-5 w-5" />
                    Service Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Service Type</Label>
                    {isEditing ? (
                      <Select 
                        value={editedQuote.service_type} 
                        onValueChange={(value) => setEditedQuote({...editedQuote, service_type: value as Database['public']['Enums']['service_type']})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full-service">Full Service Catering</SelectItem>
                          <SelectItem value="delivery-only">Delivery Only</SelectItem>
                          <SelectItem value="delivery-setup">Delivery + Setup</SelectItem>
                          <SelectItem value="drop-off">Drop-Off Service</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm bg-muted p-3 rounded-md">{editedQuote.service_type}</p>
                    )}
                  </div>

                  <div>
                    <Label>Status</Label>
                    {isEditing ? (
                      <Select 
                        value={editedQuote.status} 
                        onValueChange={(value) => setEditedQuote({...editedQuote, status: value as Database['public']['Enums']['quote_status']})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="reviewed">Reviewed</SelectItem>
                          <SelectItem value="quoted">Quoted</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant="outline" className="text-sm">
                        {editedQuote.status}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Special Requests & Notes */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Special Requests & Additional Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Special Requests</Label>
                    {isEditing ? (
                      <Textarea
                        value={editedQuote.special_requests || ''}
                        onChange={(e) => setEditedQuote({...editedQuote, special_requests: e.target.value})}
                        placeholder="Any special requests or notes..."
                      />
                    ) : (
                      <p className="text-sm bg-muted p-3 rounded-md min-h-[60px]">
                        {editedQuote.special_requests || 'No special requests'}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label>Referral Source</Label>
                    {isEditing ? (
                      <Input
                        value={editedQuote.referral_source || ''}
                        onChange={(e) => setEditedQuote({...editedQuote, referral_source: e.target.value})}
                        placeholder="How did you hear about us?"
                      />
                    ) : (
                      <p className="text-sm bg-muted p-3 rounded-md">
                        {editedQuote.referral_source || 'Not specified'}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label>Theme Colors</Label>
                    {isEditing ? (
                      <Input
                        value={editedQuote.theme_colors || ''}
                        onChange={(e) => setEditedQuote({...editedQuote, theme_colors: e.target.value})}
                        placeholder="Event color scheme..."
                      />
                    ) : (
                      <p className="text-sm bg-muted p-3 rounded-md">
                        {editedQuote.theme_colors || 'Not specified'}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {isEditing && (
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="menu" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Menu Management</h3>
              <Button
                variant="outline"
                onClick={() => setIsEditingMenu(!isEditingMenu)}
              >
                <Edit className="h-4 w-4 mr-2" />
                {isEditingMenu ? 'Cancel' : 'Edit Menu'}
              </Button>
            </div>

            {isEditingMenu ? (
              <MenuEditForm
                quote={editedQuote}
                onSave={handleMenuSave}
                onCancel={() => setIsEditingMenu(false)}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Current Menu Display */}
                <Card>
                  <CardHeader>
                    <CardTitle>Proteins</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {editedQuote.primary_protein && (
                      <Badge variant="default">Primary: {editedQuote.primary_protein}</Badge>
                    )}
                    {editedQuote.secondary_protein && (
                      <Badge variant="secondary">Secondary: {editedQuote.secondary_protein}</Badge>
                    )}
                    {editedQuote.both_proteins_available && (
                      <Badge variant="outline">Both proteins for all guests</Badge>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Dietary Restrictions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {formatArrayField(editedQuote.dietary_restrictions).map((restriction, index) => (
                        <Badge key={index} variant="outline">{restriction}</Badge>
                      ))}
                    </div>
                    {editedQuote.guest_count_with_restrictions && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Count: {editedQuote.guest_count_with_restrictions}
                      </p>
                    )}
                  </CardContent>
                </Card>

                {['appetizers', 'sides', 'desserts', 'drinks'].map((category) => (
                  <Card key={category}>
                    <CardHeader>
                      <CardTitle className="capitalize">{category}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {formatArrayField(editedQuote[category]).map((item, index) => (
                          <Badge key={index} variant="secondary">{item}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {editedQuote.custom_menu_requests && (
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle>Custom Menu Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm bg-muted p-3 rounded-md">
                        {editedQuote.custom_menu_requests}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="notes">
            <AdminNotesSection quoteId={quote.id} />
          </TabsContent>

          <TabsContent value="communication">
            <CommunicationPanel 
              quoteId={quote.id}
              customerName={editedQuote.contact_name}
              customerEmail={editedQuote.email}
            />
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            {/* Calendar Integration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Calendar Integration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Calendar Status</p>
                    <p className="text-sm text-muted-foreground">
                      {editedQuote.calendar_sync_status === 'synced' ? 'Event synced to calendar' : 'Not synced'}
                    </p>
                  </div>
                  <Badge variant={editedQuote.calendar_sync_status === 'synced' ? 'default' : 'outline'}>
                    {editedQuote.calendar_sync_status || 'not_synced'}
                  </Badge>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCalendarAction('create')}
                    disabled={loading}
                  >
                    <CalendarPlus className="h-4 w-4 mr-2" />
                    Add to Calendar
                  </Button>
                  
                  {editedQuote.calendar_event_id && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCalendarAction('update')}
                        disabled={loading}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Update Event
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCalendarAction('delete')}
                        disabled={loading}
                      >
                        <CalendarMinus className="h-4 w-4 mr-2" />
                        Remove Event
                      </Button>
                    </>
                  )}
                </div>

                {editedQuote.last_calendar_sync && (
                  <p className="text-xs text-muted-foreground">
                    Last sync: {format(new Date(editedQuote.last_calendar_sync), 'MMM dd, yyyy HH:mm')}
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}