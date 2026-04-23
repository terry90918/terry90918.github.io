## ADDED Requirements

### Requirement: getLatestPosts returns most recent published posts

The system SHALL return the N most recently published posts sorted by `publishedAt` descending.

#### Scenario: Returns correct count

- **WHEN** `getLatestPosts(10)` is called and there are 15 published posts
- **THEN** exactly 10 posts are returned, ordered by publishedAt descending

#### Scenario: Returns fewer if not enough posts

- **WHEN** `getLatestPosts(10)` is called and there are 3 published posts
- **THEN** 3 posts are returned

### Requirement: getPostBySlug returns a single post

The system SHALL return a single `Post` matching the given slug, or `null` if not found.

#### Scenario: Existing slug returns post

- **WHEN** `getPostBySlug("my-post")` is called and a post with that slug exists
- **THEN** the post is returned with all fields including `html`

#### Scenario: Unknown slug returns null

- **WHEN** `getPostBySlug("nonexistent")` is called
- **THEN** `null` is returned

### Requirement: getAllPostSlugs returns year+slug pairs

The system SHALL return all published post slugs as `{ year: string, slug: string }[]` for static path generation.

#### Scenario: Returns correct pairs

- **WHEN** `getAllPostSlugs()` is called
- **THEN** returns an array where each entry has `year` matching the post's `publishedAt` year and `slug` matching the post's slug

### Requirement: getAdjacentPosts returns previous and next posts

The system SHALL return `{ prev: Post | null, next: Post | null }` for a given slug, ordered by `publishedAt`.

#### Scenario: Middle post has both neighbors

- **WHEN** `getAdjacentPosts("middle-slug")` is called and the post is neither oldest nor newest
- **THEN** both `prev` and `next` are non-null

#### Scenario: Newest post has no next

- **WHEN** `getAdjacentPosts("newest-slug")` is called
- **THEN** `next` is `null`

### Requirement: getPostsByYearMonth groups posts by year and month

The system SHALL return all published posts grouped as `{ year: string, months: { month: string, posts: Post[] }[] }[]` sorted newest first.

#### Scenario: Posts are grouped correctly

- **WHEN** `getPostsByYearMonth()` is called with posts in multiple years/months
- **THEN** each year group contains the correct months, each month contains the correct posts

### Requirement: getAllTags returns unique tags with post counts

The system SHALL return `Tag[]` derived from all published posts' frontmatter tags, deduplicated by slug.

#### Scenario: Tags are deduplicated

- **WHEN** multiple posts share the same tag
- **THEN** the tag appears once in the result with `count` equal to the number of posts using it

### Requirement: getPostsByTag returns posts for a given tag slug

The system SHALL return all published posts that include the given tag slug.

#### Scenario: Posts with matching tag are returned

- **WHEN** `getPostsByTag("typescript")` is called
- **THEN** only posts with `typescript` in their tags array are returned

#### Scenario: Unknown tag returns empty array

- **WHEN** `getPostsByTag("nonexistent-tag")` is called
- **THEN** an empty array is returned

### Requirement: All queries handle empty content directory

The system SHALL return empty results (not throw) when `content/posts/` contains no files.

#### Scenario: Empty directory returns safe defaults

- **WHEN** `content/posts/` directory is empty or doesn't exist
- **THEN** all query functions return empty arrays or null without throwing
