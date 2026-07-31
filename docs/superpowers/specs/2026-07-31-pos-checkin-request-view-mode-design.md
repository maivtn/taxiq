# POS check-in request data and Card/Table view

## Goal

Make the POS check-in inbox feel populated and usable at the front desk by adding representative Nexora App/QR requests and giving the inbox the same Card/Table view choice already used by other POS queues.

Also remove leading service emojis from service names displayed in `pos-phase-1.html`, while preserving icons used by buttons, status badges, and other non-service UI.

## Scope

- Add three representative records to the existing `CHECKINQ` demo data. The records cover both Nexora App and web QR sources, with a mix of technician requests and promotions.
- Add a Card/Table switch to the “Check-in from the Nexora App / QR — waiting on the front desk” panel.
- Keep accept and decline behavior identical in both views by reusing the existing `data-ciq-ok` and `data-ciq-no` actions.
- Normalize service labels at render time so leading emoji/icon prefixes such as `🦶`, `🤲`, and `✨` do not appear in POS service names.
- Add focused source-level tests to protect the demo data, view switch, renderers, and service-label normalization.

Out of scope: persistence for the demo check-in inbox, filtering/sorting, changes to the backend contract, changes to technician/button icons, or redesigning other POS panels.

## Design

The check-in request panel header will contain a `role="group"` switch with `Card` selected by default and `Table` as the alternate. A `ciqViewMode` variable will hold the current selection. `renderCiq()` will continue to own panel visibility and count, then choose between the two render paths.

The card renderer will keep the existing compact request card: customer/source badge, service and request details, customer profile details, and Accept/Decline actions. The table renderer will show the same request information in focused columns: Guest, Source, Service, Technician request, Promo, and Actions. Both renderers will emit the same request IDs and action attributes, so the existing event delegation remains the single mutation path.

Service display text will pass through a small helper that removes leading emoji/icon characters and surrounding whitespace. Raw service data remains unchanged; this is presentation-only and therefore does not affect booking/catalog data or matching logic.

## Data flow and error handling

1. `CHECKINQ` initializes with four demo requests total.
2. `renderFloor()` calls `renderCiq()` as it does today.
3. `renderCiq()` hides the panel when the request list is empty, updates the count, and renders Card or Table according to `ciqViewMode`.
4. Clicking the view switch updates `ciqViewMode` and rerenders the inbox.
5. Accept/Decline removes the request by ID, applies the existing queue mutation/toast behavior, and rerenders both floor and management views.

If a request ID no longer exists when an action is clicked, the existing no-op behavior remains. Empty request lists continue to hide the panel; the count stays synchronized with the list.

## Testing

Add tests to `html/pages/pos-phase-1.operational-tickets.test.cjs` that assert:

- the check-in inbox contains multiple App/QR sample records;
- the panel exposes Card/Table controls and a `ciqViewMode` state;
- both `renderCiq` card and table paths exist and preserve the existing action attributes;
- service labels are normalized before display.

Run the focused POS test file and the repository’s relevant test command(s) after implementation.

