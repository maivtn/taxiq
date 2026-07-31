# Booking Edit Technician Services Picker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hard-coded technician service checkboxes in Booking Book with a category-aware picker loaded from `html/menu/menu.json`, supporting global, category, and individual selection.

**Architecture:** Reuse `appointmentServiceCatalogLoader` for a second, independent menu load. Extend its normalized category boundary with `kind` so the page can keep only `service` and `add-on` categories. Render the technician picker dynamically and keep a pending selection value so opening the modal before the fetch completes does not lose saved services.

**Tech Stack:** Static HTML, inline browser JavaScript, existing `appointment-service-catalog.js`, Node.js built-in test runner, source-contract tests.

## Global Constraints

- Load technician services from `../menu/menu.json`; keep the appointment catalog on `../assets/booking-service-catalog-draft.json`.
- Keep only menu categories whose `kind` is `service` or `add-on`; exclude `beverage` categories.
- Escape menu-derived category names, service names, IDs, and values with `escapeHtml` before inserting HTML.
- Preserve the existing technician save format: comma-separated service names from `getTechField('services')`.
- Do not change `menu.json`, appointment picker behavior, technician schedule/profile behavior, or add backend persistence.
- Follow TDD: every production change is preceded by a test that fails for the missing behavior.

---

### Task 1: Add failing contracts for menu filtering and technician picker behavior

**Files:**
- Create: `html/pages/booking-book-phase-1.technician-services.test.mjs`
- Modify: `html/assets/appointment-service-catalog.test.cjs`
- Test target: `html/pages/booking-book-phase-1.html`, `html/assets/appointment-service-catalog.js`

**Interfaces:**
- The page test reads the real HTML source and checks the user-visible picker contracts already used by this repository's static-page tests.
- The catalog test imports the real normalizer and `html/menu/menu.json`.

- [ ] **Step 1: Write the failing page contracts**

Create the test with these assertions:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const SOURCE = readFileSync(new URL('./booking-book-phase-1.html', import.meta.url), 'utf8');
const MODAL_START = SOURCE.indexOf('data-tech-modal');
const MODAL_END = SOURCE.indexOf('data-tech-modal-close', MODAL_START);
const TECH_MODAL = SOURCE.slice(MODAL_START, MODAL_END);

test('technician services load the shared menu JSON instead of hard-coded options', () => {
  assert.match(SOURCE, /TECHNICIAN_SERVICE_CATALOG_URL\s*=\s*['"]\.\.\/menu\/menu\.json['"]/);
  assert.match(SOURCE, /appointmentServiceCatalogLoader\.load\(TECHNICIAN_SERVICE_CATALOG_URL\)/);
  assert.match(TECH_MODAL, /data-tech-service-picker/);
  assert.doesNotMatch(TECH_MODAL, /data-tech-service="Gel"/);
  assert.doesNotMatch(TECH_MODAL, /data-tech-service="Classic Manicure"/);
});

test('technician picker renders global, category, and service selection hooks', () => {
  assert.match(SOURCE, /function renderTechServicePicker\(/);
  assert.match(SOURCE, /function techServiceCategoryMarkup\(/);
  assert.match(SOURCE, /data-tech-service-all/);
  assert.match(SOURCE, /data-tech-service-category-all/);
  assert.match(SOURCE, /data-tech-service-category=/);
  assert.match(SOURCE, /data-tech-service=/);
});

test('technician picker synchronizes checked and indeterminate states', () => {
  assert.match(SOURCE, /function syncTechServiceCheckAll\(/);
  assert.match(SOURCE, /indeterminate/);
  assert.match(SOURCE, /event\.target\.matches\('\[data-tech-service-category-all\]'\)/);
  assert.match(SOURCE, /event\.target\.matches\('\[data-tech-service-all\]'\)/);
  assert.match(SOURCE, /event\.target\.matches\('\[data-tech-service\]'\)/);
});

test('technician service picker has loading and error handling', () => {
  assert.match(SOURCE, /Loading services/);
  assert.match(SOURCE, /renderTechServicePicker\([\s\S]*error/);
  assert.match(SOURCE, /TECHNICIAN_SERVICE_CATALOG_URL/);
});

test('technician service selection survives menu loading and remains comma-separated', () => {
  assert.match(SOURCE, /pendingTechServices/);
  assert.match(SOURCE, /setTechField\('services'/);
  assert.match(SOURCE, /getTechField\('services'/);
  assert.match(SOURCE, /\.filter\(Boolean\)\.join\(', '\)/);
});
```

- [ ] **Step 2: Add the failing catalog boundary test**

Append this test to `html/assets/appointment-service-catalog.test.cjs`:

```js
test('normalizes only service and add-on menu categories with their kind', () => {
  const catalog = serviceCatalog.normalize(menu);

  assert.equal(catalog.categories.length, 11);
  assert.ok(catalog.categories.every((category) => category.kind === 'service' || category.kind === 'add-on'));
  assert.doesNotMatch(JSON.stringify(catalog.categories), /Complimentary|Drinks|Alcohol/);
});
```

- [ ] **Step 3: Run the new tests and verify RED**

Run:

```bash
node --test html/pages/booking-book-phase-1.technician-services.test.mjs
node --test html/assets/appointment-service-catalog.test.cjs
```

Expected: the new page contracts fail because the page still has the 20 hard-coded service labels and no dynamic technician renderer; the catalog contract fails because normalized categories do not expose `kind` yet. Existing unrelated tests may pass.

- [ ] **Step 4: Commit the failing tests**

```bash
git add html/pages/booking-book-phase-1.technician-services.test.mjs html/assets/appointment-service-catalog.test.cjs
git commit -m "test: define technician service picker contracts"
```

### Task 2: Preserve menu category kinds at the shared catalog boundary

**Files:**
- Modify: `html/assets/appointment-service-catalog.js:29-44,64-80`
- Test: `html/assets/appointment-service-catalog.test.cjs`

**Interfaces:**
- `normalize(menu)` returns categories with `id`, `name`, `kind`, and `services`.
- Menu sections are accepted only when `kind` is `service` or `add-on`.
- Existing non-menu category input remains supported with an empty `kind` value.

- [ ] **Step 1: Restrict menu sections and carry `kind`**

Change `menuSectionsToCategories` to use an explicit whitelist and include the field:

```js
function menuSectionsToCategories(sections) {
  return sections.filter(function (section) {
    return section && (section.kind === 'service' || section.kind === 'add-on');
  }).map(function (section) {
    section = section || {};
    return {
      id: section.id,
      name: section.title,
      kind: section.kind,
      services: (Array.isArray(section.items) ? section.items : []).map(function (item) {
        item = item || {};
        return {
          id: item.id,
          name: item.name,
          description: item.description,
          includes: item.includes,
          type: item.type,
          priceLabel: item.priceLabel,
          price: item.price == null ? priceFromLabel(item.priceLabel) : item.price,
          durationMin: item.durationMin == null ? item.durationMinutes : item.durationMin,
          requiredSkill: item.requiredSkill,
          icon: item.icon
        };
      })
    };
  });
}
```

In `normalize`, include `kind: asString(category.kind)` in the normalized category object. Do not add `kind` to individual service records.

- [ ] **Step 2: Run the catalog tests and verify GREEN**

Run:

```bash
node --test html/assets/appointment-service-catalog.test.cjs
```

Expected: all catalog tests pass, including the new service/add-on whitelist test.

- [ ] **Step 3: Commit the normalizer change**

```bash
git add html/assets/appointment-service-catalog.js html/assets/appointment-service-catalog.test.cjs
git commit -m "feat: preserve menu service category kinds"
```

### Task 3: Render the menu-driven technician picker

**Files:**
- Modify: `html/pages/booking-book-phase-1.html:6645-6683,9171-9196,10970-11050`
- Test: `html/pages/booking-book-phase-1.technician-services.test.mjs`

**Interfaces:**
- `techServiceCategoriesFromCatalog(source)` returns only normalized categories whose kind is `service` or `add-on`.
- `techServiceItemMarkup(service, categoryId, index)` returns escaped checkbox markup.
- `techServiceCategoryMarkup(category, index)` returns one accordion category with a category-level select-all checkbox.
- `renderTechServicePicker(source, error)` updates `[data-tech-service-picker]` and preserves the current pending selection.
- `loadTechnicianServiceCatalog()` loads `TECHNICIAN_SERVICE_CATALOG_URL` without changing `appointmentServiceCatalog`.

- [ ] **Step 1: Replace hard-coded modal markup with a loading container**

Replace the existing `Check all` label and 20 static labels with:

```html
<div class="tech-service-checks" data-tech-field="services" data-tech-service-picker>
  <div class="tech-service-catalog-state" data-tech-service-state>Loading services…</div>
</div>
```

Keep the surrounding `settings-field` and `data-tech-field="services"` hook.

- [ ] **Step 2: Add category and picker styles**

Add styles next to `.tech-service-checks` for the scrollable category list, category header, category checkbox, category body, item checkbox, and loading/error state. The category header must keep the checkbox clickable while the surrounding category remains expandable. Use a bounded list height so the modal remains usable with 96 services.

- [ ] **Step 3: Add the renderer helpers**

Add the following implementation shape after the existing technician field helpers:

```js
function techServiceCategoriesFromCatalog(source) {
  return (source && Array.isArray(source.categories) ? source.categories : []).filter(function (category) {
    return category && (category.kind === 'service' || category.kind === 'add-on');
  });
}

function techServiceItemMarkup(service, categoryId, index) {
  var name = service && service.name ? service.name : 'Unnamed service';
  var id = service && service.id ? service.id : categoryId + '-service-' + index;
  return '<label class="tech-service-check"><input type="checkbox" data-tech-service data-tech-service-category="' + escapeHtml(categoryId) + '" data-tech-service-id="' + escapeHtml(id) + '" value="' + escapeHtml(name) + '">' + escapeHtml(name) + '</label>';
}

function techServiceCategoryMarkup(category, index) {
  var services = Array.isArray(category.services) ? category.services : [];
  return '<details class="tech-service-category" data-tech-service-category-panel="' + escapeHtml(category.id) + '"' + (index === 0 ? ' open' : '') + '>' +
    '<summary class="tech-service-category-head"><span class="tech-service-category-title">' + escapeHtml(category.name || 'Other services') + '</span><span class="tech-service-category-count">' + services.length + '</span><label class="tech-service-category-all"><input type="checkbox" data-tech-service-category-all="' + escapeHtml(category.id) + '">Check all</label></summary>' +
    '<div class="tech-service-category-body">' + services.map(function (service, serviceIndex) { return techServiceItemMarkup(service, category.id, serviceIndex); }).join('') + '</div></details>';
}
```

The actual implementation must prevent the category checkbox click from toggling the `<details>` element twice; use `event.stopPropagation()` or a separate button/label handler consistent with the final markup.

- [ ] **Step 4: Add the load path and initial render**

Add `TECHNICIAN_SERVICE_CATALOG_URL = '../menu/menu.json'`, a separate `technicianServiceCatalog` variable, and `loadTechnicianServiceCatalog()` near the existing appointment catalog loader. On success call `renderTechServicePicker(nextCatalog, false)`. On failure call `renderTechServicePicker(null, true)` and leave profile/schedule fields usable. Invoke the loader during page initialization after the existing appointment catalog load call.

- [ ] **Step 5: Run the page contracts and verify GREEN for rendering contracts**

Run:

```bash
node --test html/pages/booking-book-phase-1.technician-services.test.mjs
```

Expected: the URL, dynamic container, category renderer, escaping, and loading/error contracts pass. Selection synchronization contracts may still fail until Task 4.

- [ ] **Step 6: Commit the renderer**

```bash
git add html/pages/booking-book-phase-1.html
git commit -m "feat: render technician services from menu categories"
```

### Task 4: Implement global/category/item selection and pending values

**Files:**
- Modify: `html/pages/booking-book-phase-1.html` around `setTechField`, `syncTechServiceCheckAll`, `getTechField`, and the document-level `change` handler
- Test: `html/pages/booking-book-phase-1.technician-services.test.mjs`

**Interfaces:**
- `pendingTechServices` stores normalized lower-case names while the menu is loading.
- `setTechField('services', value)` stores the selection and checks matching dynamic items.
- `getTechField('services')` returns checked item values joined with `', '`.
- `syncTechServiceCheckAll()` updates global and category `checked`/`indeterminate` states.

- [ ] **Step 1: Add the pending-selection assertions before implementation**

Add these contracts to the page test:

```js
test('category selection changes only items in its category', () => {
  assert.match(SOURCE, /querySelectorAll\('\[data-tech-service\]\[data-tech-service-category=/);
  assert.match(SOURCE, /data-tech-service-category-all/);
  assert.match(SOURCE, /closest\('\[data-tech-service-category-panel\]'\)/);
});

test('saved technician service names are reapplied after the menu renderer runs', () => {
  assert.match(SOURCE, /pendingTechServices\s*=\s*String\(value/);
  assert.match(SOURCE, /pendingTechServices\.indexOf\(/);
  assert.match(SOURCE, /syncTechServiceCheckAll\(\)/);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
node --test html/pages/booking-book-phase-1.technician-services.test.mjs
```

Expected: the two new selection tests fail because category-scoped updates and pending selection logic are not yet present.

- [ ] **Step 3: Implement selection state and synchronization**

Use this behavior:

```js
function syncTechServiceCheckAll() {
  var services = Array.from(document.querySelectorAll('[data-tech-service]'));
  var global = document.querySelector('[data-tech-service-all]');
  var checkedCount = services.filter(function (option) { return option.checked; }).length;
  if (global) {
    global.disabled = services.length === 0;
    global.checked = services.length > 0 && checkedCount === services.length;
    global.indeterminate = checkedCount > 0 && checkedCount < services.length;
  }
  document.querySelectorAll('[data-tech-service-category-all]').forEach(function (categoryAll) {
    var categoryId = categoryAll.dataset.techServiceCategoryAll;
    var categoryServices = Array.from(document.querySelectorAll('[data-tech-service][data-tech-service-category="' + CSS.escape(categoryId) + '"]'));
    var categoryChecked = categoryServices.filter(function (option) { return option.checked; }).length;
    categoryAll.disabled = categoryServices.length === 0;
    categoryAll.checked = categoryServices.length > 0 && categoryChecked === categoryServices.length;
    categoryAll.indeterminate = categoryChecked > 0 && categoryChecked < categoryServices.length;
  });
}
```

Keep a lower-case pending list, apply it after rendering, and update the document `change` handler as follows:

```js
if (event.target.matches('[data-tech-service-all]')) {
  document.querySelectorAll('[data-tech-service]').forEach(function (option) { option.checked = event.target.checked; });
  syncTechServiceCheckAll();
} else if (event.target.matches('[data-tech-service-category-all]')) {
  var categoryId = event.target.dataset.techServiceCategoryAll;
  document.querySelectorAll('[data-tech-service][data-tech-service-category="' + CSS.escape(categoryId) + '"]').forEach(function (option) { option.checked = event.target.checked; });
  syncTechServiceCheckAll();
} else if (event.target.matches('[data-tech-service]')) {
  syncTechServiceCheckAll();
}
```

Use a helper to avoid duplicating selector construction if the browser target does not support `CSS.escape`; the helper must quote/escape the category ID before querying. Do not use the global selector for category operations.

- [ ] **Step 4: Reapply saved values when rendering completes**

`setTechField('services', value)` must always update `pendingTechServices`, then check item values matching case-insensitively when the dynamic inputs exist. `renderTechServicePicker` must call the same application helper and then `syncTechServiceCheckAll()`. `getTechField('services')` must return the checked item values, falling back to the pending list only while the picker is still loading.

- [ ] **Step 5: Run focused tests and verify GREEN**

Run:

```bash
node --test html/pages/booking-book-phase-1.technician-services.test.mjs
```

Expected: all technician picker contracts pass.

- [ ] **Step 6: Commit selection behavior**

```bash
git add html/pages/booking-book-phase-1.html html/pages/booking-book-phase-1.technician-services.test.mjs
git commit -m "feat: add technician service category selection"
```

### Task 5: Run regression verification and inspect the final diff

**Files:**
- Verify: `html/pages/booking-book-phase-1.html`
- Verify: `html/pages/booking-book-phase-1.technician-services.test.mjs`
- Verify: `html/assets/appointment-service-catalog.js`

- [ ] **Step 1: Run all focused tests**

```bash
node --test html/pages/booking-book-phase-1.technician-services.test.mjs
node --test html/pages/booking-book-phase-1.settings-services.test.mjs
node --test html/assets/appointment-service-catalog.test.cjs
```

Expected: all tests pass with zero failures.

- [ ] **Step 2: Run syntax and whitespace checks**

```bash
node --check html/assets/appointment-service-catalog.js
git diff --check HEAD~4..HEAD
```

Expected: Node exits 0 and `git diff --check` produces no output. If the number of implementation commits differs, run `git diff --check` against the working tree and inspect `git diff --stat` instead of assuming a fixed commit range.

- [ ] **Step 3: Inspect the final diff for scope**

```bash
git status --short
git diff -- html/assets/appointment-service-catalog.js html/pages/booking-book-phase-1.html html/pages/booking-book-phase-1.technician-services.test.mjs
```

Confirm that only the menu category boundary, technician picker UI/logic, and their tests changed; leave all pre-existing user modifications untouched.

- [ ] **Step 4: Commit any final cleanup only after tests remain green**

```bash
git add html/assets/appointment-service-catalog.js html/pages/booking-book-phase-1.html html/pages/booking-book-phase-1.technician-services.test.mjs
git commit -m "test: verify technician service picker integration"
```
