# Customer Multi-Tip Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate the complete multi-staff tip journey from `html/tip-flow` into `html/customer/cutomer-reward.html` while preserving canonical salon/staff authority, pending confirmation, and reward idempotency.

**Architecture:** Keep the app's exact 31-screen inventory and render the journey as nested views inside `tip`, `tipdone`, and `review`. Store a canonical Tip Batch parent with Staff Tip allocations and Proof attempts; the standalone reference pages supply UX only, while the existing Customer state, QR parser, payout registry, localStorage transaction wrapper, and ledger remain authoritative.

**Tech Stack:** Single-file HTML, Tailwind Browser v4, Lucide, vanilla JavaScript, localStorage, Node.js `node:test` and `vm` test harness.

## Global Constraints

- Work directly on `main`; do not create a worktree or feature branch.
- Preserve all existing unrelated dirty changes in `html/customer/cutomer-reward.html` and `html/customer/cutomer-reward.test.mjs`.
- Keep exactly 31 `.app-screen` sections; new steps use `data-tip-view`, `data-tipdone-view`, and `data-review-view` nested views.
- Never use query-string staff, allocation, payment, payout, batch, or proof values as transaction authority.
- A single recipient uses a canonical staff payout; multiple recipients use a canonical salon payout.
- Pending and rejected batches earn no points; confirming a valid batch creates exactly one tip ledger from `totalCents`.
- Payment proof is optional and supports at most three normalized images.
- Staff QR locks its canonical staff throughout the draft and submit path.
- Keep VI/EN copy, keyboard focus, disabled semantics, ARIA states, and delegated `data-action` handlers.
- Use a RED → GREEN → REFACTOR cycle for every task and run the full suite before completion.

---

### Task 1: Canonical tip batch and allocation domain

**Files:**
- Modify: `html/customer/cutomer-reward.test.mjs`
- Modify: `html/customer/cutomer-reward.html`

**Interfaces:**
- Consumes: `createDefaultState()`, `canonicalMoneyAmount()`, `enabledOwnerMethod()`, `createDomainId()`, `domainTimestamp()`.
- Produces: `createTipDraft(appState, input)`, `calculateTipAllocations(appState, input)`, `resolveTipPayout(appState, input)`, `submitTipBatch(appState, input, now)`.

- [ ] **Step 1: Write failing domain tests**

  Add focused tests that assert deterministic equal-cent allocation, individual totals, same-business unique recipients, QR-locked staff, staff-versus-salon payout routing, disabled multi-tip without salon payout, and exact retry by `clientRequestId` plus fingerprint.

- [ ] **Step 2: Verify RED**

  Run: `node --test --test-name-pattern="tip batch allocation|tip batch payout|tip batch submit" html/customer/cutomer-reward.test.mjs`

  Expected: FAIL because the batch APIs are not exported.

- [ ] **Step 3: Add canonical state and domain APIs**

  Add immutable payout records whose shape is:

  ```js
  { id, ownerType: 'staff' | 'business', ownerId, businessId, method,
    value, maskedValue, version: 1, enabled: true }
  ```

  Add `tipBatches`, `tipProofs`, and `tipReviews` collections and a `ui.tipDraft` containing `clientRequestId`, entry kind, locked staff, recipients, split mode, equal total, individual cents, method, nested view, note, and proof images. Allocation values are integer cents. Equal-split remainder is assigned in sorted `staffProfileId` order.

  `submitTipBatch` re-resolves staff, payout, method, totals, and fingerprint; it creates one parent batch, one child record per recipient in `tips`, and one proof attempt atomically. Exact retry returns the existing bundle with `idempotent: true`; mismatched retry fails closed.

- [ ] **Step 4: Verify GREEN**

  Run the focused command from Step 2 and expect all matching tests to pass.

---

### Task 2: Batch lifecycle, proof replacement, and reward ledger

**Files:**
- Modify: `html/customer/cutomer-reward.test.mjs`
- Modify: `html/customer/cutomer-reward.html`

**Interfaces:**
- Consumes: `submitTipBatch()` and existing ledger/balance helpers.
- Produces: `validateTipBatchAggregate(appState, batchId)`, `confirmTipBatch(appState, batchId, now)`, `rejectTipBatch(appState, batchId, reason, now)`, `replaceTipBatchProof(appState, input, now)`.

- [ ] **Step 1: Write failing lifecycle tests**

  Cover pending with no ledger, atomic confirmation of parent/children/proof, one batch-level reward, idempotent re-confirm, reject without reward, replacement proof on the same batch, stale payout/version rejection, corrupt aggregate rejection, and duplicate IDs.

- [ ] **Step 2: Verify RED**

  Run: `node --test --test-name-pattern="tip batch lifecycle|tip batch proof replacement|tip batch aggregate" html/customer/cutomer-reward.test.mjs`

  Expected: FAIL because lifecycle APIs are absent.

- [ ] **Step 3: Implement aggregate lifecycle**

  Validate exactly one parent, the exact sorted child set, one current proof, matching business/status/amounts, a canonical payout snapshot, and zero-or-one batch ledger according to lifecycle. Confirmation clones and commits all records, balance, and a `tip_bonus` ledger with `refType: 'tip_batch'`; rejection stores a trimmed reason; replacement appends the next attempt and reuses the same parent and children.

- [ ] **Step 4: Verify GREEN**

  Run the focused command from Step 2 and expect all matching tests to pass.

---

### Task 3: Persisted-state migration and single-tip compatibility

**Files:**
- Modify: `html/customer/cutomer-reward.test.mjs`
- Modify: `html/customer/cutomer-reward.html`

**Interfaces:**
- Consumes: batch validators and legacy `tips` records.
- Produces: normalized batch/proof/review collections, deterministic legacy parents, compatibility `createTip()` and `confirmTipRecord()` behavior.

- [ ] **Step 1: Write failing migration tests**

  Assert that valid legacy single tips are wrapped deterministically without balance or ledger changes, current batch drafts resume, malformed parent/child/proof bundles are quarantined, and existing scan replay contracts still pass.

- [ ] **Step 2: Verify RED**

  Run: `node --test --test-name-pattern="legacy tip batch migration|tip batch reload|tip scan" html/customer/cutomer-reward.test.mjs`

  Expected: new migration tests fail while existing scan tests remain green.

- [ ] **Step 3: Add schema migration and compatibility wrappers**

  Extend collection field validation, normalize the new aggregates after staff/business canonicalization, derive legacy batch IDs from legacy tip IDs, preserve old child IDs and ledger pairs, reconcile pending UI pointers, and retain the existing public API semantics for old tests and call sites.

- [ ] **Step 4: Verify GREEN and regression**

  Run: `node --test --test-name-pattern="tip|transaction" html/customer/cutomer-reward.test.mjs`

  Expected: all matching legacy and V2 tests pass.

---

### Task 4: Nested staff, allocation, method, guide, and proof UI

**Files:**
- Modify: `html/customer/cutomer-reward.test.mjs`
- Modify: `html/customer/cutomer-reward.html`

**Interfaces:**
- Consumes: `ui.tipDraft`, payout/allocation APIs, shared image compression, Clipboard API, delegated actions.
- Produces: `renderTipFlow()`, `showTipView(name)`, proof preview runtime, and actions for staff selection, split, amount, method, guide, copy, upload/remove, and submit.

- [ ] **Step 1: Write failing source and interaction tests**

  Assert nested view IDs, exact 31 screens, staff search and `aria-pressed`, locked QR staff, equal/individual controls, disabled multi reason, canonical method buttons, payout guide, copy feedback, three-image upload labels/previews/removal, registered actions, and no inline handlers.

- [ ] **Step 2: Verify RED**

  Run: `node --test --test-name-pattern="multi-tip nested UI|multi-tip delegated actions|31-screen" html/customer/cutomer-reward.test.mjs`

  Expected: FAIL because the nested markup/actions are absent.

- [ ] **Step 3: Replace the existing one-step tip card**

  Render five `data-tip-view` sections (`staff`, `allocation`, `method`, `guide`, `proof`) and keep the existing screen ID. Build dynamic staff/payment/proof nodes with `textContent`/DOM APIs, never untrusted `innerHTML`. Store draft changes through `commitState`; focus the active nested heading; preserve locked staff and clear stale methods when payout owner changes.

- [ ] **Step 4: Implement proof persistence rollback**

  Normalize images through the shared canvas pipeline with a 1,440 px edge, enforce source and aggregate limits, and submit through a clone so `saveState` failure restores the prior in-memory draft and keeps the form visible.

- [ ] **Step 5: Verify GREEN**

  Run the focused command from Step 2 and expect all matching tests to pass.

---

### Task 5: Pending/rejected/confirmed receipt, private review, and Tip & Earn

**Files:**
- Modify: `html/customer/cutomer-reward.test.mjs`
- Modify: `html/customer/cutomer-reward.html`

**Interfaces:**
- Consumes: batch lifecycle APIs, existing `feedback` ledger contract, `savedOfferIds`, and Google Review action.
- Produces: `renderTipBatchResult()`, `submitTipReview()`, `renderTipReview()`, and nested tip lifecycle/review views.

- [ ] **Step 1: Write failing result/review tests**

  Cover receipt allocation display, pending/rejected/confirmed visibility, same-batch proof replacement, review rating 1–5, normalized tags/note, skip, duplicate submit, Google no-points behavior, and Tip & Earn render without ledger mutation.

- [ ] **Step 2: Verify RED**

  Run: `node --test --test-name-pattern="tip batch receipt|tip batch review|Tip & Earn" html/customer/cutomer-reward.test.mjs`

  Expected: FAIL because batch result/review UI and APIs are absent.

- [ ] **Step 3: Implement nested lifecycle and review views**

  Replace the legacy single-tip result renderer with batch receipt rendering. Pending exposes demo confirm/reject; rejected shows reason and proof replacement; confirmed opens the batch review; review stores one immutable `tipReviews` record and one shared feedback ledger; skip creates no reward. Tip & Earn reads existing ledgers and may save only an existing canonical offer.

- [ ] **Step 4: Verify GREEN**

  Run the focused command from Step 2 and expect all matching tests to pass.

---

### Task 6: Full verification and handoff

**Files:**
- Verify: `html/customer/cutomer-reward.html`
- Verify: `html/customer/cutomer-reward.test.mjs`

- [ ] **Step 1: Run the complete suite**

  Run: `node --test html/customer/cutomer-reward.test.mjs`

  Expected: exit 0, zero failed tests.

- [ ] **Step 2: Run static safety checks**

  Run: `rg -n "onclick=|onchange=|staffList=|splitMode=" html/customer/cutomer-reward.html`

  Expected: no inline tip-flow handlers and no query-string authority added.

- [ ] **Step 3: Inspect the final diff**

  Run: `git diff --check && git diff --stat && git status --short --branch`

  Expected: no whitespace errors; only intended workspace files plus the already-present user changes are modified.

