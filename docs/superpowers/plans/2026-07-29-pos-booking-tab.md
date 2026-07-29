# POS Booking Tab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace POS's legacy `Appointments` workspace with the full Booking Book workspace as a `Booking` tab while preserving the rest of the POS shell and shared appointment data behavior.

**Architecture:** Keep `html/pages/pos-phase-1.html` as the POS shell and tab owner. Port only the Booking Book appointment panel's styles, markup, and runtime into POS, wrapping the runtime in a local initializer so its selectors and functions do not collide with POS Operations/Management code. Both surfaces continue to use `salon-data.js`, `appointment-service-catalog.js`, `appointment-tickets.js`, and `appointments-store.js`; `pos-appointments-data.js` remains available for POS Phase 2 but is removed from Phase 1.

**Tech Stack:** Static HTML/CSS, vanilla JavaScript, Node `node:test` source-contract tests, DayPilot Lite resource calendar, Flatpickr date filters, SweetAlert2/Lucide existing page dependencies.

## Global Constraints

- The POS tab and panel contract is `booking`; the old `appointments` contract must not remain in `pos-phase-1.html`.
- `booking-book-phase-1.html` remains unchanged as the standalone canonical Booking Book page.
- Appointment mutations must use `window.NEXORA_APPOINTMENTS_STORE`; do not create a second appointment data model or direct table-only mutations.
- The approved service catalog URL remains `../assets/booking-service-catalog-draft.json`.
- Operations, Time Clock, Management, POS mode gating, and POS URL tab synchronization must continue to work.
- Keep `pos-appointments-data.js` and its tests because `pos-phase-2.html` still references that fixture module.

---

### Task 1: Define the failing POS Booking source contract

**Files:**
- Modify: `html/pages/pos-phase-1.appointments.test.cjs`
- Reference: `html/pages/booking-book-phase-1.shared-appointments.test.mjs`
- Reference: `html/pages/pos-phase-1.html`

**Interfaces:**
- Consumes: raw POS HTML loaded with `fs.readFileSync`.
- Produces: source-contract tests that define the replacement tab, Booking workspace hooks, shared dependencies, and removal of the old POS appointment runtime.

- [ ] **Step 1: Replace the old DayPilot-specific expectations with Booking expectations.** Keep the existing test file path because the repository and prior plans already use it, but make its tests describe the new POS contract:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, 'pos-phase-1.html'), 'utf8');

test('POS exposes Booking instead of the legacy Appointments tab', () => {
  assert.match(html, /data-pos-tab="booking"/);
  assert.match(html, /data-pos-panel="booking"/);
  assert.doesNotMatch(html, /data-pos-tab="appointments"/);
  assert.doesNotMatch(html, /data-pos-panel="appointments"/);
});

test('POS Booking exposes the full Booking Book workspace contract', () => {
  for (const hook of [
    'data-booking-legacy-appointments',
    'data-booking-table',
    'data-booking-view-target="calendar"',
    'data-booking-filter-toggle="booking"',
    'data-booking-appointment-panel',
    'data-booking-create-modal',
    'data-booking-create-save',
    'data-booking-action="detail"',
    'data-booking-action="send-sms"'
  ]) assert.match(html, new RegExp(hook));
});

test('POS Booking loads the shared catalog, ticket, store, and approved service catalog', () => {
  assert.match(html, /\.\.\/assets\/salon-data\.js/);
  assert.match(html, /\.\.\/assets\/appointment-service-catalog\.js/);
  assert.match(html, /\.\.\/assets\/appointment-tickets\.js/);
  assert.match(html, /\.\.\/assets\/appointments-store\.js/);
  assert.match(html, /booking-service-catalog-draft\.json/);
  assert.match(html, /appointmentServiceCatalogLoader\.load/);
});

test('POS Booking uses the shared appointment store and no longer loads the phase-1 legacy seed runtime', () => {
  assert.match(html, /appointmentStore\.ensureSource\(/);
  assert.match(html, /appointmentStore\.subscribe\(/);
  assert.match(html, /appointmentStore\.(create|update|cancel)/);
  assert.doesNotMatch(html, /pos-appointments-data\.js/);
  assert.doesNotMatch(html, /function renderAppt\(/);
  assert.doesNotMatch(html, /data-ap-calendar/);
});

test('POS keeps the shared mode and tab activation contracts', () => {
  assert.match(html, /var TABS = \['dispatch', 'clock', 'management', 'booking'\]/);
  assert.match(html, /function activateTab\(id\)/);
  assert.match(html, /if \(id === ['"]booking['"]\)/);
  assert.match(html, /data-pos-mode-modal[^>]*role="dialog"/);
});
```

- [ ] **Step 2: Run the focused test to verify it fails for the missing feature.**

Run: `node --test html/pages/pos-phase-1.appointments.test.cjs`

Expected: FAIL because POS still exposes `data-pos-tab="appointments"`, the Booking hooks are absent, and the old Phase 1 runtime is still loaded. Do not change production HTML before observing this failure.

- [ ] **Step 3: Commit the red contract.**

```bash
git add html/pages/pos-phase-1.appointments.test.cjs
git commit -m "test: define POS booking tab contract"
```

### Task 2: Replace the POS tab shell with Booking markup and styles

**Files:**
- Modify: `html/pages/pos-phase-1.html:552-558` for tab markup.
- Modify: `html/pages/pos-phase-1.html:818-858` for the appointment panel.
- Modify: `html/pages/pos-phase-1.html` in the page-specific `<style>` block beside the existing POS appointment styles.
- Reference: `html/pages/booking-book-phase-1.html:3849-6900` for Booking workspace styles.
- Reference: `html/pages/booking-book-phase-1.html:7922-8750` for the Booking panel markup.

**Interfaces:**
- Consumes: the failing hooks from Task 1 and Booking Book's canonical `data-booking-*` markup.
- Produces: a hidden-able POS panel at `data-pos-panel="booking"` containing table/card/calendar views, filters, appointment detail, and create modals.

- [ ] **Step 1: Rename the POS navigation button.** Change only the fourth tab to:

```html
<button class="page-tab" type="button" role="tab" data-pos-tab="booking">
  <i class="bi bi-calendar-check" aria-hidden="true"></i> Booking
</button>
```

- [ ] **Step 2: Replace the old `data-pos-panel="appointments"` section with the Booking Book appointment section.** Port the canonical section beginning at `<section ... data-tab-panel="booking">`, but change the outer wrapper to:

```html
<section class="pos-panel" data-pos-panel="booking" aria-label="Booking">
  <!-- canonical Booking Book appointment workspace, adapted to POS -->
</section>
```

Preserve every `data-booking-*` hook used by the canonical runtime, including the nested `booking-legacy-appointments`, `booking-sub-panel`, `booking-appointment-layout`, table/card/calendar view panels, `booking-appointment-panel`, `booking-detail-modal`, and `booking-create-modal` markup. Do not port unrelated Booking Book tabs such as Plans, Settings, Customers, Call Log, SMS Campaigns, or QR Codes.

- [ ] **Step 3: Port the styles required by the copied workspace.** Copy the canonical rules for the appointment workspace and its responsive states: `booking-legacy-appointments`, `booking-subtab`, `booking-sub-panel`, KPI cards, filters/status chips, table/card/calendar panels, appointment layout/detail panel, detail/create modals, service-ticket pickers, action buttons, source badges, and the mobile media-query overrides. Keep the existing POS variables and avoid changing global `.page-tabs`, `.pos-card`, or POS mode styles unless a copied selector requires a scoped override.

- [ ] **Step 4: Run the source contract after markup/style integration.**

Run: `node --test html/pages/pos-phase-1.appointments.test.cjs`

Expected: the tab/workspace/dependency assertions pass, while the runtime assertions may still fail until Task 3 is complete. If a failure is caused by a missing copied hook, fix the markup before moving on.

- [ ] **Step 5: Commit the POS Booking shell.**

```bash
git add html/pages/pos-phase-1.html
git commit -m "feat: add Booking workspace to POS"
```

### Task 3: Port the Booking runtime onto the shared POS store

**Files:**
- Modify: `html/pages/pos-phase-1.html` after the shared asset scripts and before the POS main runtime.
- Reference: `html/pages/booking-book-phase-1.html:10246-13980` for the canonical Booking runtime.

**Interfaces:**
- Consumes: Booking markup from Task 2 and `window.NEXORA_SALON_DATA`, `window.NEXORA_APPOINTMENT_SERVICE_CATALOG`, `window.NEXORA_APPOINTMENT_TICKETS`, and `window.NEXORA_APPOINTMENTS_STORE`.
- Produces: `window.NEXORA_POS_BOOKING` with `init()` and `render()` methods; Booking initialization that owns only Booking-specific view/filter/calendar interactions.

- [ ] **Step 1: Add the missing Booking runtime dependencies.** Keep the existing shared scripts, remove the Phase 1-only `pos-appointments-data.js` script tag, and add the Booking-required Flatpickr CDN script. Retain DayPilot Lite because the canonical Booking calendar uses `new DayPilot.Calendar`; it is no longer the old POS appointment runtime once the `ap*` code is removed.

- [ ] **Step 2: Port the canonical Booking state and helpers into an isolated initializer.** Wrap the copied code in an IIFE or equivalent local closure. Keep the canonical shared-store state and service catalog URL:

```js
var APPOINTMENT_SERVICE_CATALOG_URL = '../assets/booking-service-catalog-draft.json';
var catalog = salonData.loadCatalog();
var appointmentStore = window.NEXORA_APPOINTMENTS_STORE;
```

Retain the canonical functions for catalog rebuilding, date/filter formatting, service/technician search, panel drafts, table/card rendering, calendar rendering, create/save/update/cancel/SMS actions, source badges, and static-row migration. Do not duplicate or reimplement store mutation logic in POS.

- [ ] **Step 3: Remove the Booking page's outer navigation initialization from the port.** Do not copy `data-tab-target`/`activateMainTab` wiring, Booking Book's unrelated pages, or code that renders Customers/Call Log/Settings. POS `activateTab` remains responsible for the outer tab. Keep Booking's inner `data-booking-subtab-target`, filter, view-mode, modal, delegated action, date-nav, and shared-store listeners.

- [ ] **Step 4: Expose a small POS integration seam and initialize once.** At the end of the isolated runtime, expose:

```js
window.NEXORA_POS_BOOKING = {
  init: initPosBooking,
  render: renderPosBooking
};
```

`initPosBooking()` must attach listeners, register the initial static rows with `appointmentStore.ensureSource('booking-book-static-v1', ...)`, subscribe to `appointmentStore`, load the approved service catalog, and render the Booking table/calendar/cards. `renderPosBooking()` must be safe to call repeatedly when the POS tab is activated.

- [ ] **Step 5: Run the focused test and syntax check.**

Run: `node --test html/pages/pos-phase-1.appointments.test.cjs`

Run: `node --check <temporary-extracted-pos-script.js>` only if an extracted inline script is used for diagnosis; otherwise validate the complete HTML through the test suite and browser/manual load in Task 5.

Expected: the shared-store, catalog, and no-legacy-runtime assertions pass. Any failure must identify a missing canonical hook or a runtime name collision; fix the implementation rather than weakening the contract.

- [ ] **Step 6: Commit the Booking runtime port.**

```bash
git add html/pages/pos-phase-1.html
git commit -m "feat: run POS booking through shared appointment store"
```

### Task 4: Connect POS tab activation and remove the legacy Phase 1 appointment code

**Files:**
- Modify: `html/pages/pos-phase-1.html:2861-3090` to remove the old `ap*` appointment renderer and controls.
- Modify: `html/pages/pos-phase-1.html:3517-3555` to use the `booking` tab and initializer.
- Modify: `html/pages/pos-phase-1.appointments.test.cjs` only if a discovered integration regression needs a precise contract assertion.

**Interfaces:**
- Consumes: `window.NEXORA_POS_BOOKING.init()` and `.render()` from Task 3.
- Produces: POS outer tab activation that routes `?tab=booking` and tab clicks to the Booking workspace without exposing legacy Appointments selectors.

- [ ] **Step 1: Replace the POS tab list and activation branch.** Change the list to:

```js
var TABS = ['dispatch', 'clock', 'management', 'booking'];
```

In `activateTab(id)`, keep the Management front-desk guard and existing URL/shell synchronization, then call:

```js
if (id === 'booking' && window.NEXORA_POS_BOOKING) {
  window.NEXORA_POS_BOOKING.init();
  window.NEXORA_POS_BOOKING.render();
}
```

Call the same initializer during boot so the default POS load has Booking data ready, but do not create a second Booking subscription on repeated tab activation.

- [ ] **Step 2: Remove the old Phase 1 appointment runtime.** Delete the `APPOINTMENT_MENU`/`TECHS`/`ap*` rendering and event-handler code that targets `data-ap-*`, `data-pos-panel="appointments"`, `renderAppt()`, or the legacy POS appointment panel. Remove calls to `renderAppt()` and `loadAppointmentServiceCatalog()` that only serve that runtime. Do not remove the DayPilot CDN if the ported Booking calendar still uses it.

- [ ] **Step 3: Search for stale contracts.**

Run:

```bash
rg -n 'data-pos-(tab|panel)="appointments"|data-ap-|renderAppt|pos-appointments-data\.js|APPOINTMENT_MENU|TECHS' html/pages/pos-phase-1.html
```

Expected: no matches. The `pos-appointments-data.js` asset itself may still match in `pos-phase-2.html` and its test; those references are intentionally out of scope.

- [ ] **Step 4: Run the POS-focused test suite.**

Run: `node --test html/pages/pos-phase-1.mode.test.cjs html/pages/pos-phase-1.appointments.test.cjs`

Expected: all mode and Booking source-contract tests pass.

- [ ] **Step 5: Commit the tab integration and cleanup.**

```bash
git add html/pages/pos-phase-1.html html/pages/pos-phase-1.appointments.test.cjs
git commit -m "refactor: make Booking the POS appointment tab"
```

### Task 5: Verify cross-surface contracts and browser-facing HTML

**Files:**
- Verify: `html/pages/pos-phase-1.html`
- Verify: `html/pages/booking-book-phase-1.html`
- Verify: `html/pages/pos-phase-1.appointments.test.cjs`
- Verify: `html/pages/pos-phase-1.mode.test.cjs`
- Verify: `html/pages/booking-book-phase-1.shared-appointments.test.mjs`

**Interfaces:**
- Consumes: the completed POS Booking tab and unchanged Booking Book source.
- Produces: fresh verification evidence for requirements, regression tests, and a clean diff.

- [ ] **Step 1: Run all appointment and POS contract tests.**

```bash
node --test \
  html/pages/pos-phase-1.mode.test.cjs \
  html/pages/pos-phase-1.appointments.test.cjs \
  html/pages/booking-book-phase-1.shared-appointments.test.mjs \
  html/assets/appointment-tickets.test.cjs \
  html/assets/appointments-store.test.cjs
```

Expected: exit code 0 with zero failing tests.

- [ ] **Step 2: Validate HTML/script structure and whitespace.**

```bash
git diff --check
node --check html/assets/appointments-store.js
git status --short
```

Expected: no whitespace errors, no modified Booking Book page, and only the planned POS/test/docs files changed.

- [ ] **Step 3: Perform a manual browser smoke check.** Open `html/pages/pos-phase-1.html` and verify:

1. POS shows `Booking` rather than `Appointments`.
2. Clicking Booking shows the Booking Book table and appointment detail workspace.
3. Table/Card/Calendar toggles work; date/customer/status filters update visible rows.
4. New appointment opens, service/technician pickers work, and Save creates a row through the shared store.
5. View/SMS/Done/No-show actions update the row without navigating away.
6. Operations, Time Clock, Management, mode switch, and direct `?tab=booking` navigation still work.

- [ ] **Step 4: Review the final diff against the design spec.** Confirm `booking-book-phase-1.html` is unchanged and no unrelated assets were removed.

