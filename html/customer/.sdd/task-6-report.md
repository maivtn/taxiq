# Task 6 Report — Booking Request và Compliant Feedback

## Status

- Result: Completed
- Base: `0367ed41512a7d07dd4b305f2889bda14f97c313`
- Commit: `2f4797a` (`feat: add confirmed bookings and compliant feedback`)
- Commit contains only `html/customer/cutomer-reward.html` and `html/customer/cutomer-reward.test.mjs`; this report is intentionally uncommitted.

## Implemented Domain Flows

- Added and exported `createBookingRequest()`, `confirmBookingRequest()`, and `submitFeedback()`.
- Booking creation persists a normalized `requested` record and pending `bookingId`; it does not open a payment destination, create an appointment, add ledger entries, or change points.
- Each booking snapshots its canonical business's `bookingBonus`. Business confirmation creates one confirmed appointment and, only when the snapshot is positive, one `booking_bonus` ledger entry for that same business.
- Repeat booking confirmation is idempotent only when the booking, appointment, and optional ledger relationship remains exact and one-to-one.
- Private feedback validates the canonical visit/business relationship, awards exactly 15 points at every valid rating from 1 through 5, and blocks another award for the same visit.
- Google sharing is a separate optional action. It neither calls feedback submission nor changes state/ledger, and remains available independently of rating and private-feedback status.

## Validation and Atomicity

- Booking creation validates state shape, canonical business identity, trimmed non-empty service/staff/day/time, finite representable timestamp, non-negative safe-integer bonus snapshot, and RFC 4122 v4 UUID before assigning state.
- Booking confirmation validates the canonical runtime record and precomputes timestamp, appointment UUID/object, optional ledger validation/UUID/object, balances, and replacement arrays before mutation. Appointment or ledger ID failure leaves state byte-for-byte unchanged.
- Confirmed retries verify exact business, selections, status/timestamps, appointment fields/cardinality, bonus delta, ledger type, `refType`, `refId`, and per-business ownership. Tampered relations return `invalid_state` without another award.
- Feedback validates one existing visit, matching canonical business, integer rating 1–5, finite timestamp, and both feedback and ledger UUIDs before assigning feedback, claim, balance, or ledger arrays.
- Feedback UUID/ledger failure is atomic. Runtime duplicates verify the exact feedback-ledger relation; malformed confirmed state returns `invalid_state` rather than silently accepting or awarding again.

## Migration and Replay Integrity

- Migration normalizes booking rule snapshots, required selections, notes, requested/confirmed timestamps, appointment data, feedback data, booking draft, rating, and nullable pending `bookingId`.
- Confirmed bookings survive only with one exact appointment and the exact optional booking ledger relation. Requested bookings survive only when no raw appointment or booking-ledger claim proves an earlier confirmation attempt.
- Raw booking claims are collected before schema filtering and classified independently by canonical `type === 'booking_bonus'` or `refType === 'booking'`; raw appointment `bookingId` claims also quarantine downgraded requested records.
- Feedback survives as a submitted record only with one exact +15 feedback ledger relation. A durable visit claim is reconstructed from raw feedback or raw feedback-ledger evidence, so deleting/tampering the submitted record cannot reopen that visit for another award after save/load.
- Raw feedback ledger claims are classified independently by canonical `type === 'feedback'` or `refType === 'feedback'`. Orphaned/malformed domain ledger entries are removed without disturbing reward, tip, or direct-payment relations.

## UI, Persistence, and Calendar

- Booking chips persist `ui.bookingDraft`; review and book3 render through DOM `textContent`. Pending book3 shows the 10-minute SLA; confirmation reveals the appointment and calendar actions.
- `applyRating()` only updates the DOM. `setRating()` owns persistence, so `renderFeedback()` can restore rating during bootstrap without rewriting localStorage.
- Reload restores a valid persisted `book3`, confirmed/pending UI, home appointment, and rating without generating replacement IDs or writing storage. Missing booking context falls back safely.
- Dynamic booking/feedback copy is routed through `COPY`/`t()`; persisted values are rendered as text, not interpolated HTML.
- Calendar download guards missing, unconfirmed, malformed, or unparseable bookings. Valid fixture data produces escaped CRLF ICS with `UID`, `DTSTAMP`, `DTSTART`, and `DTEND`; the object URL is revoked and cleanup failures remain non-fatal.
- Preserved the exact 31-screen inventory, Tailwind v4, Lucide, delegated action registry, localStorage storage key/schema version, and per-business balances.

## TDD Evidence

### Baseline

```bash
node --test html/customer/cutomer-reward.test.mjs
```

- Before Task 6 changes: `83/83` pass, `0` fail.

### Focused RED

```bash
node --test --test-name-pattern="booking points pending|noncanonical booking|broken confirmed booking|downgraded booking|one-star private feedback|feedback visit ownership|broken runtime feedback|restores book3|Google sharing|calendar bookings" html/customer/cutomer-reward.test.mjs
```

- Exit `1`; `0/10` new tests passed.
- Expected failures showed `api.createBookingRequest is not a function`, `api.submitFeedback is not a function`, and missing `add-calendar`/Google actions. This proved the requested domain and UI behavior was absent before production changes.

### Focused GREEN

```bash
node --test --test-name-pattern="booking points pending|noncanonical booking|broken confirmed booking|downgraded booking|one-star private feedback|feedback visit ownership|broken runtime feedback|restores book3|Google sharing|calendar bookings" html/customer/cutomer-reward.test.mjs
```

- Exit `0`; `10/10` focused tests passed.
- Coverage includes pending-to-confirmed points, zero-point business behavior, UUID atomicity, broken-relation rejection, raw-claim replay quarantine, one-star +15, visit ownership, feedback replay after tampered reload, storage-stable bootstrap, Google zero-points, and guarded/escaped ICS output.

## Final Verification

```bash
node --test html/customer/cutomer-reward.test.mjs
git diff --check
git show --stat --oneline --name-only HEAD
```

- Fresh pre-commit and post-commit full suites: `93/93` pass, `0` failures/skips/cancellations/todos.
- `git diff --check`: clean.
- Commit tree contains exactly the two authorized customer reward files listed above.

## Self-review

- Rechecked booking as a request: no charge, appointment, ledger, or points before explicit business confirmation.
- Rechecked rule snapshot and per-business ledger ownership, including a zero-point business that creates an appointment without a ledger entry.
- Rechecked both canonical `type` and canonical `refType` raw-claim paths, raw appointment claims, downgraded booking quarantine, and feedback replay prevention after feedback/claim deletion.
- Rechecked atomic failures on invalid input, time, UUID generation, second feedback/booking ledger UUID, and tampered idempotent relations.
- Rechecked that all ratings 1–5 share the same +15 rule and that Google sharing remains independent, optional, and unrewarded.
- Rechecked bootstrap byte stability, split rating render/persistence, safe `textContent`, calendar missing-booking guard, ICS escaping/required fields, and URL revocation.
- No `state.booking`, `state.rating`, TODO, TBD, or FIXME remains in the two changed files.

## Concerns

- No blocking Task 6 concern remains.
- The ICS parser intentionally supports the deterministic prototype fixture format such as `Thu 16 Jul` plus `2:00 PM`; other formats fail gracefully without downloading a malformed calendar file.
- Business confirmation, notification delivery, Google, and calendar download remain frontend prototype simulations; no backend/webhook integration was added.
- Pre-existing untracked `docs/superpowers/specs/vi.md` and other `.sdd/` artifacts were preserved and excluded from the commit.

## Migration Gate Follow-up

- Commit: `8eb02e3fc1fe62b0f165073d8309516bc0d35c95` (`fix: harden booking feedback migration`).
- Raw feedback claim authority now comes from the unique canonical visit identified by `visitId`. Missing or tampered raw `businessId` cannot erase a claim; retry still resolves ownership from `appState.visits` and returns `already_submitted` without another +15 award.
- `collectRawFeedbackLedgerClaims()` independently recognizes `type === 'feedback'` or `refType === 'feedback'` and retains canonical `visitId` evidence before schema filtering. Tests cover type-only and refType-only claims with both changed and missing business metadata.
- Migration performs a second reward, transaction, booking, and feedback relation-reconciliation pass after global ledger-ID deduplication. A record cannot survive when a higher-priority cross-domain relation retained the duplicate ledger ID and removed its selected ledger entry.
- Booking-versus-feedback collision keeps the canonical booking relation and quarantines the feedback record while preserving its durable visit claim. Booking-versus-transaction collision keeps the canonical tip relation and removes the booking, appointment, and pending booking context.
- Booking and feedback candidate cardinality now counts every merged ledger entry with the same `refId`, matching runtime retry validation. Any additional unrelated same-ref ledger entry quarantines the domain record/relation; booking retry returns `not_found`, while feedback retry remains blocked by its visit claim.
- Existing reward, tip, and direct-payment reconciliation tests remain GREEN, including default reward-pair preservation and transaction raw-claim protections.

### Follow-up TDD Evidence

```bash
node --test --test-name-pattern="derives feedback claim authority|cross-domain ledger ID collision|transaction wins a duplicate ledger ID|extra unrelated same-ref" html/customer/cutomer-reward.test.mjs
```

- RED: exit `1`, `0/4` pass. Raw type-only evidence with a tampered business allowed a new feedback record; cross-domain duplicate ledger IDs left feedback or booking records alive after their selected ledger was removed; extra unrelated same-ref entries failed to quarantine booking/feedback.
- GREEN: exit `0`, `4/4` pass. The feedback claim test runs four internal variants: type-only/refType-only crossed with changed/missing `businessId`.
- Every replay assertion checks unchanged awarded balance, unchanged ledger, zero UUID generation, and either `already_submitted` for the durable feedback visit or `not_found` for the quarantined booking.

### Follow-up Final Verification

```bash
node --test html/customer/cutomer-reward.test.mjs
git diff --check
git show --stat --oneline --name-only HEAD
```

- Fresh pre-commit and post-commit full suites: `97/97` pass with `0` failures/skips/cancellations/todos.
- `git diff --check`: clean.
- Follow-up commit contains exactly `html/customer/cutomer-reward.html` and `html/customer/cutomer-reward.test.mjs`; this report remains intentionally uncommitted.

### Follow-up Self-review and Concerns

- Rechecked both directions of global collision handling against the retained ledger priority and verified that a record never remains without its exact selected relation after dedupe.
- Rechecked all-ledger same-`refId` cardinality against runtime `confirmBookingRequest()` and `submitFeedback()` behavior.
- Rechecked raw visit authority against canonical visit uniqueness rather than untrusted raw business metadata, including save/load durability before retry.
- No blocking migration-gate concern remains. The existing deterministic ICS-format limitation and frontend-only external confirmation/Google/calendar simulations are unchanged.
