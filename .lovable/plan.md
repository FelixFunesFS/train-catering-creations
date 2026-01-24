# Scroll Navigation Fix - COMPLETED

## Summary

Removed `#page-header` hash from navigation links to prevent pages from scrolling past the navbar. The hash is now only used for `/request-quote` links where focused form entry is intentional.

## Changes Made

| File | Change |
|------|--------|
| `src/components/Header.tsx` | Removed hash from About, Menu, Wedding, Reviews, FAQ nav links |
| `src/pages/About.tsx` | Removed hash from gallery and menu links |
| `src/pages/Reviews.tsx` | Removed hash from About Us button |
| `src/components/home/StoryHero.tsx` | Removed hash from View Gallery buttons (mobile + desktop) |
| `src/components/wedding/WeddingMenuSplitHero.tsx` | Removed hash from View Gallery button |

## Links Preserved with Hash

- `/request-quote#page-header` - Intentional focus on quote form
