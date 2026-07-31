# Booking SMS Notifications Settings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a prototype-only Settings card with independent SMS switches for the customer, salon, and assigned staff when a booking is received.

**Architecture:** Keep the feature inside `booking-book-phase-1.html`. Add explicit Settings markup and a small responsive row style, then reuse the existing generic `.toggle-pill` click behavior and add a focused synchronization helper for `aria-checked`, accessible labels, row status, and the existing Settings status message. No persistence or backend integration is introduced.

**Tech Stack:** Static HTML, inline CSS/JavaScript, Node.js built-in `node:test` source-contract tests.

## Global Constraints

- Prototype only: no localStorage, shared store, API, or actual SMS delivery.
- Use the existing `.settings-card`, `.settings-config-*`, `.toggle-pill`, and `setSettingsStatus` patterns.
- All three switches start enabled and use `role="switch"` with `aria-checked="true"`.
- Do not change the existing first-call SMS behavior, booking notification phone field, SMS Campaigns, or unrelated Settings sections.

---

### Task 1: Add and implement booking SMS recipient switches

**Files:**
- Create: `html/pages/booking-book-phase-1.booking-sms-settings.test.mjs`
- Modify: `html/pages/booking-book-phase-1.html:2200-2760` for focused card/row CSS
- Modify: `html/pages/booking-book-phase-1.html:9574-9940` for Settings card markup
- Modify: `html/pages/booking-book-phase-1.html:14025-14050` and `14995-15020` for synchronization and initialization

**Interfaces:**
- Consumes: existing `.settings-card`, `.settings-config-stack`, `.toggle-pill`, generic `.toggle-pill` click handler, and `setSettingsStatus(message)`.
- Produces: `[data-settings-booking-sms-card]`, `[data-settings-booking-sms-row]`, `[data-settings-booking-sms-toggle]`, `[data-settings-booking-sms-status]`, and `syncBookingSmsNotificationToggle(toggle)`.

- [ ] **Step 1: Write the failing source-contract test**

Create `html/pages/booking-book-phase-1.booking-sms-settings.test.mjs` with the following focused assertions:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const SOURCE = readFileSync(new URL('./booking-book-phase-1.html', import.meta.url), 'utf8');
const SETTINGS_START = SOURCE.indexOf('<section class="tab-panel" id="panel-settings"');
const SETTINGS_END = SOURCE.indexOf('<section class="tab-panel" id="panel-customers"');
const SETTINGS_PANEL = SOURCE.slice(SETTINGS_START, SETTINGS_END);

test('adds three booking SMS recipient switches to Settings', () => {
  assert.match(SETTINGS_PANEL, /data-settings-booking-sms-card/);
  assert.match(SETTINGS_PANEL, /Booking SMS Notifications/);
  for (const label of ['Send to customer', 'Send to salon', 'Send to assigned staff']) {
    assert.match(SETTINGS_PANEL, new RegExp(label));
  }
  assert.equal((SETTINGS_PANEL.match(/data-settings-booking-sms-toggle/g) || []).length, 3);
  assert.equal((SETTINGS_PANEL.match(/role="switch" aria-checked="true"/g) || []).length, 3);
});

test('synchronizes booking SMS switch accessibility and visible status', () => {
  assert.match(SOURCE, /function syncBookingSmsNotificationToggle\(toggle\)/);
  assert.match(SOURCE, /data-settings-booking-sms-status/);
  assert.match(SOURCE, /toggle\.setAttribute\('aria-checked', enabled \? 'true' : 'false'\)/);
  assert.match(SOURCE, /Disable .*booking SMS/);
  assert.match(SOURCE, /Enable .*booking SMS/);
  assert.match(SOURCE, /querySelectorAll\('\[data-settings-booking-sms-toggle\]'\)/);
  assert.match(SOURCE, /setSettingsStatus\([^\n]*booking SMS/);
});

test('keeps the existing first-call SMS switch intact', () => {
  assert.match(SOURCE, /data-settings-first-call-sms-toggle/);
  assert.match(SOURCE, /function syncFirstCallSmsToggle\(toggle\)/);
});
```

- [ ] **Step 2: Run the focused test and verify it fails for the missing feature**

Run:

```bash
node --test html/pages/booking-book-phase-1.booking-sms-settings.test.mjs
```

Expected: FAIL because the Settings panel does not yet contain `data-settings-booking-sms-card` or the new synchronization helper.

- [ ] **Step 3: Add the responsive Settings row styles**

In `html/pages/booking-book-phase-1.html`, add styles next to the existing Settings config rules:

```css
.settings-booking-sms-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  border: 1px solid var(--nexora-border);
  border-radius: 10px;
  background: var(--nexora-canvas);
  padding: 10px;
}

.settings-booking-sms-copy,
.settings-booking-sms-control {
  min-width: 0;
}

.settings-booking-sms-control {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.settings-booking-sms-status {
  color: var(--nexora-success);
  font-size: 10px;
  font-weight: 800;
  white-space: nowrap;
}

.settings-booking-sms-status.is-off {
  color: var(--nexora-subtle);
}

@media (max-width: 520px) {
  .settings-booking-sms-row {
    align-items: start;
  }
}
```

- [ ] **Step 4: Add the Settings card markup**

Insert a new `.settings-card` in the Settings card area after `Salon Info`, before `Operating Hours`. Use one row per recipient and keep all three switches initially enabled:

```html
<article class="settings-card" data-settings-booking-sms-card>
  <div class="settings-card-head">
    <div>
      <div class="settings-card-title"><i class="bi bi-chat-square-text" aria-hidden="true"></i>Booking SMS Notifications</div>
      <div class="settings-card-sub">Choose who receives an SMS when a customer booking is received.</div>
    </div>
    <button class="settings-collapse-button" type="button" data-settings-collapse aria-expanded="true" aria-label="Collapse booking SMS notifications"><i class="bi bi-chevron-up" aria-hidden="true"></i></button>
  </div>
  <div class="settings-config-stack">
    <div class="settings-booking-sms-row" data-settings-booking-sms-row>
      <div class="settings-booking-sms-copy">
        <div class="settings-config-title">Send to customer</div>
        <div class="settings-config-desc">Confirm that the booking request was received.</div>
      </div>
      <div class="settings-booking-sms-control">
        <span class="settings-booking-sms-status" data-settings-booking-sms-status aria-live="polite">On</span>
        <button class="toggle-pill is-on" type="button" data-settings-booking-sms-toggle="customer" data-settings-booking-sms-recipient="Customer" role="switch" aria-checked="true" aria-label="Disable customer booking SMS"></button>
      </div>
    </div>
    <div class="settings-booking-sms-row" data-settings-booking-sms-row>
      <div class="settings-booking-sms-copy">
        <div class="settings-config-title">Send to salon</div>
        <div class="settings-config-desc">Notify the salon's booking notification number.</div>
      </div>
      <div class="settings-booking-sms-control">
        <span class="settings-booking-sms-status" data-settings-booking-sms-status aria-live="polite">On</span>
        <button class="toggle-pill is-on" type="button" data-settings-booking-sms-toggle="salon" data-settings-booking-sms-recipient="Salon" role="switch" aria-checked="true" aria-label="Disable salon booking SMS"></button>
      </div>
    </div>
    <div class="settings-booking-sms-row" data-settings-booking-sms-row>
      <div class="settings-booking-sms-copy">
        <div class="settings-config-title">Send to assigned staff</div>
        <div class="settings-config-desc">Alert the staff member assigned to the appointment.</div>
      </div>
      <div class="settings-booking-sms-control">
        <span class="settings-booking-sms-status" data-settings-booking-sms-status aria-live="polite">On</span>
        <button class="toggle-pill is-on" type="button" data-settings-booking-sms-toggle="staff" data-settings-booking-sms-recipient="Assigned staff" role="switch" aria-checked="true" aria-label="Disable assigned staff booking SMS"></button>
      </div>
    </div>
  </div>
</article>
```

- [ ] **Step 5: Add the minimal synchronization helper**

Place this helper beside `syncFirstCallSmsToggle`:

```js
function syncBookingSmsNotificationToggle(toggle) {
  if (!toggle) return;

  var enabled = toggle.classList.contains('is-on');
  var recipient = toggle.dataset.settingsBookingSmsRecipient || 'booking recipient';
  var row = toggle.closest('[data-settings-booking-sms-row]');
  var status = row ? row.querySelector('[data-settings-booking-sms-status]') : null;

  toggle.setAttribute('aria-checked', enabled ? 'true' : 'false');
  toggle.setAttribute('aria-label', enabled ? 'Disable ' + recipient.toLowerCase() + ' booking SMS' : 'Enable ' + recipient.toLowerCase() + ' booking SMS');
  if (status) {
    status.textContent = enabled ? 'On' : 'Off';
    status.classList.toggle('is-off', !enabled);
  }
}
```

- [ ] **Step 6: Register the new switches without double-toggling**

After the existing first-call SMS initialization, add:

```js
document.querySelectorAll('[data-settings-booking-sms-toggle]').forEach(function(toggle) {
  syncBookingSmsNotificationToggle(toggle);
  toggle.addEventListener('click', function() {
    syncBookingSmsNotificationToggle(toggle);
    var recipient = toggle.dataset.settingsBookingSmsRecipient || 'Booking recipient';
    setSettingsStatus(recipient + ' booking SMS ' + (toggle.classList.contains('is-on') ? 'enabled' : 'disabled') + '.');
  });
});
```

The existing generic `.toggle-pill` listener runs before this listener and owns the `is-on` class toggle, so this handler only synchronizes the derived state and status message.

- [ ] **Step 7: Run the focused test and verify it passes**

Run:

```bash
node --test html/pages/booking-book-phase-1.booking-sms-settings.test.mjs
```

Expected: PASS with all three new Settings contract tests passing.

- [ ] **Step 8: Run related verification**

Run:

```bash
node --test html/pages/booking-book-phase-1.booking-sms-settings.test.mjs html/pages/booking-book-phase-1.settings-services.test.mjs html/pages/booking-book-phase-1.sms-qr.test.mjs html/pages/booking-book-phase-1.shared-appointments.test.mjs
node -e "const fs=require('fs'),vm=require('vm'); const html=fs.readFileSync('html/pages/booking-book-phase-1.html','utf8'); for (const [i,m] of [...html.matchAll(/<script(?:\\s[^>]*)?>([\\s\\S]*?)<\\/script>/gi)].entries()) if (m[1].trim()) new vm.Script(m[1], {filename:'booking-inline-'+i+'.js'}); console.log('inline scripts parse')"
git diff --check
```

Expected: all selected Node tests pass, inline scripts parse successfully, and `git diff --check` reports no whitespace errors.

- [ ] **Step 9: Commit the implementation**

```bash
git add html/pages/booking-book-phase-1.html html/pages/booking-book-phase-1.booking-sms-settings.test.mjs
git commit -m "feat: add booking SMS notification settings"
```
