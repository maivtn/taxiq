# Booking Customer Create Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a `Create customer` action to the Booking Book Customers tab that reuses the existing customer modal, validates Name and Phone, and adds the new customer to the in-memory customer list.

**Architecture:** Extend the existing `cust-modal` with a create mode selected by `custEditIndex === -1`. Keep rendering and event delegation in `booking-book-phase-1.html`; do not introduce a second modal, data store, or page. Add source-contract tests beside the existing Booking Book tests to protect the markup and runtime seams.

**Tech Stack:** Static HTML, inline JavaScript, CSS in `html/pages/booking-book-phase-1.html`, Node.js built-in `node:test` and `node:assert/strict`.

## Global Constraints

- Reuse `cust-modal`; do not create a second customer modal.
- Name and Phone are required only when creating a customer; existing edit records remain editable without retroactive phone validation.
- New records use `visits: 0`, `last: '—'`, `seg: 'new'`, and `src: 'manual'`.
- Do not add backend/API or persistence changes.
- Do not change the Booking, Call Log, SMS Campaigns, or QR Codes tabs.
- Verify with the focused test, the existing Booking Book shared-appointments test, inline-script parsing, and `git diff --check`.

---

### Task 1: Add the failing customer-create contract tests

**Files:**
- Create: `html/pages/booking-book-phase-1.customer-create.test.mjs`
- Read for conventions: `html/pages/booking-book-phase-1.shared-appointments.test.mjs`

**Interfaces:**
- Consumes: the source text loaded from `booking-book-phase-1.html`.
- Produces: failing source-contract tests for the create button, create fields, validation hook, and new-customer data path.

- [ ] **Step 1: Write the failing test**

Create the test file with these assertions:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const SOURCE = readFileSync(new URL('./booking-book-phase-1.html', import.meta.url), 'utf8');

test('Customers panel exposes a create customer action', () => {
  assert.match(SOURCE, /data-cust-create/);
  assert.match(SOURCE, /Create customer/);
});

test('Customer modal includes phone, create title, and inline validation hooks', () => {
  assert.match(SOURCE, /data-cust-modal-title/);
  assert.match(SOURCE, /data-cf-phone/);
  assert.match(SOURCE, /data-cust-modal-error/);
});

test('Customer runtime opens the existing modal in create mode', () => {
  assert.match(SOURCE, /function openCustCreateModal\(/);
  assert.match(SOURCE, /custEditIndex\s*=\s*-1/);
  assert.match(SOURCE, /data-cust-create/);
});

test('Customer runtime validates name and phone before creating', () => {
  assert.match(SOURCE, /function setCustModalError\(/);
  assert.match(SOURCE, /if \(custEditIndex === -1 && \(!name \|\| !phone\)\)/);
  assert.match(SOURCE, /setCustModalError\(/);
});

test('Customer runtime adds manual customers with initial visit data', () => {
  assert.match(SOURCE, /CUSTOMERS\.push\(/);
  assert.match(SOURCE, /src:\s*'manual'/);
  assert.match(SOURCE, /visits:\s*0/);
  assert.match(SOURCE, /last:\s*'—'/);
  assert.match(SOURCE, /seg:\s*'new'/);
});

test('Customer edit action remains wired to the existing modal', () => {
  assert.match(SOURCE, /data-cust-edit/);
  assert.match(SOURCE, /function openCustModal\(/);
  assert.match(SOURCE, /openCustModal\(parseInt\(custEditBtn\.dataset\.custEdit, 10\)\)/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
node --test html/pages/booking-book-phase-1.customer-create.test.mjs
```

Expected: FAIL because the current Customers panel has no `data-cust-create`, phone field, create-mode function, validation hook, or `CUSTOMERS.push(...)` create path.

- [ ] **Step 3: Commit the failing test**

```bash
git add html/pages/booking-book-phase-1.customer-create.test.mjs
git commit -m "test: specify booking customer creation"
```

### Task 2: Add the create action and modal fields

**Files:**
- Modify: `html/pages/booking-book-phase-1.html` in the Customers panel markup and customer modal markup.

**Interfaces:**
- Consumes: existing `booking-primary-button`, `cust-modal`, `data-cust-modal`, and `data-cf-*` hooks.
- Produces: `data-cust-create`, `data-cust-modal-title`, `data-cf-phone`, and `data-cust-modal-error` hooks used by the runtime in Task 3.

- [ ] **Step 1: Add the create button**

Inside `#panel-customers .booking-daybar-actions`, before the customer count/filter controls, add:

```html
<button class="booking-primary-button" type="button" data-cust-create>
  <i class="bi bi-person-plus" aria-hidden="true"></i>
  <span>Create customer</span>
</button>
```

- [ ] **Step 2: Add modal hooks and the phone field**

Update the modal title to include `data-cust-modal-title`, add a Phone field with `data-cf-phone` next to the existing Email field, and add an initially hidden inline error element before the modal footer:

```html
<h3 id="cust-modal-title" data-cust-modal-title>Update customer</h3>

<label class="cust-field">
  <span>Phone</span>
  <input class="booking-input" type="tel" data-cf-phone placeholder="(123) 456-7890" autocomplete="tel">
</label>

<div class="cust-modal-error" data-cust-modal-error role="alert" aria-live="polite" hidden></div>
```

Add a compact `.cust-modal-error` style next to the existing customer modal styles so the message uses the existing spacing and an error color without changing other panels.

- [ ] **Step 3: Run the focused test**

Run:

```bash
node --test --test-name-pattern='Customers panel|Customer modal' html/pages/booking-book-phase-1.customer-create.test.mjs
```

Expected: the two markup-related tests pass; runtime tests remain unselected until Task 3.

- [ ] **Step 4: Commit the markup change**

```bash
git add html/pages/booking-book-phase-1.html
git commit -m "feat: add booking customer create modal fields"
```

### Task 3: Implement create-mode state, validation, and insertion

**Files:**
- Modify: `html/pages/booking-book-phase-1.html` in the customer runtime around `custEditIndex`, `openCustModal`, `saveCustModal`, and the delegated document click handler.

**Interfaces:**
- Consumes: `data-cust-create`, `data-cust-modal-title`, `data-cf-phone`, `data-cust-modal-error`, `CUSTOMERS`, and `renderCustomers()` from existing code.
- Produces: `openCustCreateModal()`, `setCustModalError()`, and a create branch in `saveCustModal()`.

- [ ] **Step 1: Add create-mode helpers**

Add these behaviors beside the existing customer modal helpers:

```js
function setCustModalError(message) {
  var error = document.querySelector('[data-cust-modal-error]');
  if (!error) return;
  error.textContent = message || '';
  error.hidden = !message;
}

function resetCustModalFields() {
  var modal = document.querySelector('[data-cust-modal]');
  if (!modal) return;
  modal.querySelector('[data-cf-name]').value = '';
  modal.querySelector('[data-cf-phone]').value = '';
  modal.querySelector('[data-cf-email]').value = '';
  modal.querySelector('[data-cf-address]').value = '';
  modal.querySelector('[data-cf-type]').value = 'Individual';
  if (custBirthdayPicker) custBirthdayPicker.clear();
  else modal.querySelector('[data-cf-birthday]').value = '';
  setCustStatusToggle(true);
  setCustModalError('');
}

function openCustCreateModal() {
  var modal = document.querySelector('[data-cust-modal]');
  var title = document.querySelector('[data-cust-modal-title]');
  if (!modal) return;
  custEditIndex = -1;
  resetCustModalFields();
  if (title) title.textContent = 'Create customer';
  modal.hidden = false;
}
```

Update `openCustModal(index)` to populate Phone, clear the inline error, and set the title back to `Update customer`. Update `closeCustModal()` to reset `custEditIndex` and clear the error after hiding.

- [ ] **Step 2: Add validation and the create branch**

At the start of `saveCustModal()`, read and trim Name and Phone. When `custEditIndex === -1`, if either is empty, call `setCustModalError('Name and phone are required.')` and return without closing or mutating `CUSTOMERS`.

Add `manual: { icon: 'bi-person-plus', label: 'Manual' }` to `CUST_SRC` so the new source renders as a labeled badge in the table.

When `custEditIndex === -1`, append this shape to `CUSTOMERS`:

```js
CUSTOMERS.push({
  name: name,
  phone: phone,
  email: email,
  address: address,
  birthday: birthday,
  type: type,
  status: status,
  seg: 'new',
  visits: 0,
  last: '—',
  src: 'manual'
});
```

For edit mode, preserve the current update behavior and also assign the trimmed Phone when supplied. Use `Customer created` for the create success toast and `Customer updated` for edit mode.

- [ ] **Step 3: Wire the create button**

In the existing delegated `document.addEventListener('click', ...)`, handle the create action before the edit action:

```js
var custCreateBtn = event.target.closest('[data-cust-create]');
if (custCreateBtn) {
  openCustCreateModal();
  return;
}
```

- [ ] **Step 4: Run the focused tests to verify green**

Run:

```bash
node --test html/pages/booking-book-phase-1.customer-create.test.mjs
```

Expected: all focused customer-create tests pass with zero failures.

- [ ] **Step 5: Commit the runtime change**

```bash
git add html/pages/booking-book-phase-1.html
git commit -m "feat: create customers from booking tab"
```

### Task 4: Run the full verification suite

**Files:**
- No new files; verify the committed changes from Tasks 1–3.

**Interfaces:**
- Consumes: the customer-create contract and existing Booking Book test suites.
- Produces: fresh verification evidence for the final handoff.

- [ ] **Step 1: Run focused and existing tests**

```bash
node --test html/pages/booking-book-phase-1.customer-create.test.mjs html/pages/booking-book-phase-1.shared-appointments.test.mjs
```

Expected: all tests pass with zero failures.

- [ ] **Step 2: Parse every inline script in the HTML**

```bash
node -e 'const fs=require("fs"); const html=fs.readFileSync("html/pages/booking-book-phase-1.html", "utf8"); const scripts=[...html.matchAll(/<script(?:\\s[^>]*)?>([\\s\\S]*?)<\\/script>/gi)].map(m=>m[1]).filter(s=>s.trim()); scripts.forEach(source=>new Function(source)); console.log("inline scripts parsed: " + scripts.length);'
```

Expected: command exits 0 and prints the parsed script count without a syntax error.

- [ ] **Step 3: Check the diff for whitespace errors and inspect status**

```bash
git diff --check
git status --short
```

Expected: `git diff --check` exits 0; status contains only the intended customer-create test, HTML, and committed spec/plan history.

- [ ] **Step 4: Commit any verification-only fixes**

If verification finds a real implementation issue, fix it, rerun the relevant test, and commit with:

```bash
git add html/pages/booking-book-phase-1.html html/pages/booking-book-phase-1.customer-create.test.mjs
git commit -m "fix: verify booking customer creation"
```
