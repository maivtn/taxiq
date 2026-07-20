# Mobile-First W-9 Form Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build one standalone, mobile-first HTML page that collects every editable item on page 1 of IRS Form W-9 (Rev. March 2024), validates the data, protects the TIN in local draft storage, and prints cleanly on US Letter paper.

**Architecture:** `html/pages/w9-form.html` owns the worker-facing markup, responsive/print CSS, and dependency-free browser behavior. `html/pages/w9-form.test.mjs` uses Node's built-in test runner, static HTML assertions, and a VM-loaded public helper API to verify content, privacy, formatting, and conditional rules without adding packages.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript, `localStorage`, browser print API, Node.js `node:test`, `node:assert`, and `node:vm`.

## Global Constraints

- The page is a front-end prototype and must not transmit data to a backend or the IRS.
- The page must be usable without horizontal scrolling from 320px upward.
- Interactive controls must provide at least 44px touch targets.
- TIN and typed signature must never be included in the local draft.
- The official field order is lines 1, 2, 3a, 3b, 4, 5, 6, requester details, 7, Part I, and Part II.
- Primary field labels are English; concise Vietnamese text explains purpose and privacy.
- Printing targets US Letter portrait and hides app-only controls and guidance.
- Do not add dependencies or change existing TaxIQ pages.

---

### Task 1: Define the W-9 document contract and responsive shell

**Files:**
- Create: `html/pages/w9-form.test.mjs`
- Create: `html/pages/w9-form.html`

**Interfaces:**
- Consumes: The official W-9 field order and requirements in `docs/superpowers/specs/2026-07-20-w9-mobile-form-design.md`.
- Produces: A standalone HTML document with form id `w9-form`, section ids `taxpayer-section`, `classification-section`, `address-section`, `tin-section`, and `certification-section`, plus inline script id `w9-form-script`.

- [ ] **Step 1: Write the failing document-contract test**

Create `html/pages/w9-form.test.mjs` with Node imports, an HTML loader, and assertions for the page metadata, official line order, every editable field, five sections, privacy notice, mobile viewport, 44px targets, safe-area sticky actions, and US Letter print CSS:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const PAGE_URL = new URL('./w9-form.html', import.meta.url);
const source = () => readFileSync(PAGE_URL, 'utf8');

test('contains the complete editable W-9 page-one field contract in source order', () => {
  const html = source();
  const ids = [
    'taxpayer-name', 'business-name', 'classification-individual',
    'classification-c-corp', 'classification-s-corp', 'classification-partnership',
    'classification-trust', 'classification-llc', 'llc-code', 'classification-other',
    'foreign-owners', 'exempt-payee-code', 'fatca-code', 'street-address',
    'city', 'state', 'zip', 'requester-details', 'account-numbers',
    'tin-type-ssn', 'tin-type-ein', 'ssn', 'ein', 'certification-acknowledgment',
    'signature', 'signature-date'
  ];
  ids.forEach((id) => assert.match(html, new RegExp(`id=["']${id}["']`), id));
  const ordered = ['taxpayer-section', 'classification-section', 'address-section', 'tin-section', 'certification-section'];
  let cursor = -1;
  ordered.forEach((id) => {
    const next = html.indexOf(`id="${id}"`);
    assert.ok(next > cursor, `${id} must follow the previous W-9 section`);
    cursor = next;
  });
  assert.match(html, /Do not send this form to the IRS/i);
  assert.match(html, /Không gửi trực tiếp.*IRS/i);
});

test('declares mobile-first touch, safe-area, and US Letter print behavior', () => {
  const html = source();
  assert.match(html, /width=device-width,\s*initial-scale=1/);
  assert.match(html, /min-height:\s*44px/);
  assert.match(html, /env\(safe-area-inset-bottom/);
  assert.match(html, /@page\s*{[^}]*size:\s*Letter portrait/s);
  assert.match(html, /@media\s+print/);
  assert.match(html, /@media\s*\(min-width:\s*768px\)/);
});
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
node --test html/pages/w9-form.test.mjs
```

Expected: FAIL with `ENOENT` for `html/pages/w9-form.html`.

- [ ] **Step 3: Implement the semantic form and mobile-first visual shell**

Create `html/pages/w9-form.html` as a complete HTML5 document. Include:

- A compact `Nexora Tax` secure-form header.
- The W-9 title, revision, requester warning, bilingual purpose callout, and official IRS PDF link.
- A five-step progress list connected to the five section ids.
- Semantic fieldsets and labeled controls for every id asserted above.
- An expandable optional exemptions group and an expandable requester/account group.
- A sticky mobile action bar with `Clear`, `Save draft`, and `Continue`/`Submit W-9` controls.
- CSS custom properties for the ink, paper, indigo action, muted text, error, and success colors.
- Default one-column cards; desktop paper-like rules and denser grids at `min-width: 768px`.
- `min-height: 44px` for inputs, buttons, radio cards, and summary toggles.
- `padding-bottom: calc(... + env(safe-area-inset-bottom))` for the sticky action bar.
- `@page { size: Letter portrait; margin: 0.35in; }` plus print rules that hide `.screen-only`, remove sticky positioning, and keep field groups together.

Use real form attributes such as `name`, `autocomplete`, `inputmode`, `maxlength`, `required`, and `aria-describedby`. Do not add external scripts, fonts, images, or libraries.

- [ ] **Step 4: Run the document-contract test and verify GREEN**

Run:

```bash
node --test html/pages/w9-form.test.mjs
```

Expected: 2 tests pass, 0 fail.

- [ ] **Step 5: Commit the semantic page slice**

```bash
git add html/pages/w9-form.html html/pages/w9-form.test.mjs
git commit -m "feat: add mobile-first W-9 form shell"
```

---

### Task 2: Add deterministic TIN, classification, draft, and validation logic

**Files:**
- Modify: `html/pages/w9-form.test.mjs`
- Modify: `html/pages/w9-form.html`

**Interfaces:**
- Consumes: The controls and section ids from Task 1.
- Produces: `window.W9_FORM_TEST_API` with `STORAGE_KEY`, `digitsOnly(value)`, `formatTin(type, value)`, `isValidTin(type, value)`, `line3bApplies(classification, llcCode)`, `sanitizeDraft(values)`, and `validateValues(values)`.

- [ ] **Step 1: Write failing helper and privacy tests**

Append VM helpers and focused tests:

```js
function api() {
  const html = source();
  const script = html.match(/<script id="w9-form-script">([\s\S]*?)<\/script>/)?.[1];
  assert.ok(script, 'inline W-9 script must exist');
  const window = { W9_FORM_SKIP_INIT: true };
  window.window = window;
  const context = vm.createContext({ window, console, JSON, Date });
  vm.runInContext(script, context);
  return window.W9_FORM_TEST_API;
}

test('formats and validates SSN and EIN by TIN type', () => {
  const form = api();
  assert.equal(form.formatTin('ssn', '123456789'), '123-45-6789');
  assert.equal(form.formatTin('ein', '123456789'), '12-3456789');
  assert.equal(form.isValidTin('ssn', '123-45-6789'), true);
  assert.equal(form.isValidTin('ein', '12-3456789'), true);
  assert.equal(form.isValidTin('ssn', '1234'), false);
});

test('shows line 3b only for flow-through classifications', () => {
  const form = api();
  assert.equal(form.line3bApplies('partnership', ''), true);
  assert.equal(form.line3bApplies('trust', ''), true);
  assert.equal(form.line3bApplies('llc', 'P'), true);
  assert.equal(form.line3bApplies('llc', 'S'), false);
  assert.equal(form.line3bApplies('individual', ''), false);
});

test('removes TIN and signature from the device-local draft', () => {
  const form = api();
  const draft = form.sanitizeDraft({
    taxpayerName: 'Amy Nguyen', ssn: '123-45-6789', ein: '12-3456789',
    signature: 'Amy Nguyen', signatureDate: '2026-07-20'
  });
  assert.equal(draft.taxpayerName, 'Amy Nguyen');
  assert.equal('ssn' in draft, false);
  assert.equal('ein' in draft, false);
  assert.equal('signature' in draft, false);
  assert.equal('signatureDate' in draft, false);
});

test('returns field-specific errors for missing and conditional values', () => {
  const form = api();
  const errors = form.validateValues({ classification: 'llc', llcCode: '', tinType: 'ssn', ssn: '123' });
  assert.equal(errors.taxpayerName, 'Enter the name shown on your tax return.');
  assert.equal(errors.llcCode, 'Choose C, S, or P for the LLC.');
  assert.equal(errors.ssn, 'Enter a valid 9-digit SSN.');
  assert.equal(errors.certificationAcknowledgment, 'Accept the certification to continue.');
});
```

- [ ] **Step 2: Run the focused tests and verify RED**

Run:

```bash
node --test --test-name-pattern="formats|line 3b|device-local draft|field-specific" html/pages/w9-form.test.mjs
```

Expected: FAIL because `window.W9_FORM_TEST_API` and its helper functions do not exist.

- [ ] **Step 3: Implement the pure helper API and browser wiring**

In the inline script, define the exact functions consumed by the tests. `digitsOnly` removes non-digits and limits TINs to nine digits. `formatTin` inserts SSN or EIN separators. `line3bApplies` returns true only for partnership, trust/estate, and partnership-classified LLC. `sanitizeDraft` clones only allowlisted non-sensitive fields. `validateValues` returns an object keyed by control id/camel-case field for all required and format errors.

Expose those functions through `window.W9_FORM_TEST_API`, then skip DOM initialization when `window.W9_FORM_SKIP_INIT` is true.

For browser initialization:

- Toggle LLC code and line 3b visibility/disabled state when classification changes.
- Enable only the chosen SSN or EIN input.
- Format TIN while typing and mask it on blur using a visual overlay/state without changing the underlying value.
- Update per-section completion and the progress bar.
- Make `Continue` scroll to and focus the first incomplete section/control.
- Render inline errors and an `aria-live="assertive"` linked summary.
- Save only `sanitizeDraft` output to `taxiq.w9.mobile.draft.v1`.
- Offer restore/discard controls when a draft exists; never auto-restore.
- Clear current values and storage only after native confirmation.
- On valid submission, reveal the completion panel and `Print / Save PDF` button without network activity.

- [ ] **Step 4: Run all W-9 tests and verify GREEN**

Run:

```bash
node --test html/pages/w9-form.test.mjs
```

Expected: 6 tests pass, 0 fail.

- [ ] **Step 5: Commit the interactive form slice**

```bash
git add html/pages/w9-form.html html/pages/w9-form.test.mjs
git commit -m "feat: add secure W-9 form interactions"
```

---

### Task 3: Verify source completeness, syntax, regressions, and print/mobile constraints

**Files:**
- Modify if verification finds a defect: `html/pages/w9-form.html`
- Modify only for a reproduced defect: `html/pages/w9-form.test.mjs`

**Interfaces:**
- Consumes: The finished standalone page and test API.
- Produces: Fresh verification evidence and a clean final diff limited to the W-9 page, W-9 tests, plan, and approved design spec.

- [ ] **Step 1: Check HTML-embedded JavaScript syntax**

Extract the inline script and compile it with Node:

```bash
node -e "const fs=require('fs'),vm=require('vm');const h=fs.readFileSync('html/pages/w9-form.html','utf8');const s=h.match(/<script id=\"w9-form-script\">([\s\S]*?)<\\/script>/);if(!s)throw new Error('script missing');new vm.Script(s[1]);console.log('inline script syntax: ok')"
```

Expected: `inline script syntax: ok` and exit 0.

- [ ] **Step 2: Run the full feature tests**

```bash
node --test html/pages/w9-form.test.mjs
```

Expected: 6 tests pass, 0 fail.

- [ ] **Step 3: Run existing nearby static prototype tests**

```bash
node --test html/customer/customer-salon-operations.test.mjs html/customer/cutomer-reward.test.mjs
```

Expected: all existing tests pass, 0 fail.

- [ ] **Step 4: Run whitespace and sensitive-storage audits**

```bash
git diff --check
rg -n "localStorage\.(setItem|getItem)|fetch\(|XMLHttpRequest|sendBeacon" html/pages/w9-form.html
```

Expected: `git diff --check` exits 0. The audit shows only the page-specific sanitized draft read/write and no network APIs.

- [ ] **Step 5: Inspect the final scope**

```bash
git status --short
git diff --stat HEAD~2..HEAD
```

Expected: unrelated pre-existing untracked files remain untouched; W-9 implementation changes are limited to the planned files.

