# Booking Online Link Design

## Goal

Add a compact booking-share control beside the existing **AI Voice setup guide** on `html/pages/booking-book-phase-1.html`. It must show the browser-resolvable URL for `html/customer/booking.html`, let the merchant copy that URL, and present a scannable QR code that opens the same URL.

## Interface

- Wrap the existing guide link and the new control in a responsive row that wraps on narrow screens.
- The new control shows the label **Link booking online**, the full absolute URL, a copy icon button, and a QR-code icon button.
- The URL itself remains a normal link and opens the customer booking page in a new tab.
- Copy provides an accessible, short-lived success message.
- QR opens a modal containing a QR code, the encoded URL, a close button, and a direct-link fallback.

## URL and QR behavior

The runtime resolves `../customer/booking.html` against `window.location.href`. For a deployed page such as `https://example.com/html/pages/booking-book-phase-1.html`, both the visible link and the QR therefore use `https://example.com/html/customer/booking.html`. The QR is generated locally with the QRCode library already loaded by the page; it does not depend on an external QR-image service.

If QRCode fails to load, the modal still exposes the clickable absolute URL. Copy uses the Clipboard API when available and a temporary textarea fallback otherwise.

## Structure

Keep the large booking HTML focused by placing URL, copy, QR rendering, and modal behavior in a small dedicated asset. The page owns only the control markup, modal markup, responsive styles, and asset inclusion.

## Verification

- A focused Node test checks the markup, styles, asset inclusion, and URL destination.
- Runtime tests check absolute URL resolution, copying the exact resolved URL, and passing that URL to QRCode.
- Existing Booking Book tests run to catch layout and behavior regressions.
