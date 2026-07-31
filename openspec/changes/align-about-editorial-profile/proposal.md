## Why

The homepage now presents Terry's work with an editorial reading rhythm, while the About page still uses a smaller, denser profile treatment. Aligning the two makes the personal site feel coherent and makes Terry's technical focus and contact paths easier to scan.

## What Changes

- Recompose the About profile into a responsive portrait-and-bio editorial block.
- Establish clearer spacing and hierarchy around the GitHub contribution chart.
- Retain GitHub, X, and LinkedIn, and add Email as a fourth visible contact link.
- Preserve the existing chart provider, dark mode, navigation, and keyboard accessibility.

## Capabilities

### New Capabilities

- `about-editorial-profile`: A responsive About profile, evidence section, and complete contact path set.

### Modified Capabilities

- None.

## Impact

- Affects `app/(frontend)/about/page.tsx`, the focused frontend E2E suite, and a new OpenSpec capability.
- Does not add dependencies, forms, analytics, or external services.
- Closes #34.
