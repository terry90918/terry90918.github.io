# homepage-visual-rhythm Specification

## Purpose
TBD - created by archiving change align-homepage-visual-rhythm. Update Purpose after archive.
## Requirements
### Requirement: Editorial content width

The homepage and persistent header SHALL share a narrow editorial inner width that keeps identity
and recent writing on the same visual axis.

#### Scenario: Header and homepage align on desktop

- **WHEN** a visitor opens the homepage at a desktop viewport
- **THEN** the header inner content and homepage content use the same maximum width
- **AND** the content remains horizontally centered

### Requirement: Identity-first hero

The homepage SHALL present Terry's portrait beside the introduction at desktop widths and SHALL
retain a readable stacked composition on narrow screens.

#### Scenario: Desktop hero uses two columns

- **WHEN** the viewport is at or above the small-screen breakpoint
- **THEN** the circular portrait is displayed at 160px by 160px
- **AND** the portrait and introduction are arranged in a row
- **AND** the heading remains exactly `Hi, I'm Terry.TY Chen.`

#### Scenario: Mobile hero stacks without overflow

- **WHEN** the viewport is narrower than the small-screen breakpoint
- **THEN** the portrait and introduction are stacked
- **AND** all hero text and social links fit within the viewport
- **AND** the page has no horizontal overflow

### Requirement: Open recent-post list

The homepage SHALL present recent posts as an open editorial list using whitespace and type
hierarchy rather than bordered cards.

#### Scenario: Posts are easy to scan

- **WHEN** recent posts are available
- **THEN** each post shows its title, publication date, reading time when available, and excerpt
- **AND** individual post rows do not use visible borders
- **AND** the list does not add a decorative `Latest Posts` heading
- **AND** activating a post navigates to its existing route

### Requirement: Existing identity and interaction contracts

The visual refinement SHALL preserve Terry's identity, account destinations, theme behavior, and
keyboard accessibility.

#### Scenario: Identity and account destinations remain Terry-owned

- **WHEN** a visitor views the hero
- **THEN** the visible identity is `Terry.TY Chen`
- **AND** the GitHub link remains `https://github.com/terry90918`
- **AND** the X link remains `https://x.com/zxtw17985321`
- **AND** the LinkedIn link remains
  `https://www.linkedin.com/in/tien-yi-chen-98812812a`
- **AND** the Email link is `mailto:zxtw17985321@gmail.com`

#### Scenario: Interactive controls remain accessible

- **WHEN** a keyboard visitor navigates the header and homepage
- **THEN** links and the theme toggle expose visible focus states
- **AND** the theme toggle continues to switch between light and dark themes

