# In-App Add-on Approval & Change-Technician Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the guest approve add-ons and change technician **inside `html/customer/cutomer-reward.html`**, without opening `customer-salon-operations.html`.

**Architecture:** The customer app is already self-sufficient. It carries its own mirrors of the salon catalogs and its own validators for every cross-surface record; it just has no UI and **no write path**. This plan adds the write path plus the UI. Do **not** reach into `customer-salon-operations.html` for tasks 1–4.

**Tech Stack:** Standalone HTML, Tailwind browser runtime, vanilla JavaScript, Node.js `node:test` regression suite.

## Starting State

- Nothing is committed. `git status` shows 4 modified files (~3.9k insertions).
- **Unrelated:** 10 files under `scripts/` show as deleted; they were already deleted before this work started. Verify before committing so they are not swept in.
- Suites green: `cutomer-reward.test.mjs` **362 pass**, `customer-salon-operations.test.mjs` **79 pass**.

## What already exists (do not rebuild it)

All of this is already in `cutomer-reward.html`:

| Piece | Where | What it does |
|---|---|---|
| `IMPORTED_OPS_STAFF` | ~1705 | Customer-side staff mirror, already using this app's service keys |
| `IMPORTED_ADDON_CATALOG` | ~1695 | `gel-polish` / $15 / `maxPerCheckout: 1` |
| `importedOpsStaff` | ~1766 | Staff lookup |
| `importedRecommendedStaffIds` | ~1772 | **Recommendation logic already written** |
| `importedEligibilityId` | ~1779 | Deterministic eligibility id |
| `normalizeImportTicket` | ~2029 | Validates a ticket against **this app's** `getGuestServiceDefinition` + `IMPORTED_OPS_STAFF` |
| `normalizeImportAddOn` | ~2105 | Validates an add-on record |
| `normalizeImportEligibility` | ~2140 | **Re-derives `eligible` and the recommendation list itself** |
| `readOperationsSnapshot` | ~1732 | Reads the shared snapshot |
| `resolveCheckoutOperationsAuthority` / `importAcceptedAddOnsFromAuthority` | ~2319 / ~2325 | Flows `status: 'accepted'` add-ons into the checkout as `addon` line items |

**Catalogs are already reconciled.** `IMPORTED_OPS_STAFF` and `OPS_STAFF` agree byte-for-byte on `id`, `businessId`, `serviceSkills`, `available` **and declaration order** (7 staff: jenny-t, kevin-v, lisa-n, anna, maria, sunny-k, spa-linh), and the ops service catalog now carries all six `bitcoin-nail-bar` services. Verified by script. There is **no catalog merge task left**.

## Global Constraints

- One file per surface. The test harness regex-extracts the inline `<script>` from the HTML, so data must not move to a separate `.js`.
- Preserve 33 `.app-screen` elements unless a task adds one (then update `requiredScreens`, the screen-count assertions, and the `data-ready="true"` count).
- Respect the contract comment above `IMPORTED_OPS_STAFF` (~1700): it must stay byte-for-byte in agreement with `OPS_STAFF` on `id`/`businessId`/`serviceSkills`/`available` **including order**, because recommendation order depends on it and drift **silently rejects the salon's snapshot**. Display-only fields (`name`, `skillLevels`, `availability`) deliberately live elsewhere — do not duplicate them into `IMPORTED_OPS_STAFF`.
- Do not weaken the `file://` guard on cross-surface routing — deliberate and tested.

## Task 1 — Add a snapshot write path (this is the actual missing link)

`readOperationsSnapshot` only ever calls `getItem`. Nothing in the customer app writes the snapshot.

- [ ] Add `writeOperationsSnapshot(next, storage)` that preserves `schemaVersion: 1` and the `updatedAt` / `ui` keys, and writes only `serviceTickets`, `addOnRequests`, `staffEligibility`. The reader rejects the whole snapshot if `schemaVersion !== 1` or any key falls outside its allow-list.
- [ ] Round-trip guard: everything written must survive `normalizeOperationsSnapshotForImport`, which requires **exact own keys** `['serviceTickets','addOnRequests','staffEligibility']` and unique ticket ids / guest ids / numbers.
- [ ] Exact key lists to honour (all enforced by `hasExactOwnKeys`):
  - ticket: `id, number, guestCheckinId, businessId, serviceKey, status, staffProfileId, lineItems, currentTotalCents, frontDeskRequestedAt, createdAt, completedAt` (`number >= 104`; status `waiting|in_service|completed`)
  - add-on: `id, ticketId, guestCheckinId, businessId, staffProfileId, label, amountCents, status, createdAt, resolvedAt`
  - eligibility: `id, ticketId, serviceKey, requestedStaffId, eligible, recommendedStaffIds, selectedStaffId, selectedAt`
- [ ] Replace the `startGuestService` demo (which stamps `serviceStartedAt` on the check-in as a stand-in) with writing a real `in_service` ticket. Keep `serviceStartedAt` working for already-saved check-ins, or migrate it.

## Task 2 — Add-on approval UI on the `liveticket` screen

- [ ] Render a proposed add-on from `IMPORTED_ADDON_CATALOG`: suggested-by-staff line, label + amount, Current Total / Add-on / New Total, Accept + Decline, last-4-phone input + Confirm.
- [ ] Write the decision as an `addOnRequests` record (`status: 'accepted' | 'declined'`). Accepted add-ons reach the bill through the existing `importAcceptedAddOnsFromAuthority` — do not add a second path.
- [ ] Keep the rule that a pending add-on blocks completion and payment.
- [ ] Add a demo control standing in for the technician suggesting an add-on, matching the existing "salon starts the service" pattern.

## Task 3 — Change technician in the customer app

- [ ] Use `importedRecommendedStaffIds` — do not write new recommendation logic.
- [ ] Render candidates with the skill/availability labels (`Tina · Chuyên sâu · Sắp trống` style; `availability: 'soon'` still counts as unavailable, it only tells the guest it is worth waiting).
- [ ] Write the choice into `staffEligibility` (`selectedStaffId`, `selectedAt`). Remember `normalizeImportEligibility` **re-derives** `eligible` and `recommendedStaffIds` — a mismatch rejects the record.
- [ ] Port the "Ask Front Desk" escape hatch (`frontDeskRequestedAt` on the ticket).

## Task 4 — Staff-busy notification

- [ ] Evaluate eligibility automatically at check-in (today it only runs from the ops button `review-staff-eligibility`).
- [ ] Turn `eligible: false` into a customer notification (`{id, type, title:{vi,en}, target, read, createdAt}`) whose target opens the Task 3 UI.

## Task 5 — Real Review / Reward destinations (only task that may touch the ops file)

- [ ] In `customer-salon-operations.html`, `open-ticket-tab` toasts `reviewContinue` / `rewardContinue` for `review` and `reward` with no screen behind them; only `pay` does real work. Point them at the customer app's existing `review` / `rewards` screens, or drop the buttons if the customer app now covers the journey.

## Traps that already cost time — do not repeat

1. **`recordMatchesCanonicalFields(raw, normalized)` compares every key of the normalized record against the raw stored record.** Emitting a new field as `null` makes records saved before the field existed fail the preflight — this silently dropped every `guestRewardClaims` entry and turned 3 tests red. Rule: attach new fields only when set — `...(x ? { x } : {})`. Both `rewardRedemptionId` and `serviceStartedAt` follow this.
2. **Exact-key validators everywhere** (`hasExactOwnKeys`, `opsHasExactKeys`). Adding a field to a ticket/add-on/eligibility record means updating the key list on **both** sides.
3. **`normalizeImportEligibility` re-derives its own truth.** Do not write `eligible` or `recommendedStaffIds` from a different calculation — it will reject silently.
4. **Reward ordering matters:** `gel` (2500 pts) must stay last in `REWARDS` — a test asserts the priciest reward reads as unaffordable at 2,450 pts ("Cần thêm 50").
5. **Screen-count tests** pin three things at once: the `requiredScreens` list, `screenIds(source).length`, and the `data-ready="true"` count.

## Verification

```
node --test html/customer/cutomer-reward.test.mjs             # expect 362 pass
node --test html/customer/customer-salon-operations.test.mjs  # expect 79 pass
python3 -m http.server 8000   # only needed for the ops→customer payment handoff; the customer app runs from file://
```

Drive the real flow in a browser rather than trusting unit stubs. The previous session shipped a blank print stylesheet because `getComputedStyle(el).display` reports the element's own value and says nothing about a hidden ancestor — render the actual output (PDF/screenshot) whenever a change has a visual result.
