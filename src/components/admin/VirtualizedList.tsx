import React, { useState, useRef, useEffect, useMemo } from 'react';
// @ts-ignore - react-window types might not be available
import { FixedSizeList as List } from 'react-window';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ChevronUp, 
  ChevronDown, 
  Search,
  ArrowUp,
  ArrowDown,
  Grid,
  List as ListIcon
} from 'lucide-react';
import { useDebounce } from '@/hooks/usePerformanceOptimization';

interface VirtualizedListItem {
  id: string | number;
  [key: string]: any;
}

interface VirtualizedListProps<T extends VirtualizedListItem> {
  items: T[];
  itemHeight?: number;
  containerHeight?: number;
  renderItem: (item: T, index: number, style: React.CSSProperties) => React.ReactNode;
  renderSkeleton?: () => React.ReactNode;
  loading?: boolean;
  searchable?: boolean;
  searchFields?: (keyof T)[];
  sortable?: boolean;
  sortFields?: (keyof T)[];
  itemsPerPage?: number;
  showScrollToTop?: boolean;
  className?: string;
  overscan?: number;
}

export function VirtualizedList<T extends VirtualizedListItem>({
  items,
  itemHeight = 80,
  containerHeight = 400,
  renderItem,
  renderSkeleton,
  loading = false,
  searchable = false,
  searchFields = [],
  sortable = false,
  sortFields = [],
  itemsPerPage = 50,
  showScrollToTop = true,
  className = '',
  overscan = 5
}: VirtualizedListProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  const listRef = useRef<List>(null);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Filtered and sorted items
  const processedItems = useMemo(() => {
    let filtered = items;

    // Apply search filter
    if (debouncedSearchQuery && searchFields.length > 0) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = items.filter(item =>
        searchFields.some(field => {
          const value = item[field];
          return value?.toString().toLowerCase().includes(query);
        })
      );
    }

    // Apply sorting
    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        
        if (aValue === bValue) return 0;
        
        let comparison = 0;
        if (aValue > bValue) comparison = 1;
        if (aValue < bValue) comparison = -1;
        
        return sortDirection === 'desc' ? -comparison : comparison;
      });
    }

    return filtered;
  }, [items, debouncedSearchQuery, searchFields, sortField, sortDirection]);

  // Handle scroll
  const handleScroll = ({ scrollOffset }: { scrollOffset: number }) => {
    setShowScrollButton(scrollOffset > 200);
  };

  // Scroll to top
  const scrollToTop = () => {
    listRef.current?.scrollToItem(0, 'start');
  };

  // Handle sort
  const handleSort = (field: keyof T) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Render item wrapper for virtualization
  const ItemWrapper = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = processedItems[index];
    return (
      <div style={style}>
        {renderItem(item, index, style)}
      </div>
    );
  };

  // Render skeleton items
  const renderSkeletonItems = () => {
    const skeletonCount = Math.ceil(containerHeight / itemHeight);
    return Array.from({ length: skeletonCount }, (_, index) => (
      <div key={index} style={{ height: itemHeight }} className="flex items-center p-4 border-b">
        {renderSkeleton ? renderSkeleton() : (
          <div className="flex items-center space-x-4 w-full">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        )}
      </div>
    ));
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-0">
          <div style={{ height: containerHeight }} className="overflow-hidden">
            {renderSkeletonItems()}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-0">
        {/* Controls */}
        {(searchable || sortable) && (
          <div className="p-4 border-b bg-muted/20">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              {searchable && (
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search items..."
                    className="pl-10"
                  />
                </div>
              )}

              {/* Sort Controls */}
              {sortable && sortFields.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Sort by:</span>
                  {sortFields.map((field) => (
                    <Button
                      key={String(field)}
                      variant={sortField === field ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleSort(field)}
                      className="flex items-center gap-1"
                    >
                      {String(field)}
                      {sortField === field && (
                        sortDirection === 'asc' ? 
                          <ArrowUp className="h-3 w-3" /> : 
                          <ArrowDown className="h-3 w-3" />
                      )}
                    </Button>
                  ))}
                </div>
              )}

              {/* View Mode Toggle */}
              <div className="flex items-center border rounded-md">
                <Button
                  variant={viewMode === 'list' ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-r-none"
                >
                  <ListIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-l-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Results count */}
            <div className="mt-2 text-sm text-muted-foreground">
              Showing {processedItems.length} of {items.length} items
              {debouncedSearchQuery && (
                <span className="ml-2">
                  • Filtered by "{debouncedSearchQuery}"
                </span>
              )}
            </div>
          </div>
        )}

        {/* Virtualized List */}
        <div className="relative">
          {processedItems.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-muted-foreground mb-2">No items found</p>
                {debouncedSearchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear search
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <List
              ref={listRef}
              height={containerHeight}
              itemCount={processedItems.length}
              itemSize={itemHeight}
              onScroll={handleScroll}
              overscanCount={overscan}
            >
              {ItemWrapper}
            </List>
          )}

          {/* Scroll to top button */}
          {showScrollToTop && showScrollButton && (
            <Button
              variant="secondary"
              size="sm"
              onClick={scrollToTop}
              className="absolute bottom-4 right-4 rounded-full w-10 h-10 p-0 shadow-lg"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Grid variant for card layouts
interface VirtualizedGridProps<T extends VirtualizedListItem> {
  items: T[];
  itemWidth?: number;
  itemHeight?: number;
  containerHeight?: number;
  columnsCount?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  loading?: boolean;
  className?: string;
}

export function VirtualizedGrid<T extends VirtualizedListItem>({
  items,
  itemWidth = 200,
  itemHeight = 150,
  containerHeight = 400,
  columnsCount = 3,
  renderItem,
  loading = false,
  className = ''
}: VirtualizedGridProps<T>) {
  const listRef = useRef<List>(null);

  // Calculate rows
  const rowCount = Math.ceil(items.length / columnsCount);

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const startIndex = index * columnsCount;
    const endIndex = Math.min(startIndex + columnsCount, items.length);
    const rowItems = items.slice(startIndex, endIndex);

    return (
      <div style={style} className="flex gap-4 p-2">
        {rowItems.map((item, colIndex) => (
          <div
            key={item.id}
            style={{ width: itemWidth }}
            className="flex-shrink-0"
          >
            {renderItem(item, startIndex + colIndex)}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} className="h-40 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-0">
        <List
          ref={listRef}
          height={containerHeight}
          itemCount={rowCount}
          itemSize={itemHeight + 16} // Add padding
        >
          {Row}
        </List>
      </CardContent>
    </Card>
  );
}