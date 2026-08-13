# Billing PDF Surface Polish Design

## Scope

Polish the two highlighted surfaces in the generated Billing Detail PDFs: the payment-status badge in the header and the Amount paid/Amount due summary card. Preserve billing data, A4 geometry, equal page margins, tables, totals, and footer behavior.

## Root cause

The current ReportLab tables use `ROUNDEDCORNERS` with a one-item list such as `[9]`. ReportLab interprets the four values as top-left, top-right, bottom-left, and bottom-right, padding a short list with zeroes. The result therefore rounds only the top-left corner and leaves the other three corners square.

## Approaches considered

1. Use four explicit table corner radii and retain the existing content structure. This is selected because it fixes the rendering defect at the source with the smallest change.
2. Replace the tables with custom ReportLab Flowables that draw their own paths. This offers more control but adds unnecessary layout and page-splitting code.
3. Remove the surfaces and show plain text. This avoids the radius issue but loses the visual hierarchy requested for billing documents.

## Approved visual design

- Status badge: round all four corners at 7pt, use centered text, and size the badge by status so `PAID` is compact while `PAYMENT DUE` remains readable.
- Amount card: round all four corners at 9pt, retain the subtle surface fill and border, and keep its existing content hierarchy and full-width alignment.
- Do not add shadows, gradients, icons, or new colors.
- Keep the page A4 and preserve the equal 47.76pt content guides established by the prior print fix.

## Verification

- Add a regression test against the generated PDF SVG output. Both distinct clipped surfaces must contain curves for all four corners rather than only the top-left corner.
- Run the full Billing Detail test file.
- Render and visually inspect paid, payment-due, overdue, and receipt PDFs for radius visibility, centered badge labels, alignment, clipping, and overlap.
- Confirm every generated document remains A4 and retains valid text content.
