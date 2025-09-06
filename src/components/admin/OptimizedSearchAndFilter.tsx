import React, { useState, useMemo, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  X,
  Tag,
  Calendar,
  DollarSign
} from 'lucide-react';
import { useDebounce, useDebouncedCallback } from '@/hooks/usePerformanceOptimization';

interface FilterOption {
  id: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'number' | 'boolean';
  options?: { value: string; label: string; }[];
}

interface SortOption {
  id: string;
  label: string;
  direction: 'asc' | 'desc';
}

interface ActiveFilter {
  id: string;
  value: any;
  label: string;
}

interface OptimizedSearchAndFilterProps {
  onSearch: (query: string) => void;
  onFilter: (filters: Record<string, any>) => void;
  onSort: (sortBy: string, direction: 'asc' | 'desc') => void;
  searchPlaceholder?: string;
  filterOptions?: FilterOption[];
  sortOptions?: SortOption[];
  initialFilters?: Record<string, any>;
  debounceDelay?: number;
  showResultCount?: boolean;
  resultCount?: number;
}

export function OptimizedSearchAndFilter({
  onSearch,
  onFilter,
  onSort,
  searchPlaceholder = "Search...",
  filterOptions = [],
  sortOptions = [],
  initialFilters = {},
  debounceDelay = 300,
  showResultCount = true,
  resultCount = 0
}: OptimizedSearchAndFilterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>(initialFilters);
  const [currentSort, setCurrentSort] = useState<{ field: string; direction: 'asc' | 'desc' } | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Debounced search
  const debouncedSearchQuery = useDebounce(searchQuery, debounceDelay);
  
  // Debounced filter callback
  const debouncedOnFilter = useDebouncedCallback(onFilter, debounceDelay);

  // Effect for search
  React.useEffect(() => {
    onSearch(debouncedSearchQuery);
  }, [debouncedSearchQuery, onSearch]);

  // Effect for filters
  React.useEffect(() => {
    debouncedOnFilter(filters);
  }, [filters, debouncedOnFilter]);

  // Get active filters for display
  const activeFilters = useMemo(() => {
    return Object.entries(filters)
      .filter(([key, value]) => value !== '' && value !== null && value !== undefined)
      .map(([key, value]) => {
        const option = filterOptions.find(opt => opt.id === key);
        return {
          id: key,
          value,
          label: option?.label || key
        } as ActiveFilter;
      });
  }, [filters, filterOptions]);

  // Handle filter change
  const handleFilterChange = useCallback((filterId: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterId]: value
    }));
  }, []);

  // Remove filter
  const removeFilter = useCallback((filterId: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[filterId];
      return newFilters;
    });
  }, []);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setFilters({});
    setSearchQuery('');
  }, []);

  // Handle sort
  const handleSort = useCallback((sortId: string) => {
    const newDirection = currentSort?.field === sortId && currentSort.direction === 'asc' ? 'desc' : 'asc';
    setCurrentSort({ field: sortId, direction: newDirection });
    onSort(sortId, newDirection);
  }, [currentSort, onSort]);

  const getSortIcon = (sortId: string) => {
    if (currentSort?.field !== sortId) return <SortAsc className="h-4 w-4 opacity-50" />;
    return currentSort.direction === 'asc' 
      ? <SortAsc className="h-4 w-4 text-primary" />
      : <SortDesc className="h-4 w-4 text-primary" />;
  };

  const renderFilterInput = (option: FilterOption) => {
    const value = filters[option.id] || '';

    switch (option.type) {
      case 'select':
        return (
          <Select
            value={value}
            onValueChange={(val) => handleFilterChange(option.id, val)}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder={`Select ${option.label}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All {option.label}</SelectItem>
              {option.options?.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => handleFilterChange(option.id, e.target.value)}
            className="h-8"
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleFilterChange(option.id, e.target.value)}
            placeholder={`Enter ${option.label}`}
            className="h-8"
          />
        );

      default:
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => handleFilterChange(option.id, e.target.value)}
            placeholder={`Filter by ${option.label}`}
            className="h-8"
          />
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Controls Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery('')}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Filter Toggle */}
        {filterOptions.length > 0 && (
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {activeFilters.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFilters.length}
              </Badge>
            )}
          </Button>
        )}

        {/* Sort Options */}
        {sortOptions.length > 0 && (
          <Select
            value={currentSort ? `${currentSort.field}-${currentSort.direction}` : ''}
            onValueChange={(value) => {
              if (value) {
                const [field, direction] = value.split('-');
                handleSort(field);
              }
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem 
                  key={`${option.id}-${option.direction}`} 
                  value={`${option.id}-${option.direction}`}
                >
                  <div className="flex items-center gap-2">
                    {getSortIcon(option.id)}
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Active Filters Display */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {activeFilters.map((filter) => (
            <Badge
              key={filter.id}
              variant="secondary"
              className="flex items-center gap-1"
            >
              <Tag className="h-3 w-3" />
              {filter.label}: {String(filter.value)}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFilter(filter.id)}
                className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Filter Inputs */}
      {showFilters && filterOptions.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filterOptions.map((option) => (
                <div key={option.id} className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    {option.label}
                  </label>
                  {renderFilterInput(option)}
                </div>
              ))}
            </div>
            
            {filterOptions.length > 0 && (
              <div className="flex justify-end mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                >
                  Reset Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Result Count */}
      {showResultCount && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{resultCount} result{resultCount !== 1 ? 's' : ''} found</span>
          {(searchQuery || activeFilters.length > 0) && (
            <span>
              • <Button
                variant="link"
                size="sm"
                onClick={clearAllFilters}
                className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground"
              >
                Clear all filters
              </Button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}