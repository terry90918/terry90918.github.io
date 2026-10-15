# Personal site design alignment implementation plan

Goal: correct JUR-705 visual drift against the explicitly supplied local Open Design project.

Architecture: retain the existing Next.js routes and CV 3D implementation. The user’s 2026-10-15 follow-up makes selected design copy and block order authoritative across all 11 views. Shared editorial primitives and scoped CSS own the repeated reference geometry. Runtime theme tokens remain in globals.css.

Spec: Open Design project `76e33fa9-e2bc-4bf3-b92d-b38f0e5c0ae2` (`index.html`, `design.css`, `design.js`, `design-note.md`; ordinary-file edits authorised for the Nidin management follow-up), plus existing OpenSpec content and route contracts.

## Constraints

- Use dedicated `codex/jur-705-design-alignment` worktree; main and its untracked files remain untouched.
- Synchronise selected visible copy and Story/Work ordering. Preserve article data/bodies, canonical routes and factual accuracy. The user explicitly confirmed all 31 CV skill categories in both languages. The user separately confirmed the 55-delivery statement; include the exact selected wording in the second Nidin case evidence row.
- Treat preview chrome and the static CV badge as prototype-only. Retain the real React Three/physics card and mobile fallback.
- No deployment or merge in this correction task. One complete review per provider, with existing review results checked first.

## Implementation and verification

- [x] Read repository guidance, design files, existing issue/PR, tests and current source.
- [x] Verify baseline unit suite: 100 tests passed.
- [x] Compare live home and design home through normal Chrome. Read remaining page mappings and CSS.
- [x] Align header/footer, tokens, portrait, section headings, cards, links and writing metadata using SitePrimitives.tsx and styles/editorial.css.
- [x] Align CV shell/navigation, hero type, about stats, featured-work cards, chronology, education/contact/skills spacing to reference while preserving facts and interaction owners.
- [x] Run full lint, typecheck, unit tests, OpenSpec validation and production build.
- [ ] Run existing frontend tests if their browser execution is available. Do not treat DOM counts as visual acceptance.
- [x] Inspect diff and one Codex/CodeRabbit review, create labeled PR and record exact gates and visual limitations in JUR-705.

## Review focus

- At 700px the header is 64px; CV offsets must follow the measured header.
- At 900px the three-card grid stacks; content must fit 375px and 320px.
- Preserve keyboard menu open, Escape, destination close and visible focus.
- Keep article and CV detail routes' structures while updating shared chrome.
- CV card rendering and mobile fallback must not be replaced by the prototype badge.

## Browser evidence

Normal Chrome recovered through the same browser tool. Story was captured in light/dark modes and at 375px. Mobile menu expansion and destination-close, About mobile layout, CV mobile portrait, skills expansion, language URL preservation and desktop 3D-card rendering/drag were exercised. All 11 views have source/export copy coverage and desktop viewport screenshots; long archive/timeline bottoms and the complete keyboard matrix are not fully visually accepted. See the current evidence report and per-block audit for scope and exceptions.

## Explicit copy follow-up

- [x] Read the supplied design/site screenshots and confirm that the deployed screenshot and PR head both had old Nidin copy.
- [x] Capture the 2026-10-15 selected HTML revision and both CV taxonomies in a reproducible structured snapshot.
- [x] Update Story, About, Home, Work, all three work cases, daily eyebrow and both CV home presentations in the same PR.
- [x] Update superseded order/copy assertions and add bilingual CV reading-path/skills coverage.
- [x] Audit all 11 views against production HTML, within mapped sections, with explicit dynamic/claim/interactive-card exceptions.
- [x] Push the verified copy delta to PR #110 and read back its new-head check status. No additional complete review, merge or deployment.

## Confirmed Nidin statement follow-up

- [x] Confirm the existing branch/PR head and clean worktree before editing.
- [x] Verify the original wording and second-row location in the selected design.
- [x] Add a placement/text assertion and observe it fail against the omitted prefix.
- [x] Add only the confirmed original prefix and remove its audit exception.
- [ ] Rebuild, regenerate the audit, validate and push this small follow-up to the same PR. Read its own CI terminal state without another full provider review.

Full mobile/keyboard and other previously unverified acceptance remain incomplete. A normal Chrome availability read may support a narrow screenshot check; no stopped or denied browser action may be bypassed.

## User-authorised management rewrite

The latest request supersedes a deletion-only interpretation. Use `管理工程部門團隊，協助工作分派與技術決策。` and the approved English equivalent. Keep the third evidence row populated, retain technical-manager titles without duplicate prose, remove Nidin headcount text and its metric card from website/CV/design, and preserve TPI’s team size and the confirmed 55 deliveries. Do not modify Notion or app-owned project metadata.

- [x] Verify branch/PR head, clean worktree and original design hashes before edits.
- [x] Capture failing responsibility/headcount/metric regression assertions.
- [x] Back up and hash-guard writes to the exact project’s HTML, CSS and design note.
- [x] Synchronise website content, bilingual profile/case studies and the structured design snapshot.
- [x] Keep three metric cards aligned, and fix inherited case-section auto margins exposed by shorter role copy.
- [x] Run full lint/typecheck, 103 tests, OpenSpec 10/10 and the 125-page production build.
- [x] Read normal Chrome screenshots for both updated Nidin case pages and persist the original JPEGs.
- [x] Regenerate the 11-view copy audit with no missing text, and record the external design patch/fingerprints.
- [ ] Push this follow-up to PR #110 and read its own CI terminal status. No new provider review, merge or deployment.

The complete mobile/keyboard/reduced-motion acceptance matrix remains incomplete.
