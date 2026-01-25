

# Unified Service Cards with Description on Mobile

## Overview
Update the Service Categories Section to:
1. Show descriptions on mobile (currently hidden)
2. Remove per-card CTAs on desktop/tablet
3. Add a single section-level "Get Your Quote" CTA for all viewports
4. Link to `/request-quote` (selector page) so users can choose wedding or regular

## Visual Layout

### Mobile View
```text
+-----------------------------+
|  [Image]                    |
|  Wedding Catering           |
|  Your Dream Day             |
|  Charleston's premier...    |  <-- Description now visible
+-----------------------------+

+-----------------------------+
|  [Image]                    |
|  Corporate Events           |
|  Professional Excellence    |
|  Impress clients and...     |  <-- Description now visible
+-----------------------------+

+-----------------------------+
|  [Image]                    |
|  Family Gatherings          |
|  Comfort & Joy              |
|  Bring families together... |  <-- Description now visible
+-----------------------------+

      [ Get Your Quote -> ]     <-- Single CTA for all
```

### Desktop/Tablet View
```text
+-------------+  +-------------+  +-------------+
|  Wedding    |  |  Corporate  |  |  Family     |
|  [desc]     |  |  [desc]     |  |  [desc]     |
|  [features] |  |  [features] |  |  [features] |
|  (no CTA)   |  |  (no CTA)   |  |  (no CTA)   |
+-------------+  +-------------+  +-------------+

            [ Get Your Quote -> ]
            (single section CTA)
```

## Changes

### File: `src/components/home/ServiceCategoriesSection.tsx`

**Step 1: Update mobile conditional to show description**

Replace the mobile conditional block (lines 137-167):

Before:
```tsx
{isMobileOnly ? null : (
  /* Desktop/Tablet - Always visible content */
  <>
    <p className="text-base text-muted-foreground leading-relaxed">
      {service.description}
    </p>
    {/* Features */}
    ...
    {/* CTA Button */}
    <Button variant="cta-outline" ...>
      ...
    </Button>
  </>
)}
```

After:
```tsx
{/* Description - visible on all viewports */}
<p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
  {service.description}
</p>

{/* Features - Desktop/Tablet only (hidden on mobile) */}
{!isMobileOnly && (
  <div className="space-y-2">
    {service.features.map((feature, featureIndex) => (
      <div key={featureIndex} className="flex items-center space-x-2">
        <CircleCheck className="h-4 w-4 text-ruby" />
        <span className="text-sm text-muted-foreground">{feature}</span>
      </div>
    ))}
  </div>
)}
```

**Step 2: Update section CTA to show on all viewports**

Replace the mobile-only CTA (lines 231-241):

Before:
```tsx
{/* Mobile-only Section CTA */}
{isMobileOnly && (
  <div className="flex justify-center mt-6">
    <Button variant="cta" size="responsive-md" asChild>
      <a href="/request-quote/regular" className="flex items-center gap-2">
        ...
      </a>
    </Button>
  </div>
)}
```

After:
```tsx
{/* Section CTA - all viewports */}
<div className="flex justify-center mt-6 sm:mt-8">
  <Button variant="cta" size="responsive-md" asChild>
    <a href="/request-quote" className="flex items-center gap-2">
      <span>Get Your Quote</span>
      <ArrowRight className="h-4 w-4" />
    </a>
  </Button>
</div>
```

**Step 3: Clean up unused href property (optional)**

The `href` property in the `serviceCategories` array is no longer used and can be removed for cleanliness:

```tsx
// Remove href from each service object
{
  icon: <Heart className="h-6 w-6" />,
  title: "Wedding Catering",
  subtitle: "Your Dream Day",
  description: "...",
  image: weddingCatering,
  features: [...],
  // href: "/request-quote/wedding",  <-- Remove
  isPopular: true
}
```

Also update the interface:
```tsx
interface ServiceCategory {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  features: string[];
  // href: string;  <-- Remove
  isPopular?: boolean;
}
```

## Summary of Content by Viewport

| Element | Mobile | Tablet/Desktop |
|---------|--------|----------------|
| Image | Yes | Yes |
| Title | Yes | Yes |
| Subtitle | Yes | Yes |
| Description | Yes (new!) | Yes |
| Features | No | Yes |
| Per-card CTA | No | No (removed) |
| Section CTA | Yes | Yes (new!) |

## Benefits

- Descriptions provide context on mobile without excessive length
- Features hidden on mobile to manage scroll depth
- Single CTA eliminates redundancy (3 buttons to 1)
- Links to `/request-quote` selector page for user choice
- Consistent conversion path across all devices

