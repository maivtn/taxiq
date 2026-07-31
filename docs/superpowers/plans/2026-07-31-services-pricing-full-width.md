# Services & Pricing Full-Width Settings Card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Booking Settings `Services & Pricing` card span the full available desktop grid width.

**Architecture:** Keep `.settings-two-grid` as the shared responsive two-column container. Add the semantic `settings-service-pricing-card` class to the existing article and scope `grid-column: 1 / -1` to that class. No service catalog markup, JavaScript, or persistence behavior changes.

**Tech Stack:** Static HTML with inline CSS and Node.js built-in `node:test` source-contract tests.

## Global Constraints

- Preserve all existing `Services & Pricing` content, controls, data hooks, and runtime behavior.
- Scope the layout rule to `.settings-two-grid > .settings-service-pricing-card`.
- Do not change the responsive breakpoint or the layout of other Settings cards.
- Use the existing Settings services test file for the focused source-contract assertion.

---

### Task 1: Make Services & Pricing span the Settings grid

**Files:**
- Modify: `html/pages/booking-book-phase-1.settings-services.test.mjs` to assert the card class and full-width rule
- Modify: `html/pages/booking-book-phase-1.html:2125-2140,7190-7192,9951-9953` to add the scoped rule and card class

**Interfaces:**
- Consumes: the existing `.settings-two-grid` responsive CSS and `Services & Pricing` article.
- Produces: a `Services & Pricing` article with class `settings-service-pricing-card` and a rule that sets `grid-column: 1 / -1` within the existing grid.

- [ ] **Step 1: Add the failing source-contract test**

Append this test to `html/pages/booking-book-phase-1.settings-services.test.mjs`:

```js
test('Services & Pricing spans the full Settings grid width', () => {
  assert.match(SOURCE, /<article class="settings-card settings-service-pricing-card">[\s\S]*?Services & Pricing/);

  const cardRule = SOURCE.match(/\.settings-two-grid\s*>\s*\.settings-service-pricing-card\s*\{([\s\S]*?)\n\s*\}/)?.[1] || '';
  assert.match(cardRule, /grid-column:\s*1\s*\/\s*-1/);
});
```

- [ ] **Step 2: Run the focused test and verify the new assertion fails**

Run:

```bash
node --test html/pages/booking-book-phase-1.settings-services.test.mjs
```

Expected: the existing service tests pass and the new test fails because the article class and scoped grid rule are not present yet.

- [ ] **Step 3: Add the scoped full-width CSS rule**

Immediately after the shared `.settings-grid, .settings-two-grid` rule in the inline Settings CSS, add:

```css
.settings-two-grid > .settings-service-pricing-card {
  grid-column: 1 / -1;
}
```

Do not alter the existing one-column base rule or the desktop two-column media rule.

- [ ] **Step 4: Add the semantic class to the existing card**

Change only the `Services & Pricing` article opening tag from:

```html
<article class="settings-card">
```

to:

```html
<article class="settings-card settings-service-pricing-card">
```

Keep the article's inner markup, controls, catalog hooks, and closing tag unchanged.

- [ ] **Step 5: Run the focused test and related Booking Settings tests**

Run:

```bash
node --test html/pages/booking-book-phase-1.settings-services.test.mjs html/pages/booking-book-phase-1.booking-sms-settings.test.mjs html/pages/booking-book-phase-1.sms-qr.test.mjs html/pages/booking-book-phase-1.shared-appointments.test.mjs
node -e "const fs=require('fs'),vm=require('vm'); const html=fs.readFileSync('html/pages/booking-book-phase-1.html','utf8'); for (const [i,m] of [...html.matchAll(/<script(?:\\s[^>]*)?>([\\s\\S]*?)<\\/script>/gi)].entries()) if (m[1].trim()) new vm.Script(m[1], {filename:'booking-inline-'+i+'.js'}); console.log('inline scripts parse')"
git diff --check
```

Expected: all selected tests pass, inline scripts parse successfully, and `git diff --check` reports no whitespace errors.

- [ ] **Step 6: Commit the implementation**

```bash
git add html/pages/booking-book-phase-1.html html/pages/booking-book-phase-1.settings-services.test.mjs
git diff --cached --check
git commit -m "refactor: make services pricing full width"
```

- [ ] **Step 7: Run the complete test suite**

Run:

```bash
set -o pipefail; node --test $(rg --files -g '*.test.mjs' -g '*.test.cjs' -g '*.test.js' | sort) 2>&1 | tail -n 20
```

Expected: the full repository test suite passes with no failures.
