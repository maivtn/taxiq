# POS Queue card clarity redesign

## Goal

Make each Queue card in `pos-phase-1.html?tab=tickets` faster to scan at the front desk while preserving the existing ticket actions and data.

## Scope

- Redesign the single-ticket Queue cards for waiting, in-service, ready, completed, and cancelled states.
- Establish a clear hierarchy for guest, status/timer, service, technician, customer-group tags, note, and actions.
- Keep multi-ticket orders grouped and preserve the existing card-level charge behavior.
- Keep the existing table view unchanged except for shared styling helpers where needed.
- Add focused source-level tests for the new Queue card structure and responsive classes.

Out of scope: new ticket actions, data-model changes, backend persistence, Queue filtering/sorting, and redesigning other POS tabs.

## Design

Each single-ticket card will use an operations-first layout:

1. A compact header shows the guest name and customer-group tags, with the current status and elapsed timer visually separated.
2. A service block shows the selected service as the primary detail and the assigned/requested technician as supporting context.
3. A note block uses a subtle surface and truncation/wrapping rules so staff notes remain readable without dominating the card.
4. Actions sit in a dedicated bottom row. The primary next action is visually emphasized; secondary actions remain compact and aligned.
5. Existing state accents remain meaningful: amber for waiting, warning/violet for in service, green for ready, and neutral styling for historical rows. Late waiting tickets retain the danger treatment.

Cards remain full-width within the Queue panel, use flexible wrapping on narrow screens, and prevent long names, notes, or action groups from forcing horizontal overflow.

## Data flow and behavior

The existing `WAITLIST` records and action attributes remain the source of truth. Render helpers may be extracted for status, customer-group tags, note, service, and technician display, but actions continue to route through the current delegated event handlers. Selecting a card still sets the existing ticket selection state; starting, swapping, completing, charging, and cancelling keep their current behavior.

## Testing

Add tests to `html/pages/pos-phase-1.operational-tickets.test.cjs` that assert:

- the single-ticket renderer emits the new header, detail, note, and action sections;
- waiting, service, and ready cards retain their existing action attributes;
- the card uses the existing state classes and customer-group/note helpers;
- the responsive Queue card rules prevent overflow and keep actions wrapping safely.

Run the focused POS test file, the full `html/pages/pos-phase-1*.test.cjs` suite, and `git diff --check` after implementation.
