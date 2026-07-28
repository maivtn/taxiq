import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const BOOKING_URL = new URL('./booking-book-phase-1.html', import.meta.url);
const SHELL_URL = new URL('../assets/nexora-shell.js', import.meta.url);
const SMS_DASHBOARD_URL = new URL('./nexora-sms-dashboard.html', import.meta.url);
const BRAND_LOGO_URL = new URL('../assets/nexora-logo.svg', import.meta.url);
const CHANGE_ICON_URL = new URL('./change-icon.html', import.meta.url);

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
    /#panel-sms-campaigns \.sms-campaign-card \{[^}]*display:grid;[^}]*grid-template-columns:34px minmax\(0,1fr\);/s
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

test('allows New appointment to select multiple services and keeps their total duration', () => {
  const html = source();

  assert.match(html, /class="booking-service-chips"[^>]*data-booking-create-field="service"/);
  assert.match(html, /data-booking-create-service/);
  assert.match(html, /function getBookingCreateServices\(\)/);
  assert.match(html, /is-selected/);
  assert.match(html, /function bookingServiceDurationMinutes\(services\)/);
  assert.match(html, /\.reduce\(function\(total/);
  assert.match(html, /services: services/);
  assert.match(html, /services\.map\(/);
  assert.match(html, /services\.join\(' '\)/);
});

test('limits long service pickers and enables vertical scrolling', () => {
  const html = source();
  const servicePickerRule = html.match(/\.booking-service-chips\s*\{([^}]*)\}/)?.[1] || '';

  assert.match(servicePickerRule, /max-height:\s*160px/);
  assert.match(servicePickerRule, /overflow-y:\s*auto/);
});

test('adds website and structured salon location fields to Salon Info', () => {
  const html = source();
  const salonInfo = html.match(/<div class="settings-card-title"><i class="bi bi-shop"[^>]*><\/i>Salon Info<\/div>[\s\S]*?<\/article>/)?.[0] || '';
  const websitePosition = salonInfo.indexOf('<span class="settings-label">Website</span>');
  const reviewLinkPosition = salonInfo.indexOf('<span class="settings-label">Google Review Link</span>');

  assert.match(salonInfo, /<span class="settings-label">Website<\/span>[\s\S]*?<input class="settings-input" type="url"[^>]*autocomplete="url"/);
  assert.ok(websitePosition > reviewLinkPosition, 'Website should be the last Salon Info field');
  assert.match(salonInfo, /<span class="settings-label settings-label-with-tooltip">\s*Salon phone number[\s\S]*?<button class="settings-tooltip-trigger" type="button" aria-label="Salon phone number info" aria-describedby="salon-phone-number-help">[\s\S]*bi-info-circle/);
  assert.match(salonInfo, /<span class="settings-tooltip-content" id="salon-phone-number-help" role="tooltip">The number customers currently call; it will be forwarded to the AI number\.<\/span>/);
  assert.doesNotMatch(salonInfo, /<span class="settings-help">The number customers currently call/);
  assert.match(salonInfo, /<span class="settings-label settings-label-with-tooltip">\s*AI answering number[\s\S]*?<button class="settings-tooltip-trigger" type="button" aria-label="AI answering number info" aria-describedby="ai-answering-number-help">[\s\S]*bi-info-circle/);
  assert.match(salonInfo, /<span class="settings-tooltip-content" id="ai-answering-number-help" role="tooltip">Provided by NEXORA; AI answers 24\/7 on this number\.<\/span>/);
  assert.doesNotMatch(salonInfo, /<span class="settings-help">Provided by NEXORA; AI answers 24\/7 on this number\.<\/span>/);
  assert.match(salonInfo, /<span class="settings-label settings-label-with-tooltip">\s*Booking notification number[\s\S]*?<button class="settings-tooltip-trigger" type="button" aria-label="Booking notification number info" aria-describedby="booking-notification-number-help">[\s\S]*bi-info-circle/);
  assert.match(salonInfo, /<span class="settings-tooltip-content" id="booking-notification-number-help" role="tooltip">Gets an SMS when a customer books or texts - can be the owner's or manager's number\.<\/span>/);
  assert.doesNotMatch(salonInfo, /<span class="settings-help">Gets an SMS when a customer books or texts - can be the owner's or manager's number\.<\/span>/);
  assert.match(salonInfo, /<span class="settings-label">Address \*<\/span>[\s\S]*?value="9793 Westheimer Rd, Suite A"/);
  assert.doesNotMatch(salonInfo, /Address line 1/);
  for (const label of ['City', 'State', 'Zip code']) {
    assert.match(salonInfo, new RegExp(`<span class="settings-label">${label} \\*<\\/span>[\\s\\S]*?<input class="settings-input" type="text"`));
  }
  assert.match(salonInfo, /<span class="settings-label">Country \*<\/span>[\s\S]*?<select class="settings-select"[^>]*autocomplete="country"[\s\S]*?<option value="US" selected>United States<\/option>/);
});

test('limits the Services & Pricing list and enables vertical scrolling', () => {
  const html = source();
  const serviceListRule = html.match(/\.settings-service-list\.settings-service-body\s*\{([^}]*)\}/)?.[1] || '';

  assert.match(serviceListRule, /max-height:\s*500px/);
  assert.match(serviceListRule, /overflow-y:\s*auto/);
});

test('removes the service duration note from settings pages', () => {
  const durationNote = 'Duration determines when the review SMS is sent (finished + 2h) and the touch-up promo cycle.';

  assert.doesNotMatch(source(), new RegExp(durationNote.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.doesNotMatch(readFileSync(CHANGE_ICON_URL, 'utf8'), new RegExp(durationNote.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
});

test('keeps the Salon Info address group compact', () => {
  const html = source();
  const locationGridRule = html.match(/\.settings-location-grid\s*\{([^}]*)\}/)?.[1] || '';
  const locationFieldRule = html.match(/\.settings-location-grid > \.settings-field\s*\{([^}]*)\}/)?.[1] || '';
  const locationControlRule = html.match(/\.settings-location-grid \.settings-input,[\s\S]*?\.settings-location-grid \.settings-select\s*\{([^}]*)\}/)?.[1] || '';

  assert.match(html, /<div class="settings-location-grid">[\s\S]*?Address \*[\s\S]*?Country \*/);
  assert.match(locationGridRule, /row-gap:\s*10px/);
  assert.match(locationFieldRule, /gap:\s*6px/);
  assert.match(locationControlRule, /min-height:\s*40px/);
});

test('adds an editable address-detected time zone to Operating Hours', () => {
  const html = source();
  const operatingHours = html.match(/<div class="settings-card-title"><i class="bi bi-clock-history"[^>]*><\/i>Operating Hours<\/div>[\s\S]*?<\/article>/)?.[0] || '';
  const timezoneOptions = Array.from(operatingHours.matchAll(/<option value="([^"]+)"(?: selected)?>([^<]+)<\/option>/g));
  const timezoneToolbarRule = html.match(/\.settings-hours-toolbar\s*\{([^}]*)\}/)?.[1] || '';
  const timezonePosition = operatingHours.indexOf('<div class="settings-hours-toolbar">');
  const lastHourPosition = operatingHours.lastIndexOf('data-settings-hour-toggle');

  assert.match(operatingHours, /<span class="settings-label">Time zone<\/span>[\s\S]*?<select class="settings-select settings-timezone-select" data-settings-timezone data-timezone-auto="true"/);
  assert.match(operatingHours, /<option value="America\/Chicago" selected>America\/Chicago<\/option>/);
  assert.ok(timezoneOptions.length >= 5);
  timezoneOptions.forEach(([, value, label]) => assert.equal(label, value));
  assert.ok(timezonePosition > lastHourPosition, 'Time zone should be the last Operating Hours control');
  assert.match(timezoneToolbarRule, /margin-top:\s*12px/);
  assert.match(timezoneToolbarRule, /margin-bottom:\s*0/);
  assert.match(operatingHours, /data-settings-timezone-status>Auto-detected from salon address<\/span>/);
  assert.match(html, /data-settings-address-field="state"/);
  assert.match(html, /function detectSettingsTimeZone\(\)/);
  assert.match(html, /data-timezone-manual/);
  assert.match(html, /document\.querySelectorAll\('\[data-settings-address-field\]'\)/);
});

test('adds first-call AI SMS controls above Promotion details', () => {
  const html = source();
  const aiVoice = html.match(/<div class="settings-card-title"><span class="settings-ai-title-icon"[^>]*>AI[\s\S]*?AI Voice<\/div>[\s\S]*?<\/article>/)?.[0] || '';
  const firstCallPosition = aiVoice.indexOf('First-call SMS');
  const promotionPosition = aiVoice.indexOf('Promotion details');

  assert.ok(firstCallPosition !== -1, 'First-call SMS section should exist in AI Voice settings');
  assert.ok(firstCallPosition < promotionPosition, 'First-call SMS should appear above Promotion details');
  assert.match(aiVoice, /data-settings-first-call-sms-toggle[^>]*role="switch"[^>]*aria-checked="true"/);
  assert.match(aiVoice, /First-call SMS[\s\S]*?settings-tooltip-trigger[^>]*aria-label="First-call SMS info"[^>]*aria-describedby="first-call-sms-help"/);
  assert.match(aiVoice, /id="first-call-sms-help" role="tooltip">AI sends this message only after a new customer calls, books an appointment successfully, and the booking is confirmed\.<\/span>/);
  assert.match(aiVoice, /Send a follow-up after a completed AI booking/);
  assert.match(aiVoice, /SMS message[\s\S]*?settings-tooltip-trigger[^>]*aria-label="SMS message info"[^>]*aria-describedby="first-call-sms-message-help"/);
  assert.match(aiVoice, /id="first-call-sms-message-help" role="tooltip">Suggested post-booking message — edit it to match your salon's offer\.<\/span>/);
  assert.doesNotMatch(aiVoice, /settings-first-call-sms-description/);
  assert.doesNotMatch(aiVoice, /settings-first-call-sms-note/);
  assert.match(aiVoice, /data-settings-first-call-sms-message[^>]*>Thanks for booking with Bitcoin Nail Bar!/);
  assert.match(aiVoice, /Promotion details[\s\S]*?settings-tooltip-trigger[^>]*aria-label="Promotion details info"[^>]*aria-describedby="promotion-details-help"/);
  assert.match(aiVoice, /id="promotion-details-help" role="tooltip">AI Voice reads this offer when a customer asks about promotions\. Tap a suggestion chip to fill in a template, then edit it for your salon\.<\/span>/);
  assert.doesNotMatch(aiVoice, /settings-language-status">AI Voice reads this offer when a customer asks about promotions/);
  const firstCallHeadRule = html.match(/\.settings-first-call-sms-head\s*\{([^}]*)\}/)?.[1] || '';
  const firstCallCopyRule = html.match(/\.settings-first-call-sms-copy\s*\{([^}]*)\}/)?.[1] || '';
  const firstCallTitleRule = html.match(/\.settings-first-call-sms-title\s*\{([^}]*)\}/)?.[1] || '';

  assert.match(firstCallHeadRule, /align-items:\s*center/);
  assert.match(firstCallCopyRule, /display:\s*flex/);
  assert.match(firstCallCopyRule, /align-items:\s*center/);
  assert.match(firstCallTitleRule, /white-space:\s*nowrap/);
  assert.match(firstCallTitleRule, /text-overflow:\s*ellipsis/);
  assert.match(html, /function syncFirstCallSmsToggle\(/);
});

test('does not force a minimum height on business grid inputs', () => {
  const html = source();
  const businessFieldRule = html.match(/\.settings-business-grid > \.settings-field:not\(\.settings-span-full\)\s*\{([^}]*)\}/)?.[1] || '';
  const businessInputRule = html.match(/\.settings-business-grid \.settings-input\s*\{([^}]*)\}/)?.[1] || '';

  assert.match(businessFieldRule, /grid-template-rows:\s*16px 46px\s*;/);
  assert.doesNotMatch(businessInputRule, /min-height:/);
  assert.match(businessInputRule, /border-radius:\s*10px/);
});

test('shows service price between name and duration in New appointment', () => {
  const html = source();

  assert.match(html, /BOOKING_CALENDAR_SERVICE_OPTIONS = \[[\s\S]*?\{ name: 'Gel Manicure', price: 35, duration: 60 \}/);
  assert.match(
    html,
    /escapeHtml\(option\.name\) \+ ' · \$' \+ option\.price \+ ' · <span class="booking-service-duration">' \+ option\.duration \+ ' min<\/span><\/button>'/
  );
});

test('uses regular weight for service duration in New appointment', () => {
  const html = source();

  assert.match(html, /\.booking-service-duration\s*\{[^}]*font-weight:\s*400;/);
  assert.match(
    html,
    /option\.price \+ ' · <span class="booking-service-duration">' \+ option\.duration \+ ' min<\/span><\/button>'/
  );
});

test('shows total price and total time below New appointment services', () => {
  const html = source();

  assert.match(html, /data-booking-create-field="service"[\s\S]*class="booking-service-summary"/);
  assert.match(html, /data-booking-create-total-price>\$0<\/strong>/);
  assert.match(html, /data-booking-create-total-duration>0 min<\/strong>/);
  assert.match(html, /function bookingServicePriceTotal\(services\)/);
  assert.match(html, /function updateBookingCreateServiceSummary\(\)/);
  assert.match(html, /updateBookingCreateServiceSummary\(\);/);
});

test('renders service totals as text instead of input-like controls', () => {
  const html = source();
  const summaryItemRule = html.match(/\.booking-service-summary-item\s*\{([^}]*)\}/)?.[1] || '';
  const summaryMarkup = html.match(/<div class="booking-service-summary"[\s\S]*?<\/div>\s*<\/label>/)?.[0] || '';

  assert.doesNotMatch(summaryItemRule, /\bborder\s*:/);
  assert.doesNotMatch(summaryItemRule, /\bbackground\s*:/);
  assert.match(html, /<span class="booking-service-summary-label">Total price:<\/span>\s*<strong[^>]*data-booking-create-total-price>\$0<\/strong>/);
  assert.match(html, /<span class="booking-service-summary-label">Total time:<\/span>\s*<strong[^>]*data-booking-create-total-duration>0 min<\/strong>/);
  assert.doesNotMatch(summaryMarkup, /<input\b/);
});

test('makes the New appointment services picker span the full form width', () => {
  const html = source();

  assert.match(html, /<label class="booking-create-field is-full">[\s\S]*?data-booking-create-field="service"/);
});

test('removes the manual duration selector from New appointment', () => {
  const html = source();

  assert.doesNotMatch(html, /<select class="booking-select" data-booking-create-field="duration">/);
  assert.doesNotMatch(html, /bookingCreateField\('duration'\)/);
  assert.doesNotMatch(html, /syncBookingCreateDuration/);
  assert.match(html, /var duration = bookingServiceDurationMinutes\(services\) \|\| 60;/);
});

test('keeps technician and status together before the date and time fields', () => {
  const html = source();
  const fields = ['tech', 'status', 'date', 'time'].map((field) => html.indexOf(`data-booking-create-field="${field}"`));

  assert.ok(fields.every((index) => index >= 0));
  assert.ok(fields[0] < fields[1] && fields[1] < fields[2] && fields[2] < fields[3]);
});

test('puts required phone before customer name in New appointment', () => {
  const html = source();
  const phoneIndex = html.indexOf('data-booking-create-field="phone"');
  const nameIndex = html.indexOf('data-booking-create-field="name"');

  assert.ok(phoneIndex >= 0 && nameIndex >= 0 && phoneIndex < nameIndex);
  assert.match(html, /<span class="booking-create-label">Phone \*<\/span>[\s\S]*?data-booking-create-field="phone"[^>]*required/);
  assert.match(html, /if \(!phone\) \{ setBookingCreateError\('Enter the phone number\.'\); return; \}/);
});

test('uses the shared phone mask for New appointment phone', () => {
  const html = source();

  assert.match(html, /data-booking-create-field="phone"[^>]*data-phone-mask/);
  assert.match(html, /function initPhoneMasks\(\)/);
});

test('uses a calendar-plus icon for the New appointment dialog title', () => {
  const html = source();

  assert.match(
    html,
    /<div class="booking-create-title" id="booking-create-title"><i class="bi bi-calendar-plus" aria-hidden="true"><\/i> New appointment<\/div>/
  );
  assert.doesNotMatch(html, /booking-create-title"><i class="bi bi-plus-circle"/);
});

test('shows the default +1 country code before New appointment phone', () => {
  const html = source();

  assert.match(
    html,
    /<span class="phone-input-shell">\s*<select class="phone-country-select" aria-label="Country code"><option value="\+1" selected>\+1<\/option>[\s\S]*?<input class="booking-input phone-mask-input"[^>]*data-booking-create-field="phone"/
  );
});

test('places New appointment before the booking view switch', () => {
  const html = source();

  assert.match(
    html,
    /<div class="booking-daybar-actions">\s*<button class="booking-primary-button booking-overview-add-button"[^>]*data-booking-calendar-add[^>]*>[^<]*<i class="bi bi-plus-lg"[^>]*><\/i>New appointment<\/button>\s*<div class="booking-view-switch"/
  );
  const dateBlock = html.match(/<div class="booking-date">([\s\S]*?)<\/div>\s*<div class="booking-daybar-actions">/)?.[1] || '';
  assert.doesNotMatch(dateBlock, /data-booking-calendar-add/);
  assert.doesNotMatch(html, /booking-calendar-head-actions">\s*<button[^>]*data-booking-calendar-add/);
});

test('shows a manually closable success alert after saving an appointment', () => {
  const html = source();
  const saveHandler = html.match(/function saveBookingFromCalendar\(\)\s*\{([\s\S]*?)\n    \}\n\n    function initBookingCalendar/)?.[1] || '';

  assert.match(saveHandler, /Swal\.fire\(\{/);
  assert.match(saveHandler, /title:\s*'Appointment created'/);
  assert.match(saveHandler, /confirmButtonText:\s*'Close'/);
  assert.match(saveHandler, /showConfirmButton:\s*true/);
  assert.match(saveHandler, /allowOutsideClick:\s*false/);
  assert.match(saveHandler, /allowEscapeKey:\s*false/);
  assert.doesNotMatch(saveHandler, /timer:/);
});

test('includes saved appointment details in the success alert', () => {
  const html = source();
  const saveHandler = html.match(/function saveBookingFromCalendar\(\)\s*\{([\s\S]*?)\n    \}\n\n    function initBookingCalendar/)?.[1] || '';

  assert.match(saveHandler, /html:\s*bookingSuccessHtml/);
  for (const label of ['Customer', 'Phone', 'Services', 'Date', 'Time', 'Duration', 'Technician', 'Status']) {
    assert.match(saveHandler, new RegExp('>' + label + '<'), `missing ${label} in save confirmation`);
  }
  assert.match(saveHandler, /bookingCalendarDisplayDate\(start\)/);
  assert.match(saveHandler, /bookingCalendarDisplayTime\(start\)/);
  assert.match(saveHandler, /\+\s*duration\s*\+\s*' min/);
});

test('keeps New appointment, view switch, and Filter at the same height', () => {
  const html = source();
  const filterRule = html.match(/\.booking-filter-toggle\s*\{([^}]*)\}/)?.[1] || '';
  const switchRule = html.match(/\.booking-view-switch\s*\{([^}]*)\}/)?.[1] || '';
  const addRule = html.match(/\.booking-overview-add-button\s*\{([^}]*)\}/)?.[1] || '';

  assert.match(filterRule, /height:\s*36px/);
  assert.match(switchRule, /height:\s*36px/);
  assert.match(addRule, /height:\s*36px/);
});

test('does not close New appointment when clicking outside the dialog', () => {
  const html = source();

  assert.doesNotMatch(html, /if \(event\.target\.matches\('\[data-booking-create-modal\]'\)\) \{[\s\S]*?closeBookingCreateModal\(\);/);
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

test('places appointment status chips below the search filters', () => {
  const html = source();
  const controlsIndex = html.indexOf('<div class="booking-controls" aria-label="Booking filters">');
  const chipsIndex = html.indexOf('<div class="booking-status-chips" data-booking-status-chips');
  const tableIndex = html.indexOf('<div class="booking-table-wrap" data-booking-view-panel="table">');

  assert.ok(controlsIndex > -1 && chipsIndex > controlsIndex);
  assert.ok(tableIndex > chipsIndex);
});

test('keeps status chips outside the filter dropdown and directly above each table', () => {
  const html = source();

  assert.match(
    html,
    /data-booking-clear-filters>Clear<\/button>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<div class="booking-status-chips" data-booking-status-chips/
  );
  assert.match(
    html,
    /data-cust-search>\s*<\/label>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<div class="booking-status-chips" data-cust-seg-filter/
  );
  assert.match(
    html,
    /data-call-search>\s*<\/label>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<div class="booking-status-chips" data-call-status-filter/
  );
});

test('puts booking filters behind right-aligned dropdown triggers', () => {
  const html = source();

  for (const [scope, menuId] of [
    ['booking', 'booking-filter-menu'],
    ['customers', 'customers-filter-menu'],
    ['calllog', 'calllog-filter-menu']
  ]) {
    assert.match(html, new RegExp(`data-booking-filter-toggle="${scope}"[^>]*aria-controls="${menuId}"[^>]*aria-expanded="false"`));
    assert.match(html, new RegExp(`id="${menuId}"[^>]*data-booking-filter-menu="${scope}"[^>]*hidden`));
  }

  assert.match(html, /class="booking-filter-popover"/);
  assert.match(html, /function setBookingFilterOpen\(/);
  assert.match(html, /document\.addEventListener\('click', function\(event\) \{[\s\S]*?data-booking-filter-toggle/);
  assert.match(html, /event\.key === 'Escape'[\s\S]*?setBookingFilterOpen\(null\)/);
});

test('provides a selectable SMS credits checkout beside the credits pill', () => {
  const html = source();

  assert.match(html, /data-sms-credit-buy/);
  assert.match(html, /data-sms-credit-modal/);
  assert.match(html, /data-sms-credit-package-list/);
  assert.match(html, /data-sms-credit-payment-list/);
  assert.match(html, /id: 'CARD', label: 'Credit or Debit Card'\s*\}/);
  assert.match(html, /var paymentBalance = method\.id === 'CARD' \? ''/);
  assert.match(html, /data-sms-credit-card-form hidden/);
  assert.match(html, /data-sms-credit-card-field="name"/);
  assert.match(html, /data-sms-credit-card-field="number"/);
  assert.match(html, /data-sms-credit-card-field="expiry"/);
  assert.match(html, /data-sms-credit-card-field="cvc"/);
  assert.match(html, /data-sms-credit-card-field="country"/);
  assert.match(html, /data-sms-credit-card-field="address1"/);
  assert.doesNotMatch(html, /data-sms-credit-card-field="address2"/);
  assert.match(html, /data-sms-credit-card-field="city"/);
  assert.match(html, /data-sms-credit-card-field="state"/);
  assert.match(html, /data-sms-credit-card-field="zip"/);
  assert.equal((html.match(/<option value="VN">Vietnam<\/option>/g) || []).length, 3);
  assert.match(html, /<div class="sms-credit-card-row">\s*<label class="sms-credit-card-field">[\s\S]*?data-sms-credit-card-field="name"[\s\S]*?<\/label>\s*<label class="sms-credit-card-field">[\s\S]*?data-sms-credit-card-field="number"/);
  assert.match(html, /<div class="sms-credit-card-row">\s*<label class="sms-credit-card-field">[\s\S]*?data-sms-credit-card-field="city"[\s\S]*?<\/label>\s*<label class="sms-credit-card-field">[\s\S]*?data-sms-credit-card-field="state"/);
  assert.match(html, /<div class="sms-credit-card-row">\s*<label class="sms-credit-card-field">[\s\S]*?data-sms-credit-card-field="zip"[\s\S]*?<\/label>\s*<label class="sms-credit-card-field">[\s\S]*?data-sms-credit-card-field="country"/);
  assert.match(html, /credits:\s*500,\s*price:\s*25/);
  assert.match(html, /credits:\s*1500,\s*price:\s*60/);
  assert.match(html, /credits:\s*3000,\s*price:\s*99/);
  assert.match(html, /credits:\s*6000,\s*price:\s*175/);
  assert.match(html, /function openSmsCreditModal\(\)/);
  assert.match(html, /function renderSmsCreditCardForm\(\)/);
  assert.match(html, /function validateSmsCreditCardForm\(\)/);
  assert.match(html, /selectedPayment\.id === 'CARD' && !validateSmsCreditCardForm\(\)/);
  assert.match(html, /function confirmSmsCreditPurchase\(\)/);
  assert.match(html, /updateCredits\(state\.credits \+ selectedPackage\.credits\)/);
});

test('opens an Elite payment modal with payment method and invoice only', () => {
  const html = source();

  assert.match(html, /data-plan-payment-modal/);
  assert.match(html, /data-plan-payment-list/);
  assert.match(html, /data-plan-payment-title/);
  assert.match(html, /data-plan-invoice-plan>Elite<\/strong>/);
  assert.match(html, /data-plan-invoice-payment/);
  assert.match(html, /data-plan-invoice-total>\$349\/mo<\/strong>/);
  assert.doesNotMatch(html, /data-plan-package-list/);
  assert.match(html, /function openServicePlanPaymentModal\(plan\)/);
  assert.match(html, /function confirmServicePlanPayment\(\)/);
  assert.match(html, /button\.dataset\.planSelect === 'Starter' \|\| button\.dataset\.planSelect === 'Elite'[\s\S]*?openServicePlanPaymentModal/);
  assert.match(html, /data-plan-card-form hidden/);
});

test('uses the same payment modal for Starter with the Starter invoice amount', () => {
  const html = source();

  assert.match(html, /data-plan-select="Starter"/);
  assert.match(html, /planPaymentPlan === 'Starter' \? 99 : 349/);
  assert.match(html, /invoiceTotal\.textContent = '\$' \+ planPrice \+ '\/mo'/);
  assert.match(html, /selectServicePlan\(planPaymentPlan\)/);
});

test('removes the extra number allowance from the Elite plan', () => {
  const html = source();

  assert.match(html, /2,000 min · 2,000 SMS/);
  assert.doesNotMatch(html, /2,000 min · 2,000 SMS · 3 numbers/);
});

test('labels technician card actions as Edit', () => {
  const html = source();

  for (const id of ['kim', 'lan', 'mai']) {
    assert.match(html, new RegExp(`data-tech-detail-open="${id}"[^>]*aria-label="Edit"[^>]*title="Edit"[\\s\\S]*?bi-pencil[\\s\\S]*?booking-mini-label">Edit<`));
  }
  assert.doesNotMatch(html, /data-tech-detail-open="(?:kim|lan|mai)"[^>]*View Details/);
});

test('limits technician service badges and enables scrolling for long lists', () => {
  const html = source();
  const techServicesRule = html.match(/\.tech-services\s*\{([^}]*)\}/)?.[1] || '';

  assert.match(techServicesRule, /max-height:\s*128px/);
  assert.match(techServicesRule, /overflow-y:\s*auto/);
});

test('places technician services below the card footer', () => {
  const html = source();
  const kimCard = html.match(/<article class="tech-card" data-tech-id="kim">([\s\S]*?)<\/article>/)?.[1] || '';
  const footerIndex = kimCard.indexOf('tech-card-footer');
  const servicesIndex = kimCard.indexOf('tech-services');

  assert.ok(footerIndex >= 0 && servicesIndex >= 0);
  assert.ok(footerIndex < servicesIndex);
  assert.match(html, /<div class="tech-card-footer">[\s\S]*?'<div class="tech-services">' \+ renderTechBadges/);
});

test('keeps technician card footers at a fixed height', () => {
  const html = source();
  const techCardRule = html.match(/\.tech-card\s*\{([^}]*)\}/)?.[1] || '';
  const footerRule = html.match(/\.tech-card-footer\s*\{([^}]*)\}/)?.[1] || '';

  assert.match(techCardRule, /align-content:\s*start/);
  assert.match(footerRule, /height:\s*42px/);
  assert.match(footerRule, /min-height:\s*42px/);
});

test('provides twenty technician services with a Check all option', () => {
  const html = source();
  const serviceChecks = html.match(/data-tech-service="[^"]+"/g) || [];

  assert.equal(serviceChecks.length, 20);
  assert.match(html, /data-tech-service-all>Check all/);
  assert.match(html, /function syncTechServiceCheckAll\(\)/);
  assert.match(html, /event\.target\.matches\('\[data-tech-service-all\]'\)/);
  assert.match(html, /event\.target\.matches\('\[data-tech-service\]'\)/);
});

test('gives Kim Nguyen all technician services', () => {
  const html = source();
  const kimCard = html.match(/<article class="tech-card" data-tech-id="kim">([\s\S]*?)<\/article>/)?.[1] || '';
  const kimChoice = html.match(/data-tech-choice="kim"[^>]*data-services="([^"]+)"/)?.[1] || '';

  assert.equal((kimCard.match(/class="badge badge-plan"/g) || []).length, 20);
  assert.equal(kimChoice.split(',').length, 20);
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

test('adds an All audience option to step 1 of the SMS campaign composer', () => {
  const html = source();

  assert.match(html, /Bước 1 — Chọn nhóm khách[\s\S]*id="segmentGrid"/);
  assert.match(html, /const COMPOSER_SEGMENTS = \[[\s\S]*id: 'all'[\s\S]*\.\.\.SEGMENTS/);
  assert.match(html, /id: 'all'[\s\S]*?Gửi campaign đến toàn bộ khách hàng/);
  assert.match(html, /const TEMPLATES = \{[\s\S]*?all:\s*\[/);
  assert.match(html, /function renderSegmentButtons\(\)[\s\S]*COMPOSER_SEGMENTS\.map/);
  assert.match(html, /function openComposer\(segId\)[\s\S]*COMPOSER_SEGMENTS\.find/);
});

test('links SMS Credits to the dedicated management page and keeps the purchase modal route', () => {
  const html = source();

  assert.match(html, /data-sms-credits-management/);
  assert.match(html, /href="nexora-credits\.html\?from=sms-campaigns"/);
  assert.match(html, /data-sms-credit-buy/);
  assert.match(html, /new URLSearchParams\(window\.location\.search\)[\s\S]*?get\('openCredits'\) === '1'[\s\S]*?openSmsCreditModal\(\)/);
});

test('warns about low SMS credits and offers more credits from the composer cost preview', () => {
  const html = source();

  assert.match(html, /id="costBuyCreditsBtn"[^>]*data-sms-credit-buy[^>]*hidden/);
  assert.match(html, /Mua thêm credits/);
  assert.match(html, /\.cost-preview-buy-button/);
  assert.match(html, /const lowCredits = state\.credits > 0 && totalSms >= state\.credits \* 0\.8/);
  assert.match(html, /Sắp hết credits/);
  assert.match(html, /const needsCreditWarning = lowCredits \|\| !enough/);
  assert.match(html, /\$\('costBuyCreditsBtn'\)\.hidden = !needsCreditWarning/);
});

test('places the SMS credit purchase action below the warning panel', () => {
  const html = source();

  assert.match(
    html,
    /<div class="cost-preview-group">\s*<div class="cost-preview" id="costBox">\s*<div class="cost-preview-info">[\s\S]*?<\/div>\s*<\/div>\s*<button class="cost-preview-buy-button" id="costBuyCreditsBtn"/
  );
  assert.match(html, /#nx-campaign-root \.cost-preview-group\s*\{[^}]*display:flex;[^}]*flex-direction:column;/s);
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

test('adds a campaign-management table below the SMS segment cards', () => {
  const html = source();

  assert.match(html, /class="sms-campaign-history"[^>]*aria-labelledby="smsCampaignHistoryTitle"/);
  assert.match(html, /id="smsCampaignHistoryTitle">Campaigns<\/h3>/);
  assert.match(html, /class="sms-campaign-table-wrap"[\s\S]*<table class="sms-campaign-table">/);
  for (const header of ['Name', 'Audience', 'Mode', 'Status', 'Sent', 'Failed', 'Actions']) {
    assert.match(html, new RegExp(`<th[^>]*>${header}<\\/th>`), `missing campaign table header: ${header}`);
  }
  assert.match(html, /<tbody data-sms-campaign-list><\/tbody>/);
});

test('seeds and manages SMS campaign records without adding a campaign-name field', () => {
  const html = source();

  assert.match(html, /const smsCampaigns = \[[\s\S]*name: 'Bitcoin Nail Bar'[\s\S]*audience: '15 Days No Visit'[\s\S]*mode: 'Scheduled'[\s\S]*status: 'Scheduled'[\s\S]*sent: 0[\s\S]*failed: 0/);
  assert.doesNotMatch(html, /id="campaignName"/);
  for (const fn of ['renderSmsCampaignList', 'createSmsCampaignRecord', 'openSmsCampaignEditor', 'handleSmsCampaignAction']) {
    assert.match(html, new RegExp(`function ${fn}\\(`), `missing ${fn}`);
  }
  for (const action of ['edit', 'cancel', 'delete']) {
    assert.match(html, new RegExp(`data-sms-campaign-action="${action}"`), `missing ${action} action`);
  }
  assert.match(html, /smsCampaigns\.unshift\(createSmsCampaignRecord\(/);
  assert.match(html, /editingSmsCampaignId/);
  assert.match(html, /campaign\.status = 'Cancelled'/);
  assert.match(html, /window\.confirm\(/);
  assert.match(html, /renderSmsCampaignList\(\);/);
});

test('adds a View action and recipient modal for SMS campaigns', () => {
  const html = source();

  assert.match(html, /data-sms-campaign-action="view"/);
  assert.match(html, /data-sms-recipients-modal/);
  for (const label of ['Campaign recipients', 'Customer', 'Phone', 'Status', 'Segments', 'Sent at']) {
    assert.match(html, new RegExp(`>${label}<`), `missing recipient modal label: ${label}`);
  }
  for (const fn of ['renderSmsCampaignRecipients', 'openSmsCampaignRecipients', 'closeSmsCampaignRecipients']) {
    assert.match(html, new RegExp(`function ${fn}\\(`), `missing ${fn}`);
  }
  assert.match(html, /campaign\.recipients/);
  assert.match(html, /data-sms-recipient-filter/);
  assert.match(html, /if \(action === 'view'\)[\s\S]*openSmsCampaignRecipients\(campaign\)/);
});

test('formats SMS recipient sent times like Appointments Overview', () => {
  const html = source();

  assert.match(html, /function formatSmsRecipientSentAt\(value\)/);
  assert.match(html, /toLocaleDateString\('en-US', \{ month: 'short', day: '2-digit', year: 'numeric' \}\)/);
  assert.match(html, /toLocaleTimeString\('en-US', \{ hour: 'numeric', minute: '2-digit' \}\)\.toLowerCase\(\)/);
  assert.match(html, /formatSmsRecipientSentAt\(recipient\.sentAt\)/);
});

test('styles SMS campaign actions as compact buttons', () => {
  const html = source();
  const actionRule = html.match(/#panel-sms-campaigns \.sms-campaign-action\s*\{([^}]*)\}/)?.[1] || '';

  assert.match(actionRule, /display:inline-flex/);
  assert.match(actionRule, /border:1px solid/);
  assert.match(actionRule, /border-radius:/);
  assert.match(actionRule, /background:/);
  assert.doesNotMatch(actionRule, /text-decoration:underline/);
  assert.match(html, /#panel-sms-campaigns \.sms-campaign-action\.is-danger\s*\{[^}]*background:/);
});

test('uses a distinct color for each SMS campaign action', () => {
  const html = source();
  const expectedColors = {
    view: 'var(--nexora-electric)',
    edit: 'var(--nexora-violet)',
    cancel: '#d97706',
    delete: '#c24141'
  };

  for (const [action, color] of Object.entries(expectedColors)) {
    const selector = `#panel-sms-campaigns \\.sms-campaign-action\\[data-sms-campaign-action="${action}"\\]`;
    const rule = html.match(new RegExp(`${selector}\\s*\\{([^}]*)\\}`))?.[1] || '';
    assert.match(rule, /background:/, `missing background for ${action}`);
    assert.ok(rule.includes(`color:${color}`), `missing color for ${action}`);
  }
});

test('keeps SMS Campaign typography at or above 12px', () => {
  const html = source();
  const styleBlocks = html.match(/<style>[\s\S]*?<\/style>/gi) || [];
  const relevantRules = styleBlocks
    .join('\n')
    .match(/[^{}]*(?:#panel-sms-campaigns|#nx-campaign-root)[^{}]*\{[^}]*\}/g) || [];
  const undersizedRules = relevantRules.filter((rule) => {
    return Array.from(rule.matchAll(/font-size:\s*(\d+)px/g)).some((match) => Number(match[1]) < 12);
  });

  assert.deepEqual(undersizedRules, [], 'SMS Campaigns contains text smaller than 12px');
  assert.doesNotMatch(html, /<span style="font-size:11px;color:var\(--text-dim\);">Chèn:/);
});

test('keeps QR Codes typography at or above 12px', () => {
  const html = source();
  const styleBlocks = html.match(/<style>[\s\S]*?<\/style>/gi) || [];
  const relevantRules = styleBlocks
    .join('\n')
    .match(/[^{}]*#panel-qr-codes[^{}]*\{[^}]*\}/g) || [];
  const undersizedRules = relevantRules.filter((rule) => {
    return Array.from(rule.matchAll(/font-size:\s*(\d+)px/g)).some((match) => Number(match[1]) < 12);
  });

  assert.deepEqual(undersizedRules, [], 'QR Codes contains text smaller than 12px');
  for (const selector of ['\\.logo', 'label', '\\.consent', '\\.footer']) {
    assert.doesNotMatch(html, new RegExp(`${selector}\\{font-size:(?:[0-9]|1[01])px`), `QR preview contains text smaller than 12px in ${selector}`);
  }
});

test('provides a populated SMS campaign demo dataset', () => {
  const html = source();

  for (const campaign of ['Win-Back 60 Days', 'VIP Summer Priority', 'Birthday June', 'Touch Up 15 Days']) {
    assert.match(html, new RegExp(`name: '${campaign}'`), `missing demo campaign: ${campaign}`);
  }
  assert.match(html, /status: 'Sent'/);
  assert.match(html, /status: 'Scheduled'/);
  assert.match(html, /status: 'Active'/);
});

test('keeps SMS segment cards compact while preserving their content', () => {
  const html = source();
  const cardRule = html.match(/#panel-sms-campaigns \.sms-campaign-card\s*\{\s*display:grid;([^}]*)\}/)?.[1] || '';
  const iconRule = html.match(/#panel-sms-campaigns \.sms-campaign-icon\s*\{([^}]*)\}/)?.[1] || '';
  const metaRule = html.match(/#panel-sms-campaigns \.sms-campaign-meta\s*\{([^}]*)\}/)?.[1] || '';

  assert.match(cardRule, /grid-template-columns:34px minmax\(0,1fr\)/);
  assert.match(cardRule, /row-gap:10px/);
  assert.match(cardRule, /padding:12px/);
  assert.match(iconRule, /width:34px/);
  assert.match(iconRule, /height:34px/);
  assert.match(metaRule, /padding-top:8px/);
});
