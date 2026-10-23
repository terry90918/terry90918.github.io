# pstack Editorial Layout Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans for inline implementation of these local preview tasks.

**Goal:** Preview the reference article layout on the pstack article only.

**Architecture:** An optional typed frontmatter presentation selects the feature template. Markdown rendering exposes heading outlines; audio and navigation use small client components. Existing article rendering remains the default.

**Tech Stack:** Next.js, React, TypeScript, existing unified Markdown pipeline, CSS theme tokens.

**Spec:** docs/superpowers/specs/2026-10-23-pstack-editorial-layout-design.md

## Global Constraints

No code comments. Preserve canonical URL, source links, theme tokens, no-download controls, portrait video proportions and sibling article behavior. Local preview only.

## Tasks

- [x] Write failing boundary and outline tests for the presentation metadata and heading IDs.
- [x] Add optional presentation types and parsing, collect actual h2 heading IDs without changing default render output.
- [x] Add the opt-in article template with audio controls, share feedback, sticky outline and responsive video.
- [x] Move this article's media into its presentation metadata, retaining other body text.
- [x] Add scoped CSS and DESIGN.md notes; verify desktop, narrow, theme, playback, seek, copy and navigation.
- [x] Run formatter, full lint, typecheck, relevant tests and production build; leave reviewable local preview.

## Review Focus

- Invalid or unsafe frontmatter media paths must fail at the loader boundary.
- Rendered heading IDs and outline links must match, including duplicate and non-ASCII headings.
- Playback loading/failure, clipboard failure and seeking must give truthful UI feedback.
- Desktop outline and long tables must not cause narrow-viewport overflow.
- Articles without the presentation option must retain their current behavior.

## Verification notes

Media replacement uses the user-supplied 1280×720, 406.07-second file. Browser playback, seek to 120 seconds, copy feedback, desktop/mobile anchors, media error and recovery, 320/375px overflow, dark mode and reduced-motion mode were exercised. Independent read-only review reported no actionable findings; a subsequently observed retry issue was fixed with a failing-then-passing test and browser recovery readback. Full suite: 117 tests passed. Production build and typecheck passed. Strict design audit: zero findings.
