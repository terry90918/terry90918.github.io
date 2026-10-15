# Review gate and frontend E2E follow-up

Product source remains identical to `248626f4d1ef6fd2ce3e128ee3b34552c2b1930c`. This follow-up changes frontend test assertions and verification records only. No new complete/incremental review, merge, deployment, configuration, dependency or test-threshold change was requested.

## Existing Codex review history

Read the edit history of the [existing Codex summary](https://github.com/terry90918/terry90918.github.io/pull/110#issuecomment-6183368609), rather than treating its latest overwritten status as the whole review history:

| Trigger                              | Commit                                     | Terminal result (UTC)              |
| ------------------------------------ | ------------------------------------------ | ---------------------------------- |
| PR opened — required complete review | `14b120e0d642e9d0553f68e1bd0bf8ef05ef0c50` | Completed, 03:01:59                |
| New commits — automatic follow-up    | `0b68760bc03f1ebfcdea528c3d7ba105f9405b51` | Completed, 03:08:48                |
| New commits — automatic follow-up    | `dc123dd0f905c3d622028b8d72de3ec7b4a8d3cc` | Completed, 03:52:49                |
| New commits — automatic follow-up    | `e49899a06f875205dc99508de0f9559546560d54` | Completed, 04:57:13                |
| New commits — automatic follow-up    | `248626f4d1ef6fd2ce3e128ee3b34552c2b1930c` | Failed, 05:18:35; started 05:18:09 |

The failed attempt is distinct from the initial completed review. Its GitHub summary exposes no error details, quota/usage message or finding. The commit check-runs API is empty; no Codex inline finding was published. The specific service failure cause cannot be established from these accessible records. It is not a documented quota-limit Pass and is not evidence of a code finding.

JT Harness 2.2.6 requires one complete Codex review, actionable-finding resolution and inspection/verification of subsequent changes. It explicitly says not to request another complete or incremental review after new commits. The initial completed review satisfies that requirement; subsequent automatic failure does not erase the completed result. This conclusion relies on the completed initial result and verified delta, not a failure exception. If the initial required review had failed without an explicit quota report, the gate would remain unmet.

CodeRabbit's complete review covers `14b120e`. Its one actionable landmark finding and mobile `aria-current` nitpick were fixed at `0b68760`; the [thread](https://github.com/terry90918/terry90918.github.io/pull/110#discussion_r4278577226) is resolved/outdated. Its 80% docstring warning is a provider-specific advisory, not a repository gate; JT forbids adding provider-specific merge gates. No unresolved actionable provider finding was found.

## Delta inspected after the initial reviewed head

- `0b68760`: restore labeled section landmarks, internal-route `aria-current`, reference spacing and tests.
- `dc123dd`: user-authorised selected copy/order, bilingual CV reference snapshot, skills and per-block export audit. Existing article bodies and public routes are retained.
- `e49899a`: restore the separately confirmed 55-delivery sentence in evidence row 02.
- `248626f`: user-authorised bilingual management wording/headcount removal, three populated metric cards and scoped role-card sizing. Preserve 55 deliveries, TPI's team size, other achievements and 3D implementation. External design modifications are recorded in the prior patch/fingerprints.
- This follow-up: correct three stale E2E expectations without changing product code or thresholds.

Source/export copy checks, unit assertions and normal Chrome desktop/mobile visual/interaction evidence cover these deltas. The structured audit has 862 entries, 857 static matches and no unexplained missing blocks; three dynamic article slots and two interactive-badge entries remain separate.

## Frontend E2E gate

`README.md` documents `BASE_URL=... bunx playwright test --project=frontend`; `CLAUDE.md` identifies the frontend project. The selected implementation plan calls for existing browser tests when available. Woodpecker's required `validate` pipeline runs lint, unit tests, OpenSpec, build and typecheck; it does not run Playwright. Therefore Woodpecker success alone never established E2E success.

Earlier E2E remained unexecuted while browser access was stopped/unavailable. That was a recorded delivery gap, not a waived requirement. The original supported Chrome connection subsequently recovered. This explicitly requested follow-up ran the existing suite using installed Playwright 1.59.1 and installed Chromium against the task-local production export. No browser download, user-profile access or alternate automation to evade a stopped session was used.

Command:

```sh
BASE_URL=http://127.0.0.1:4318 bunx --no-install playwright test --project=frontend --workers=1 --reporter=line --output=<task-evidence-directory>
```

Initial run: **42 passed, 3 failed**. Diagnosis and correction:

1. After navigation closes the mobile menu, role locators exclude hidden navigation/links. Use `includeHidden: true` for the existing hidden-state and `aria-current` assertions; keep open/visible, keyboard, Escape, navigation-close and focus assertions.
2. Translation metadata is rendered as separate badge/date/source spans. Assert all three exact span texts in order instead of obsolete dot-separated text; preserve the complete article URL comparison and both source-author checks.
3. The July 6 article excerpt had changed before the task base `e015163`, but its test still hard-coded older prose. Read the approved source frontmatter, assert its exact standalone excerpt and assert it differs from the leading blockquote. The article itself is unchanged.

Corrected full run: **45 passed in 30.5s**, exit 0. Existing timeouts, retries, frontend project, test count and behavior requirements are unchanged. The suite covers main-site navigation/themes/responsive layouts/anchors, article/RSS/sitemap/metadata, bilingual CV navigation and exported cases, desktop-only 3D loading, font/resource isolation and responsive article images.

Normal Chrome visual acceptance additionally covered all 11 selected views at 320/375px, long-page endings, keyboard focus/menu behavior, bilingual skills/locale hash and reduced-motion CSS. CSS uses automatic scrolling and 0.01ms CV animation/transition duration under reduced-motion; no claim that CSS disables 3D physics. Temporary media and viewport overrides were restored.

Physical phones and other browser engines remain untested. No merge/deploy authorisation was given; PR #110 and JUR-705 remain In Review. Exact follow-up head and its own CI terminal status are recorded in the PR after push.
