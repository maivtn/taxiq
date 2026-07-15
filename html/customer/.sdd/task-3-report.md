# Task 3 Report — Auth, Onboarding, Profile and Consent Persistence

## Status

- Result: Completed
- Base: `7cd4a4928766346efd9798c8a7aaa7dc6181015d`
- Commit: `e31161e` (`feat: persist customer auth consent and profile`)
- Committed files: `cutomer-reward.html`, `cutomer-reward.test.mjs`
- Report intentionally not committed.

## Implemented

- Added US phone normalization, OTP request cooldown, five-attempt/15-minute lockout, and persisted authentication state.
- Replaced the four onboarding screens with the 25-point welcome flow, optional marketing consent/skip, double opt-in, and notification prompt.
- Made welcome claims idempotent for existing accounts and previously claimed phone numbers; points and ledger are written once.
- Added timestamped grant/revoke consent records and immediate boolean preference persistence.
- Preserved `businessMarketing` as an object and added schema-backed entries for every known business so per-business choices survive reload.
- Added profile renderer hooks, safe DOM assignment of user values, editable profile/payment-method modals, and immediate preferences rendering.
- Kept transactional messages checked and disabled; marketing remains optional and skipping does not change points.
- Changed the modal confirm contract so validation may return `false` without closing or losing the form, while accepted closes clear persisted `ui.overlay` state.
- Routed all new dynamic bilingual messages through `COPY`, `translate`, and `t`; no VI/EN language ternaries were added.
- Preserved the 31-screen inventory, Tailwind v4, Lucide, action registry, focus trap, and focus restore behavior.

## TDD Evidence

### RED — requested focused domain test

Command:

```bash
node --test --test-name-pattern="OTP cooldown|consent decisions" html/customer/cutomer-reward.test.mjs
```

Result: expected failure, 0 passed / 2 failed. Failures were `api.normalizeUsPhone is not a function` and `api.recordConsent is not a function`.

### RED — welcome/persistence/modal validation

Command:

```bash
node --test --test-name-pattern="welcome gift|round-trips valid consent|modal form open" html/customer/cutomer-reward.test.mjs
```

Result: expected failure, 0 passed / 3 failed. Domain APIs were absent and the modal closed even when confirmation returned `false`.

### GREEN — focused implementation

Command:

```bash
node --test --test-name-pattern="OTP cooldown|consent decisions|welcome gift|round-trips valid consent|modal form open" html/customer/cutomer-reward.test.mjs
```

Result: 5 passed / 0 failed.

### RED/GREEN — self-review regressions

- Persisted modal marker: RED observed `{ kind: 'dialog' }` after accepted callback; GREEN after closing through `commitState`.
- Known-business preference: RED observed `golden-glow-spa` dropped by migration; GREEN after adding all known business keys to the default schema.
- AI preference rendering: RED observed no actual `[data-for-you]` DOM hook; GREEN after attaching the hook to the personalized home offer.

## Final Verification

Command:

```bash
node --test html/customer/cutomer-reward.test.mjs
```

Result: 30 passed / 0 failed / 0 skipped.

Additional checks:

- `git diff --check`: passed.
- Exact app-screen inventory: 31.
- Commit contains only the two authorized code/test files.
- Persistence tests prove valid consent, preferences, welcome claims, and ledger entries round-trip while malformed consent records are removed.

## Self-review

- Domain: cooldown, lockout, consent timestamps, point independence, and welcome idempotency are covered by real state mutations.
- Persistence: collection sanitizer accepts complete consent/ledger records, rejects malformed consent, and keeps per-business booleans and string claims.
- UI: registered actions match enabled buttons; profile/preferences call renderers after writes; the transactional toggle cannot emit changes.
- Safety: profile user data is assigned through input/value, textContent, src, and alt properties rather than interpolated into `innerHTML`.
- Modal: invalid profile confirmation retains the open form; accepted callbacks persist a cleared modal marker and restore focus.

## Concerns

- No blocking architecture or scope conflicts found.
- OTP and external messaging remain deterministic prototype simulations (`246810`), as required by the brief.

---

## Gate Follow-up — 2026-07-14

- Result: Completed review fixes
- Commit: `74db8afd9bfc445456624c9881f3a73c362c1f93` (`fix: harden customer onboarding flows`)
- Commit scope: only `cutomer-reward.html` and `cutomer-reward.test.mjs`

### Review fixes

- Consent selection now stages canonical `business:bitcoin-nail-bar` / `networkOffers` scopes in `ui.pendingContext.consentScopes`; it does not grant or create consent records before SMS confirmation.
- SMS confirmation grants and records only the pending scopes with method `sms_y`, updates the matching preference, and clears pending scopes. Network-only confirmation cannot grant business marketing.
- Skip records canonical revoke scopes and clears any pending scopes. Migration preserves only canonical pending scope strings.
- Scan completion routes to `onb1`; Task 3 UI actions reach `onb4` only from skip or successful pending-consent confirmation.
- Existing accounts request a fresh OTP before navigating to `login2`; cooldown and input failures remain on onboarding with inline feedback.
- `otpRequestedAt` is nullable and migration-safe, including a real request at timestamp `0`; expired lockouts reset attempts before the next verification.
- Welcome claim validates finite time, ISO timestamp, UUID, and the complete ledger entry before mutating OTP/claim/points/ledger state. Invalid time and UUID-generation failure leave state unchanged.
- Avatar editing keeps the previous URL when blank and accepts only URLs parsed by `new URL` with the `https:` protocol; invalid URLs return `false`, keep the modal open, show inline copy from `COPY`, and do not persist.
- Persisted balances render through textContent hooks across Home, Wallet, Rewards, Redeem, and the onboarding completion screen. Welcome claims render `2450 → 2475` before navigation; reward preview no longer overwrites the persisted value via removed `pointBalance` state.

### Focused RED → GREEN evidence

1. Consent/routing/existing OTP:
   - Command: `node --test --test-name-pattern="stages canonical|canonical pending|fresh OTP|routes scanning" html/customer/cutomer-reward.test.mjs`
   - RED: 0 passed / 4 failed (missing staging/helper APIs, pending scopes dropped, scan routed to `onb2`).
   - GREEN: 4 passed / 0 failed.
2. OTP edges:
   - Command: `node --test --test-name-pattern="epoch zero|expired OTP lockout" html/customer/cutomer-reward.test.mjs`
   - RED: 0 passed / 2 failed (`otpRequestedAt` defaulted to `0`; expired attempts immediately relocked).
   - GREEN verification including baseline/fresh OTP: 4 passed / 0 failed.
3. Welcome atomicity and avatar URL:
   - Command: `node --test --test-name-pattern="invalid welcome timestamps|UUID generation|HTTPS avatar" html/customer/cutomer-reward.test.mjs`
   - RED: 0 passed / 3 failed (`RangeError`, propagated UUID error, missing avatar validator).
   - GREEN verification including welcome idempotency: 4 passed / 0 failed.
4. Persisted balance rendering:
   - Command: `node --test --test-name-pattern="renders persisted balances" html/customer/cutomer-reward.test.mjs`
   - RED: renderer left `2,450`; later runtime regression exposed `NaN điểm` from legacy `state.pointBalance`.
   - GREEN: 1 passed / 0 failed with `2.475 điểm` and correct reward-after value.

### Final verification after gate fixes

```bash
node --test html/customer/cutomer-reward.test.mjs
```

- Result: 40 passed / 0 failed / 0 skipped.
- `git diff --check`: passed.
- Exact screen inventory: 31.
- Legacy exact scope `network`, `state.pointBalance`, and `state.currentReward` are absent.

### Gate follow-up concern

- No blocking concern. Reachability is enforced across the Task 3 action paths; a global navigation state-machine was intentionally not added because it belongs outside this task's scope.

---

## Atomic Consent Follow-up — 2026-07-14

- Result: Completed remaining review fixes
- Commit: `1705783f4eab5dd1b019db9e053203f0f70738c8` (`fix: make consent persistence atomic`)
- Commit scope: only `cutomer-reward.html` and `cutomer-reward.test.mjs`; this report remains uncommitted.

### Review fixes

- Migration canonicalizes every valid legacy consent record with scope `network` to `networkOffers` in place. IDs, actions, methods, timestamps, nullable confirmation times, and forward-compatible audit fields remain unchanged. The transform is idempotent and never inserts records, so a schema-version bump is unnecessary.
- Consent creation now validates finite time, ISO conversion, and UUID before returning a complete record. Preference, business-marketing, multi-scope confirmation, and onboarding-skip paths build every required record before mutating preferences, consent history, or pending scopes.
- UUID exceptions and invalid timestamps return `{ ok: false, code }`. A failure on the second record of confirm/skip leaves the complete state snapshot unchanged; preference handlers restore the rendered checkbox, show bilingual error copy, and skip/confirm handlers do not navigate on failure.
- Reward gap, progress, wallet copy, and Signature Pedicure CTA now derive from the persisted Bitcoin Nail Bar balance and the 3,000-point threshold. At 2,475 the gap is 525 and progress is 82.5%; at or above 3,000 progress caps at 100% and the enabled CTA has `data-action="navigate"` / `data-target="rewards"`.

### Focused RED → GREEN evidence

1. Legacy consent migration: RED retained `network`; GREEN canonicalized grant and revoke history through load/save/remigrate without duplicates.
2. Atomic consent paths: RED propagated `RangeError`/UUID exceptions and partially mutated state; GREEN returned stable error results with byte-for-byte state snapshots unchanged for single toggle, second-ID confirmation, and second-ID skip.
3. Derived rewards: RED left the gap placeholder unchanged; GREEN rendered balance-driven gap, progress, localized copy, and CTA state.

### Verification

```bash
node --test html/customer/cutomer-reward.test.mjs
```

- Result: 47 passed / 0 failed / 0 skipped.
- `git diff --check`: passed before commit.
- No blocking concern; OTP/messaging remain deterministic prototype simulations.

### Reward boundary correction

- Commit: `e5dc917940d14247b47e368d9612b2e1041ac7e0` (`fix: keep pending reward action honest`)
- Signature Pedicure redemption remains outside Task 3, so its CTA now stays disabled and has no `data-action` / `data-target` at every balance.
- Below 3,000 points the localized gap remains visible. At or above 3,000, progress caps at 100% and dictionary copy reports `Đã đủ điểm — đổi quà ở bước tiếp theo` / `Enough points — redemption coming next` without implying an implemented redemption action.
- Regression test first failed on the stale `Còn 0 điểm` copy and enabled self-navigation, then passed after the renderer correction.
- Full suite before commit: 47 passed / 0 failed / 0 skipped.
