## Why

The homepage already shares steipete.me's restrained editorial direction, but a live comparison at
the same viewport shows a materially smaller hero, a shorter header, a wider reading container,
and a more card-like post list. The requested refinement is to bring those proportions and rhythms
closer while keeping Terry's own identity, content, links, and color system.

Closes #31

## What Changes

- Recompose the homepage hero into a large portrait-and-introduction row on desktop, with a
  deliberate stacked layout on small screens.
- Increase the hero portrait and heading scale.
- Align the persistent header and homepage to a narrower editorial content width and taller header
  rhythm.
- Replace bordered post cards with a compact open list whose title, metadata, and excerpt hierarchy
  more closely matches the reference.
- Retain `Terry.TY Chen`, Terry-owned social links, current content, dark mode, routes, and existing
  color tokens.
- Add focused responsive and accessibility coverage for stable layout contracts.

## Capabilities

### New Capabilities

- `homepage-visual-rhythm`: defines the homepage hero composition, editorial width, post-list
  hierarchy, and responsive behavior.

### Modified Capabilities

- None.

## Impact

- **Code**: `app/(frontend)/page.tsx`, `components/BlogHeader.tsx`, and narrowly scoped shared styles
  if required.
- **Tests**: `tests/e2e/frontend-blog.spec.ts`.
- **Deployment**: the existing push-to-`main` GitHub Pages workflow publishes the static build.
- **External dependencies**: none.
- **Data / migrations**: none.
