# Booking Settings Card Order Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorder the existing Booking Settings cards so Salon Info sits beside Operating Hours and AI Voice sits beside Booking SMS Notifications on desktop.

**Architecture:** Keep the current Settings grid containers and all card internals unchanged. Extend the existing Booking SMS Settings source-contract test with DOM-order assertions, then move the existing AI Voice and Booking SMS article blocks into the first `settings-grid` in the desired order. No JavaScript, CSS, data hook, or persistence changes are needed.

**Tech Stack:** Static HTML and inline JavaScript, Node.js built-in `node:test` source-contract tests.

## Global Constraints

- Move existing `AI Voice` and `Booking SMS Notifications` markup only; do not duplicate either card.
- Preserve all existing `data-*` hooks, collapse controls, switch handlers, and field values.
- Do not add CSS ordering hacks, persistence, or new runtime logic.
- `Services & Pricing`, `Team`, `Salon Info`, and `Operating Hours` behavior remains unchanged.

---

### Task 1: Reorder the Settings card markup

**Files:**
- Modify: `html/pages/booking-book-phase-1.booking-sms-settings.test.mjs:10-33` to assert card order
- Modify: `html/pages/booking-book-phase-1.html:9628-10000` to move the existing card blocks

**Interfaces:**
- Consumes: the existing `SETTINGS_PANEL`, `data-settings-booking-sms-card`, and Settings card title markup.
- Produces: the visual desktop order `Salon Info | Operating Hours` followed by `AI Voice | Booking SMS Notifications`.

- [ ] **Step 1: Add the failing order assertion**

Append this test to `html/pages/booking-book-phase-1.booking-sms-settings.test.mjs`:

```js
test('groups related Settings cards in the requested desktop order', () => {
  const positions = [
    SETTINGS_PANEL.indexOf('>Salon Info</div>'),
    SETTINGS_PANEL.indexOf('>Operating Hours</div>'),
    SETTINGS_PANEL.indexOf('>AI Voice</div>'),
    SETTINGS_PANEL.indexOf('data-settings-booking-sms-card')
  ];

  assert.ok(positions.every((position) => position >= 0), 'all Settings card markers must exist');
  assert.ok(positions[0] < positions[1], 'Salon Info should appear before Operating Hours');
  assert.ok(positions[1] < positions[2], 'Operating Hours should appear before AI Voice');
  assert.ok(positions[2] < positions[3], 'AI Voice should appear before Booking SMS Notifications');
});
```

- [ ] **Step 2: Run the focused test and verify the order assertion fails**

Run:

```bash
node --test html/pages/booking-book-phase-1.booking-sms-settings.test.mjs
```

Expected: the existing three SMS tests pass and the new ordering test fails because Booking SMS Notifications currently appears before Operating Hours and AI Voice.

- [ ] **Step 3: Move the Booking SMS card after Operating Hours and AI Voice**

Inside the first `<div class="settings-grid">`, keep the existing `Salon Info` article first and the existing `Operating Hours` article second. Remove the complete existing article whose opening marker is:

```html
<article class="settings-card" data-settings-booking-sms-card>
```

Do not edit its inner markup. Reinsert that same complete article after the AI Voice article, immediately before the closing `</div>` for the first `settings-grid`.

- [ ] **Step 4: Move the existing AI Voice card into the first Settings grid**

Remove the complete AI Voice article beginning with:

```html
<article class="settings-card">
  <div class="settings-card-head">
    <div>
      <div class="settings-card-title"><span class="settings-ai-title-icon" aria-hidden="true">AI<i class="bi bi-stars"></i></span>AI Voice</div>
```

Keep all of its existing inner controls and closing tags unchanged. Insert it after the existing Operating Hours article and before the Booking SMS article. Leave the `Services & Pricing` article as the only card in the later `settings-two-grid`; do not change its contents or controls.

The resulting first-grid source order must be:

```html
<div class="settings-grid">
  <!-- existing Salon Info article -->
  <!-- existing Operating Hours article -->
  <!-- existing AI Voice article -->
  <!-- existing Booking SMS Notifications article -->
</div>
```

- [ ] **Step 5: Run the focused test and verify it passes**

Run:

```bash
node --test html/pages/booking-book-phase-1.booking-sms-settings.test.mjs
```

Expected: all four focused tests pass, including the order assertion and the existing switch/accessibility assertions.

- [ ] **Step 6: Run related verification**

Run:

```bash
node --test html/pages/booking-book-phase-1.booking-sms-settings.test.mjs html/pages/booking-book-phase-1.settings-services.test.mjs html/pages/booking-book-phase-1.sms-qr.test.mjs html/pages/booking-book-phase-1.shared-appointments.test.mjs
node -e "const fs=require('fs'),vm=require('vm'); const html=fs.readFileSync('html/pages/booking-book-phase-1.html','utf8'); for (const [i,m] of [...html.matchAll(/<script(?:\\s[^>]*)?>([\\s\\S]*?)<\\/script>/gi)].entries()) if (m[1].trim()) new vm.Script(m[1], {filename:'booking-inline-'+i+'.js'}); console.log('inline scripts parse')"
git diff --check
```

Expected: all selected Booking tests pass, inline scripts parse successfully, and `git diff --check` reports no whitespace errors.

- [ ] **Step 7: Commit the implementation**

```bash
git add html/pages/booking-book-phase-1.html html/pages/booking-book-phase-1.booking-sms-settings.test.mjs
git commit -m "refactor: group booking settings cards"
```
