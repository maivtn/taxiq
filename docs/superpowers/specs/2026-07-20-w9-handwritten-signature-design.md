# W-9 Handwritten Signature Pad Design

## Goal

Replace the current text-only `Signature of U.S. person` control in
`html/pages/w9-form.html` with a mobile-first handwritten signature pad while
retaining the signer name and date required to identify the signature. The
handwritten mark must remain visible in browser printing and in the page's
downloaded PDF.

This document supersedes only the typed-signature portions of
`2026-07-20-w9-mobile-form-design.md`. The page remains a front-end prototype:
it does not add authentication, a signing PIN, an API, server storage, an audit
log, or IRS submission.

## Approved Interface

Part II keeps the existing certification copy and acknowledgment. Immediately
below them, the signature area contains these controls in order:

1. The required label `Signature of U.S. person`.
2. A responsive white signature pad with a clear dark border and the centered
   placeholder `Ký bằng ngón tay` while empty.
3. A right-aligned `Ký lại` button that clears all signature strokes.
4. A required `Full legal name` text field.
5. A required `Date` field.

The pad is large enough for a natural signature on a phone without creating
horizontal scrolling. It accepts touch, stylus, and mouse input through Pointer
Events. The page prevents scrolling only while a pointer is actively drawing
inside the pad, so normal one-finger scrolling remains available elsewhere.

## Signature Interaction

- Drawing starts on pointer down, continues on pointer move, and ends on pointer
  up, pointer cancel, or loss of pointer capture.
- Strokes use rounded joins and caps and a dark ink color that remains readable
  in grayscale printing.
- The canvas uses device-pixel-ratio scaling so signatures remain sharp on
  high-density phone screens while pointer coordinates stay in CSS pixels.
- Resizing preserves the existing signature by copying it to the newly scaled
  canvas rather than clearing it.
- The Vietnamese placeholder is an HTML overlay, not painted into the signature
  bitmap. It disappears after the first real stroke and returns after `Ký lại`.
- `Ký lại` is disabled while the pad is empty and is a normal button so it never
  submits the form.

The signature pad is the primary pointer-based signing experience. `Full legal
name` is the accessible electronic-signature fallback and remains required, so
a person who cannot draw with a pointer can still complete the form using the
keyboard. It stays editable because an authorized signer for an entity may
differ from the entity name on line 1. The Dev fixture uses `Linh Nguyen`.

## Form State and Validation

The page tracks whether the canvas contains at least one completed stroke so it
can preserve, clear, print, and export the handwritten mark. Canvas ink is not a
separate validation requirement: the required legal-name field is the keyboard
fallback. Missing legal name or date receives its own existing validation error.

The handwritten bitmap, legal name, and date are sensitive completion data and
are excluded from the device-local draft. Restoring a draft always presents an
empty signature pad and requires the user to sign again.

`Reset` clears the canvas, its stroke state, its error, the legal name, and the
date together with the rest of the form. `Dev: Fill test data` draws a clearly
synthetic signature stroke for demonstration only, fills `Linh Nguyen`, and
sets the local current date so the complete demo can still be exercised.

## Date Behavior

The native date control defaults to the current local calendar date when the
page first initializes or when the Dev fixture is applied. The user may edit it.
The screen may use the browser's locale presentation, but printed and downloaded
output must format a valid date as U.S. `MM/DD/YYYY`, matching the example
`07/20/2026`.

## Print and PDF Output

Browser print preserves the signature canvas and removes the on-screen empty
placeholder and `Ký lại` action. The signature pad border becomes a simple black
rule consistent with the W-9 print layout.

The custom Download PDF flow copies the handwritten bitmap into the rendered
PDF page. It also prints the legal signer name and the U.S.-formatted signature
date. The PDF must not substitute the name alone when a handwritten signature
exists; when the pad is empty, it renders `/s/ Full legal name` as the accessible
typed-signature fallback.

## Accessibility

- The signature pad is keyboard-focusable and has the accessible name
  `Signature of U.S. person` plus concise instructions describing touch, stylus,
  or mouse input.
- Visible focus styling surrounds the complete pad.
- Instructions associated with the pad explain pointer signing and identify the
  required legal-name field as the keyboard fallback.
- `Ký lại`, `Full legal name`, and `Date` have explicit programmatic labels.
- The legal-name field remains a text representation of the signer for assistive
  technology and satisfies the signature requirement when pointer drawing is
  unavailable.
- Controls keep at least a 44-pixel touch target and the layout works without
  horizontal scrolling from 320 pixels wide.

## Testing and Acceptance Criteria

The implementation is complete when automated and visual checks confirm:

- The signature canvas, placeholder, `Ký lại`, legal-name field, and date field
  appear in the approved order.
- Touch, stylus, and mouse drawing use Pointer Events and record real strokes.
- Device-pixel-ratio scaling produces sharp ink and resizing does not discard an
  existing signature.
- A legal name and date can complete the signature section without canvas ink.
- Missing legal name is rejected and focuses the legal-name field.
- `Ký lại` and `Reset` return the pad to its empty state.
- Dev Fill produces a complete synthetic demo signature, name, and current date.
- Draft persistence contains no canvas data, legal signer name, or signature date.
- Browser print contains the handwritten mark without screen-only controls.
- Download PDF contains the handwritten mark when present, otherwise `/s/` plus
  the legal name, and a date formatted as `MM/DD/YYYY`.
- The signature area fits and remains usable at 320, 375, and 430 pixel widths.
- Existing W-9 validation, printing, and PDF tests continue to pass.

## Source of Truth

The field label and its placement in Part II follow official IRS Form W-9 (Rev.
March 2024): <https://www.irs.gov/pub/irs-pdf/fw9.pdf>. IRS electronic submission
guidance permits an electronic signature in any form that identifies the signer
and authenticates and verifies the submission; this prototype implements only
the approved front-end signing experience and does not claim to implement the
requester's complete production electronic-submission system.
