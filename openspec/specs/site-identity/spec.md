# site-identity Specification

## Purpose

Define public identity and account behavior under the approved JUR-508 version 2 personal introduction.

## Requirements

### Requirement: Public homepage identity

The persistent header SHALL retain `Terry.TY Chen`. The homepage hero SHALL use the approved Traditional-Chinese greeting `嗨，我是 Terry。` with Terry's existing portrait.

#### Scenario: Requested identity

- **WHEN** a visitor opens the homepage
- **THEN** the header brand is exactly `Terry.TY Chen`
- **AND** the hero heading is exactly `嗨，我是 Terry。`

#### Scenario: Header home link

- **WHEN** a visitor activates the header brand from another page
- **THEN** the browser navigates to `/`

### Requirement: Existing account destinations

Public social links SHALL remain reachable from About and the footer without changing account destinations.

#### Scenario: Public accounts remain unchanged

- **WHEN** a visitor follows the public social links
- **THEN** GitHub remains `https://github.com/terry90918`
- **AND** X remains `https://x.com/zxtw17985321`
- **AND** LinkedIn remains `https://www.linkedin.com/in/tien-yi-chen-98812812a`
