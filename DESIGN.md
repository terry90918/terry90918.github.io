# Site design

The explicitly selected local Open Design project `76e33fa9-e2bc-4bf3-b92d-b38f0e5c0ae2` defines the visual direction. Its current `index.html`, `about.html`, `cv.html`, `cv-en.html`, `design.css`, `design.js`, `design-note.md` and `assets/terry-avatar.jpeg` are the reference. Home, About and bilingual CV source files were refreshed on 2026-10-18; JavaScript remains the 2026-10-07 revision. The project lives under the Open Design release-stable namespace; do not substitute a Cloud preview or archived file version. The user explicitly confirmed the selected visible copy and all CV skills on 2026-10-15. Apply that copy and block order across all 11 views. The selected portrait is shared across home, About and CV; runtime image variants keep their existing product paths. Preserve factual accuracy, existing routes, metadata and CV interactions. Dynamic article data stays current; the user separately confirmed the 55-delivery statement, which appears verbatim in the second Nidin case evidence row. This document records the accepted visual system. Runtime values live in `app/(frontend)/globals.css`; `styles/cv.css` consumes them.

## Typography

The public site and CV share the local Satoshi configuration in `lib/site/fonts.ts`, using the existing 400, 500, 700 and 900 weight assets. Font display uses `swap`, and assets load when used without preloading. The font stack is `var(--font-satoshi), 'PingFang TC', 'Microsoft JhengHei', system-ui, sans-serif`. No remote font stylesheet is required.

## Semantic palette

On 2026-10-23 the user selected shadcn/ui standard components for the entire site, then explicitly changed the palette to Anthropic. This supersedes both the earlier orange site palette and the intermediate Neutral preview. The canonical runtime source is app/(frontend)/globals.css, consumed through Tailwind aliases and components/ui.

The Anthropic homepage https://www.anthropic.com was inspected in the browser on 2026-10-23. Observed tokens: ivory-light #faf9f5, slate-dark #141413, clay #d97757, clay-interactive #c6613f, ivory-medium #f0eee6, ivory-dark #e8e6dc and slate-300 #d1cfc5. These describe the observed website, not a claimed published brand standard.

| Role               | Light   | Dark    |
| ------------------ | ------- | ------- |
| Background         | #faf9f5 | #1f1e1d |
| Foreground         | #141413 | #faf9f5 |
| Card               | #ffffff | #262624 |
| Primary / brand    | #d97757 | #d97757 |
| Primary foreground | #141413 | #141413 |
| Secondary / muted  | #f0eee6 | #30302e |
| Muted foreground   | #5e5d59 | #b0aea5 |
| Accent surface     | #e8e6dc | #3d3d3a |
| Border             | #d1cfc5 | #4d4c48 |
| Link / accent-ink  | #a7462b | #e6a18a |

Dark mapping and the link shades are application choices. The darker light-mode link shade preserves small-text contrast (5.61:1 on ivory); clay buttons use dark text (5.90:1) instead of white. Accent is a surface role; text consumers use accent-ink. The standard radius is 0.625rem. Satoshi and the existing CJK fallbacks stay unchanged.

Theme switching retains next-themes and html[data-theme]. components.json uses new-york and components/ui. Button, Card, Badge, Collapsible, Accordion and Slider are installed from the official registry, then themed with the site's semantic variables. Card supports asChild for article, section and link semantics. Shared cn lives in lib/utils.ts; the former CV-only Card and cn are removed. Content links remain semantic anchors; HTML audio/video and React Three retain their specialized implementations.

## Layout and shape

Use a 1120px (`70rem`, `--editorial-width`) outer desktop maximum, including 32px padding on each side. Header, page, CV section navigation and footer align on that padded content edge. The shared header is 76px above 700px and 64px at or below it, with centered navigation, a separate contact utility and 44px icon buttons. The header marks the active route with a clay underline.

Runtime editorial geometry lives in `styles/editorial.css`; shared repeated markup lives in `components/SitePrimitives.tsx`. The source palette and font remain in `globals.css` and `lib/site/fonts.ts`. CV home geometry lives in `styles/cv.css` and reuses the editorial card/button roles.

Buttons and badges use shadcn/ui variants. Cards use its standard border, radius and shadow. Card and article headings are neutral; eyebrows, explicit reading links and small accents use the shared ink and clay roles. The home hero uses a 1.4:1 grid with 70px gap, a 252px square portrait, an offset fine border and a name label. At 900px the portrait is 210px and three-card grids stack; at 700px the hero stacks with a 100px portrait, hidden frame/label and 20px page padding. About retains a 236px portrait on desktop and 140px on mobile. Story/work/case content uses a 1:2 split, switching to one column at 700px.

CV home uses a horizontal, scrollable section rail, the complete OpenAI activity section, two columns of plain project cards (one below 700px), and a fine-line chronology with circular indices. On 2026-10-28 the user moved OpenAI from below skills into the former career-highlights position and removed the three career metric cards. The order is hero, OpenAI, projects, experience, education, contact and skills. Both locales label the first section link OpenAI; the outer #about and inner #codex-profile anchors remain valid. OpenAI uses an h2 with h3 subsections and inherits the normal section spacing without the former nested skills separator. Use the selected six concise project summaries and the 31 confirmed skill categories in each language. Main-site experiences and work follow GJ, Nidin and AI order; Story has three chapters. Full career details remain in CV. Keep the existing desktop React Three ID-card implementation; use the existing portrait as the mobile fallback. Keep CV case studies and full contact pages in their existing structures.

At 375px and 320px, content must fit without horizontal overflow. Mobile navigation uses an accessible collapsed menu with an accurate expanded state, closes after selecting a destination, and retains existing routes. CV preserves language switching, section links, the custom cursor and the interactive desktop React Three ID card with its mobile fallback.

## Motion and accessibility

Keep visible keyboard focus and theme persistence. Respect `prefers-reduced-motion`: disable smooth scrolling and reduce animation and transition durations. Keep motion restrained and avoid decorative effects absent from the reference. Do not change article bodies, contact destinations, canonical URLs, sitemap entries or RSS entries when applying this visual system.

## Nidin management copy

The user authorised ordinary-file edits in the selected Open Design project for this follow-up. Nidin management copy uses `管理工程部門團隊，協助工作分派與技術決策。` and `Managed the engineering team and supported work allocation and technical decision-making.`. Role panels retain the technical-manager title without repeating that sentence. Nidin’s management headcount and its statistic card are removed from main Work, the case, both CV homes and both CV case studies. Main-site career metric cards stay unchanged; the CV replaces its three-card highlights with OpenAI. Other companies’ team sizes and the confirmed 55-delivery statement stay unchanged. The local design source uses matching three-column metrics, with two columns below 900px.

Writing navigation shows AI 日報, pstack and Harness² topic entries. The pstack and Harness² archives live at /posts/pstack and /posts/harness2, list only published canonical series members in reverse publication order, and reuse the shared writing cards and outline buttons. Keep the year-grouped archive, `all-posts`/article anchors and active public article URLs.

## Feature article preview

The pstack 0.15.26–0.15.30 article opts into a feature presentation through its frontmatter. This preview follows the layout of https://openai.com/index/decisions-api/ observed on 2026-10-23: centered title, compact audio/share row, sticky desktop outline, wide video and narrow reading column. Keep existing brand colors and font roles; do not force the reference's dark background.

Runtime geometry is scoped in `styles/article-feature.css`: `--feature-body-width` is 44rem and `--feature-media-width` is 60rem. The display title is at most 3.375rem with a 1.3 line height; body text now follows the shared Typeset docs preset. At 1150px and below the outline becomes a borderless expandable block below the video and caption, immediately before the article body; the replacement video keeps its 16:9 ratio at every width. Native video uses contain, never crop. Audio has no download link or menu, and video retains controlsList=nodownload. Existing article presentation stays the default.

Audio status feedback appears only when there is a message. Do not render an empty status paragraph or reserve its height while idle.

The feature template uses a Traditional Chinese publication date. Keep the share label and control dimensions unchanged during copying and success; show confirmation only in the conditional status region. The seek control has a 24px hit area and reserves no additional idle height. Playback and sharing stay on one flex row at mobile and desktop widths. At 600px and below, the row gap is 0.5rem and the progress track overlays the single top audio rule. The Decisions API reference was rechecked at 409px and 1440px on 2026-10-23; both showed playback and sharing on the same row. This is an observation at those widths, not a claim about every reference breakpoint. Desktop outline links use a reserved 2px location marker; mobile links provide at least 44px touch targets, collapse the shadcn/ui Collapsible on normal selection and focus the target heading. Modified clicks retain browser-native behavior. Feature geometry remains owned by `styles/article-feature.css`, using the existing runtime color and type tokens.

## Rendered content

All blog article bodies (including the pstack feature) and bilingual CV case-study MDX use typeset typeset-docs with max-w-[37em]. The user approved removal of prose/prose-sm, global .prose and feature-body typography, and styled MDX headings, lists, check icons and quotes. Official app/(frontend)/typeset.css is downloaded unchanged from https://ui.shadcn.com/typeset.css. The docs preset is 15px / 1.75 / 1.25em and uses Geist and Geist Mono variables loaded by both root layouts. Satoshi remains the site shell font. Semantic theme tokens preserve the Anthropic palette. The shared bilingual CV MDX renderer uses rehype-pretty-code with github-light/github-dark-dimmed and keepBackground false, preserving caller options and plugins. Code block backgrounds come only from Typeset; Shiki supplies dual-theme token text colors without code/span background overrides. Layout, heading IDs and scroll offsets, media controls, and Shiki dual-theme syntax colors remain functional owners; no typography classes are attached to plain markdown elements. Embedded components can opt out with not-typeset or data-not-typeset. Other presets are left untouched.

Wide tables use Typeset scroll wrappers with a named, keyboard-focusable region. The wrapper owns overflow while each child remains a semantic table. CV labels follow locale. The upstream stylesheet remains byte-identical and is excluded from automatic formatting.

The reference was rechecked against the user's mobile screenshot on 2026-10-23. Use only one thin rule above the audio utility. Do not add borders above/below the mobile outline or around the video stage. Space, sequence and typography group the hero, audio, video and body; the desktop outline and data-table separators keep their roles.
