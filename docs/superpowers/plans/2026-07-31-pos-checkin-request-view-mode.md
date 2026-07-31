# POS Check-in Request View Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Populate the POS App/QR check-in inbox, add a Card/Table view switch with shared actions, and remove leading service icons from POS service labels.

**Architecture:** Keep `CHECKINQ` as in-memory demo data and keep the existing delegated click handler as the only mutation path. Add focused card/table render helpers selected by a `ciqViewMode` state, and use a presentation-only `serviceDisplayName()` helper wherever POS renders service text.

**Tech Stack:** Static HTML, inline JavaScript, existing POS CSS classes, Node.js built-in `node:test` and `node:assert/strict`.

## Global Constraints

- Keep accept and decline behavior identical in Card and Table views by reusing `data-ciq-ok` and `data-ciq-no`.
- Keep raw service data unchanged; strip only leading service icons at render time.
- Preserve icons used by buttons, status badges, technician UI, and non-service labels.
- Do not add persistence, filtering, sorting, backend changes, or unrelated POS refactoring.
- Follow the repository’s existing source-level test style in `html/pages/pos-phase-1.operational-tickets.test.cjs`.

---

### Task 1: Add failing coverage for the check-in request inbox

**Files:**
- Modify: `html/pages/pos-phase-1.operational-tickets.test.cjs`
- Test: `html/pages/pos-phase-1.operational-tickets.test.cjs`

**Interfaces:**
- Consumes: current `CHECKINQ` source block and `renderCiq()` implementation in `html/pages/pos-phase-1.html`.
- Produces: failing assertions that define the required sample data, switch, render helpers, shared actions, and service-label helper.

- [ ] **Step 1: Write the failing tests**

Append these tests after the existing check-in view tests:

```js
test('Check-in request inbox has App/QR sample data and a Card/Table view switch', () => {
  assert.match(html, /var CHECKINQ = \[/);
  assert.match(html, /src: '📱 App/);
  assert.match(html, /src: '🌐 QR/);
  assert.match(html, /data-ciq-view-target="card"/);
  assert.match(html, /data-ciq-view-target="table"/);
  assert.match(html, /var ciqViewMode = 'card';/);
  assert.match(html, /function ciqCardHtml\(r\) \{/);
  assert.match(html, /function renderCiqTable\(items\) \{/);
  assert.match(html, /html\('\[data-ciq-list\]', ciqViewMode === 'table' \? renderCiqTable\(CHECKINQ\) : CHECKINQ\.map\(ciqCardHtml\)\.join\(''\)\);/);
});

test('Check-in request Card/Table renderers preserve the same request actions and clean service labels', () => {
  const card = html.match(/function ciqCardHtml\(r\) \{[\s\S]*?\n      \}/)?.[0] || '';
  const table = html.match(/function renderCiqTable\(items\) \{[\s\S]*?\n      \}/)?.[0] || '';
  assert.match(card, /data-ciq-ok/);
  assert.match(card, /data-ciq-no/);
  assert.match(table, /data-ciq-ok/);
  assert.match(table, /data-ciq-no/);
  assert.match(html, /function serviceDisplayName\(value\) \{/);
  assert.match(html, /serviceDisplayName\(r\.svc\)/);
});
```

- [ ] **Step 2: Run the focused test file and verify the failure is meaningful**

Run:

```bash
node --test html/pages/pos-phase-1.operational-tickets.test.cjs
```

Expected: FAIL because the current HTML has one `CHECKINQ` sample, no `data-ciq-view-target` controls, no `ciqViewMode`, no table renderer, and no `serviceDisplayName()` helper.

- [ ] **Step 3: Commit the failing test**

```bash
git add html/pages/pos-phase-1.operational-tickets.test.cjs
git commit -m "test: define POS check-in request views"
```

### Task 2: Add request samples and Card/Table rendering

**Files:**
- Modify: `html/pages/pos-phase-1.html:544-547` for the panel header controls
- Modify: `html/pages/pos-phase-1.html:2138-2145` for the demo request data
- Modify: `html/pages/pos-phase-1.html` at the shared helper area and `:2829-2844` for request render helpers
- Modify: `html/pages/pos-phase-1.html:3248-3270` for delegated view-switch handling

**Interfaces:**
- Consumes: `CHECKINQ`, `techName()`, `custProfHtml()`, `esc()`, and the existing `data-ciq-ok`/`data-ciq-no` event delegation.
- Produces: `ciqViewMode`, `ciqActionsHtml()`, `ciqCardHtml()`, `renderCiqTable()`, and a four-record check-in inbox.

- [ ] **Step 1: Add the Card/Table controls to the existing panel header**

Change the current one-line header to include this switch while retaining the count:

```html
<div class="pos-card-head">
  <h3><i class="bi bi-inbox-fill" aria-hidden="true"></i> Check-in from the Nexora App / QR — waiting on the front desk (<span data-ciq-count>0</span>)</h3>
  <div class="booking-view-switch" role="group" aria-label="Check-in requests view mode">
    <button class="booking-view-button is-active" type="button" data-ciq-view-target="card" aria-pressed="true"><i class="bi bi-grid-1x2" aria-hidden="true"></i>Card</button>
    <button class="booking-view-button" type="button" data-ciq-view-target="table" aria-pressed="false"><i class="bi bi-table" aria-hidden="true"></i>Table</button>
  </div>
</div>
```

- [ ] **Step 2: Expand `CHECKINQ` to four representative records**

Keep `rq1` and add three records with both sources, one requested technician, and varied promotions/points:

```js
var CHECKINQ = [
  { id: 'rq1', name: 'Mia Chen', src: '📱 App · 312 pts', svc: 'Milk and Honey Pedicure', reqTech: 't1', promo: 'Reward −$5' },
  { id: 'rq2', name: 'Olivia Park', src: '🌐 QR · guest', svc: 'Gel Shellac Manicure', reqTech: null, promo: '' },
  { id: 'rq3', name: 'Daniela Ruiz', src: '📱 App · 86 pts', svc: 'Acrylic — Full Set', reqTech: 't3', promo: 'First visit −10%' },
  { id: 'rq4', name: 'Sophia Nguyen', src: '🌐 QR · returning', svc: 'Paraffin Wax', reqTech: null, promo: 'Member price' }
];
```

- [ ] **Step 3: Extract shared actions and implement both renderers**

Add the presentation helper near `esc()`, then replace the inline `CHECKINQ.map(...)` body with these helpers and state:

```js
function serviceDisplayName(value) {
  return String(value || '').replace(/^\s*(?:[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]|[\uFE0F\u200D]|[\u2640-\u2642])+\s*/u, '').trim();
}
var ciqViewMode = 'card'; // 'card' | 'table'
function ciqActionsHtml(r) {
  return '<button class="pos-btn pos-btn-success pos-btn-sm" data-ciq-ok="' + r.id + '"><i class="bi bi-check-lg" aria-hidden="true"></i> Accept</button>' +
    '<button class="x-btn" data-ciq-no="' + r.id + '" title="Decline"><i class="bi bi-x-lg" aria-hidden="true"></i></button>';
}
function ciqCardHtml(r) {
  return '<div class="wl-card">' +
    '<div class="wl-info"><div class="wl-name">' + esc(r.name) + ' <span class="pos-chip pos-chip-violet">' + esc(r.src) + '</span></div>' +
    '<div class="wl-meta">' + esc(serviceDisplayName(r.svc)) + (r.reqTech ? ' · 📌 wants ' + esc(techName(r.reqTech)) : '') + (r.promo ? ' · 🎁 ' + esc(r.promo) : '') + '</div>' +
    custProfHtml(r.name) + '</div><div class="wl-actions">' + ciqActionsHtml(r) + '</div></div>';
}
function renderCiqTable(items) {
  if (!items.length) return '<div class="wl-empty">No check-in requests right now.</div>';
  return '<div class="booking-table-wrap"><table class="booking-table"><thead><tr>' +
    '<th scope="col">Guest</th><th scope="col">Source</th><th scope="col">Service</th><th scope="col">Technician request</th><th scope="col">Promo</th><th scope="col">Actions</th>' +
    '</tr></thead><tbody>' + items.map(function (r) {
      return '<tr class="booking-table-row"><td><div class="booking-customer-name">' + esc(r.name) + '</div></td>' +
        '<td>' + esc(r.src) + '</td><td>' + esc(serviceDisplayName(r.svc)) + '</td>' +
        '<td>' + (r.reqTech ? '📌 ' + esc(techName(r.reqTech)) : 'Anyone') + '</td>' +
        '<td>' + (r.promo ? '🎁 ' + esc(r.promo) : '—') + '</td><td><div class="wl-actions">' + ciqActionsHtml(r) + '</div></td></tr>';
    }).join('') + '</tbody></table></div>';
}
function renderCiq() {
  $('[data-ciq-panel]').hidden = !CHECKINQ.length;
  set('[data-ciq-count]', CHECKINQ.length);
  html('[data-ciq-list]', ciqViewMode === 'table' ? renderCiqTable(CHECKINQ) : CHECKINQ.map(ciqCardHtml).join(''));
}
```

- [ ] **Step 4: Wire the check-in request view switch into the existing delegated click handler**

Add this branch before the existing request action branch inside the check-in/tickets panel guard:

```js
var ciqView = e.target.closest('[data-ciq-view-target]');
if (ciqView) {
  ciqViewMode = ciqView.getAttribute('data-ciq-view-target');
  document.querySelectorAll('[data-ciq-view-target]').forEach(function (b) {
    var active = b === ciqView;
    b.classList.toggle('is-active', active);
    b.setAttribute('aria-pressed', String(active));
  });
  renderCiq();
  return;
}
```

- [ ] **Step 5: Run the focused tests and verify they pass**

Run:

```bash
node --test html/pages/pos-phase-1.operational-tickets.test.cjs
```

Expected: PASS, including the new check-in request view tests and all existing POS operational-ticket tests.

- [ ] **Step 6: Commit the working Card/Table implementation**

```bash
git add html/pages/pos-phase-1.html html/pages/pos-phase-1.operational-tickets.test.cjs
git commit -m "feat: add POS check-in request views"
```

### Task 3: Normalize service labels throughout the POS display

**Files:**
- Modify: `html/pages/pos-phase-1.html` at the shared rendering-helper area and all POS service display expressions
- Modify: `html/pages/pos-phase-1.operational-tickets.test.cjs` to add a regression assertion for the display helper usage

**Interfaces:**
- Consumes: raw `svc`, `serviceName`, and booking/catalog service values.
- Produces: `serviceDisplayName(value)` that returns a trimmed service name without leading emoji/icon clusters.

- [ ] **Step 1: Add the failing normalization assertion**

Add this test before extending the helper to the remaining POS service displays:

```js
test('POS service display helper removes leading icons without changing service values', () => {
  assert.match(html, /function serviceDisplayName\(value\) \{/);
  assert.match(html, /replace\(\/\^\\s\*\(\?:\[\\u\{1F300\}-\\u\{1FAFF\}\]/);
  assert.match(html, /esc\(serviceDisplayName\(b\.svc \|\| 'Service TBD'\)\)/);
  assert.match(html, /esc\(serviceDisplayName\(x\.svc\)\)/);
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run:

```bash
node --test html/pages/pos-phase-1.operational-tickets.test.cjs
```

Expected: FAIL because `serviceDisplayName()` and its render call sites do not exist yet.

- [ ] **Step 3: Add the presentation-only helper**

Place this next to the existing shared `esc()` helper:

```js
function serviceDisplayName(value) {
  return String(value || '').replace(/^\s*(?:[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]|[\uFE0F\u200D]|[\u2640-\u2642])+\s*/u, '').trim();
}
```

- [ ] **Step 4: Route every POS service-name display through the helper**

Update the service display expressions in the check-in modal, customer upcoming/history/profile views, access requests, ETA cards/table, and Tickets card/table from forms such as:

```js
esc(b.svc || 'Service TBD')
esc(w.svc || 'No service chosen')
esc(x.svc)
esc(t.serviceName)
```

to:

```js
serviceDisplayName(b.svc || 'Service TBD')
serviceDisplayName(w.svc || 'No service chosen')
serviceDisplayName(x.svc)
serviceDisplayName(t.serviceName)
```

Keep `esc()` around the helper result wherever the surrounding expression expects escaped HTML:

```js
esc(serviceDisplayName(b.svc || 'Service TBD'))
```

Do not change service values stored in `WAITLIST`, `CHECKINQ`, `CUSTHIST`, bookings, or the salon catalog.

- [ ] **Step 5: Run focused tests and verify green**

Run:

```bash
node --test html/pages/pos-phase-1.operational-tickets.test.cjs
```

Expected: PASS with no failures.

- [ ] **Step 6: Commit the service-label normalization**

```bash
git add html/pages/pos-phase-1.html html/pages/pos-phase-1.operational-tickets.test.cjs
git commit -m "fix: remove service icons from POS labels"
```

### Task 4: Run final verification

**Files:**
- Verify: `html/pages/pos-phase-1.html`
- Verify: `html/pages/pos-phase-1.operational-tickets.test.cjs`

- [ ] **Step 1: Run the focused POS test file**

```bash
node --test html/pages/pos-phase-1.operational-tickets.test.cjs
```

Expected: exit code 0 and all tests passing.

- [ ] **Step 2: Run the related POS test files**

```bash
node --test html/pages/pos-phase-1.mode.test.cjs html/pages/pos-phase-1.operations.test.cjs html/pages/pos-phase-1.operational-tickets.test.cjs
```

Expected: exit code 0 and no failures.

- [ ] **Step 3: Inspect the final diff and worktree**

```bash
git diff --check
git diff --stat HEAD~3..HEAD
git status --short
```

Expected: no whitespace errors; only the intended POS/spec/plan commits are present, and the pre-existing `html/pages/pos-phase-2.html` modification remains untouched.
