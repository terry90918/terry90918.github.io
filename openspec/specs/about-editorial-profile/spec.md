# about-editorial-profile Specification

## Purpose

Describe the factual personal profile and reading paths approved by the JUR-508 version 2 design, superseding the earlier promotional narrative and required activity chart.

## Requirements

### Requirement: Responsive factual profile

The About page SHALL show Terry's existing portrait and the approved Traditional-Chinese site introduction in a responsive profile block. It SHALL NOT invent private life, interests, motives or personal reflections.

#### Scenario: Desktop profile

- **WHEN** About opens on a desktop viewport
- **THEN** the portrait and introduction appear horizontally within the editorial content width

#### Scenario: Narrow profile

- **WHEN** About opens on a narrow viewport
- **THEN** the portrait and introduction stack without horizontal page overflow

### Requirement: Distinct reading paths

The About page SHALL link to Story for selected factual experiences, Work for selected outcomes, Writing for the complete article index, and the independent CV for full career details. A GitHub contribution chart MAY appear as secondary evidence but is not required.

#### Scenario: Choose a reading path

- **WHEN** a visitor reads About
- **THEN** Story, Work, Writing and the independent CV are reachable

### Requirement: Complete public contacts

The About page SHALL preserve visible GitHub, X, LinkedIn and Email links with keyboard-visible focus.

#### Scenario: Contact availability

- **WHEN** a visitor reaches the public contact section
- **THEN** GitHub, X, LinkedIn and Email links use the existing public account destinations
- **AND** each exposes a visible keyboard focus indicator
