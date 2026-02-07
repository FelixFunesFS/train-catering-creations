

## Fix Hero Description Truncation

### Problem
The `line-clamp-2` / `line-clamp-3` CSS on the description paragraph cuts off text with ellipsis but provides no way to read the full content.

### Recommended Approach: Remove the clamp
The descriptions are already concise (1-2 short sentences each). Removing the clamp will show the full text without impacting layout or pushing CTAs out of view.

### Why not a "Read More" button?
- Hero sections should deliver their message instantly -- adding interaction to reveal basic copy is friction
- It adds visual clutter next to the CTA buttons
- The text is short enough that truncation is unnecessary

### Technical Detail

**File: `src/components/home/SplitHero.tsx`** (line 279)

- **From**: `line-clamp-2 sm:line-clamp-3`
- **To**: remove both classes entirely

The paragraph keeps its existing `text-sm sm:text-base text-white/80 leading-relaxed` styling. No other changes needed.

