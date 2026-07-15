# Task 8 verification report

## RED → GREEN

- Added cross-screen contracts for action registration, valid targets, persistence/transaction/customer-only scope, obsolete handlers, platform feedback and offline check-in.
- Initial focused run failed on unregistered actions, obsolete declarations and missing check-in API; implementation then moved all action behavior to the registry and added the check-in domain API.
- Final `node --test html/customer/cutomer-reward.test.mjs`: **128 passed, 0 failed** (exit 0).

## Broad hardening follow-up

- Reward receipts now persist a redemption ID, render the actual QR payload/status/accepting business, expose a show-QR action, and restore `redeemdone` only when the receipt validates (otherwise falling back to rewards).
- `commitState` mutates a structured draft and swaps live state only after persistence succeeds; quota/serialization failure tests verify rollback.
- Balance migration and all point-awarding mutators reject negative, malformed or invalid-expiry balances before IDs/ledger writes.
- Follow-tech controls render only for canonical staff with a shared visit; home/wallet activity, expiry copy and greeting are derived from persisted state.
- Directions use a business-specific Google Maps URL with an accessible modal/link fallback; favorite labels and offer labels preserve existing Lucide icons.
- Same-business check-in windows are rejected in either ordering; retry retains the earliest queued candidate and prunes later duplicates.

## Check-in domain evidence

- `parseNexoraQr` accepts only the exact HTTPS `nexoratouch.com/touch/{known-business}/{station}` route, validates optional staff ownership, rejects credentials, foreign hosts, malformed routes, duplicate/unknown query parameters and traversal.
- `submitCheckin`, `completeCheckin` and `retryQueuedCheckins` validate finite timestamps, canonical business/staff identity, UUIDs, duplicate 120-minute windows and ledger relationships before mutation.
- Offline scans append one queued record without points; retry confirms once and writes the ledger at the original `scannedAt` timestamp. Invalid UUIDs, timestamps, balances or tampered/missing/duplicate ledger claims leave the attempted record unchanged.
- Check-in mutation now fails closed when the stored balance is missing or malformed (points/credits/expiring shape), before UUID generation; recoverable balance/rule failures leave valid queued records pending. `completeCheckin` validates all required collections and rejects later same-business window duplicates before UUID/queue mutation, while retry prunes missing/terminal queue IDs, enforces the 120-minute per-business window, drops later queued duplicates without UUID/ledger/points, and removes confirmed IDs from the queue.
- Migration deterministically retains the earliest scan per business window, quarantining later queued/confirmed records and their check-in ledger claims while preserving different businesses and scans at or beyond 120 minutes.
- Migration sanitizes check-ins, queue references and raw check-in ledger claims; only canonical queued/confirmed records survive and replay claims are quarantined.

## Action/UI audit

- Static contract confirms every declared `data-action` is registered and every `data-target`/`data-back-target` resolves to one of the 31 screens.
- Added explicit `enter-code`, nearby/wish simulation, safe Google Reviews feedback and clipboard fallback/catch; generated dynamic controls use registered actions.
- Vietnamese remains default; persisted language and dynamic offer/look/activity labels refresh through the shared dictionary. Referral copy now follows the paid-visit rule.
- Bootstrap restore does not call `saveState`; online retry listener is guarded with optional `window.addEventListener`.

## Responsive/browser smoke

- `git diff --check -- html/customer/cutomer-reward.html html/customer/cutomer-reward.test.mjs`: clean.
- Static-server/browser smoke was not run in this VM (no browser automation available); automated contracts still cover 31-screen inventory, raised mobile Scan/bottom nav and desktop sidebar markup.
