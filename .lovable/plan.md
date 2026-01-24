
# Remove All Scroll-Down Chevron Indicators

## Overview

Remove all decorative chevron scroll-down buttons and scroll indicators from hero sections across the website. These are the bouncing/animated arrows that prompt users to scroll down.

---

## Files to Modify

### 1. Gallery Hero - `src/components/gallery/ImmersiveMobileHero.tsx`

**Remove lines 172-182:**
```tsx
{/* Scroll Indicator */}
<div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
  <Button
    variant="ghost"
    size="sm"
    onClick={onScrollToGallery}
    className="text-white/60 hover:text-white"
  >
    <ChevronDown className="h-5 w-5" />
  </Button>
</div>
```

**Also remove** the `ChevronDown` import if no longer needed.

---

### 2. Story Hero (Mobile) - `src/components/home/StoryHero.tsx`

**Remove lines 315-326:**
```tsx
{/* Scroll Indicator */}
<div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
  <Button
    variant="ghost"
    size="sm"
    onClick={handleScrollToDiscover}
    className="text-muted-foreground hover:text-foreground animate-bounce"
    aria-label="Scroll to next section"
  >
    <ChevronDown className="h-5 w-5" />
  </Button>
</div>
```

---

### 3. Story Hero (Desktop) - `src/components/home/StoryHero.tsx`

**Remove lines 461-472:**
```tsx
{/* Scroll Indicator */}
<div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
  <Button
    variant="ghost"
    size="sm"
    onClick={handleScrollToDiscover}
    className="text-white/60 hover:text-white animate-bounce"
    aria-label="Scroll to next section"
  >
    <ChevronDown className="h-5 w-5" />
  </Button>
</div>
```

**Note:** Keep the `ChevronDown` import as it's used elsewhere in navigation components.

---

### 4. Modern Hero (Mobile) - `src/components/home/ModernHero.tsx`

**Remove lines 228-238:**
```tsx
{/* Scroll Indicator */}
<div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
  <Button
    variant="glass-white"
    size="icon"
    onClick={handleScrollToDiscover}
    className="animate-bounce"
  >
    <ChevronDown className="h-4 w-4" />
  </Button>
</div>
```

---

### 5. Modern Hero (Desktop) - `src/components/home/ModernHero.tsx`

**Remove lines 339-349:**
```tsx
{/* Scroll Indicator */}
<div className="absolute bottom-8 right-8 z-20">
  <Button
    variant="glass-white"
    size="icon"
    onClick={handleScrollToDiscover}
    className="animate-bounce"
  >
    <ChevronDown className="h-5 w-5" />
  </Button>
</div>
```

---

### 6. Cinematic Ruby Hero - `src/components/home/alternative-third/CinematicRubyHero.tsx`

**Remove lines 110-115:**
```tsx
{/* Scroll Indicator */}
<div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
  <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center">
    <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse" />
  </div>
</div>
```

---

## Summary

| Component | Location | Type |
|-----------|----------|------|
| ImmersiveMobileHero | Gallery page | ChevronDown button |
| StoryHero (mobile) | Home alternate | ChevronDown button with bounce |
| StoryHero (desktop) | Home alternate | ChevronDown button with bounce |
| ModernHero (mobile) | Home alternate | ChevronDown button with bounce |
| ModernHero (desktop) | Home alternate | ChevronDown button with bounce |
| CinematicRubyHero | Home alternate | Pill-style indicator with pulse |

---

## What's NOT Being Removed

These functional ChevronDown icons will remain:
- **Navigation dropdown indicators** (`navigation-menu.tsx`)
- **Select component scroll buttons** (`select.tsx`)
- **Collapsible menu section toggles** (expand/collapse menus)
- **Admin panel accordions** (event details, line items, etc.)

These serve interactive purposes and are not decorative scroll prompts.

---

## Files Changed

1. `src/components/gallery/ImmersiveMobileHero.tsx`
2. `src/components/home/StoryHero.tsx`
3. `src/components/home/ModernHero.tsx`
4. `src/components/home/alternative-third/CinematicRubyHero.tsx`
