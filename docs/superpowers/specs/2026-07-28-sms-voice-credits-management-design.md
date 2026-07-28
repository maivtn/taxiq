# SMS and Voice Credits Management Design

## Goal

Add a dedicated Credits Management screen that opens when the user clicks the SMS Credits balance in SMS Campaigns. The screen must manage both SMS credits and AI Voice minutes, and provide a clear Back action to return to SMS Campaigns.

## Context

- SMS Campaigns currently shows an SMS credits balance and has an existing SMS credit purchase modal.
- AI Voice usage is represented in the Booking Book plans area and AI Voice plans are managed by Package Management.
- The new screen is a destination from SMS Campaigns, not a new top-level navigation item.

## Recommended approach

Create a focused page, `html/pages/nexora-credits.html`, backed by dedicated page assets. Link the existing SMS Credits balance to this page with a return target such as `?from=sms-campaigns`; the page renders a Back button linking to `booking-book-phase-1.html?tab=sms-campaigns`.

This keeps the management surface large enough for balances, usage, history, and actions without turning the SMS Campaigns panel into a second dashboard. A tab inside Package Management would mix subscription management with usage credits, while an in-page overlay would be too constrained for the requested management screen.

## Screen design

The page uses the existing Nexora shell styling and contains:

1. A page header with a Back button, the title `Credits Management`, and a short description explaining that SMS and Voice usage are managed here.
2. Two balance cards shown side by side on desktop and stacked on smaller screens:
   - **SMS Credits**: available credits, estimated dollar value, usage progress, low-credit status, and `Buy SMS Credits`.
   - **Voice Credits**: remaining AI Voice minutes, usage progress, plan context, and `Manage Voice Plan`, linking to the existing AI Voice Plans view.
3. A usage/history section with a compact table containing product, activity, amount, date, and balance-after columns. Demo rows are acceptable for this static prototype, but the data shape must be explicit so a backend can replace it later.
4. An accessible empty/loading/error contract for the history region, even if the initial prototype uses synchronous fixture data.

The SMS card reuses the current package names and prices. The Voice card uses the existing AI Minutes fixture (`487 / 1000`) and does not invent a separate Voice top-up checkout until a real Voice credit purchase flow exists.

## Navigation and data flow

- The SMS Credits balance becomes an accessible link or button with an explicit label, `Open SMS credits management`.
- The destination preserves the SMS Campaigns return URL and does not rely only on browser history.
- The Back button returns to the SMS Campaigns tab and retains the page's existing query-string tab contract.
- SMS balance state should be read from a small shared fixture/store so purchases made from the management screen can update the displayed balance and remain consistent with the SMS Campaigns warning state.
- The existing SMS purchase flow remains available from the management screen. The existing low-credit warning button continues to open the same purchase flow.
- Voice actions route to the existing AI Voice Plans screen rather than creating a duplicate subscription checkout.

## Testing

Add page-level tests that verify:

- SMS Credits is an accessible entry point from the SMS Campaigns panel.
- The new page renders the Back control with the SMS Campaigns return target.
- Both SMS and Voice balance cards, progress indicators, and primary actions exist.
- The Voice action points to the existing AI Voice Plans view.
- The usage/history table has the required columns and fixture rows.
- The new page's inline or external scripts remain syntactically valid.
- Existing SMS Campaigns and SMS credit purchase tests remain green.

## Scope boundaries

- No real billing API, wallet settlement, or server-side credit ledger.
- No new top-level sidebar item.
- No new Voice credit purchase product; Voice management links to existing plan management.
- No unrelated redesign of SMS Campaigns or Package Management.
