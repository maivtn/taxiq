# POS Booking Tab Design

## Goal

Replace the existing `Appointments` tab in `html/pages/pos-phase-1.html` with the full `Booking` workspace currently available in `html/pages/booking-book-phase-1.html`.

## Scope

- Rename the POS tab and its panel contract from `appointments` to `booking`.
- Port the Booking Book appointment workspace into POS, including:
  - table/card/calendar views;
  - status and date/customer filters;
  - appointment detail panel;
  - new appointment flow and service/technician ticket pickers;
  - appointment actions such as SMS, completion, no-show, edit, and cancel.
- Keep POS Operations, Time Clock, Management, mode switching, and existing tab URL synchronization intact.
- Reuse the shared salon catalog, approved booking service catalog, and appointment store. Do not introduce a second appointment data model.
- Keep `booking-book-phase-1.html` unchanged as the canonical standalone Booking Book page.
- Remove the old POS-specific DayPilot appointment workspace and its seed/runtime dependencies when they are no longer referenced by POS.

## Integration design

The POS page remains the outer shell and tab owner. The Booking workspace is adapted to POS selectors rather than creating a nested tab system. POS tab activation remains the single source of truth for showing and hiding panels; Booking-specific view switching stays local to the Booking panel.

Booking-specific styles, markup, and runtime behavior will be ported from the existing Booking Book implementation with the smallest necessary selector adaptations. Shared store/catalog scripts will be loaded before the POS runtime, and Booking initialization will subscribe to the shared appointment store so mutations remain visible across surfaces.

The tab will be exposed as:

```html
<button data-pos-tab="booking">Booking</button>
<section data-pos-panel="booking">...</section>
```

The POS mode switch continues to gate only Management; Booking remains available in Owner, Manager, and Front Desk modes.

## Testing and acceptance

Add focused source-contract coverage for the POS Booking tab. The tests will verify:

- the POS tab is named `booking` and the old `appointments` tab contract is absent;
- the Booking workspace exposes table, calendar, filter, detail, create, and action hooks;
- POS loads the shared catalog/store and approved booking catalog before its runtime;
- the old DayPilot/legacy POS appointment integration is removed;
- existing POS mode and non-Booking tab contracts continue to pass.

Acceptance is met when the POS page opens the `Booking` tab with the Booking Book workspace behavior, while Operations, Time Clock, Management, mode switching, and existing shared appointment behavior remain intact.

## Out of scope

- Redesigning the Booking Book UI.
- Changing appointment business rules or shared-store schema.
- Modifying unrelated pages or adding a new backend/API.
