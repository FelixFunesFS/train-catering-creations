

# UX Portfolio Showcase Page

## What We'll Build
A new `/portfolio` route — a clean, standalone page (no admin auth required) that presents your Soul Train's Eatery admin platform as a UX case study with real screenshots and 1-2 sentence descriptions per screen.

## Screenshots to Capture (8 screens)
I'll use the browser to navigate to each view in the live preview, capture screenshots at desktop and mobile sizes, and save them as project assets.

| # | Screen | Description |
|---|--------|-------------|
| 1 | **Events Dashboard** (desktop) | "A status-driven sales pipeline consolidating new submissions, active events, and completed bookings into a single scrollable view with inline filters and date navigation." |
| 2 | **Event Detail / Estimate Builder** | "A full-viewport event workspace with collapsible panels for customer details, menu editing, payment schedules, staff assignments, and a real-time shopping list — eliminating context-switching." |
| 3 | **Billing View** | "Centralized financial tracking with filterable payment status, invoice generation, and Stripe integration for seamless client payments." |
| 4 | **Reports & Analytics** | "Interactive revenue charts, item popularity analysis, and payment breakdowns giving owners instant business intelligence without spreadsheets." |
| 5 | **Staff Schedule** (desktop split) | "A resizable split-panel layout letting managers scan upcoming assignments on the left while reviewing full event details on the right." |
| 6 | **Staff Schedule** (mobile) | "Mobile-first card-based event list with tap-to-expand details, optimized for field staff checking assignments on the go." |
| 7 | **Customer Estimate Portal** | "A branded, public-facing estimate view where clients review line items, approve proposals, and submit payments — no login required." |
| 8 | **Mobile Admin Navigation** | "A fixed bottom tab bar with role-based visibility — admins see 5 tabs (Events, Billing, Reports, Staff, Settings) while staff see only their schedule." |

## Page Structure
- Hero section: project title, your role, brief overview
- Case study narrative: problem → approach → outcome (3 short paragraphs)
- Screenshot gallery: each screen as a card with image + description
- Tech stack badges (React, TypeScript, Supabase, Tailwind, Stripe)
- No authentication required — publicly accessible

## Technical Approach
1. Create `src/pages/Portfolio.tsx` — standalone page with its own layout (no Header/Footer)
2. Add `/portfolio` route in `App.tsx`
3. Use browser tools to capture 8 screenshots from the live preview, save as images in `public/portfolio/`
4. Responsive grid layout: 1 column mobile, 2 columns desktop
5. Light/dark mode support using existing theme system

## Implementation Steps
1. Capture all 8 screenshots via browser automation
2. Create the Portfolio page component
3. Add the route

