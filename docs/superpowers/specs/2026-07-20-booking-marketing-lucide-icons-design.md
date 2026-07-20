# Booking Marketing Lucide Icon Design

## Goal

Standardize the interface icons in the `SMS Campaigns` and `QR Codes` panels of `html/pages/booking-book-phase-1.html` on the Lucide library already loaded by the Booking Book shell. The result should match the existing navigation icon language without removing expressive emoji from marketing content.

## Scope

The change covers UI iconography in the two marketing tabs only:

- Booking Hub submenu and Booking Book page-tab icons.
- Panel headings and section headings that currently use an emoji as an interface marker.
- Static and dynamically rendered buttons, customer-segment cards, schedule choices, composer actions, QR actions, kiosk controls, verification feedback, fallback feedback, and success feedback.
- Icon sizing, alignment, stroke width, and spacing scoped to the two panels and their dialogs.

Emoji remains valid content in promotion names, SMS template titles and bodies, service names, customer-facing QR form copy, poster copy, and other campaign text. Existing tabs outside SMS Campaigns and QR Codes are not part of this change.

## Icon System

Lucide is the single UI icon source for this scope. The implementation will use `data-lucide` elements with `aria-hidden="true"`; visible text continues to provide each control's accessible name.

The main mappings are:

- SMS navigation and headings: `message-square`.
- QR navigation and headings: `qr-code`.
- Guide and publishing actions: `book-open` and `upload-cloud`.
- QR output actions: `download`, `printer`, and `tablet`.
- Composer actions: `send`, `check-circle`, `calendar`, `clock`, `zap`, and `refresh-cw`.
- SMS segments: stable Lucide names stored with the segment data, such as `user-plus`, `calendar`, `clock`, `refresh-cw`, `star`, and `gift`.
- Verification and feedback: `check-circle`, `alert-triangle`, and `x-circle`.

Icons use a shared inline-flex treatment, an 18px default size, a 2px stroke, and current text color unless a semantic success, warning, or danger color already exists. Smaller card and metadata icons may use 16px while retaining the same stroke and alignment.

## Dynamic Rendering

Static markup can be transformed by the existing page-level `lucide.createIcons()` call. SMS cards, composer button states, and QR verification results are created after that initial call, so the marketing scripts will expose one small refresh helper that safely calls Lucide when available.

Every renderer that inserts new `data-lucide` markup will call this helper after updating the DOM. If the CDN is unavailable, text labels and controls remain fully usable; no action depends on the SVG replacement succeeding.

JavaScript must continue to avoid literal nested `</body>` and `</script>` sequences so the existing Live Server regression remains fixed.

## Accessibility

- Decorative icons use `aria-hidden="true"` and never replace visible action text.
- Icon-only close controls retain their existing `aria-label`.
- Status text remains present in the live regions; Lucide icons only reinforce the result visually.
- Native alert messages use text without emoji because native dialogs cannot render library icons.
- Marketing emoji kept in user content remains part of that content and is not treated as a control label.

## Testing

The focused Booking SMS/QR test will be extended first and observed failing. It will verify:

- Both navigation surfaces and both panel headings use the approved Lucide icons.
- Static QR and SMS controls use `data-lucide` markup rather than UI emoji.
- Segment data stores Lucide icon names and dynamic renderers emit library icon elements.
- Dynamic render paths invoke the Lucide refresh helper.
- Verification and success states keep readable text plus semantic Lucide icons.
- Approved marketing-content emoji remains present.
- The Live Server injection regression and all existing page/shell tests still pass.

Browser verification will load Booking, SMS Campaigns, and QR Codes through Live Server, confirm that Lucide has replaced the scoped placeholders with SVG elements, exercise representative dynamic states, and check for console errors.

## Acceptance Criteria

- UI icons in SMS Campaigns and QR Codes have one consistent Lucide visual language.
- No control in those two panels relies on an emoji for its icon.
- Campaign and promotion content keeps its expressive emoji.
- Dynamic icons appear after renders and state changes.
- Text and interactions remain usable when Lucide fails to load.
- Existing Booking Book behavior, responsive layout, accessibility lifecycle, and Live Server compatibility remain intact.
