const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, 'pos-phase-1.html'), 'utf8');
const phase2Html = fs.readFileSync(path.join(__dirname, 'pos-phase-2.html'), 'utf8');
const bookingCss = fs.readFileSync(path.join(__dirname, '..', 'assets', 'pos-booking.css'), 'utf8');

test('POS phone field keeps country code and number in one joined control', () => {
  const phoneShell = bookingCss.match(/\.phone-input-shell \{[\s\S]*?\n\s*\}/)?.[0] || '';
  assert.match(phoneShell, /display:\s*flex/);
  assert.match(phoneShell, /align-items:\s*center/);
  assert.match(bookingCss, /\.phone-country-select\s*\{[\s\S]*?width:\s*74px/);
  assert.match(bookingCss, /\.phone-mask-input,[\s\S]*?\.phone-input-shell \.booking-input\s*\{[\s\S]*?flex:\s*1/);
});

test('Tickets Queue and Techs cards fit the available content width responsively', () => {
  assert.match(html, /\.disp-grid\s*\{[\s\S]*?grid-template-columns:\s*repeat\(auto-fit,\s*minmax\(min\(100%,\s*420px\),\s*1fr\)\)/);
  assert.match(html, /\.disp-grid > \*\s*\{\s*min-width:\s*0;\s*\}/);
});

test('POS avatars use text initials instead of icon or emoji fallbacks', () => {
  [html, phase2Html].forEach((source) => {
    assert.doesNotMatch(source, /pos-mode-role-avatar">[^A-Za-z<]/);
    assert.doesNotMatch(source, /ava:\s*'[^']*[^\x00-\x7F][^']*'/);
    assert.doesNotMatch(source, /pos-avatar[^\n]*s\.ava/);
    assert.match(source, /initials\(s\.name\)/);
  });
});

test('Swap tech opens a technician picker modal and routes selection through the existing assignment flow', () => {
  assert.match(html, /data-swap-tech-modal/);
  assert.match(html, /data-swap-tech-list/);
  assert.match(html, /function openSwapTechModal\(wid\) \{/);
  assert.match(html, /function chooseSwapTech\(tid\) \{/);
  assert.match(html, /if \(sp\) \{[\s\S]*openSwapTechModal\(\+sp\.getAttribute\('data-wswap'\)\)/);
  assert.match(html, /chooseSwapTech\(swapPick\.getAttribute\('data-swap-tech-pick'\)\)/);
  assert.match(html, /fAssign\(w, tid\)/);
});

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

test('POS keeps ticket KPIs in Tickets and merges the Time Clock roster into one table', () => {
  const checkinPanel = html.match(/<section class="pos-panel is-active" data-pos-panel="checkin"[\s\S]*?<\/section>/)?.[0] || '';
  const ticketsPanel = html.match(/<section class="pos-panel" data-pos-panel="tickets"[\s\S]*?<\/section>/)?.[0] || '';
  const clockPanel = html.match(/<section class="pos-panel" data-pos-panel="clock"[\s\S]*?<\/section>/)?.[0] || '';

  assert.match(checkinPanel, /data-eta-panel/);
  assert.match(checkinPanel, /data-ciq-panel/);
  assert.doesNotMatch(checkinPanel, /data-wl-name|data-wl-phone|data-wl-add/);
  assert.doesNotMatch(checkinPanel, /disp-stats/);
  assert.doesNotMatch(checkinPanel, /data-tech-board/);

  assert.match(ticketsPanel, /disp-stats/);
  assert.match(ticketsPanel, /data-arq-panel/);
  assert.match(ticketsPanel, /data-wait-list/);
  assert.doesNotMatch(ticketsPanel, /data-tech-board|Techs on shift/);
  assert.doesNotMatch(ticketsPanel, /data-wl-add/);

  assert.match(clockPanel, /data-tech-roster-table/);
  assert.doesNotMatch(clockPanel, /data-clk-grid|data-tech-board/);
  assert.match(html, /function renderTechRosterTable\(\) \{/);
  assert.match(html, /<table class="tech-roster-table">/);
  assert.match(html, /<th scope="col">Technician<\/th>/);
  assert.match(html, /<th scope="col">Shift<\/th>/);
  assert.match(html, /<th scope="col">Current ticket<\/th>/);
  assert.match(html, /<th scope="col">Turns today<\/th>/);
});

test('Time Clock station cells only show the station input, not per-tech Station labels', () => {
  const roster = html.match(/function renderTechRosterTable\(\) \{[\s\S]*?\n      \}/)?.[0] || '';
  assert.match(roster, /<input class="clk-station"/);
  assert.match(roster, /aria-label="Station"/);
  assert.doesNotMatch(roster, /Station for/);
});

test('POS Customers tab exposes search, table/card view, and Check-in/New booking actions', () => {
  const customersPanel = html.match(/<section class="pos-panel" data-pos-panel="customers"[\s\S]*?<\/section>/)?.[0] || '';
  assert.match(customersPanel, /data-cust-search/);
  assert.match(customersPanel, /data-cust-results/);
  assert.match(customersPanel, /data-cust-table-wrap/);
  assert.match(customersPanel, /data-cust-view-target="table"/);
  assert.match(customersPanel, /data-cust-view-target="card"/);
  assert.match(customersPanel, /data-cust-seg-chips/);
  assert.match(customersPanel, /data-cust-create/);
  assert.match(customersPanel, /data-cust-import/);
  assert.match(customersPanel, /data-cust-import-file/);
  assert.match(customersPanel, /data-cust-import-status/);
  assert.match(html, /src="\.\.\/assets\/pos-customer-import\.js"/);
  assert.match(html, /data-cust-profile-modal/);
  assert.match(html, /data-cust-profile/);
  assert.match(html, /function renderCustomersTab\(/);
  assert.match(html, /data-cust-pick="/);
  assert.match(html, /data-cust-checkin="/);
  assert.match(html, /data-cust-newbooking="/);
  assert.match(html, /activateTab\('booking'\);\s*\n\s*if \(typeof openBookingNewAppointment === 'function'\) openBookingNewAppointment\(\);/);
});

test('POS Customers create/edit modal merges AI Hub customer fields onto the existing model', () => {
  assert.match(html, /data-cust-edit-modal/);
  assert.match(html, /data-cf-name/);
  assert.match(html, /data-cf-phone/);
  assert.match(html, /data-cf-email/);
  assert.match(html, /data-cf-birthday/);
  assert.match(html, /data-cf-address/);
  assert.match(html, /data-cf-type/);
  assert.match(html, /data-cf-status/);
  assert.match(html, /function openCustCreateModal\(/);
  assert.match(html, /function openCustEditModal\(index\) \{/);
  assert.match(html, /function saveCustModal\(/);
});

test('POS Customers tab exposes Excel import controls and wires file handling', () => {
  const customersPanel = html.match(/<section class="pos-panel" data-pos-panel="customers"[\s\S]*?<\/section>/)?.[0] || '';
  assert.match(customersPanel, /data-cust-import/);
  assert.match(customersPanel, /data-cust-import-file/);
  assert.match(customersPanel, /accept="[^"]*\.xlsx[^"]*\.xls[^"]*\.csv/);
  assert.match(html, /xlsx\.full\.min\.js/);
  assert.match(html, /src="\.\.\/assets\/pos-customer-import\.js"/);
  assert.match(html, /function handleCustImportFile\(file\)/);
  assert.match(html, /NexoraCustomerImport/);
  assert.match(html, /importer\.mergeCustomers\(CUSTOMERS/);
});

test('POS fixes the previously-undefined custByPhone lookup used by walk-in check-in', () => {
  assert.match(html, /function custByPhone\(phone\) \{/);
  assert.match(html, /var known = phone \? custByPhone\(phone\) : null;/);
});

test('POS renders floor tabs and allows the merged Time Clock roster to handle actions', () => {
  assert.match(html, /if \(id === 'checkin' \|\| id === 'tickets'\) renderFloor\(\);/);
  assert.match(html, /if \(!e\.target\.closest\('\[data-pos-panel="checkin"\], \[data-pos-panel="tickets"\], \[data-pos-panel="clock"\]'\)\) return;/);
});
