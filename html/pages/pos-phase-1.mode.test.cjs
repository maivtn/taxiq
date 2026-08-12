const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, 'pos-phase-1.html'), 'utf8');

test('POS exposes a mode switch modal with the three selectable demo accounts', () => {
  assert.match(html, /data-pos-mode-open/);
  assert.match(html, /data-pos-mode-modal[^>]*role="dialog"/);
  assert.match(html, /data-pos-mode-pin/);
  assert.match(html, /data-pos-mode-submit/);
  assert.match(html, /data-pos-mode-close/);
  assert.match(html, /data-pos-mode-error[^>]*aria-live="polite"/);
  assert.match(html, /data-pos-role="owner"/);
  assert.match(html, /data-pos-role="manager"/);
  assert.match(html, /data-pos-role="frontdesk"/);
});

test('POS mode uses the demo PIN and applies Front Desk management visibility', () => {
  assert.match(html, /var POS_DEMO_PIN = ['"]1234['"]/);
  assert.match(html, /function applyPosModeAccess\(/);
  assert.match(html, /managementTab\.hidden = isFrontDesk/);
  assert.match(html, /managementPanel\.hidden = isFrontDesk/);
  assert.match(html, /if \(isFrontDesk && activeTabId === ['"]management['"]\) activateTab\(['"]checkin['"]\)/);
});

test('POS rejects direct Management activation for Front Desk mode', () => {
  assert.match(html, /if \(id === ['"]management['"] && getActiveStaff\(\)\.role === ['"]frontdesk['"]\) id = ['"]checkin['"]/);
});

test('POS labels the tickets tab as Waiting List while keeping the tickets route', () => {
  const tabsBlock = html.match(/<div class="page-tabs"[\s\S]*?<\/div>/)?.[0] || '';

  assert.match(tabsBlock, /data-pos-tab="tickets"[\s\S]{0,100}Waiting List<\/button>/);
  assert.doesNotMatch(tabsBlock, /data-pos-tab="tickets"[\s\S]{0,100}Turns<\/button>/);
  assert.doesNotMatch(tabsBlock, /data-pos-tab="tickets"[\s\S]{0,100}Tickets<\/button>/);
});

test('POS shows Check-in first and Today Booking second as separate tabs', () => {
  const tabsBlock = html.match(/<div class="page-tabs"[\s\S]*?<\/div>/)?.[0] || '';
  const checkinIndex = tabsBlock.indexOf('data-pos-tab="checkin"');
  const todayBookingIndex = tabsBlock.indexOf('data-pos-tab="todaybooking"');
  const waitingListIndex = tabsBlock.indexOf('data-pos-tab="tickets"');

  assert.ok(checkinIndex !== -1, 'expected Check-in tab');
  assert.ok(todayBookingIndex > checkinIndex, 'expected Today Booking after Check-in');
  assert.ok(waitingListIndex > todayBookingIndex, 'expected Waiting List after Today Booking');
  assert.match(tabsBlock, /data-pos-tab="checkin"[\s\S]{0,100}Check-in<\/button>/);
  assert.match(tabsBlock, /data-pos-tab="todaybooking"[\s\S]{0,100}Today Booking<\/button>/);
});

test('POS Check-in tab embeds the kiosk flow for helping a guest', () => {
  const checkinPanel = html.match(/<section class="pos-panel is-active" data-pos-panel="checkin"[\s\S]*?<\/section>/)?.[0] || '';
  const todayBookingPanel = html.match(/<section class="pos-panel" data-pos-panel="todaybooking"[\s\S]*?<\/section>/)?.[0] || '';

  assert.match(checkinPanel, /data-frontdesk-kiosk-frame/);
  assert.match(checkinPanel, /src="https:\/\/pos-nexoratouch\.vercel\.app\/mockups\/phase1\/kiosk\.html"/);
  assert.doesNotMatch(checkinPanel, /src="kiosk\.html"/);
  assert.doesNotMatch(checkinPanel, /data-wl-name|data-wl-phone|data-wl-add/);
  assert.doesNotMatch(checkinPanel, /data-eta-panel|data-ciq-panel/);
  assert.match(todayBookingPanel, /data-eta-panel/);
  assert.match(todayBookingPanel, /data-ciq-panel/);
});

test('POS mode UI exposes a labelled badge and keyboard-friendly PIN controls', () => {
  assert.match(html, /data-pos-mode-badge-text/);
  assert.match(html, /id="pos-mode-title"/);
  assert.match(html, /id="pos-mode-pin"[^>]*type="password"/);
  assert.match(html, /id="pos-mode-pin"[^>]*inputmode="numeric"/);
  assert.match(html, /aria-labelledby="pos-mode-title"/);
});

test('POS mode submission updates the active badge and validates the selected staff member', () => {
  assert.match(html, /var activeStaffId = ['"]owner['"]/);
  assert.match(html, /function getActiveStaff\(\)/);
  assert.match(html, /modePin\.value !== POS_DEMO_PIN/);
  assert.match(html, /activeStaffId = selectedStaffId/);
  assert.match(html, /modeBadge\.textContent = ROLE_LBL\[active\.role\] \+ ['"] · ['"] \+ active\.name/);
});

test('Front Desk mode keeps Management tab and panel hidden despite display rules', () => {
  assert.match(html, /\.page-tab\[hidden\],\s*\.pos-panel\[hidden\]\s*\{\s*display:\s*none\s*!important;/);
});
