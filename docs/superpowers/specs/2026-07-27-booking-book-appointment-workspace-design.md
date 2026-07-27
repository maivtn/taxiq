# Booking Book Appointment Workspace Design

## Decision

Booking Book keeps its full appointment workspace visible: appointment table, table/calendar switcher, create flow, detail editor, and appointment actions. POS Appointments remains available as a second shared workspace.

## Behavior

- Booking Book does not render an additional handoff card above the appointment workspace.
- The existing Booking Book appointment markup is no longer wrapped with the HTML `hidden` attribute.
- Booking Book continues to read and mutate the shared catalog and appointment store; no independent service or technician catalog is reintroduced.
- No separate right-side appointment panel is added outside the existing Booking Book workspace.

## Verification

- The Booking Book contract test requires the visible appointment workspace and its table, calendar, and action hooks.
- The full shared appointment suite, inline-script parsing, and `git diff --check` must pass.
