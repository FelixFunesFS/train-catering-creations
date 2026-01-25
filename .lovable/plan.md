
# Remove Facebook Token Integration

## Overview

This plan removes the Facebook reviews integration entirely since the access token has expired. The testimonials carousel will continue to work with the curated testimonials only.

---

## Files to Delete

### 1. Edge Function
**supabase/functions/facebook-reviews/index.ts**
- Delete the entire edge function folder

### 2. React Hook
**src/hooks/useFacebookReviews.tsx**
- Delete this hook file entirely

---

## Files to Modify

### 1. supabase/config.toml
Remove the facebook-reviews function configuration (lines 124-126):
```toml
# External Integrations
[functions.facebook-reviews]
verify_jwt = false
```

### 2. src/components/home/TestimonialsCarousel.tsx
- Remove the import for `useFacebookReviews`
- Remove the hook call and Facebook reviews fetching logic
- Remove the Facebook testimonials array conversion
- Remove the merge of Facebook reviews into the testimonials array
- Remove the Facebook icon and badge display logic for Facebook reviews
- The component will use only the curated testimonials array

---

## Secrets to Remove (Manual Step)

After the code changes, the following Supabase secrets should be removed via the Supabase Dashboard:
- `FACEBOOK_ACCESS_TOKEN`
- `FACEBOOK_PAGE_ID`

---

## What Stays Unchanged

The following Facebook-related items are NOT part of the reviews integration and will remain:
- **Footer.tsx**: Facebook social media icon/link (social presence link)
- **Reviews.tsx**: Facebook icon and "Verified on Facebook" link (social proof link)
- **send-event-followup**: Facebook review button in follow-up emails (encourages customers to leave reviews)
- **FinalStep.tsx**: "Social Media (Facebook, Instagram, etc.)" as a referral source option
- **formatters.ts**: "Facebook" as a display label for referral sources

These are all static links to the Facebook page, not API integrations.

---

## Summary of Changes

| Item | Action |
|------|--------|
| `supabase/functions/facebook-reviews/` | Delete folder |
| `src/hooks/useFacebookReviews.tsx` | Delete file |
| `supabase/config.toml` | Remove function config |
| `TestimonialsCarousel.tsx` | Remove Facebook integration code |
| Supabase Secrets | User removes manually via Dashboard |

---

## Technical Details

### TestimonialsCarousel Changes

The component currently:
1. Imports `useFacebookReviews` hook
2. Calls the hook to fetch Facebook reviews
3. Converts Facebook reviews to testimonial format
4. Merges with curated testimonials

After changes:
1. No Facebook imports
2. Uses only the `curatedTestimonials` array
3. Simpler, faster loading (no API call)
4. No Facebook badge/icon rendering needed

### Edge Function Cleanup

The `facebook-reviews` edge function will be deleted using the delete_edge_functions tool, which removes it from both the codebase and the deployed Supabase project.
