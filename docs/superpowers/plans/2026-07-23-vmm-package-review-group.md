# VMM Package Review Group Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Vietnamese, dynamically updated package-review group below the VMM purchase fields after a package is selected.

**Architecture:** Reuse the existing `reviewArea`, `selectedTier`, `walletBalance`, Terms modal, and `confirmDeposit` action in the single embedded HTML file. Add a scoped review card with stable element IDs, then centralize its values in a `renderPackageReview()` helper called whenever the selected tier or wallet balance changes.

**Tech Stack:** Standalone HTML, scoped CSS, vanilla JavaScript, Bootstrap 5 CDN already used by the target file, Node.js `node:test` for a source-level regression contract, and `node --check` for JavaScript syntax validation.

## Global Constraints

- Modify only `html/vmm3y/vmm-3-year-program-embed-tabs.html` and the new regression test file; preserve unrelated worktree changes.
- Keep the existing package list, reward values, Terms modal, balance validation, history behavior, and success modal unchanged.
- Display the review group only when `selectedTier` exists.
- Use Vietnamese labels from the approved design: `Số VMM ký gửi`, `VMM IOU được tặng`, `Thời hạn`, `Ngày bắt đầu`, `Ngày hoàn tất dự kiến`, `Số dư VMM còn lại`, `Terms & Conditions`, and `Xác nhận ký gửi`.
- Use the existing prototype dates `01/09/2026` and `01/09/2029`.
- Format all VMM amounts through the existing `fmt()` helper.

---

### Task 1: Add a failing regression contract for the package-review group

**Files:**
- Create: `html/vmm3y/vmm-3-year-program-embed-tabs.test.mjs`
- Test: `html/vmm3y/vmm-3-year-program-embed-tabs.test.mjs`

**Interfaces:**
- Consumes: the target HTML source at `html/vmm3y/vmm-3-year-program-embed-tabs.html`.
- Produces: a repeatable source contract requiring the review labels, value hooks, `renderPackageReview()` helper, and dynamic remaining-balance assignment.

- [ ] **Step 1: Write the failing test**

Create the test with this exact content:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const pagePath = fileURLToPath(new URL('./vmm-3-year-program-embed-tabs.html', import.meta.url));

test('defines the selected-package review group and dynamic value hooks', () => {
  const html = readFileSync(pagePath, 'utf8');

  for (const label of [
    'Sau khi chọn cấp, hệ thống hiển thị:',
    'Số VMM ký gửi',
    'VMM IOU được tặng',
    'Thời hạn',
    'Ngày bắt đầu',
    'Ngày hoàn tất dự kiến',
    'Số dư VMM còn lại',
    'Terms &amp; Conditions',
    'Xác nhận ký gửi'
  ]) {
    assert.match(html, new RegExp(label), `missing review label: ${label}`);
  }

  for (const id of [
    'reviewDepositAmount',
    'reviewRewardAmount',
    'reviewPeriod',
    'reviewStartDate',
    'reviewEndDate',
    'reviewRemainingBalance'
  ]) {
    assert.match(html, new RegExp(`id="${id}"`), `missing review value hook: ${id}`);
  }

  assert.match(html, /function renderPackageReview\(\)/);
  assert.match(html, /reviewRemainingBalance\.textContent\s*=.*walletBalance.*selectedTier\.amount/);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
node --test html/vmm3y/vmm-3-year-program-embed-tabs.test.mjs
```

Expected: `FAIL` because the current HTML has no package-review labels, value hooks, or `renderPackageReview()` helper.

### Task 2: Implement the review group and dynamic rendering

**Files:**
- Modify: `html/vmm3y/vmm-3-year-program-embed-tabs.html:1731-1769` for the scoped review-card styles.
- Modify: `html/vmm3y/vmm-3-year-program-embed-tabs.html:2490-2501` for the review markup.
- Modify: `html/vmm3y/vmm-3-year-program-embed-tabs.html:2820-2884,3035-3055` for DOM hooks and rendering logic.

**Interfaces:**
- Consumes: `selectedTier`, `walletBalance`, `fmt()`, existing `reviewArea`, `confirmDeposit`, and `[data-open-terms]` event binding.
- Produces: `renderPackageReview()` with no arguments; it updates the review group from current state and keeps the confirm button disabled when no tier is selected or the selected amount exceeds the wallet balance.

- [ ] **Step 1: Add the review-card CSS**

Insert these rules after the existing `.vmm-buy-confirmation` rules:

```css
#vmm-program-root .vmm-package-review {
  margin: 0 0 18px;
  padding: 14px 16px;
  border: 1px solid var(--vmm-reference-border);
  border-radius: 12px;
  background: #fbfcfe;
  text-align: left;
}

#vmm-program-root .vmm-package-review-title {
  margin: 0 0 8px;
  color: var(--vmm-reference-heading);
  font-size: 13px;
  font-weight: 900;
}

#vmm-program-root .vmm-package-review-list {
  margin: 0;
  padding-left: 18px;
  color: #667386;
  font-size: 12px;
}

#vmm-program-root .vmm-package-review-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 4px 0;
}

#vmm-program-root .vmm-package-review-list li::marker {
  color: var(--vmm-reference-blue);
}

#vmm-program-root .vmm-package-review-list strong {
  color: var(--vmm-reference-heading);
  font-weight: 800;
  text-align: right;
}

#vmm-program-root .vmm-package-review-terms {
  align-items: center;
}

#vmm-program-root .vmm-package-review-terms button {
  padding: 0;
  color: var(--vmm-reference-blue);
  font-size: 12px;
  font-weight: 800;
  text-decoration: none;
}

#vmm-program-root .vmm-package-review-terms button:hover {
  text-decoration: underline;
}

@media (max-width: 420px) {
  #vmm-program-root .vmm-package-review-list li {
    align-items: flex-start;
  }

  #vmm-program-root .vmm-package-review-list strong {
    max-width: 58%;
  }
}
```

- [ ] **Step 2: Add the review markup**

Replace the current contents of `#reviewArea` with this structure while retaining the same `reviewArea` and `confirmDeposit` IDs:

```html
<div class="vmm-buy-confirmation" id="reviewArea" hidden>
  <div class="vmm-package-review" aria-live="polite">
    <p class="vmm-package-review-title">Sau khi chọn cấp, hệ thống hiển thị:</p>
    <ul class="vmm-package-review-list">
      <li><span>Số VMM ký gửi</span><strong id="reviewDepositAmount">—</strong></li>
      <li><span>VMM IOU được tặng</span><strong id="reviewRewardAmount">—</strong></li>
      <li><span>Thời hạn</span><strong id="reviewPeriod">3 năm</strong></li>
      <li><span>Ngày bắt đầu</span><strong id="reviewStartDate">01/09/2026</strong></li>
      <li><span>Ngày hoàn tất dự kiến</span><strong id="reviewEndDate">01/09/2029</strong></li>
      <li><span>Số dư VMM còn lại</span><strong id="reviewRemainingBalance">—</strong></li>
      <li class="vmm-package-review-terms">
        <span>Terms &amp; Conditions</span>
        <button class="btn btn-link" type="button" data-open-terms>Xem điều khoản</button>
      </li>
    </ul>
  </div>

  <div class="vmm-action-row">
    <button class="btn btn-primary vmm-btn vmm-btn-primary" id="confirmDeposit" disabled>Xác nhận ký gửi</button>
  </div>

  <div class="vmm-terms-check">
    <span>
      Khi bấm <strong>Xác nhận ký gửi</strong>, bạn xác nhận đã đọc và đồng ý với
      <button class="btn btn-link p-0" type="button" data-open-terms>Terms &amp; Conditions</button>.
    </span>
  </div>
</div>
```

- [ ] **Step 3: Add DOM hooks and the render helper**

Add these constants after `const confirmDeposit = root.querySelector('#confirmDeposit');`:

```js
const reviewDepositAmount = root.querySelector('#reviewDepositAmount');
const reviewRewardAmount = root.querySelector('#reviewRewardAmount');
const reviewPeriod = root.querySelector('#reviewPeriod');
const reviewStartDate = root.querySelector('#reviewStartDate');
const reviewEndDate = root.querySelector('#reviewEndDate');
const reviewRemainingBalance = root.querySelector('#reviewRemainingBalance');
```

Add this helper before `updateBalances()`:

```js
function renderPackageReview() {
  if (!selectedTier) {
    reviewArea.hidden = true;
    confirmDeposit.disabled = true;
    return;
  }

  reviewArea.hidden = false;
  reviewDepositAmount.textContent = `${fmt(selectedTier.amount)} VMM`;
  reviewRewardAmount.textContent = `${fmt(selectedTier.reward)} VMM IOU`;
  reviewPeriod.textContent = '3 năm';
  reviewStartDate.textContent = '01/09/2026';
  reviewEndDate.textContent = '01/09/2029';
  reviewRemainingBalance.textContent = `${fmt(walletBalance - selectedTier.amount)} VMM`;
  confirmDeposit.disabled = selectedTier.amount > walletBalance;
}
```

Update `updateBalances()` to call the helper after setting the existing balance validation:

```js
function updateBalances() {
  packageQuantity.textContent = fmt(walletBalance);
  root.querySelector('#programBalance').textContent = `${fmt(walletBalance)} VMM`;
  typeValidation.hidden = !(selectedTier && selectedTier.amount > walletBalance);
  renderPackageReview();
}
```

Replace `showReview()` with:

```js
function showReview() {
  if (!selectedTier) {
    packageSummary.textContent = '—';
    root.querySelector('#rewardBannerValue').textContent = '—';
    renderPackageReview();
    return;
  }

  packageSummary.textContent = `${fmt(selectedTier.amount)} VMM · Reward ${fmt(selectedTier.reward)} VMM IOU`;
  root.querySelector('#rewardBannerValue').textContent = `${fmt(selectedTier.reward)} VMM IOU`;
  renderPackageReview();
}
```

Keep `clearCurrentSelection()` calling `updateBalances()` after setting `selectedTier = null`; `renderPackageReview()` will hide the group and keep the confirmation button disabled.

- [ ] **Step 4: Run the regression test and syntax check**

Run:

```bash
node --test html/vmm3y/vmm-3-year-program-embed-tabs.test.mjs
node --check <(sed -n '/^  <script>$/,/^  <\/script>$/p' html/vmm3y/vmm-3-year-program-embed-tabs.html | sed '1d;$d')
```

Expected: the regression test reports `1 pass`; the syntax check exits `0` with no output.

### Task 3: Verify the interactive state transitions

**Files:**
- Verify: `html/vmm3y/vmm-3-year-program-embed-tabs.html`
- Verify: `html/vmm3y/vmm-3-year-program-embed-tabs.test.mjs`

**Interfaces:**
- Consumes: the rendered review hooks from Task 2.
- Produces: fresh verification evidence for default selection, package switching, insufficient balance, Terms opening, and reset behavior.

- [ ] **Step 1: Run the browser-backed or manual interaction check**

Open the file in Chrome and verify the following exact states:

1. Initial package `10.000.000 VMM`: review group is visible, reward is `10.000 VMM IOU`, and remaining balance is `290.000.000 VMM`.
2. Selecting `100.000.000 VMM`: review values become `100.000.000 VMM`, `1.000.000 VMM IOU`, and `200.000.000 VMM`.
3. Selecting `500.000.000 VMM`: the review group remains visible, `Your VMM quantity is insufficient` is visible, and `Xác nhận ký gửi` is disabled.
4. Clicking either Terms control opens the existing Terms modal.
5. Selecting an affordable package and confirming causes the existing success flow, then the review group is hidden and the package selector returns to its placeholder.

- [ ] **Step 2: Review the final diff and worktree scope**

Run:

```bash
git diff --check
git diff --stat -- html/vmm3y/vmm-3-year-program-embed-tabs.html html/vmm3y/vmm-3-year-program-embed-tabs.test.mjs
git status --short
```

Expected: no whitespace errors; only the target HTML and its new test are part of this task, while pre-existing booking changes remain untouched.

- [ ] **Step 3: Commit the implementation**

Run:

```bash
git add html/vmm3y/vmm-3-year-program-embed-tabs.html html/vmm3y/vmm-3-year-program-embed-tabs.test.mjs
git commit -m "feat: add VMM package review details"
```
