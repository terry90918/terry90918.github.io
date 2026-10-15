# Personal site design alignment implementation plan

Goal: correct JUR-705 visual drift against the explicitly supplied local Open Design project.

Architecture: retain the existing Next.js routes, factual content and CV 3D implementation. Shared editorial primitives and scoped CSS own the repeated reference geometry. Runtime theme tokens remain in globals.css.

Spec: Open Design project `76e33fa9-e2bc-4bf3-b92d-b38f0e5c0ae2` (`index.html`, `design.css`, `design.js`, `design-note.md`, read only), plus existing OpenSpec content and route contracts.

## Constraints

- Use dedicated `codex/jur-705-design-alignment` worktree; main and its untracked files remain untouched.
- Preserve current content, story/work ordering, dates, article bodies, canonical URLs and bilingual CV facts.
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
- [ ] Inspect diff and one Codex/CodeRabbit review, create labeled PR and record exact gates and visual limitations in JUR-705.

## Review focus

- At 700px the header is 64px; CV offsets must follow the measured header.
- At 900px the three-card grid stacks; content must fit 375px and 320px.
- Preserve keyboard menu open, Escape, destination close and visible focus.
- Keep article and CV detail routes' structures while updating shared chrome.
- CV card rendering and mobile fallback must not be replaced by the prototype badge.

## Browser evidence

Normal Chrome returned home and reference screenshots. Subsequent route navigation timed out, then normal recovery timed out again with `js execution timed out; kernel reset, rerun your request`. No alternative browser automation is used to bypass that limitation. Post-change visual acceptance remains pending until normal browser access works.
