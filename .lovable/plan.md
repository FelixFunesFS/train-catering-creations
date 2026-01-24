

# Gallery Page Branded Header Update

## Overview

Update the gallery page's "Family Story" section to use the branded badge + script subtitle pattern, matching all other pages. The immersive hero remains unchanged as the primary visual element.

---

## Current State Analysis

The gallery page has a unique structure with an immersive photo hero. The **Family Story section** (lines 83-95 in `AlternativeGallery.tsx`) currently uses plain styling without the branded pattern:

```tsx
<h2 className="font-elegant font-bold mb-4">
  From Our Family Kitchen to Your Special Event
</h2>
<p className="text-muted-foreground">
  As a family-run catering company...
</p>
```

---

## Proposed Change

Add the branded badge + script subtitle pattern to the Family Story section:

**File: `src/pages/AlternativeGallery.tsx`**

### Updated Family Story Section (lines 83-95):

```tsx
import { Badge } from "@/components/ui/badge";
import { Camera } from "lucide-react";

// Inside the render (lines 83-95):
<PageSection pattern="b" className="py-8 sm:py-12">
  <div className="max-w-3xl mx-auto text-center px-4">
    {/* NEW: Badge + Icon (matching home page pattern) */}
    <div className="flex items-center justify-center space-x-2 mb-3">
      <Camera className="h-5 w-5 text-ruby" />
      <Badge variant="outline" className="border-ruby text-ruby font-script text-sm">
        Our Gallery
      </Badge>
    </div>
    
    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-elegant font-bold mb-3">
      From Our Family Kitchen to Your Special Event
    </h2>
    
    {/* NEW: Script subtitle */}
    <p className="text-xl sm:text-2xl font-script text-ruby font-medium mb-3">
      Memories in Every Bite
    </p>
    
    <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
      As a family-run catering company rooted in authentic Southern cooking, we take pride in bringing 
      people together around exceptional food. Every event we cater receives the same love and attention 
      we put into feeding our own family.
    </p>
  </div>
</PageSection>
```

---

## Visual Comparison

### Before (Current)
```text
From Our Family Kitchen to Your Special Event

As a family-run catering company...
```

### After (Branded)
```text
    [📷 Our Gallery]              ← NEW badge with icon
    
From Our Family Kitchen to        ← Same elegant title
   Your Special Event
   
  Memories in Every Bite          ← NEW script subtitle

As a family-run catering company...  ← Same description
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/AlternativeGallery.tsx` | Add Badge import, Camera icon, badge markup, script subtitle |

---

## Cleanup: Unused GalleryHeader Component

The `src/components/gallery/GalleryHeader.tsx` file exists but is not used anywhere in the codebase. It can be safely deleted to reduce dead code.

| File | Action |
|------|--------|
| `src/components/gallery/GalleryHeader.tsx` | Delete (unused) |

---

## Technical Notes

- The immersive hero remains unchanged (it's a unique gallery-specific feature)
- Badge styling matches exactly: `border-ruby text-ruby font-script text-sm`
- Script subtitle matches: `font-script text-ruby font-medium`
- Camera icon chosen to match gallery theme (consistent with hero)
- Subtitle "Memories in Every Bite" reinforces the emotional connection to food events

