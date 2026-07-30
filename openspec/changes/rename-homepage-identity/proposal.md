## Why

The public homepage uses two different identity labels: `Terry Chen` in the persistent header
and `@terry90918` in the hero. The requested public display name is `Terry.TY Chen`, so both
visible identity surfaces should use the same name.

Closes #26

## What Changes

- Change the persistent header brand link text to `Terry.TY Chen`.
- Change the homepage hero heading to `Hi, I'm Terry.TY Chen.`.
- Update focused browser assertions for the two visible identity surfaces and the header link.
- Add repository-level CodeRabbit configuration with automatic reviews disabled so the delivery
  requests exactly one authorized review.
- Keep usernames, URLs, avatar alternative text, About content, metadata, RSS identity, and
  other author references unchanged.

## Capabilities

### New Capabilities

- `site-identity`: defines the public name shown in the persistent header and homepage hero.

### Modified Capabilities

- None.

## Impact

- **Code**: `components/BlogHeader.tsx`, `app/(frontend)/page.tsx`.
- **Tests**: `tests/e2e/frontend-blog.spec.ts`.
- **Review configuration**: `.coderabbit.yaml`.
- **Deployment**: the existing push-to-`main` GitHub Pages workflow publishes the static build.
- **External dependencies**: none.
- **Data / migrations**: none.
