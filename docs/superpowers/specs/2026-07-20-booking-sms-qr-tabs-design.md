# Booking Hub SMS Campaigns and QR Codes Design

## Goal

Add `SMS Campaigns` and `QR Codes` as first-class Booking Hub tabs in `html/pages/booking-book-phase-1.html`. Port the complete user-visible content and demo interactions belonging to those two views from `html/pages/nexora-sms-dashboard.html`, while matching the existing Booking Book visual system and navigation behavior.

## Scope

The change will:

- Add both entries to the expanded Booking Hub sidebar submenu.
- Add both entries to the Booking Book page-tab bar.
- Add one native tab panel for SMS Campaigns and one for QR Codes, preserving every section, control, helper message, warning, table field, preview, and action from the corresponding source views.
- Preserve Booking Book as the default tab.
- Support direct tab URLs using `?tab=sms-campaigns` and `?tab=qr-codes`.
- Reuse the complete SMS campaign composer already present in the booking page and connect every source SMS entry point to it.
- Port all QR demo data and interactions used by the source QR view.
- Keep all existing Booking Book, Customers, Call Log, Plans, and Salon Settings behavior unchanged.

"Complete content" is scoped to the source page's `#view-sms` and `#view-qrcodes` views plus the SMS composer opened by the SMS view. The standalone dashboard shell and unrelated Dashboard, Landing Pages, Customers, Call Log, Booking, POS, import, and Settings views are not part of these two tabs. The change will not refactor the standalone SMS dashboard, introduce backend persistence, send real SMS messages, or publish real QR campaigns.

## Navigation and Information Architecture

The Booking Hub submenu and page-tab bar will share these targets in order:

1. Booking Book
2. Customers
3. Call Log
4. SMS Campaigns
5. QR Codes
6. Plans
7. Salon Settings

Both navigation surfaces will use the existing `data-tab-target` mechanism. Each new target maps to a `data-tab-panel` section and participates in the existing active-state and browser-history flow. The SMS target is `sms-campaigns`; the QR target is `qr-codes`.

## SMS Campaigns Panel

The SMS panel will port the complete corresponding dashboard view and contain:

- A heading, short description, SMS credit summary, and `Create New Campaign` action.
- Four KPI cards for total customers, monthly SMS volume, returning customers, and SMS-attributed revenue.
- Six customer-segment cards generated from the same segment data used by the existing composer.
- Segment-card actions that open the existing composer with the selected segment.
- The primary action that opens the composer with the default new-customer segment.

All labels, values, badges, segment descriptions, and helper copy from the source SMS view will remain present. The existing modal remains the single, complete composer implementation. The panel will not duplicate campaign composition state or markup.

## QR Codes Panel

The QR panel will port the complete QR Codes view and contain:

- A collapsible three-phase setup and operations guide.
- Campaign name, promotion selection, form title, and form-description fields.
- The required SMS-consent notice from the source dashboard.
- A shareable link preview and generated QR image.
- Download PNG, print poster, kiosk preview, and publish demo actions.
- Promotion-code verification with valid, used, and invalid result states.
- A table of QR-acquired leads.
- A responsive phone/web preview of the customer scan form.

No guide step, operational warning, consent copy, configuration field, link action, verification state, lead-table column, or preview behavior from the source QR view will be intentionally omitted. The port uses local demo data only. The generated QR points to the demo URL shown by the panel. If the QR generation library is unavailable, the UI shows a readable fallback containing the link and leaves the remaining panel usable.

## Visual Design

The new panels will use the Booking Book design tokens and patterns:

- White cards, light gray rules, restrained shadows, and 12px corner radii.
- Existing blue-to-violet brand accents and cyan/green/orange semantic colors.
- Existing button, field, typography, and page-tab proportions.
- Scoped class names under the new panel roots to prevent collisions with current booking and composer styles.
- Desktop grids that collapse to one column on narrow screens; wide tables remain horizontally scrollable.
- Compact top-tab behavior consistent with the existing mobile layout.

The standalone dashboard's dark theme and standalone sidebar will not be copied. Content parity applies to information and behavior, while visual presentation is deliberately rewritten to match the current Booking Book page.

## Data and Interaction Flow

### SMS

1. The user opens the SMS Campaigns tab from either navigation surface.
2. The existing main-tab controller activates the matching panel and updates the URL.
3. The user selects a customer segment or the primary campaign action.
4. The existing `window.openSmsCampaignComposer` API opens the composer with that segment.
5. The existing composer handles templates, character counting, cost calculation, scheduling, confirmation, and success feedback.

### QR

1. The QR panel initializes its promotion select, lead rows, share URL, QR image, and scan-form preview.
2. Editing campaign fields updates the link or preview without navigation.
3. Promotion changes update the demo offer and regenerate the preview/QR state.
4. Verification looks up the entered code in local lead data and renders its state.
5. Download, print, kiosk, and publish actions use the current in-browser demo behavior; no server request is made.

## Accessibility and Resilience

- Both tab buttons use `role="tab"`, `aria-selected`, and matching `aria-controls` values.
- Panels use `role="tabpanel"` and clear labels.
- Interactive controls remain native buttons, inputs, selects, and textareas.
- QR fallback text exposes the destination URL when the generator cannot load.
- Empty or invalid verification input produces an explicit result rather than silently failing.

## Testing

A focused Node test file will inspect the booking HTML and verify:

- Both new targets appear in the Booking Hub submenu and page-tab bar.
- Each target has a matching panel and accessible tab relationship.
- The approved SMS KPI, segment, composer-entry, and credit content is present.
- The QR guide, configuration, consent, link/QR actions, verification, leads, and preview content is present.
- Every source section and action belonging to `#view-sms` and `#view-qrcodes` has a corresponding element or behavior in the booking page.
- Navigation uses the existing shared tab activation and URL behavior.
- SMS actions call the existing composer API.
- QR initialization and QR-library fallback hooks are present.

The test must be written and observed failing before production HTML changes. After implementation, the focused test and the existing relevant page tests will be run. JavaScript syntax will also be checked independently.

## Acceptance Criteria

- SMS Campaigns and QR Codes appear in both requested navigation locations.
- Clicking either location activates the same corresponding panel and URL state.
- All content and demo interactions from the two source views are present; none are replaced by summaries or placeholders.
- Both panels visually match the current Booking Book page on desktop and mobile.
- SMS segment and create actions open the working existing composer.
- QR configuration, preview, generation fallback, verification, download/print/kiosk, and guide controls work as local demos.
- Existing tabs and unrelated user changes remain intact.
