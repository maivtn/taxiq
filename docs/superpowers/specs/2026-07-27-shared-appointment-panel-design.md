# Shared Appointment Action Panel Design

**Date:** 2026-07-27  
**Status:** Approved for implementation planning

## Goal

Give Booking Book and POS Appointments the same right-side appointment workspace. Selecting an appointment in either page opens one consistent action surface so front-desk staff can edit, reschedule, change status, send SMS, or cancel the same shared record from either screen.

## Scope

This change covers:

- A right-side appointment panel in Booking Book matching the existing POS appointment panel pattern.
- Reusing the POS panel behavior as the visual and interaction baseline rather than introducing a new modal-first workflow.
- Opening the panel from a POS calendar event, Booking Book table/card row, or Booking Book team-calendar event.
- Opening the same panel in create mode from a calendar time range or New appointment action.
- Shared actions: save appointment, reschedule, mark completed, mark no-show, send SMS, and soft-cancel.
- Cross-page refresh through the existing shared appointment store and storage subscription.
- Responsive behavior: the panel remains a side column on desktop and becomes a full-width bottom drawer/modal on narrow screens.

This change does not add a backend, change the canonical appointment schema, add real SMS delivery, or create a third application-wide component framework.

## Current State

- POS Appointments already uses a two-column layout: DayPilot resource calendar on the left and an appointment form panel on the right.
- POS has a single selected appointment state (`apMode`, `apSel`, `apDraft`) and renders create/edit actions in `[data-ap-panel]`.
- Booking Book uses table/card actions and a centered detail modal for appointment inspection/actions. Its team calendar opens the same modal, while create uses a separate centered create modal.
- Both pages already use the same canonical appointment store and shared salon catalog, so the panel can operate on the existing record IDs without a data migration.

## Recommended Architecture

Keep the existing page-local rendering functions and data adapters, but standardize the panel contract and interaction semantics:

```text
shared appointment store
          │
          ├── POS snapshot → POS right panel
          └── Booking snapshot → Booking right panel
```

The two pages will not share a new runtime component file in this iteration. Each page will render its own panel HTML because the pages have different shell/layout CSS and POS-specific ETA/check-in behavior. Both panels use the same canonical fields and action labels, and both call the existing `appointments-store.js` APIs.

### Panel contract

Each page exposes a panel host with the same conceptual states:

- `empty`: no appointment selected; explain how to select or create one.
- `loading`: short skeleton state while opening a new appointment, matching the current POS behavior.
- `new`: editable customer, phone, service, technician, date, time, duration, and status fields.
- `edit`: the same fields prefilled from the selected canonical record, with source/status metadata.
- `saving`: disable duplicate submit while a store write is in progress.

The panel is the primary action surface. Existing row/card action buttons remain as compact entry points that select the record and reveal the panel; they do not maintain an independent action flow.

## User Flows

### Select and edit

1. User clicks a POS event, Booking Book table/card row, or Booking Book team-calendar event.
2. The page resolves the canonical appointment ID and renders it in the right panel.
3. User edits fields and clicks Save appointment.
4. The page validates through the existing shared store/conflict helpers, writes the record, refreshes its local UI, and lets the other page refresh through the existing subscription/storage event.

### Create

1. User selects a free calendar range or clicks New appointment.
2. The panel opens in `new` mode with date/time/technician prefilled when available.
3. Save calls `appointmentStore.create()`; the new record appears in both pages.

### Status and operational actions

- `Send SMS` updates the shared `smsStatus` to `sent` and changes the panel/table presentation to SMS Sent.
- `Done` maps to canonical `completed`.
- `No-show` maps to canonical `no-show`.
- `Cancel this appointment` uses the existing soft-cancel flow and removes the record from active calendar/table views while retaining history in the store.
- POS-only arrival/ETA actions remain in the POS panel because Booking Book does not have a dispatch queue. They operate on the same record metadata and trigger the normal shared refresh.

### Close and responsive behavior

- Closing the panel returns to the empty state without changing the selected record.
- On desktop, the panel is a fixed-width right column beside the primary calendar/table content.
- At the existing mobile breakpoint, the panel becomes a bottom drawer or full-width stacked section; all controls remain keyboard/touch accessible.
- Centered Booking Book appointment detail/create modals are removed from the primary appointment workflow. Non-appointment settings modals are unaffected.

## Layout and Styling

Booking Book will adopt the visual language already used by the POS panel: compact title/meta row, stacked form labels, chip-based services, full-width primary action, destructive cancellation action, and a close action. It will use Booking Book design tokens and existing button classes where possible so the shared shell remains visually consistent.

The main Booking Book content will switch to a desktop grid with a flexible primary region and a right panel width aligned with POS. The table may scroll horizontally inside the primary region; the right panel must not be pushed below it on desktop. The existing Booking Book cards and calendar remain available in the primary region.

## Error Handling

- Keep the existing shared-store validation messages and page-specific toast/inline warning surfaces.
- Keep the panel open when validation fails so the user can correct the field.
- If a selected record is cancelled or removed by another tab, refresh the store snapshot and return the panel to `empty` with a non-blocking notice.
- Escape/close must not discard unsaved changes silently; if dirty-state tracking is already available, use the existing confirmation pattern, otherwise Save/Close remains explicit and no new dirty-state system is introduced.

## Testing Strategy

Add page-contract tests for:

- Booking Book includes a right-side panel host and renders the shared canonical fields/actions.
- Booking Book row/card/calendar selection routes through the panel rather than opening the appointment detail modal as the primary flow.
- POS retains its right panel and uses the same store-backed action contract.
- Both pages expose create/edit/cancel/status handlers that call the shared store.
- Responsive CSS contains the desktop two-column and mobile stacked/drawer states.

Keep the existing 44-test shared catalog/store/page suite green. Add browser smoke coverage at desktop width for:

1. Booking Book create → POS panel opens the same record.
2. POS edit/reschedule → Booking Book panel reflects the same time/technician.
3. Send SMS/status/cancel from either page → both active views update.

## Acceptance Criteria

1. Both pages have a visible right-side appointment workspace on desktop.
2. Selecting an appointment from either page exposes the same core editable fields and shared actions.
3. Creating/editing/status-changing/cancelling from either page updates the canonical record and the other page.
4. Booking Book no longer requires a centered appointment detail modal for its primary edit/action flow.
5. POS ETA/check-in behavior remains available and continues to use the shared record.
6. Mobile layout remains usable without horizontal clipping or inaccessible actions.
7. Existing shared-store tests pass and new panel contract tests cover the new entry points.
