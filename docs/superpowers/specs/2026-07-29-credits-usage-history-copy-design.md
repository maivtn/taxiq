# Credits Usage History Copy Design

## Goal

Refine the Credits Management usage history so Voice activity does not display phone numbers and the `Amount` column uses the clearer `Usage` label.

## Scope

- Remove the `phone` field from Voice usage-history fixtures.
- Render Voice activity using the existing activity text, such as `Incoming call`.
- Rename the history table header from `Amount` to `Usage`.
- Keep usage values, filters, layout, dates, and balance data unchanged.

## Approach

Update both the fixture data and the runtime renderer. This keeps the static fallback markup and dynamically rendered rows consistent without leaving phone numbers in the history data or DOM.

## Verification

Run the focused Credits Management test suite and `git diff --check`. Confirm that Voice rows contain activity text without phone numbers and that the table header is `Usage`.
