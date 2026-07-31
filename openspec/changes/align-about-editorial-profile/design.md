## Context

The current About page has the required content but groups it as compact rows: a 96px portrait, three small English bio lines, a chart, and three contacts. The homepage already establishes a 46rem editorial width, larger portrait scale, open spacing, light/dark themes, and accessible contact links.

## Goals / Non-Goals

**Goals:**

- Make Terry's profile and current technical focus legible as the initial visual thesis.
- Express that profile in the approved Traditional-Chinese narrative rather than a generic English tool list.
- Present GitHub activity as a clear proof-of-work section.
- Provide GitHub, X, LinkedIn, and Email contact paths with keyboard-visible focus.
- Preserve mobile readability without horizontal overflow.

**Non-Goals:**

- No subscription form, mailing-list collection, or backend integration.
- No new professional claims, portfolio content, or borrowed brand language.
- No replacement of the contribution chart provider.

## Decisions

### Use a responsive two-column profile

On `sm` and wider screens, portrait and biography use a horizontal composition; narrow screens stack them. This imports the homepage's successful information hierarchy without duplicating its hero headline.

**Alternative considered:** Preserve the current compact profile row. It leaves the About page visually disconnected from the homepage and makes the biography read as metadata rather than the page's opening statement.

### Treat the chart as a full-width evidence strip

The existing external chart remains, but gains dedicated section spacing and responsive sizing. The section label describes actual content rather than adding decorative framing.

**Alternative considered:** Add activity counters or a dashboard card. The chart already provides the most relevant evidence and adding metrics would be noisy and dependent on new data sources.

### Complete the existing contact set with Email

Use the same public mailto target as the homepage, alongside the three existing social links. Contact labels remain text links for clarity and accessibility.

### Use a concise Traditional-Chinese narrative

The profile uses three short Traditional-Chinese paragraphs that connect Terry's AI work to legal and operational outcomes, ownership from product direction through production, and the current JurisLM open-source focus. This gives the page a concrete point of view while staying within supplied claims.

## Risks / Trade-offs

- [External chart availability] → Preserve the existing source and meaningful alt text; layout does not depend on a fixed chart height.
- [Large portrait on narrow screens] → Use a bounded mobile size and a stacked layout.
- [Visual drift across themes] → Verify the existing token-based colors in both light and dark mode.

## Migration Plan

The page is static and deployed by GitHub Pages. The change is reversible with a normal Git revert; it has no data migration or external configuration.
