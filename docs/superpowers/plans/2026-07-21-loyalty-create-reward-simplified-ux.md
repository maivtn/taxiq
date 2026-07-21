# Loyalty Create Reward Simplified UX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the three-step Create Reward wizard with one scannable form while preserving reward creation, editing, preview, validation, and points-redemption data.

**Architecture:** Keep the existing Reward Catalog builder and draft model. Replace the hidden wizard panels with one responsive two-column layout: grouped form sections on the left and the live preview on the right. Simplify the controller by removing wizard navigation state/listeners and validating the complete form from the single publish action.

**Tech Stack:** Static HTML/CSS, inline browser JavaScript, Node.js `node:test`, `vm.Script` syntax validation.

## Global Constraints

- Earn Rules stays unchanged.
- Reward Catalog remains focused on redeeming Available Points; do not add earning triggers, review windows, or delivery channels.
- Keep all existing reward fields and `getRewardDraft()` data flow.
- Keep keyboard support for reward type selection and native labels/controls.
- Do not change the unrelated AI Offers content already present in the page.

---

### Task 1: Add failing tests for the single-screen builder

**Files:**
- Modify: `html/pages/salon-setup-reward.test.mjs:80-100`
- Test: `html/pages/salon-setup-reward.test.mjs`

**Interfaces:**
- Consumes: the existing `source()` helper and Reward Catalog markup.
- Produces: regression coverage for the single-screen builder contract used by the HTML and controller changes.

- [ ] **Step 1: Write the failing test**

Add this test after the existing redemption-settings test:

```js
test('uses a single-screen Create Reward form', () => {
  const html = source();
  assert.match(html, /data-reward-form/);
  assert.match(html, /data-reward-section="details"/);
  assert.match(html, /data-reward-section="redemption"/);
  assert.match(html, /data-reward-section="availability"/);
  assert.match(html, /data-reward-preview/);
  assert.match(html, /<button class="btn g" type="button" data-publish-reward>Publish Reward<\/button>/);
  assert.doesNotMatch(html, /data-reward-steps|data-wizard-step|data-wizard-next|data-wizard-back|data-wizard-save/);
  assert.doesNotMatch(html, />3 steps<|>Continue <|>Back<\/button>/);
});
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `node --test html/pages/salon-setup-reward.test.mjs`

Expected: FAIL because the current markup still contains `data-reward-steps`, `data-wizard-step`, and a hidden publish button.

### Task 2: Replace wizard markup with grouped single-screen layout

**Files:**
- Modify: `html/pages/salon-setup-reward.html:919-937`
- Modify: `html/pages/salon-setup-reward.html:6884-6976`

**Interfaces:**
- Consumes: existing reward input selectors, preview selectors, and `data-reward-builder` visibility behavior.
- Produces: `data-reward-form`, `data-reward-section="details|redemption|availability"`, and `data-reward-preview` elements consumed by tests and retained controller logic.

- [ ] **Step 1: Add responsive single-screen layout styles**

Replace the multi-step wizard CSS with these rules:

```css
.reward-proto .reward-create-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(300px, 0.75fr);
  gap: 14px;
  align-items: start;
}
.reward-proto .reward-create-form { display: grid; gap: 14px; }
.reward-proto .reward-create-preview { position: sticky; top: 16px; }
.reward-proto .reward-create-actions { display: flex; justify-content: flex-end; gap: 10px; }
@media (max-width: 800px) {
  .reward-proto .reward-create-layout { grid-template-columns: 1fr; }
  .reward-proto .reward-create-preview { position: static; }
}
```

Keep the existing `.rewardType`, `.form2`, `.line`, switch, and invalid-field styles. Remove only `.reward-steps`, `.reward-step`, `.reward-step-bar`, `.reward-wizard-step`, `.reward-wizard-nav`, and their obsolete responsive rules.

- [ ] **Step 2: Replace the builder header and step wrappers**

Inside `<div data-reward-builder hidden>`, keep the catalog back button, then use a `card` containing a `reward-create-layout` with `data-reward-form`. Put the three field cards in a `reward-create-form` column, put the existing live preview in an `aside` with `data-reward-preview`, and put one visible `data-publish-reward` button in `reward-create-actions` at the bottom of the form. The create chip reads `Reward Catalog`; `setCreateMode()` changes it to `Editing` in edit mode.

- [ ] **Step 3: Move the existing fields into three named sections**

Keep every existing input/select and its `data-*` selector, but remove the three `data-wizard-step` wrappers and step labels. Place the current contents under:

```html
<section class="card" data-reward-section="details">...</section>
<section class="card" data-reward-section="redemption">...</section>
<section class="card" data-reward-section="availability">...</section>
```

Move the existing preview card into the `aside` and keep `data-preview-type`, `data-preview-title`, `data-preview-points`, `data-preview-value`, `data-preview-expiry`, `data-preview-minimum-spend`, and `data-preview-maximum-discount` unchanged.

- [ ] **Step 4: Run the focused test to verify the markup passes**

Run: `node --test html/pages/salon-setup-reward.test.mjs`

Expected: the new single-screen test passes; any remaining failures should be limited to obsolete wizard-controller assertions until Task 3 is complete.

### Task 3: Remove wizard controller state and keep one publish flow

**Files:**
- Modify: `html/pages/salon-setup-reward.html:9510-10025`

**Interfaces:**
- Consumes: the unchanged reward input/preview selectors and `getRewardDraft()`.
- Produces: create/edit behavior driven by `data-publish-reward`, with `validateRewardForm()` as the single validation entry point.

- [ ] **Step 1: Add complete-form validation**

Keep `validateRewardStep1()` and `validateRewardRules()` as field-level validators and add:

```js
function validateRewardForm() {
  return validateRewardStep1() && validateRewardRules();
}
```

- [ ] **Step 2: Remove wizard state and navigation listeners**

Delete `WIZARD_STEPS`, `currentWizardStep`, `updateWizardNav()`, `setWizardStep()`, the `data-wizard-next`, `data-wizard-back`, `data-wizard-save`, and `data-step-go` listeners, plus every call to `setWizardStep()`.

Update `setCreateMode(editing)` so it only sets the title, create/edit chip, and the publish button text:

```js
function setCreateMode(editing) {
  var titleEl = document.querySelector('[data-create-title]');
  var stepEl = document.querySelector('[data-create-step]');
  var publishButton = document.querySelector('[data-publish-reward]');
  if (titleEl) titleEl.textContent = editing ? 'Edit Reward' : 'Create Reward';
  if (stepEl) stepEl.textContent = editing ? 'Editing' : 'Reward Catalog';
  if (publishButton) publishButton.textContent = editing ? 'Save Changes' : 'Publish Reward';
}
```

Remove the now-unused `updateWizardNav()` call from `setCreateMode()`, and remove `setWizardStep(1)` from reset, edit, and initialization paths. Keep `showRewardBuilder()`, `activateMainTab()`, `getRewardDraft()`, create/edit rendering, and confirmation behavior unchanged.

- [ ] **Step 3: Route Publish/Save through complete validation**

Change the start of `confirmAndCreateReward()` to:

```js
function confirmAndCreateReward() {
  if (!validateRewardForm()) return;
  var editing = !!editingProgram;
  // keep the existing confirmation and finalizeReward flow below
```

Keep the existing confirmation dialog and `finalizeReward()` implementation. The single publish button remains visible in both create and edit modes.

- [ ] **Step 4: Run tests and syntax checks**

Run:

```bash
node --test html/pages/salon-setup-reward.test.mjs
node --input-type=module -e "import fs from 'node:fs'; import vm from 'node:vm'; const html=fs.readFileSync('html/pages/salon-setup-reward.html','utf8'); const scripts=[...html.matchAll(/<script(?:\\s[^>]*)?>([\\s\\S]*?)<\\/script>/gi)].map(m=>m[1]).filter(s=>s.trim()); scripts.forEach((script,index)=>new vm.Script(script,{filename:'inline-script-'+(index+1)+'.js'})); console.log('inline scripts syntax: OK ('+scripts.length+')');"
git diff --check
```

Expected: all tests pass, both inline scripts parse, and `git diff --check` returns no output.

### Task 4: Review the final diff and hand off

**Files:**
- Review: `html/pages/salon-setup-reward.html`
- Review: `html/pages/salon-setup-reward.test.mjs`
- Review: `docs/superpowers/specs/2026-07-21-loyalty-create-reward-simplified-ux-design.md`

- [ ] **Step 1: Confirm scope**

Run `git status --short` and verify only the planned Reward Catalog files are modified; do not stage unrelated AI Offers changes if they appear in the worktree.

- [ ] **Step 2: Confirm requirements**

Check that the diff contains no `data-wizard-step`, `data-wizard-next`, `data-wizard-back`, or `data-reward-steps`, while Earn Rules and the reward draft fields remain intact.

- [ ] **Step 3: Report verification**

Summarize the one-screen UX change, list the modified files, and report the exact test and syntax-check results without claiming browser verification unless it was actually run.
