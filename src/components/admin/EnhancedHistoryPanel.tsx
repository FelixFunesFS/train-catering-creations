import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Filter, Download, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import type { Database } from '@/integrations/supabase/types';

type HistoryEntry = Database['public']['Tables']['quote_request_history']['Row'];

interface EnhancedHistoryPanelProps {
  history: HistoryEntry[];
  loading: boolean;
  onRefresh: () => void;
}

export function EnhancedHistoryPanel({ 
  history, 
  loading, 
  onRefresh 
}: EnhancedHistoryPanelProps) {
  const [searchFilter, setSearchFilter] = useState('');
  const [fieldFilter, setFieldFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Get unique field names for filter dropdown
  const uniqueFields = useMemo(() => {
    const fields = history.map(entry => entry.field_name);
    return Array.from(new Set(fields)).sort();
  }, [history]);

  // Filter history based on all active filters
  const filteredHistory = useMemo(() => {
    return history.filter(entry => {
      // Search filter
      const matchesSearch = !searchFilter || 
        entry.field_name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        entry.old_value?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        entry.new_value?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        entry.changed_by?.toLowerCase().includes(searchFilter.toLowerCase());
      
      // Field filter
      const matchesField = fieldFilter === 'all' || entry.field_name === fieldFilter;
      
      // Date filter
      const entryDate = new Date(entry.change_timestamp);
      const now = new Date();
      let matchesDate = true;
      
      if (dateFilter === 'today') {
        matchesDate = entryDate.toDateString() === now.toDateString();
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchesDate = entryDate >= weekAgo;
      } else if (dateFilter === 'month') {
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        matchesDate = entryDate >= monthAgo;
      }
      
      return matchesSearch && matchesField && matchesDate;
    });
  }, [history, searchFilter, fieldFilter, dateFilter]);

  const exportHistory = () => {
    const csvContent = [
      ['Timestamp', 'Field', 'Old Value', 'New Value', 'Changed By', 'Reason'].join(','),
      ...filteredHistory.map(entry => [
        entry.change_timestamp,
        entry.field_name,
        entry.old_value || '',
        entry.new_value || '',
        entry.changed_by || '',
        entry.change_reason || ''
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `quote-history-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const formatFieldName = (fieldName: string) => {
    return fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getChangeTypeColor = (entry: HistoryEntry) => {
    if (!entry.old_value && entry.new_value) return 'bg-success/10 border-success/20';
    if (entry.old_value && !entry.new_value) return 'bg-destructive/10 border-destructive/20';
    return 'bg-blue/10 border-blue/20';
  };

  const getChangeTypeLabel = (entry: HistoryEntry) => {
    if (!entry.old_value && entry.new_value) return 'Added';
    if (entry.old_value && !entry.new_value) return 'Removed';
    return 'Modified';
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">Change History</CardTitle>
            <Badge variant="outline" className="text-xs">
              {filteredHistory.length} of {history.length}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportHistory}
              disabled={filteredHistory.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filter Controls */}
        {showAdvancedFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 p-4 bg-muted/30 rounded-lg">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Search</label>
              <Input
                placeholder="Search history..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="h-8"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Field</label>
              <Select value={fieldFilter} onValueChange={setFieldFilter}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="All fields" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Fields</SelectItem>
                  {uniqueFields.map((field) => (
                    <SelectItem key={field} value={field}>
                      {formatFieldName(field)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Time Period</label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="All time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <ScrollArea className="max-h-[600px]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin mr-3" />
              <span className="text-muted-foreground">Loading history...</span>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {history.length === 0 ? 'No changes recorded yet.' : 'No changes match your filters.'}
              </p>
              {history.length > 0 && (
                <Button 
                  variant="link" 
                  className="mt-2"
                  onClick={() => {
                    setSearchFilter('');
                    setFieldFilter('all');
                    setDateFilter('all');
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHistory.map((entry, index) => (
                <Card 
                  key={entry.id} 
                  className={`relative border-l-4 transition-all hover:shadow-md ${getChangeTypeColor(entry)}`}
                >
                  <CardContent className="pt-4 pb-3">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="outline" className="text-xs">
                            #{history.length - filteredHistory.indexOf(entry)}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {getChangeTypeLabel(entry)}
                          </Badge>
                          <h4 className="font-semibold text-sm">
                            {formatFieldName(entry.field_name)}
                          </h4>
                        </div>
                        
                        <div className="space-y-3">
                          {entry.old_value && (
                            <div className="bg-destructive/5 border border-destructive/20 rounded-md p-3">
                              <p className="text-xs font-medium text-destructive mb-1">Previous Value:</p>
                              <p className="text-sm break-words font-mono bg-destructive/10 p-2 rounded">
                                {entry.old_value}
                              </p>
                            </div>
                          )}
                          
                          {entry.new_value && (
                            <div className="bg-success/5 border border-success/20 rounded-md p-3">
                              <p className="text-xs font-medium text-success mb-1">New Value:</p>
                              <p className="text-sm break-words font-mono bg-success/10 p-2 rounded">
                                {entry.new_value}
                              </p>
                            </div>
                          )}
                          
                          {entry.change_reason && (
                            <div className="bg-blue/5 border border-blue/20 rounded-md p-3">
                              <p className="text-xs font-medium text-blue mb-1">Reason:</p>
                              <p className="text-sm italic">{entry.change_reason}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right text-xs text-muted-foreground flex-shrink-0 space-y-1">
                        <div className="bg-muted/50 px-2 py-1 rounded">
                          <p className="font-medium">{entry.changed_by || 'System'}</p>
                          <p>{format(new Date(entry.change_timestamp), 'MMM dd, yyyy')}</p>
                          <p className="font-mono">{format(new Date(entry.change_timestamp), 'HH:mm:ss')}</p>
                        </div>
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
  );
}