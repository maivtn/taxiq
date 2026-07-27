# Appointment Action Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clarify appointment status/source metadata and improve the edit-panel action hierarchy.

**Architecture:** Keep the existing `renderApPanel()` as the single renderer and preserve all existing `data-ap-*` action hooks. Add presentation-only wrappers and CSS classes so the shared action handler and appointment store behavior do not change.

**Tech Stack:** Static HTML, inline CSS/JavaScript, Node built-in test runner.

## Global Constraints

- Preserve the existing shared appointment-store mutations and action names.
- Display explicit `Status:` and `Nguồn:` labels before their chips in edit mode.
- Keep `Save appointment` primary and full width.
- Keep `Send SMS`, `Done`, and `No-show` in one operational row on desktop and stack safely on mobile.
- Keep cancel destructive and visually separated from close.

---

### Task 1: Add regression assertions for metadata labels and action groups

**Files:**
- Modify: `html/pages/pos-phase-1.appointments.test.cjs:100-125`
- Test: `html/pages/pos-phase-1.appointments.test.cjs`

**Interfaces:**
- Consumes: the current POS appointment panel source.
- Produces: source-level assertions for the explicit metadata labels and layout hooks.

- [ ] **Step 1: Write the failing test**

Add assertions to the existing action-panel test:

```js
assert.match(html, /data-ap-meta="status"[\s\S]*?Status:/);
assert.match(html, /data-ap-meta="status"[\s\S]*?pos-chip/);
assert.match(html, /data-ap-meta="source"[\s\S]*?Nguồn:/);
assert.match(html, /data-ap-meta="source"[\s\S]*?pos-chip/);
assert.match(html, /data-ap-action-group="operational"/);
assert.match(html, /data-ap-action-group="destructive"/);
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run:

```bash
node --test html/pages/pos-phase-1.appointments.test.cjs
```

Expected: FAIL because the current panel has unlabeled status/source markup and no action-group hooks.

### Task 2: Implement the labeled metadata and action layout

**Files:**
- Modify: `html/pages/pos-phase-1.html:278-297`
- Modify: `html/pages/pos-phase-1.html:2550-2565`

**Interfaces:**
- Consumes: `apSourceLabel()`, `AP_STATUS`, and existing `data-ap-action` handlers.
- Produces: labeled metadata wrappers and presentation hooks consumed by the CSS and regression test.

- [ ] **Step 1: Add focused layout styles**

Add styles next to the existing appointment panel styles:

```css
.ap-form-meta { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; margin: 8px 0 2px; }
.ap-meta-item { display: flex; align-items: center; gap: 5px; min-width: 0; }
.ap-meta-label { color: var(--nexora-subtle); font-size: 10px; font-weight: 900; }
.ap-meta-item .pos-chip { margin: 0; min-width: 0; overflow: hidden; text-overflow: ellipsis; }
.ap-action-destructive { margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--nexora-rule); }
.ap-action-close { margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--nexora-rule); }
```

Keep the existing mobile breakpoint and change the metadata grid to one column below `720px`.

- [ ] **Step 2: Render explicit metadata labels**

Replace the edit-mode metadata fragment with:

```js
'<div class="ap-form-meta">' +
  '<span class="ap-meta-item" data-ap-meta="status"><span class="ap-meta-label">Status:</span><strong class="pos-chip pos-chip-blue">' + esc(AP_STATUS[apDraft.status] || apDraft.status) + '</strong></span>' +
  '<span class="ap-meta-item" data-ap-meta="source"><span class="ap-meta-label">Nguồn:</span><strong class="pos-chip pos-chip-gray">' + esc(apSourceLabel(apDraft.source)) + '</strong></span>' +
'</div>'
```

- [ ] **Step 3: Group the actions without changing behavior**

Keep the existing `data-ap-action` values and add wrappers around the same buttons:

```js
'<button class="pos-btn pos-btn-primary" type="button" data-ap-save style="width:100%;justify-content:center"><i class="bi bi-check-lg"></i> Save appointment</button>' +
'(editing ? '<div class="ap-panel-actions" data-ap-action-group="operational">' +
  '<button class="pos-btn pos-btn-sm pos-btn-primary" type="button" data-ap-action="send-sms"><i class="bi bi-send" aria-hidden="true"></i> Send SMS</button>' +
  '<button class="pos-btn pos-btn-sm pos-btn-success" type="button" data-ap-action="done"><i class="bi bi-check-lg" aria-hidden="true"></i> Done</button>' +
  '<button class="pos-btn pos-btn-sm pos-btn-danger" type="button" data-ap-action="noshow"><i class="bi bi-x-lg" aria-hidden="true"></i> No-show</button>' +
'</div>' +
'<div class="ap-action-destructive" data-ap-action-group="destructive">' +
  '<button class="pos-btn pos-btn-danger" type="button" data-ap-del data-ap-action="cancel" style="width:100%;justify-content:center"><i class="bi bi-trash" aria-hidden="true"></i> Cancel this appointment</button>' +
'</div>' : '') +
'<div class="ap-action-close">' +
  '<button class="pos-btn" type="button" data-ap-close style="width:100%;justify-content:center">Close</button>' +
'</div>'
```

Ensure new-appointment mode still renders Save and Close, while edit mode renders all four action layers.

### Task 3: Verify and commit the change

**Files:**
- Modify: `html/pages/pos-phase-1.appointments.test.cjs`
- Modify: `html/pages/pos-phase-1.html`

- [ ] **Step 1: Run the focused test**

```bash
node --test html/pages/pos-phase-1.appointments.test.cjs
```

Expected: all POS appointment tests pass.

- [ ] **Step 2: Run the full appointment suite and whitespace check**

```bash
node --test html/assets/salon-data.test.cjs html/assets/appointments-store.test.cjs html/assets/pos-appointments-data.test.cjs html/pages/pos-phase-1.appointments.test.cjs html/pages/booking-book-phase-1.shared-appointments.test.mjs
git diff --check
```

Expected: all tests pass and `git diff --check` prints no errors.

- [ ] **Step 3: Commit the implementation**

```bash
git add html/pages/pos-phase-1.html html/pages/pos-phase-1.appointments.test.cjs
git commit -m "feat: clarify appointment action metadata"
```
