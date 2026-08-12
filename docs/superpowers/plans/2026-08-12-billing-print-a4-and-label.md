# Billing Print A4 and Label Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename Package History to Billing History and make both Billing Detail browser printing and downloadable billing PDFs render cleanly on A4.

**Architecture:** Preserve `tab=history` and the existing shared billing fixture. Add print-only CSS to the Billing Detail stylesheet, and switch the ReportLab page geometry from Letter to A4 so both print paths share the same physical page size without introducing a second print page.

**Tech Stack:** HTML, CSS `@media print`/`@page`, Node test runner, Chrome headless print-to-PDF, ReportLab, Poppler.

## Global Constraints

- User-facing label is `Billing History`; internal route remains `tab=history`.
- Browser print and downloadable PDFs use A4 portrait.
- Application chrome and interactive controls do not appear in print.
- Printed sections may flow across pages, but headings, table rows, and total rows must not split internally.
- Existing Billing Detail desktop/mobile behavior remains unchanged.

---

### Task 1: Billing History terminology

**Files:**
- Modify: `html/pages/nexora-packages.test.mjs`
- Modify: `html/pages/nexora-package-billing-detail.test.mjs`
- Modify: `html/pages/nexora-packages.html`
- Modify: `html/pages/nexora-package-billing-detail.html`
- Modify: `html/assets/nexora-package-billing-detail.js`

**Interfaces:**
- Consumes: existing `tab=history` tab identifier and URL.
- Produces: user-facing `Billing History` tab/back-link copy while retaining route compatibility.

- [ ] **Step 1: Write failing assertions for `Billing History` and absence of legacy visible copy**

```js
assert.match(historyTab, /<span>Billing History<\/span>/);
assert.doesNotMatch(historyTab, /Package History/);
assert.match(html, /Back to Billing History/);
```

- [ ] **Step 2: Run the two Node test files and confirm the assertions fail on `Package History`**
- [ ] **Step 3: Replace visible tab/back-link/error-state copy only; do not rename data attributes or URL values**
- [ ] **Step 4: Run the two Node test files and confirm the terminology tests pass**

### Task 2: Billing Detail browser print layout

**Files:**
- Modify: `html/pages/nexora-package-billing-detail.test.mjs`
- Modify: `html/assets/nexora-package-billing-detail.css`

**Interfaces:**
- Consumes: existing `.shell`, `.header`, `.sidebar`, `.billing-detail-*`, and payment-modal selectors.
- Produces: A4 print cascade with hidden shell chrome/actions and safe page-break behavior.

- [ ] **Step 1: Add a failing print-contract test that requires `@page { size: A4 portrait; }`, `@media print`, hidden chrome/actions, and break rules**

```js
assert.match(css, /@page\s*\{[\s\S]*?size:\s*A4 portrait/);
const printRules = css.match(/@media print\s*\{([\s\S]*)\}\s*$/)?.[1] || '';
assert.match(printRules, /\.sidebar[\s\S]*?display:\s*none/);
assert.match(printRules, /\.billing-detail-actions[\s\S]*?display:\s*none/);
assert.match(printRules, /break-inside:\s*avoid/);
```

- [ ] **Step 2: Run the Billing Detail test and confirm it fails because no print rules exist**
- [ ] **Step 3: Add the minimal print stylesheet at the end of `nexora-package-billing-detail.css`**

```css
@page {
  size: A4 portrait;
  margin: 12mm;
}

@media print {
  .sidebar, .header, .billing-detail-back, .billing-detail-actions, .billing-payment-modal {
    display: none !important;
  }

  .billing-detail-summary-head,
  .billing-detail-document-head,
  .billing-detail-table tr,
  .billing-detail-totals div {
    break-inside: avoid;
  }
}
```

- [ ] **Step 4: Run the Billing Detail test and confirm it passes**
- [ ] **Step 5: Print paid and payment-due pages with Chrome headless, confirm A4 via `pdfinfo`, render all pages with Poppler, and inspect alignment**

### Task 3: Downloadable A4 PDFs

**Files:**
- Modify: `html/pages/nexora-package-billing-detail.test.mjs`
- Modify: `scripts/generate-nexora-billing-pdfs.py`
- Regenerate: `html/pages/assets/billing-documents/*.pdf`

**Interfaces:**
- Consumes: `NEXORA_PACKAGE_BILLING_RECORDS` and existing document filenames.
- Produces: A4 invoice/receipt PDFs using the same fixture data.

- [ ] **Step 1: Add a failing PDF assertion for exact A4 page geometry**

```js
const info = execFileSync('pdfinfo', [fileURLToPath(invoiceURL)], { encoding: 'utf8' });
assert.match(info, /Page size:\s+595\.276 x 841\.89 pts \(A4\)/);
```

- [ ] **Step 2: Run the Billing Detail test and confirm existing Letter PDFs fail**
- [ ] **Step 3: Switch generator page size, footer width, and document page size from `letter` to `A4`**

```python
from reportlab.lib.pagesizes import A4

canvas.drawRightString(A4[0] - document.rightMargin, 0.34 * inch, f"Page {canvas.getPageNumber()}")
document = SimpleDocTemplate(str(output_path), pagesize=A4, ...)
```

- [ ] **Step 4: Regenerate all four committed billing PDFs**
- [ ] **Step 5: Run PDF tests, render every page to PNG, and inspect margins, alignment, tables, totals, and footer**

### Task 4: Regression and cleanup

**Files:**
- Test: `html/pages/nexora-package-billing-detail.test.mjs`
- Test: `html/pages/nexora-packages.test.mjs`
- Test: `html/assets/nexora-shell.test.mjs`

**Interfaces:**
- Consumes: completed label, browser-print, and PDF changes.
- Produces: verified print output and a clean billing-only diff.

- [ ] **Step 1: Run the focused Billing/Package/Shell suite**
- [ ] **Step 2: Run `git diff --check` on the billing files**
- [ ] **Step 3: Remove temporary print PDFs and PNG renders under `tmp/pdfs/`**
- [ ] **Step 4: Review the billing-only diff and commit without staging unrelated workspace changes**
