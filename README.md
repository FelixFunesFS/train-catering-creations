# Soul Train's Eatery — Catering Management Platform

A full-stack catering management platform for Soul Train's Eatery, Charleston's trusted partner for weddings, graduations, military functions, corporate events, and social gatherings.

## Overview

This application serves both the **customer-facing website** (quote requests, estimate review, payments) and the **admin dashboard** (event management, billing, staff scheduling). Built as a single-page React application with a Supabase backend.

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend:** Supabase (PostgreSQL, Edge Functions, Auth, Storage)
- **Payments:** Stripe Checkout with webhook processing
- **Email:** Gmail SMTP via Edge Functions

## Key Features

- **Customer Portal:** Token-based estimate review, approval, change requests, and Stripe payments
- **Admin Dashboard:** Event lifecycle management, estimate generation, payment tracking, staff assignments
- **Automated Workflows:** Cron-driven reminders, overdue detection, event completion
- **Staff View:** Read-only event schedule with iCal subscription

## Development

```sh
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm i
npm run dev
```

## Documentation

See the `docs/` directory for detailed guides:

- `ADMIN_GUIDE.md` — Dashboard usage and daily workflows
- `DEPLOYMENT_CHECKLIST.md` — Production deployment steps
- `EDGE_FUNCTION_MONITORING.md` — Edge function health checks
- `FLOATING_CARDS.md` — Floating card UI system
- `PAYMENT_TESTING_GUIDE.md` — Stripe payment testing
- `STATUS_TRANSITION_MATRIX.md` — Event/invoice status flows
- `WORKFLOW_DIAGRAMS.md` — System workflow visualizations

## Contact

- **Phone:** (843) 970-0265
- **Email:** soultrainseatery@gmail.com
- **Website:** www.soultrainseatery.com
- **Service Area:** Charleston's Lowcountry and surrounding areas

## Lovable

Built with [Lovable](https://lovable.dev/projects/c4c8d2d1-63da-4772-a95b-bf211f87a132).
