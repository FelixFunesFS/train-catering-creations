import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Adds "install as app" tags ONLY on admin/staff pages, so customers and
 * public visitors saving a page to their home screen get a normal bookmark.
 */
export function useAdminAppManifest() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin') || pathname === '/staff';

  useEffect(() => {
    if (!isAdmin) return;
    const added: HTMLElement[] = [];
    const add = (tag: 'link' | 'meta', attrs: Record<string, string>) => {
      const el = document.createElement(tag);
      Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
      el.setAttribute('data-admin-app', 'true');
      document.head.appendChild(el);
      added.push(el);
    };
    add('link', { rel: 'manifest', href: '/manifest-admin.json' });
    add('meta', { name: 'apple-mobile-web-app-capable', content: 'yes' });
    add('meta', { name: 'mobile-web-app-capable', content: 'yes' });
    add('meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'default' });

    const titleMeta = document.querySelector('meta[name="apple-mobile-web-app-title"]');
    const prevTitle = titleMeta?.getAttribute('content');
    titleMeta?.setAttribute('content', "ST Admin");

    return () => {
      added.forEach((el) => el.remove());
      if (titleMeta && prevTitle) titleMeta.setAttribute('content', prevTitle);
    };
  }, [isAdmin]);
}
