# About Editorial Profile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align the About page with the homepage's editorial profile rhythm while preserving Terry Chen's existing biography, activity chart, and public contact paths.

**Architecture:** Keep the implementation bounded to the static About route and its Playwright coverage. The page remains a server component; Tailwind utility classes express the responsive profile, section hierarchy, and focus styling without new dependencies or runtime data.

**Tech Stack:** Next.js 16 App Router, React, TypeScript, Tailwind CSS 4, Playwright, Bun, OpenSpec.

## Global Constraints

- Use the approved Traditional-Chinese professional narrative and retain the `ghchart.rshah.org/terry90918` contribution chart.
- Do not add forms, analytics, subscriptions, dependencies, or external services.
- Provide GitHub, X, LinkedIn, and `mailto:zxtw17985321@gmail.com` as visible contact links.
- Preserve token-based light/dark theming, visible keyboard focus, and no narrow-viewport horizontal overflow.
- Use the shared editorial content width; do not introduce a competing container width.

---

### Task 1: Define About-page behaviour with focused E2E coverage

**Files:**
- Modify: `tests/e2e/frontend-blog.spec.ts:90-114`
- Test: `tests/e2e/frontend-blog.spec.ts`

**Interfaces:**
- Consumes: rendered `/about` route and existing Playwright `page` fixture.
- Produces: regression coverage for profile layout, contribution chart, contact set, and narrow viewport behaviour.

- [ ] **Step 1: Write the failing desktop-profile test**

  Add a test that locates `[data-testid="about-profile"]`, asserts a horizontal desktop flex direction, and confirms its avatar measures at least 144px.

  ```ts
  test('uses an editorial profile composition on desktop', async ({ page }) => {
    const profile = page.getByTestId('about-profile')
    await expect(profile).toBeVisible()
    await expect(profile.locator('img[alt="Terry Chen avatar"]')).toHaveCSS('width', '160px')
    await expect(profile).toHaveCSS('flex-direction', 'row')
  })
  ```

- [ ] **Step 2: Run the desktop-profile test to verify Red**

  Run: `bunx playwright test tests/e2e/frontend-blog.spec.ts --project=frontend --grep 'editorial profile composition' --workers=1`

  Expected: FAIL because `about-profile` does not exist.

- [ ] **Step 3: Write the failing mobile and contact tests**

  Add a mobile test at `375 × 812` that asserts the profile stacks and `document.documentElement.scrollWidth <= window.innerWidth`. Add a contact test that asserts visible links named GitHub, X, LinkedIn, and Email, with Email pointing to `mailto:zxtw17985321@gmail.com`.

  ```ts
  test('stacks the profile without horizontal overflow on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    const profile = page.getByTestId('about-profile')
    await expect(profile).toHaveCSS('flex-direction', 'column')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  })
  ```

- [ ] **Step 4: Run the new mobile and contact tests to verify Red**

  Run: `bunx playwright test tests/e2e/frontend-blog.spec.ts --project=frontend --grep 'stacks the profile|four public contact' --workers=1`

  Expected: FAIL because the profile test id and Email link do not exist.

- [ ] **Step 5: Commit the Red coverage**

  ```bash
  git add tests/e2e/frontend-blog.spec.ts
  git commit -m "test: define About editorial profile behaviour"
  ```

### Task 2: Implement the responsive editorial profile and evidence sections

**Files:**
- Modify: `app/(frontend)/about/page.tsx:11-83`
- Test: `tests/e2e/frontend-blog.spec.ts`

**Interfaces:**
- Consumes: the data-testid and link assertions established in Task 1.
- Produces: a static, responsive About page with no new component or API boundary.

- [ ] **Step 1: Implement the profile block minimally**

  Wrap the existing portrait and biography in a `data-testid="about-profile"` flex container using `flex-col` by default and `sm:flex-row` at the site breakpoint. Change the portrait to `160 × 160` with a bounded mobile class, retaining `rounded-full`, current source, alt text, and `unoptimized`.

  ```tsx
  <div data-testid="about-profile" className="flex flex-col items-start gap-6 sm:flex-row sm:gap-8">
    <Image ... width={160} height={160} className="w-28 flex-shrink-0 rounded-full sm:w-40" />
    <div className="max-w-prose space-y-2">...</div>
  </div>
  ```

- [ ] **Step 2: Run the focused profile tests to verify Green**

  Run: `bunx playwright test tests/e2e/frontend-blog.spec.ts --project=frontend --grep 'editorial profile composition|stacks the profile' --workers=1`

  Expected: PASS.

- [ ] **Step 3: Tune the evidence and contact hierarchy**

  Keep the existing chart URL and meaningful alt text, but add responsive width constraints and section spacing. Give heading labels a semantic `h2`, retain their actual section meaning, and add Email after LinkedIn using the public mailto target. Apply the same visible focus treatment used by homepage contact links.

  ```tsx
  <Link href="mailto:zxtw17985321@gmail.com" className="text-accent rounded-sm hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
    Email — zxtw17985321@gmail.com
  </Link>
  ```

- [ ] **Step 3a: Replace the compact English bio with the approved Traditional-Chinese narrative**

  Replace only the biography text with these three paragraphs; do not add claims beyond them:

  ```tsx
  <p>我在台北打造 AI 產品，讓複雜的法律與營運工作轉化為可靠、可落地的系統。</p>
  <p>我從產品方向一路做到正式環境：AI agents、檢索系統與產品工程，讓模型真正接上真實工作流程。</p>
  <p>目前持續推進 JurisLM 的開源專案，包括 judicial-mcp、coolify-mcp 與 hetzner-mcp。</p>
  ```

- [ ] **Step 4: Run focused About tests to verify Green**

  Run: `bunx playwright test tests/e2e/frontend-blog.spec.ts --project=frontend --grep '/about page|four public contact' --workers=1`

  Expected: PASS.

- [ ] **Step 5: Commit the implementation**

  ```bash
  git add 'app/(frontend)/about/page.tsx' tests/e2e/frontend-blog.spec.ts
  git commit -m "feat: align About editorial profile"
  ```

### Task 3: Complete repository and visual acceptance

**Files:**
- Modify: `openspec/changes/align-about-editorial-profile/tasks.md`
- Test: `tests/e2e/frontend-blog.spec.ts`

**Interfaces:**
- Consumes: the route and test coverage from Tasks 1 and 2.
- Produces: verified local evidence for PR review and deployment.

- [ ] **Step 1: Run the full local verification suite**

  Run:

  ```bash
  bun run typecheck
  bun lint
  bun run test
  bunx playwright test tests/e2e/frontend-blog.spec.ts --project=frontend --workers=1
  bun run build
  npx openspec validate align-about-editorial-profile --strict
  ```

  Expected: every command exits with status 0.

- [ ] **Step 2: Inspect live local behaviour in both themes**

  Serve the built export, inspect `/about` at desktop and 375px wide, and verify portrait sizing, chart legibility, contact links, visible focus, theme switch, and no console errors.

- [ ] **Step 3: Mark verified tasks and commit acceptance evidence**

  Update the completed checkboxes in `openspec/changes/align-about-editorial-profile/tasks.md`, then commit the verification record.

  ```bash
  git add openspec/changes/align-about-editorial-profile/tasks.md
  git commit -m "docs(openspec): record About profile acceptance"
  ```
