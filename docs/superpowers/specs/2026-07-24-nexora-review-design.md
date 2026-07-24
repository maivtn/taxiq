# Nexora Review Dashboard Design

## Context

Create a new Nexora Touch merchant screen at `html/pages/nexora-review.html` for reviewing customer feedback. The existing `html/pages/reviews.html` is a TaxIQ screen and remains unchanged. The new screen should use the merchant shell pattern from `html/pages/booking-book-phase-1.html` and be reachable from the shared Nexora sidebar's Reviews item.

## Goals

- Give a salon owner a quick view of the store's review health.
- Compare store-level feedback across Nexora, Google, and Yelp.
- Let the owner inspect Nexora reviews attributed to individual nail technicians.
- Provide useful client-side prototype interactions without pretending that Google/Yelp APIs are connected.
- Preserve the existing Nexora Touch visual language and responsive shell behavior.

## Non-goals

- No real Google, Yelp, or Nexora API integration.
- No review reply workflow, moderation workflow, export, or review-request campaign in this screen.
- No technician photo assets; avatars use initials only.
- Do not replace or refactor the existing TaxIQ `html/pages/reviews.html` page.

## Page structure

The page contains the same fixed/drawer sidebar and sticky header used by the Nexora merchant pages. The content area contains:

1. A page heading with `Reviews` and a short description.
2. A toolbar with period selector, search input, and star-rating filter.
3. A store summary panel with:
   - overall rating;
   - total review count;
   - star-distribution bars;
   - a small trend indicator.
4. Three source cards for `Nexora`, `Google`, and `Yelp`, each showing rating, review count, source badge/icon, and a short summary. Selecting a card filters the review feed to that source.
5. A two-tab review workspace:
   - `Store reviews`: review cards from all selected store-level sources;
   - `Technician reviews`: technician selector/list plus reviews attributed to the selected technician.
6. A review list with source badge, initials avatar, customer name, date, star rating, service/technician metadata where available, and review body.
7. An empty state when the active filters return no results.

Google and Yelp reviews are store-level only. Nexora reviews may contain a technician attribution and are the only reviews shown in the technician view.

## Visual and interaction rules

- Reuse Nexora shell variables, typography, borders, shadows, gradients, and responsive breakpoints.
- Use `nexora-shell.css` and `nexora-shell.js` as the shared shell sources of truth.
- Use initials for all visible avatars, such as `BN` for Bitcoin Nail Bar and two-letter initials for technicians/customers. Initials sit inside colored gradient circles so no image asset is required.
- Keep labels and navigation consistent with the existing Nexora merchant pages.
- The active page is Reviews; the shared sidebar Reviews item links to `nexora-review.html`.
- Search matches customer names and review text.
- The rating filter supports `All`, `5`, `4`, `3`, `2`, and `1` stars.
- The period selector supports `Last 30 days`, `Last 90 days`, and `This year`; demo review dates are chosen so the filter visibly changes the feed.
- Source cards, tabs, filters, and technician selections update the visible review list immediately on the client.
- Tabs expose selected state and panels use ARIA-compatible labels/relationships. Interactive controls have visible focus states.
- Desktop uses a summary/source grid and two-column technician workspace where space allows. Mobile stacks cards and keeps controls full-width.

## Demo data

Use Bitcoin Nail Bar as the demo salon. Include representative data for:

- Nexora store reviews with some technician attribution;
- Google store reviews;
- Yelp store reviews;
- multiple technicians with different review counts/ratings, each using initials;
- a mixture of recent and older review dates so period filtering can be verified;
- positive, neutral, and lower-rated comments so star distribution and empty-state behavior are credible.

The data is local to the page and should be structured so the rendering/filtering code does not duplicate review markup.

## Technical boundaries

- Add the new page as a standalone HTML prototype under `html/pages/`.
- Add only review-specific styles and behavior to the new page unless a small shared-shell navigation change is required to link Reviews to the new page.
- Do not alter the TaxIQ app renderer or existing `html/pages/reviews.html`.
- Keep the implementation dependency-light and compatible with the repo's static-server workflow.

## Verification

- Confirm the new file loads through the documented local static server.
- Confirm the sidebar/header render through the shared shell and the Reviews link points to `nexora-review.html`.
- Verify source cards, tabs, search, rating filter, period filter, technician selection, and empty state.
- Verify initials-only avatars are used throughout.
- Check layout at desktop and mobile widths.
- Run the relevant available static/test checks and report any environment-dependent checks that cannot run.

