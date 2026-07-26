# AI Daily Source-Date Correction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Manually reconcile every July 2026 AI daily article with its Gmail source date, then add the two missing source-date articles.

**Architecture:** Work oldest-to-newest so each renamed file frees the next date before it is needed. Every existing article is independently read against one exact Gmail message, renamed with `apply_patch`, verified, and committed alone; the two missing articles then pass separate fact-review and Traditional-Chinese polish gates.

**Tech Stack:** Gmail connector, Markdown/YAML frontmatter, Bun, Vitest, Git, GitHub Actions, GitHub Pages.

## Global Constraints

- Do not write or run a batch rename/content-mutation script.
- Do not modify the automation prompt or schedule.
- Do not create redirects or preserve legacy URLs.
- Do not change existing article titles, body facts, prose, or source links.
- For an existing article, change only its filesystem path, `slug`, and `publishedAt`.
- Each article correction or new article gets its own commit.
- Keep `.codex/` source material untracked.
- New articles require a fact/copyright reviewer and a separate Traditional-Chinese polish agent.
- Do not push until every individual article task is committed and verified.

---

## Existing Article Corrections

Each task uses this verification command after the edit:

```bash
bun run test tests/unit/markdown-loader.test.ts
```

The expected result is that the markdown-loader test file passes. The subsequent commit hook must also pass format, lint, typecheck, all 68 unit tests, and all five OpenSpec validations.

### Task 1: Correct July 7 article to July 6 source

**Files:** Move `content/posts/2026/ai-daily-2026-07-07.md` to `content/posts/2026/ai-daily-2026-07-06.md`.

- [ ] Read Gmail message `19f36e2ecb69c126` and the full article; confirm the Hollywood, education/pharma, and Meta test topics belong to the July 6 source.
- [ ] Move the file with `apply_patch`.
- [ ] Set `publishedAt: '2026-07-06T05:00:00+08:00'` and `slug: 'ai-daily-2026-07-06'`.
- [ ] Run the markdown-loader test and inspect `git diff --check`.
- [ ] Commit only this rename with `chore(content): align AI digest with source date 2026-07-06`.

### Task 2: Correct July 8 article to July 7 source

**Files:** Move `content/posts/2026/ai-daily-2026-07-08.md` to `content/posts/2026/ai-daily-2026-07-07.md`.

- [ ] Read Gmail message `19f3c083fe3b5958` and the full article; confirm the AI infrastructure and capital topics belong to the July 7 source.
- [ ] Move the file with `apply_patch`.
- [ ] Set `publishedAt: '2026-07-07T05:00:00+08:00'` and `slug: 'ai-daily-2026-07-07'`.
- [ ] Run the markdown-loader test and inspect `git diff --check`.
- [ ] Commit only this rename with `chore(content): align AI digest with source date 2026-07-07`.

### Task 3: Correct July 9 article to July 8 source

**Files:** Move `content/posts/2026/ai-daily-2026-07-09.md` to `content/posts/2026/ai-daily-2026-07-08.md`.

- [ ] Read Gmail message `19f4134219eb4a18` and the full article; confirm the central-bank, Anthropic-listing, and Microsoft-cost topics belong to the July 8 source.
- [ ] Move the file with `apply_patch`.
- [ ] Set `publishedAt: '2026-07-08T05:00:00+08:00'` and `slug: 'ai-daily-2026-07-08'`.
- [ ] Run the markdown-loader test and inspect `git diff --check`.
- [ ] Commit only this rename with `chore(content): align AI digest with source date 2026-07-08`.

### Task 4: Correct July 10 article to July 9 source

**Files:** Move `content/posts/2026/ai-daily-2026-07-10.md` to `content/posts/2026/ai-daily-2026-07-09.md`.

- [ ] Read Gmail message `19f46584c11fb17f` and the full article; confirm the interpreter, Reddit moderation, and DeepSeek hardware topics belong to the July 9 source.
- [ ] Move the file with `apply_patch`.
- [ ] Set `publishedAt: '2026-07-09T05:00:00+08:00'` and `slug: 'ai-daily-2026-07-09'`.
- [ ] Run the markdown-loader test and inspect `git diff --check`.
- [ ] Commit only this rename with `chore(content): align AI digest with source date 2026-07-09`.

### Task 5: Correct July 11 article to first July 10 source article

**Files:** Move `content/posts/2026/ai-daily-2026-07-11.md` to `content/posts/2026/ai-daily-2026-07-10-model-access.md`.

- [ ] Read Gmail message `19f4ba56f0082476` and the full article; confirm its GPT, algorithm-discovery, and distribution-gate topics belong to the July 10 source.
- [ ] Move the file with `apply_patch`.
- [ ] Set `publishedAt: '2026-07-10T05:00:00+08:00'` and `slug: 'ai-daily-2026-07-10-model-access'`.
- [ ] Run the markdown-loader test and inspect `git diff --check`.
- [ ] Commit only this rename with `chore(content): align model access digest with source date`.

### Task 6: Correct July 12 article to second July 10 source article

**Files:** Move `content/posts/2026/ai-daily-2026-07-12.md` to `content/posts/2026/ai-daily-2026-07-10-ai-rules.md`.

- [ ] Read Gmail message `19f4ba56f0082476` and the full article; confirm its rule-setting and AI-governance topics also derive from the July 10 source.
- [ ] Move the file with `apply_patch`.
- [ ] Set `publishedAt: '2026-07-10T05:00:00+08:00'` and `slug: 'ai-daily-2026-07-10-ai-rules'`.
- [ ] Run the markdown-loader test and inspect `git diff --check`.
- [ ] Commit only this rename with `chore(content): align AI rules digest with source date`.

### Task 7: Correct July 14 article to July 13 source

**Files:** Move `content/posts/2026/ai-daily-2026-07-14.md` to `content/posts/2026/ai-daily-2026-07-13.md`.

- [ ] Read Gmail message `19f5afed2176b8b1` and the full article; confirm the Grok code, Apple/OpenAI device, and Manus topics belong to the July 13 source.
- [ ] Move the file with `apply_patch`.
- [ ] Set `publishedAt: '2026-07-13T05:00:00+08:00'` and `slug: 'ai-daily-2026-07-13'`.
- [ ] Run the markdown-loader test and inspect `git diff --check`.
- [ ] Commit only this rename with `chore(content): align AI digest with source date 2026-07-13`.

### Task 8: Correct July 15 article to July 14 source

**Files:** Move `content/posts/2026/ai-daily-2026-07-15.md` to `content/posts/2026/ai-daily-2026-07-14.md`.

- [ ] Read Gmail message `19f60312b79e0274` and the full article; confirm the SK Hynix, Microsoft/model-maker, and Meta community-cost topics belong to the July 14 source.
- [ ] Move the file with `apply_patch`.
- [ ] Set `publishedAt: '2026-07-14T05:00:00+08:00'` and `slug: 'ai-daily-2026-07-14'`.
- [ ] Run the markdown-loader test and inspect `git diff --check`.
- [ ] Commit only this rename with `chore(content): align AI digest with source date 2026-07-14`.

### Task 9: Correct July 16 article to July 15 source

**Files:** Move `content/posts/2026/ai-daily-2026-07-16.md` to `content/posts/2026/ai-daily-2026-07-15.md`.

- [ ] Read Gmail message `19f655053968338f` and the full article; confirm the antibody, IBM-budget, and science-market topics belong to the July 15 source.
- [ ] Move the file with `apply_patch`.
- [ ] Set `publishedAt: '2026-07-15T05:00:00+08:00'` and `slug: 'ai-daily-2026-07-15'`.
- [ ] Run the markdown-loader test and inspect `git diff --check`.
- [ ] Commit only this rename with `chore(content): align AI digest with source date 2026-07-15`.

### Task 10: Correct July 17 article to July 16 source

**Files:** Move `content/posts/2026/ai-daily-2026-07-17.md` to `content/posts/2026/ai-daily-2026-07-16.md`.

- [ ] Read Gmail message `19f6a71fb08b1e4f` and the full article; confirm the responsibility, Grok, and Neo robotics topics belong to the July 16 source.
- [ ] Move the file with `apply_patch`.
- [ ] Set `publishedAt: '2026-07-16T05:00:00+08:00'` and `slug: 'ai-daily-2026-07-16'`.
- [ ] Run the markdown-loader test and inspect `git diff --check`.
- [ ] Commit only this rename with `chore(content): align AI digest with source date 2026-07-16`.

### Task 11: Correct July 20 article to July 17 source

**Files:** Move `content/posts/2026/ai-daily-2026-07-20.md` to `content/posts/2026/ai-daily-2026-07-17.md`.

- [ ] Read Gmail message `19f6f903a2b33049` and the full article; confirm Kimi K3, EU/Google, and Netflix topics belong to the July 17 source.
- [ ] Move the file with `apply_patch`.
- [ ] Set `publishedAt: '2026-07-17T05:00:00+08:00'` and `slug: 'ai-daily-2026-07-17'`.
- [ ] Run the markdown-loader test and inspect `git diff --check`.
- [ ] Commit only this rename with `chore(content): align AI digest with source date 2026-07-17`.

### Task 12: Correct July 21 article to July 20 source

**Files:** Move `content/posts/2026/ai-daily-2026-07-21.md` to `content/posts/2026/ai-daily-2026-07-20.md`.

- [ ] Read Gmail message `19f7f11d818d0687` and the full article; confirm CardiOmicScore belongs to the July 20 source.
- [ ] Move the file with `apply_patch`.
- [ ] Set `publishedAt: '2026-07-20T05:00:00+08:00'` and `slug: 'ai-daily-2026-07-20'`.
- [ ] Run the markdown-loader test and inspect `git diff --check`.
- [ ] Commit only this rename with `chore(content): align AI digest with source date 2026-07-20`.

### Task 13: Correct July 22 article to July 21 source

**Files:** Move `content/posts/2026/ai-daily-2026-07-22.md` to `content/posts/2026/ai-daily-2026-07-21.md`.

- [ ] Read Gmail message `19f8431ddad70195` and the full article; confirm the Anthropic settlement and OpenAI unit-distance topics belong to the July 21 source.
- [ ] Move the file with `apply_patch`.
- [ ] Set `publishedAt: '2026-07-21T05:00:00+08:00'` and `slug: 'ai-daily-2026-07-21'`.
- [ ] Run the markdown-loader test and inspect `git diff --check`.
- [ ] Commit only this rename with `chore(content): align AI digest with source date 2026-07-21`.

### Task 14: Disambiguate first July 24 article

**Files:** Move `content/posts/2026/ai-daily-2026-07-24.md` to `content/posts/2026/ai-daily-2026-07-24-system-competition.md`.

- [ ] Read Gmail message `19f939a210cae77e` and the full article; confirm Gemini, BigMac, and Jacob Tsimerman topics belong to the July 24 source.
- [ ] Move the file with `apply_patch`.
- [ ] Keep `publishedAt: '2026-07-24T05:00:00+08:00'` and set `slug: 'ai-daily-2026-07-24-system-competition'`.
- [ ] Run the markdown-loader test and inspect `git diff --check`.
- [ ] Commit only this rename with `chore(content): disambiguate July 24 AI systems digest`.

### Task 15: Correct July 26 article to second July 24 source article

**Files:** Move `content/posts/2026/ai-daily-2026-07-26.md` to `content/posts/2026/ai-daily-2026-07-24-bigmac.md`.

- [ ] Read Gmail message `19f939a210cae77e` and the full article; confirm BigMac belongs to the July 24 source.
- [ ] Move the file with `apply_patch`.
- [ ] Set `publishedAt: '2026-07-24T05:00:00+08:00'` and `slug: 'ai-daily-2026-07-24-bigmac'`.
- [ ] Run the markdown-loader test and inspect `git diff --check`.
- [ ] Commit only this rename with `chore(content): align BigMac digest with source date`.

## Missing Articles

### Task 16: Create the July 22 source article

**Files:** Create `.codex/ai-daily-source-2026-07-22-email.txt` and `content/posts/2026/ai-daily-2026-07-22.md`.

- [ ] Read Gmail message `19f895651543146c` in full and create a sanitized plain-text source file.
- [ ] Research first-party or original-reporting sources for the OpenAI/Hugging Face agent-safety incident; exclude Hermes-vs-OpenClaw claims that cannot be independently verified.
- [ ] Write an original Traditional-Chinese article with `publishedAt: '2026-07-22T05:00:00+08:00'` and `slug: 'ai-daily-2026-07-22'`.
- [ ] Dispatch an independent reviewer to return A1–A3 and B1–B4 PASS/FAIL using Exa; revise and repeat up to three rounds.
- [ ] After PASS, dispatch a separate Traditional-Chinese polish agent that cannot change facts, names, numbers, or links.
- [ ] Run the markdown-loader test and inspect `git diff --check`.
- [ ] Commit only the article with `chore(content): backfill AI daily digest 2026-07-22`; leave `.codex/` untracked.

### Task 17: Create the July 23 source article

**Files:** Create `.codex/ai-daily-source-2026-07-23-email.txt` and `content/posts/2026/ai-daily-2026-07-23.md`.

- [ ] Read Gmail message `19f8e80520f13d7e` in full and create a sanitized plain-text source file.
- [ ] Research first-party or original-reporting sources for the U.S. Department of Energy Genesis Mission projects and related AI/science infrastructure facts; exclude speculative market commentary.
- [ ] Write an original Traditional-Chinese article with `publishedAt: '2026-07-23T05:00:00+08:00'` and `slug: 'ai-daily-2026-07-23'`.
- [ ] Dispatch an independent reviewer to return A1–A3 and B1–B4 PASS/FAIL using Exa; revise and repeat up to three rounds.
- [ ] After PASS, dispatch a separate Traditional-Chinese polish agent that cannot change facts, names, numbers, or links.
- [ ] Run the markdown-loader test and inspect `git diff --check`.
- [ ] Commit only the article with `chore(content): backfill AI daily digest 2026-07-23`; leave `.codex/` untracked.

## Final Publication

### Task 18: Publish and verify all corrected articles

**Files:** No additional content files.

- [ ] Confirm `git status -sb` shows only the intended local commits plus untracked `.codex/`.
- [ ] Run `bun run build` and require exit code 0.
- [ ] Run `git pull --rebase origin main`.
- [ ] Push `main` to `origin`.
- [ ] Watch the matching GitHub Pages workflow to successful completion.
- [ ] Read every new canonical URL without a trailing slash; require HTTP 200, the correct title, and one article-specific key phrase.
- [ ] Confirm the removed legacy URLs return 404 as explicitly accepted by the user.
