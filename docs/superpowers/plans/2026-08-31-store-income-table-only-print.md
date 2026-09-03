# Store Income Table-Only Print Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Print only the active Store Income table, including a one-row Day table, while leaving the screen layout unchanged.

**Architecture:** Reuse the existing report table as the only printable surface. Separate table population from table-view activation so Day can prepare printable data while retaining its cards, then isolate and normalize that table with print media CSS.

**Tech Stack:** Static HTML, CSS print media queries, browser JavaScript, Node.js test runner, JSDOM

**Spec:** `docs/superpowers/specs/2026-08-31-store-income-table-only-print-design.md`

## Global Constraints

- Do not change the normal on-screen Store Income layout.
- Printed output contains only `.report-table`, including its header, active rows, and total footer.
- Day printing contains one row for the selected date instead of a blank table.
- Reuse the existing Print / PDF handler and existing report table markup.

---

### Task 1: Protect the table-only print behavior

**Files:**
- Modify: `html/pages/pos-shop-income-report.test.mjs`
- Modify: `html/pages/pos-shop-income-report.html`

**Interfaces:**
- Consumes: Existing `syntheticDay(iso)`, `.report-table`, `[data-report-table-body]`, and `[data-print-report]` behavior.
- Produces: `populateReportTable(rows, rowKind)`, which writes report rows and footer totals without changing screen visibility.

- [x] **Step 1: Write the failing tests**

Add a Day behavior test that expects one hidden printable row and its literal total:

```js
test('prepares one table row for printing Day without replacing the screen cards', () => {
  const { window } = loadPrototype()

  assert.equal(window.document.querySelector('[data-day-view]')?.hidden, false)
  assert.equal(window.document.querySelector('[data-table-view]')?.hidden, true)
  assert.equal(window.document.querySelectorAll('[data-report-row]').length, 1)
  assert.match(window.document.querySelector('[data-report-row]')?.textContent ?? '', /Mon, Aug 31/i)
  assert.equal(window.document.querySelector('[data-table-grand-total]')?.textContent?.trim(), '$3,842.65')
})
```

Add a print contract test that reads the real print media rule and expects non-table page content to be hidden while the table is exposed and normalized:

```js
test('prints only the report table with paper-safe table styles', () => {
  const { window } = loadPrototype()
  const printRule = [...window.document.styleSheets[0].cssRules]
    .find((rule) => rule.conditionText === 'print')

  assert.ok(printRule)
  const css = printRule.cssText
  assert.match(css, /\.page\s*>\s*:not\(\.table-card\)/)
  assert.match(css, /\.table-card[^}]*display:\s*block\s*!important/)
  assert.match(css, /\.table-scroll[^}]*overflow:\s*visible/)
  assert.match(css, /\.report-table[^}]*min-width:\s*0/)
  assert.match(css, /\.report-table\s+(?:th|td)[^}]*position:\s*static/)
})
```

- [x] **Step 2: Run the focused test to verify RED**

Run: `node --test html/pages/pos-shop-income-report.test.mjs`

Expected: FAIL because Day currently leaves the table body empty and the print media rule does not isolate/reset the table.

- [x] **Step 3: Implement minimal table population and print CSS**

In `html/pages/pos-shop-income-report.html`:

```js
function populateReportTable(rows, rowKind) {
  const totals = summarizeRows(rows)
  // Render the existing tbody and footer totals without changing hidden states.
  return totals
}
```

Call it from `renderDay()` with `[syntheticDay(iso)]`, and call it from `renderTable()` before building the active report summary. Keep Day cards visible and the table card hidden on screen.

Update `@media print` so `.page > :not(.table-card)` is hidden, `.table-card` is forced to `display: block`, its `.section-heading` is hidden, and `.table-scroll`/`.report-table`/table cells lose scroll, minimum width, and sticky positioning.

- [x] **Step 4: Run focused tests to verify GREEN**

Run: `node --test html/pages/pos-shop-income-report.test.mjs`

Expected: all Store Income tests PASS without warnings.

- [x] **Step 5: Run the repository test suite**

Run: `npm test`

Expected: all project tests PASS, or any pre-existing unrelated failures are recorded separately with the focused Store Income suite still passing.

- [x] **Step 6: Review the final diff**

Run: `git diff --check && git diff -- docs/superpowers/specs/2026-08-31-store-income-table-only-print-design.md docs/superpowers/plans/2026-08-31-store-income-table-only-print.md html/pages/pos-shop-income-report.html html/pages/pos-shop-income-report.test.mjs`

Expected: no whitespace errors and only the approved Store Income print scope is present.
