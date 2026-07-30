# site-identity Specification

## Purpose

Define the public identity labels and account-link behavior shown on the site.

## Requirements

### Requirement: Public homepage identity

The site SHALL display `Terry.TY Chen` as the public identity in both the persistent header and
the homepage hero while preserving account URLs and navigation behavior.

#### Scenario: Homepage shows the requested display name

- **WHEN** a visitor opens the homepage
- **THEN** the persistent header brand text is exactly `Terry.TY Chen`
- **AND** the hero heading is exactly `Hi, I'm Terry.TY Chen.`

#### Scenario: Header identity remains a home link

- **WHEN** a visitor activates the `Terry.TY Chen` header brand from another page
- **THEN** the browser navigates to `/`

#### Scenario: Account links remain unchanged

- **WHEN** the homepage identity labels are renamed
- **THEN** the GitHub profile link remains `https://github.com/terry90918`
- **AND** the X profile link remains `https://x.com/zxtw17985321`
- **AND** the LinkedIn profile link remains
  `https://www.linkedin.com/in/tien-yi-chen-98812812a`
