# Customer Tip Flow Reference Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `html/customer/cutomer-reward.html` follow all four stages and controls in `html/tip-flow` without the extra amount/method/proof pages or extra proof fields.

**Architecture:** Keep the existing Tip Batch domain and the existing `tip`, `review`, and result screens, but collapse the editable flow into three nested views: `staff`, `details`, and `guide`. Treat the checked-in files under `html/tip-flow` as the approved UI contract; the final guide action implicitly confirms that the customer sent the external transfer, creates/confirms the demo Tip Batch atomically, and opens the existing batch rating view.

**Tech Stack:** Standalone HTML, Tailwind browser runtime, vanilla JavaScript, Node.js `node:test` regression suite.

## Global Constraints

- Work directly on `main`; do not create a branch or ask for branch selection.
- Preserve exactly 31 `.app-screen` elements.
- Staff QR only preselects a staff member and never prevents changing the selection.
- The normal flow is: staff selection → amount/split plus payment method → guide plus optional proof → receipt plus rating.
- Include the reference payment methods: Zelle, Venmo, Cash App, Apple Cash, PayPal, and VLinkPay.
- Proof has two visible controls: camera capture and file upload; maximum 3 images, maximum 5 MB per source image.
- Remove the proof note and standalone transfer-confirmation checkbox.
- Reuse existing Tip Batch allocation, payout, ledger, review, reload, and idempotency rules.
- Do not commit because the shared `main` worktree already contains uncommitted user work.

---

### Task 1: Lock the reference structure with failing tests

**Files:**
- Modify: `html/customer/cutomer-reward.test.mjs`

**Interfaces:**
- Consumes: `html()` source helper and the existing `testApi()` VM harness.
- Produces: regression assertions for the three editable nested views, two proof inputs, six methods, automatic rating route, and removal of extra proof fields.

- [ ] Add a source-contract test that expects exactly `staff`, `details`, and `guide` in `data-tip-view`, expects `tip-proof-camera` with `capture="environment"`, expects `tip-proof-file` with `multiple`, and rejects `tip-proof-note` plus `tip-transfer-asserted`.
- [ ] Add a data test that expects all six reference payment methods and a resolvable staff/business payout account for each method.
- [ ] Add an action test that expects `take-tip-proof` and `upload-tip-proof` to target different inputs.
- [ ] Add a flow test that submits from the guide without note/checkbox, confirms the demo batch atomically, sets `reviewMode` to `tip_batch`, and routes to the batch review with a default 4-star rating.
- [ ] Run `node --test --test-name-pattern="tip-flow reference|reference payment methods|tip proof controls|tip guide submit" html/customer/cutomer-reward.test.mjs` and verify failures identify the current five-view structure and missing controls/methods/rating route.

### Task 2: Port the complete payment method data

**Files:**
- Modify: `html/customer/cutomer-reward.html`
- Test: `html/customer/cutomer-reward.test.mjs`

**Interfaces:**
- Consumes: `PAYMENT_METHODS`, `TIP_PAYOUT_ACCOUNTS`, `resolveTipPayout(appState, input)`.
- Produces: canonical method entries and payout accounts for Apple Cash, PayPal, and VLinkPay in addition to the existing methods.

- [ ] Expand `PAYMENT_METHODS` in reference order and add enabled payout records for the Bitcoin Nail Bar shared account and every selectable Bitcoin Nail Bar staff profile.
- [ ] Update each Bitcoin Nail Bar staff/business `methods` list so UI and domain validation expose all six reference choices.
- [ ] Run the focused payment method test and verify it passes.

### Task 3: Collapse amount/method and guide/proof views

**Files:**
- Modify: `html/customer/cutomer-reward.html`
- Test: `html/customer/cutomer-reward.test.mjs`

**Interfaces:**
- Consumes: `showTipView`, `advanceTipFlow`, `backTipFlow`, `renderTipFlow`, `handleChange`.
- Produces: `staff → details → guide` navigation and the two proof acquisition controls.

- [ ] Replace the separate `allocation` and `method` sections with one `details` section containing split/amount controls, payout-owner copy, and the method grid.
- [ ] Merge proof upload into `guide`, add `tip-proof-camera` (`accept="image/*" capture="environment"`) and `tip-proof-file` (`accept="image/*" multiple`), and retain the shared preview/remove behavior.
- [ ] Delete the note textarea and transfer confirmation checkbox from markup and rendering.
- [ ] Map persisted legacy views `allocation`/`method` to `details` and `guide`/`proof` to `guide`; use `guide` for rejected-proof replacement.
- [ ] Update forward/back validation and titles for the three-view order.
- [ ] Register `take-tip-proof` and keep `upload-tip-proof`; make both inputs use the same validated compression path.
- [ ] Run the focused source/control tests and verify they pass.

### Task 4: Route the reference submit action into rating

**Files:**
- Modify: `html/customer/cutomer-reward.html`
- Test: `html/customer/cutomer-reward.test.mjs`

**Interfaces:**
- Consumes: `submitTipBatch`, `replaceTipBatchProof`, `confirmTipBatch`, `renderTipReview`, and `navigateTo`.
- Produces: an atomic UI happy path ending in the existing batch rating screen.

- [ ] Make the final button copy match the reference intent (`Tôi đã gửi tip` / `I sent the tip`).
- [ ] In `submitCurrentTipBatch`, pass `note: ''` and `transferAsserted: true` implicitly, submit or replace the proof, confirm the demo batch inside the same `commitState`, set `reviewMode: 'tip_batch'`, default `ui.rating` to 4, and select the `review` screen.
- [ ] Render and navigate to the batch review after a successful commit; leave pending/rejected result views available for persisted or externally-created states.
- [ ] Run the focused submit/rating test and all tip-related tests.
- [ ] Run `node --test html/customer/cutomer-reward.test.mjs`, `git diff --check`, verify exactly 31 app screens, and verify the removed proof controls/copy do not occur in production HTML.

