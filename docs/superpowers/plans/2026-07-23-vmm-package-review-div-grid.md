# VMM Package Review Div Grid Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the VMM package review list with a polished responsive `div` card grid and apply the `Aug 20, 2026` date rule.

**Architecture:** Keep the existing `.vmm-package-review` wrapper, dynamic element IDs, and `renderPackageReview()` behavior. Replace only the list markup and list-specific CSS with a two-column grid of reusable `div` items that collapses to one column below 520px.

**Tech Stack:** Standalone HTML, scoped CSS, vanilla JavaScript, and Node.js `node:test` source regression checks.

## Global Constraints

- Use only `div` elements inside `.vmm-package-review`; no `ul`, `ol`, or `li` elements.
- Preserve the six dynamic IDs: `reviewDepositAmount`, `reviewRewardAmount`, `reviewPeriod`, `reviewStartDate`, `reviewEndDate`, and `reviewRemainingBalance`.
- Display review dates as `Aug 20, 2026` and `Aug 20, 2029`.
- Keep package selection, reward calculation, balance validation, Terms modal, and confirmation logic unchanged.
- Do not modify unrelated files or pre-existing user changes.

---

### Task 1: Update the regression contract first

**Files:**
- Modify: `html/vmm3y/vmm-3-year-program-embed-tabs.test.mjs`
- Test: `html/vmm3y/vmm-3-year-program-embed-tabs.test.mjs`

**Interfaces:**
- Consumes: the target HTML source.
- Produces: assertions for div-grid markup, six review items, preserved IDs, and the two approved dates.

- [ ] **Step 1: Extend the test with the new structure and dates**

Add these assertions after the existing dynamic-hook assertions:

```js
assert.match(html, /class="vmm-package-review-grid"/);
assert.equal((html.match(/class="vmm-package-review-item"/g) || []).length, 6);
assert.doesNotMatch(html, /<ul\b|<ol\b|<li\b/);
assert.match(html, /id="reviewStartDate">Aug 20, 2026</n);
assert.match(html, /id="reviewEndDate">Aug 20, 2029</n);
assert.match(html, /\.vmm-package-review-grid\s*\{/);
assert.match(html, /grid-template-columns:\s*repeat\(2,/);
```

- [ ] **Step 2: Run the test to verify RED**

Run:

```bash
node --test html/vmm3y/vmm-3-year-program-embed-tabs.test.mjs
```

Expected: `FAIL` because the current review still contains `ul/li`, the grid class is absent, and the dates are still `01/09/2026` and `01/09/2029`.

### Task 2: Replace list markup and render dates

**Files:**
- Modify: `html/vmm3y/vmm-3-year-program-embed-tabs.html:1771-1837` for review styles.
- Modify: `html/vmm3y/vmm-3-year-program-embed-tabs.html:2558-2568` for review markup.
- Modify: `html/vmm3y/vmm-3-year-program-embed-tabs.html:2975-2976` for rendered date values.

**Interfaces:**
- Consumes: the existing review IDs and `renderPackageReview()` helper.
- Produces: six `.vmm-package-review-item` divs with unchanged IDs and date copy matching the approved rule.

- [ ] **Step 1: Replace list-specific CSS with grid/card CSS**

Replace the `.vmm-package-review-list`, `.vmm-package-review-list li`, marker, strong, and media-query rules with:

```css
#vmm-program-root .vmm-package-review-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

#vmm-program-root .vmm-package-review-item {
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  min-height: 64px;
  padding: 12px 13px;
  border: 1px solid #e5ebf3;
  border-radius: 10px;
  background: #ffffff;
}

#vmm-program-root .vmm-package-review-label {
  color: #7b8899;
  font-size: 11px;
  font-weight: 700;
  line-height: 1.3;
}

#vmm-program-root .vmm-package-review-value {
  color: var(--vmm-reference-heading);
  font-size: 13px;
  font-weight: 900;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

@media (max-width: 520px) {
  #vmm-program-root .vmm-package-review-grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 2: Replace `ul/li` markup with `div` items**

Replace the current review list with:

```html
<div class="vmm-package-review-grid">
  <div class="vmm-package-review-item">
    <span class="vmm-package-review-label">Số VMM ký gửi</span>
    <strong class="vmm-package-review-value" id="reviewDepositAmount">—</strong>
  </div>
  <div class="vmm-package-review-item">
    <span class="vmm-package-review-label">VMM IOU được tặng</span>
    <strong class="vmm-package-review-value" id="reviewRewardAmount">—</strong>
  </div>
  <div class="vmm-package-review-item">
    <span class="vmm-package-review-label">Thời hạn</span>
    <strong class="vmm-package-review-value" id="reviewPeriod">3 năm</strong>
  </div>
  <div class="vmm-package-review-item">
    <span class="vmm-package-review-label">Ngày bắt đầu</span>
    <strong class="vmm-package-review-value" id="reviewStartDate">Aug 20, 2026</strong>
  </div>
  <div class="vmm-package-review-item">
    <span class="vmm-package-review-label">Ngày hoàn tất dự kiến</span>
    <strong class="vmm-package-review-value" id="reviewEndDate">Aug 20, 2029</strong>
  </div>
  <div class="vmm-package-review-item">
    <span class="vmm-package-review-label">Số dư VMM còn lại</span>
    <strong class="vmm-package-review-value" id="reviewRemainingBalance">—</strong>
  </div>
</div>
```

- [ ] **Step 3: Update the dynamic date values**

In `renderPackageReview()`, replace the two assignments with:

```js
reviewStartDate.textContent = 'Aug 20, 2026';
reviewEndDate.textContent = 'Aug 20, 2029';
```

- [ ] **Step 4: Run the regression test and syntax check**

Run:

```bash
node --test html/vmm3y/vmm-3-year-program-embed-tabs.test.mjs
node --check <(sed -n '/^  <script>$/,/^  <\/script>$/p' html/vmm3y/vmm-3-year-program-embed-tabs.html | sed '1d;$d')
```

Expected: one passing test and a syntax-check exit code of `0`.

### Task 3: Verify responsive rendering and scope

**Files:**
- Verify: `html/vmm3y/vmm-3-year-program-embed-tabs.html`

- [ ] **Step 1: Verify the rendered grid in Chrome**

At a wide viewport, confirm `.vmm-package-review-grid` has two columns and six cards. At a viewport below 520px, confirm it has one column. Confirm the initial review shows `Aug 20, 2026` and `Aug 20, 2029`, and changing the package still updates the amount, reward, and remaining balance IDs.

- [ ] **Step 2: Review diff and commit**

Run:

```bash
git diff --check
git status --short
git add html/vmm3y/vmm-3-year-program-embed-tabs.html html/vmm3y/vmm-3-year-program-embed-tabs.test.mjs
git commit -m "refactor: polish VMM package review grid"
```

Expected: no whitespace errors; only the target HTML and its regression test are staged for this change.
