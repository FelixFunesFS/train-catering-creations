import { useState, useEffect, ReactNode } from "react";
import { Loader2, Wifi, WifiOff, Signal } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";

interface ProgressiveContentLoaderProps {
  children: ReactNode;
}

interface ConnectionInfo {
  speed: 'slow' | 'medium' | 'fast';
  type: 'wifi' | 'cellular' | 'unknown';
  online: boolean;
}

export const ProgressiveContentLoader = ({ children }: ProgressiveContentLoaderProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo>({
    speed: 'medium',
    type: 'unknown',
    online: navigator.onLine
  });
  const [adaptiveQuality, setAdaptiveQuality] = useState<'high' | 'medium' | 'low'>('high');
  const [preloadedContent, setPreloadedContent] = useState<string[]>([]);

  const { ref, isVisible } = useScrollAnimation({ 
    variant: 'fade-up',
    threshold: 0.1
  });
  const animationClass = useAnimationClass('fade-up', isVisible);

  // Detect connection quality
  useEffect(() => {
    const updateConnectionInfo = () => {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      
      if (connection) {
        let speed: 'slow' | 'medium' | 'fast' = 'medium';
        
        // Determine speed based on effective connection type
        if (connection.effectiveType) {
          switch (connection.effectiveType) {
            case 'slow-2g':
            case '2g':
              speed = 'slow';
              break;
            case '3g':
              speed = 'medium';
              break;
            case '4g':
            case '5g':
              speed = 'fast';
              break;
          }
        }

        // Determine connection type
        const type = connection.type === 'wifi' ? 'wifi' : 'cellular';

        setConnectionInfo({
          speed,
          type,
          online: navigator.onLine
        });

        // Set adaptive quality based on connection
        if (speed === 'slow') {
          setAdaptiveQuality('low');
        } else if (speed === 'medium') {
          setAdaptiveQuality('medium');
        } else {
          setAdaptiveQuality('high');
        }
      }
    };

    updateConnectionInfo();

    // Listen for connection changes
    window.addEventListener('online', updateConnectionInfo);
    window.addEventListener('offline', updateConnectionInfo);

    return () => {
      window.removeEventListener('online', updateConnectionInfo);
      window.removeEventListener('offline', updateConnectionInfo);
    };
  }, []);

  // Progressive loading simulation
  useEffect(() => {
    const criticalResources = [
      'hero-images',
      'navigation',
      'core-styles',
      'interaction-handlers'
    ];

    const secondaryResources = [
      'gallery-preview',
      'testimonials',
      'additional-images',
      'animations'
    ];

    const loadResource = (resource: string, delay: number) => {
      return new Promise(resolve => {
        setTimeout(() => {
          setPreloadedContent(prev => [...prev, resource]);
          resolve(resource);
        }, delay);
      });
    };

    const loadResources = async () => {
      // Load critical resources first
      const criticalPromises = criticalResources.map((resource, index) => 
        loadResource(resource, (index + 1) * 200)
      );

      // Update progress as critical resources load
      for (let i = 0; i < criticalResources.length; i++) {
        await criticalPromises[i];
        setLoadingProgress((i + 1) * (60 / criticalResources.length));
      }

      // Load secondary resources based on connection quality
      const secondaryDelay = connectionInfo.speed === 'slow' ? 500 : connectionInfo.speed === 'medium' ? 300 : 100;
      
      const secondaryPromises = secondaryResources.map((resource, index) => 
        loadResource(resource, index * secondaryDelay)
      );

      // Update progress as secondary resources load
      for (let i = 0; i < secondaryResources.length; i++) {
        await secondaryPromises[i];
        setLoadingProgress(60 + (i + 1) * (40 / secondaryResources.length));
      }

      // Final loading complete
      setTimeout(() => {
        setLoadingProgress(100);
        setTimeout(() => setIsLoading(false), 300);
      }, 200);
    };

    loadResources();
  }, [connectionInfo]);

  // Service Worker registration for offline support
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered:', registration);
        })
        .catch(error => {
          console.log('SW registration failed:', error);
        });
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-muted/20">
        <div className="text-center space-y-6 max-w-md mx-auto p-6">
          {/* Loading Animation */}
          <div className="relative">
            <div className="w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-muted rounded-full"></div>
              <div 
                className="absolute inset-0 border-4 border-primary rounded-full border-r-transparent animate-spin"
                style={{
                  animationDuration: connectionInfo.speed === 'slow' ? '2s' : connectionInfo.speed === 'medium' ? '1.5s' : '1s'
                }}
              ></div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-muted/30 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-300 ease-out"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>

          {/* Loading Text */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">
              Preparing Your Experience
            </h2>
            <p className="text-sm text-muted-foreground">
              {loadingProgress < 30 && "Loading essential content..."}
              {loadingProgress >= 30 && loadingProgress < 70 && "Optimizing for your connection..."}
              {loadingProgress >= 70 && "Almost ready..."}
            </p>
          </div>

          {/* Connection Status */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            {connectionInfo.online ? (
              <>
                {connectionInfo.type === 'wifi' ? <Wifi className="h-4 w-4" /> : <Signal className="h-4 w-4" />}
                <span>
                  {connectionInfo.speed === 'fast' && 'High-speed connection'}
                  {connectionInfo.speed === 'medium' && 'Standard connection'}
                  {connectionInfo.speed === 'slow' && 'Optimizing for slower connection'}
                </span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4" />
                <span>Offline mode - Loading cached content</span>
              </>
            )}
          </div>

          {/* Loaded Resources Indicator */}
          <div className="text-xs text-muted-foreground">
            <div className="flex flex-wrap gap-1 justify-center">
              {preloadedContent.map((resource, index) => (
                <span 
                  key={resource}
                  className="inline-block w-2 h-2 bg-primary/60 rounded-full animate-pulse"
                  style={{ animationDelay: `${index * 100}ms` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={ref}
      className={`progressive-content ${animationClass}`}
      data-quality={adaptiveQuality}
      data-connection={connectionInfo.speed}
    >
      {/* Quality Indicator (Development/Debug) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 z-50 bg-background/90 backdrop-blur-sm border border-border rounded-lg p-2 text-xs">
          <div>Quality: {adaptiveQuality}</div>
          <div>Connection: {connectionInfo.speed}</div>
          <div>Type: {connectionInfo.type}</div>
          <div>Online: {connectionInfo.online ? 'Yes' : 'No'}</div>
        </div>
      )}

      {children}

      <style>{`
        .progressive-content[data-quality="low"] img {
          filter: contrast(0.9) brightness(0.95);
        }
        
        .progressive-content[data-quality="medium"] img {
          filter: contrast(1) brightness(1);
        }
        
        .progressive-content[data-quality="high"] img {
          filter: contrast(1.05) brightness(1.02) saturate(1.1);
        }

        .progressive-content[data-connection="slow"] * {
          animation-duration: 0.8s !important;
          transition-duration: 0.4s !important;
        }

        .progressive-content[data-connection="fast"] * {
          animation-duration: 0.3s !important;
          transition-duration: 0.2s !important;
        }
      `}</style>
    </div>
  );
};