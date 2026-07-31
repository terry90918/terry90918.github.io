# Environment inventory

## Repository state

- Repository: `terry90918/terry90918.github.io`
- Base: live-fetched `origin/main` at `0ca9875`
- Tracking issue: #31
- Isolated branch/worktree: `codex/align-homepage-visual-rhythm`
- The primary worktree was left untouched because it was five commits behind and contained
  identity/content changes plus generated-image additions.

## Current implementation

- Next.js 16 static site using React 19 and Tailwind CSS 4.
- Homepage: `app/(frontend)/page.tsx`.
- Persistent header: `components/BlogHeader.tsx`.
- Global tokens and typography: `app/(frontend)/globals.css`.
- Focused browser coverage: `tests/e2e/frontend-blog.spec.ts`.
- No database, schema, credential, runtime API, or server migration is involved.

## Live visual evidence

Measured on 2026-07-31 at the same 1046px-wide Chrome viewport:

| Surface            | Terry production |                steipete reference |
| ------------------ | ---------------: | --------------------------------: |
| Header height      |             57px |                              85px |
| Main/content width |            768px | approximately 736px visual column |
| Portrait           |             48px |                             160px |
| Hero heading       |      24px / 32px |                       30px / 36px |
| Hero composition   |          stacked |              portrait beside copy |
| Post treatment     |    bordered rows |                   open whitespace |

## Existing relevant history

- The archived `rename-homepage-identity` change established the exact `Terry.TY Chen` public
  labels and unchanged social destinations.
- `origin/main` already contains the follow-up homepage tagline update.
- No active OpenSpec change covers homepage layout or visual rhythm.
- An issue search across open and closed issues found no existing homepage visual-alignment issue.

## Verification path

- Red/Green focused E2E test.
- Typecheck, lint, unit tests, production static build, and `openspec validate --strict`.
- Local static-export browser inspection at desktop and mobile widths.
- After delivery, GitHub Actions/GitHub Pages commit verification and canonical production
  readback.
