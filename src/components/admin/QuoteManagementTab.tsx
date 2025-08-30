import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { StandardizedActions } from '@/components/admin/StandardizedActions';
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
      
      const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
      
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
      counts[quote.status] = (counts[quote.status] || 0) + 1;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();


  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search quotes, customers, events, locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">All Status ({quotes.length})</option>
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
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quotes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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
                  <StatusBadge status={quote.status} size="sm" />
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Quote Details */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{quote.contact_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(quote.event_date)}</span>
                    <span className="text-muted-foreground">•</span>
                    <span>{quote.guest_count} guests</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{quote.location}</span>
                  </div>
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
                  <StandardizedActions 
                    type="quote" 
                    item={quote} 
                    onRefresh={onRefresh}
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