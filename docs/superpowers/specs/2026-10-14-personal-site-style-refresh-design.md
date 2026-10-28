# Personal Site Style Refresh Design

**Goal:** Apply the current `terry90918.me` Open Design visual system to the existing website while preserving its live content, URLs, metadata, and interactions.

**Status:** The design direction is approved. This specification is ready for review before implementation planning.

## Context

The current site is a Next.js App Router application with a public editorial site and a bilingual CV. The current production homepage and repository define the content, routes, metadata, and behavior. The Open Design project named `terry90918.me` is the visual reference. Its `design-note.md`, `index.html`, `design.css`, `design.js`, and current preview define the intended styling and directly represented interactions.

The Open Design preview contains older article and experience copy than the current site. This change uses it for visual direction and the mobile navigation interaction only. It does not replace current copy, article data, images, routes, or page behavior with the preview's content or single-page router.

The checked-in preview screenshots show an earlier blue-link state. The current stylesheet and live preview use the orange palette below and are authoritative over those screenshots.

## Design

The public site is a hybrid of a personal-brand introduction and an editorial archive. The Home, About, Story, Work, and CV surfaces can use the stronger profile treatment in the reference. Writing and AI Daily retain the current site's reading hierarchy while sharing the same palette, typography, navigation, and content width system.

Use the existing Next.js routes and React components. Map the visual system into the existing global CSS custom properties and Tailwind v4 theme aliases. The global runtime tokens remain the implementation source of truth; a project `DESIGN.md` will document the accepted values and their mapping in the implementation change. CV styles consume those shared semantic tokens rather than maintaining a second palette. Keep `next-themes`'s `data-theme` contract.

Use the existing local Satoshi font assets, with `PingFang TC`, `Microsoft JhengHei`, and system sans-serif fallbacks. Do not add a font or UI dependency. Preserve the current product's photos and other assets.

### Visual values

| Role                  | Light     | Dark      |
| --------------------- | --------- | --------- |
| Page background       | `#faf9f7` | `#0b0b0b` |
| Main text             | `#3d3d3d` | `#fafafa` |
| Card background       | `#ffffff` | `#141414` |
| Secondary surface     | `#eeebe5` | `#262626` |
| Muted surface         | `#f0ede8` | `#262626` |
| Accent surface        | `#fff0e6` | `#3b251b` |
| Brand accent          | `#ff5c00` | `#ff5c00` |
| Accent text and links | `#b83b08` | `#ff8c50` |
| Borders               | `#d6d0c8` | `#303030` |
| Focus ring            | `#b83b08` | `#ff8c50` |

Use a 1120px desktop content maximum, a 76px shared header, fine borders, generous section spacing, light cards, and a 10px standard card radius. Use the reference's paired profile image and introduction on desktop; stack them at narrow widths. Do not add decorative effects that are absent from the reference. The CV preview's static ID-card image is only a placeholder; the product keeps its interactive React Three card.

Keep the orange brand color, link color, and pale accent surface as separate semantic roles. A shared `accent` utility must not use the same value for link text and filled surfaces when that harms contrast.

## Scope

Update the shared header, footer, theme colors, type, and page-width treatment; the header gains the reference's accessible mobile menu while retaining the site's existing destinations. Apply the reference styling to Home, About, Story, Work and the referenced GJ/Nidin/JurisLM case pages, Writing index, AI Daily, and the Chinese and English CV home sections represented in the preview.

Single article pages, CV case-study pages, and the full CV contact pages have no complete visual reference. Keep their current page structure and content; apply only shared theme and shell styling that is represented in the reference.

## Invariants

- Preserve every existing route, canonical URL, metadata field, sitemap entry, RSS entry, and article body.
- Preserve live site copy and source data; do not copy preview text into the product.
- Preserve theme persistence and visible keyboard focus.
- Respect `prefers-reduced-motion`.
- Keep the CV language switch, section navigation, case-study links, custom cursor, and React Three/physics ID card, including the current mobile fallback.
- Do not replace CV behavior with the preview's static placeholder.
- Do not add code comments or dependencies.

## Responsive and interaction requirements

The reference layouts must work at desktop widths and at 375px and 320px. No page may overflow horizontally. At mobile widths, the primary navigation is collapsed behind a button with an accessible name and an accurate `aria-expanded` state. Activating a menu link navigates to the existing destination and closes the menu. Theme switching, CV navigation, and all current content links continue to work by keyboard and pointer.

## Documentation alignment

Create the site's visual authority document and update the existing README design-color entry in the implementation changeset. Update `openspec/specs/homepage-visual-rhythm/spec.md` to remove superseded narrow-width and fixed portrait-size rules while retaining its current content order and behavior requirements. Keep `site-identity` and `integrated-cv` route, identity, and interaction requirements intact.

## Verification

- Compare the implemented pages with the current Open Design preview at desktop and 375px/320px widths.
- Inspect light and dark themes, mobile menu open/close, visible keyboard focus, and reduced-motion behavior.
- Verify representative Home, Story, Work, Writing, AI Daily, and both CV locales; verify a single article, a CV case-study page, and the full CV contact page retain their existing structure and routes.
- Confirm the CV ID card remains interactive on desktop and its mobile fallback remains available.
- Run the repository checks required by JT Harness and verify current PR checks before merge.
