# Booking Add Service Description Field Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an optional multiline Description textarea to the manual Add service modal on the Booking Settings page.

**Architecture:** Extend the existing modal markup with one full-width textarea using the current `data-service-modal-field` convention. Include the field in the existing modal reset loop so it opens blank; leave validation, submit data, service rows, and persistence unchanged because the approved scope is UI-only.

**Tech Stack:** Static HTML, inline CSS/JavaScript, Node.js built-in test runner.

## Global Constraints

- The field is optional and has no validation.
- The field is UI-only; its value is not persisted, rendered, or consumed on submit.
- Keep the existing modal styling and service-row layout.
- Use `data-service-modal-field="description"`.

---

### Task 1: Add and verify the Description field

**Files:**
- Modify: `html/pages/booking-book-phase-1.html:10010-10031` for modal markup and reset logic near `openSettingsServiceModal`.
- Test: `html/pages/booking-book-phase-1.settings-services.test.mjs`.

**Interfaces:**
- Existing modal field lookup continues to use `data-service-modal-field`.
- New field contract: `<textarea class="settings-input" data-service-modal-field="description">`.

- [ ] **Step 1: Add the failing source-contract assertion**

Append this test to `html/pages/booking-book-phase-1.settings-services.test.mjs`:

```js
test('manual service modal includes an optional multiline description field', () => {
  assert.match(SOURCE, /<textarea[^>]*class="settings-input"[^>]*data-service-modal-field="description"[^>]*><\/textarea>/);
  assert.match(SOURCE, /data-service-modal-field="description"[^>]*rows="4"/);
  assert.match(SOURCE, /\['name', 'description', 'price', 'duration'\]\.forEach/);
});
```

- [ ] **Step 2: Run the focused test and confirm RED**

Run: `node --test html/pages/booking-book-phase-1.settings-services.test.mjs`

Expected: FAIL in the new test because the modal does not yet contain a description textarea or reset entry.

- [ ] **Step 3: Add the minimal modal markup and reset behavior**

Inside the existing `.settings-service-modal-grid`, immediately after the Service name label, add:

```html
<label class="settings-field settings-service-modal-field-name">
  <span class="settings-label">Description</span>
  <textarea class="settings-input" data-service-modal-field="description" rows="4" placeholder="Describe the service (optional)" aria-label="Service description"></textarea>
</label>
```

Update the existing reset loop in `openSettingsServiceModal` from:

```js
['name', 'price', 'duration'].forEach(function(name) {
```

to:

```js
['name', 'description', 'price', 'duration'].forEach(function(name) {
```

Do not change `saveSettingsServiceModal` or `addSettingsServiceRow`.

- [ ] **Step 4: Run the focused test and confirm GREEN**

Run: `node --test html/pages/booking-book-phase-1.settings-services.test.mjs`

Expected: all tests pass, including the new description-field contract.

- [ ] **Step 5: Run final checks**

Run:

```bash
node --test html/pages/booking-book-phase-1.settings-services.test.mjs
node --test html/pages/booking-book-phase-1.shared-appointments.test.mjs
git diff --check
```

Expected: both test commands exit 0 and `git diff --check` produces no output.

- [ ] **Step 6: Commit the implementation**

```bash
git add html/pages/booking-book-phase-1.html html/pages/booking-book-phase-1.settings-services.test.mjs
git commit -m "feat: add service description textarea"
```
