# Loyalty Reward Quick Create UX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Create Reward faster by exposing core fields first, hiding advanced controls behind accessible disclosures, showing only relevant contextual fields, and keeping a compact confirmation modal.

**Architecture:** Preserve the existing one-screen Reward Catalog builder and draft model. Use native `<details>/<summary>` for advanced settings, add `updateRewardContext()` for reward-type-specific rows and labels, and replace the confirmation modal's full preview clone with a summary generated from `getRewardDraft()`.

**Tech Stack:** Static HTML/CSS, inline browser JavaScript, native HTML disclosures, Node.js `node:test`, `vm.Script` syntax validation.

## Global Constraints

- Earn Rules stays unchanged.
- Reward Catalog remains focused on redeeming Available Points; do not add earning triggers, review windows, or delivery channels.
- The second confirmation modal remains mandatory for create and edit.
- Keep all existing reward fields, selectors, and `getRewardDraft()` data flow.
- Existing values remain populated when editing, even while advanced sections are collapsed.
- Keep keyboard support for reward type selection and native labels/controls.
- Do not change unrelated AI Offers content.

---

### Task 1: Add failing tests for Quick Create behavior

**Files:**
- Modify: `html/pages/salon-setup-reward.test.mjs:94-108`

**Interfaces:**
- Consumes: the existing `source()` helper and Reward Catalog HTML/inline controller.
- Produces: regression coverage for progressive disclosure, contextual fields, and modal summary copy.

- [ ] **Step 1: Write the failing tests**

Add after the current single-screen builder test:

```js
test('uses progressive disclosure for advanced reward settings', () => {
  const html = source();
  assert.match(html, /<details class="reward-disclosure" data-reward-advanced="redemption">/);
  assert.match(html, /<summary>More redemption rules<\/summary>/);
  assert.match(html, /<details class="reward-disclosure" data-reward-advanced="availability">/);
  assert.match(html, /<summary>Availability &amp; limits<\/summary>/);
  assert.doesNotMatch(html, /data-reward-advanced="redemption" open|data-reward-advanced="availability" open/);
  assert.match(html, /data-reward-contextual="minimum-spend"/);
  assert.match(html, /data-reward-contextual="maximum-discount"/);
  assert.match(html, /function updateRewardContext\(\)/);
});

test('keeps the second confirmation modal as a compact summary', () => {
  const html = source();
  assert.match(html, /function buildRewardConfirmationHTML\(draft\)/);
  assert.match(html, /Back &amp; edit|Back & edit/);
  assert.match(html, /confirmButtonText: editing \? 'Save changes' : 'Confirm & create'/);
  assert.match(html, /html: buildRewardConfirmationHTML\(draft\)/);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test html/pages/salon-setup-reward.test.mjs`

Expected: the existing 12 tests pass and these two new tests fail because the disclosure elements, contextual controller, and summary builder do not yet exist.

### Task 2: Make the form progressive and contextual

**Files:**
- Modify: `html/pages/salon-setup-reward.html:920-928`
- Modify: `html/pages/salon-setup-reward.html:6878-6945`

**Interfaces:**
- Consumes: existing `data-reward-*` inputs and `rewardTypeCards` selection state.
- Produces: `data-reward-advanced`, `data-reward-contextual`, and `data-reward-value-label` hooks consumed by the controller.

- [ ] **Step 1: Add disclosure styles**

Add these styles after the existing Quick Create layout styles:

```css
.reward-proto .reward-disclosure { border: 1px solid var(--line); border-radius: 16px; background: #fff; }
.reward-proto .reward-disclosure summary { cursor: pointer; list-style: none; padding: 14px 16px; font-weight: 900; }
.reward-proto .reward-disclosure summary::-webkit-details-marker { display: none; }
.reward-proto .reward-disclosure summary::after { content: '+'; float: right; color: var(--muted); font-size: 20px; line-height: 1; }
.reward-proto .reward-disclosure[open] summary::after { content: '−'; }
.reward-proto .reward-disclosure-body { border-top: 1px solid var(--line); padding: 0 16px 16px; }
.reward-proto .reward-contextual-row[hidden] { display: none; }
```

Keep existing `.rewardType`, `.form2`, `.line`, switch, and invalid-field styles.

- [ ] **Step 2: Move minimum/maximum rules into the core section**

After the core form fields, add:

```html
<div class="grid g2 reward-contextual-rules">
  <div class="line reward-contextual-row" data-reward-contextual="minimum-spend">
    <span>Minimum spend</span><input value="$0" data-reward-minimum-spend-input>
  </div>
  <div class="line reward-contextual-row" data-reward-contextual="maximum-discount" hidden>
    <span>Maximum discount</span><input value="" placeholder="Required for percent discounts" data-reward-maximum-discount-input>
  </div>
</div>
```

Change the existing value label to `<label data-reward-value-label>Reward Value / Linked Item</label>`.

- [ ] **Step 3: Wrap advanced controls in native disclosures**

Replace the always-visible redemption/availability cards with these structures, keeping every existing input/select selector inside the matching body:

```html
<details class="reward-disclosure" data-reward-advanced="redemption">
  <summary>More redemption rules</summary>
  <div class="reward-disclosure-body">
    <div class="grid g2">
      <div class="line"><span>Eligible services</span><select data-reward-eligible-services-select><option>All services</option><option>Selected services</option><option>Service add-ons only</option></select></div>
      <div class="line"><span>Valid locations</span><select data-reward-valid-locations-select><option>Bitcoin Nail Bar</option><option>All locations</option></select></div>
      <div class="line"><span>Combine promotions</span><label class="switch"><input type="checkbox" data-reward-stack-input><span class="switch-track"></span></label></div>
      <div class="line"><span>Use with membership</span><label class="switch"><input type="checkbox" checked data-reward-membership-input><span class="switch-track"></span></label></div>
      <div class="line"><span>Customer limit</span><input value="1" data-reward-usage-limit-rules-input></div>
      <div class="line"><span>Issued reward validity</span><select data-reward-validity-select><option>Use before expiration</option><option>30 days after issue</option><option>60 days after issue</option></select></div>
    </div>
  </div>
</details>
<details class="reward-disclosure" data-reward-advanced="availability">
  <summary>Availability &amp; limits</summary>
  <div class="reward-disclosure-body">
    <div class="form2">
      <div class="field"><label>Customer segment</label><select data-reward-audience-select><option>All Customers</option><option>New Customers</option><option>VIP</option><option>Inactive 30+ Days</option></select></div>
      <div class="field"><label>Status</label><select data-reward-status-select><option value="active">Active</option><option value="paused">Paused</option></select></div>
    </div>
    <div class="grid g2" style="margin-top:12px">
      <div class="line"><span>Quantity limit</span><input value="Unlimited" data-reward-quantity-limit-input></div>
      <div class="line"><span>Budget limit</span><input value="Unlimited" data-reward-budget-limit-input></div>
    </div>
  </div>
</details>
```

Do not add `open`; defaults remain collapsed. Hidden contextual inputs retain their values for `getRewardDraft()` and edit mode.

- [ ] **Step 4: Run the focused tests**

Run: `node --test html/pages/salon-setup-reward.test.mjs`

Expected: the progressive-disclosure test passes; the modal-summary test remains failing until Task 3.

### Task 3: Add contextual behavior and compact confirmation summary

**Files:**
- Modify: `html/pages/salon-setup-reward.html:9450-9980`

**Interfaces:**
- Consumes: active reward type key, existing input references, `escapeHtml()`, and `getRewardDraft()`.
- Produces: `updateRewardContext()`, `buildRewardConfirmationHTML(draft)`, and the existing create/edit confirmation flow.

- [ ] **Step 1: Add contextual reward behavior**

Add near `updateRewardPreview()`:

```js
function updateRewardContext() {
  var activeType = document.querySelector('[data-reward-builder] [data-reward-type].active');
  var typeKey = activeType ? activeType.dataset.rewardTypeKey : '';
  var minimumRow = document.querySelector('[data-reward-contextual="minimum-spend"]');
  var maximumRow = document.querySelector('[data-reward-contextual="maximum-discount"]');
  var valueLabel = document.querySelector('[data-reward-value-label]');
  if (minimumRow) minimumRow.hidden = typeKey !== 'dollar_discount' && typeKey !== 'percent_discount';
  if (maximumRow) maximumRow.hidden = typeKey !== 'percent_discount';
  if (valueLabel) valueLabel.textContent = typeKey === 'free_service'
    ? 'Linked service'
    : typeKey === 'free_product' ? 'Linked product' : 'Reward Value / Linked Item';
}
```

Call it from `updateRewardPreview()`, after `selectRewardType()`, and after `startEditProgram()` selects the stored type.

- [ ] **Step 2: Add the compact summary builder**

Add near `buildPreviewHTML()`:

```js
function buildRewardConfirmationHTML(draft) {
  var rows = [['Type', draft.type], ['Points cost', draft.pointsCost + ' points'], ['Value', draft.value], ['Expires', draft.expiry]];
  if (draft.minimumSpend && draft.minimumSpend !== '$0') rows.push(['Minimum spend', draft.minimumSpend]);
  if (draft.maximumDiscount) rows.push(['Maximum discount', draft.maximumDiscount]);
  return '<div class="reward-confirm-summary"><h3>' + escapeHtml(draft.name) + '</h3>' +
    '<p class="muted">Ready to publish in Reward Catalog</p>' +
    rows.map(function(row) { return '<div class="line"><span>' + escapeHtml(row[0]) + '</span><b>' + escapeHtml(row[1]) + '</b></div>'; }).join('') +
    '</div>';
}
```

- [ ] **Step 3: Keep the modal and change only its content/copy**

Update `confirmAndCreateReward()` to call `getRewardDraft()` once and keep the second modal:

```js
function confirmAndCreateReward() {
  if (!validateRewardForm()) return;
  var draft = getRewardDraft();
  var editing = !!editingProgram;
  if (typeof Swal === 'undefined') { finalizeReward(); return; }
  Swal.fire({
    title: editing ? 'Save changes to this reward?' : 'Create this reward?',
    html: buildRewardConfirmationHTML(draft),
    showCancelButton: true,
    confirmButtonText: editing ? 'Save changes' : 'Confirm & create',
    cancelButtonText: 'Back & edit',
    confirmButtonColor: '#7048f4',
    cancelButtonColor: '#98a2b3',
    width: 440
  }).then(function(result) { if (result && result.isConfirmed) finalizeReward(); });
}
```

Keep `finalizeReward()` as the source of truth for persistence.

- [ ] **Step 4: Run tests and syntax checks**

Run:

```bash
node --test html/pages/salon-setup-reward.test.mjs
node --input-type=module -e "import fs from 'node:fs'; import vm from 'node:vm'; const html=fs.readFileSync('html/pages/salon-setup-reward.html','utf8'); const scripts=[...html.matchAll(/<script(?:\\s[^>]*)?>([\\s\\S]*?)<\\/script>/gi)].map(m=>m[1]).filter(s=>s.trim()); scripts.forEach((script,index)=>new vm.Script(script,{filename:'inline-script-'+(index+1)+'.js'})); console.log('inline scripts syntax: OK ('+scripts.length+')');"
git diff --check
```

Expected: all tests pass, both inline scripts parse, and `git diff --check` returns no output.

### Task 4: Review scope and hand off

**Files:**
- Review: `html/pages/salon-setup-reward.html`
- Review: `html/pages/salon-setup-reward.test.mjs`
- Review: `docs/superpowers/specs/2026-07-21-loyalty-reward-quick-create-ux-design.md`

- [ ] **Step 1: Confirm the final UX contract**

Run `rg -n "data-reward-advanced|data-reward-contextual|buildRewardConfirmationHTML|Back & edit|data-reward-trigger|After Verified Review|Review Window" html/pages/salon-setup-reward.html` and verify advanced controls are disclosures, the summary modal is wired, and no earning-trigger terms entered Reward Catalog.

- [ ] **Step 2: Confirm working-tree scope**

Run `git status --short` and stage only the planned Reward Catalog page/test changes; do not alter unrelated files.

- [ ] **Step 3: Report verification**

Summarize the Quick Create changes, confirm the second modal remains, and report exact test/syntax results without claiming browser verification unless it was actually run.
