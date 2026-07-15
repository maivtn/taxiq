# Task 4 Report — Per-Business Wallet, Ledger and Idempotent Rewards

## Status

- Result: Completed
- Base: `e5dc917940d14247b47e368d9612b2e1041ac7e0`
- Commit: `771d8d6342e395754e658cc54bf2abfa37e3ccd4` (`feat: add per business rewards ledger`)
- Commit contains only `cutomer-reward.html` and `cutomer-reward.test.mjs`; this report is intentionally uncommitted.

## Implemented

- Replaced the temporary reward milestone with seven business-aware reward fixtures and a real dynamic reward list.
- Added `getBusinessBalance()`, `appendLedger()`, and `redeemReward()` to the test API.
- Redemption always debits the reward's source business balance; balances for Golden Glow Spa and Moon Coffee remain independent.
- Cross-business rewards require both businesses to exist and share a non-empty alliance ID.
- `appendLedger()` validates state, non-empty business/type/reference IDs, finite point deltas, finite/representable timestamps, known businesses, valid balances, and sufficient points before any mutation.
- `redeemReward()` validates state, reward/key/business/alliance/balance/time metadata and precomputes both redemption and ledger IDs plus the timestamp before assigning balances, redemptions, or ledger arrays.
- Blank idempotency keys are rejected. Reusing a key for the same reward returns the original redemption; reusing it for another reward returns `idempotency_conflict` without mutation.
- Protected reward lookup from prototype keys such as `__proto__`; unknown/missing rewards or businesses return Result errors rather than throwing.
- Added serializable `ui.pendingContext.rewardAttempt` with migration validation. Opening a reward persists one UUID-backed key; reload and repeated confirmation reuse that key, while a completed attempt causes the next open to create a new attempt.
- Migration now preserves valid reward/ledger records, including `qrPayload`, and deduplicates ledger IDs plus redemption IDs/idempotency keys.
- Added dynamic wallet, per-business history, ledger, and reward renderers. Persisted business names and ledger values are rendered with DOM nodes and `textContent`, not interpolated HTML.
- Added VI/EN copy through the existing `COPY`/`t()` foundation, the no-cash-out disclaimer, and disabled labels for insufficient balance or alliance mismatch.
- Preserved the exact 31-screen inventory, Tailwind v4, Lucide, delegated action registry, localStorage schema, and existing auth/consent behavior.

## TDD Evidence

### Requested RED

```bash
node --test --test-name-pattern="redeems from|rejects a reward" html/customer/cutomer-reward.test.mjs
```

- Exit `1`, `0/2` pass, `2/2` fail.
- Both failures were `api.redeemReward is not a function`, proving the requested reward domain behavior was absent.

### Robustness RED

```bash
node --test --test-name-pattern="idempotency keys|ledger writes atomic|precomputes reward|missing businesses|round-trips valid reward|reuses one persisted" html/customer/cutomer-reward.test.mjs
```

- Exit `1`, `0/6` pass, `6/6` fail.
- Failures covered absent domain APIs, missing migration dedupe, and missing persisted UI attempt state.
- Additional focused RED cycles caught `now: null` incorrectly reaching UUID generation and `__proto__` incorrectly resolving through the reward object's prototype.

### Focused GREEN

```bash
node --test --test-name-pattern="redeems from|rejects a reward|idempotency keys|ledger writes atomic|precomputes reward|missing businesses|round-trips valid reward|reuses one persisted" html/customer/cutomer-reward.test.mjs
```

- Exit `0`, `8/8` pass.
- Renderer replacement focused verification later passed `2/2`; explicit null-time, reload/retry, and prototype-key regressions also passed.

## Final Verification

```bash
node --test html/customer/cutomer-reward.test.mjs
git diff --check
git diff-tree --no-commit-id --name-status -r HEAD
```

- Fresh pre-commit and post-commit full suites: `55/55` pass, `0` fail/skipped/cancelled/todo.
- `git diff --check`: clean.
- Commit tree contains exactly the two authorized customer reward files.

## Self-review

- UUID failure on the second generated ID leaves balance, redemption list, and ledger byte-for-byte unchanged.
- Invalid/overflow timestamps, non-finite deltas, malformed balances, missing businesses, missing alliance IDs, insufficient points, blank keys, and conflicting keys return stable error codes without partial writes.
- Idempotent retries return the original redemption ID and create exactly one linked ledger record.
- Migration removes malformed and duplicate-sensitive records while valid generated redemptions/ledger entries survive save/load.
- Dynamic reward/wallet/ledger renderers do not use `innerHTML`; an injected business name remains literal text in the runtime test.
- All new customer-facing dynamic copy uses the shared translation dictionary or bilingual reward fixture titles; no scattered VI-language ternary was added.

## Concerns

- No blocking concern found in Task 4 scope.
- Existing prototype-only OTP/external-service simulations remain unchanged.
- Pre-existing untracked `docs/superpowers/specs/vi.md` and `.sdd/` artifacts were preserved and excluded from the commit.

## Gate Follow-up

- Commit: `e9b2bd3` (`fix: preserve reward state integrity`).
- Persisted reward state now enforces a deterministic one-to-one relationship between each redemption and its redeem-ledger entry. Migration removes orphaned, conflicting, duplicate-sensitive, invalid-business, and mismatched pairs while preserving unrelated ledger history; the default fixture ships a valid pair; idempotent retries reject broken linked state without mutation.
- Browser initialization now restores the persisted active screen. A valid incomplete redeem attempt hydrates its preview from the stored key without generating an ID or writing storage; an invalid attempt falls back to Rewards and clears only the in-memory pending context.
- Migration canonicalizes every persisted business `id` from its map key. Wallet balances/history, reward availability, reward opening, and domain redemption validation now use that same canonical identity and alliance validation path.

### Follow-up TDD Evidence

- RED: five focused regressions initially failed for pair reconciliation, broken idempotent state, redeem-screen restoration/fallback, and canonical business identity. A subsequent unknown-business persisted-pair case also failed before migration reused the shared validator.
- GREEN: all focused regressions pass, including reversed duplicate ordering, orphan ledger entries, incorrect deltas/business IDs, unknown businesses, storage byte stability during reload, and wallet rendering from canonical business keys.

### Follow-up Verification

```bash
node --test html/customer/cutomer-reward.test.mjs
git diff --check
git diff-tree --no-commit-id --name-status -r e9b2bd3
```

- Fresh pre-commit and post-commit suites: `60/60` pass with `0` failures.
- The integrity-fix commit contains exactly `cutomer-reward.html` and `cutomer-reward.test.mjs`; this report remains intentionally uncommitted.
- No blocking follow-up concern found.

## Reward Attempt Normalization Follow-up

- Commit: `3023d87` (`fix: normalize persisted reward attempts`).
- Migration trims persisted redemption `idempotencyKey` and `rewardKey` values before sorting, deduplication, or pair reconciliation; blank logical keys are removed and whitespace-equivalent keys compete deterministically as one key.
- Persisted redemptions must match the current reward catalog exactly for reward key, source business, accepting business, and point cost. Valid records receive a canonical `NEXORA:<reward>:<idempotency>` QR payload before reconciliation.
- Pending reward attempts and `ui.currentRewardKey` are normalized during migration. A persisted attempt may continue only as a clean new candidate or when its key binds to one surviving catalog-valid redemption for the same reward; conflicting, dropped, orphaned, or malformed raw claims clear the in-memory attempt and fall back from the redeem preview.
- Runtime idempotent lookup also compares normalized logical keys. Noncanonical key conflicts return `idempotency_conflict`, and same-reward records with catalog-invalid metadata return `invalid_state`, without creating IDs or debiting points.

### Normalization TDD Evidence

- Initial RED: `0/4` focused tests passed. Failures showed untrimmed persisted keys, two whitespace-equivalent redemptions surviving, catalog-mismatched metadata surviving, and a persisted retry being treated as a new debit.
- Runtime RED: a whitespace-equivalent conflicting key created another redemption instead of returning a conflict.
- Raw-claim RED: a malformed redemption was dropped before pending binding and incorrectly allowed a fake candidate preview.
- GREEN: all five focused regression tests pass, covering normalized idempotent retry with unchanged balance, deterministic duplicate selection, catalog/QR validation, valid pending hydration, conflict fallback, malformed-claim fallback, and runtime no-debit guarantees.

### Normalization Verification

```bash
node --test html/customer/cutomer-reward.test.mjs
git diff --check
git diff-tree --no-commit-id --name-status -r 3023d87
```

- Fresh pre-commit and post-commit suites: `65/65` pass with `0` failures.
- Commit `3023d87` contains exactly the two authorized customer reward files; this report remains intentionally uncommitted.
- No blocking normalization concern found.

## Malformed Raw Reward Claim Follow-up

- Commit: `62f7b20` (`fix: retain malformed reward key claims`).
- Migration now collects raw redemption claims before schema merging or redemption normalization, using only a trimmed, non-empty string `idempotencyKey`. A malformed or missing `rewardKey` and any other invalid metadata can no longer erase evidence that the logical key was already claimed.
- Pending binding treats zero raw claims as a clean candidate, exactly one raw claim as eligible for validation, and multiple raw claims as ambiguous. A single claim must normalize, match the pending reward, pass current catalog/business validation, and exactly match the sole redemption that survives pair reconciliation.
- Malformed, blank, non-string, or missing reward keys; missing required fields; wrong catalog metadata; orphaned pairs; and duplicate logical-key claims clear the in-memory pending attempt and fall back to Rewards. Confirmation then returns `no_pending_reward` without creating an ID or changing the balance.

### Raw-claim TDD Evidence

- RED: both focused reviewer regressions failed. A non-string raw `rewardKey` was lost before binding, while two canonical raw claims were deduplicated to one survivor and incorrectly allowed to hydrate.
- GREEN: both focused regressions pass across non-string, blank, and missing reward keys; missing fields; wrong metadata; and duplicate ambiguity. Each browser reload asserts Rewards fallback, cleared pending state, unchanged balance, and zero UUID calls.

### Raw-claim Verification

```bash
node --test html/customer/cutomer-reward.test.mjs
git diff --check
git diff-tree --no-commit-id --name-status -r 62f7b20
```

- Fresh pre-commit and post-commit suites: `67/67` pass with `0` failures.
- Commit `62f7b20` contains exactly the two authorized customer reward files; this report remains intentionally uncommitted.
- No blocking raw-claim concern found.
