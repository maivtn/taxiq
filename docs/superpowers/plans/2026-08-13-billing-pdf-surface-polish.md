# Billing PDF Surface Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render polished four-corner radius treatment for the status badge and Amount card in every generated Billing Detail PDF.

**Architecture:** Keep the ReportLab table-based generator and fix its surface configuration at the source. Use explicit four-value `cornerRadii` arrays, status-specific widths, and centered badge typography, then regenerate the committed PDFs from the existing shared billing fixture.

**Tech Stack:** Python 3, ReportLab, Node.js test runner, Poppler (`pdftocairo`, `pdftoppm`, `pdfinfo`).

## Global Constraints

- Preserve A4 page size and equal 47.76pt left/right content guides.
- Preserve all billing data, line-item, totals, footer, and download paths.
- Do not add shadows, gradients, icons, dependencies, or new colors.
- Status badge radius is 7pt; Amount card radius is 9pt.

---

### Task 1: Polish generated PDF surfaces

**Files:**
- Modify: `html/pages/nexora-package-billing-detail.test.mjs`
- Modify: `scripts/generate-nexora-billing-pdfs.py`
- Regenerate: `html/pages/assets/billing-documents/Invoice-NX-2026-0701-000002.pdf`
- Regenerate: `html/pages/assets/billing-documents/Invoice-NX-2026-0810-023749.pdf`
- Regenerate: `html/pages/assets/billing-documents/Invoice-NX-2026-0811-1CCEE7.pdf`
- Regenerate: `html/pages/assets/billing-documents/Receipt-RCPT-2026-0810-023749.pdf`

**Interfaces:**
- Consumes: billing records returned by `load_records()` and the existing `status_label(record)` tuple.
- Produces: unchanged PDF download paths with four-corner rounded status and amount surfaces.

- [ ] **Step 1: Add the failing generated-output test**

Add a test that converts a generated invoice to SVG using `pdftocairo -svg`, extracts distinct `clip-rule="evenodd"` paths, and requires the status and amount paths to each contain at least four cubic curve commands.

- [ ] **Step 2: Verify the test fails for the existing one-corner output**

Run:

```bash
node --test --test-name-pattern="four rounded corners" html/pages/nexora-package-billing-detail.test.mjs
```

Expected: FAIL because the current clip paths contain only one curved corner.

- [ ] **Step 3: Implement the minimal ReportLab fix**

In `header_block`, select a compact status width from the status text, center its paragraph, and construct the status table with `cornerRadii=[7, 7, 7, 7]`. In `amount_block`, construct the table with `cornerRadii=[9, 9, 9, 9]`. Remove the one-value `ROUNDEDCORNERS` commands so there is one source of truth.

- [ ] **Step 4: Regenerate billing PDFs and verify green**

Run:

```bash
python3 scripts/generate-nexora-billing-pdfs.py
node --test html/pages/nexora-package-billing-detail.test.mjs
```

Expected: generator exits 0 and all Billing Detail tests pass.

- [ ] **Step 5: Render and visually inspect all four PDFs**

Render each first page with `pdftoppm -png -r 144 -f 1 -singlefile`. Verify all four corners are visible on both surfaces, status copy is centered, and no content is clipped or overlapped.

- [ ] **Step 6: Verify geometry and commit**

Run `pdfinfo` for all four PDFs and confirm A4 output, then run `git diff --check`. Stage only the generator, test, spec, plan, and four generated PDFs before committing with:

```bash
git commit -m "fix: polish billing PDF surfaces"
```
