# Mobile-First W-9 Form Design

## Goal

Create one standalone HTML screen where a U.S. person or entity can complete the information requested by IRS Form W-9 (Rev. March 2024). The screen must be optimized for phones while retaining the recognizable structure, wording, and visual hierarchy of the official form on larger screens.

The completed form is returned to the requester. The screen must state that it is not submitted directly to the IRS.

## Scope

The feature is a front-end prototype in the existing static TaxIQ application. It does not send, upload, or persist information to a server.

The implementation will add:

- One page at `html/pages/w9-form.html`.
- A self-contained form interface with embedded page-specific CSS and JavaScript.
- Device-local draft storage through `localStorage`, clearly labeled as storage on the current device.
- Browser printing so the user can print or save the completed form as a PDF.

The implementation will not add:

- A backend, API, authentication, e-signature service, TIN verification, or IRS submission.
- Server-side storage of SSNs, EINs, signatures, or other W-9 data.
- The six pages of IRS instructions as editable content. The screen will link to the official IRS PDF for complete instructions.
- Navigation entries in the merchant administration sidebar. This is a worker-facing standalone screen.

## Information Architecture

The page contains five ordered sections:

1. **Taxpayer information**
   - Line 1: name of individual/entity, required.
   - Line 2: business or disregarded entity name, optional.
2. **Federal tax classification and exemptions**
   - Line 3a: exactly one classification selection.
   - LLC classification code appears only when LLC is selected and accepts only C, S, or P.
   - Line 3b appears for partnership, trust/estate, or LLC classified as P.
   - Line 4: exempt payee and FATCA reporting codes, optional.
3. **Address and requester details**
   - Line 5: street address, required.
   - Line 6: city, state, and ZIP code, required.
   - Requester's name and address, optional.
   - Line 7: account number(s), optional.
4. **Taxpayer Identification Number**
   - The user chooses SSN or EIN.
   - Only the selected TIN input is enabled.
   - SSN displays as `###-##-####`; EIN displays as `##-#######`.
5. **Certification**
   - The four certifications from the official form are shown in English.
   - A required acknowledgment confirms the signer has read and accepts the certification.
   - Typed legal signature and date are required.

The primary official labels and certification language remain in English. Short Vietnamese helper text explains the purpose, privacy behavior, and expected action without replacing the official wording.

## Responsive Layout

### Phone layout

The default layout targets widths from 320px upward.

- Sections render as vertically stacked cards with clear numbers and short descriptions.
- A compact progress indicator shows the five sections and updates as required fields become complete.
- Each control uses a single-column layout, a minimum 44px touch target, visible focus styling, and sufficient spacing for thumb interaction.
- Appropriate mobile keyboards are requested with `inputmode`, `autocomplete`, and semantic input types.
- Long certification text remains readable without horizontal scrolling.
- A sticky bottom action bar contains `Save draft` and the context action `Continue` or `Submit W-9`.
- The sticky bar respects safe-area insets on phones with home indicators.
- Inline validation appears immediately below the affected control and is also summarized when submission is blocked.

### Desktop and tablet layout

- The page uses an off-white letter-like form surface with black rules, compact official typography, numbered lines, and Part I/Part II headings inspired by the source PDF.
- Related fields may use two-column layouts where space permits.
- The screen remains a web form rather than a pixel-locked image of the paper document.

### Print layout

- Printing targets US Letter portrait.
- Navigation aids, Vietnamese helper callouts, progress, buttons, and validation summaries are hidden.
- The completed values and official English labels remain visible in a clean black-and-white layout.
- The layout must not clip form values or split compact field groups unnecessarily.

## Interaction and Data Flow

1. On load, the page displays an empty form unless the user explicitly chooses to restore a device-local draft.
2. `Save draft` serializes non-sensitive form state to `localStorage` under a page-specific key.
3. TIN and typed signature are excluded from draft storage.
4. Classification selection controls conditional LLC and line 3b fields.
5. The progress indicator derives from completion of required fields in each section; it is not a separate persisted state.
6. `Continue` scrolls and focuses the first incomplete required field in the next incomplete section.
7. `Submit W-9` runs full client-side validation. In this prototype, success opens a confirmation state and offers `Print / Save PDF`; it does not transmit data.
8. `Clear form` requires confirmation and removes both current field values and the local draft.

## Validation and Privacy Behavior

- Line 1, line 3a, street address, city, state, ZIP, one valid TIN, certification acknowledgment, typed signature, and date are required.
- State accepts a two-letter U.S. state or territory code.
- ZIP accepts five digits or ZIP+4.
- SSN requires nine digits and EIN requires nine digits after formatting characters are removed.
- LLC requires classification C, S, or P.
- Line 3b is disabled and cleared when it does not apply.
- Validation messages identify how to fix the problem and are associated with their controls using accessible attributes.
- TIN is visually masked after the field loses focus and revealed only while the user intentionally edits it.
- The page warns that the prototype stores no TIN or signature in the device-local draft and sends nothing to the IRS.
- No sensitive values are written to URLs, logs, analytics, or browser storage.

## Accessibility

- Use semantic `form`, `fieldset`, `legend`, `label`, and button elements.
- Keyboard order follows the visual order.
- Every interactive control has a programmatic name and visible focus state.
- Error summaries use an announced live region and link back to invalid controls.
- Color is never the only signal for completion or error state.
- Text and controls meet WCAG AA contrast expectations.
- Motion is minimal and respects `prefers-reduced-motion`.

## Visual Direction

The page combines the authority of an official tax form with the usability of a modern mobile form:

- White or warm-white paper surface, black official rules and headings.
- TaxIQ/Nexora indigo is limited to interactive controls, focus, progress, and Vietnamese guidance.
- No decorative imagery or illustrations.
- Desktop retains the W-9 title block and Part I/Part II hierarchy.
- Mobile prioritizes readable cards and touch interaction over literal paper geometry.

## Testing and Acceptance Criteria

The implementation is complete when:

- The page opens directly as one standalone HTML file within the existing static server.
- All fields present on page 1 of Form W-9 (Rev. March 2024) are represented.
- The form is usable without horizontal scrolling at 320px, 375px, and 430px widths.
- Required controls have at least 44px touch targets.
- Conditional LLC and line 3b behavior is correct.
- SSN/EIN formatting, masking, and validation work for valid and invalid input.
- A draft restores non-sensitive values but never restores TIN or signature.
- Invalid submission focuses the first invalid field and shows an accessible summary.
- Successful prototype submission exposes the print/save-PDF action without transmitting data.
- Print preview produces a readable US Letter layout without application controls.
- The page is keyboard-operable and retains visible focus throughout.
- Existing TaxIQ pages continue to load unchanged.

## Source of Truth

Field names, ordering, certifications, and applicability rules are based on the official IRS Form W-9 (Rev. March 2024): <https://www.irs.gov/pub/irs-pdf/fw9.pdf>.

