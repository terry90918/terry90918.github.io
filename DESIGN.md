# Site design

The explicitly selected local Open Design project `76e33fa9-e2bc-4bf3-b92d-b38f0e5c0ae2` defines the visual direction. Its `index.html`, `design.css`, `design.js` and `design-note.md` are the reference. The selected HTML was updated on 2026-10-15; The user-authorised Nidin management follow-up updates the selected HTML, CSS and design note together; JavaScript remains the 2026-10-07 revision. The project lives under the Open Design release-stable namespace; do not substitute a Cloud preview or archived file version. The user explicitly confirmed the selected visible copy and all CV skills on 2026-10-15. Apply that copy and block order across all 11 views. Preserve factual accuracy, existing routes, metadata, photos and CV interactions. Dynamic article data stays current; the user separately confirmed the 55-delivery statement, which appears verbatim in the second Nidin case evidence row. This document records the accepted visual system. Runtime values live in `app/(frontend)/globals.css`; `styles/cv.css` consumes them.

## Typography

The public site and CV share the local Satoshi configuration in `lib/site/fonts.ts`, using the existing 400, 500, 700 and 900 weight assets. Font display uses `swap`, and assets load when used without preloading. The font stack is `var(--font-satoshi), 'PingFang TC', 'Microsoft JhengHei', system-ui, sans-serif`. No remote font stylesheet is required.

## Semantic palette

| Role                  | Runtime token              | Light     | Dark      |
| --------------------- | -------------------------- | --------- | --------- |
| Page background       | `--background`             | `#faf9f7` | `#0b0b0b` |
| Main text             | `--foreground`             | `#3d3d3d` | `#fafafa` |
| Secondary text        | `--muted-foreground`       | `#696969` | `#b3b3b3` |
| Card text             | `--card-foreground`        | `#1a1a1a` | `#fafafa` |
| Primary fill          | `--primary`                | `#1a1a1a` | `#e5e5e5` |
| Primary text          | `--primary-foreground`     | `#fafafa` | `#1a1a1a` |
| Card background       | `--card`                   | `#ffffff` | `#141414` |
| Secondary surface     | `--secondary`              | `#eeebe5` | `#262626` |
| Muted surface         | `--muted`                  | `#f0ede8` | `#262626` |
| Accent surface        | `--accent-surface`         | `#fff0e6` | `#3b251b` |
| Brand accent          | `--brand`                  | `#ff5c00` | `#ff5c00` |
| Accent text and links | `--accent`, `--accent-ink` | `#b83b08` | `#ff8c50` |
| Borders               | `--border`                 | `#d6d0c8` | `#303030` |
| Focus ring            | `--ring`                   | `#b83b08` | `#ff8c50` |

Tailwind color aliases consume the corresponding runtime tokens. `brand` is the orange brand fill; `brand-foreground` uses `#0b0b0b` for readable text on that fill. `accent` and `accent-ink` provide readable link text; `accent-surface` provides pale filled surfaces. `accent-foreground` is white in light mode and `#0b0b0b` in dark mode for text on an accent fill. Card text and primary colors use the reference values above. Popover and secondary foregrounds use the main text token; inputs use borders. CV sidebar aliases inherit the same roles and chart aliases consume the shared surfaces and accents.

Theme switching uses `next-themes` and the existing `html[data-theme]` contract. Both roots use the same tokens; CV has no separate palette or dotted page background.

## Layout and shape

Use a 1120px (`70rem`, `--editorial-width`) outer desktop maximum, including 32px padding on each side. Header, page, CV section navigation and footer align on that padded content edge. The shared header is 76px above 700px and 64px at or below it, with centered navigation, a separate contact utility and 44px icon buttons. The header marks the active route with an orange underline.

Runtime editorial geometry lives in `styles/editorial.css`; shared repeated markup lives in `components/SitePrimitives.tsx`. The source palette and font remain in `globals.css` and `lib/site/fonts.ts`. CV home geometry lives in `styles/cv.css` and reuses the editorial card/button roles.

Standard buttons and chips use the 10px (`--radius`) radius. Reference cards use 14px and contact panels use 16px. Card and article headings are neutral; eyebrows, explicit reading links and small accents carry orange. The home hero uses a 1.4:1 grid with 70px gap, a 252px square portrait, an offset fine border and a name label. At 900px the portrait is 210px and three-card grids stack; at 700px the hero stacks with a 100px portrait, hidden frame/label and 20px page padding. About retains a 236px portrait on desktop and 140px on mobile. Story/work/case content uses a 1:2 split, switching to one column at 700px.

CV home uses a horizontal, scrollable section rail, three statistic cards (two columns below 900px), two columns of plain project cards (one below 700px), and a fine-line chronology with circular indices. The order is hero, about, projects, experience, education, contact and skills. Use the selected six concise project summaries and the 31 confirmed skill categories in each language. Main-site experiences and work follow GJ, Nidin and AI order; Story has three chapters. Full career details remain in CV. Keep the existing desktop React Three ID-card implementation; use the existing portrait as the mobile fallback. Keep CV case studies and full contact pages in their existing structures.

At 375px and 320px, content must fit without horizontal overflow. Mobile navigation uses an accessible collapsed menu with an accurate expanded state, closes after selecting a destination, and retains existing routes. CV preserves language switching, section links, the custom cursor and the interactive desktop React Three ID card with its mobile fallback.

## Motion and accessibility

Keep visible keyboard focus and theme persistence. Respect `prefers-reduced-motion`: disable smooth scrolling and reduce animation and transition durations. Keep motion restrained and avoid decorative effects absent from the reference. Do not change article bodies, contact destinations, canonical URLs, sitemap entries or RSS entries when applying this visual system.

## Nidin management copy

The user authorised ordinary-file edits in the selected Open Design project for this follow-up. Nidin management copy uses `管理工程部門團隊，協助工作分派與技術決策。` and `Managed the engineering team and supported work allocation and technical decision-making.`. Role panels retain the technical-manager title without repeating that sentence. Nidin’s management headcount and its statistic card are removed from main Work, the case, both CV homes and both CV case studies. Three career metric cards remain. Other companies’ team sizes and the confirmed 55-delivery statement stay unchanged. The local design source uses matching three-column metrics, with two columns below 900px.

Writing navigation follows the latest selected HTML revision `8ded8cad`: only the AI 資訊 series entry is shown. Keep the year-grouped archive, `all-posts`/article anchors and public article URLs even when their shortcut buttons are removed.
