# Loyalty Reward Catalog Separation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Keep `Earn Rules` unchanged while removing the points-earning `Bonus Points` type from the points-redemption Reward Catalog wizard.

**Architecture:** This is a markup-only separation in the existing single-file Loyalty prototype. `Earn Rules` remains the owner of points-earning configuration; the Reward Catalog keeps its existing state machine and redemption types, with only the `Bonus Points` option removed from its type picker. A static source test will protect the boundary.

**Tech Stack:** Static HTML, inline CSS/JavaScript, Node.js built-in `node:test`, `node:assert/strict`.

## Global Constraints

- Keep the `Earn Rules` tab, labels, layout, fields, and behavior unchanged.
- Keep Reward Catalog navigation, catalog cards, filters, edit/pause actions, and preview behavior unchanged.
- Do not add a data model, rename tabs, or change the reward creation state machine.
- Existing redemption types remain Dollar Credit, Percent Off, and Free Add-on.

---

### Task 1: Remove points earning from the Reward Catalog type picker

**Files:**
- Modify: `html/pages/salon-setup-reward.html:6826-6830`
- Test: `html/pages/salon-setup-reward.test.mjs:29-38`

**Interfaces:**
- Consumes: existing `data-reward-type` picker behavior and Reward Catalog wizard markup.
- Produces: a Reward Catalog type picker containing only redemption types; `Earn Rules` remains unchanged.

- [x] **Step 1: Write the failing source-boundary test**

Add this test after `keeps the existing reward builder inside Reward Catalog` in `html/pages/salon-setup-reward.test.mjs`:

```js
test('keeps points-earning Bonus Points out of the Reward Catalog picker', () => {
  const html = source();
  const rewardCatalog = html.match(/id="panel-reward-catalog"[\s\S]*?(?=\n            <section class="tab-panel" id="panel-customers")/);
  assert.ok(rewardCatalog, 'missing Reward Catalog panel');
  assert.match(rewardCatalog[0], /data-reward-type[^>]*data-reward-value="\$5"/);
  assert.match(rewardCatalog[0], /data-reward-type[^>]*data-reward-value="15%"/);
  assert.match(rewardCatalog[0], /data-reward-type[^>]*data-reward-value="Free add-on"/);
  assert.doesNotMatch(rewardCatalog[0], /<b>Bonus Points<\/b>/);
  assert.match(html, /<h3>Bonus events<\/h3>/);
});
```

- [x] **Step 2: Run the focused test and verify it fails**

Run:

```bash
node --test --test-name-pattern="keeps points-earning Bonus Points out" html/pages/salon-setup-reward.test.mjs
```

Expected: FAIL because the Reward Catalog currently renders `<b>Bonus Points</b>`.

- [x] **Step 3: Remove only the `Bonus Points` option**

In the Step 1 Reward Details picker in `html/pages/salon-setup-reward.html`, delete only this element:

```html
<div class="rewardType" role="button" tabindex="0" data-reward-type data-reward-value="50 pts" data-reward-title="Earn Bonus Points"><b>Bonus Points</b><p class="muted">Reward points</p></div>
```

Do not change the `Earn Rules` `Bonus events` card or any other Reward Catalog markup.

- [x] **Step 4: Run focused and full tests**

Run:

```bash
node --test --test-name-pattern="keeps points-earning Bonus Points out|existing reward builder|six synchronized loyalty management tabs" html/pages/salon-setup-reward.test.mjs
node --test html/pages/salon-setup-reward.test.mjs
git diff --check
```

Expected: the focused test and all existing salon reward tests pass, and `git diff --check` produces no output.

- [x] **Step 5: Review the final diff**

Run:

```bash
git diff -- html/pages/salon-setup-reward.html html/pages/salon-setup-reward.test.mjs
```

Confirm the diff removes exactly one Reward Catalog option and adds only the boundary test; no `Earn Rules` markup or navigation labels changed.
