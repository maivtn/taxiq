# Task 5 Report — Tip and Direct Payment Pending-to-Confirmed Flows

## Status

- Result: Completed
- Base: `62f7b20a86071ae92b4f5bf45feacdd57256a2ae`
- Commit: `dadbba4e6ee42f98fa393b42092b49d92f2da52a` (`feat: persist pending tip and direct payments`)
- Commit contains only `html/customer/cutomer-reward.html` and `html/customer/cutomer-reward.test.mjs`; this report is intentionally uncommitted.

## Implemented Domain Flows

- Added and exported `createTip()`, `confirmTipRecord()`, `createDirectPayment()`, and `confirmDirectPayment()`.
- Creating a tip or direct payment persists a `pending` record and pending receipt context without changing points.
- Tip confirmation snapshots and awards `$10 × 10 = 100` points through one `tip_bonus` ledger entry.
- Direct-payment confirmation snapshots and awards `$55 = 55` spend points plus `20% = 11` bonus points through separate `visit_spend` and `directpay_bonus` ledger entries.
- Repeat confirmation is idempotent only when the persisted record and all linked ledger metadata remain canonical and one-to-one.
- Tip recipient names are read from the canonical staff profile; caller-supplied names are ignored.

## Validation and Atomicity

- Transaction creation validates canonical business/staff identity, owner-enabled supported method, positive cent-precision amount, finite/representable timestamp, finite non-negative reward rules, and RFC 4122 v4 UUID output before mutation.
- Persisted staff IDs are canonicalized from their map keys during migration, matching the existing business identity strategy.
- Tip confirmation validates and precomputes its timestamp, ledger validation, UUID, record, balance, and ledger arrays before assigning state.
- Direct-payment confirmation validates and precomputes the timestamp and both distinct ledger UUIDs/entries before assigning status, balance, payment collection, or ledger. Failure on the second UUID leaves state byte-for-byte unchanged.
- Confirmed retries verify exact business, type, delta, `refType`, `refId`, and ledger cardinality. Missing, duplicated, or tampered links return `invalid_state` without another award.

## Snapshot and Migration Integrity

- Pending tips persist `tipMultiplier`; pending direct payments persist `directPayBonusPct`. Confirmation and receipt rendering use these snapshots, so later business-rule changes do not alter awards.
- Migration normalizes legacy valid pending records with canonical staff/business/method/rule fields and drops malformed transaction records.
- Confirmed tips survive only with one valid tip ledger relation; confirmed direct payments survive only with one valid spend and one valid bonus relation.
- Pending records survive without awarding points, while orphaned, malformed, and extra transaction ledger relations are removed.
- Duplicate transaction relations are reconciled deterministically. A valid relation wins over a malformed entry with the same ledger ID regardless of input order.
- Reward relations remain protected: reward pairing runs first, transaction pairing classifies only tip/direct types and references, then global ledger-ID dedupe prioritizes selected reward relations followed by selected transaction relations.

## UI and Persistence

- Added stable staff IDs, custom tip amount, owner-enabled method lists, live payment summary, and persisted method selection.
- Changing recipient from Anna to Maria persists the fallback from Venmo to Maria's first enabled method, Zelle.
- Disabled methods show bilingual owner-specific reasons. Dynamic transaction copy is routed through `COPY`/`t()`.
- Tip and payment receipts render state with DOM `textContent`; persisted staff/business/method values are not interpolated into HTML.
- Pending receipts show the 10-minute SLA and explicitly state that NEXORA never holds customer funds.
- An external Venmo/Zelle/Cash App destination opens only from the send user action, after the pending record has been saved.
- Reload restores `tipdone`/`paydone`, pending or confirmed receipt state, amount, method, recipient/points, and the original pending ID without creating a replacement record or rewriting storage during bootstrap.
- Preserved the 31-screen inventory, Tailwind v4, Lucide, delegated interaction model, and localStorage schema version.

## TDD Evidence

### Baseline

```bash
node --test html/customer/cutomer-reward.test.mjs
```

- Before Task 5 changes: `67/67` pass.

### Initial RED

```bash
node --test --test-name-pattern="tip points|direct-pay bonus|noncanonical transaction|confirmation.*atomic|broken confirmed|round-trips rule|restores pending tip|recipient method fallback|opens an external" html/customer/cutomer-reward.test.mjs
```

- Exit `1`; the new transaction tests failed because `createTip()` and `createDirectPayment()` were absent, staff fallback did not persist, reload had no receipt records, and the old send handler had no persisted selected amount.
- Production HTML was unchanged when this RED run was captured.

### Focused GREEN and Review RED/GREEN

```bash
node --test --test-name-pattern="tip points|direct-pay bonus" html/customer/cutomer-reward.test.mjs
node --test --test-name-pattern="prefers a valid transaction|one-to-one persisted redemption|round-trips valid reward|rule snapshots" html/customer/cutomer-reward.test.mjs
```

- Requested transaction focus: `2/2` pass.
- Reward/transaction migration integrity focus: `4/4` pass.
- Self-review RED reproduced order-dependent loss of a valid transaction pair when a malformed ledger reused its ID; the corrected relation-first reconciliation made the regression GREEN.
- A separate RED/GREEN cycle canonicalized persisted staff IDs before tip creation.

## Final Verification

```bash
node --test html/customer/cutomer-reward.test.mjs
git diff --check
git diff-tree --no-commit-id --name-status -r HEAD
```

- Fresh pre-commit and post-commit full suites: `78/78` pass, `0` fail/skipped/cancelled/todo.
- `git diff --check`: clean.
- Commit tree contains exactly the two authorized customer reward code files.

## Concerns

- No blocking Task 5 concern remains.
- External payment destinations and business confirmation are prototype simulations; NEXORA records pending/confirmed state and points but does not custody or settle funds.
- Pre-existing untracked `docs/superpowers/specs/vi.md` and other `.sdd/` artifacts were preserved and excluded from the commit.

## Replay Protection Follow-up

- Commit: `dd76e126c35b91e7acccd075ad7d3c5fd7a51e78` (`fix: block replayed pending transactions`).
- Migration now collects raw ledger claims before schema merge, collection filtering, relation reconciliation, or ledger-ID deduplication.
- A raw claim is transaction-classified by a canonicalized non-empty `refType`/`refId`: `tip` for tip records and `direct_payment` for direct-payment records. The evidence survives missing IDs, invalid timestamps, wrong types/deltas/businesses, duplicates, reordering, and other fields that later sanitizers remove.
- A persisted pending tip or direct payment is retained only when its record ID has no raw transaction ledger claim. Any claimed pending record is quarantined by removal; the existing pending-context reconciliation then clears `tipId` or `paymentId`.
- Migration does not reverse a previously awarded balance. Retrying the quarantined ID returns `not_found`, generates no UUID, appends no ledger entry, and leaves the balance and ledger unchanged.
- Confirmed records still require the same exact canonical one-to-one tip relation or two-entry direct-payment relation. Raw malformed extras do not weaken or replace confirmed-pair validation.
- Raw reward claims and reward-pair reconciliation remain separate and unchanged; replay tests assert that the default redemption and reward ledger pair survive.

### Follow-up TDD Evidence

```bash
node --test --test-name-pattern="quarantines replayed pending" html/customer/cutomer-reward.test.mjs
```

- RED: exit `1`, `0/2` pass. Both pending tip and direct-payment records survived raw valid/malformed ledger evidence.
- GREEN, pre-commit and post-commit: `2/2` pass. Each test covers a downgraded pending record with valid reordered/duplicate ledger relations plus a pending record with malformed raw ledger relations.

### Follow-up Verification

```bash
node --test html/customer/cutomer-reward.test.mjs
git diff --check
git diff-tree --no-commit-id --name-status -r HEAD
```

- Fresh pre-commit and post-commit full suites: `80/80` pass with `0` failures/skips/cancellations/todos.
- `git diff --check`: clean.
- Follow-up commit contains exactly the two authorized customer reward code files; this report remains intentionally uncommitted.
- No blocking replay-protection concern remains.

## Independent Raw-Claim Classification Follow-up

- Commit: `0367ed41512a7d07dd4b305f2889bda14f97c313` (`fix: classify all raw transaction claims`).
- The raw collector still runs before schema merge and collection filtering, but now normalizes `refType`, `type`, and `refId` independently.
- A non-empty normalized `refId` produces a tip-namespace claim when `refType === 'tip'` or `type === 'tip_bonus'`.
- The same `refId` produces a direct-payment-namespace claim when `refType === 'direct_payment'` or `type` is `visit_spend`/`directpay_bonus`.
- These rules are deliberately independent: one cross-classified entry can produce both namespace claims, preventing either a pending tip or pending direct payment sharing that ID from replaying.
- Missing/tampered `refType` cannot hide a canonical transaction type, and a tampered type cannot hide a canonical `refType`. Empty/whitespace-only `refId` values produce no claim.
- Reconciliation logic was not broadened or changed; it consumes the more complete raw-claim sets exactly as before. Reward reconciliation remains separate and unchanged.

### Classification Matrix and Retry Assertions

- Tip tests cover `tip_bonus` with missing and tampered `refType`; the earlier malformed-type tests cover canonical `refType: 'tip'` with a tampered type.
- Direct-payment tests cover both `visit_spend` and `directpay_bonus` with missing and tampered `refType`; the earlier malformed-type tests cover canonical `refType: 'direct_payment'` with a tampered type.
- The cross-classified regression uses one entry with `refType: 'tip'`, `type: 'visit_spend'`, and one shared non-empty `refId`; both pending namespaces are quarantined and both pending-context IDs are cleared.
- Every retry assertion verifies `not_found`, zero UUID generation, unchanged balance, unchanged ledger, and preservation of the default redemption/reward-ledger pair.

### Classification TDD Evidence

```bash
node --test --test-name-pattern="classifies canonical tip types|classifies both canonical direct payment types|claims both transaction namespaces" html/customer/cutomer-reward.test.mjs
```

- RED: exit `1`, `0/3` pass. Type-only pending records survived, and the direct-payment side of the cross-classified entry replayed because the collector trusted only `refType`.
- GREEN was then expanded to include the earlier canonical-`refType` malformed-type cases:

```bash
node --test --test-name-pattern="classifies canonical tip types|classifies both canonical direct payment types|claims both transaction namespaces|quarantines replayed pending" html/customer/cutomer-reward.test.mjs
```

- Fresh post-commit focused result: `5/5` pass, `0` fail/skipped/cancelled/todo.

### Classification Verification

```bash
node --test html/customer/cutomer-reward.test.mjs
git diff --check
git show --stat --oneline --name-only HEAD
```

- Fresh pre-commit and post-commit full suites: `83/83` pass with `0` failures/skips/cancellations/todos.
- `git diff --check`: clean before commit.
- Commit contains exactly `html/customer/cutomer-reward.html` and `html/customer/cutomer-reward.test.mjs`; this appended report remains intentionally uncommitted.
- No blocking independent-classification concern remains.
