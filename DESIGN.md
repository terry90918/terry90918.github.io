# Site design

The current OpenDesign Cloud `terry90918.me` preview defines the visual direction. Existing site content, routes, metadata, photos and CV interactions remain authoritative. This document records the accepted visual system. Runtime values live in `app/(frontend)/globals.css`; `styles/cv.css` consumes them.

## Typography

The public site and CV share the local Satoshi configuration in `lib/site/fonts.ts`, using the existing 400, 500, 700 and 900 weight assets. Font display uses `swap`, and assets load when used without preloading. The font stack is `var(--font-satoshi), 'PingFang TC', 'Microsoft JhengHei', system-ui, sans-serif`. No remote font stylesheet is required.

## Semantic palette

| Role                  | Runtime token              | Light     | Dark      |
| --------------------- | -------------------------- | --------- | --------- |
| Page background       | `--background`             | `#faf9f7` | `#0b0b0b` |
| Main text             | `--foreground`             | `#3d3d3d` | `#fafafa` |
| Card background       | `--card`                   | `#ffffff` | `#141414` |
| Secondary surface     | `--secondary`              | `#eeebe5` | `#262626` |
| Muted surface         | `--muted`                  | `#f0ede8` | `#262626` |
| Accent surface        | `--accent-surface`         | `#fff0e6` | `#3b251b` |
| Brand accent          | `--brand`                  | `#ff5c00` | `#ff5c00` |
| Accent text and links | `--accent`, `--accent-ink` | `#b83b08` | `#ff8c50` |
| Borders               | `--border`                 | `#d6d0c8` | `#303030` |
| Focus ring            | `--ring`                   | `#b83b08` | `#ff8c50` |

Tailwind color aliases consume the corresponding runtime tokens. `brand` is the orange brand fill; `brand-foreground` uses `#0b0b0b` for readable text on that fill. `accent` and `accent-ink` provide readable link text; `accent-surface` provides pale filled surfaces. `accent-foreground` is white in light mode and `#0b0b0b` in dark mode for text on an accent fill. Card, popover and secondary foregrounds use the main text token. Primary uses main text with the page background as its foreground; inputs use borders. CV sidebar aliases inherit the same roles and chart aliases consume the shared surfaces and accents.

Theme switching uses `next-themes` and the existing `html[data-theme]` contract. Both roots use the same tokens; CV has no separate palette or dotted page background.

## Layout and shape

Use a 1120px (`70rem`, `--editorial-width`) desktop content maximum and a 76px shared header. Align header and page content, use generous section spacing, fine borders and light cards. The standard card radius is 10px (`0.625rem`, `--radius`). Home, About, Story, Work and CV use the stronger profile treatment: pair the existing profile image with its introduction on desktop and stack them on narrow screens. Writing and AI Daily retain their reading hierarchy. Single articles, CV case studies and full CV contact pages retain their current structures.

At 375px and 320px, content must fit without horizontal overflow. Mobile navigation uses an accessible collapsed menu with an accurate expanded state, closes after selecting a destination, and retains existing routes. CV preserves language switching, section links, the custom cursor and the interactive desktop React Three ID card with its mobile fallback.

## Motion and accessibility

Keep visible keyboard focus and theme persistence. Respect `prefers-reduced-motion`: disable smooth scrolling and reduce animation and transition durations. Keep motion restrained and avoid decorative effects absent from the reference. Do not change article bodies, contact destinations, canonical URLs, sitemap entries or RSS entries when applying this visual system.
