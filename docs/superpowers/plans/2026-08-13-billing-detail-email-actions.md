# Billing Detail Email Actions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add status-aware `Resend email` and `Send reminder` demo actions to NEXORA Package Billing Detail, with SweetAlert success feedback.

**Architecture:** Keep all behavior in the existing Billing Detail renderer and its delegated root click listener. Render a native secondary button from the billing record status, resolve the record again by transaction ID on click, and send status-derived text to SweetAlert2; use native alert only when the CDN dependency is unavailable.

**Tech Stack:** Static HTML, vanilla JavaScript, SweetAlert2 v11 CDN, Node.js built-in test runner, `vm`-based DOM harness.

## Global Constraints

- The new email buttons appear only on `nexora-package-billing-detail`, never in the Package History table.
- `paid` renders `Resend email`; `payment_due` and `overdue` render `Send reminder`.
- The interaction is demo-only: no API request, data mutation, sent timestamp, loading state, retry, rate limiting, or delivery failure state.
- Success messages show the existing `record.billTo.email` through SweetAlert's `text` option, never `html`.
- Existing download links, `Pay now` behavior, responsive action layout, print hiding, and `tab=history` route remain unchanged.
- Preserve all existing user changes in the dirty worktree; do not revert or overwrite them.
- The full Billing Detail suite currently has two unrelated PDF capitalization failures (`NEXORA Touch` versus `NEXORA TOUCH`); do not expand scope to fix them, and report them separately.

---

## File Structure

- Modify `html/pages/nexora-package-billing-detail.html`: load SweetAlert2 before the Billing Detail runtime.
- Modify `html/assets/nexora-package-billing-detail.js`: render status-aware email actions and handle demo confirmations.
- Modify `html/pages/nexora-package-billing-detail.test.mjs`: extend the runtime harness and cover dependency order, rendering, SweetAlert calls, and fallback behavior.
- Do not modify `html/assets/nexora-package-billing-detail.css`: the existing `.billing-detail-action`, mobile, focus, and print rules already cover native buttons in the action group.
- Do not modify Package History HTML, JavaScript, or CSS for this feature.

---

### Task 1: Status-aware Billing Detail email demo

**Files:**

- Modify: `html/pages/nexora-package-billing-detail.html:62-64`
- Modify: `html/assets/nexora-package-billing-detail.js:65-84, 144-147, 194-197, 315-321`
- Test: `html/pages/nexora-package-billing-detail.test.mjs:63-128, 136-225, 247-280`

**Interfaces:**

- Consumes: billing record objects from `window.NEXORA_PACKAGE_BILLING_RECORDS`, especially `transactionId`, `invoiceNumber`, `paymentStatus`, and `billTo.email`.
- Produces: `renderEmailAction(record): string`, returning escaped button markup.
- Produces: `showEmailActionConfirmation(record): void`, invoking `window.Swal.fire(options)` or native `window.alert(message)`.
- Produces DOM contract: `data-billing-email-action="resend|reminder"` and `data-billing-transaction="<transactionId>"`.

- [ ] **Step 1: Extend the test harness with email-action targets and feedback capture**

Change the helper signature:

```js
function createBillingRuntime(search, mutateRecords, options = {}) {
```

Immediately after `let activeElement = null;`, add feedback capture:

```js
const swalCalls = [];
const alertCalls = [];
```

Immediately after the existing `payNowTarget.closest` assignment, add deterministic email-action targets:

```js
const resendEmailTarget = fakeElement({
  dataset: {
    billingEmailAction: 'resend',
    billingTransaction: 'NXR-20260810-0003'
  }
});
const reminderTarget = fakeElement({
  dataset: {
    billingEmailAction: 'reminder',
    billingTransaction: 'SMS-20260811-0001'
  }
});
resendEmailTarget.closest = (selector) => selector === '[data-billing-email-action]' ? resendEmailTarget : null;
reminderTarget.closest = (selector) => selector === '[data-billing-email-action]' ? reminderTarget : null;
```

Extend the existing `window` object in the VM context with these properties after `lucide`:

```js
alert(message) { alertCalls.push(message); },
...(options.withoutSwal ? {} : {
  Swal: { fire(config) { swalCalls.push(config); } }
})
```

Replace the one-line return value with the complete runtime contract:

```js
return {
  alertCalls,
  document,
  modal,
  modalChoice,
  modalClose,
  modalContinue,
  modalSummary,
  payNowTarget,
  reminderTarget,
  resendEmailTarget,
  root,
  shell,
  swalCalls
};
```

Keep the existing `payNowTarget.closest` behavior unchanged. Each fake target only matches its own selector so the delegated handler branches are exercised independently.

- [ ] **Step 2: Write failing dependency-order and status-rendering assertions**

Update the shared-shell test to require SweetAlert2 between the data script and Billing Detail script:

```js
assert.match(
  html,
  /<script src="\.\.\/assets\/nexora-package-billing-data\.js"><\/script>\s*<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/sweetalert2@11"><\/script>\s*<script src="\.\.\/assets\/nexora-package-billing-detail\.js"><\/script>/
);
```

Extend the paid rendering test:

```js
assert.match(html, /data-billing-email-action="resend"/);
assert.match(html, /data-billing-transaction="NXR-20260810-0003"/);
assert.match(html, />Resend email</);
assert.doesNotMatch(html, /data-billing-email-action="reminder"|>Send reminder</);
```

Extend the payment-due rendering test:

```js
assert.match(html, /data-billing-email-action="reminder"/);
assert.match(html, /data-billing-transaction="SMS-20260811-0001"/);
assert.match(html, />Send reminder</);
assert.doesNotMatch(html, /data-billing-email-action="resend"|>Resend email</);
```

Extend the overdue rendering test:

```js
assert.match(html, /data-billing-email-action="reminder"/);
assert.match(html, /data-billing-transaction="VMS-20260701-0002"/);
assert.match(html, />Send reminder</);
assert.doesNotMatch(html, /data-billing-email-action="resend"|>Resend email</);
```

- [ ] **Step 3: Write failing interaction tests for SweetAlert and native fallback**

Add focused tests after the existing Pay now interaction test:

```js
test('confirms a paid billing email resend with SweetAlert', () => {
  const runtime = createBillingRuntime('?transaction=NXR-20260810-0003');

  runtime.root.dispatch('click', { target: runtime.resendEmailTarget });

  assert.equal(runtime.swalCalls.length, 1);
  assert.equal(runtime.swalCalls[0].icon, 'success');
  assert.equal(runtime.swalCalls[0].title, 'Email resent successfully');
  assert.equal(runtime.swalCalls[0].text, 'Billing documents were sent to billing@bitcoinnailbar.com.');
  assert.equal(runtime.swalCalls[0].confirmButtonText, 'Done');
  assert.deepEqual(runtime.alertCalls, []);
});

test('confirms an unpaid payment reminder with SweetAlert', () => {
  const runtime = createBillingRuntime('?transaction=SMS-20260811-0001');

  runtime.root.dispatch('click', { target: runtime.reminderTarget });

  assert.equal(runtime.swalCalls.length, 1);
  assert.equal(runtime.swalCalls[0].icon, 'success');
  assert.equal(runtime.swalCalls[0].title, 'Payment reminder sent successfully');
  assert.equal(runtime.swalCalls[0].text, 'A payment reminder was sent to billing@bitcoinnailbar.com.');
  assert.equal(runtime.swalCalls[0].confirmButtonText, 'Done');
  assert.deepEqual(runtime.alertCalls, []);
});

test('falls back to native alert when SweetAlert is unavailable', () => {
  const runtime = createBillingRuntime('?transaction=NXR-20260810-0003', null, { withoutSwal: true });

  runtime.root.dispatch('click', { target: runtime.resendEmailTarget });

  assert.deepEqual(runtime.swalCalls, []);
  assert.deepEqual(runtime.alertCalls, [
    'Email resent successfully\nBilling documents were sent to billing@bitcoinnailbar.com.'
  ]);
});
```

These tests catch missing event delegation, incorrect status mapping, unsafe recipient sourcing, wrong SweetAlert copy, and loss of feedback when the CDN is unavailable.

- [ ] **Step 4: Run the new tests and verify RED**

Run:

```bash
node --test --test-name-pattern='creates Billing Detail|renders a paid billing record|renders a payment-due invoice|renders an overdue invoice|confirms a paid billing email resend|confirms an unpaid payment reminder|falls back to native alert' html/pages/nexora-package-billing-detail.test.mjs
```

Expected: FAIL because the HTML does not load SweetAlert2, rendered detail markup has no email-action buttons, and clicks do not invoke either feedback mechanism. Confirm failures are assertions, not syntax or harness errors.

- [ ] **Step 5: Load SweetAlert2 before the Billing Detail runtime**

Change the script order in `html/pages/nexora-package-billing-detail.html` to:

```html
<script src="https://unpkg.com/lucide@1.23.0/dist/umd/lucide.min.js"></script>
<script src="../assets/nexora-package-billing-data.js"></script>
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
<script src="../assets/nexora-package-billing-detail.js"></script>
```

Do not move the existing `window.NEXORA_SHELL` declaration or shared shell script.

- [ ] **Step 6: Render the correct email action for each billing status**

Add after `renderDownloadAction` in `html/assets/nexora-package-billing-detail.js`:

```js
function renderEmailAction(record) {
  const paid = record.paymentStatus === 'paid';
  const action = paid ? 'resend' : 'reminder';
  const label = paid ? 'Resend email' : 'Send reminder';
  const icon = paid ? 'mail' : 'bell-ring';
  return `
    <button class="billing-detail-action" type="button" data-billing-email-action="${action}" data-billing-transaction="${escapeHTML(record.transactionId)}" aria-label="${escapeHTML(`${label} for invoice ${record.invoiceNumber}`)}">
      <i data-lucide="${icon}" aria-hidden="true"></i>
      <span>${label}</span>
    </button>
  `;
}
```

Insert `${renderEmailAction(record)}` after the receipt download for paid records:

```js
<div class="billing-detail-actions" aria-label="Billing document actions">
  ${renderDownloadAction(record.invoiceFile, 'Download invoice', 'download')}
  ${renderDownloadAction(record.receiptFile, 'Download receipt', 'download')}
  ${renderEmailAction(record)}
</div>
```

Insert it between invoice download and the primary Pay now action for unpaid records:

```js
<div class="billing-detail-actions" aria-label="Invoice actions">
  ${renderDownloadAction(record.invoiceFile, 'Download invoice', 'download')}
  ${renderEmailAction(record)}
  <button class="billing-detail-action is-primary" type="button" data-billing-pay-now="${escapeHTML(record.transactionId)}"><i data-lucide="credit-card" aria-hidden="true"></i><span>Pay now</span></button>
</div>
```

- [ ] **Step 7: Add status-derived SweetAlert feedback and delegated click handling**

Add before the initial root render:

```js
function showEmailActionConfirmation(record) {
  if (!record) return;
  const paid = record.paymentStatus === 'paid';
  const options = {
    icon: 'success',
    title: paid ? 'Email resent successfully' : 'Payment reminder sent successfully',
    text: paid
      ? `Billing documents were sent to ${record.billTo.email}.`
      : `A payment reminder was sent to ${record.billTo.email}.`,
    confirmButtonText: 'Done'
  };
  if (window.Swal && typeof window.Swal.fire === 'function') {
    window.Swal.fire(options);
    return;
  }
  if (typeof window.alert === 'function') window.alert(`${options.title}\n${options.text}`);
}
```

Replace the root click listener body with ordered action detection:

```js
root.addEventListener('click', (event) => {
  const target = event.target && typeof event.target.closest === 'function' ? event.target : null;
  const emailAction = target ? target.closest('[data-billing-email-action]') : null;
  if (emailAction) {
    showEmailActionConfirmation(findBillingRecord(emailAction.dataset.billingTransaction));
    return;
  }
  const opener = target ? target.closest('[data-billing-pay-now]') : null;
  if (opener) openBillingPayment(findBillingRecord(opener.dataset.billingPayNow), opener);
});
```

This derives the actual confirmation type from `record.paymentStatus`; the data attribute is only a DOM hook and is not trusted as the business-state source.

- [ ] **Step 8: Run the focused tests and verify GREEN**

Run:

```bash
node --test --test-name-pattern='creates Billing Detail|renders a paid billing record|renders a payment-due invoice|renders an overdue invoice|confirms a paid billing email resend|confirms an unpaid payment reminder|falls back to native alert' html/pages/nexora-package-billing-detail.test.mjs
```

Expected: 7 tests pass, 0 fail. Other Billing Detail tests are skipped by the name filter.

- [ ] **Step 9: Verify regressions and scope**

Run the unaffected Package Management suite:

```bash
node --test html/pages/nexora-packages.test.mjs
```

Expected: 20 tests pass, 0 fail.

Run the complete Billing Detail suite:

```bash
node --test html/pages/nexora-package-billing-detail.test.mjs
```

Expected feature result: all new email-action tests pass and no new failures appear. The command may still exit 1 only for the two documented baseline PDF capitalization tests:

- `uses uppercase NEXORA TOUCH across billing surfaces and generated documents`
- `provides real PDF download documents that match billing records`

Verify no email action leaked into Package History:

```bash
! rg -n 'Resend email|Send reminder|data-billing-email-action' html/pages/nexora-packages.html html/assets/nexora-packages.js
```

Verify patch formatting:

```bash
git diff --check
```

- [ ] **Step 10: Review and commit only the intended feature files**

Inspect the final patch and preserve pre-existing work:

```bash
git status --short
git diff -- html/pages/nexora-package-billing-detail.html html/assets/nexora-package-billing-detail.js html/pages/nexora-package-billing-detail.test.mjs
```

Stage only the Billing Detail feature files. Be aware that these files already contain approved, uncommitted `Package History` label changes from the preceding task; preserve them rather than reverting them.

```bash
git add html/pages/nexora-package-billing-detail.html html/assets/nexora-package-billing-detail.js html/pages/nexora-package-billing-detail.test.mjs
git commit -m "feat: add billing detail email actions"
```

Do not stage `html/assets/nexora-packages.js`, `html/pages/nexora-packages.html`, or `html/pages/nexora-packages.test.mjs`; those are prior Package History label changes outside this feature commit.
