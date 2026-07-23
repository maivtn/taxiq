import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const pagePath = fileURLToPath(new URL('./vmm-3-year-program-embed-tabs.html', import.meta.url));

test('defines the selected-package review group and dynamic value hooks', () => {
  const html = readFileSync(pagePath, 'utf8');

  for (const label of [
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
  assert.doesNotMatch(html, /id="packageSummary"/);
  assert.doesNotMatch(html, /packageSummary/);

  const reviewBlock = html.match(/<div class="vmm-package-review"[\s\S]*?<div class="vmm-action-row">/)?.[0] || '';
  assert.ok(reviewBlock, 'review block must exist');
  assert.match(html, /class="vmm-package-review-rows"/);
  assert.equal((html.match(/class="vmm-package-review-row"/g) || []).length, 6);
  assert.doesNotMatch(reviewBlock, /<ul\b|<ol\b|<li\b/);
  assert.doesNotMatch(html, /class="vmm-package-review-grid"/);
  assert.doesNotMatch(html, /class="vmm-package-review-item"/);
  assert.match(html, /id="reviewStartDate">Sep 01, 2026<\/strong>/);
  assert.match(html, /id="reviewEndDate">Sep 01, 2029<\/strong>/);
  assert.match(html, /reviewStartDate\.textContent\s*=\s*programStartLabel/);
  assert.match(html, /reviewEndDate\.textContent\s*=\s*programReleaseLabel/);
  assert.match(html, /const PROGRAM_START_DATE\s*=\s*'2026-09-01'/);
  assert.match(html, /const PROGRAM_RELEASE_DATE\s*=\s*'2029-09-01'/);
  assert.match(html, /day:\s*'2-digit'/);
  assert.match(html, /confirmDeposit\.disabled\s*=\s*!isProgramOpen\(\)\s*\|\|/);
  assert.match(html, /if \(!selectedTier \|\| !isProgramOpen\(\)/);
  assert.match(html, /<th>Transaction Code<\/th>/);
  assert.match(html, /<code class="vmm-table-code">\$\{transactionCode\}<\/code>/);
  assert.match(html, /if \(result\.isDenied\)[\s\S]*openHoldingDetail\(detailButton\)/);
  assert.match(html, /\.vmm-package-review-row\s*\{/);
  assert.match(html, /justify-content:\s*space-between/);
  assert.match(html, /\.vmm-package-review-rows\s*\{[\s\S]*?gap:\s*2px;/);
  assert.match(html, /\.vmm-package-review-row\s*\{[\s\S]*?min-height:\s*0;[\s\S]*?padding:\s*5px 0;[\s\S]*?border-bottom:\s*0;/);
  assert.doesNotMatch(html, /\.vmm-package-review-row:last-child/);
  assert.match(html, /\.vmm-package-review-label\s*\{[^}]*font-size:\s*13px;[^}]*font-weight:\s*500;[^}]*\}/);
  assert.match(html, /\.vmm-package-review-value\s*\{[^}]*font-size:\s*14px;[^}]*font-weight:\s*700;[^}]*\}/);
});
