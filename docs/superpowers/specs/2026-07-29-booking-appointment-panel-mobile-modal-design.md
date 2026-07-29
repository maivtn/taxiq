# Booking Appointment Panel Responsive Modal Design

## Goal

Make the Booking Book `booking-appointment-panel` responsive by presenting it as a modal below `1400px`, while preserving the existing side-panel experience on larger screens.

## Scope

- Keep the appointment panel as a sticky side rail at viewport widths of `1400px` and above.
- At widths below `1400px`, show the existing panel as a fixed modal presentation with a backdrop.
- Use a centered dialog treatment for tablet widths and a full-width bottom sheet treatment for mobile widths.
- Lock body scrolling while the panel modal is open.
- Close the modal through the existing panel Close action, a new header close control, backdrop click, or Escape.
- Reconcile presentation when the viewport crosses the `1400px` breakpoint while the panel is open.
- Preserve all existing appointment form fields, actions, state, and `data-booking-panel-*` hooks.

## Approach

Reuse the existing appointment panel and runtime state. Add a sibling backdrop, a runtime presentation synchronizer, and a responsive CSS state rather than duplicating the edit form in `booking-detail-modal`.

The synchronizer determines whether the panel is open and whether the viewport is below `1400px`. It toggles the modal presentation state, backdrop visibility, dialog ARIA attributes, and a body scroll-lock class. Existing panel actions continue to own save, status, cancel, and close behavior.

## Accessibility and interaction

- The modal presentation uses `role="dialog"`, `aria-modal="true"`, and the existing appointment-details label.
- The desktop side rail uses complementary semantics and does not expose `aria-modal`.
- The header close control is focusable and has an explicit accessible label.
- Escape and backdrop clicks call the existing `closeBookingAppointmentPanel()` path.

## Verification

Extend `html/pages/pos-phase-1.appointments.test.cjs` for the `<1400px` responsive contract, backdrop and close hooks, modal presentation synchronization, and body scroll lock. Run the focused POS appointments suite and `git diff --check`.
