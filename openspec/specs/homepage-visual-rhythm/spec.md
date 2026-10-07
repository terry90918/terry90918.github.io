# homepage-visual-rhythm Specification

## Purpose

Describe the approved personal introduction and reading flow, superseding the earlier homepage visual refinement with the JUR-508 version 2 design.

## Requirements

### Requirement: Editorial content width

The homepage and persistent header SHALL share a narrow editorial inner width and remain horizontally centered.

#### Scenario: Header and homepage align on desktop

- **WHEN** a visitor opens the homepage at a desktop viewport
- **THEN** the header inner content and homepage content use the same maximum width

### Requirement: Identity-first hero

The homepage SHALL show Terry's existing portrait and the approved Traditional-Chinese introduction, arranged in a row on desktop and stacked on narrow screens.

#### Scenario: Desktop hero

- **WHEN** the viewport is at or above the small-screen breakpoint
- **THEN** the circular portrait is 160px by 160px beside the introduction
- **AND** the heading is exactly `嗨，我是 Terry。`

#### Scenario: Narrow hero

- **WHEN** the viewport is narrower than the small-screen breakpoint
- **THEN** the portrait and introduction stack without horizontal overflow

### Requirement: Experience-first reading flow

The homepage SHALL present the introduction, three approved factual experience entries, available recent updates, selected work and contact in that order. It SHALL NOT invent personal reflections or place membership, order or recall metrics in its summaries.

#### Scenario: Experience entries

- **WHEN** a visitor follows an experience link
- **THEN** the link opens the corresponding readable Story section
- **AND** the section links to a real selected work case

### Requirement: Limited recent updates

The homepage SHALL show at most three published updates, newest first, with at most the latest AI daily entry. Translation and daily roundup labels SHALL distinguish them from original writing. An empty published set SHALL omit the section.

#### Scenario: Daily series does not dominate

- **WHEN** many published AI daily articles are available
- **THEN** only their newest entry appears among homepage updates
- **AND** the complete series and year index remain reachable at their existing article URLs

### Requirement: Existing interaction contracts

The site SHALL preserve Terry's public account destinations, visible CV and email paths, theme switching and keyboard focus indicators.

#### Scenario: Contact and interaction

- **WHEN** a visitor uses the navigation or contact section
- **THEN** CV links to the integrated `/cv` page and email to `mailto:zxtw17985321@gmail.com`
- **AND** public social accounts remain reachable from About or the footer
- **AND** keyboard controls expose visible focus and theme switching remains functional
