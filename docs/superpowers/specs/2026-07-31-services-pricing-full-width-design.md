# Services & Pricing full-width Settings card

## Goal

Make the `Services & Pricing` card occupy the full available width of the Booking Settings layout on desktop.

## Scope

- Add a semantic, card-specific class to the existing `Services & Pricing` article.
- Scope one CSS grid rule to that card so it spans all columns in `.settings-two-grid`.
- Add a source-contract test for the class and `grid-column: 1 / -1` rule.

Out of scope: changing service catalog content, actions, modal behavior, persistence, responsive breakpoints, or the layout of any other Settings card.

## Design

The existing `.settings-two-grid` remains a two-column grid at desktop widths. The `Services & Pricing` article receives the `settings-service-pricing-card` class and uses:

```css
.settings-two-grid > .settings-service-pricing-card {
  grid-column: 1 / -1;
}
```

This makes the card span the full row while preserving its current padding, scrolling catalog body, controls, collapse button, and data hooks. At mobile widths the parent already becomes a one-column grid, so the rule has no visual side effect.

## Testing

Add a focused test in `html/pages/booking-book-phase-1.settings-services.test.mjs` that verifies the card class and full-width grid rule. Run the focused Settings tests, inline-script parsing, `git diff --check`, and the complete Node test suite after implementation.
