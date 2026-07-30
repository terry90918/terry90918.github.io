## Context

The homepage exposes a persistent header brand and a hero identity heading. Both are plain,
statically rendered React text. The GitHub username also appears in social links and the avatar
URL, while `Terry Chen` appears in metadata, RSS, About content, and image alternative text.
Those other occurrences have different semantic roles and were not requested for this change.

## Goals / Non-Goals

**Goals:**

- Use `Terry.TY Chen` consistently in the persistent header and homepage hero.
- Preserve the header link to `/`.
- Protect the two labels with focused E2E assertions.
- Verify the exported static page and the deployed canonical homepage.

**Non-Goals:**

- Renaming the GitHub account or changing social URLs.
- Rewriting metadata, RSS, About content, image alternative text, or historical article content.
- Changing typography, layout, spacing, or navigation behavior.

## Decisions

### Update only the two requested visible identity surfaces

Three approaches were considered:

1. Change only the hero. This is too narrow because the later screenshot explicitly identifies
   the header label.
2. Replace every `Terry Chen` and `@terry90918` occurrence across the repository. This risks
   changing metadata, URLs, accessibility labels, and historical content outside the request.
3. Change the header and hero only. This directly satisfies both screenshots while preserving
   unrelated identity and routing contracts.

Approach 3 is selected.

### Keep the existing components and data flow

The labels remain static text in `BlogHeader` and `HomePage`. Introducing a shared identity
configuration for two literals would add indirection without a current reuse requirement.

### Verify behavior at source, build, browser, and production layers

Focused E2E assertions define the expected visible text and retain the existing navigation
assertion. Typecheck and static production build catch compilation/export regressions. A local
browser readback verifies rendered header and hero text. After merge, the GitHub Pages workflow
and canonical production URL provide deployment evidence.

### Make the single-review budget explicit

The repository does not currently contain `.coderabbit.yaml`. The delivery adds the minimal
configuration required to set `reviews.auto_review.enabled: false`, preventing subsequent pushes
from triggering additional reviews. The PR will request one authorized CodeRabbit review
explicitly.

## Risks / Trade-offs

- The site will intentionally continue to show `Terry Chen` in metadata and other contexts.
  This is bounded by the explicit non-goals and avoids accidental SEO/RSS changes.
- The longer header label could wrap on very narrow screens. The existing responsive header has
  sufficient horizontal space for this small increase; browser verification will confirm the
  standard layout remains intact.

## Rollback

Revert the delivery commit. There are no data, schema, credential, or infrastructure changes.
