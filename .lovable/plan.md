

## Fix: Force Browsers to Load Latest Code After Publishing

### Problem

The auth fixes (timeouts, auto-redirect) are working perfectly in the preview build. The production site at soultrainseatery.com/admin still shows a black screen because **the browser is caching the old `index.html`** which references old JavaScript bundles without the fixes.

Even restarting the computer does not clear browser HTTP cache for previously visited sites. The old `index.html` keeps loading old JS.

### Changes

#### 1. `index.html` -- Add cache-control meta tags

Add HTTP cache-control meta tags inside `<head>` to tell browsers not to cache the HTML document. This only affects the HTML file itself -- the hashed JS/CSS bundles remain efficiently cached.

```html
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
<meta http-equiv="Pragma" content="no-cache" />
<meta http-equiv="Expires" content="0" />
```

#### 2. `public/sw-push.js` -- Add SKIP_WAITING handler

Add a `message` event listener so the service worker can be told to activate immediately when a new version is available, instead of waiting for all tabs to close.

```javascript
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
```

#### 3. `src/App.tsx` -- Add service worker update check

On app mount, check if a newer service worker is available. If one is found, tell it to activate and reload the page once. This ensures users always get the latest code within seconds of a publish.

```typescript
useEffect(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(reg => {
        reg.update();
        if (reg.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
          window.location.reload();
        }
      });
    });
  }
}, []);
```

### Why This Fixes It For Good

| Problem | Solution |
|---|---|
| Browser caches `index.html` with old JS references | `no-cache` meta tags force fresh HTML fetch every visit |
| Service worker serves stale assets from cache | `skipWaiting()` activates new SW immediately |
| User sees old code even after publish | App checks for SW updates on mount and reloads once if needed |

### Immediate Action (Before Publishing)

To verify the fix is already deployed, open an **Incognito/Private** browser window and navigate to `soultrainseatery.com/admin`. If it redirects to the login page, the published code is correct and only your regular browser cache is stale. A hard refresh (`Ctrl+Shift+R` / `Cmd+Shift+R`) will also force the latest code.

