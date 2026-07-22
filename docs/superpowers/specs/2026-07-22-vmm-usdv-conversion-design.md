# VMM USDV Conversion Prototype Design

**Date:** 2026-07-22  
**Status:** Approved for prototype implementation  
**Scope:** `html/vmm3y/vmm-3-year-program-embed-tabs.html`

## Goal

Connect the existing `Get more VMM` CTA to a self-contained prototype flow for converting USDV into VMM. The flow is UI/demo behavior only; it must not be presented as a production financial integration.

## User Flow

1. The member selects `Get more VMM` from the VMM balance card.
2. A conversion modal opens without changing the current tab layout.
3. The modal displays:
   - available USDV balance;
   - dedicated conversion rate: `1 VMM = 0.00229 USDV`;
   - USDV amount input;
   - calculated VMM amount preview;
   - conversion-period reminder: `Aug 07, 2026 – Aug 31, 2026`.
4. The member confirms a valid amount.
5. The prototype decreases USDV, increases VMM, prepends a conversion record to history, and shows a manual-close success alert with a transaction code.

## UI Components

- Reuse the existing `.vmm-modal-backdrop`, `.vmm-modal`, modal header, close button, and modal footer patterns.
- Add a conversion-specific modal body with balance summary, rate summary, number input, result preview, validation message, cancel action, and confirm action.
- Keep the existing SweetAlert2 success behavior: no timer, no outside-click close, and explicit close controls.

## State and Data Flow

- Add prototype-only `usdvBalance` state with a clearly marked mock value.
- Add `conversionRate = 0.00229` as a demo-only constant representing USDV per VMM.
- Recalculate the preview on input using `VMM received = USDV amount / conversionRate`.
- Disable confirmation when the input is empty, non-positive, non-numeric, or greater than available USDV.
- On confirmation, update `usdvBalance` and `walletBalance` together, create a `USDV-VMM-*` demo transaction code, add a history item, close the conversion modal, and show success feedback.
- Do not alter locked VMM or VMM IOU balances during conversion.

## Validation and Error Handling

- Reject amounts greater than available USDV with an inline message.
- Reject zero, negative, blank, and invalid numeric values.
- Keep the confirm action disabled until the amount is valid.
- Use native `alert` only as a fallback if SweetAlert2 is unavailable.
- Avoid auto-closing success feedback so the member can read the transaction code.

## Explicit Prototype Boundaries

- No API calls, authentication, server-side ledger, live exchange rate, fee calculation, date enforcement, or persistence are added.
- The fixed prototype rate and mock USDV balance must be easy to replace when backend requirements are available.
- Production implementation still needs the rate, rounding, timezone, idempotency, atomic ledger, Terms version, and notification decisions documented in the business specification.

## Verification

- Verify the embedded JavaScript with `node --check`.
- Confirm `Get more VMM` has a click handler.
- Confirm valid conversion updates VMM and history.
- Confirm invalid amounts cannot be submitted.
- Confirm success feedback is manual-close only.
