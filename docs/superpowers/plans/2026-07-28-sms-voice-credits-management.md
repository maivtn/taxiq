# SMS and Voice Credits Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a dedicated Credits Management page opened from the SMS Campaigns credits balance, with SMS and Voice usage cards, history, purchase/plan actions, and a Back link to SMS Campaigns.

**Architecture:** Create a focused `nexora-credits.html` page using the shared shell, a small page-specific CSS file, and a page-specific runtime for fixture rendering and navigation. Add a reusable localStorage-backed SMS balance contract so the existing SMS Campaigns balance and the management page stay consistent while the prototype remains frontend-only.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, Node `node:test`, shared Nexora shell, existing Lucide icon runtime.

## Global Constraints

- No real billing API, wallet settlement, or server-side credit ledger.
- No new top-level sidebar item.
- No new Voice credit purchase product; Voice management links to existing plan management.
- Preserve the existing SMS Campaigns purchase modal and low-credit warning flow.
- Keep the page responsive: two cards on desktop, stacked cards on smaller screens.

---

### Task 1: Add failing page and navigation contracts

**Files:**
- Create: `html/pages/nexora-credits.test.mjs`
- Modify: `html/pages/booking-book-phase-1.sms-qr.test.mjs`

**Interfaces:**
- The new page test will read `html/pages/nexora-credits.html`, `html/assets/nexora-credits.css`, and `html/assets/nexora-credits.js`.
- The existing SMS Campaigns test will require the SMS credits balance to expose an accessible management link and the runtime to handle `openCredits=1`.

- [ ] **Step 1: Write the failing new-page tests**

Add tests for the shared shell page contract, Back target, SMS and Voice cards, usage/history columns and fixture rows, action destinations, CSS hooks, and valid inline/external scripts. The core assertions should include:

```js
test('creates the Credits Management page with a return path to SMS Campaigns', () => {
  const html = source();
  assert.match(html, /<title>Nexora Touch - Credits Management<\/title>/);
  assert.match(html, /<main class="content" aria-label="Credits management content">/);
  assert.match(html, /href="booking-book-phase-1\.html\?tab=sms-campaigns"[^>]*data-credits-back/);
  assert.match(html, /data-credits-card="sms"/);
  assert.match(html, /data-credits-card="voice"/);
  assert.match(html, /data-credits-history/);
});

test('exposes SMS purchase and AI Voice plan actions', () => {
  const html = source();
  assert.match(html, /href="booking-book-phase-1\.html\?tab=sms-campaigns&openCredits=1"/);
  assert.match(html, /href="nexora-packages\.html\?tab=voice"/);
});
```

Add a test that checks the existing SMS Campaigns page contains an accessible link for the SMS balance and an `openCredits` runtime branch.

- [ ] **Step 2: Run the focused tests and verify the expected RED state**

Run:

```bash
node --test html/pages/nexora-credits.test.mjs html/pages/booking-book-phase-1.sms-qr.test.mjs
```

Expected: the new page test fails because the page and assets do not exist, while unrelated existing tests retain their current baseline status.

### Task 2: Build the Credits Management page and fixture runtime

**Files:**
- Create: `html/pages/nexora-credits.html`
- Create: `html/assets/nexora-credits.css`
- Create: `html/assets/nexora-credits.js`

**Interfaces:**
- `nexora-credits.html` provides `[data-credits-card="sms"]`, `[data-credits-card="voice"]`, `[data-credits-history]`, `[data-credits-sms-balance]`, `[data-credits-sms-progress]`, `[data-credits-voice-balance]`, and `[data-credits-voice-progress]`.
- `nexora-credits.js` exposes `window.NEXORA_CREDITS` with `readSmsCredits()` and `writeSmsCredits(value)` for the page and future shared consumers.
- The page sets `window.NEXORA_SHELL = { activePage: 'booking', activeTab: 'sms-campaigns' }` so the shared sidebar keeps Booking Hub and SMS Campaigns highlighted.

- [ ] **Step 1: Add the shared-shell page markup**

Use the same shell structure as `nexora-packages.html`: shared shell CSS, empty sidebar/header, a labeled main landmark, page heading, Back link, balance cards, and history table. The SMS action links to `booking-book-phase-1.html?tab=sms-campaigns&openCredits=1`; the Voice action links to `nexora-packages.html?tab=voice`.

- [ ] **Step 2: Add the responsive visual system**

Create styles for the page heading, Back control, responsive two-card grid, balance amount, progress tracks, warning state, action buttons, and history table. Keep the desktop cards side by side and switch to one column at `max-width: 760px`; make the history region horizontally scrollable on narrow screens.

- [ ] **Step 3: Add the fixture runtime and localStorage contract**

Use the existing SMS starting balance `847` and AI Voice fixture `487 / 1000`. Render progress widths, remaining values, low-credit state, and history rows. Read/write SMS balance under `taxiq:sms-credits`; when storage is unavailable, fall back to the fixture value without throwing. Keep Voice as a read-only usage card and route its action to Package Management.

- [ ] **Step 4: Run the page tests and verify GREEN**

Run:

```bash
node --test html/pages/nexora-credits.test.mjs
```

Expected: all new page tests pass.

### Task 3: Connect SMS Campaigns to Credits Management without breaking purchase flow

**Files:**
- Modify: `html/pages/booking-book-phase-1.html`
- Modify: `html/pages/booking-book-phase-1.sms-qr.test.mjs`

**Interfaces:**
- The SMS credits balance becomes an accessible link with `data-sms-credits-management` and href `nexora-credits.html?from=sms-campaigns`.
- The existing SMS credit purchase buttons keep `data-sms-credit-buy` and continue to open `openSmsCreditModal()`.
- The existing SMS runtime opens the purchase modal after the page initializes when `openCredits=1` is present.

- [ ] **Step 1: Extend the failing tests for the entry point and query action**

Assert that the balance markup is a link/button with the management URL, that the existing buy flow still has its data attribute, and that the runtime checks `openCredits` before opening the existing modal.

- [ ] **Step 2: Add the management link without changing the existing buy button**

Wrap or replace only the SMS balance presentation so it navigates to `nexora-credits.html?from=sms-campaigns`; leave the nearby `Buy Credits` button wired to the current modal.

- [ ] **Step 3: Add the `openCredits=1` initialization branch**

After the SMS composer and credit modal event wiring is ready, detect the query parameter and call `openSmsCreditModal()` once. Do not change the modal package, payment, validation, or confirmation behavior.

- [ ] **Step 4: Synchronize the SMS balance fixture**

Initialize the existing SMS campaign `state.credits` from `window.NEXORA_CREDITS.readSmsCredits()` when available and write the new value from `updateCredits()`. Preserve `847` when localStorage is empty or unavailable.

- [ ] **Step 5: Run the focused regression tests**

Run:

```bash
node --test --test-name-pattern='(SMS credits|low SMS credits|complete SMS Campaigns view|inline scripts valid)' html/pages/booking-book-phase-1.sms-qr.test.mjs
```

Expected: the selected SMS tests pass, including the existing purchase-flow assertions.

### Task 4: Verify the complete feature and hand off

**Files:**
- Modify: `docs/superpowers/plans/2026-07-28-sms-voice-credits-management.md`

- [ ] **Step 1: Run both focused suites and syntax checks**

Run:

```bash
node --test html/pages/nexora-credits.test.mjs html/pages/booking-book-phase-1.sms-qr.test.mjs
git diff --check
```

Record the new page test count and the existing suite's pass/fail result accurately; do not describe unrelated baseline failures as caused by this feature.

- [ ] **Step 2: Review the final diff**

Confirm that only the new Credits Management page/assets, SMS Campaigns link/runtime changes, tests, and this plan are included, and that the earlier user changes in the worktree remain untouched.

- [ ] **Step 3: Mark the plan complete**

Update this checklist after verification and summarize the final routes:

- `booking-book-phase-1.html?tab=sms-campaigns` → click SMS Credits → `nexora-credits.html?from=sms-campaigns`
- Credits page Back → `booking-book-phase-1.html?tab=sms-campaigns`
- Credits page Buy SMS Credits → existing SMS purchase modal route
- Credits page Manage Voice Plan → `nexora-packages.html?tab=voice`
