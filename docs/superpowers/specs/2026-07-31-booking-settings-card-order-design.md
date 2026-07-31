# Booking Settings Card Order Design

## Goal

Reorder the Settings cards in `html/pages/booking-book-phase-1.html?tab=settings` so related configuration is visually grouped:

- `Salon Info` sits next to `Operating Hours`.
- `AI Voice` sits next to `Booking SMS Notifications`.

## Current layout

`Salon Info`, `Booking SMS Notifications`, and `Operating Hours` currently share the first two-column Settings grid, while `AI Voice` is in the later grid with `Services & Pricing`. This causes the requested cards to be separated visually.

## Design

Keep the existing Settings grid and move only the card markup so the first grid contains four cards in this order:

1. `Salon Info`
2. `Operating Hours`
3. `AI Voice`
4. `Booking SMS Notifications`

At desktop widths, the grid therefore renders:

```text
Salon Info              | Operating Hours
AI Voice                | Booking SMS Notifications
```

At mobile widths, the same order becomes a single vertical stack. `Team` and `Services & Pricing` retain their current placement after the first grid.

## Behavior and scope

- Move existing `AI Voice` and `Booking SMS Notifications` markup only; do not duplicate either card.
- Preserve all existing `data-*` hooks, collapse controls, switch handlers, and field values.
- Do not add CSS ordering hacks, persistence, or new runtime logic.
- `Services & Pricing`, `Team`, `Salon Info`, and `Operating Hours` behavior remains unchanged.

## Testing and acceptance criteria

Extend the focused Booking SMS Settings source-contract test to assert that, within the Settings panel:

1. `Salon Info` appears before `Operating Hours`.
2. `Operating Hours` appears before `AI Voice`.
3. `AI Voice` appears before `Booking SMS Notifications`.
4. Existing Booking SMS recipient switch and first-call SMS hooks remain present.

Run the focused test, related Booking tests, inline-script parsing, and `git diff --check` after implementation.
