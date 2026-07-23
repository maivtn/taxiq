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

  const reviewBlock = html.match(/<div class="vmm-package-review"[\s\S]*?<div class="vmm-action-row">/)?.[0] || '';
  assert.ok(reviewBlock, 'review block must exist');
  assert.match(html, /class="vmm-package-review-rows"/);
  assert.equal((html.match(/class="vmm-package-review-row"/g) || []).length, 6);
  assert.doesNotMatch(reviewBlock, /<ul\b|<ol\b|<li\b/);
  assert.doesNotMatch(html, /class="vmm-package-review-grid"/);
  assert.doesNotMatch(html, /class="vmm-package-review-item"/);
  assert.match(html, /id="reviewStartDate">Aug 20, 2026<\/strong>/);
  assert.match(html, /id="reviewEndDate">Aug 20, 2029<\/strong>/);
  assert.match(html, /reviewStartDate\.textContent\s*=\s*'Aug 20, 2026'/);
  assert.match(html, /reviewEndDate\.textContent\s*=\s*'Aug 20, 2029'/);
  assert.match(html, /\.vmm-package-review-row\s*\{/);
  assert.match(html, /justify-content:\s*space-between/);
});
