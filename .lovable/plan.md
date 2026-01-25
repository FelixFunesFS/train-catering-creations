
# Remove Decorative Elements from Gallery Section

## What Will Be Changed

Remove the crimson decorative elements (corner accents and border lines) from the "Gallery of Flavor & Style" section while keeping the subtle ruby-tinted background gradient.

## Elements to Remove

| Line | Element | Description |
|------|---------|-------------|
| 168-169 | Top border line | 1px gradient line at top |
| 171-172 | Top-left corner accent | Ruby gradient rounded corner |
| 173 | Top-right corner accent | Ruby gradient rounded corner |
| 174 | Bottom-left corner accent | Ruby gradient rounded corner |
| 175 | Bottom-right corner accent | Ruby gradient rounded corner |
| 177-178 | Bottom border line | 1px gradient line at bottom |

## What Stays

| Element | Location | Status |
|---------|----------|--------|
| Background gradient | Line 164 | **Kept** - `bg-gradient-to-br from-background via-ruby/[0.02] to-background` |
| Image hover overlay | Lines 324-327 | Kept |
| All other content | Throughout | Kept |

## Technical Change

**File**: `src/components/home/InteractiveGalleryPreview.tsx`

Remove lines 166-178 (the entire decorative elements block):

```tsx
// REMOVE these lines entirely:
{/* Crimson decorative elements */}

{/* Top border line */}
<div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-ruby/30 to-transparent" />

{/* Corner accents */}
<div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-ruby/10 to-transparent rounded-br-full pointer-events-none" />
<div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-ruby/10 to-transparent rounded-bl-full pointer-events-none" />
<div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-ruby/[0.08] to-transparent rounded-tr-full pointer-events-none" />
<div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-ruby/[0.08] to-transparent rounded-tl-full pointer-events-none" />

{/* Bottom border line */}
<div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-ruby/30 to-transparent" />
```

## Visual Result

```text
Before:
┌─────────────────────────────────────────┐
│ ▄▄ ═══════════════════════════════ ▄▄  │  ← Border + corners
│ ▀                                   ▀  │
│         Gallery of Flavor & Style      │
│              [Image Grid]              │
│ ▄                                   ▄  │
│ ▀▀ ═══════════════════════════════ ▀▀  │  ← Border + corners
└─────────────────────────────────────────┘

After:
┌─────────────────────────────────────────┐
│                                         │
│         Gallery of Flavor & Style      │  ← Clean, gradient only
│              [Image Grid]              │
│                                         │
└─────────────────────────────────────────┘
```

## Files to Modify

| File | Action |
|------|--------|
| `src/components/home/InteractiveGalleryPreview.tsx` | Remove lines 166-178 (decorative elements) |
