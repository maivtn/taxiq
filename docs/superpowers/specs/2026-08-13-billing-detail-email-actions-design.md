# Billing Detail Email Actions Design

## 1. Goal

Add status-aware demo email actions to the NEXORA package billing detail page:

- Paid billing records expose `Resend email`.
- Unpaid billing records (`payment_due` and `overdue`) expose `Send reminder`.
- Clicking either action displays a SweetAlert success confirmation.

This is a front-end demo only. It does not send email, call an API, or mutate billing data.

## 2. Scope

### In scope

- Add the new buttons to `nexora-package-billing-detail` only.
- Render the correct action from the billing record's `paymentStatus`.
- Use `billTo.email` as the recipient shown in the success confirmation.
- Reuse the existing Billing Detail action styles and responsive layout.
- Add keyboard-accessible buttons and screen-reader-friendly labels.
- Add tests for rendering and click behavior.

### Out of scope

- Adding these actions to the Package History table.
- Backend email delivery or API integration.
- Loading, retry, rate-limit, or delivery-failure states.
- Persisting a sent timestamp or changing the billing record.
- Changing the existing invoice, receipt, or payment actions.

This design extends the earlier Package History invoice/receipt design. Its email-action exclusion is superseded only for the front-end demo behavior described here; real email delivery remains out of scope.

## 3. User experience

### Paid record

The existing action group keeps `Download invoice` and `Download receipt`, followed by a secondary `Resend email` button with a mail icon.

Clicking `Resend email` opens SweetAlert with:

- Title: `Email resent successfully`
- Message: `Billing documents were sent to <billTo.email>.`
- Icon: `success`
- Confirm button: `Done`

### Unpaid record

The existing action group keeps `Download invoice` and the primary `Pay now` action. A secondary `Send reminder` button with a bell icon is added before `Pay now`, leaving payment as the final primary action.

Clicking `Send reminder` opens SweetAlert with:

- Title: `Payment reminder sent successfully`
- Message: `A payment reminder was sent to <billTo.email>.`
- Icon: `success`
- Confirm button: `Done`

Both `payment_due` and `overdue` use the same reminder behavior.

### Responsive and print behavior

- Desktop continues to wrap actions using the existing `.billing-detail-actions` flex layout.
- At the current mobile breakpoint, all actions continue to become full-width and at least 44 px high.
- Email actions remain hidden when printing because the existing print rules hide `.billing-detail-actions`.

## 4. Implementation design

### SweetAlert dependency

Load SweetAlert2 from the same versioned CDN URL already used by `nexora-packages.html`. Place it before `nexora-package-billing-detail.js` so `window.Swal` is available when a user clicks an email action. No additional modal markup is required.

### Rendering

Add a small renderer in `html/assets/nexora-package-billing-detail.js` that returns a native `<button type="button">` with:

- The shared `.billing-detail-action` class.
- A status-derived label and icon.
- A `data-billing-email-action` value identifying `resend` or `reminder`.
- A `data-billing-transaction` value identifying the current record.
- An accessible label that includes the invoice number.

The paid and unpaid renderers insert this button into their existing `.billing-detail-actions` groups. No Package History markup or behavior changes.

### Interaction

Extend the existing delegated click listener on the Billing Detail root:

1. Detect the nearest `[data-billing-email-action]` button.
2. Resolve its record through the existing transaction lookup.
3. Derive the action from the record status rather than trusting arbitrary button text.
4. Call `window.Swal.fire` with the status-specific success content.

If SweetAlert is unavailable, use the browser's native `window.alert` with the same title and recipient message so the demo action still provides feedback.

The existing `Pay now` branch remains unchanged.

## 5. Data and security

- Use the existing `record.billTo.email`; no new fixture fields are required.
- Continue escaping record-derived values when rendering HTML.
- Pass text to SweetAlert through its `text` option, not its `html` option.
- Do not expose credentials, tokens, or provider-specific delivery details.

## 6. Testing

Update `html/pages/nexora-package-billing-detail.test.mjs` using the existing runtime harness.

Required cases:

1. The Billing Detail page loads SweetAlert2 before its page-specific script.
2. A paid record renders `Resend email` and does not render `Send reminder`.
3. Payment-due and overdue records render `Send reminder` and do not render `Resend email`.
4. Clicking `Resend email` calls SweetAlert with the paid success title, recipient email, and success icon.
5. Clicking `Send reminder` calls SweetAlert with the reminder success title, recipient email, and success icon.
6. Existing download, `Pay now`, responsive, and print contracts remain intact.

The tests must follow red-green TDD: add the behavior assertions, observe the expected failures, implement the minimum production change, and rerun the relevant suite.

## 7. Acceptance criteria

- Email actions appear only on the Billing Detail page.
- `paid` shows `Resend email`.
- `payment_due` and `overdue` show `Send reminder`.
- Each click gives a SweetAlert success confirmation containing the correct billing email.
- No network request or billing-data mutation occurs.
- Existing Billing Detail actions continue to work.
- Relevant automated tests pass, with any unrelated baseline failures reported separately.
