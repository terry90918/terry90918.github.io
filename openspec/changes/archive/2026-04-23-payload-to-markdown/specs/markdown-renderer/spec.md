## ADDED Requirements

### Requirement: Render Markdown to HTML

The system SHALL convert raw Markdown string to safe HTML using the unified/remark/rehype pipeline.

#### Scenario: Basic Markdown is rendered

- **WHEN** raw Markdown contains headings, paragraphs, bold, italic, and links
- **THEN** the output HTML contains the correct semantic elements (`<h1>`-`<h6>`, `<p>`, `<strong>`, `<em>`, `<a>`)

### Requirement: Support GitHub Flavored Markdown (GFM)

The system SHALL support GFM extensions: tables, task lists, strikethrough, and autolinks.

#### Scenario: Markdown table is rendered

- **WHEN** raw Markdown contains a pipe table
- **THEN** output HTML contains `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>` elements

#### Scenario: Task list is rendered

- **WHEN** raw Markdown contains `- [ ] item` and `- [x] done`
- **THEN** output HTML contains `<input type="checkbox">` elements with correct `checked` attribute

### Requirement: Add anchor IDs to headings

The system SHALL add `id` attributes to all headings to enable in-page navigation.

#### Scenario: Heading gets an ID

- **WHEN** Markdown contains `## Installation`
- **THEN** output HTML contains `<h2 id="installation">Installation</h2>`

#### Scenario: CJK headings get slugified IDs

- **WHEN** Markdown contains a heading with CJK characters
- **THEN** output HTML heading has a non-empty `id` attribute

### Requirement: Syntax highlighting with dual theme

The system SHALL apply syntax highlighting to fenced code blocks using `rehype-pretty-code` with separate light and dark themes.

#### Scenario: Code block is highlighted

- **WHEN** Markdown contains a fenced code block with a language identifier (e.g., ` ```typescript `)
- **THEN** output HTML contains highlighted tokens with CSS variable-based colors

#### Scenario: Dual theme follows dark mode

- **WHEN** `html` element has `data-theme="dark"`
- **THEN** dark theme colors apply to code blocks (via CSS variables set by rehype-pretty-code)

#### Scenario: Unknown language does not crash

- **WHEN** Markdown contains a fenced code block with an unknown language identifier
- **THEN** the renderer returns plain (non-highlighted) code without throwing an error

### Requirement: Renderer is async

The system SHALL expose an async `renderMarkdown(content: string): Promise<string>` function.

#### Scenario: Render returns a promise

- **WHEN** `renderMarkdown()` is called
- **THEN** it returns a Promise that resolves to an HTML string
