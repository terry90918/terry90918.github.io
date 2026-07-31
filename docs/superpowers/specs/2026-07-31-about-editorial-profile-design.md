# About editorial profile design

## Purpose

The About page gives prospective collaborators a compact, credible snapshot of Terry Chen's work. Its single job is to make the profile, current technical focus, open-source activity, and contact paths easy to scan.

## Chosen direction

Use the homepage's quiet editorial rhythm rather than copying another person's biography page. A responsive profile block pairs a larger circular portrait with a concise Traditional-Chinese professional narrative. The portrait remains a personal identifier; the prose states Terry's own factual work and current open-source focus.

The GitHub chart becomes a distinct evidence section with more vertical room and a readable full-width chart. The four contact paths sit in a final, compact Connect section: GitHub, X, LinkedIn, and Email.

## Visual system

- **Color:** existing `--background` (`#fdfdfd`), `--foreground` (`#282728`), `--accent` (`#006cac`), `--muted` (`#e6e6e6`), and `--border` (`#ece9e9`) tokens; no new palette.
- **Type:** retain Atkinson Hyperlegible and the site monospace voice. Use the title for hierarchy, body text for biography, and restrained uppercase labels only where they identify a genuine content section.
- **Layout:** the page uses the shared 46rem editorial width. Desktop profile uses a portrait column and prose column; narrow screens stack them without overflow.
- **Signature:** the contribution chart is treated as the profile's proof-of-work strip—wide, calm, and separated by whitespace instead of cards or decorative rules.

## Scope

Included: responsive profile composition, a Traditional-Chinese professional narrative, typographic and spacing hierarchy, a legible contribution chart, visible keyboard focus, and the fourth Email contact link.

Excluded: newsletter signup, analytics, new external services, altered biography claims, and reproduction of Peter Steinberger's copy, imagery, or branding.

## Verification

E2E coverage will assert the profile structure at desktop and mobile widths, no horizontal overflow, chart visibility, and all four contact links. Existing navigation and theme-toggle coverage remains in place. Local browser inspection will validate light and dark themes.
