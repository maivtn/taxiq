# Loyalty Reward Quick Create UX

## Goal

Make reward creation faster without returning to a multi-step wizard. The default form should expose only the fields most staff need, while advanced redemption and availability controls remain available on demand.

## Approved direction

Use a single-screen **Quick Create** form with progressive disclosure:

- Keep reward type, name, points cost, value/linked item, and expiration visible.
- Show the most relevant rule for the selected reward type.
- Collapse advanced redemption and availability settings by default.
- Keep the live preview visible.
- Keep the second confirmation modal before creating or saving.

## Form behavior

The visible form contains:

1. Reward type selector.
2. Reward name, points cost, value/linked item, and expiration.
3. Contextual fields:
   - Percent Discount shows maximum discount.
   - Dollar/Percent Discount shows minimum spend.
   - Free Service/Product emphasizes the linked item.
4. Collapsible `More redemption rules` section for services, locations, stacking, membership, customer limit, and issued reward validity.
5. Collapsible `Availability & limits` section for audience, status, quantity, and budget.

Defaults remain Active, All Customers, All services, no minimum spend, and unlimited quantity/budget. Existing values must remain populated when editing a catalog card.

## Confirmation modal

The modal remains mandatory. It is a compact summary rather than a second form and shows reward type/name, points cost, value, expiration, and applicable discount/spend rules. Its actions are:

- `Back & edit` to close the modal and return to the form.
- `Confirm & create` for a new reward.
- `Save changes` for an edited reward.

The existing `buildPreviewHTML()` and `finalizeReward()` flow should be reused, with the summary content limited to the relevant fields.

## Validation and accessibility

- Keep inline validation for name, value/linked item, positive integer points cost, minimum spend, and percent maximum discount.
- Conditional fields must be hidden only when they are not relevant; their stored values must not be lost.
- Use native `<details>/<summary>` or equivalent keyboard-accessible disclosure controls.
- Keep reward type keyboard selection and native labels.

## Verification

- Test that advanced sections are collapsed by default and all existing selectors remain present.
- Test that the confirmation modal remains wired to create/edit actions.
- Run the existing Node test suite, inline script syntax validation, and `git diff --check`.
