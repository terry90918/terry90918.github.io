# Integrated CV Specification

## Purpose

Publish the bilingual CV and portfolio through the personal site's repository and deployment.

## Requirements

### Requirement: Native bilingual CV pages

The site SHALL render Traditional Chinese at `/cv`, and both `zh-TW` and `en` CV home, contact and six case-study pages under `/cv/<locale>`.

#### Scenario: Read the CV inside the personal site

- **WHEN** a visitor selects a CV link
- **THEN** it opens the site's `/cv` page with shared primary navigation, footer, theme preference and analytics
- **AND** the existing CV layout and interactive badge remain available

#### Scenario: Switch the language of a case study

- **WHEN** a visitor switches language while reading a case-study chapter
- **THEN** the destination retains the case and corresponding translated chapter
- **AND** the exported HTML declares the destination language

### Requirement: Static deployment compatibility

The site SHALL export CV pages with root `/_next` assets and retain legacy trailing-slash CV URLs without changing existing main-site routes.

#### Scenario: Open a legacy CV URL directly

- **WHEN** a visitor opens a trailing-slash CV home, contact or case-study URL
- **THEN** the main site's static deployment serves the corresponding integrated page and its assets
