# Booking SMS Notifications Settings Design

## Goal

Add a prototype-only Settings card to `html/pages/booking-book-phase-1.html?tab=settings` for choosing who receives an SMS when a customer submits a booking.

## Context

- The Booking Settings page already uses `.settings-card` for grouped configuration areas.
- The page already has a reusable `.toggle-pill` switch with `is-on` styling and a first-call SMS toggle that synchronizes `aria-checked` and its accessible label.
- `Salon Info` already contains the booking notification number used by the salon; this feature adds recipient preferences without changing that field.
- This is a static prototype. No persistence, API, SMS delivery, or backend configuration is required.

## Recommended approach

Add one standalone `.settings-card` named `Booking SMS Notifications`, reusing the existing Settings card and switch styles. Keep the three recipient preferences as explicit markup rows so the prototype is easy to scan and can later map cleanly to a backend configuration object.

The card will appear in the Settings card grid near the other booking-related configuration. It will contain three independent rows:

1. Send to customer
2. Send to salon
3. Send to assigned staff

All three switches start enabled in the prototype. Each switch uses `role="switch"` and an `aria-checked` value. Clicking a switch updates its visual state and accessibility state, and writes a short message to the existing Settings status area. The state resets on page reload because no storage is introduced.

## UI structure

- Card title: `Booking SMS Notifications` with a message/SMS icon.
- Card description: explain that the switches control SMS recipients after a customer booking is received.
- Each row contains a recipient label, a short explanation, and a right-aligned switch.
- Rows use the existing Settings surface, border, typography, spacing, and responsive behavior. No new modal or separate navigation is needed.

## Runtime behavior

- Add a focused `syncBookingSmsNotificationToggle(toggle)` helper that derives enabled state from `is-on`.
- The helper updates `aria-checked`, the accessible label (`Enable ...` / `Disable ...`), and the row's visible `On`/`Off` status.
- Register click handlers for `[data-settings-booking-sms-toggle]` during page initialization.
- Reuse `setSettingsStatus` for feedback such as `Customer booking SMS enabled.`.
- Do not add persistence or alter the existing first-call SMS behavior.

## Testing and acceptance criteria

Add a focused Node source-contract test for `booking-book-phase-1.html` that verifies:

1. The Settings panel contains the `Booking SMS Notifications` card.
2. The card exposes all three recipient labels and three independent toggle hooks.
3. Each toggle is an accessible switch with an initial enabled state.
4. The runtime contains the synchronization helper, `aria-checked` updates, accessible enable/disable labels, and event registration.
5. Existing first-call SMS toggle hooks remain present.

Run the focused test, the related Booking page tests, inline-script syntax validation, and `git diff --check` after implementation.

## Scope boundaries

- No localStorage or shared-store persistence.
- No backend/API integration or actual SMS sending.
- No changes to SMS Campaigns, the booking notification phone field, or first-call SMS message editing.
- No unrelated Settings redesign.
