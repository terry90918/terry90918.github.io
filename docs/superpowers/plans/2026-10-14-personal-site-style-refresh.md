# Personal Site Style Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task by task. Steps use checkbox syntax for tracking.

**Goal:** Apply the approved Open Design visual system to the existing public site and bilingual CV without changing current content or routes.

**Architecture:** Keep the Next.js App Router, React components, data sources, and route structure. Use one shared local Satoshi font and one global semantic token set; map Tailwind and CV styles to those tokens. Restyle the existing page components and add the reference mobile navigation to the shared header.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4, `next-themes`, `next/font/local`, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-14-personal-site-style-refresh-design.md`

## Global Constraints

- Preserve existing copy, images, data, routes, canonicals, metadata, sitemap, RSS, and article bodies.
- Use Open Design files and the current preview for visual direction; never copy its older copy or single-page router into the product.
- Use the existing local Satoshi font assets; add no dependency or remote font request.
- Keep `--brand`, `--accent` link text, and `--accent-surface` as separate roles; filled orange controls use the brand role.
- Keep `data-theme`, theme persistence, visible focus, reduced-motion behavior, CV language and section navigation, custom cursor, and the interactive React Three/physics ID card with its mobile fallback.
- Use the approved light/dark values and 1120px content width from the spec.
- Keep the root checkout and its untracked article untouched; work only in the isolated worktree.
- Add no code comments.
- For Playwright checks, start the documented app server with `bun run dev --port 3001` in a separate terminal and set `BASE_URL=http://localhost:3001`.

## Review Focus

- **At 320px, long Chinese headings or English CV labels overflow.** Verify the home, work, writing, and both CV locales at 320px and 375px; assert document width does not exceed the viewport.
- **The collapsed navigation opens but does not return to the page by keyboard.** Test Enter/Space activation, Escape, link navigation, focus visibility, and `aria-expanded` in `frontend-blog.spec.ts`.
- **Dark-mode text or focus color becomes unreadable after replacing the blue palette.** Test the semantic light/dark tokens and inspect representative pages in both themes.
- **The shared shell changes the structure of pages without a design reference.** Verify one article, a CV case study, and a full CV contact page retain their route, copy, and page-specific layout.
- **Restyling removes or delays the real CV ID card.** Keep the existing desktop model and mobile fallback assertions in `frontend-cv.spec.ts` passing.

---

### Task 1: Establish shared visual tokens and typography

**Files:**

- Create: `DESIGN.md`
- Create: `lib/site/fonts.ts`
- Modify: `README.md`
- Modify: `app/(frontend)/globals.css`
- Modify: `app/(frontend)/layout.tsx`
- Modify: `components/cv/cv-layout.tsx`
- Modify: `styles/cv.css`
- Modify: `openspec/specs/homepage-visual-rhythm/spec.md`
- Modify: `tests/e2e/frontend-performance.spec.ts`
- Modify: `tests/e2e/frontend-cv.spec.ts`
- Delete: `app/(frontend)/fonts.ts`

**Interfaces:**

- `lib/site/fonts.ts` exports one `satoshi` `next/font/local` configuration using the existing 400, 500, 700, and 900 font files.
- Both root layouts apply `satoshi.variable`; global CSS uses `var(--font-satoshi)` with the spec's Chinese fallbacks.
- Global CSS owns the light/dark semantic token values; `@theme` and CV utility aliases consume those values.

- [ ] **Step 1: Change the font and CV palette E2E contracts first.** In `frontend-performance.spec.ts`, assert that a main page loads the local Satoshi asset and does not request Google Fonts; keep the existing check that main pages do not fetch CV model assets. In `frontend-cv.spec.ts`, assert that the root `--brand` token is exactly `#ff5c00`.
- [ ] **Step 2: Run focused E2E tests and confirm RED.** Run `BASE_URL=http://localhost:3001 bunx playwright test --project=frontend tests/e2e/frontend-performance.spec.ts tests/e2e/frontend-cv.spec.ts -g "main portrait|CV opens inside"`. Expected: the new local-font assertion fails on the current Atkinson/monospace implementation and the missing `--brand` token assertion fails.
- [ ] **Step 3: Share the local font configuration.** Add the exported `satoshi` config in `lib/site/fonts.ts`, apply it in the public `RootLayout` and CV `CvLayout`, and remove the unused `app/(frontend)/fonts.ts` placeholder.
- [ ] **Step 4: Map the accepted palette once.** Replace the current light/dark values in `globals.css`, remove the remote Atkinson import, and map Tailwind aliases for `brand`, `brand-foreground`, `accent` link text, `accent-ink`, and `accent-surface` to the spec values. Update `styles/cv.css` to consume the shared palette and remove its conflicting dotted background.
- [ ] **Step 5: Record the durable design authority.** Add `DESIGN.md` with the accepted values, font fallback, layout width, shape, and motion rules; replace the stale README accent table with a link to it. Update `homepage-visual-rhythm/spec.md` to point visual rules to `DESIGN.md` and remove the old 46rem/160px portrait requirements while retaining content order and route behavior.
- [ ] **Step 6: Run focused E2E tests and confirm GREEN.** Run `BASE_URL=http://localhost:3001 bunx playwright test --project=frontend tests/e2e/frontend-performance.spec.ts tests/e2e/frontend-cv.spec.ts -g "main portrait|CV opens inside"`. Expected: local font is requested, Google Fonts is not, the root `--brand` token is `#ff5c00`, and CV model assets remain absent from main pages.
- [ ] **Step 7: Commit the foundation.** `git add DESIGN.md README.md 'app/(frontend)/globals.css' 'app/(frontend)/layout.tsx' 'app/(frontend)/fonts.ts' components/cv/cv-layout.tsx lib/site/fonts.ts styles/cv.css openspec/specs/homepage-visual-rhythm/spec.md tests/e2e/frontend-performance.spec.ts tests/e2e/frontend-cv.spec.ts && git commit -m "style: establish personal site design tokens"`

### Task 2: Restyle the shared site shell and add mobile navigation

**Files:**

- Modify: `components/BlogHeader.tsx`
- Modify: `components/BlogFooter.tsx`
- Modify: `tests/e2e/frontend-blog.spec.ts`

**Interfaces:**

- The desktop `主要導覽` links keep their existing `href` values.
- The mobile menu button is named `開啟導覽`, exposes `aria-expanded`, and toggles a `手機導覽` navigation containing the same destinations.
- Activating a menu link or Escape closes the panel; closing restores a usable focus target.

- [ ] **Step 1: Add the failing mobile-menu E2E case.** In `frontend-blog.spec.ts`, at 375px verify the menu starts closed, opens by keyboard, exposes all current destinations, closes on Escape, and closes after navigating to About. Update the existing navigation test so desktop checks the desktop nav and mobile checks the menu button.
- [ ] **Step 2: Run the focused E2E case and confirm RED.** Run `BASE_URL=http://localhost:3001 bunx playwright test --project=frontend tests/e2e/frontend-blog.spec.ts -g "mobile navigation"`. Expected: no mobile menu button exists yet.
- [ ] **Step 3: Implement the reference header layout.** In `BlogHeader.tsx`, place wordmark, desktop links, contact, theme toggle, and the mobile menu control in one responsive row. Keep all URLs and the CV prefetch behavior. Add accurate expanded state, Escape handling, link-close behavior, and visible focus styles.
- [ ] **Step 4: Align the footer width and link treatment.** In `BlogFooter.tsx`, use the shared 1120px width and new semantic colors while preserving social URLs and license copy.
- [ ] **Step 5: Run focused and existing shell E2E cases.** Run `BASE_URL=http://localhost:3001 bunx playwright test --project=frontend tests/e2e/frontend-blog.spec.ts -g "navigation|theme toggle|footer|mobile navigation"`. Expected: desktop links and mobile open/close/navigation all pass.
- [ ] **Step 6: Commit the shell.** `git add components/BlogHeader.tsx components/BlogFooter.tsx tests/e2e/frontend-blog.spec.ts && git commit -m "style: align shared site navigation"`

### Task 3: Apply the reference styling to main-site page families

**Files:**

- Modify: `app/(frontend)/layout.tsx`
- Modify: `app/(frontend)/page.tsx`
- Modify: `app/(frontend)/about/page.tsx`
- Modify: `app/(frontend)/story/page.tsx`
- Modify: `app/(frontend)/work/page.tsx`
- Modify: `app/(frontend)/work/[slug]/page.tsx`
- Modify: `app/(frontend)/posts/page.tsx`
- Modify: `app/(frontend)/posts/ai-daily/page.tsx`
- Modify: `app/(frontend)/posts/[year]/[slug]/page.tsx`
- Modify: `components/SiteContact.tsx`
- Modify: `components/WritingPostCard.tsx`
- Modify: `tests/e2e/frontend-blog.spec.ts`

**Interfaces:**

- All data continues to come from the existing `lib/site` and `lib/posts` sources.
- All links continue to use the existing Next.js route paths and metadata functions.
- Article detail markup remains governed by its current page component and `.prose` rules.

- [ ] **Step 1: Restyle the home composition.** Set the shared public `<main>` width from `--editorial-width` in the root layout, then apply the reference's desktop profile image/introduction layout, section spacing, experience cards, recent-update cards, work cards, and contact panel using the existing data and destinations. Keep the article detail's own narrow reading-width class intact.
- [ ] **Step 2: Restyle About, Story, Work, and work-case pages.** Apply the reference's page intro, two-column/single-column sections, cards, dividers, and case detail hierarchy without changing copy or case data.
- [ ] **Step 3: Restyle Writing index and AI Daily.** Apply the shared typography, spacing, date/label hierarchy, and list surfaces to `WritingPostCard` consumers without changing post filters, counts, ordering, or URLs. In the article page, change only utility roles for link and accent colors; preserve its markup and `.prose` layout.
- [ ] **Step 4: Assert the link contrast tokens.** In `frontend-blog.spec.ts`, assert a representative link computes to `rgb(184, 59, 8)` in light mode and `rgb(255, 140, 80)` in dark mode.
- [ ] **Step 5: Run the existing content and route E2E suite.** Run `BASE_URL=http://localhost:3001 bunx playwright test --project=frontend tests/e2e/frontend-blog.spec.ts`. Expected: current homepage order, all existing article URLs, work cases, RSS assertions, theme behavior, link colors, and anchor offsets pass.
- [ ] **Step 6: Commit the main-page styling.** `git add 'app/(frontend)/layout.tsx' 'app/(frontend)/page.tsx' 'app/(frontend)/about/page.tsx' 'app/(frontend)/story/page.tsx' 'app/(frontend)/work/page.tsx' 'app/(frontend)/work/[slug]/page.tsx' 'app/(frontend)/posts/page.tsx' 'app/(frontend)/posts/ai-daily/page.tsx' 'app/(frontend)/posts/[year]/[slug]/page.tsx' components/SiteContact.tsx components/WritingPostCard.tsx tests/e2e/frontend-blog.spec.ts && git commit -m "style: apply design system to public pages"`

### Task 4: Align the bilingual CV presentation

**Files:**

- Modify: `components/cv/cv-layout.tsx`
- Modify: `components/cv/cv-home.tsx`
- Modify: `components/cv/home/hero/hero.tsx`
- Modify: `components/cv/home/experience/experience.tsx`
- Modify: `components/cv/shared/eyebrow/eyebrow.tsx`
- Modify: `components/cv/shared/featured-works/featured-works.tsx`
- Modify: `components/cv/shared/featured-works/featured-work-card.tsx`
- Modify: `components/cv/layout/nav-dock.tsx`
- Modify: `components/cv/ui/timeline.tsx`
- Modify: `components/cv/mdx-content.tsx`
- Modify: `components/cv/case-study/reading-progress-pill.tsx`
- Modify: `app/(cv)/cv/[locale]/contact/page.tsx`
- Modify: `components/cv/ui/card.tsx`
- Modify: `styles/cv.css`
- Modify: `tests/e2e/frontend-cv.spec.ts`
- Delete: `components/cv/layout/edge-blur.tsx`

**Interfaces:**

- `NavDock` keeps current locale and section destination calculations and `aria-current` behavior while matching the reference's horizontal sticky section navigation.
- Existing `DesktopIdCard` and `id-card.tsx` physics remain unchanged.

- [ ] **Step 1: Add a failing sticky-section-navigation E2E case.** In `frontend-cv.spec.ts`, at 375px and 320px assert that the nav's top is below the shared header and no more than 120px below its bottom.
- [ ] **Step 2: Run the focused CV case and confirm RED.** Run `BASE_URL=http://localhost:3001 bunx playwright test --project=frontend tests/e2e/frontend-cv.spec.ts -g "section navigation remains below the header"`. Expected: the current fixed-bottom mobile dock fails the 120px maximum offset assertion.
- [ ] **Step 3: Restyle shared CV sections and cards.** Align hero, profile stats, works, experience, education, skills, contact, eyebrow, and card surfaces with the new tokens and reference spacing in both locales. Use `brand` for filled dots/progress/controls, `accent-surface` for selected navigation, and `accent-ink` for readable emphasized text.
- [ ] **Step 4: Align CV shell and section navigation.** Increase the content width to the reference width, replace the floating dock presentation with the horizontal sticky navigation, remove the unreferenced edge blur and its mobile bottom-padding compensation, and retain the language switch, custom cursor, measured header offset, and reduced-motion behavior.
- [ ] **Step 5: Run CV E2E and confirm GREEN.** Run `BASE_URL=http://localhost:3001 bunx playwright test --project=frontend tests/e2e/frontend-cv.spec.ts`. Expected: both locales, section navigation, contact/case routes, no horizontal overflow, and the real desktop/mobile ID-card behavior pass.
- [ ] **Step 6: Commit the CV styling.** `git add components/cv/cv-layout.tsx components/cv/cv-home.tsx components/cv/home/hero/hero.tsx components/cv/home/experience/experience.tsx components/cv/shared/eyebrow/eyebrow.tsx components/cv/shared/featured-works/featured-works.tsx components/cv/shared/featured-works/featured-work-card.tsx components/cv/layout/nav-dock.tsx components/cv/layout/edge-blur.tsx components/cv/ui/card.tsx components/cv/ui/timeline.tsx components/cv/mdx-content.tsx components/cv/case-study/reading-progress-pill.tsx styles/cv.css 'app/(cv)/cv/[locale]/contact/page.tsx' tests/e2e/frontend-cv.spec.ts && git commit -m "style: align bilingual cv with site design"`

### Task 5: Verify delivery gates and prepare the pull request

**Files:**

- No new product files; verification and PR metadata only.

**Interfaces:**

- The final PR contains the four implementation task commits and remains limited to style, shared navigation, design documentation, and relevant existing E2E assertions.

- [x] **Step 1: Run full-project local gates.** Run `bun lint`, `bun run typecheck`, `bun run test`, and `bun run build` on the final branch head.
- [x] **Step 2: Run frontend E2E.** With the app server from the Global Constraints running, execute `BASE_URL=http://localhost:3001 bunx playwright test --project=frontend`. Expected: all frontend routes and interaction checks pass, including existing article/RSS and CV export assertions.
- [x] **Step 3: Inspect rendered pages in the in-app browser.** Compare the home, story, work, posts, and both CV locales at desktop, 375px, and 320px; check light/dark themes, menu open/close, keyboard focus, reduced motion, and article/CV detail exclusions.
- [ ] **Step 4: Inspect the final diff and required CI.** Confirm no content, route, metadata, RSS, or unrelated files changed. Read the matching Woodpecker pipeline if configured and the required GitHub checks on the current head.
- [ ] **Step 5: Open a Ready PR and complete JT reviews.** Let one Codex review and one CodeRabbit review finish; resolve actionable findings and verify those changes without requesting duplicate full reviews.
- [ ] **Step 6: Merge, pull, and read back.** After review, full lint, required checks, and mergeability pass, merge under the user's authorization, pull the merge commit into the root checkout without touching its untracked article, and read back the pulled head plus the deployed site when deployment completes.

## Execution Handoff

Execution method approved in-session: Subagent-driven, with one implementer and an independent reviewer per sequential task.
