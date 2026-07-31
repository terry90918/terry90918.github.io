## Context

The site is Terry's personal engineering and AI publishing homepage. Its audience is readers,
potential collaborators, and hiring or client decision-makers. The page's single job is to
establish Terry's identity quickly and make recent writing easy to scan.

Live measurement at a 1046px-wide desktop viewport found:

- Terry: 57px header, 768px content container, 48px portrait, 24px hero heading.
- Reference: 85px header, approximately 736px visual content column, 160px portrait, 30px hero
  heading.
- Terry's hero is vertically stacked on desktop and the posts use bordered rows; the reference
  uses a portrait-and-copy row followed by an unboxed, compact editorial list.

The local `main` worktree contains unrelated and already-upstreamed identity/content changes and is
five commits behind `origin/main`, so implementation will remain isolated on the issue branch.

## Goals / Non-Goals

**Goals:**

- Match the reference's desktop proportions and editorial rhythm closely enough that the remaining
  differences read as Terry's identity rather than accidental layout drift.
- Keep the homepage fast, minimal, responsive, keyboard accessible, and dark-mode compatible.
- Preserve Terry's display name, biography line, social destinations, article content, and routes.
- Protect the stable visual contracts with focused tests and browser acceptance.

**Non-Goals:**

- Pixel-for-pixel cloning or copying Peter Steinberger's portrait, personal copy, RSS treatment,
  social set, or branding.
- Reworking article pages, About content, metadata, RSS, deployment, or the content pipeline.
- Introducing a new design system, animation library, or external UI dependency.

## Design Direction

### Tokens

- **Paper** `#FDFDFD`: existing light background.
- **Ink** `#282728`: existing primary text.
- **Signal blue** `#006CAC`: existing link accent and the page's one strong color.
- **Hairline** `#ECE9E9`: header/hero structural rules only.
- **Night** `#212737` and **ember** `#FF6B01`: existing dark background and accent.

Typography remains the site's Atkinson Hyperlegible-led voice for Terry's readable technical
identity. The display role uses its bold weight at 30px, body copy uses 16px with 24px line height,
and metadata uses a 12px utility scale. This deliberately avoids impersonating the reference's
system monospace while correcting the scale and spacing.

### Layout

Desktop:

```text
┌── Terry.TY Chen ───────────────── Posts  About  ◐ ──┐
├──────────────────────────────────────────────────────┤
│  ( 160px portrait )  Hi, I'm Terry.TY Chen.         │
│                      biography on two lines          │
│                      GitHub  X  LinkedIn              │
├──────────────────────────────────────────────────────┤
│  Post title                                          │
│  date • reading time                                 │
│  excerpt                                             │
│                                                      │
│  Post title …                                        │
└──────────────────────────────────────────────────────┘
```

Mobile:

```text
┌─ Terry.TY Chen ───── menu links ─┐
│ (portrait)                       │
│ Hi, I'm Terry.TY Chen.           │
│ biography                        │
│ social links                     │
├──────────────────────────────────┤
│ post title                       │
│ metadata                         │
│ excerpt                          │
└──────────────────────────────────┘
```

### Signature

The large, crisp circular portrait beside Terry's compact engineering introduction is the single
signature element. Everything else stays quiet and editorial. The aesthetic risk is allowing the
portrait to become substantially more prominent than the current site; this is justified because
the homepage must establish a real person before presenting an automated daily publishing stream.

### Self-critique

A first-pass clone would also copy system monospace typography, the RSS icon, and every separator.
Those choices belong to Peter's brand rather than Terry's brief. The revised direction borrows only
the structural proportions and scanning rhythm while retaining Terry's typeface, palette, links,
and content hierarchy.

## Decisions

### Use a shared 46rem editorial width

The header and homepage will converge on a `max-w-[46rem]` (736px) inner width. This matches the
measured reference rhythm while remaining close to the current `max-w-3xl` structure and requires
no new layout abstraction.

### Make the hero responsive with CSS layout, not client JavaScript

The hero will stack by default and switch to a row at the `sm` breakpoint. The portrait will be
large on desktop and somewhat smaller on narrow screens. This keeps the page statically rendered,
avoids hydration behavior, and retains semantic source order.

### Keep one structural divider and remove post-row borders

The hero's bottom hairline separates identity from the publication stream. Individual articles
will use whitespace instead of borders, matching the reference's open list and reducing visual
noise. The `Latest Posts` eyebrow will be removed because order and article titles already explain
the section; it is decorative rather than informational.

### Keep text social links

Icon-only links would look closer to the reference, but the current labels are legible, accessible,
and distinctly Terry's. Their placement moves into the hero copy column without changing targets.

### Verify stable contracts instead of fragile pixels

E2E tests will assert portrait dimensions/classes, desktop row composition, content-width class,
absence of post borders, visible identity, and social URLs. Browser acceptance will cover desktop
and mobile screenshots plus computed dimensions. Tests will not lock exact rendered pixel
coordinates that vary by browser and font loading.

## Risks / Trade-offs

- A 160px remote GitHub avatar can look soft if the source response is low resolution. `next/image`
  remains unoptimized for the external URL; browser acceptance will verify the observed result.
- Chinese titles are longer than the reference's English titles. The chosen width and 16px title
  scale preserve scanning without truncating the title.
- Removing the `Latest Posts` eyebrow reduces explicit section labeling. The hero divider and
  immediate list structure preserve comprehension, and the page's job is already clear.

## Rollback

Revert the implementation commit. No data, schema, credential, content, or infrastructure changes
are involved.
