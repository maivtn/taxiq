# Canonical Appointments Screen Design

> Superseded for Booking Book visibility by `2026-07-27-booking-book-appointment-workspace-design.md`: Booking Book now keeps its shared appointment workspace visible alongside POS.

## Goal

Keep one operational appointment screen for the salon. POS Appointments becomes the canonical calendar, list, editor, and action panel; Booking Book no longer renders a second appointment workspace.

## User experience

- Opening Booking Book shows a concise handoff card instead of a second appointment table, calendar, or right-side editor.
- The handoff card links to `pos-phase-1.html?tab=appointments` with clear copy that all booking channels are managed there.
- Booking Book's Customers, Call Log, SMS Campaigns, QR Codes, Plans, and Salon Settings tabs remain available.
- POS Appointments continues to render the shared appointment store, including records created from Booking Book, POS, and other channels.

## Architecture

- Keep `html/assets/appointments-store.js` as the single appointment data contract.
- Keep POS appointment rendering and mutation handlers as the only operational appointment UI.
- Preserve Booking Book's existing appointment migration/runtime code behind a hidden legacy container for this transition so shared records and existing script assumptions remain safe; it must not be visible or expose duplicate controls.
- Add a stable handoff contract (`data-booking-appointments-handoff`) for tests and future navigation changes.

## Error handling and accessibility

- The handoff uses a real link so it works without JavaScript and opens the canonical POS tab directly.
- The link has an accessible label and visible explanation; no empty-state editor is shown when there is no selected appointment.
- Existing POS validation, conflict detection, and shared action behavior are unchanged.

## Testing

- Add a failing static contract test that requires the handoff link and rejects a visible Booking Book appointment editor/layout.
- Run the full shared appointment suite.
- Parse inline scripts and smoke-test Booking Book handoff plus POS appointment rendering in a local browser.
