
# Comprehensive CTA Optimization & Site-Wide Standardization Plan

## Overview

This plan addresses four key areas:
1. **About Page**: Move "Family Bridge" visual to Hero section, remove standalone section
2. **FAQ Page**: Consolidate "Still Hungry for Answers?" with bottom CTA, add "Text Us" secondary button
3. **CTA Standardization**: Ensure all pages use `cta` (primary) and `cta-white` (secondary) consistently
4. **Cleanup**: Remove redundant code and unused imports

---

## Part 1: About Page Hero Enhancement

### Current State
- Lines 85-117: Hero section with `aboutHeroBg` background image
- Lines 295-336: Separate "Family Bridge" section with `teamWesternGroup` background

### Changes

**A. Integrate Family Bridge into Hero**

Replace the current hero background (`aboutHeroBg`) with the `teamWesternGroup` image to create a stronger emotional connection on page entry.

**Modified Hero Section (Lines 85-117):**
```tsx
{/* Header Section - With Team Group Background Image */}
<section className="relative py-12 sm:py-16 lg:py-20 overflow-hidden">
  {/* Background image - now using team western group */}
  <div 
    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
    style={{ backgroundImage: `url(${teamWesternGroup})` }}
    aria-hidden="true"
  />
  
  {/* Overlay for readability - keeping 85% standard */}
  <div className="absolute inset-0 bg-background/85" />
  
  {/* Top gradient fade */}
  <div className="absolute top-0 left-0 right-0 h-16 sm:h-20 lg:h-24 bg-gradient-to-b from-background to-transparent z-10" />
  
  {/* Bottom gradient fade */}
  <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 lg:h-24 bg-gradient-to-t from-background to-transparent z-10" />
  
  <div className="relative z-20">
    <PageHeader
      badge={{
        icon: <Heart className="h-5 w-5" />,
        text: "Our Story"
      }}
      title="Meet the Heart Behind Soul Train's Eatery"
      subtitle="A Family Legacy of Flavor"
      description="From family traditions to professional excellence, discover the passionate team that brings authentic Southern flavors and warm hospitality to every event across Charleston's beautiful Lowcountry."
      buttons={[
        { text: "Request Quote", href: "/request-quote#page-header", variant: "cta" }
      ]}
      animated={true}
    />
  </div>
</section>
```

**B. Remove Family Bridge Section**

Delete lines 70-76 (animation hook) and lines 295-336 (the entire Family Bridge section).

**C. Cleanup Imports**

Remove unused imports:
- `aboutHeroBg` (no longer used)
- `Camera` icon (no longer needed)

---

## Part 2: FAQ Page Streamlining

### Current State
- Lines 132-133: `FAQVisualBreak` component ("Still Hungry for Answers?")
- Lines 135-179: Separate CTA section ("Still Have Questions?") with 3 buttons

### Changes

**A. Modify FAQVisualBreak Component**

Update `src/components/faq/FAQVisualBreak.tsx` to include contact buttons and serve as the final CTA:

```tsx
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageCircle, Phone } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import buffetWingsOutdoor from "@/assets/gallery/buffet-wings-outdoor.jpg";

export const FAQVisualBreak = () => {
  const { ref, isVisible, variant } = useScrollAnimation({
    delay: 0,
    variant: "scale-fade",
    mobile: { variant: "fade-up", delay: 0 },
    desktop: { variant: "scale-fade", delay: 0 },
  });

  return (
    <section 
      ref={ref}
      className={`relative w-full overflow-hidden ${useAnimationClass(variant, isVisible)}`}
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${buffetWingsOutdoor})` }}
      />
      
      {/* White Overlay - 85% per design standards */}
      <div className="absolute inset-0 bg-background/85" />
      
      {/* Top Gradient Fade */}
      <div className="absolute top-0 left-0 right-0 h-16 sm:h-20 lg:h-24 bg-gradient-to-b from-background to-transparent z-10" />
      
      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 lg:h-24 bg-gradient-to-t from-background to-transparent z-10" />
      
      {/* Content */}
      <div className="relative z-20 py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-ruby font-script text-lg sm:text-xl mb-2">
            We're Here to Help
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-elegant font-bold text-foreground mb-4">
            Still Have Questions?
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg mb-8 max-w-2xl mx-auto">
            Our team is ready to help with personalized answers. Reach out directly 
            and let us assist with your catering needs.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild variant="cta" size="responsive-lg">
              <Link to="/request-quote#page-header" className="flex items-center gap-2">
                Request Quote
              </Link>
            </Button>
            <Button asChild variant="cta-white" size="responsive-lg">
              <a href="sms:8439700265" className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Text Us
              </a>
            </Button>
          </div>
          
          {/* Secondary Contact */}
          <p className="text-muted-foreground/80 mt-6 text-sm">
            Or call us directly at{" "}
            <a href="tel:8439700265" className="text-primary hover:underline font-medium">
              (843) 970-0265
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};
```

**B. Remove Bottom CTA Section from FAQ Page**

In `src/pages/FAQ.tsx`:
- Delete lines 34-39 (ctaRef animation hook)
- Delete lines 135-179 (entire Contact CTA PageSection)
- Remove unused imports: `Phone`, `Mail`, `MessageCircle`

---

## Part 3: CTA Button Standardization

### Audit Results

| Page/Component | Current Primary | Current Secondary | Issue |
|---------------|-----------------|-------------------|-------|
| Home CTA | `cta` (Text) | `cta-white` (Quote) | Correct |
| Menu CTA | `cta-white` (Quote) | `cta-white` (Call) | Both same variant |
| Gallery CTA | `cta` (Quote) | `cta-white` (Call) | Correct |
| Reviews CTA | `cta` (Quote) | `cta-white` (Call) | Correct |
| About CTA | `cta` (Quote) | `cta-white` (Menu) | Correct |
| FAQ (new) | `cta` (Quote) | `cta-white` (Text) | Will be correct |

### Required Fix: MenuCTASection

**File:** `src/components/menu/MenuCTASection.tsx`

Change primary button from `cta-white` to `cta`:

```tsx
<div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">
  <Button asChild variant="cta" size="responsive-lg">
    <Link to="/request-quote#page-header">Request a Free Quote</Link>
  </Button>
  <Button 
    asChild 
    variant="cta-white" 
    size="responsive-lg"
  >
    <a href="tel:8439700265">Call (843) 970-0265</a>
  </Button>
</div>
```

---

## Part 4: Visual Summary

```text
ABOUT PAGE (After Changes):
┌──────────────────────────────────────┐
│  HERO (Team Group Photo Background)  │  ← Now using teamWesternGroup
│  85% white overlay + gradient fades   │
│  "Meet the Heart Behind..."           │
│  [Request Quote]                      │
├──────────────────────────────────────┤
│           [Our Story]                 │
├──────────────────────────────────────┤
│           [Meet Our Team]             │
├──────────────────────────────────────┤
│           [Our Values]                │
├──────────────────────────────────────┤
│  ┌────────────────────────────────┐  │
│  │   Standard Crimson CTA Card    │  │  ← Unchanged
│  │  [Request Quote] [View Menu]   │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘


FAQ PAGE (After Changes):
┌──────────────────────────────────────┐
│           [Header Section]            │
├──────────────────────────────────────┤
│         [Search + Filters]            │
├──────────────────────────────────────┤
│         [FAQ Accordion]               │
├──────────────────────────────────────┤
│  ╔════════════════════════════════╗  │
│  ║  Visual Break / Final CTA       ║  │  ← Consolidated
│  ║  "Still Have Questions?"        ║  │
│  ║  [Request Quote] [Text Us]      ║  │
│  ║  Or call us at (843) 970-0265   ║  │
│  ╚════════════════════════════════╝  │
└──────────────────────────────────────┘
         ↑ REMOVED: Separate bottom CTA


MENU PAGE (After Fix):
┌──────────────────────────────────────┐
│  ┌────────────────────────────────┐  │
│  │    Crimson CTA Card            │  │
│  │  [Request Quote] [Call Now]    │  │
│  │       ↑ cta         ↑ cta-white│  │  ← Fixed variants
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/About.tsx` | Replace Hero background with teamWesternGroup, remove Family Bridge section, cleanup imports |
| `src/components/faq/FAQVisualBreak.tsx` | Add CTA buttons (Quote + Text Us), update messaging |
| `src/pages/FAQ.tsx` | Remove bottom CTA section, cleanup unused imports/hooks |
| `src/components/menu/MenuCTASection.tsx` | Change primary button to `cta` variant |

---

## CTA Variant Standard (Reference)

For all future CTAs:
- **Primary Action** (`cta`): Ruby gradient background, white text, shadow glow
- **Secondary Action** (`cta-white`): White background, navy text, subtle shadow

### Recommended Button Order by Action Type

| Action Type | Best For | Protocol |
|-------------|----------|----------|
| Request Quote | Primary conversion | Link to /request-quote |
| Text Us | Low-friction contact | sms:8439700265 |
| Call Now | Urgent/immediate | tel:8439700265 |
| Email Us | Detailed inquiries | mailto:email |

**Why "Text Us" for FAQ secondary?** 
- Low friction for quick follow-up questions
- Matches mobile-first behavior patterns
- Less commitment than a full quote form
- More immediate than email

---

## Technical Notes

1. **Animation Cleanup**: The `familyBridgeRef` animation hook in About.tsx will be removed since the section is deleted
2. **Import Cleanup**: Remove `Camera` from About.tsx, remove `Phone`, `Mail`, `MessageCircle` from FAQ.tsx
3. **Responsive**: All buttons use `responsive-lg` size for consistent mobile touch targets
4. **Accessibility**: Phone link in FAQ Visual Break uses semantic text with tel: protocol as secondary option
