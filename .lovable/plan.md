# Real-Time Visitor Push Notifications - Implementation Complete

## Summary
Admin users can now receive real-time push notifications on their phones when customers visit the website. The system captures visitor location (via IP geolocation), device type, browser, referrer source, and customer email if authenticated.

## Components Built

### Database Tables
- `push_subscriptions` - Stores Web Push subscription endpoints per admin device
- `admin_notification_preferences` - Stores notification preferences (visitor/quote/payment alerts, quiet hours)

### Edge Functions
- `track-visitor` - Logs page visits to analytics_events and triggers push notifications
- `send-push-notification` - Sends Web Push notifications to subscribed admin devices

### Frontend Hooks
- `useVisitorTracking` - Tracks visitor page views (runs on every non-admin route change)
- `usePushSubscription` - Manages browser push subscription lifecycle

### Admin UI
- `NotificationPreferencesPanel` - Settings panel to enable/disable push and configure alert preferences

## Secrets Required
The following secrets must be configured in Supabase:
- `VAPID_PUBLIC_KEY` - Public key for Web Push
- `VAPID_PRIVATE_KEY` - Private key for signing push messages
- `VAPID_SUBJECT` - Contact email (mailto:soultrainseatery@gmail.com)

The public key must also be added to `.env` as `VITE_VAPID_PUBLIC_KEY` for the frontend.

## How It Works

1. **Visitor arrives** → `useVisitorTracking` hook fires
2. **Hook calls** `track-visitor` edge function with path, referrer, session ID
3. **Edge function**:
   - Parses user agent for device/browser/OS
   - Gets geolocation from IP via ip-api.com
   - Logs to `analytics_events` table
   - Checks `admin_notification_preferences` for admins who want visitor alerts
   - Calls `send-push-notification` with formatted message
4. **Push notification** sent to all subscribed admin devices

## Rate Limiting
- Same session only triggers push on first visit or significant pages (quote/estimate)
- Minimum 2 seconds between tracking calls
- Quiet hours respected (no notifications during configured times)

## iOS Limitations
- Requires iOS 16.4+ and PWA installed to home screen
- User must grant notification permission from installed app
