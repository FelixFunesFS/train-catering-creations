import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { AdminCardActions } from '@/components/admin/AdminCardActions';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Search, 
  Eye, 
  Calendar, 
  Users, 
  MapPin,
  RefreshCw,
  SortAsc,
  SortDesc,
  FileText,
  CheckCircle
} from 'lucide-react';

interface QuoteManagementTabProps {
  quotes: any[];
  loading: boolean;
  onRefresh: () => Promise<void>;
  selectedItems: string[];
  onSelectionChange: (items: string[]) => void;
}

export function QuoteManagementTab({ 
  quotes, 
  loading, 
  onRefresh, 
  selectedItems, 
  onSelectionChange 
}: QuoteManagementTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('updated_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const { toast } = useToast();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  const filteredAndSortedQuotes = quotes
    .filter(quote => {
      const matchesSearch = 
        quote.event_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.location?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || quote.workflow_status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(filteredAndSortedQuotes.map(quote => quote.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectItem = (quoteId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedItems, quoteId]);
    } else {
      onSelectionChange(selectedItems.filter(id => id !== quoteId));
    }
  };


  const getStatusCounts = () => {
    const counts: Record<string, number> = {};
    quotes.forEach(quote => {
      counts[quote.workflow_status] = (counts[quote.workflow_status] || 0) + 1;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();


  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Filters and Search - Contained properly */}
      <Card className="bg-background border shadow-sm">
        <CardContent className="p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
            <div className="flex-1 min-w-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search quotes, customers, events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2 shrink-0">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 h-10 border border-input rounded-md bg-background text-sm"
              >
                <option value="all">All ({quotes.length})</option>
                {Object.entries(statusCounts).map(([status, count]) => (
                  <option key={status} value={status}>
                    {status} ({count})
                  </option>
                ))}
              </select>
              
              <Button
                variant="outline"
                onClick={onRefresh}
                disabled={loading}
                size="sm"
                className="h-10"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''} sm:mr-2`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quotes Grid - Responsive and contained */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
        {loading ? (
          <div className="col-span-full text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading quotes...</p>
          </div>
        ) : filteredAndSortedQuotes.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">No quotes found matching your criteria.</p>
          </div>
        ) : (
          filteredAndSortedQuotes.map((quote) => (
            <Card key={quote.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedItems.includes(quote.id)}
                      onCheckedChange={(checked) => handleSelectItem(quote.id, !!checked)}
                    />
                    <CardTitle className="text-lg">{quote.event_name}</CardTitle>
                  </div>
                  <StatusBadge status={quote.workflow_status} size="sm" />
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Customer Details */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{quote.contact_name}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {quote.email} • {quote.phone}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{quote.location}</span>
                  </div>
                </div>

                {/* Event Details */}
                <div className="space-y-2 pt-2 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(quote.event_date)}</span>
                    <span className="text-muted-foreground">•</span>
                    <span>{quote.guest_count} guests</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Service:</span> {quote.service_type?.replace('_', ' ') || 'Not specified'}
                  </div>
                </div>

                {/* Menu Selections */}
                <div className="space-y-2 pt-2 border-t">
                  <div className="text-sm font-medium text-muted-foreground">Menu Selections:</div>
                  {quote.proteins && quote.proteins.length > 0 && (
                    <div className="text-sm">
                      <span className="font-medium">Proteins:</span> {Array.isArray(quote.proteins) ? quote.proteins.join(', ') : quote.proteins}
                    </div>
                  )}
                  {quote.appetizers?.length > 0 && (
                    <div className="text-sm">
                      <span className="font-medium">Appetizers:</span> {quote.appetizers.slice(0, 2).join(', ')}
                      {quote.appetizers.length > 2 && ` +${quote.appetizers.length - 2} more`}
                    </div>
                  )}
                  {quote.dietary_restrictions?.length > 0 && (
                    <div className="text-sm">
                      <span className="font-medium">Dietary:</span> {quote.dietary_restrictions.join(', ')}
                    </div>
                  )}
                  {quote.special_requests && (
                    <div className="text-sm">
                      <span className="font-medium">Special:</span> {quote.special_requests.substring(0, 50)}
                      {quote.special_requests.length > 50 && '...'}
                    </div>
                  )}
                </div>

                {/* Estimated Total */}
                {quote.estimated_total > 0 && (
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Estimated Total:</span>
                      <span className="font-semibold">{formatCurrency(quote.estimated_total)}</span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-2">
                  <AdminCardActions 
                    quote={quote}
                    size="sm"
                  />
                </div>

                {/* Created Date */}
                <div className="text-xs text-muted-foreground">
                  Submitted {formatDate(quote.created_at)}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

    </div>
  );
}