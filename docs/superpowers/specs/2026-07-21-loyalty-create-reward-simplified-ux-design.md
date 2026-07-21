# Loyalty Create Reward — Simplified UX

## Goal

Make Create Reward faster to understand and complete by replacing the current three-step wizard with one scannable form. The form remains focused on redeeming points for rewards; Earn Rules stays unchanged.

## Approved direction

Use a single-screen form with grouped sections and one persistent action area. Keep all existing reward data and behavior, but remove the stepper, Continue, Back, and step-specific visibility.

## Interface

The builder will contain four visually distinct groups:

1. **Reward details** — reward type, name, points cost, description, value/linked item, and expiration.
2. **Redemption rules** — minimum spend, maximum discount, eligible services, valid locations, promotion stacking, membership eligibility, customer limit, and issued reward validity.
3. **Availability & limits** — customer segment, status, quantity limit, and budget limit.
4. **Preview** — the existing live preview remains visible beside the form on desktop and below it on narrow screens.

The primary action is **Publish Reward** for create mode and **Save Changes** for edit mode. The action remains visible at the bottom of the form. The catalog back action remains available above the form.

## Behavior and data flow

- Selecting a reward type continues to populate sensible defaults for name, value, points, and description.
- All existing `getRewardDraft()`, create, edit, preview, pause, and view behavior continues to use the same fields.
- Publish/Save validates required reward details and redemption rules in one pass, then opens the existing confirmation dialog.
- Editing a catalog card opens the same single-screen form with all stored values populated.
- No earning triggers, review windows, or delivery channels are introduced into Reward Catalog.

## Validation and accessibility

- Required fields remain reward name, reward value/linked item, and positive integer points cost.
- Minimum spend remains required; maximum discount is required for percent discounts.
- Validation marks invalid fields inline and shows the existing toast message.
- Keep keyboard support for reward type selection and native labels/controls.
- Remove obsolete wizard navigation listeners and state while keeping the shared create/edit state.

## Verification

- Update the page tests to assert the single-screen structure and absence of wizard controls.
- Run `node --test html/pages/salon-setup-reward.test.mjs`.
- Parse every inline script with `vm.Script` and run `git diff --check`.
