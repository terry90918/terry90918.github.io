## 1. Config changes

- [x] 1.1 In `next.config.ts`: change `output: 'standalone'` to `output: 'export'`
- [x] 1.2 In `next.config.ts`: replace the `images` block with just `{ unoptimized: true }`
- [x] 1.3 In `next.config.ts`: delete the `headers()` function entirely (dead on static hosting)

## 2. Delete server-dependent code

- [x] 2.1 Delete `proxy.ts`
- [x] 2.2 Delete `app/(frontend)/api/health/`
- [x] 2.3 Delete `app/(frontend)/api/og/`
- [x] 2.4 Delete `Dockerfile`
- [x] 2.5 Remove `@vercel/og` from `package.json` dependencies (run `bun install` after to update lockfile) — also removed `sharp`, dead now that `images.unoptimized: true` disables the optimizer that used it
- [x] 2.6 Remove `export const revalidate = 3600` from `app/(frontend)/posts/[year]/[slug]/page.tsx`
- [x] 2.7 Remove `export const revalidate = 3600` from `app/(frontend)/rss.xml/route.ts`

## 3. URL and staging cleanup

- [x] 3.1 In `app/(frontend)/sitemap.ts`: change `baseUrl` from `https://blog.jurislm.com` to `https://terry90918.github.io`
- [x] 3.2 In `app/(frontend)/robots.ts`: remove the `STAGING` conditional branch, always return the production rules, update `sitemap` URL to `https://terry90918.github.io/sitemap.xml`
- [x] 3.3 In `app/(frontend)/layout.tsx`: update `openGraph.url` from `https://terry90918.dev` to `https://terry90918.github.io`
- [x] 3.4 In `app/(frontend)/rss.xml/route.ts`: update the `NEXT_PUBLIC_SITE_URL` fallback from `https://terry90918.dev` to `https://terry90918.github.io`

## 4. CI/CD

- [x] 4.1 Create `.github/workflows/deploy-pages.yml`: trigger on push to `main`, run `bun install` + `bun run build`, `touch out/.nojekyll`, upload `out/` with `actions/upload-pages-artifact`, deploy with `actions/deploy-pages` (set `permissions: pages: write, id-token: write`, `concurrency` group to avoid overlapping deploys)

## 5. Verify

- [x] 5.1 Run `bun run build` locally and confirm an `out/` directory is produced with no build errors — required adding `export const dynamic = 'force-static'` to `sitemap.ts` and `rss.xml/route.ts` (Next.js requires this for route handlers under `output: 'export'`), and removing two more stray `export const revalidate = 3600` found on `page.tsx` and `posts/page.tsx` (not originally listed in this task file, same category as 2.6/2.7)
- [x] 5.2 Serve `out/` locally (e.g. `npx serve out`) and click through: home, a post, `/posts`, `/about`, `/rss.xml`, `/sitemap.xml`, `/robots.txt` — confirm no broken links/404s and no references to the old Coolify domains — all pass except `/robots.txt`, which 404s; confirmed via `git stash` this is a pre-existing bug (present at HEAD before this change, unrelated to the migration) and filed as a separate follow-up rather than blocking this change
- [x] 5.3 Run `bun run typecheck`, `bun lint`, `bun run test` and confirm all pass — all green (66/66 unit tests)
- [x] 5.4 Grep the repo for `blog.jurislm.com`, `blog-dev.jurislm.com`, and `terry90918.dev` to confirm no leftover references outside of historical/archived docs — found and fixed two more: the `siteUrl`/`githubEditUrl` fallback in `posts/[year]/[slug]/page.tsx` and the environment tables in `README.md`

## 6. Docs

- [x] 6.1 Update `CLAUDE.md`: replace the Coolify Resources / Environments sections with the GitHub Pages URL and the new deploy workflow; remove staging-related gotchas that no longer apply — also updated `README.md`'s environment table and deployment section for the same reason

## 7. Repo rename (manual, outside code)

- [x] 7.1 Rename the GitHub repo to `terry90918.github.io` (`gh repo rename terry90918.github.io` or via Settings) — confirm with the user before running, since it changes the remote/clone URL — done via `gh repo rename`; local `origin` remote re-pointed to the SSH URL (renaming had switched it to HTTPS)
- [x] 7.2 In repo Settings → Pages, set the deployment source to "GitHub Actions" — the rename auto-enabled Pages with the legacy branch/Jekyll build; overrode it to `build_type: workflow` via `gh api -X PUT repos/.../pages`
- [x] 7.3 After the first workflow run, confirm `https://terry90918.github.io` serves the site correctly — `Deploy to GitHub Pages` run succeeded, site returns 200 with the expected title
