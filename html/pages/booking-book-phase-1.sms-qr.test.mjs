import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const BOOKING_URL = new URL('./booking-book-phase-1.html', import.meta.url);
const SHELL_URL = new URL('../assets/nexora-shell.js', import.meta.url);
const SMS_DASHBOARD_URL = new URL('./nexora-sms-dashboard.html', import.meta.url);
const BRAND_LOGO_URL = new URL('../assets/nexora-logo.svg', import.meta.url);

function source() {
  assert.ok(existsSync(BOOKING_URL), 'booking-book-phase-1.html must exist');
  return readFileSync(BOOKING_URL, 'utf8');
}

function shellSource() {
  assert.ok(existsSync(SHELL_URL), 'nexora-shell.js must exist');
  return readFileSync(SHELL_URL, 'utf8');
}

function smsDashboardSource() {
  assert.ok(existsSync(SMS_DASHBOARD_URL), 'nexora-sms-dashboard.html must exist');
  return readFileSync(SMS_DASHBOARD_URL, 'utf8');
}

function browserParsedInlineScripts(html) {
  const scripts = [];
  const openScript = /<script\b([^>]*)>/gi;
  let match;

  while ((match = openScript.exec(html))) {
    const contentStart = openScript.lastIndex;
    const contentEnd = html.toLowerCase().indexOf('</script>', contentStart);
    assert.notEqual(contentEnd, -1, 'every script element must be closed');
    if (!/\bsrc\s*=/i.test(match[1])) scripts.push(html.slice(contentStart, contentEnd));
    openScript.lastIndex = contentEnd + '</script>'.length;
  }

  return scripts;
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

test('lays out each SMS campaign icon and text as separate card columns', () => {
  const html = source();

  assert.match(
    html,
    /#panel-sms-campaigns \.sms-campaign-card \{[^}]*display:grid;[^}]*grid-template-columns:40px minmax\(0,1fr\);/s
  );
  assert.match(html, /#panel-sms-campaigns \.sms-campaign-icon \{[^}]*grid-column:1;[^}]*grid-row:1;/s);
  assert.match(html, /#panel-sms-campaigns \.sms-campaign-copy \{[^}]*grid-column:2;[^}]*min-width:0;/s);
  assert.match(html, /#panel-sms-campaigns \.sms-campaign-meta \{[^}]*grid-column:1\s*\/\s*-1;/s);
  assert.match(
    html,
    /class="sms-campaign-icon"[\s\S]*?data-lucide=[\s\S]*?class="sms-campaign-copy"[\s\S]*?class="sms-campaign-name"[\s\S]*?class="sms-campaign-desc"[\s\S]*?class="sms-campaign-meta"/
  );
});

test('uses Lucide for SMS and QR interface icons while preserving marketing emoji', () => {
  const html = source();

  assert.match(html, /data-tab-target="sms-campaigns"[^>]*>[\s\S]*?data-lucide="message-square"[\s\S]*?<span>SMS Campaigns<\/span>/);
  assert.match(html, /data-tab-target="qr-codes"[^>]*>[\s\S]*?data-lucide="qr-code"[\s\S]*?<span>QR Codes<\/span>/);
  assert.match(html, /<h2 class="marketing-icon-label"><i class="marketing-icon" data-lucide="message-square"[^>]*><\/i><span>SMS Campaigns<\/span><\/h2>/);
  assert.match(html, /<h2 class="marketing-icon-label"><i class="marketing-icon" data-lucide="qr-code"[^>]*><\/i><span>QR Codes<\/span><\/h2>/);

  for (const [id, icon] of [
    ['qrGuideBtn', 'book-open'],
    ['publishQrBtn', 'upload-cloud'],
    ['qrDownloadBtn', 'download'],
    ['qrPrintBtn', 'printer'],
    ['kioskBtn', 'tablet'],
    ['verifyBtn', 'search'],
    ['kioskExit', 'x']
  ]) {
    assert.match(html, new RegExp(`id="${id}"[^>]*>[\\s\\S]*?data-lucide="${icon}"`));
  }

  for (const icon of ['user-plus', 'calendar', 'clock', 'refresh-cw', 'star', 'gift']) {
    assert.match(html, new RegExp(`icon: '${icon}'`));
  }
  assert.match(html, /window\.refreshBookingMarketingIcons\s*=\s*function\s*\(\)/);
  assert.match(html, /data-lucide="\$\{s\.icon\}"/);
  assert.match(html, /refreshBookingMarketingIcons\(\);/);
  assert.doesNotMatch(html, /id="(?:qrGuideBtn|publishQrBtn|qrDownloadBtn|qrPrintBtn|kioskBtn|verifyBtn|kioskExit)"[^>]*>[^<]*(?:📖|🚀|⬇️|🖨|🖥|🔍|✕)/);

  assert.match(html, /label: '💅 Giảm 20% toàn bộ dịch vụ'/);
  assert.match(html, /title: '🌟 Welcome Back'/);
});

test('keeps shared tab and query-string synchronization for new targets', () => {
  const html = source();
  assert.match(html, /document\.querySelectorAll\('\[data-tab-target\]'\)/);
  assert.match(html, /url\.searchParams\.set\('tab', target\)/);
  assert.match(html, /var DEFAULT_MAIN_TAB = 'booking'/);
});

test('adds a POS-style resource calendar to the booking view switch', () => {
  const html = source();

  assert.match(html, /data-booking-view-target="calendar"/);
  assert.match(html, /data-booking-view-panel="calendar"/);
  assert.match(html, /@daypilot\/daypilot-lite-javascript@5\.9\.0\/daypilot-javascript\.min\.js/);
  assert.match(html, /new DayPilot\.Calendar/);
  assert.match(html, /viewType:\s*'Resources'/);
  assert.match(html, /var BOOKING_CALENDAR_TECHNICIANS = \['Lan T\.', 'Kim N\.', 'Linda', 'Mai P\.', 'Andy', 'Tina', 'Helen', 'Vy'\];/);
  assert.match(html, /BOOKING_CALENDAR_TECHNICIANS\.forEach/);
  assert.match(html, /BOOKING_CALENDAR_SERVICE_DURATIONS/);
  assert.match(html, /function renderBookingCalendar\(/);
  assert.match(html, /function bookingCalendarEvent\(/);
});

test('provides the table booking actions from Appointment details', () => {
  const html = source();

  assert.match(html, /data-booking-detail-actions/);
  assert.match(html, /function renderBookingDetailActions\(item\)/);
  assert.match(html, /modal\.dataset\.bookingDetailItemId = item\.dataset\.bookingId/);
  assert.match(html, /action\.closest\('\[data-booking-detail-modal\]'\)/);
  assert.match(html, /findBookingItemById\(modal\.dataset\.bookingDetailItemId\)/);
});

test('restores status filter chips in the Appointments Overview', () => {
  const html = source();

  assert.match(html, /data-booking-status-chip="all"/);
  assert.match(html, /data-booking-status-chip="new"/);
  assert.match(html, /data-booking-status-chip="sms-sent"/);
  assert.match(html, /data-booking-status-chip="done"/);
  assert.match(html, /data-booking-status-chip="noshow"/);
  assert.match(html, /data-booking-status-count="all"/);
  assert.match(html, /aria-label="Filter appointments by status"/);
});

test('positions booking filter labels over the input corner', () => {
  const html = source();
  const fieldRule = html.match(/\.booking-control-field\s*\{([^}]*)\}/)?.[1] || '';
  const labelRule = html.match(/\.booking-control-label\s*\{([^}]*)\}/)?.[1] || '';

  assert.match(fieldRule, /position:\s*relative;/);
  assert.match(labelRule, /position:\s*absolute;/);
  assert.match(labelRule, /top:\s*-\d+px;/);
  assert.match(labelRule, /left:\s*\d+px;/);
  assert.match(labelRule, /background:\s*#fff;/);
});

test('keeps booking controls free of a containing surface', () => {
  const html = source();
  const controlsRule = html.match(/\.booking-controls\s*\{([^}]*)\}/)?.[1] || '';

  assert.doesNotMatch(controlsRule, /\bborder\s*:/);
  assert.doesNotMatch(controlsRule, /\bbackground\s*:/);
  assert.doesNotMatch(controlsRule, /\bpadding\s*:/);
});

test('keeps inline scripts valid when Live Server injects its reload client', () => {
  const liveReloadClient = '<script>window.__liveReloadReady = true;</script>';
  const servedHtml = source().replace(/<\/body>/i, `${liveReloadClient}\n</body>`);
  const inlineScripts = browserParsedInlineScripts(servedHtml);

  assert.ok(inlineScripts.length > 0, 'expected inline scripts in the served page');
  inlineScripts.forEach((script, index) => {
    assert.doesNotThrow(
      () => new Function(script),
      `browser-parsed inline script ${index + 1} must remain syntactically valid`
    );
  });
});

test('labels the populated Booking Book main landmark accurately', () => {
  const html = source();
  assert.match(html, /<main class="content" aria-label="Booking Book content">/);
  assert.doesNotMatch(html, /aria-label="Blank Booking Book content"/);
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

test('provides a complete accessible focus lifecycle for the SMS composer', () => {
  const html = source();

  assert.match(html, /id="composerModal"[^>]*aria-hidden="true"/);
  assert.match(html, /class="modal"[^>]*role="dialog"[^>]*aria-modal="true"[^>]*aria-labelledby="composerModalTitle"/);
  assert.match(html, /id="composerModalTitle"/);
  assert.match(html, /id="successBanner"[^>]*role="status"[^>]*aria-live="polite"[^>]*aria-atomic="true"/);
  assert.match(html, /let composerOpener = null;/);
  assert.match(html, /let composerBackgroundStates = \[\];/);
  assert.match(html, /function setComposerBackgroundInert\(inert\)[\s\S]*let surface = overlay;[\s\S]*element !== surface[\s\S]*element\.setAttribute\('inert', ''\)[\s\S]*removeAttribute\('inert'\)/);
  assert.match(html, /function openComposer\(segId\)[\s\S]*composerOpener = document\.activeElement;[\s\S]*setComposerBackgroundInert\(true\);[\s\S]*setAttribute\('aria-hidden', 'false'\);[\s\S]*\$\('closeComposerBtn'\)\.focus\(\);/);
  assert.match(html, /function closeComposer\(\)[\s\S]*setAttribute\('aria-hidden', 'true'\);[\s\S]*setComposerBackgroundInert\(false\);[\s\S]*composerOpener\.focus\(\);/);
  assert.match(html, /function composerFocusables\(\)[\s\S]*a\[href\][\s\S]*button:not\(\[disabled\]\)[\s\S]*element\.offsetParent !== null/);
  assert.match(html, /event\.key !== 'Tab'[\s\S]*event\.shiftKey && document\.activeElement === first[\s\S]*last\.focus\(\)[\s\S]*!event\.shiftKey && document\.activeElement === last[\s\S]*first\.focus\(\)/);
});

test('prevents SMS campaigns from being scheduled in the past', () => {
  const html = source();

  assert.match(html, /\$\('schedDate'\)\.min = new Date\(\)\.toISOString\(\)\.slice\(0, 10\);/);
  assert.match(html, /function scheduledDateTimeIsPast\(\)[\s\S]*new Date\(date \+ 'T' \+ time\)[\s\S]*Date\.now\(\)/);
  assert.match(html, /state\.scheduleMode === 'schedule'[\s\S]*\$\('schedDate'\)\.validity\.rangeUnderflow[\s\S]*scheduledDateTimeIsPast\(\)[\s\S]*Vui lòng chọn ngày và giờ gửi trong tương lai\./);
});

test('opens the real landing page builder instead of silently closing the SMS composer', () => {
  const html = source();
  const dashboard = smsDashboardSource();

  assert.match(
    html,
    /<a[^>]*id="createLpBtn"[^>]*href="nexora-sms-dashboard\.html\?view=landingpage"[^>]*target="_blank"[^>]*rel="noopener"[^>]*>/
  );
  assert.doesNotMatch(html, /createLpBtn[^\n]*addEventListener\('click', closeComposer\)/);
  assert.match(html, /#nx-campaign-root \.btn-outline\s*\{[^}]*display:\s*inline-flex;[^}]*text-decoration:\s*none;/s);
  assert.match(dashboard, /new URLSearchParams\(window\.location\.search\)\.get\('view'\)/);
  assert.match(dashboard, /showView\(initialView\)/);
});

test('uses a checked-in mobile brand logo instead of a missing public asset', () => {
  const html = source();
  const shell = shellSource();

  assert.ok(existsSync(BRAND_LOGO_URL), 'mobile brand logo must exist');
  assert.match(html, /class="brand-logo" src="\.\.\/assets\/nexora-logo\.svg"/);
  assert.match(shell, /class="brand-logo" src="\.\.\/assets\/nexora-logo\.svg"/);
  assert.doesNotMatch(html, /public\/assets\/nexora-logo\.png/);
  assert.doesNotMatch(shell, /public\/assets\/nexora-logo\.png/);
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

test('announces every promotion-code verification outcome including empty input', () => {
  const html = source();
  assert.match(html, /id="verifyResult"[^>]*role="status"[^>]*aria-live="polite"/);
  assert.match(html, /if \(!raw\) \{[\s\S]*?box\.className = 'verify-result show bad';[\s\S]*?Vui lòng nhập promotion code để kiểm tra\.[\s\S]*?return;[\s\S]*?\}/);
});

test('associates QR configuration and verification fields with labels', () => {
  const html = source();
  for (const id of ['qrName', 'qrPromo', 'qrFormTitle', 'qrQuestion', 'qrSlug', 'verifyInput']) {
    assert.match(html, new RegExp(`<label[^>]*for="${id}"[^>]*>`), `missing label for #${id}`);
  }
});

test('associates generated scan and kiosk fields including SMS consent with labels', () => {
  const html = source();
  for (const id of ['nm', 'ph', 'cs', 'sv', 'dt', 'tm']) {
    assert.match(html, new RegExp(`<label[^>]*for="${id}"[^>]*`), `missing generated label for #${id}`);
  }
});

test('maps the generated apply action to the Booking primary button contract', () => {
  const html = source();
  assert.match(html, /<button class="booking-primary-button" type="button" id="markUsedBtn" data-code=/);
  assert.doesNotMatch(html, /<button class="btn-primary" id="markUsedBtn"/);
});

test('provides the complete kiosk dialog accessibility and focus lifecycle', () => {
  const html = source();
  assert.match(html, /id="kioskOverlay"[^>]*role="dialog"[^>]*aria-modal="true"[^>]*aria-labelledby="kioskTitle"[^>]*aria-hidden="true"/);
  assert.match(html, /id="kioskTitle"/);
  assert.match(html, /let kioskOpener = null;/);
  assert.match(html, /function openKiosk\(\)[\s\S]*kioskOpener = document\.activeElement;[\s\S]*overlay\.setAttribute\('aria-hidden', 'false'\);[\s\S]*byId\('kioskExit'\)\.focus\(\);/);
  assert.match(html, /function closeKiosk\(\)[\s\S]*overlay\.setAttribute\('aria-hidden', 'true'\);[\s\S]*kioskOpener\.focus\(\);/);
  assert.match(html, /byId\('kioskExit'\)\.addEventListener\('click', closeKiosk\);/);
  assert.match(html, /document\.addEventListener\('keydown',[\s\S]*event\.key === 'Escape'[\s\S]*closeKiosk\(\)/);
});

test('bridges iframe Escape to the parent with source validation', () => {
  const html = source();
  assert.match(html, /if \(KIOSK && event\.key === 'Escape'\)[\s\S]*parent\.postMessage\(\{ type: 'nexora-kiosk-close' \}, '\*'\)/);
  assert.match(html, /window\.addEventListener\('message',[\s\S]*event\.source !== byId\('kioskIframe'\)\.contentWindow[\s\S]*event\.data\.type !== 'nexora-kiosk-close'[\s\S]*closeKiosk\(\)/);
});

test('makes every background surface inert while kiosk mode is open and restores it on close', () => {
  const html = source();
  assert.match(html, /let kioskBackgroundStates = \[\];/);
  assert.match(html, /function setKioskBackgroundInert\(inert\)[\s\S]*let surface = overlay;[\s\S]*while \(surface && surface !== document\.body\)[\s\S]*parent\.children[\s\S]*element !== surface[\s\S]*wasInert: element\.hasAttribute\('inert'\)[\s\S]*element\.setAttribute\('inert', ''\)[\s\S]*removeAttribute\('inert'\)/);
  assert.doesNotMatch(html, /kioskBackgroundStates = Array\.from\(document\.body\.children\)/);
  assert.match(html, /function openKiosk\(\)[\s\S]*setKioskBackgroundInert\(true\)/);
  assert.match(html, /function closeKiosk\(\)[\s\S]*setKioskBackgroundInert\(false\)/);
});

test('contains forward and reverse Tab focus inside the generated kiosk form', () => {
  const html = source();
  assert.match(html, /function kioskFocusables\(\)[\s\S]*button:not\(\[disabled\]\)[\s\S]*element\.offsetParent !== null/);
  assert.match(html, /if \(!KIOSK \|\| event\.key !== 'Tab'\) return;[\s\S]*event\.shiftKey && document\.activeElement === first[\s\S]*last\.focus\(\)[\s\S]*!event\.shiftKey && document\.activeElement === last[\s\S]*first\.focus\(\)/);
  assert.match(html, /event\.source !== parent[\s\S]*event\.data\.type !== 'nexora-kiosk-focus'[\s\S]*event\.data\.edge === 'last'/);
  assert.match(html, /byId\('kioskExit'\)\.addEventListener\('keydown',[\s\S]*event\.key !== 'Tab'[\s\S]*nexora-kiosk-focus[\s\S]*event\.shiftKey \? 'last' : 'first'/);
});
