import React, { useState, useEffect, useMemo } from 'react';
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
import { ScrollArea } from '@/components/ui/scroll-area';
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
  const [historyLoading, setHistoryLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [isEditingMenu, setIsEditingMenu] = useState(false);
  const [historyFilter, setHistoryFilter] = useState('');
  const [historyFieldFilter, setHistoryFieldFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchHistory();
  }, [quote.id]);

  const fetchHistory = async () => {
    setHistoryLoading(true);
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
      toast({
        title: "Error",
        description: "Failed to load change history",
        variant: "destructive"
      });
    } finally {
      setHistoryLoading(false);
    }
  };

  // Filtered history based on search and field filters
  const filteredHistory = useMemo(() => {
    return history.filter(entry => {
      const matchesSearch = !historyFilter || 
        entry.field_name.toLowerCase().includes(historyFilter.toLowerCase()) ||
        entry.old_value?.toLowerCase().includes(historyFilter.toLowerCase()) ||
        entry.new_value?.toLowerCase().includes(historyFilter.toLowerCase());
      
      const matchesField = historyFieldFilter === 'all' || entry.field_name === historyFieldFilter;
      
      return matchesSearch && matchesField;
    });
  }, [history, historyFilter, historyFieldFilter]);

  // Get unique field names for filter dropdown
  const uniqueFields = useMemo(() => {
    const fields = history.map(entry => entry.field_name);
    return Array.from(new Set(fields)).sort();
  }, [history]);

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
      <DialogContent className="max-w-7xl w-[95vw] h-[95vh] p-0 gap-0 flex flex-col">
        {/* Sticky Header */}
        <div className="sticky top-0 z-50 bg-background border-b px-6 py-4">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-xl sm:text-2xl font-bold truncate">
                  {editedQuote.event_name}
                </DialogTitle>
                <div className="flex items-center gap-4 mt-1">
                  <p className="text-muted-foreground text-sm">
                    Quote Request Details
                  </p>
                  <Badge 
                    variant={editedQuote.status === 'confirmed' ? 'default' : 'outline'}
                    className="hidden sm:inline-flex"
                  >
                    {editedQuote.status}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                {/* Quick Actions Toolbar */}
                <div className="hidden sm:flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowHistory(!showHistory)}
                  >
                    <History className="h-4 w-4 mr-2" />
                    History
                  </Button>
                  {isEditing && (
                    <>
                      <Button variant="outline" size="sm" onClick={handleCancel}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleSave} disabled={loading}>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    </>
                  )}
                </div>
                
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Scrollable Content Area */}
        <ScrollArea className="flex-1 px-6">
          {showHistory && (
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <CardTitle className="text-lg">Change History</CardTitle>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      placeholder="Search history..."
                      value={historyFilter}
                      onChange={(e) => setHistoryFilter(e.target.value)}
                      className="h-8 max-w-48"
                    />
                    <Select value={historyFieldFilter} onValueChange={setHistoryFieldFilter}>
                      <SelectTrigger className="h-8 max-w-40">
                        <SelectValue placeholder="Filter by field" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Fields</SelectItem>
                        {uniqueFields.map((field) => (
                          <SelectItem key={field} value={field}>
                            {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-96">
                  {historyLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      <span className="text-sm text-muted-foreground">Loading history...</span>
                    </div>
                  ) : filteredHistory.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8 text-sm">
                      {history.length === 0 ? 'No changes recorded yet.' : 'No changes match your filters.'}
                    </p>
                  ) : (
                    <div className="space-y-4 pr-4">
                      {filteredHistory.map((entry, index) => (
                        <Card key={entry.id} className="relative border-l-4 border-l-primary/50">
                          <CardContent className="pt-4 pb-3">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="outline" className="text-xs">
                                    #{history.length - index}
                                  </Badge>
                                  <p className="font-semibold text-sm">
                                    {entry.field_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </p>
                                </div>
                                <div className="space-y-2">
                                  <div className="bg-destructive/10 border border-destructive/20 rounded p-2">
                                    <p className="text-xs font-medium text-destructive mb-1">Previous Value:</p>
                                    <p className="text-sm break-words">{entry.old_value || <em className="text-muted-foreground">Empty</em>}</p>
                                  </div>
                                  <div className="bg-success/10 border border-success/20 rounded p-2">
                                    <p className="text-xs font-medium text-success mb-1">New Value:</p>
                                    <p className="text-sm break-words">{entry.new_value || <em className="text-muted-foreground">Empty</em>}</p>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right text-xs text-muted-foreground flex-shrink-0 space-y-1">
                                <p className="font-medium">{entry.changed_by}</p>
                                <p>{format(new Date(entry.change_timestamp), 'MMM dd, yyyy')}</p>
                                <p>{format(new Date(entry.change_timestamp), 'HH:mm:ss')}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            {/* Sticky Tab Navigation */}
            <div className="sticky top-0 z-40 bg-background border-b -mx-6 px-6 pb-4">
              <ScrollArea className="w-full whitespace-nowrap">
                <TabsList className="inline-flex h-12 w-auto min-w-full sm:grid sm:grid-cols-5 gap-1">
                  <TabsTrigger 
                    value="details" 
                    className="flex items-center gap-2 px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">Details</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="menu" 
                    className="flex items-center gap-2 px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <ChefHat className="h-4 w-4" />
                    <span className="hidden sm:inline">Menu</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="notes" 
                    className="flex items-center gap-2 px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <StickyNote className="h-4 w-4" />
                    <span className="hidden sm:inline">Notes</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="communication" 
                    className="flex items-center gap-2 px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span className="hidden sm:inline">Messages</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="calendar" 
                    className="flex items-center gap-2 px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <Calendar className="h-4 w-4" />
                    <span className="hidden sm:inline">Calendar</span>
                  </TabsTrigger>
                </TabsList>
              </ScrollArea>
            </div>

            <TabsContent value="details" className="space-y-6 mt-0">
              {/* Mobile Edit Button */}
              <div className="flex justify-between items-center sm:hidden mb-4">
                <h3 className="text-lg font-semibold">Quote Details</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {isEditing ? 'Cancel' : 'Edit'}
                </Button>
              </div>
              
              {/* Desktop Edit Button */}
              <div className="hidden sm:flex justify-end mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {isEditing ? 'Cancel' : 'Edit Details'}
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-min">
                {/* Contact Information */}
                <Card className="h-fit">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Users className="h-5 w-5" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Contact Name</Label>
                      {isEditing ? (
                        <Input
                          value={editedQuote.contact_name}
                          onChange={(e) => setEditedQuote({...editedQuote, contact_name: e.target.value})}
                          className="h-9"
                        />
                      ) : (
                        <p className="text-sm bg-muted/50 p-2 rounded border">{editedQuote.contact_name}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Email</Label>
                      {isEditing ? (
                        <Input
                          type="email"
                          value={editedQuote.email}
                          onChange={(e) => setEditedQuote({...editedQuote, email: e.target.value})}
                          className="h-9"
                        />
                      ) : (
                        <div className="flex items-center gap-2 text-sm bg-muted/50 p-2 rounded border">
                          <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="truncate">{editedQuote.email}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Phone</Label>
                      {isEditing ? (
                        <Input
                          value={editedQuote.phone}
                          onChange={(e) => setEditedQuote({...editedQuote, phone: e.target.value})}
                          className="h-9"
                        />
                      ) : (
                        <div className="flex items-center gap-2 text-sm bg-muted/50 p-2 rounded border">
                          <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span>{editedQuote.phone}</span>
                        </div>
                      )}
                    </div>
                </CardContent>
              </Card>

                {/* Event Details */}
                <Card className="h-fit">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Calendar className="h-5 w-5" />
                      Event Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Event Name</Label>
                      {isEditing ? (
                        <Input
                          value={editedQuote.event_name}
                          onChange={(e) => setEditedQuote({...editedQuote, event_name: e.target.value})}
                          className="h-9"
                        />
                      ) : (
                        <p className="text-sm bg-muted/50 p-2 rounded border">{editedQuote.event_name}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Event Type</Label>
                      {isEditing ? (
                        <Select 
                          value={editedQuote.event_type} 
                          onValueChange={(value) => setEditedQuote({...editedQuote, event_type: value as Database['public']['Enums']['event_type']})}
                        >
                          <SelectTrigger className="h-9">
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
                        <Badge variant="secondary" className="w-fit">
                          {editedQuote.event_type?.replace('_', ' ')}
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Event Date</Label>
                        {isEditing ? (
                          <Input
                            type="date"
                            value={editedQuote.event_date}
                            onChange={(e) => setEditedQuote({...editedQuote, event_date: e.target.value})}
                            className="h-9"
                          />
                        ) : (
                          <p className="text-sm bg-muted/50 p-2 rounded border">
                            {format(new Date(editedQuote.event_date), 'MMM dd, yyyy')}
                          </p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Guest Count</Label>
                        {isEditing ? (
                          <Input
                            type="number"
                            value={editedQuote.guest_count}
                            onChange={(e) => setEditedQuote({...editedQuote, guest_count: parseInt(e.target.value)})}
                            className="h-9"
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-sm bg-muted/50 p-2 rounded border">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{editedQuote.guest_count} guests</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Start Time</Label>
                        {isEditing ? (
                          <Input
                            type="time"
                            value={editedQuote.start_time || ''}
                            onChange={(e) => setEditedQuote({...editedQuote, start_time: e.target.value})}
                            className="h-9"
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-sm bg-muted/50 p-2 rounded border">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{formatTimeField(editedQuote.start_time)}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Serving Time</Label>
                        {isEditing ? (
                          <Input
                            type="time"
                            value={editedQuote.serving_start_time || ''}
                            onChange={(e) => setEditedQuote({...editedQuote, serving_start_time: e.target.value})}
                            className="h-9"
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-sm bg-muted/50 p-2 rounded border">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{formatTimeField(editedQuote.serving_start_time)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Location</Label>
                      {isEditing ? (
                        <Textarea
                          value={editedQuote.location}
                          onChange={(e) => setEditedQuote({...editedQuote, location: e.target.value})}
                          rows={2}
                          className="resize-none"
                        />
                      ) : (
                        <div className="flex items-start gap-2 text-sm bg-muted/50 p-2 rounded border">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <span className="leading-relaxed">{editedQuote.location}</span>
                        </div>
                      )}
                    </div>
                </CardContent>
              </Card>

                {/* Service & Status - Compact Row */}
                <Card className="lg:col-span-2 h-fit">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Utensils className="h-5 w-5" />
                      Service & Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Service Type</Label>
                        {isEditing ? (
                          <Select 
                            value={editedQuote.service_type} 
                            onValueChange={(value) => setEditedQuote({...editedQuote, service_type: value as Database['public']['Enums']['service_type']})}
                          >
                            <SelectTrigger className="h-9">
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
                          <Badge variant="secondary" className="w-fit">
                            {editedQuote.service_type?.replace('-', ' ')}
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Status</Label>
                        {isEditing ? (
                          <Select 
                            value={editedQuote.status} 
                            onValueChange={(value) => setEditedQuote({...editedQuote, status: value as Database['public']['Enums']['quote_status']})}
                          >
                            <SelectTrigger className="h-9">
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
                          <Badge 
                            variant={editedQuote.status === 'confirmed' ? 'default' : 'outline'}
                            className="w-fit"
                          >
                            {editedQuote.status}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Referral Source</Label>
                        {isEditing ? (
                          <Input
                            value={editedQuote.referral_source || ''}
                            onChange={(e) => setEditedQuote({...editedQuote, referral_source: e.target.value})}
                            placeholder="How did you hear about us?"
                            className="h-9"
                          />
                        ) : (
                          <p className="text-sm bg-muted/50 p-2 rounded border">
                            {editedQuote.referral_source || 'Not specified'}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Special Requests & Notes - Full Width */}
                <Card className="lg:col-span-2 xl:col-span-3 h-fit">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Settings className="h-5 w-5" />
                      Additional Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Special Requests</Label>
                        {isEditing ? (
                          <Textarea
                            value={editedQuote.special_requests || ''}
                            onChange={(e) => setEditedQuote({...editedQuote, special_requests: e.target.value})}
                            placeholder="Any special requests or notes..."
                            rows={3}
                            className="resize-none"
                          />
                        ) : (
                          <div className="text-sm bg-muted/50 p-3 rounded border min-h-[76px] leading-relaxed">
                            {editedQuote.special_requests || 'No special requests'}
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Theme Colors</Label>
                        {isEditing ? (
                          <Input
                            value={editedQuote.theme_colors || ''}
                            onChange={(e) => setEditedQuote({...editedQuote, theme_colors: e.target.value})}
                            placeholder="Event color scheme..."
                            className="h-9"
                          />
                        ) : (
                          <p className="text-sm bg-muted/50 p-2 rounded border">
                            {editedQuote.theme_colors || 'Not specified'}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Mobile Save/Cancel Actions */}
              {isEditing && (
                <div className="flex justify-end gap-2 pt-4 border-t sm:hidden">
                  <Button variant="outline" onClick={handleCancel} size="sm">
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={loading} size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              )}
            </TabsContent>

          <TabsContent value="menu" className="space-y-6 mt-0">
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
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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

            <TabsContent value="notes" className="mt-0">
              <AdminNotesSection quoteId={quote.id} />
            </TabsContent>

            <TabsContent value="communication" className="mt-0">
              <CommunicationPanel 
                quoteId={quote.id}
                customerName={editedQuote.contact_name}
                customerEmail={editedQuote.email}
              />
            </TabsContent>

            <TabsContent value="calendar" className="space-y-6 mt-0">
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
        </ScrollArea>

        {/* Sticky Bottom Actions for Mobile */}
        {isEditing && (
          <div className="sticky bottom-0 z-50 bg-background border-t px-6 py-3 sm:hidden">
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCancel} size="sm">
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading} size="sm">
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}