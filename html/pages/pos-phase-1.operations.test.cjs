const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, 'pos-phase-1.html'), 'utf8');

test('POS splits the legacy Operations/dispatch tab into Check-in, Tickets, and Customers', () => {
  assert.match(html, /data-pos-tab="checkin"[^>]*>[\s\S]{0,60}Check-in/);
  assert.match(html, /data-pos-tab="tickets"[^>]*>[\s\S]{0,60}Tickets/);
  assert.match(html, /data-pos-tab="customers"[^>]*>[\s\S]{0,60}Customers/);
  assert.match(html, /data-pos-panel="checkin"/);
  assert.match(html, /data-pos-panel="tickets"/);
  assert.match(html, /data-pos-panel="customers"/);
  assert.doesNotMatch(html, /data-pos-tab="dispatch"/);
  assert.doesNotMatch(html, /data-pos-panel="dispatch"/);
});

test('POS keeps the top-level tab order Check-in | Tickets | Booking | Customers | Time Clock | Management', () => {
  const tabsBlock = html.match(/<div class="page-tabs"[\s\S]*?<\/div>/)?.[0] || '';
  const order = ['checkin', 'tickets', 'booking', 'customers', 'clock', 'management'];
  let lastIndex = -1;
  order.forEach((id) => {
    const idx = tabsBlock.indexOf('data-pos-tab="' + id + '"');
    assert.ok(idx > lastIndex, 'expected tab "' + id + '" to appear in order');
    lastIndex = idx;
  });
});

test('POS aliases the legacy ?tab=dispatch and ?tab=appointments URLs to their new homes', () => {
  assert.match(html, /var TAB_ALIASES = \{ dispatch: 'tickets', appointments: 'booking' \}/);
  assert.match(html, /if \(TAB_ALIASES\[id\]\) id = TAB_ALIASES\[id\]/);
});

test('POS moves operational KPIs and the tech board into Tickets, and check-in intake into Check-in', () => {
  const checkinPanel = html.match(/<section class="pos-panel is-active" data-pos-panel="checkin"[\s\S]*?<\/section>/)?.[0] || '';
  const ticketsPanel = html.match(/<section class="pos-panel" data-pos-panel="tickets"[\s\S]*?<\/section>/)?.[0] || '';

  assert.match(checkinPanel, /data-eta-panel/);
  assert.match(checkinPanel, /data-ciq-panel/);
  assert.match(checkinPanel, /data-wl-name/);
  assert.match(checkinPanel, /data-wl-add/);
  assert.doesNotMatch(checkinPanel, /disp-stats/);
  assert.doesNotMatch(checkinPanel, /data-tech-board/);

  assert.match(ticketsPanel, /disp-stats/);
  assert.match(ticketsPanel, /data-arq-panel/);
  assert.match(ticketsPanel, /data-wait-list/);
  assert.match(ticketsPanel, /data-tech-board/);
  assert.doesNotMatch(ticketsPanel, /data-wl-add/);
});

test('POS Customers tab exposes search, profile, and Check-in/New booking actions', () => {
  const customersPanel = html.match(/<section class="pos-panel" data-pos-panel="customers"[\s\S]*?<\/section>/)?.[0] || '';
  assert.match(customersPanel, /data-cust-search/);
  assert.match(customersPanel, /data-cust-results/);
  assert.match(customersPanel, /data-cust-profile-card/);
  assert.match(customersPanel, /data-cust-profile/);
  assert.match(html, /function renderCustomersTab\(/);
  assert.match(html, /data-cust-pick="/);
  assert.match(html, /data-cust-checkin="/);
  assert.match(html, /data-cust-newbooking="/);
  assert.match(html, /activateTab\('booking'\);\s*\n\s*if \(typeof openBookingNewAppointment === 'function'\) openBookingNewAppointment\(\);/);
});

test('POS fixes the previously-undefined custByPhone lookup used by walk-in check-in', () => {
  assert.match(html, /function custByPhone\(phone\) \{/);
  assert.match(html, /var known = phone \? custByPhone\(phone\) : null;/);
});

test('POS renders Check-in and Tickets from the shared floor renderer on tab switch', () => {
  assert.match(html, /if \(id === 'checkin' \|\| id === 'tickets'\) renderFloor\(\);/);
  assert.match(html, /if \(!e\.target\.closest\('\[data-pos-panel="checkin"\], \[data-pos-panel="tickets"\]'\)\) return;/);
});
