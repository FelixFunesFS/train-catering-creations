import React, { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Home, 
  ChevronRight,
  ExternalLink,
  Bookmark,
  Clock,
  Pin,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCachePreloader } from '@/hooks/useOptimisticQuery';

interface BreadcrumbItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface QuickAction {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  description?: string;
  badge?: string;
  external?: boolean;
}

interface RecentItem {
  id: string;
  label: string;
  href: string;
  type: string;
  timestamp: string;
  icon?: React.ReactNode;
}

interface NavigationContextProps {
  breadcrumbs?: BreadcrumbItem[];
  quickActions?: QuickAction[];
  recentItems?: RecentItem[];
  pinnedItems?: string[];
  onPin?: (href: string) => void;
  onUnpin?: (href: string) => void;
  showBackButton?: boolean;
  title?: string;
  subtitle?: string;
}

export function NavigationContext({
  breadcrumbs = [],
  quickActions = [],
  recentItems = [],
  pinnedItems = [],
  onPin,
  onUnpin,
  showBackButton = true,
  title,
  subtitle
}: NavigationContextProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { preloadQuery } = useCachePreloader();
  
  const [isPreloading, setIsPreloading] = useState<string | null>(null);

  // Handle navigation with preloading
  const handleNavigate = useCallback(async (href: string, external = false) => {
    if (external) {
      window.open(href, '_blank');
      return;
    }

    setIsPreloading(href);
    
    try {
      // Preload common queries for the target route
      if (href.includes('/admin/quotes')) {
        await preloadQuery(['quotes'], async () => {
          // Preload quotes data
          return [];
        });
      } else if (href.includes('/admin/invoices')) {
        await preloadQuery(['invoices'], async () => {
          // Preload invoices data
          return [];
        });
      }
    } catch (error) {
      console.error('Preloading failed:', error);
    } finally {
      setIsPreloading(null);
    }

    navigate(href);
  }, [navigate, preloadQuery]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/admin');
    }
  }, [navigate]);

  // Toggle pin status
  const handleTogglePin = useCallback((href: string) => {
    const isPinned = pinnedItems.includes(href);
    if (isPinned) {
      onUnpin?.(href);
    } else {
      onPin?.(href);
    }
  }, [pinnedItems, onPin, onUnpin]);

  const isPinned = (href: string) => pinnedItems.includes(href);

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            )}
            
            {title && (
              <div>
                <h1 className="text-2xl font-bold">{title}</h1>
                {subtitle && (
                  <p className="text-muted-foreground text-sm">{subtitle}</p>
                )}
              </div>
            )}
          </div>

          {location.pathname !== '/admin' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTogglePin(location.pathname)}
              className="flex items-center gap-2"
            >
              {isPinned(location.pathname) ? (
                <>
                  <Pin className="h-4 w-4 fill-current" />
                  Unpin
                </>
              ) : (
                <>
                  <Pin className="h-4 w-4" />
                  Pin
                </>
              )}
            </Button>
          )}
        </div>

        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigate('/admin')}
              className="h-auto p-1 flex items-center gap-1"
            >
              <Home className="h-3 w-3" />
              Dashboard
            </Button>
            
            {breadcrumbs.map((item, index) => (
              <React.Fragment key={item.href}>
                <ChevronRight className="h-3 w-3" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigate(item.href)}
                  className={cn(
                    "h-auto p-1 flex items-center gap-1",
                    index === breadcrumbs.length - 1 && "text-foreground font-medium"
                  )}
                  disabled={isPreloading === item.href}
                >
                  {item.icon}
                  {item.label}
                </Button>
              </React.Fragment>
            ))}
          </nav>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          {quickActions.length > 0 && (
            <div>
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Star className="h-4 w-4" />
                Quick Actions
              </h3>
              <div className="space-y-2">
                {quickActions.map((action) => (
                  <Button
                    key={action.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleNavigate(action.href, action.external)}
                    disabled={isPreloading === action.href}
                    className="w-full justify-start h-auto p-3"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex items-center gap-2">
                        {action.icon}
                        <span className="font-medium">{action.label}</span>
                        {action.external && <ExternalLink className="h-3 w-3" />}
                      </div>
                      
                      <div className="ml-auto flex items-center gap-2">
                        {action.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {action.badge}
                          </Badge>
                        )}
                        {isPinned(action.href) && (
                          <Pin className="h-3 w-3 fill-current text-primary" />
                        )}
                      </div>
                    </div>
                    
                    {action.description && (
                      <p className="text-xs text-muted-foreground mt-1 w-full text-left">
                        {action.description}
                      </p>
                    )}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Recent Items */}
          {recentItems.length > 0 && (
            <div>
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Recent
              </h3>
              <div className="space-y-2">
                {recentItems.slice(0, 5).map((item) => (
                  <Button
                    key={item.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleNavigate(item.href)}
                    disabled={isPreloading === item.href}
                    className="w-full justify-start h-auto p-3"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex items-center gap-2">
                        {item.icon}
                        <div className="text-left">
                          <div className="font-medium">{item.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {item.type} • {item.timestamp}
                          </div>
                        </div>
                      </div>
                      
                      {isPinned(item.href) && (
                        <Pin className="h-3 w-3 fill-current text-primary ml-auto" />
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Pinned Items */}
          {pinnedItems.length > 0 && (
            <div>
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Bookmark className="h-4 w-4" />
                Pinned
              </h3>
              <div className="space-y-2">
                {pinnedItems.slice(0, 5).map((href) => (
                  <Button
                    key={href}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleNavigate(href)}
                    disabled={isPreloading === href}
                    className="w-full justify-start h-auto p-3"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <Pin className="h-4 w-4 fill-current text-primary" />
                      <span className="font-medium">
                        {href.split('/').pop()?.replace('-', ' ') || 'Page'}
                      </span>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTogglePin(href);
                        }}
                        className="ml-auto h-6 w-6 p-0"
                      >
                        <Pin className="h-3 w-3" />
                      </Button>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Hook for managing navigation state
export function useNavigationContext() {
  const [pinnedItems, setPinnedItems] = useState<string[]>(() => {
    const saved = localStorage.getItem('navigation-pinned-items');
    return saved ? JSON.parse(saved) : [];
  });

  const [recentItems, setRecentItems] = useState<RecentItem[]>(() => {
    const saved = localStorage.getItem('navigation-recent-items');
    return saved ? JSON.parse(saved) : [];
  });

  const addRecentItem = useCallback((item: RecentItem) => {
    setRecentItems(prev => {
      const filtered = prev.filter(existing => existing.href !== item.href);
      const updated = [item, ...filtered].slice(0, 10);
      localStorage.setItem('navigation-recent-items', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const pinItem = useCallback((href: string) => {
    setPinnedItems(prev => {
      if (prev.includes(href)) return prev;
      const updated = [...prev, href];
      localStorage.setItem('navigation-pinned-items', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const unpinItem = useCallback((href: string) => {
    setPinnedItems(prev => {
      const updated = prev.filter(item => item !== href);
      localStorage.setItem('navigation-pinned-items', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return {
    pinnedItems,
    recentItems,
    addRecentItem,
    pinItem,
    unpinItem
  };
}