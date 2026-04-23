# content-authoring Specification

## Purpose

TBD - created by archiving change payload-to-markdown. Update Purpose after archive.

## Requirements

### Requirement: Post files follow year-based directory structure

The system SHALL store post Markdown files at `content/posts/<year>/<slug>.md` where `<year>` is a 4-digit year string matching the post's `publishedAt` year.

#### Scenario: File is discoverable by loader

- **WHEN** a file exists at `content/posts/2026/my-post.md`
- **THEN** the loader discovers and parses it as a post

### Requirement: Required frontmatter fields are enforced

Each post file SHALL include the following required frontmatter fields: `title` (string), `publishedAt` (ISO 8601 date string), `status` ("draft" | "published").

#### Scenario: All required fields present

- **WHEN** frontmatter contains `title`, `publishedAt`, and `status`
- **THEN** the post loads without error

#### Scenario: Missing required field causes error

- **WHEN** frontmatter is missing any required field
- **THEN** loader throws a descriptive error identifying the file and the missing field

### Requirement: Optional frontmatter fields are supported

The system SHALL support optional frontmatter fields: `slug` (string, auto-derived from filename if omitted), `excerpt` (string), `tags` (string array), `metaDescription` (string).

#### Scenario: Slug auto-derived from filename

- **WHEN** frontmatter does not include a `slug` field
- **THEN** the post slug is derived from the filename (without `.md` extension)

#### Scenario: Explicit slug overrides filename

- **WHEN** frontmatter includes `slug: "custom-slug"`
- **THEN** the post slug is `"custom-slug"` regardless of filename

#### Scenario: Tags default to empty array

- **WHEN** frontmatter does not include a `tags` field
- **THEN** `post.tags` is an empty array

### Requirement: Tag strings are converted to Tag objects

The system SHALL convert each string in frontmatter `tags` to a `Tag` object with `name` (original string) and `slug` (slugified version).

#### Scenario: Tag string becomes Tag object

- **WHEN** frontmatter has `tags: ["TypeScript", "Next.js"]`
- **THEN** `post.tags` is `[{ name: "TypeScript", slug: "typescript" }, { name: "Next.js", slug: "nextjs" }]`
