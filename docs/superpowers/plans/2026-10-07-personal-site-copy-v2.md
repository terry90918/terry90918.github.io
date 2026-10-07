# Personal site copy v2

**Goal:** Apply the approved Chinese About, Story and Work copy while retaining the existing visual design and public URLs. Nidin is the first representative work. Story follows five chronological chapters; the homepage keeps three short entry points.

**Architecture:** Keep the shared content registry and existing page components. Separate chronological Story chapters from selected homepage notes. Add TPI as an inline Work entry with an anchor, retain the three existing case pages, and keep all article, RSS, series and independent CV destinations.

**Baseline:** `9f31fa10c11604738f490df99a18a9c40d5b5c5f`. Tracking: JUR-521.

## Tasks

1. Establish baseline and add rendered-page regression checks for chronological chapters, legacy anchors, Nidin-first ordering, and the distinction between a 20-person TPI project team and 10 direct reports at Nidin. Observe RED before implementation.
2. Apply approved About/Story/Work copy and contact sentence. Preserve classes, portraits, account destinations and case routes. Remove the unconfirmed 55-delivery claim. Keep existing verified case details outside the revised copy unchanged.
3. Verify GREEN, full lint, typecheck, unit tests, OpenSpec, production build and frontend E2E; compare article/audio source hashes and routes against the baseline. Inspect desktop/mobile rendering in Chrome.
4. Create a labeled Ready PR. Complete one Codex and one CodeRabbit review under JT Harness 2.2.5, fix actionable findings and verify only the resulting changes. A failed/no-result Codex review blocks merging and is not retried.
5. With gates satisfied, merge under the existing authorization; verify Pages on the exact merge SHA and production behavior, then close JUR-521. Report any tool or review blocker without bypassing it.

## Content boundaries

- TPI: 20-person project team; never describe this as 20 direct reports. Include architecture, agency permissions, file ingestion/cleaning/validation, security scans and remediation, coordination, staffing/schedule/cost responsibilities.
- Nidin: technical manager, directly managed 10 engineers; coupon batching and API throttling protect the order service.
- Retain `/story#gj`, `/story#nidin`, `/story#ai-work`, `/work/gj`, `/work/nidin`, `/work/jurislm`; do not create an unsupported TPI case page.
- Do not publish interview scheduling, source transcripts, private résumé data, draft labels, unverified new metrics or a contemporary NEAR screenshot as historical work.

## Execution rulings

The user has approved this copy and authorized implementation/publication; no additional routine plan approval is required. A new task-owned linked worktree preserves both the original checkout and the completed prior-task evidence. The single complete PR Codex review is the review required by JT; do not add a duplicate reviewer or restart either complete review after fixes.
