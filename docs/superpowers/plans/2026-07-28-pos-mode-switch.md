# POS mode switch and role-gated navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a POS mode-switch modal with demo role/PIN selection and hide the Management navigation and panel for Front Desk mode.

**Architecture:** Keep the feature local to `html/pages/pos-phase-1.html`. Reuse the existing `STAFF`, `ROLE_LBL`, tab activation, and modal visual primitives; add a small active-staff state plus one access-application function that controls the Management tab/panel and redirects away from Management when required. Add source-contract tests in a focused POS test file because the repository's existing POS tests validate this static HTML prototype without a browser DOM harness.

**Tech Stack:** Plain HTML, inline CSS, vanilla JavaScript, Node.js built-in `node:test` and `node:assert/strict`.

## Global Constraints

- Demo PIN is exactly `1234`.
- Selectable demo accounts are Brian (Owner), Mia (Manager), and Cindy (Front Desk).
- Front Desk mode must hide both the Management tab and the Management panel.
- Switching to Front Desk while Management is active must activate Operations.
- Direct `?tab=management` activation must also be redirected to Operations for Front Desk mode.
- No backend authentication, persistence, or unrelated page changes.
- Keep the existing `.sms-modal` / `.sms-dialog` modal language and `activateTab` URL synchronization.

---

### Task 1: Add failing source-contract tests for the mode switch

**Files:**
- Create: `html/pages/pos-phase-1.mode.test.cjs`
- Reference: `html/pages/pos-phase-1.html`

**Interfaces:**
- Consumes: the raw HTML source loaded from `pos-phase-1.html`.
- Produces: executable assertions for the mode-switch markup, demo roles/PIN, Front Desk visibility, and tab guard that later implementation tasks must satisfy.

- [ ] **Step 1: Write the failing test**

Create the focused test file with this content:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, 'pos-phase-1.html'), 'utf8');

test('POS exposes a mode switch modal with the three selectable demo accounts', () => {
  assert.match(html, /data-pos-mode-open/);
  assert.match(html, /data-pos-mode-modal[^>]*role="dialog"/);
  assert.match(html, /data-pos-mode-pin/);
  assert.match(html, /data-pos-mode-submit/);
  assert.match(html, /data-pos-mode-close/);
  assert.match(html, /data-pos-mode-error[^>]*aria-live="polite"/);
  assert.match(html, /data-pos-role="owner"/);
  assert.match(html, /data-pos-role="manager"/);
  assert.match(html, /data-pos-role="frontdesk"/);
});

test('POS mode uses the demo PIN and applies Front Desk management visibility', () => {
  assert.match(html, /var POS_DEMO_PIN = ['"]1234['"]/);
  assert.match(html, /function applyPosModeAccess\(/);
  assert.match(html, /managementTab\.hidden = isFrontDesk/);
  assert.match(html, /managementPanel\.hidden = isFrontDesk/);
  assert.match(html, /if \(isFrontDesk && activeTabId === ['"]management['"]\) activateTab\(['"]dispatch['"]\)/);
});

test('POS rejects direct Management activation for Front Desk mode', () => {
  assert.match(html, /if \(id === ['"]management['"] && getActiveStaff\(\)\.role === ['"]frontdesk['"]\) id = ['"]dispatch['"]/);
});
```

- [ ] **Step 2: Run the new test to verify it fails**

Run:

```bash
node --test html/pages/pos-phase-1.mode.test.cjs
```

Expected: FAIL because the page does not yet contain the mode-switch hooks or the Front Desk access functions. Do not modify the test to make it pass.

- [ ] **Step 3: Commit the failing test**

```bash
git add html/pages/pos-phase-1.mode.test.cjs
git commit -m "test: define POS mode switch contract"
```

### Task 2: Add the mode-switch UI and matching styles

**Files:**
- Modify: `html/pages/pos-phase-1.html:58-73` for mode button and modal styles.
- Modify: `html/pages/pos-phase-1.html:488-505` for the title badge, button, and modal markup.

**Interfaces:**
- Consumes: existing `.page-title-row`, `.pos-btn`, `.pos-chip`, `.sms-modal`, `.sms-dialog`, `.sms-mhead`, `.sms-mbody`, and `.sms-mfoot` styles.
- Produces: stable hooks consumed by the mode state/event logic: `data-pos-mode-open`, `data-pos-mode-modal`, `data-pos-role`, `data-pos-mode-pin`, `data-pos-mode-error`, `data-pos-mode-submit`, and `data-pos-mode-close`.

- [ ] **Step 1: Add the failing UI-specific assertions**

Extend `html/pages/pos-phase-1.mode.test.cjs` with:

```js
test('POS mode UI exposes a labelled badge and keyboard-friendly PIN controls', () => {
  assert.match(html, /data-pos-mode-badge-text/);
  assert.match(html, /id="pos-mode-title"/);
  assert.match(html, /id="pos-mode-pin"[^>]*type="password"/);
  assert.match(html, /id="pos-mode-pin"[^>]*inputmode="numeric"/);
  assert.match(html, /aria-labelledby="pos-mode-title"/);
});
```

- [ ] **Step 2: Run the focused test to verify the new assertions fail**

Run:

```bash
node --test html/pages/pos-phase-1.mode.test.cjs
```

Expected: FAIL on the new UI assertions.

- [ ] **Step 3: Add the title controls, modal markup, and styles**

Update the title row so the badge text can be replaced without losing its icon:

```html
<span class="pos-chip pos-chip-gold"><i class="bi bi-award-fill" aria-hidden="true"></i> <span data-pos-mode-badge-text>Owner · Brian</span></span>
<button class="pos-btn pos-btn-sm" type="button" data-pos-mode-open>
  <i class="bi bi-shuffle" aria-hidden="true"></i> Đổi mode
</button>
```

Add the modal after the title heading and before the first panel:

```html
<div class="sms-modal" data-pos-mode-modal role="dialog" aria-modal="true" aria-labelledby="pos-mode-title" aria-hidden="true">
  <div class="sms-dialog pos-mode-dialog">
    <div class="sms-mhead">
      <h2 id="pos-mode-title"><i class="bi bi-person-badge" aria-hidden="true"></i> Đổi mode POS</h2>
      <button class="pos-icon-btn" type="button" data-pos-mode-close aria-label="Đóng"><i class="bi bi-x-lg" aria-hidden="true"></i></button>
    </div>
    <div class="sms-mbody">
      <p class="pos-muted pos-mode-copy">Chọn tài khoản rồi nhập PIN để chuyển mode.</p>
      <div class="pos-mode-roles" role="list" aria-label="Chọn vai trò POS">
        <button class="pos-mode-role-card is-selected" type="button" role="listitem" data-pos-role="owner">
          <span class="pos-mode-role-avatar">👑</span><span class="pos-mode-role-name">Brian</span><span class="pos-mode-role-label">Owner</span>
        </button>
        <button class="pos-mode-role-card" type="button" role="listitem" data-pos-role="manager">
          <span class="pos-mode-role-avatar">🧑‍💼</span><span class="pos-mode-role-name">Mia</span><span class="pos-mode-role-label">Manager</span>
        </button>
        <button class="pos-mode-role-card" type="button" role="listitem" data-pos-role="frontdesk">
          <span class="pos-mode-role-avatar">💁</span><span class="pos-mode-role-name">Cindy</span><span class="pos-mode-role-label">Front Desk</span>
        </button>
      </div>
      <label class="pos-inline-lbl" for="pos-mode-pin">PIN</label>
      <input class="pos-input pos-mode-pin" id="pos-mode-pin" data-pos-mode-pin type="password" inputmode="numeric" maxlength="4" autocomplete="off" placeholder="Nhập PIN">
      <div class="pos-mode-error" data-pos-mode-error role="status" aria-live="polite" hidden></div>
    </div>
    <div class="sms-mfoot" style="justify-content:flex-end">
      <button class="pos-btn" type="button" data-pos-mode-close>Hủy</button>
      <button class="pos-btn pos-btn-primary" type="button" data-pos-mode-submit><i class="bi bi-check2" aria-hidden="true"></i> Xác nhận</button>
    </div>
  </div>
</div>
```

Add `.pos-mode-dialog`, `.pos-mode-roles`, `.pos-mode-role-card`, `.pos-mode-role-avatar`, `.pos-mode-role-name`, `.pos-mode-role-label`, `.pos-mode-copy`, `.pos-mode-pin`, and `.pos-mode-error` rules beside the existing SMS modal rules. The cards should use the existing border/surface variables, show a brand border/background when `.is-selected`, and collapse to one column below 480px. Keep the modal's existing `.open` display behavior.

- [ ] **Step 4: Run the focused test to verify the UI assertions pass and behavior assertions remain red**

Run:

```bash
node --test html/pages/pos-phase-1.mode.test.cjs
```

Expected: the markup/UI test passes; the state/access tests still fail because behavior has not been implemented.

- [ ] **Step 5: Commit the UI-only change**

```bash
git add html/pages/pos-phase-1.html html/pages/pos-phase-1.mode.test.cjs
git commit -m "feat: add POS mode switch modal"
```

### Task 3: Implement PIN validation, active role state, and tab gating

**Files:**
- Modify: `html/pages/pos-phase-1.html` inside the main inline script near the existing role state and tab activation code.

**Interfaces:**
- Consumes: `STAFF`, `ROLE_LBL`, `esc`, the modal hooks from Task 2, and existing `activateTab`.
- Produces: `POS_DEMO_PIN`, `activeStaffId`, `getActiveStaff()`, `applyPosModeAccess()`, modal open/close/submit handlers, and guarded `activateTab(id)` behavior used by tests and page navigation.

- [ ] **Step 1: Add the failing behavior assertion for the active badge update**

Extend `html/pages/pos-phase-1.mode.test.cjs` with:

```js
test('POS mode submission updates the active badge and validates the selected staff member', () => {
  assert.match(html, /var activeStaffId = ['"]owner['"]/);
  assert.match(html, /function getActiveStaff\(\)/);
  assert.match(html, /modePin\.value !== POS_DEMO_PIN/);
  assert.match(html, /activeStaffId = selectedStaffId/);
  assert.match(html, /modeBadge\.textContent = ROLE_LBL\[active\.role\] \+ ['"] · ['"] \+ active\.name/);
});
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run:

```bash
node --test html/pages/pos-phase-1.mode.test.cjs
```

Expected: FAIL because active-role state and submit handling do not exist.

- [ ] **Step 3: Add active-role state and access helpers**

Immediately after `ROLE_ACCESS`, add:

```js
var POS_DEMO_PIN = '1234';
var activeStaffId = 'owner';
var selectedStaffId = 'owner';
var activeTabId = 'dispatch';
function getActiveStaff() {
  return STAFF.find(function (staff) { return staff.id === activeStaffId; }) || STAFF[0];
}
```

Add the access function near the tab code. Cache the Management tab/panel with the existing selector helper and use `activateTab` when leaving a forbidden panel:

```js
function applyPosModeAccess() {
  var active = getActiveStaff();
  var isFrontDesk = active.role === 'frontdesk';
  var managementTab = $('[data-pos-tab="management"]');
  var managementPanel = $('[data-pos-panel="management"]');
  var modeBadge = $('[data-pos-mode-badge-text]');
  if (modeBadge) modeBadge.textContent = ROLE_LBL[active.role] + ' · ' + active.name;
  if (managementTab) {
    managementTab.hidden = isFrontDesk;
    managementTab.setAttribute('aria-hidden', String(isFrontDesk));
  }
  if (managementPanel) {
    managementPanel.hidden = isFrontDesk;
    managementPanel.setAttribute('aria-hidden', String(isFrontDesk));
  }
  if (isFrontDesk && activeTabId === 'management') activateTab('dispatch');
}
```

- [ ] **Step 4: Add modal open, selection, close, and submit handlers**

Add the following functions near the other page-level modal handlers:

```js
var modeModal = $('[data-pos-mode-modal]');
var modePin = $('[data-pos-mode-pin]');
var modeError = $('[data-pos-mode-error]');
var modeBadge = $('[data-pos-mode-badge-text]');

function setModeError(message) {
  modeError.textContent = message || '';
  modeError.hidden = !message;
}

function selectModeRole(role) {
  var selected = STAFF.find(function (staff) { return staff.role === role && ['owner', 'manager', 'frontdesk'].indexOf(staff.role) !== -1; });
  if (!selected) return;
  selectedStaffId = selected.id;
  document.querySelectorAll('[data-pos-role]').forEach(function (card) {
    card.classList.toggle('is-selected', card.getAttribute('data-pos-role') === selected.role);
  });
  setModeError('');
}

function openModeModal() {
  selectedStaffId = activeStaffId;
  var active = getActiveStaff();
  document.querySelectorAll('[data-pos-role]').forEach(function (card) {
    card.classList.toggle('is-selected', card.getAttribute('data-pos-role') === active.role);
  });
  modePin.value = '';
  setModeError('');
  modeModal.classList.add('open');
  modeModal.setAttribute('aria-hidden', 'false');
  setTimeout(function () { modePin.focus(); }, 0);
}

function closeModeModal() {
  modeModal.classList.remove('open');
  modeModal.setAttribute('aria-hidden', 'true');
  setModeError('');
}

function submitModeSwitch() {
  var selected = STAFF.find(function (staff) { return staff.id === selectedStaffId; });
  if (!selected) { setModeError('Hãy chọn một tài khoản.'); return; }
  if (modePin.value !== POS_DEMO_PIN) {
    setModeError('PIN không đúng. PIN demo là 1234.');
    modePin.focus();
    return;
  }
  activeStaffId = selectedStaffId;
  applyPosModeAccess();
  closeModeModal();
}
```

Use one delegated `click` listener and one `keydown` branch for this modal, consistent with the page's existing delegated handlers:

```js
document.addEventListener('click', function (e) {
  if (e.target.closest('[data-pos-mode-open]')) { openModeModal(); return; }
  var roleCard = e.target.closest('[data-pos-role]');
  if (roleCard) { selectModeRole(roleCard.getAttribute('data-pos-role')); return; }
  if (e.target.closest('[data-pos-mode-submit]')) { submitModeSwitch(); return; }
  if (e.target.closest('[data-pos-mode-close]') || e.target === modeModal) closeModeModal();
});
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && modeModal.classList.contains('open')) closeModeModal();
  if (e.key === 'Enter' && modeModal.classList.contains('open') && document.activeElement === modePin) submitModeSwitch();
});
```

- [ ] **Step 5: Guard tab activation and initialize access state**

Update the existing tab function as follows:

```js
function activateTab(id) {
  if (id === 'management' && getActiveStaff().role === 'frontdesk') id = 'dispatch';
  if (TABS.indexOf(id) === -1) id = TABS[0];
  activeTabId = id;
  // keep the existing tab/panel class toggles, URL update, renders, and shell sync below
}
```

Call `applyPosModeAccess()` before the initial URL-driven `activateTab(...)` call so a direct Management URL cannot display the hidden panel. Keep the existing `renderManagement()` boot call because the panel remains available for Owner/Manager and its current render behavior is unchanged.

- [ ] **Step 6: Run the focused tests to verify they pass**

Run:

```bash
node --test html/pages/pos-phase-1.mode.test.cjs
```

Expected: all mode-switch tests pass.

- [ ] **Step 7: Commit the behavior change**

```bash
git add html/pages/pos-phase-1.html html/pages/pos-phase-1.mode.test.cjs
git commit -m "feat: gate POS management by active role"
```

### Task 4: Run the full POS regression suite and inspect the final diff

**Files:**
- Verify: `html/pages/pos-phase-1.html`
- Verify: `html/pages/pos-phase-1.mode.test.cjs`
- Verify: `html/pages/pos-phase-1.appointments.test.cjs`

**Interfaces:**
- Consumes: the complete mode-switch implementation and all existing POS appointment contracts.
- Produces: fresh verification evidence that the new feature and existing POS behaviors coexist.

- [ ] **Step 1: Run both POS test files**

```bash
node --test html/pages/pos-phase-1.mode.test.cjs html/pages/pos-phase-1.appointments.test.cjs
```

Expected: all tests pass with zero failures.

- [ ] **Step 2: Run the repository's available JavaScript tests**

```bash
node --test html/pages/*.test.cjs
```

Expected: all discovered page tests pass. If an unrelated pre-existing test fails, report its exact test and output separately; do not alter unrelated files.

- [ ] **Step 3: Check the diff and source formatting**

```bash
git diff --check HEAD~2..HEAD
git status --short
```

Expected: no whitespace errors; only the intended POS files plus the already-existing unrelated worktree changes are present.

- [ ] **Step 4: Manually verify the acceptance flow**

Serve the workspace using the repository's existing local server, open `html/pages/pos-phase-1.html`, and verify:

1. `Đổi mode` opens the role/PIN modal.
2. Cindy + PIN `1234` updates the badge and removes Management from the tab strip.
3. A direct `?tab=management` URL while Front Desk is active lands on Operations with no Management panel visible.
4. Brian + PIN `1234` restores the Management tab.
5. Incorrect PIN leaves the current mode unchanged and shows the inline error.
