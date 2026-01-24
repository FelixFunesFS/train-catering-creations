

# Mobile Hero Redesign: Overlay Content on Image

## Current Layout (Stacked)

```text
┌────────────────────────────┐
│ [Logo] Soul Train's        │  <- Brand badge (top-left)
│                            │
│      [Background Image]    │  55vh
│                            │
├────────────────────────────┤
│                            │
│   [Badge] [Category]       │
│   Title                    │  45vh (white background)
│   Subtitle                 │
│   Description              │
│   [CTA Buttons]            │
│                            │
└────────────────────────────┘
```

## Proposed Layout (Overlay)

```text
┌────────────────────────────┐
│ [Progress Indicators]      │
│                            │
│                            │
│   [Full Background Image]  │
│                            │  85-90vh
│   ─────────────────────    │
│   [Badge]                  │  <- Content overlay
│   Title                    │     (positioned at bottom)
│   Subtitle                 │
│   Description              │
│   [CTA Buttons]            │
│                            │
└────────────────────────────┘
```

---

## Technical Changes

### File: `src/components/home/SplitHero.tsx`

**Change 1: Remove Brand Badge (lines 210-220)**

Delete this block from the mobile layout:
```tsx
{/* Brand Badge with Logo */}
<div className="absolute top-4 left-4 z-20">
  <div className="flex items-center space-x-2 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
    <img 
      src="/lovable-uploads/e9a7fbdd-021d-4e32-9cdf-9a1f20d396e9.png" 
      alt="Soul Train's Eatery Logo" 
      className="h-8 w-8 object-contain"
    />
    <span className="text-white font-script text-lg">Soul Train's</span>
  </div>
</div>
```

**Change 2: Extend Visual Area to Full Screen (line 195)**

Update the image container height from `h-[55vh] sm:h-[60vh] md:h-[65vh]` to full viewport:
```tsx
// Current
className={`relative h-[55vh] sm:h-[60vh] md:h-[65vh] overflow-hidden ${visualAnimationClass}`}

// Updated
className={`relative min-h-screen overflow-hidden ${visualAnimationClass}`}
```

**Change 3: Position Content as Overlay (lines 224-262)**

Transform the content area from a separate section to an absolute overlay at the bottom of the image:

```tsx
// Current - separate white background section
<div ref={contentRef} 
     className={`relative min-h-[45vh] sm:min-h-[40vh] md:min-h-[35vh] bg-background p-6 pb-8...`}>

// Updated - absolute positioned overlay
<div ref={contentRef} 
     className={`absolute inset-x-0 bottom-0 z-20 p-4 sm:p-6 pb-8 sm:pb-12 ${contentAnimationClass}`}>
```

**Change 4: Update Content Styling for Overlay**

- Add gradient background to ensure text readability: `bg-gradient-to-t from-black/80 via-black/60 to-transparent`
- Change text colors from dark (`text-foreground`) to light (`text-white`)
- Update muted text from `text-muted-foreground` to `text-white/80`
- Update badge styling for dark background
- Update button styling for overlay context

**Change 5: Update Section Container (line 193)**

Change from `min-h-screen` to just the visual area since content is now overlaid:
```tsx
// Current
<section className="relative min-h-screen overflow-hidden bg-background"...>

// Updated - simpler container
<section className="relative h-screen overflow-hidden bg-black"...>
```

---

## Detailed Implementation

### Mobile Section (lines 192-267)

```tsx
// Mobile/Tablet Layout (Overlay content on image)
if (isMobile) {
  return (
    <section 
      className="relative h-screen overflow-hidden bg-black" 
      role="main" 
      aria-label="Hero section with image carousel"
    >
      {/* Full Screen Visual Area */}
      <div 
        ref={visualRef} 
        className={`relative h-full overflow-hidden ${visualAnimationClass}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        role="region" 
        aria-label="Image carousel"
      >
        {/* Progress Indicators - Centered at top */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30 flex space-x-1">
          {heroImages.map((_, index) => (
            <button 
              key={index} 
              onClick={() => setCurrentIndex(index)}
              className="min-w-[24px] min-h-[24px] flex items-center justify-center"
              aria-label={`Go to slide ${index + 1}`}
            >
              <span className={`h-1 rounded-full transition-all duration-500 ${
                index === currentIndex 
                  ? 'w-8 bg-white' 
                  : 'w-3 bg-white/40'
              }`} />
            </button>
          ))}
        </div>

        {/* Full Screen Background Image */}
        <OptimizedImage 
          src={currentImage.src} 
          alt={currentImage.alt}
          className={`w-full h-full object-cover ${getImageObjectPosition(currentIndex)}`}
          containerClassName="h-full"
          priority 
        />
        
        {/* Gradient Overlay for Content Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      </div>

      {/* Content Overlay - Positioned at Bottom */}
      <div 
        ref={contentRef} 
        className={`absolute inset-x-0 bottom-0 z-20 p-4 sm:p-6 pb-8 sm:pb-12 ${contentAnimationClass}`}
        role="region" 
        aria-label="Content section"
      >
        <div className="max-w-md mx-auto w-full space-y-3 sm:space-y-4">
          {/* Category Badge */}
          <Badge 
            variant="outline" 
            className="bg-white/10 backdrop-blur-sm text-white border-white/30 text-sm"
          >
            {badge.label}
          </Badge>
          
          {/* Title & Description */}
          <div className="space-y-2 sm:space-y-3">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-elegant font-bold text-white leading-tight">
              {currentImage.title}
            </h1>
            <p className="text-lg sm:text-xl font-script text-gold-light font-medium">
              {currentImage.subtitle}
            </p>
            <p className="text-sm sm:text-base text-white/80 leading-relaxed line-clamp-3">
              {currentImage.description}
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button 
              size="lg" 
              className="w-full sm:flex-1 bg-white text-primary hover:bg-white/90 font-semibold min-h-[48px]" 
              asChild
            >
              <Link to="/request-quote#page-header" className="flex items-center justify-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Request Quote</span>
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full sm:flex-1 border-white/50 text-white hover:bg-white/10 min-h-[48px]" 
              asChild
            >
              <a href="tel:8439700265" className="flex items-center justify-center gap-2">
                <Phone className="h-4 w-4" />
                <span>Call Now</span>
              </a>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Hero Sentinel */}
      <div 
        ref={heroSentinelRef} 
        id="hero-sentinel" 
        aria-hidden="true" 
        className="absolute bottom-0 left-0 w-full h-1 pointer-events-none" 
      />
    </section>
  );
}
```

---

## Visual Comparison

| Aspect | Before | After |
|--------|--------|-------|
| **Layout** | Stacked (image above, content below) | Overlay (content on image) |
| **Brand badge** | Visible (logo + "Soul Train's") | Hidden on mobile |
| **Image height** | 55vh | 100vh (full screen) |
| **Content background** | White solid | Gradient overlay (transparent) |
| **Text colors** | Dark (foreground) | White with opacity variations |
| **CTA primary** | Ruby gradient | White with ruby text |
| **Space efficiency** | Split between sections | Full image with overlay |

---

## Responsiveness Considerations

- **Touch targets**: Maintained 48px minimum height on all buttons
- **Progress indicators**: Kept 24px touch targets
- **Text legibility**: Enhanced gradient ensures contrast on all images
- **Description**: Added `line-clamp-3` to prevent overflow on smaller screens
- **Safe area**: Bottom padding accounts for device safe areas

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/home/SplitHero.tsx` | Restructure mobile layout (lines 192-267) |

