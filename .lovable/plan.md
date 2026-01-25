
# Gallery Page Section Consolidation Plan

## Current Structure

```text
┌─────────────────────────────────────────────────┐
│ ImmersiveMobileHero (full-bleed rotating hero)  │
├─────────────────────────────────────────────────┤
│ Brand Intro Section                             │
│   "From Our Family Kitchen to Your Special Event"│
│   + description text                            │
├─────────────────────────────────────────────────┤
│ DiscoveryCategoryNav Section                    │
│   "Discover Our Work" header                    │
│   + 3 Category Cards                            │
├─────────────────────────────────────────────────┤
│ InteractiveImageGrid Section                    │
│   Category name header                          │
│   + Masonry image grid                          │
├─────────────────────────────────────────────────┤
│ GalleryCTA                                      │
└─────────────────────────────────────────────────┘
```

## Proposed Structure

```text
┌─────────────────────────────────────────────────┐
│ ImmersiveMobileHero (full-bleed rotating hero)  │
├─────────────────────────────────────────────────┤
│ COMBINED Intro + Categories Section             │
│   "From Our Family Kitchen to Your Special Event"│
│   + description text                            │
│   + 3 Category Cards (moved here)               │
├─────────────────────────────────────────────────┤
│ COMBINED Discovery + Image Grid Section         │
│   "Discover Our Work" header                    │
│   + Masonry image grid                          │
├─────────────────────────────────────────────────┤
│ GalleryCTA                                      │
└─────────────────────────────────────────────────┘
```

---

## Changes Overview

### 1. Move Category Cards into Brand Intro Section

The 3 category filter cards (Weddings & Black Tie, Buffet Service, Artisan Desserts) will be embedded directly beneath the intro text, creating a cohesive "introduction + browse categories" experience.

### 2. Merge "Discover Our Work" with Image Grid

The "Discover Our Work" heading will become the header for the actual image gallery section, removing the extra section wrapper and creating better visual flow.

### 3. Responsive Typography Audit

| Element | Current | Updated |
|---------|---------|---------|
| Intro heading | `text-2xl sm:text-3xl lg:text-4xl` | Keep (appropriate) |
| Intro script | `text-xl sm:text-2xl` | Keep (appropriate) |
| Discover heading | `text-3xl sm:text-4xl lg:text-5xl` | `text-2xl sm:text-3xl lg:text-4xl` (reduce to match hierarchy) |
| Category card title (mobile) | `text-lg` | Keep |
| Category card title (desktop) | `text-xl` | Keep |
| Grid header | `text-2xl sm:text-3xl` | Keep |

---

## Implementation Details

### File 1: `src/pages/AlternativeGallery.tsx`

**Changes:**
- Remove the standalone `DiscoveryCategoryNav` PageSection wrapper (lines 113-123)
- Embed category cards directly within the Brand Intro section
- Move "Discover Our Work" header logic into the Image Grid section

**New structure:**

```tsx
{/* Brand Intro + Category Cards - COMBINED */}
<PageSection pattern="b" className="py-8 sm:py-12">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    {/* Intro text - centered */}
    <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-10 lg:mb-12">
      <div className="flex items-center justify-center space-x-2 mb-3">
        <Camera className="h-5 w-5 text-ruby" />
        <Badge variant="outline" className="border-ruby text-ruby font-script text-sm">
          Our Gallery
        </Badge>
      </div>
      
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-elegant font-bold mb-3">
        From Our Family Kitchen to Your Special Event
      </h2>
      
      <p className="text-xl sm:text-2xl font-script text-ruby font-medium mb-3">
        Memories in Every Bite
      </p>
      
      <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
        As a family-run catering company rooted in authentic Southern cooking...
      </p>
    </div>
    
    {/* Category Cards - embedded here */}
    <CategoryCards 
      selectedCategory={selectedCategory}
      onCategorySelect={handleCategorySelect}
    />
  </div>
</PageSection>

{/* Discover Our Work + Image Grid - COMBINED */}
<PageSection pattern="c" withBorder>
  <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
    <InteractiveImageGrid 
      images={filteredImages}
      onImageClick={handleImageClick}
      category={selectedCategory}
      showDiscoverHeader={true}  {/* New prop */}
    />
  </div>
</PageSection>
```

### File 2: `src/components/gallery/DiscoveryCategoryNav.tsx`

**Changes:**
- Remove the "Discover Our Work" header section (lines 66-77)
- Export just the category cards as a standalone component
- Rename to `CategoryCards` for clarity

### File 3: `src/components/gallery/InteractiveImageGrid.tsx`

**Changes:**
- Add new prop `showDiscoverHeader?: boolean`
- When true, display "Discover Our Work" as the section header instead of category name
- Adjust typography to `text-2xl sm:text-3xl lg:text-4xl` for the discover header

---

## Visual Comparison

### Before (4 separate sections)
```text
┌───────────────────────────────────────┐
│  Brand Intro (centered text only)     │
└───────────────────────────────────────┘
┌───────────────────────────────────────┐
│  "Discover Our Work" + 3 cards        │
└───────────────────────────────────────┘
┌───────────────────────────────────────┐
│  Category Name + Image Grid           │
└───────────────────────────────────────┘
```

### After (2 consolidated sections)
```text
┌───────────────────────────────────────┐
│  Brand Intro (centered text)          │
│  ┌─────┐ ┌─────┐ ┌─────┐             │
│  │Card1│ │Card2│ │Card3│  ← embedded │
│  └─────┘ └─────┘ └─────┘             │
└───────────────────────────────────────┘
┌───────────────────────────────────────┐
│  "Discover Our Work" header           │
│  + Masonry Image Grid                 │
└───────────────────────────────────────┘
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/AlternativeGallery.tsx` | Restructure sections, embed category cards in intro |
| `src/components/gallery/DiscoveryCategoryNav.tsx` | Remove header, rename to CategoryCards, export card grid only |
| `src/components/gallery/InteractiveImageGrid.tsx` | Add optional "Discover Our Work" header prop |

---

## Benefits

1. **Reduced scroll depth** - Users see category options immediately after reading the intro
2. **Cleaner hierarchy** - One intro section, one gallery section (not three separate sections)
3. **Better storytelling** - "From our kitchen to your event" flows directly into "choose your style"
4. **Consistent typography** - Verified responsive sizing across all breakpoints
