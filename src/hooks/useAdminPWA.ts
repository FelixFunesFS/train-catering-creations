import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook that dynamically configures PWA behavior for admin routes.
 * 
 * On admin routes:
 * - Swaps manifest to admin-manifest.json (standalone mode)
 * - Injects apple-mobile-web-app-capable meta tag for iOS
 * - Injects apple-mobile-web-app-status-bar-style for iOS styling
 * - Injects mobile-web-app-capable for Android
 * 
 * On non-admin routes:
 * - Uses default manifest.json (browser mode)
 * - Removes PWA meta tags so public site opens in normal browser
 */
export function useAdminPWA() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    const manifestLink = document.querySelector('link[rel="manifest"]');
    
    // Track meta tags we inject so we can clean them up
    const injectedMetaTags: HTMLMetaElement[] = [];

    if (isAdminRoute) {
      // Swap to admin manifest for standalone PWA behavior
      if (manifestLink) {
        manifestLink.setAttribute('href', '/admin-manifest.json');
      }

      // Inject iOS PWA meta tags
      const iosCapable = document.createElement('meta');
      iosCapable.name = 'apple-mobile-web-app-capable';
      iosCapable.content = 'yes';
      document.head.appendChild(iosCapable);
      injectedMetaTags.push(iosCapable);

      const iosStatusBar = document.createElement('meta');
      iosStatusBar.name = 'apple-mobile-web-app-status-bar-style';
      iosStatusBar.content = 'default';
      document.head.appendChild(iosStatusBar);
      injectedMetaTags.push(iosStatusBar);

      // Inject Android PWA meta tag
      const androidCapable = document.createElement('meta');
      androidCapable.name = 'mobile-web-app-capable';
      androidCapable.content = 'yes';
      document.head.appendChild(androidCapable);
      injectedMetaTags.push(androidCapable);
    } else {
      // Use default public manifest (browser mode - no standalone)
      if (manifestLink) {
        manifestLink.setAttribute('href', '/manifest.json');
      }
    }

    // Cleanup: remove injected meta tags when leaving admin routes
    return () => {
      injectedMetaTags.forEach(tag => {
        if (tag.parentNode) {
          tag.parentNode.removeChild(tag);
        }
      });
    };
  }, [isAdminRoute]);
}
