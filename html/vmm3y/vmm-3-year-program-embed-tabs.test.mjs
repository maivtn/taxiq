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
