

# Global Branding Consistency Update

## Overview

This plan addresses three updates:
1. Remove Twitter link from footer
2. Update Facebook links to `https://www.facebook.com/soultrainseatery`
3. Create a reusable branded header component matching home page styling (badge + script subtitle)

---

## Part 1: Footer Social Links Cleanup

### Files to Modify

| File | Change |
|------|--------|
| `src/components/Footer.tsx` | Remove Twitter, update Facebook URL |
| `src/components/home/alternative-third/ElegantRubyFooter.tsx` | Remove Twitter, update Facebook URL |

### Footer.tsx Changes (lines 2, 117-125)

**Remove Twitter from import:**
```tsx
// Before
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, Twitter, Star } from "lucide-react";

// After
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, Star } from "lucide-react";
```

**Update social links section (lines 116-126):**
```tsx
<div className="flex space-x-3">
  <a 
    href="https://www.facebook.com/soultrainseatery" 
    target="_blank"
    rel="noopener noreferrer"
    className="w-10 h-10 rounded-full bg-muted hover:bg-primary text-muted-foreground hover:text-primary-foreground flex items-center justify-center transition-all duration-200 hover:scale-110" 
    aria-label="Facebook"
  >
    <Facebook className="h-4 w-4" />
  </a>
  <a 
    href="#" 
    className="w-10 h-10 rounded-full bg-muted hover:bg-primary text-muted-foreground hover:text-primary-foreground flex items-center justify-center transition-all duration-200 hover:scale-110" 
    aria-label="Instagram"
  >
    <Instagram className="h-4 w-4" />
  </a>
  {/* Twitter link removed */}
</div>
```

### ElegantRubyFooter.tsx Changes (lines 9-11, 38-42)

**Remove Twitter from imports and socialLinks array:**
```tsx
// Remove line 11: Twitter from imports
// Update socialLinks array:
const socialLinks = [
  { icon: Facebook, href: "https://www.facebook.com/soultrainseatery", label: "Facebook" },
  { icon: Instagram, href: "#", label: "Instagram" }
  // Twitter removed
];
```

---

## Part 2: Global Branded Header Component

### Best Approach: Enhanced PageHeader Component

Rather than creating separate headers for each page, the best approach is to **extend the existing `PageHeader` component** to support the branded styling pattern. This ensures:
- Single source of truth for header styling
- Easy global updates
- Consistent branding across all pages
- Backward compatibility (existing usage still works)

### Home Page Branding Pattern

The home page sections follow this hierarchy:
```text
[Icon] [Badge with script font]     ← New: badge prop
        
Main Title (font-elegant)           ← Existing: title prop
        
Script Subtitle (text-ruby)         ← New: subtitle prop
        
Description text                    ← Existing: description prop
```

### Updated PageHeader Props

```tsx
interface PageHeaderProps {
  title: string;
  description: string;
  // NEW branded props
  badge?: {
    icon?: React.ReactNode;
    text: string;
  };
  subtitle?: string;  // Script-font subtitle like home sections
  // Existing props
  icons?: React.ReactNode[];  // Keep for backward compatibility
  buttons?: Array<{...}>;
  className?: string;
}
```

### Updated PageHeader Component (src/components/ui/page-header.tsx)

```tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description: string;
  badge?: {
    icon?: React.ReactNode;
    text: string;
  };
  subtitle?: string;
  icons?: React.ReactNode[];
  buttons?: Array<{
    text: string;
    href: string;
    variant?: "default" | "secondary" | "outline" | "ghost" | "link" | "destructive" | "cta" | "cta-white";
    icon?: React.ReactNode;
  }>;
  className?: string;
}

export const PageHeader = ({ 
  title, 
  description, 
  badge,
  subtitle,
  icons = [], 
  buttons = [], 
  className 
}: PageHeaderProps) => {
  return (
    <header 
      id="page-header" 
      className={cn(
        "text-center max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-6 sm:py-8 lg:py-12 xl:py-16",
        className
      )}
    >
      {/* NEW: Badge + Icon (home page pattern) */}
      {badge && (
        <div className="flex items-center justify-center space-x-2 mb-3">
          {badge.icon && (
            <span className="text-ruby">{badge.icon}</span>
          )}
          <Badge variant="outline" className="border-ruby text-ruby font-script text-sm">
            {badge.text}
          </Badge>
        </div>
      )}

      {/* Legacy: Icon cluster (kept for backward compatibility) */}
      {!badge && icons.length > 0 && (
        <div className="flex justify-center items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6 lg:mb-8">
          {icons.map((icon, index) => (
            <div key={index} className="text-primary/80 hover:text-primary transition-colors duration-300 hover:scale-110">
              {icon}
            </div>
          ))}
        </div>
      )}

      {/* Title */}
      <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-elegant font-bold text-foreground mb-3 sm:mb-4 leading-tight">
        {title}
      </h1>

      {/* NEW: Script subtitle (home page pattern) */}
      {subtitle && (
        <p className="text-xl sm:text-2xl font-script text-ruby font-medium mb-3 sm:mb-4">
          {subtitle}
        </p>
      )}

      {/* Description */}
      <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-4 sm:mb-6 lg:mb-8 xl:mb-10">
        {description}
      </p>

      {/* Action buttons */}
      {buttons.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 lg:gap-6">
          {buttons.map((button, index) => (
            <Button key={index} asChild variant={button.variant || "default"} size="responsive-md" className="w-full sm:w-auto min-w-[180px] sm:min-w-[200px] text-sm sm:text-base font-medium hover:scale-105 transition-transform duration-300">
              <a href={button.href} className="flex items-center justify-center space-x-2">
                {button.icon && <span>{button.icon}</span>}
                <span>{button.text}</span>
              </a>
            </Button>
          ))}
        </div>
      )}
    </header>
  );
};
```

---

## Part 3: Update All Pages to Use Branded Headers

### Pages Using PageHeader (need badge + subtitle added)

| Page | Badge Icon | Badge Text | Subtitle |
|------|------------|------------|----------|
| About | Heart | Our Story | A Family Legacy of Flavor |
| FAQ | HelpCircle | Support | We're Here to Help |
| Reviews | Star | Testimonials | Real Stories, Real Satisfaction |
| Request Quote | MessageCircle | Get Started | Your Event, Our Passion |
| Privacy Policy | Shield | Legal | Protecting Your Information |
| Terms & Conditions | FileText | Legal | Our Commitment to You |

### Example: Updated About Page Header

```tsx
<PageHeader
  badge={{
    icon: <Heart className="h-5 w-5" />,
    text: "Our Story"
  }}
  title="Meet the Heart Behind Soul Train's Eatery"
  subtitle="A Family Legacy of Flavor"
  description="From family traditions to professional excellence, discover the passionate team..."
  buttons={[
    { text: "Request Quote", href: "/request-quote#page-header", variant: "cta" }
  ]}
/>
```

### Example: Updated FAQ Page Header

```tsx
<PageHeader
  badge={{
    icon: <HelpCircle className="h-5 w-5" />,
    text: "Support"
  }}
  title="Frequently Asked Questions"
  subtitle="We're Here to Help"
  description="Find answers to common questions about our catering services..."
  buttons={[
    { text: "Contact Us", href: "tel:8439700265", variant: "default" },
    { text: "Request Quote", href: "/request-quote#page-header", variant: "outline" }
  ]}
/>
```

### Example: Updated QuoteHeader Component

```tsx
const QuoteHeader = () => {
  return (
    <PageHeader
      badge={{
        icon: <MessageCircle className="h-5 w-5" />,
        text: "Get Started"
      }}
      title="Request a Catering Quote"
      subtitle="Your Event, Our Passion"
      description="Tell us a few details and we'll build a custom quote..."
    />
  );
};
```

---

## Files to Modify Summary

| File | Changes |
|------|---------|
| `src/components/Footer.tsx` | Remove Twitter, update Facebook URL |
| `src/components/home/alternative-third/ElegantRubyFooter.tsx` | Remove Twitter, update Facebook URL |
| `src/components/ui/page-header.tsx` | Add badge and subtitle props |
| `src/pages/About.tsx` | Add badge + subtitle to PageHeader |
| `src/pages/FAQ.tsx` | Add badge + subtitle to PageHeader |
| `src/pages/Reviews.tsx` | Add badge + subtitle to PageHeader |
| `src/components/quote/QuoteHeader.tsx` | Add badge + subtitle to PageHeader |
| `src/pages/PrivacyPolicy.tsx` | Add badge + subtitle to PageHeader |
| `src/pages/TermsConditions.tsx` | Add badge + subtitle to PageHeader |

---

## Visual Comparison

### Before (Current PageHeader)
```text
[Icon] [Icon] [Icon]

Main Title

Description text

[Button]
```

### After (Branded PageHeader)
```text
[Icon] [Badge Text]          ← Ruby-colored badge with script font

Main Title                   ← Same elegant styling

Script Subtitle              ← NEW: Ruby script font tagline

Description text             ← Same muted styling

[Button]
```

---

## Benefits of This Approach

1. **Single source of truth** - All header styling in one component
2. **Backward compatible** - Existing pages using `icons` prop still work
3. **Consistent branding** - Matches home page section pattern exactly
4. **Easy maintenance** - Change badge styling once, updates everywhere
5. **Flexible** - Pages can use badge OR icons, not both (badge takes priority)

