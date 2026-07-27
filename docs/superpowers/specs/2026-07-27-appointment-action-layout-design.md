# Appointment Action Layout Design

## Goal

Make the appointment detail action area easier to scan and make the appointment metadata explicit.

## Approved design

In edit mode, the metadata row will show explicit label/value pairs:

- `Status: [Pending]` (or the current appointment status chip)
- `Nguồn: [Phone]` (or the normalized booking-source chip)

The action hierarchy will be:

1. Full-width primary `Save appointment`.
2. A three-column operational row for `Send SMS`, `Done`, and `No-show`.
3. A separated destructive full-width `Cancel this appointment` action.
4. A separated neutral full-width `Close` action.

The existing action semantics and shared appointment-store mutations remain unchanged. New appointments do not show edit-only status actions until they are saved.

## Scope

- Update only the POS appointment detail panel markup and styles.
- Add source-level regression assertions to the existing POS appointment test.
- Preserve responsive stacking below the existing mobile breakpoint.

## Verification

- The POS appointment test must assert the visible `Status:` and `Nguồn:` labels and the action grouping hooks.
- Run the full appointment-related Node test suite and `git diff --check`.
