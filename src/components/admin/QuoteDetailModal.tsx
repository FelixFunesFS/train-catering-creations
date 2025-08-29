import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Edit2, Save, X, History, Calendar, Clock, Users, MapPin, Utensils, Settings } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type QuoteRequest = Database['public']['Tables']['quote_requests']['Row'];
type HistoryEntry = Database['public']['Tables']['quote_request_history']['Row'];

interface QuoteDetailModalProps {
  quote: QuoteRequest;
  onClose: () => void;
  onUpdate: (updatedQuote: QuoteRequest) => void;
}

export const QuoteDetailModal = ({ quote, onClose, onUpdate }: QuoteDetailModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedQuote, setEditedQuote] = useState<QuoteRequest>(quote);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(false);
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
    } catch (error) {
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
      await fetchHistory(); // Refresh history after update
      
      toast({
        title: "Quote Updated",
        description: "Quote request has been successfully updated",
      });
    } catch (error) {
      console.error('Error updating quote:', error);
      toast({
        title: "Error",
        description: "Failed to update quote request",
        variant: "destructive",
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

      // Refresh the quote data to get updated calendar sync status
      const { data: updatedQuote, error: fetchError } = await supabase
        .from('quote_requests')
        .select('*')
        .eq('id', quote.id)
        .single();

      if (fetchError) throw fetchError;

      if (updatedQuote) {
        onUpdate(updatedQuote);
      }

      toast({
        title: "Calendar Action Completed",
        description: data?.message || "Calendar action completed successfully",
      });
    } catch (error) {
      console.error('Calendar action error:', error);
      toast({
        title: "Error",
        description: "Failed to perform calendar action",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatArrayField = (field: any) => {
    if (!field) return 'None selected';
    try {
      const parsed = typeof field === 'string' ? JSON.parse(field) : field;
      return Array.isArray(parsed) ? parsed.join(', ') : 'None selected';
    } catch {
      return 'None selected';
    }
  };

  const formatTimeField = (time: string | null) => {
    if (!time) return 'Not specified';
    return format(new Date(`1970-01-01T${time}`), 'h:mm a');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="h-5 w-5" />
                Quote Request Details - {quote.event_name}
              </CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">{quote.status}</Badge>
                <Badge variant="secondary">{quote.service_type}</Badge>
                <span className="text-sm text-muted-foreground">
                  ID: {quote.id.slice(0, 8)}...
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                className="gap-2"
              >
                <History className="h-4 w-4" />
                History ({history.length})
              </Button>
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} className="gap-2">
                  <Edit2 className="h-4 w-4" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={loading} className="gap-2">
                    <Save className="h-4 w-4" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={handleCancel} className="gap-2">
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              )}
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* History Panel */}
          {showHistory && (
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-lg">Change History</CardTitle>
              </CardHeader>
              <CardContent>
                {history.length > 0 ? (
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {history.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between p-3 bg-background rounded-lg">
                        <div>
                          <p className="font-medium">
                            {entry.field_name.replace('_', ' ')} changed
                          </p>
                          <p className="text-sm text-muted-foreground">
                            From: <span className="font-mono">{entry.old_value || 'empty'}</span> → 
                            To: <span className="font-mono">{entry.new_value || 'empty'}</span>
                          </p>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <p>{entry.changed_by}</p>
                          <p>{format(new Date(entry.change_timestamp), 'MMM dd, HH:mm')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No changes recorded yet</p>
                )}
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  {isEditing ? (
                    <Input
                      value={editedQuote.contact_name}
                      onChange={(e) => setEditedQuote({...editedQuote, contact_name: e.target.value})}
                    />
                  ) : (
                    <p className="text-sm">{quote.contact_name}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  {isEditing ? (
                    <Input
                      type="email"
                      value={editedQuote.email}
                      onChange={(e) => setEditedQuote({...editedQuote, email: e.target.value})}
                    />
                  ) : (
                    <p className="text-sm">{quote.email}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  {isEditing ? (
                    <Input
                      value={editedQuote.phone}
                      onChange={(e) => setEditedQuote({...editedQuote, phone: e.target.value})}
                    />
                  ) : (
                    <p className="text-sm">{quote.phone}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Event Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Event Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Event Name</label>
                  {isEditing ? (
                    <Input
                      value={editedQuote.event_name}
                      onChange={(e) => setEditedQuote({...editedQuote, event_name: e.target.value})}
                    />
                  ) : (
                    <p className="text-sm">{quote.event_name}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Event Type</label>
                  {isEditing ? (
                    <Select 
                      value={editedQuote.event_type} 
                      onValueChange={(value) => setEditedQuote({...editedQuote, event_type: value as any})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wedding">Wedding</SelectItem>
                        <SelectItem value="corporate">Corporate Event</SelectItem>
                        <SelectItem value="birthday">Birthday Party</SelectItem>
                        <SelectItem value="graduation">Graduation</SelectItem>
                        <SelectItem value="anniversary">Anniversary</SelectItem>
                        <SelectItem value="military">Military Function</SelectItem>
                        <SelectItem value="social">Social Gathering</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm">{quote.event_type}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Date</label>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={editedQuote.event_date}
                      onChange={(e) => setEditedQuote({...editedQuote, event_date: e.target.value})}
                    />
                  ) : (
                    <p className="text-sm">{format(new Date(quote.event_date), 'MMMM dd, yyyy')}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Start Time</label>
                  {isEditing ? (
                    <Input
                      type="time"
                      value={editedQuote.start_time || ''}
                      onChange={(e) => setEditedQuote({...editedQuote, start_time: e.target.value})}
                    />
                  ) : (
                    <p className="text-sm">{formatTimeField(quote.start_time)}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Serving Start Time</label>
                  {isEditing ? (
                    <Input
                      type="time"
                      value={editedQuote.serving_start_time || ''}
                      onChange={(e) => setEditedQuote({...editedQuote, serving_start_time: e.target.value || null})}
                    />
                  ) : (
                    <p className="text-sm">{formatTimeField(quote.serving_start_time)}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Guest Count</label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editedQuote.guest_count}
                      onChange={(e) => setEditedQuote({...editedQuote, guest_count: parseInt(e.target.value)})}
                    />
                  ) : (
                    <p className="text-sm">{quote.guest_count} guests</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Location</label>
                  {isEditing ? (
                    <Textarea
                      value={editedQuote.location}
                      onChange={(e) => setEditedQuote({...editedQuote, location: e.target.value})}
                      rows={2}
                    />
                  ) : (
                    <p className="text-sm">{quote.location}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Service & Menu Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Service Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Service Type</label>
                  {isEditing ? (
                    <Select 
                      value={editedQuote.service_type} 
                      onValueChange={(value) => setEditedQuote({...editedQuote, service_type: value as any})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-service">Full Service Catering</SelectItem>
                        <SelectItem value="delivery-setup">Delivery + Setup</SelectItem>
                        <SelectItem value="drop-off">Drop-Off Service</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm">{quote.service_type}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  {isEditing ? (
                    <Select 
                      value={editedQuote.status} 
                      onValueChange={(value) => setEditedQuote({...editedQuote, status: value as any})}
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
                    <p className="text-sm">{quote.status}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Calendar Sync Status</label>
                  <div className="flex items-center gap-2">
                    <p className="text-sm">{quote.calendar_sync_status || 'Not synced'}</p>
                    {quote.calendar_sync_status === 'synced' ? (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCalendarAction('update_event')}
                          className="gap-1"
                        >
                          <Calendar className="h-3 w-3" />
                          Update
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleCalendarAction('delete_event')}
                          className="gap-1"
                        >
                          <X className="h-3 w-3" />
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleCalendarAction('create_event')}
                        className="gap-1"
                      >
                        <Calendar className="h-3 w-3" />
                        Sync to Calendar
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="h-4 w-4" />
                  Menu Selections
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Primary Protein</label>
                  <p className="text-sm">{quote.primary_protein || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Secondary Protein</label>
                  <p className="text-sm">{quote.secondary_protein || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Appetizers</label>
                  <p className="text-sm">{formatArrayField(quote.appetizers)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Sides</label>
                  <p className="text-sm">{formatArrayField(quote.sides)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Desserts</label>
                  <p className="text-sm">{formatArrayField(quote.desserts)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Drinks</label>
                  <p className="text-sm">{formatArrayField(quote.drinks)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Dietary Restrictions</label>
                  <p className="text-sm">{formatArrayField(quote.dietary_restrictions)}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Equipment & Setup Requests */}
          <Card>
            <CardHeader>
              <CardTitle>Equipment & Setup Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { field: 'tables_chairs_requested', label: 'Tables & Chairs' },
                  { field: 'linens_requested', label: 'Linens' },
                  { field: 'chafers_requested', label: 'Chafing Dishes' },
                  { field: 'serving_utensils_requested', label: 'Serving Utensils' },
                  { field: 'plates_requested', label: 'Plates' },
                  { field: 'cups_requested', label: 'Cups' },
                  { field: 'napkins_requested', label: 'Napkins' },
                  { field: 'ice_requested', label: 'Ice' },
                  { field: 'wait_staff_requested', label: 'Wait Staff' },
                  { field: 'separate_serving_area', label: 'Separate Serving Area' },
                  { field: 'bussing_tables_needed', label: 'Table Bussing' },
                ].map(({ field, label }) => (
                  <div key={field} className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${quote[field as keyof QuoteRequest] ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-sm">{label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Special Requests */}
          {(quote.special_requests || quote.custom_menu_requests || quote.theme_colors) && (
            <Card>
              <CardHeader>
                <CardTitle>Special Requests & Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {quote.special_requests && (
                  <div>
                    <label className="text-sm font-medium">Special Requests</label>
                    <p className="text-sm">{quote.special_requests}</p>
                  </div>
                )}
                {quote.custom_menu_requests && (
                  <div>
                    <label className="text-sm font-medium">Custom Menu Requests</label>
                    <p className="text-sm">{quote.custom_menu_requests}</p>
                  </div>
                )}
                {quote.theme_colors && (
                  <div>
                    <label className="text-sm font-medium">Theme Colors</label>
                    <p className="text-sm">{quote.theme_colors}</p>
                  </div>
                )}
                {quote.referral_source && (
                  <div>
                    <label className="text-sm font-medium">Referral Source</label>
                    <p className="text-sm">{quote.referral_source}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Request Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Submitted</label>
                <p className="text-sm">{format(new Date(quote.created_at), 'MMM dd, yyyy HH:mm')}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Last Updated</label>
                <p className="text-sm">{format(new Date(quote.updated_at), 'MMM dd, yyyy HH:mm')}</p>
              </div>
              {quote.last_calendar_sync && (
                <div>
                  <label className="text-sm font-medium">Last Calendar Sync</label>
                  <p className="text-sm">{format(new Date(quote.last_calendar_sync), 'MMM dd, yyyy HH:mm')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};