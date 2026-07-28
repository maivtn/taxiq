# SMS Campaign Modal Footer Layout Design

## Goal

On desktop, split the `Tạo SMS Campaign` modal footer into two clear sides:

- the left side contains the estimated cost and SMS credit purchase action;
- the right side contains the `Hủy` and `Gửi Campaign` actions.

On mobile, keep the footer controls stacked vertically so they remain usable at narrow widths.

## Scope

The change is limited to the SMS Campaign composer in `html/pages/booking-book-phase-1.html`. It does not change cost calculation, credit purchasing, campaign submission, or any other modal.

## Design

Keep the existing cost and action groups, but give them explicit footer roles/classes. The footer uses a two-column layout at desktop widths: a flexible cost column and an auto-sized action column. The cost preview and purchase action remain grouped on the left, while the cancel/send controls stay grouped on the right. At `640px` and below, the footer switches to one column and both groups stretch to the available width.

## Testing

Add a focused page-level assertion that the SMS Campaign modal footer contains the explicit cost and action groups and the responsive two-column rule. Run the focused SMS Campaign test file and the full existing Node test suite available in the repository.

## Out of scope

- No changes to modal content or pricing logic.
- No redesign of the separate SMS credit purchase modal.
- No changes to the legacy SMS dashboard or POS prototype copies.
