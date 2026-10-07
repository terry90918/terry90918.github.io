# about-editorial-profile Specification

## Purpose

Describe the factual personal profile and reading paths approved by the JUR-508 version 2 design, superseding the earlier promotional narrative and required activity chart.

JUR-521 updates the approved public copy while retaining this layout and the existing account destinations.

## Requirements

### Requirement: Responsive factual profile

The About page SHALL show Terry's existing portrait and the approved Traditional-Chinese introduction beginning `嗨，我是 Terry。` in a responsive profile block. It SHALL use only approved factual personal history and reflections.

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

### Requirement: Story and work reading paths

Story SHALL show the five approved chronological chapters. Existing anchors `gj`, `nidin` and `ai-work` SHALL remain reachable. Work SHALL introduce Nidin first and explain TPI's 20-person project team separately from Nidin's 10 direct reports. TPI SHALL expose architecture, file processing and security remediation responsibilities at `/work#tpi` without adding a case route. Homepage SHALL retain three concise experience entries rather than duplicating Story.

#### Scenario: Read experience and supporting work

- **WHEN** a reader follows an existing homepage experience link
- **THEN** its Story anchor remains reachable
- **AND** the related work destination exists
- **AND** `/work/gj`, `/work/nidin` and `/work/jurislm` remain public
