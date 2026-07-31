## ADDED Requirements

### Requirement: Responsive profile composition

The About page SHALL present Terry Chen's portrait and approved Traditional-Chinese professional narrative in a responsive editorial profile block that is horizontal on wider screens and stacked on narrow screens.

#### Scenario: Desktop profile

- **WHEN** the About page is rendered at a desktop viewport
- **THEN** the portrait and biography are visible in a horizontal composition within the editorial content width

#### Scenario: Narrow profile

- **WHEN** the About page is rendered at a narrow viewport
- **THEN** the portrait and biography stack without horizontal page overflow

#### Scenario: Traditional-Chinese professional narrative

- **WHEN** a visitor reads the About profile
- **THEN** it presents the approved Traditional-Chinese narrative about Hsinchu, enterprise-ready AI systems, and socially or industrially valuable AI applications

### Requirement: Evidence-led GitHub activity

The About page SHALL retain a visible, legible GitHub contribution chart in a dedicated GitHub Activity section.

#### Scenario: Activity chart render

- **WHEN** a visitor opens the About page
- **THEN** the GitHub Activity heading and contribution chart are visible with meaningful alternative text

### Requirement: Complete public contact paths

The About page SHALL present GitHub, X, LinkedIn, and Email as visible public contact links with keyboard-visible focus.

#### Scenario: Contact link availability

- **WHEN** a visitor reaches the Connect section
- **THEN** GitHub, X, LinkedIn, and Email links are available
