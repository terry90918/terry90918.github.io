# static-site-deployment Specification

## Purpose

TBD - created by archiving change migrate-to-github-pages. Update Purpose after archive.

## Requirements

### Requirement: Static export build

The site SHALL build as a fully static export (`next build` with `output: 'export'`), producing an `out/` directory of static HTML/CSS/JS with no server-side runtime dependency.

#### Scenario: Build succeeds with no server-only features

- **WHEN** `bun run build` runs
- **THEN** it completes successfully and produces an `out/` directory
- **AND** no route in the build depends on middleware, an API route with a request-time handler, or ISR (`revalidate`)

### Requirement: Automatic deployment to GitHub Pages

On every push to `main`, the site SHALL be built and published to GitHub Pages automatically via GitHub Actions, with no manual deploy step.

#### Scenario: Push to main triggers a deploy

- **WHEN** a commit is pushed to `main`
- **THEN** the `deploy-pages` workflow runs, builds the static export, and publishes it via `actions/deploy-pages`
- **AND** the published site is reachable at `https://terry90918.github.io` once the workflow completes

### Requirement: No server-dependent staging environment

The project SHALL NOT provide a gated staging/preview environment that depends on a running server (e.g., Basic Auth middleware). Pre-merge review happens locally.

#### Scenario: No Basic Auth gate exists

- **WHEN** the site is deployed
- **THEN** there is exactly one published environment (production, at the GitHub Pages URL)
- **AND** no request to any route requires HTTP Basic Auth credentials
