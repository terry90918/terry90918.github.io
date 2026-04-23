# markdown-loader Specification

## Purpose

TBD - created by archiving change payload-to-markdown. Update Purpose after archive.

## Requirements

### Requirement: Load all posts from filesystem

The system SHALL scan `content/posts/**/*.md` recursively and parse each file into a `Post` object with frontmatter metadata and rendered HTML content.

#### Scenario: Valid post file is loaded

- **WHEN** a valid `.md` file exists at `content/posts/<year>/<slug>.md` with required frontmatter
- **THEN** the loader returns a `Post` with title, slug, publishedAt, status, tags, readingTime, and html fields populated

#### Scenario: Missing required frontmatter field

- **WHEN** a `.md` file is missing required fields (title, publishedAt, status)
- **THEN** the loader SHALL throw a descriptive error identifying the file path and missing field

#### Scenario: Invalid publishedAt format

- **WHEN** frontmatter `publishedAt` cannot be parsed as a valid ISO 8601 date
- **THEN** the loader SHALL throw an error identifying the file and the invalid value

### Requirement: Filter draft posts in production

The system SHALL exclude posts with `status: "draft"` from all query results when `NODE_ENV === "production"`.

#### Scenario: Draft post excluded in production

- **WHEN** `NODE_ENV` is `"production"` and a post has `status: "draft"`
- **THEN** the post SHALL NOT appear in any query result

#### Scenario: Draft post included in development

- **WHEN** `NODE_ENV` is `"development"` and a post has `status: "draft"`
- **THEN** the post SHALL appear in query results

### Requirement: Calculate reading time automatically

The system SHALL calculate `readingTime` in minutes from raw Markdown content using a words-per-minute estimate.

#### Scenario: Reading time is calculated

- **WHEN** a post has Markdown content
- **THEN** `post.readingTime` is a positive integer representing estimated reading minutes (minimum 1)

### Requirement: Cache posts in production

The system SHALL cache all parsed posts in module-level memory after the first load to avoid repeated filesystem reads.

#### Scenario: Cache is used on subsequent calls

- **WHEN** `loadAllPosts()` is called multiple times in production
- **THEN** filesystem is read only once; subsequent calls return cached data

#### Scenario: Cache is bypassed in development

- **WHEN** `NODE_ENV` is `"development"`
- **THEN** each call to `loadAllPosts()` reads from the filesystem (enables hot reload)

### Requirement: Derive year from publishedAt

The system SHALL extract the year from `publishedAt` frontmatter to match directory structure and URL generation.

#### Scenario: Year matches directory

- **WHEN** a post has `publishedAt: "2026-04-23T..."`
- **THEN** `post.year` is `"2026"` regardless of the parent directory name
