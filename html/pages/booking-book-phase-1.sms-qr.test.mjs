import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const BOOKING_URL = new URL('./booking-book-phase-1.html', import.meta.url);
const SHELL_URL = new URL('../assets/nexora-shell.js', import.meta.url);

function source() {
  assert.ok(existsSync(BOOKING_URL), 'booking-book-phase-1.html must exist');
  return readFileSync(BOOKING_URL, 'utf8');
}

function shellSource() {
  assert.ok(existsSync(SHELL_URL), 'nexora-shell.js must exist');
  return readFileSync(SHELL_URL, 'utf8');
}

test('registers SMS Campaigns and QR Codes in both Booking Hub navigation surfaces', () => {
  const html = source();
  const shell = shellSource();
  for (const [target, label] of [['sms-campaigns', 'SMS Campaigns'], ['qr-codes', 'QR Codes']]) {
    assert.equal((html.match(new RegExp(`data-tab-target="${target}"`, 'g')) || []).length, 2);
    assert.match(html, new RegExp(`data-tab-target="${target}"[^>]*aria-controls="panel-${target}"`));
    assert.match(html, new RegExp(`<span>${label}<\\/span>`));
    assert.match(html, new RegExp(`id="panel-${target}"[^>]*data-tab-panel="${target}"[^>]*role="tabpanel"`));
    assert.match(shell, new RegExp(`label: '${label}', tab: '${target}'`));
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

test('ports every QR Codes section and its kiosk surface', () => {
  const html = source();
  for (const id of [
    'qrGuideBtn', 'publishQrBtn', 'qrGuide', 'qrName', 'qrPromo',
    'qrFormTitle', 'qrQuestion', 'qrSlug', 'qrLinkPreview', 'qrCanvas',
    'qrDownloadBtn', 'qrPrintBtn', 'kioskBtn', 'verifyInput', 'verifyBtn',
    'verifyResult', 'qrLeadsBody', 'qrPreviewUrl', 'qrIframe',
    'kioskOverlay', 'kioskExit', 'kioskIframe'
  ]) assert.match(html, new RegExp(`id="${id}"`), `missing #${id}`);

  for (const copy of [
    'Khách scan → điền tên + SĐT → nhận mã qua SMS → AI voice chào đúng tên khi gọi',
    'Bước 1 — Chủ tiệm setup', 'Bước 2 — Khách scan', 'Bước 3 — Nhân viên tại quầy',
    '3 lỗi hay gặp', 'Chương trình khuyến mãi', 'Form khách điền',
    'Checkbox đồng ý nhận SMS', 'Link & Mã QR', 'Verify code tại quầy',
    'Leads đã thu từ QR này', 'Promotion Code', 'Chế độ Kiosk'
  ]) assert.ok(html.includes(copy), `missing QR copy: ${copy}`);
});

test('keeps QR form sections inside their desktop grid column', () => {
  const html = source();
  assert.match(html, /#panel-qr-codes \.qr-form-stack,\s*#panel-qr-codes \.qr-section \{ min-width:0; \}/);
});

test('ports QR generation, preview, verification, download, print, kiosk, and publish behavior', () => {
  const html = source();
  for (const fn of [
    'qrUrl', 'renderQrPromoOptions', 'renderQrCode', 'renderQrLeads',
    'verifyCode', 'markCodeUsed', 'buildQrPageHtml', 'updateQrPreview',
    'openKiosk', 'printPoster', 'refreshQr'
  ]) assert.match(html, new RegExp(`function ${fn}\\(`), `missing ${fn}`);

  assert.match(html, /typeof QRCode === 'undefined'/);
  assert.match(html, /Không tải được thư viện QR/);
  assert.match(html, /QR_PROMOS = \[/);
  assert.match(html, /QR_LEADS = \[/);
  assert.match(html, /qrGuideBtn.*addEventListener/s);
  assert.match(html, /qrDownloadBtn.*addEventListener/s);
  assert.match(html, /qrPrintBtn.*addEventListener/s);
  assert.match(html, /kioskBtn.*addEventListener/s);
  assert.match(html, /publishQrBtn.*addEventListener/s);
  assert.match(html, /verifyInput.*keydown/s);
  assert.match(html, /Reply STOP để hủy, HELP để được hỗ trợ/);
  assert.match(html, /Text Me My Promotion Code/);
});
