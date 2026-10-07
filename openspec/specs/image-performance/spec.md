# Image Performance Specification

## Purpose

Reduce page image transfers while preserving existing content, routes and visible design.

## Requirements

### Requirement: Static responsive article images

The site SHALL create WebP variants during its static build, retain original image files and URLs, and provide image dimensions and responsive choices in article HTML.

#### Scenario: Read an article on a narrow screen

- **WHEN** an article contains a registered local image
- **THEN** its HTML reserves the original aspect ratio and offers smaller WebP choices
- **AND** images after the first image use lazy loading
- **AND** the canonical source image remains available unchanged

### Requirement: Efficient portrait loading

The main homepage, About and CV SHALL use local WebP portraits without changing their subjects or visible layout.

#### Scenario: Open the homepage

- **WHEN** the homepage loads
- **THEN** it loads the local WebP portrait
- **AND** it does not prefetch the CV root application
