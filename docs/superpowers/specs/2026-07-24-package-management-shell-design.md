# Package Management Shell Design

## Context

Create a new empty Nexora Touch merchant page for future package-management work. The page must reuse the sidebar, sticky header, responsive content spacing, and shared navigation behavior from `html/pages/booking-book-phase-1.html` through `nexora-shell.css` and `nexora-shell.js`.

## Goals

- Add a shared-sidebar entry labeled `Quản lý gói`.
- Link that entry to a standalone page at `html/pages/nexora-packages.html`.
- Mark the entry active when the new page is open.
- Keep the page content empty while preserving the shared responsive content frame.

## Non-goals

- No package data, tabs, cards, filters, forms, or actions yet.
- No package API, persistence, or business logic.
- No changes to the existing booking page or TaxIQ package-related screens.

## Page structure

The new page contains:

1. A standard HTML document with the Inter font and shared shell stylesheet.
2. The shared shell root with an empty sidebar placeholder and header placeholder.
3. An empty `<main class="content">` reserved for future package-management content.
4. The shared shell script configured with `activePage: 'packages'`.

The sidebar route map includes `packages: 'nexora-packages.html'` and a top-level item `{ label: 'Quản lý gói', page: 'packages' }`. The item uses the shared shell's normal active-state behavior.

## Visual and responsive rules

- Reuse the shared shell's sidebar, header, font, box-sizing reset, and content spacing without duplicating shell CSS.
- Preserve the booking shell breakpoints: 16px content padding below 640px, 24px from 640px, and 28px from 1024px.
- Keep the page visually empty below the header until the package-management feature is designed.

## Verification

- Assert that the new HTML page exists and includes the shared shell assets and `activePage: 'packages'`.
- Assert that the shared sidebar renders and activates the `Quản lý gói` link for the new route.
- Assert that the page has an empty content frame and no package-specific UI/data.
- Run the focused shell/page tests and the full Node test suite.
- Run JavaScript syntax and diff checks; confirm the working tree is clean after commit.
