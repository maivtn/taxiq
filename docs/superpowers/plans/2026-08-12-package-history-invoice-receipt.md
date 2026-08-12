# Package History Invoice and Receipt Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Package History `Valid Until` column with billing actions and add a salon-shell-based Billing Detail page that renders paid, payment-due, and overdue records with real NEXORA invoice/receipt PDF downloads.

**Architecture:** Keep billing fixtures in one browser-safe shared data script consumed by both Package History and Billing Detail. Build `nexora-package-billing-detail.html` from the minimal `salon.html` shell, then render the selected transaction from its query string. Generate committed PDF fixtures from the same JSON literal inside the shared data script so downloaded documents match the UI record.

**Tech Stack:** Static HTML, plain CSS, plain JavaScript, NEXORA shared shell, Lucide icons, Node built-in test runner, VM-based runtime tests, Python 3 with ReportLab, Poppler (`pdfinfo`, `pdftotext`, `pdftoppm`).

## Global Constraints

- Billing Detail must be a new HTML page based on `html/pages/salon.html`.
- Billing Detail is a full page, not a modal or drawer.
- UI and PDF copy use English.
- Package History columns are exactly `Date & time`, `Amount`, `Package`, `Term`, `Status`, `Transaction ID`, `Action`.
- Package History billing statuses are `Paid`, `Payment due`, and `Overdue`; do not use `Active/Expired` there.
- Paid records expose both invoice and receipt downloads.
- Payment-due and overdue records expose invoice download and a demo `Pay now` UI, but no receipt download.
- Downloaded documents must be real PDF files, not HTML renamed with a `.pdf` suffix.
- PDF content must use NEXORA demo identity, never Anthropic identity.
- Demo seller is `NEXORA Touch` / `support@nexoratouch.com`.
- Demo customer is `Bitcoin Nail Bar` / `billing@bitcoinnailbar.com`.
- No backend billing, payment gateway, email, reminder, real-time sync, or dedicated print action.
- Preserve existing Package Management tabs, package overview, countdown, pricing, trial, and payment-modal behavior.

---

## File Map

- Create `html/assets/nexora-package-billing-data.js` - single browser fixture/data contract for history, detail, and PDF generation.
- Modify `html/pages/nexora-packages.html` - load shared billing data before Package Management runtime.
- Modify `html/assets/nexora-packages.js` - render billing statuses and detail links from shared data.
- Modify `html/assets/nexora-packages.css` - remove Valid Until cell styling and add status/action styling.
- Modify `html/pages/nexora-packages.test.mjs` - cover new columns, status branches, links, and shared data loading.
- Create `html/pages/nexora-package-billing-detail.html` - full Billing Detail page based on `salon.html`.
- Create `html/assets/nexora-package-billing-detail.css` - responsive Billing Detail and demo payment UI.
- Create `html/assets/nexora-package-billing-detail.js` - query lookup, state rendering, download links, and demo payment UI.
- Create `html/pages/nexora-package-billing-detail.test.mjs` - shell, paid/due/overdue/not-found, payment UI, and PDF tests.
- Create `scripts/generate-nexora-billing-pdfs.py` - extract the JSON fixture literal and generate matching PDFs with ReportLab.
- Create `html/pages/assets/billing-documents/*.pdf` - downloadable NEXORA invoice/receipt fixtures.

### Shared Billing Record Interface

`html/assets/nexora-package-billing-data.js` publishes:

```js
window.NEXORA_PACKAGE_BILLING_RECORDS = [
  {
    transactionId: 'NXR-20260810-0003',
    paymentStatus: 'paid',
    product: 'NEXORA',
    packageName: 'Professional Pro',
    billing: 'Monthly subscription',
    billingTerm: '1 month',
    invoiceNumber: 'NX-2026-0810-023749',
    receiptNumber: 'RCPT-2026-0810-023749',
    dateIssued: '2026-08-10T07:42:00+07:00',
    dateDue: '2026-08-10T23:59:59+07:00',
    datePaid: '2026-08-10T07:42:00+07:00',
    currency: 'USD',
    seller: { name: 'NEXORA Touch', email: 'support@nexoratouch.com' },
    billTo: { name: 'Bitcoin Nail Bar', email: 'billing@bitcoinnailbar.com' },
    paymentMethod: { brand: 'Visa', last4: '4242' },
    processor: 'Stripe',
    processorTransactionId: 'pi_3NX_023749',
    lineItems: [{ description: 'Professional Pro', period: 'Aug 10-Sep 10, 2026', quantity: 1, unitPrice: 79, amount: 79 }],
    subtotal: 79,
    taxLabel: 'Tax',
    taxRate: 0,
    taxAmount: 0,
    total: 79,
    invoiceFile: 'assets/billing-documents/Invoice-NX-2026-0810-023749.pdf',
    receiptFile: 'assets/billing-documents/Receipt-RCPT-2026-0810-023749.pdf'
  }
];
```

The final array also contains one `payment_due` SMS Business record and one `overdue` AI Voice record. Unpaid records set receipt/payment-only fields to `null` and omit `receiptFile`.

---

### Task 1: Shared Billing Data and Package History

**Files:**
- Create: `html/assets/nexora-package-billing-data.js`
- Modify: `html/pages/nexora-packages.html`
- Modify: `html/assets/nexora-packages.js`
- Modify: `html/assets/nexora-packages.css`
- Test: `html/pages/nexora-packages.test.mjs`

**Interfaces:**
- Consumes: `window.NEXORA_PACKAGE_BILLING_RECORDS` from the shared data script.
- Produces: `getPackageBillingStatus(record)`, seven-column history HTML, and links to `nexora-package-billing-detail.html?transaction=<encoded-id>`.

- [ ] **Step 1: Update the Package History test helper to load shared billing data**

Add:

```js
const PACKAGE_BILLING_DATA_URL = new URL('../assets/nexora-package-billing-data.js', import.meta.url);

function runPackageScripts(context) {
  vm.runInNewContext(readFileSync(PACKAGE_BILLING_DATA_URL, 'utf8'), context);
  vm.runInNewContext(readFileSync(PACKAGE_JS_URL, 'utf8'), context);
}
```

Replace direct `vm.runInNewContext(runtime, context)` calls for Package Management runtime tests with `runPackageScripts(context)`.

- [ ] **Step 2: Write failing Package History behavior tests**

Update the column test to assert the literal arrays:

```js
assert.deepEqual(columnLabels, [
  'Date & time',
  'Amount',
  'Package',
  'Term',
  'Status',
  'Transaction ID',
  'Action'
]);

assert.deepEqual(rowLabels, [
  'Date & time',
  'Amount',
  'Package',
  'Term',
  'Status',
  'Transaction ID',
  'Action'
]);
```

Add independent assertions:

```js
assert.doesNotMatch(historyHTML, /Valid Until/);
assert.match(historyHTML, /package-history-status-badge is-paid[\s\S]*?>Paid</);
assert.match(historyHTML, /package-history-status-badge is-payment-due[\s\S]*?>Payment due</);
assert.match(historyHTML, /package-history-status-badge is-overdue[\s\S]*?>Overdue</);
assert.match(historyHTML, /nexora-package-billing-detail\.html\?transaction=NXR-20260810-0003[\s\S]*?>[\s\S]*View invoice/);
assert.match(historyHTML, /nexora-package-billing-detail\.html\?transaction=SMS-20260811-0001[\s\S]*?>[\s\S]*Payment details/);
```

Update the data-contract test to assert the page loads `nexora-package-billing-data.js` before `nexora-packages.js`.

- [ ] **Step 3: Run the focused test and verify RED**

Run:

```bash
node --test html/pages/nexora-packages.test.mjs
```

Expected: FAIL because the shared data script and Action column do not exist and the old runtime still renders Valid Until/Active/Expired.

- [ ] **Step 4: Create the shared data script**

Create an IIFE with a pure JSON array so the PDF generator can parse it:

```js
(function (root) {
  'use strict';
  const records = [
    {
      "transactionId": "NXR-20260810-0003",
      "paymentStatus": "paid",
      "product": "NEXORA",
      "packageName": "Professional Pro",
      "billing": "Monthly subscription",
      "billingTerm": "1 month",
      "invoiceNumber": "NX-2026-0810-023749",
      "receiptNumber": "RCPT-2026-0810-023749",
      "dateIssued": "2026-08-10T07:42:00+07:00",
      "dateDue": "2026-08-10T23:59:59+07:00",
      "datePaid": "2026-08-10T07:42:00+07:00",
      "currency": "USD",
      "seller": { "name": "NEXORA Touch", "email": "support@nexoratouch.com" },
      "billTo": { "name": "Bitcoin Nail Bar", "email": "billing@bitcoinnailbar.com" },
      "paymentMethod": { "brand": "Visa", "last4": "4242" },
      "processor": "Stripe",
      "processorTransactionId": "pi_3NX_023749",
      "lineItems": [
        { "description": "Professional Pro", "period": "Aug 10-Sep 10, 2026", "quantity": 1, "unitPrice": 79, "amount": 79 }
      ],
      "subtotal": 79,
      "taxLabel": "Tax",
      "taxRate": 0,
      "taxAmount": 0,
      "total": 79,
      "invoiceFile": "assets/billing-documents/Invoice-NX-2026-0810-023749.pdf",
      "receiptFile": "assets/billing-documents/Receipt-RCPT-2026-0810-023749.pdf"
    },
    {
      "transactionId": "SMS-20260811-0001",
      "paymentStatus": "payment_due",
      "product": "Voice + SMS",
      "packageName": "SMS Business",
      "billing": "Monthly subscription",
      "billingTerm": "1 month",
      "invoiceNumber": "NX-2026-0811-1CCEE7",
      "receiptNumber": null,
      "dateIssued": "2026-08-11T09:00:00+07:00",
      "dateDue": "2026-08-18T23:59:59+07:00",
      "datePaid": null,
      "currency": "USD",
      "seller": { "name": "NEXORA Touch", "email": "support@nexoratouch.com" },
      "billTo": { "name": "Bitcoin Nail Bar", "email": "billing@bitcoinnailbar.com" },
      "paymentMethod": null,
      "processor": null,
      "processorTransactionId": null,
      "lineItems": [
        { "description": "SMS Business", "period": "Aug 11-Sep 11, 2026", "quantity": 1, "unitPrice": 179, "amount": 179 }
      ],
      "subtotal": 179,
      "taxLabel": "Tax",
      "taxRate": 0,
      "taxAmount": 0,
      "total": 179,
      "invoiceFile": "assets/billing-documents/Invoice-NX-2026-0811-1CCEE7.pdf",
      "receiptFile": null
    },
    {
      "transactionId": "VMS-20260701-0002",
      "paymentStatus": "overdue",
      "product": "AI Voice Plans",
      "packageName": "AI Voice Pro",
      "billing": "Monthly subscription",
      "billingTerm": "1 month",
      "invoiceNumber": "NX-2026-0701-000002",
      "receiptNumber": null,
      "dateIssued": "2026-07-01T09:35:00+07:00",
      "dateDue": "2026-07-08T23:59:59+07:00",
      "datePaid": null,
      "currency": "USD",
      "seller": { "name": "NEXORA Touch", "email": "support@nexoratouch.com" },
      "billTo": { "name": "Bitcoin Nail Bar", "email": "billing@bitcoinnailbar.com" },
      "paymentMethod": null,
      "processor": null,
      "processorTransactionId": null,
      "lineItems": [
        { "description": "AI Voice Pro", "period": "Jul 1-Aug 1, 2026", "quantity": 1, "unitPrice": 199, "amount": 199 }
      ],
      "subtotal": 199,
      "taxLabel": "Tax",
      "taxRate": 0,
      "taxAmount": 0,
      "total": 199,
      "invoiceFile": "assets/billing-documents/Invoice-NX-2026-0701-000002.pdf",
      "receiptFile": null
    }
  ];
  root.NEXORA_PACKAGE_BILLING_RECORDS = records;
})(typeof window !== 'undefined' ? window : globalThis);
```

Use these exact transaction/status pairs:

```text
NXR-20260810-0003 -> paid -> Professional Pro -> $79
SMS-20260811-0001 -> payment_due -> SMS Business -> $179
VMS-20260701-0002 -> overdue -> AI Voice Pro -> $199
```

- [ ] **Step 5: Load the shared data before Package Management runtime**

In `nexora-packages.html`, load:

```html
<script src="../assets/nexora-package-billing-data.js"></script>
<script src="../assets/nexora-packages.js"></script>
```

- [ ] **Step 6: Render the new history contract**

Replace the file-level `PURCHASE_HISTORY` literal with:

```js
const PURCHASE_HISTORY = Array.isArray(window.NEXORA_PACKAGE_BILLING_RECORDS)
  ? window.NEXORA_PACKAGE_BILLING_RECORDS
  : [];
```

Add:

```js
function getPackageBillingStatus(item) {
  if (item.paymentStatus === 'paid') return { label: 'Paid', className: 'is-paid', icon: 'circle-check' };
  if (item.paymentStatus === 'overdue') return { label: 'Overdue', className: 'is-overdue', icon: 'circle-alert' };
  return { label: 'Payment due', className: 'is-payment-due', icon: 'clock-3' };
}

function packageBillingDetailHref(item) {
  return `nexora-package-billing-detail.html?transaction=${encodeURIComponent(item.transactionId)}`;
}
```

Render the seven requested columns. Paid rows use `View invoice`; unpaid rows use `Payment details`. Keep `data-label` values identical to the header labels.

Map shared data to the history cells exactly as follows:

```js
const historyDate = item.datePaid || item.dateIssued;
const historyAmount = item.total;
const historyTerm = item.billingTerm;
```

- [ ] **Step 7: Update Package History styles**

Remove `.package-history-valid-until`. Add `.package-history-action`, `.package-history-action-link`, `.is-paid`, `.is-payment-due`, and `.is-overdue`. Reduce table `min-width` only if all seven columns remain legible; keep horizontal scrolling as fallback.

- [ ] **Step 8: Run the focused test and verify GREEN**

Run:

```bash
node --test html/pages/nexora-packages.test.mjs
```

Expected: all Package Management tests pass.

- [ ] **Step 9: Commit Task 1**

```bash
git add html/assets/nexora-package-billing-data.js html/pages/nexora-packages.html html/assets/nexora-packages.js html/assets/nexora-packages.css html/pages/nexora-packages.test.mjs
git commit -m "feat: add package billing history actions"
```

---

### Task 2: Salon-Based Billing Detail Page

**Files:**
- Create: `html/pages/nexora-package-billing-detail.html`
- Create: `html/assets/nexora-package-billing-detail.css`
- Create: `html/assets/nexora-package-billing-detail.js`
- Test: `html/pages/nexora-package-billing-detail.test.mjs`

**Interfaces:**
- Consumes: `window.NEXORA_PACKAGE_BILLING_RECORDS`, query parameter `transaction`, and NEXORA shared shell.
- Produces: `findBillingRecord(transactionId)`, `renderBillingDetail(record)`, paid/due/overdue markup, and not-found state.

- [ ] **Step 1: Create the test file with salon-shell assertions**

Test the real HTML source:

```js
test('creates Billing Detail from the Salon shared-shell skeleton', () => {
  const html = source();
  assert.match(html, /<html lang="en-US">/);
  assert.match(html, /<title>Nexora Touch - Billing Details<\/title>/);
  assert.match(html, /<div class="shell">/);
  assert.match(html, /<aside class="sidebar" aria-label="Dashboard sidebar"><\/aside>/);
  assert.match(html, /<div class="app-area">/);
  assert.match(html, /<header class="header"><\/header>/);
  assert.match(html, /<main class="content" aria-label="Billing details content">/);
  assert.match(html, /\.\.\/assets\/nexora-shell\.css/);
  assert.match(html, /\.\.\/assets\/nexora-shell\.js/);
  assert.match(html, /activePage:\s*'packages'/);
  assert.match(html, /activeTab:\s*'history'/);
});
```

- [ ] **Step 2: Add a real VM rendering helper and state tests**

Run both data and detail scripts with a fake `data-billing-detail-root` element and literal query strings. Assert:

```js
assert.match(renderDetail('?transaction=NXR-20260810-0003'), /Receipt from NEXORA Touch/);
assert.match(renderDetail('?transaction=NXR-20260810-0003'), /\$79\.00/);
assert.match(renderDetail('?transaction=NXR-20260810-0003'), /Download invoice/);
assert.match(renderDetail('?transaction=NXR-20260810-0003'), /Download receipt/);
assert.match(renderDetail('?transaction=SMS-20260811-0001'), /Invoice from NEXORA Touch/);
assert.match(renderDetail('?transaction=SMS-20260811-0001'), /Payment due/);
assert.doesNotMatch(renderDetail('?transaction=SMS-20260811-0001'), /Download receipt/);
assert.match(renderDetail('?transaction=VMS-20260701-0002'), /Overdue/);
assert.match(renderDetail('?transaction=missing'), /Billing record not found/);
```

- [ ] **Step 3: Run the new test and verify RED**

Run:

```bash
node --test html/pages/nexora-package-billing-detail.test.mjs
```

Expected: FAIL because the HTML, CSS, and runtime files do not exist.

- [ ] **Step 4: Create Billing Detail HTML from `salon.html`**

Copy the structural skeleton, change the title/language/main label, and add:

```html
<main class="content" aria-label="Billing details content">
  <section class="billing-detail-page" aria-labelledby="billing-detail-title">
    <a class="billing-detail-back" href="nexora-packages.html?tab=history">
      <i data-lucide="arrow-left" aria-hidden="true"></i>
      <span>Back to Package History</span>
    </a>
    <h1 class="visually-hidden" id="billing-detail-title">Billing details</h1>
    <div data-billing-detail-root></div>
  </section>
</main>
```

Load page CSS, shared data, page JS, shell config, then shell JS in that order.

- [ ] **Step 5: Implement data lookup and safe rendering**

In page JS implement:

```js
function findBillingRecord(transactionId) {
  return billingRecords.find((record) => record.transactionId === transactionId) || null;
}

function renderBillingDetail(record) {
  if (!record) return renderNotFound();
  return record.paymentStatus === 'paid'
    ? renderPaidBillingDetail(record)
    : renderUnpaidBillingDetail(record);
}
```

Use `escapeHTML`, `Intl.NumberFormat`, and `Intl.DateTimeFormat`. Paid markup includes both download anchors and payment details. Unpaid markup includes invoice download, Pay now, due date, and line-item totals. Overdue adds a red badge and explicit overdue notice.

- [ ] **Step 6: Style the responsive page**

Create a centered max-width layout with two white cards, NEXORA design tokens, clear total hierarchy, semantic tables on desktop, stacked item rows on mobile, visible focus states, and 44 px action targets.

- [ ] **Step 7: Run Billing Detail and Package tests**

Run:

```bash
node --test html/pages/nexora-package-billing-detail.test.mjs html/pages/nexora-packages.test.mjs
```

Expected: all tests pass.

- [ ] **Step 8: Commit Task 2**

```bash
git add html/pages/nexora-package-billing-detail.html html/assets/nexora-package-billing-detail.css html/assets/nexora-package-billing-detail.js html/pages/nexora-package-billing-detail.test.mjs
git commit -m "feat: add package billing detail page"
```

---

### Task 3: Demo Pay Now UI

**Files:**
- Modify: `html/pages/nexora-package-billing-detail.html`
- Modify: `html/assets/nexora-package-billing-detail.css`
- Modify: `html/assets/nexora-package-billing-detail.js`
- Test: `html/pages/nexora-package-billing-detail.test.mjs`

**Interfaces:**
- Consumes: `[data-billing-pay-now]`, selected unpaid record.
- Produces: accessible `[data-billing-payment-modal]`, `openBillingPayment(record)`, `closeBillingPayment()`.

- [ ] **Step 1: Add failing interaction tests**

Extend the VM helper with a fake modal and event dispatch. Assert:

```js
const due = createBillingRuntime('?transaction=SMS-20260811-0001');
due.root.dispatch('click', { target: due.payNowTarget });
assert.equal(due.modal.hidden, false);
assert.match(due.modalSummary.innerHTML, /SMS Business/);
assert.match(due.modalSummary.innerHTML, /\$179\.00/);

due.document.dispatch('keydown', { key: 'Escape' });
assert.equal(due.modal.hidden, true);
```

Also assert paid detail markup has no `data-billing-pay-now` control.

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
node --test --test-name-pattern='Pay now|payment UI' html/pages/nexora-package-billing-detail.test.mjs
```

Expected: FAIL because no payment modal behavior exists.

- [ ] **Step 3: Add accessible payment modal markup and styles**

Add one hidden dialog outside `.shell`, with title `Pay invoice`, summary target, demo payment method choices, close controls, and visible copy `Demo only - payment processing is not connected.`

- [ ] **Step 4: Implement open/close behavior**

Open only for `payment_due` or `overdue`, render invoice number/amount, lock body scroll, focus the close button, close from backdrop/close/Escape, and restore focus to Pay now. Do not mutate the billing record or pretend payment succeeded.

- [ ] **Step 5: Run tests and verify GREEN**

Run:

```bash
node --test html/pages/nexora-package-billing-detail.test.mjs html/pages/nexora-packages.test.mjs
```

Expected: all tests pass.

- [ ] **Step 6: Commit Task 3**

```bash
git add html/pages/nexora-package-billing-detail.html html/assets/nexora-package-billing-detail.css html/assets/nexora-package-billing-detail.js html/pages/nexora-package-billing-detail.test.mjs
git commit -m "feat: add demo invoice payment UI"
```

---

### Task 4: Real NEXORA PDF Downloads

**Files:**
- Create: `scripts/generate-nexora-billing-pdfs.py`
- Create: `html/pages/assets/billing-documents/Invoice-NX-2026-0810-023749.pdf`
- Create: `html/pages/assets/billing-documents/Receipt-RCPT-2026-0810-023749.pdf`
- Create: `html/pages/assets/billing-documents/Invoice-NX-2026-0811-1CCEE7.pdf`
- Create: `html/pages/assets/billing-documents/Invoice-NX-2026-0701-000002.pdf`
- Modify: `html/pages/nexora-package-billing-detail.test.mjs`

**Interfaces:**
- Consumes: pure JSON literal assigned to `const records` in `nexora-package-billing-data.js`.
- Produces: `load_records()`, `build_invoice(record, path)`, `build_receipt(record, path)` and four valid PDF files.

- [ ] **Step 1: Add failing PDF artifact tests**

For every fixture, assert the invoice file exists, begins with `%PDF-`, and contains its invoice number and total when extracted with `pdftotext`. For the paid fixture, assert the receipt exists and contains the receipt number, payment method, and `Amount paid`. Assert unpaid fixtures have no receipt path.

Use `execFileSync('pdftotext', [pdfPath, '-'], { encoding: 'utf8' })` so the test exercises the real artifact.

- [ ] **Step 2: Run the PDF tests and verify RED**

Run:

```bash
node --test --test-name-pattern='PDF|download document' html/pages/nexora-package-billing-detail.test.mjs
```

Expected: FAIL because the PDF files and generator do not exist.

- [ ] **Step 3: Create the ReportLab generator**

The script must:

1. Read `html/assets/nexora-package-billing-data.js`.
2. Extract the text between `const records = ` and the following `;`.
3. Parse it with `json.loads`.
4. Validate `subtotal + taxAmount == total` for every record.
5. Generate one Letter-size invoice per record.
6. Generate a receipt only for `paid` records.
7. Use NEXORA branding and seller/customer data from the record.
8. Render complete line items, dates, tax, totals, and payment history from record data.

Run:

```bash
python3 scripts/generate-nexora-billing-pdfs.py
```

- [ ] **Step 4: Run PDF and page tests and verify GREEN**

Run:

```bash
node --test html/pages/nexora-package-billing-detail.test.mjs html/pages/nexora-packages.test.mjs
```

Expected: all tests pass and every download href resolves to a real PDF.

- [ ] **Step 5: Render every PDF for visual QA**

Render into `tmp/pdfs/package-billing-qa/`:

```bash
for pdf in html/pages/assets/billing-documents/*.pdf; do
  base="$(basename "$pdf" .pdf)"
  pdftoppm -png -r 144 -f 1 -singlefile "$pdf" "tmp/pdfs/package-billing-qa/$base"
done
```

Inspect every PNG and fix clipped text, collisions, inconsistent spacing, invalid totals, or unreadable line items. Re-run the generator and tests after any correction.

- [ ] **Step 6: Commit Task 4**

```bash
git add scripts/generate-nexora-billing-pdfs.py html/pages/assets/billing-documents html/pages/nexora-package-billing-detail.test.mjs
git commit -m "feat: add package invoice and receipt PDFs"
```

---

### Task 5: Full Regression and Handoff Verification

**Files:**
- Verify all files from Tasks 1-4.

**Interfaces:**
- Consumes: completed Package History, Billing Detail, payment UI, and PDF artifacts.
- Produces: fresh evidence that the full feature and adjacent Package Management behavior pass.

- [ ] **Step 1: Run all Package Management and shell-adjacent tests**

```bash
node --test \
  html/pages/nexora-package-billing-detail.test.mjs \
  html/pages/nexora-packages.test.mjs \
  html/assets/nexora-shell.test.mjs \
  html/pages/salon.test.mjs
```

Expected: all tests pass with zero failures.

- [ ] **Step 2: Verify generated PDFs**

```bash
for pdf in html/pages/assets/billing-documents/*.pdf; do
  pdfinfo "$pdf" | rg 'Pages:|Page size:|Encrypted:'
  pdftotext "$pdf" - | rg 'NEXORA Touch|Invoice|Total|Amount'
done
```

Expected: every file is one-page Letter PDF, unencrypted, with NEXORA identity and totals.

- [ ] **Step 3: Run repository hygiene checks**

```bash
git diff --check
git status --short
git diff --stat HEAD~4..HEAD
```

Expected: no whitespace errors and only planned feature files/commits are present.

- [ ] **Step 4: Remove temporary QA renders**

Delete only `tmp/pdfs/package-billing-qa/*.png` and its now-empty directory. Do not delete committed PDFs.

- [ ] **Step 5: Prepare final handoff**

Report the new page path, Package History behavior, supported statuses, real PDF downloads, tests executed with pass counts, and any intentionally demo-only behavior (`Pay now`).
