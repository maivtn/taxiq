import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const BOOKING_URL = new URL('./booking-book-phase-1.html', import.meta.url);

function source() {
  assert.ok(existsSync(BOOKING_URL), 'booking-book-phase-1.html must exist');
  return readFileSync(BOOKING_URL, 'utf8');
}

test('registers SMS Campaigns and QR Codes in both Booking Hub navigation surfaces', () => {
  const html = source();
  for (const [target, label] of [['sms-campaigns', 'SMS Campaigns'], ['qr-codes', 'QR Codes']]) {
    assert.equal((html.match(new RegExp(`data-tab-target="${target}"`, 'g')) || []).length, 2);
    assert.match(html, new RegExp(`data-tab-target="${target}"[^>]*aria-controls="panel-${target}"`));
    assert.match(html, new RegExp(`<span>${label}<\\/span>`));
    assert.match(html, new RegExp(`id="panel-${target}"[^>]*data-tab-panel="${target}"[^>]*role="tabpanel"`));
  }
  assert.match(html, /qrcodejs\/1\.0\.0\/qrcode\.min\.js/);
});

test('keeps shared tab and query-string synchronization for new targets', () => {
  const html = source();
  assert.match(html, /document\.querySelectorAll\('\[data-tab-target\]'\)/);
  assert.match(html, /url\.searchParams\.set\('tab', target\)/);
  assert.match(html, /var DEFAULT_MAIN_TAB = 'booking'/);
});

test('ports the complete SMS Campaigns view and reuses the composer', () => {
  const html = source();
  for (const copy of [
    'Chọn nhóm khách → Soạn tin → Gửi hoặc hẹn giờ',
    'Tổng khách', '1,284', 'SMS đã gửi tháng này', '3,412',
    'Khách quay lại', '147', 'Revenue từ SMS', '$8,820',
    'Nhóm khách — Chọn để gửi campaign', 'Tạo Campaign Mới'
  ]) assert.ok(html.includes(copy), `missing SMS copy: ${copy}`);

  for (const segment of ['new', 'day15', 'day30', 'day60', 'vip', 'birthday']) {
    assert.match(html, new RegExp(`id: '${segment}'`));
  }

  assert.match(html, /data-sms-campaign-grid/);
  assert.match(html, /data-sms-campaign-new/);
  assert.match(html, /function renderSmsCampaignCards\(\)/);
  assert.match(html, /window\.openSmsCampaignComposer/);
  assert.match(html, /openComposer\(btn\.dataset\.smsSegment\)/);
});
