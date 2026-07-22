# Customer Booking Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone, mobile-first nail salon booking prototype in `html/customer/booking.html` with returning-customer recognition, multi-service selection, technician/date/time selection, optional SMS consent, review, and localStorage persistence.

**Architecture:** Keep the page self-contained like the existing HTML prototypes: static catalog data, CSS, semantic HTML, and one runtime script in `booking.html`. Put business rules in named pure functions exposed through `window.NEXORA_BOOKING_TEST_API` under a test skip flag so Node tests can verify behavior without a browser. Use one draft object for UI and localStorage, with a submitted booking record rendered on the confirmation step.

**Tech Stack:** Standalone HTML, vanilla JavaScript, CSS, Node built-in `node:test`, `node:assert/strict`, `node:vm`.

## Global Constraints

- Keep the scope limited to `html/customer/booking.html` and its standalone test.
- Use `BOOKING_STORAGE_KEY = 'nexora.customer.booking.page.v1'` for persistence.
- The page must support one or more services and must not use the old “Check me in” CTA.
- “Bất kỳ thợ nào” is a valid technician selection; busy/unavailable technicians remain visibly disabled.
- SMS notification consent is optional and defaults to `false`.
- Do not add backend/API, OTP, payment, realtime availability, or integration with `cutomer-reward.html`.
- Run tests and `git diff --check` before claiming completion.

### Task 1: Add failing booking rule tests

**Files:**
- Create: `html/customer/booking.test.mjs`
- Read: `docs/superpowers/specs/2026-07-22-customer-booking-page-design.md`

**Interfaces:**
- Consumes the inline script selected by `<script id="booking-app-script">` from `booking.html`.
- Expects the script to expose `window.NEXORA_BOOKING_TEST_API` when `window.NEXORA_BOOKING_SKIP_INIT` is true.

- [ ] **Step 1: Write the failing test**

Create a Node test harness that extracts the booking script, runs it in a VM with `NEXORA_BOOKING_SKIP_INIT`, and asserts the public rule behavior:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const SOURCE = readFileSync(new URL('./booking.html', import.meta.url), 'utf8');

function getApi() {
  const script = SOURCE.match(/<script id="booking-app-script">([\\s\\S]*?)<\\/script>/)?.[1];
  assert.ok(script, 'booking runtime script must exist');
  const storage = {
    getItem() { return null; },
    setItem() {},
    removeItem() {}
  };
  const window = { localStorage: storage, NEXORA_BOOKING_SKIP_INIT: true };
  const context = vm.createContext({ window, localStorage: storage, console, Date });
  window.window = window;
  vm.runInContext(script, context);
  assert.ok(window.NEXORA_BOOKING_TEST_API, 'booking test API must exist');
  return window.NEXORA_BOOKING_TEST_API;
}

const services = [
  { id: 'gel', name: 'Gel Manicure', priceCents: 4500, durationMinutes: 45 },
  { id: 'pedi', name: 'Signature Pedicure', priceCents: 5500, durationMinutes: 60 }
];
const catalog = {
  services,
  staff: [{ id: 'any', name: 'Bất kỳ thợ nào', available: true }],
  slots: [{ date: '2026-07-24', time: '14:00' }]
};

test('normalizes phone and recognizes returning customer', () => {
  const api = getApi();
  assert.equal(api.normalizePhone('(832) 555-0198'), '8325550198');
  assert.deepEqual(api.findCustomerByPhone('8325550198', [{ phone: '8325550198', name: 'Mary Smith' }]), {
    phone: '8325550198', name: 'Mary Smith'
  });
});

test('toggles multiple services and calculates combined total', () => {
  const api = getApi();
  let selected = api.toggleSelection([], 'gel');
  selected = api.toggleSelection(selected, 'pedi');
  assert.deepEqual(selected, ['gel', 'pedi']);
  assert.deepEqual(api.calculateBookingTotal(selected, services), { totalCents: 10000, durationMinutes: 105 });
});

test('rejects an incomplete booking draft', () => {
  const api = getApi();
  const result = api.validateBookingDraft({
    customer: { phone: '123', name: '' }, selectedServiceIds: [], selectedStaffId: '', selectedDate: '', selectedTime: ''
  }, catalog);
  assert.equal(result.ok, false);
  assert.deepEqual(result.errors, ['phone', 'name', 'services', 'staff', 'slot']);
});

test('creates a canonical booking request with consent and service summary', () => {
  const api = getApi();
  const result = api.createBookingRequest({
    customer: { phone: '8325550198', name: 'Mary Smith', isReturning: true, smsOptIn: true },
    selectedServiceIds: ['gel', 'pedi'], selectedStaffId: 'any', selectedDate: '2026-07-24', selectedTime: '14:00', note: 'First visit'
  }, catalog, '2026-07-22T04:00:00.000Z', 'book-1');
  assert.equal(result.ok, true);
  assert.deepEqual(result.booking, {
    id: 'book-1', customer: { phone: '8325550198', name: 'Mary Smith', isReturning: true, smsOptIn: true },
    serviceIds: ['gel', 'pedi'], staffId: 'any', date: '2026-07-24', time: '14:00',
    totalCents: 10000, durationMinutes: 105, note: 'First visit', status: 'requested', createdAt: '2026-07-22T04:00:00.000Z'
  });
});

test('page includes booking controls and removes check-in copy', () => {
  assert.match(SOURCE, /id="booking-phone"/);
  assert.match(SOURCE, /data-service-id="gel"/);
  assert.match(SOURCE, /data-staff-id="any"/);
  assert.match(SOURCE, /data-booking-date/);
  assert.match(SOURCE, /data-booking-time/);
  assert.match(SOURCE, /Booking|Đặt lịch/);
  assert.doesNotMatch(SOURCE, /Check me in/i);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test html/customer/booking.test.mjs`

Expected: FAIL because `html/customer/booking.html` is empty and the booking runtime/test API does not exist yet.

### Task 2: Implement the booking page runtime and UI

**Files:**
- Modify: `html/customer/booking.html`

**Interfaces:**
- Consumes the test contract from Task 1.
- Produces `window.NEXORA_BOOKING_TEST_API` in skip-init mode and a working page when opened in a browser.

- [ ] **Step 1: Add page shell and data catalog**

Create semantic HTML with a lavender background, top brand card, four-step progress indicator, `section` containers for the phone, services, date/technician, review, and success states. Include the exact IDs/data attributes used by the test and use catalog data for demo customer `8325550198 → Mary Smith`, services `gel` and `pedi`, “Bất kỳ thợ nào”, Tina, Helen, Andy, Kim, and a seven-day slot list.

- [ ] **Step 2: Add pure state functions before DOM wiring**

Implement `normalizePhone`, `findCustomerByPhone`, `toggleSelection`, `calculateBookingTotal`, `validateBookingDraft`, and `createBookingRequest` with the signatures from the design spec. Validation must return the ordered error list `phone`, `name`, `services`, `staff`, `slot`; booking creation must return `{ ok: false, errors }` or `{ ok: true, booking }` and never mutate its input.

- [ ] **Step 3: Add localStorage-safe draft persistence**

Implement `defaultState()`, `readState()`, `persistState()`, and `clearState()` around `BOOKING_STORAGE_KEY`. Parse failures and storage exceptions must fall back to default state. Generate a booking ID as `book-${Date.now()}` unless the submit handler detects a collision and appends an incrementing suffix.

- [ ] **Step 4: Wire phone/customer behavior**

On `blur`/`input` of `#booking-phone`, normalize the value, look up the demo customer, show “Nice to see you again, Mary!”, fill and lock the name input for returning customers, or show the new-customer name field for unknown numbers. Keep the SMS checkbox unchecked by default and persist it when changed.

- [ ] **Step 5: Wire service, staff, date, and time selection**

Use delegated click handlers for `[data-service-id]`, `[data-staff-id]`, `[data-booking-date]`, and `[data-booking-time]`. Toggle services without clearing other selections, reset a no-longer-valid staff choice when selected services make that staff unavailable, and update selected styling via `aria-pressed` plus a visible selected class.

- [ ] **Step 6: Wire step navigation, review, submit, and reset**

Add button handlers that validate the current step, move between sections, render totals and summaries, submit the booking request to localStorage, and show a success card with the booking code. The success screen must include a “Đặt lịch mới” reset action that clears only this page’s storage key.

- [ ] **Step 7: Add responsive styles and accessibility details**

Add CSS for the referenced visual direction: max-width centered layout, card radius/shadow, selected pink gradient borders, disabled staff state, mobile sticky action bar, desktop two-column service/staff grids, focus-visible outlines, error/helper copy, and visible text alongside status colors. Keep controls keyboard accessible with `button`, `label`, `aria-pressed`, `aria-live`, and `aria-current`.

- [ ] **Step 8: Run the focused test to verify it passes**

Run: `node --test html/customer/booking.test.mjs`

Expected: PASS with 5 tests and 0 failures.

### Task 3: Verify the standalone artifact

**Files:**
- Test: `html/customer/booking.test.mjs`
- Verify: `html/customer/booking.html`

**Interfaces:**
- Consumes the completed standalone page from Task 2.
- Produces fresh evidence that behavior, markup, and diff formatting meet the design.

- [ ] **Step 1: Run all relevant customer tests**

Run: `node --test html/customer/booking.test.mjs html/customer/customer-salon-operations.test.mjs`

Expected: all tests pass with 0 failures; any pre-existing unrelated failure must be reported by file and test name.

- [ ] **Step 2: Check the patch for whitespace errors**

Run: `git diff --check`

Expected: no output and exit code 0.

- [ ] **Step 3: Inspect the final diff and status**

Run: `git status --short && git diff --stat && git diff -- html/customer/booking.html html/customer/booking.test.mjs`

Expected: only the requested booking page/test plus the plan are changed by this task; existing unrelated user changes remain untouched.

- [ ] **Step 4: Commit the implementation**

Run:

```bash
git add html/customer/booking.html html/customer/booking.test.mjs docs/superpowers/plans/2026-07-22-customer-booking-page.md
git commit -m "feat: add standalone customer booking page"
```

Expected: a new commit containing the standalone booking page, its test, and implementation plan.
