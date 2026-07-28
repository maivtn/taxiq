# POS mode switch and role-gated navigation

## Context

`html/pages/pos-phase-1.html` currently opens in the Owner mode and always renders the Operations, Time Clock, Management, and Appointments tabs. The page already has a demo `STAFF` roster and role labels, so the mode switch can reuse those data structures without introducing a second authentication model.

## Goals

- Add a mode-switch button beside the POS title.
- Let a user choose a demo staff role and enter a PIN in a modal.
- Update the title badge to reflect the active staff member and role.
- Hide Management completely for the Front Desk role.
- If Front Desk mode is selected while Management is active, immediately activate Operations so no management panel remains visible.
- Keep the existing tab URL/state behavior working for roles that can access Management.

## Non-goals

- No backend authentication or real PIN validation.
- No persistence across page reloads.
- No permission changes for Operations, Time Clock, or Appointments.
- No changes to unrelated pages or the existing management data model.

## User experience

1. The header shows `POS`, the current role badge, and a compact `Đổi mode` button.
2. Clicking `Đổi mode` opens an accessible modal with the demo staff cards for Brian (Owner), Mia (Manager), and Cindy (Front Desk). The selected card is visually marked.
3. The modal contains a numeric PIN field, a close button, Cancel action, and confirmation action. The demo PIN is `1234`, matching the existing POS demo convention.
4. Submitting without a selected staff member or with an incorrect PIN keeps the modal open and shows an inline error. A valid submission closes the modal, updates the header badge, and applies the role's tab visibility.
5. In Front Desk mode, the Management tab is hidden and the Management panel is hidden. If it was the active tab, the page switches to Operations before the new role is displayed.
6. Switching back to Owner or Manager restores the Management tab. The current non-management tab remains active unless the previous switch had to leave Management.
7. Escape and backdrop clicks close the modal without changing the active mode.

## Implementation design

### Markup and styling

- Extend the existing `.page-title-row` with a `data-pos-mode-open` button.
- Add a new modal using the existing `.sms-modal`, `.sms-dialog`, `.sms-mhead`, `.sms-mbody`, and `.sms-mfoot` visual language so the feature stays consistent with the page.
- Add role cards with stable `data-pos-role` hooks, a PIN input with `data-pos-mode-pin`, an inline error/status region, and `data-pos-mode-submit` / `data-pos-mode-close` controls.
- Mark the Management tab and panel with stable hooks or use their existing `data-pos-tab="management"` and `data-pos-panel="management"` selectors.

### State and behavior

- Add `activeStaffId`, initialized to the current Owner (`owner`), alongside the existing page state.
- Resolve selectable accounts from `STAFF` and limit the modal to Owner, Manager, and Front Desk entries, matching the supplied POS role-picker reference.
- Add a small role-application function that:
  - updates the active staff and title badge;
  - toggles the Management tab and panel visibility for `frontdesk`;
  - calls `activateTab('dispatch')` when Management is no longer allowed and currently active.
- Keep `activateTab` as the single source of truth for panel activation and URL synchronization. It must reject or redirect a direct `?tab=management` URL in Front Desk mode as a defensive UI guard.
- Use the existing `esc` helper for staff names/labels rendered into the modal.

### Error handling and accessibility

- Keep the modal closed until opened and set focus to the PIN input on open.
- Use `role="dialog"`, `aria-modal="true"`, a labelled heading, and an `aria-live="polite"` error/status region.
- Use `type="password"` with numeric input hints for the PIN; do not log or persist the PIN.
- On invalid submission, show a concise error and return focus to the PIN input.
- Close on Escape and backdrop click; closing without confirmation preserves the current role.

## Testing and acceptance criteria

Add focused tests to `html/pages/pos-phase-1.appointments.test.cjs` or a new POS test file, following the repository's existing source-contract test style. The tests should verify:

- the mode button, modal, role cards, PIN input, submit/close controls, and accessible error region exist;
- the role picker includes Owner, Manager, and Front Desk demo accounts;
- the implementation applies `frontdesk` visibility by hiding both the Management tab and panel;
- switching away from an active Management tab routes to Operations;
- an invalid PIN does not apply a role, while the demo PIN is recognized by the page logic;
- direct Management activation is guarded when the active role is Front Desk.

Manual acceptance: load the page, switch to Cindy with PIN `1234`, confirm no Management tab or panel is visible, then switch to Brian and confirm Management returns.

