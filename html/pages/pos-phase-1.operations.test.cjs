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

test('Management exposes Services as table/card views with modal CRUD detail fields', () => {
  const managementPanel = html.match(/<section class="pos-panel" data-pos-panel="management"[\s\S]*?<\/section>/)?.[0] || '';
  const servicesRuntime = html.match(/function mgServicesHtml\(\)[\s\S]*?function mgStaffHtml\(\)/)?.[0] || '';
  const serviceModalRuntime = html.match(/function openServiceModal\([\s\S]*?function mgServicesHtml\(\)/)?.[0] || '';

  assert.match(managementPanel, /data-mg-subtab="services"[^>]*>Services/);
  assert.match(html, /var SERVICE_MENU_URL = '\.\.\/menu\/menu\.json'/);
  assert.match(html, /seedServicesFromMenuCatalog/);
  assert.match(html, /var MG_SUBTABS = \['overview', 'payroll', 'services', 'staff', 'catalog'\]/);
  assert.match(html, /services: function \(\) \{ return mgServicesHtml\(\); \}/);
  assert.doesNotMatch(servicesRuntime, /active · .*total · source: html\/menu\/menu\.json/);
  assert.match(servicesRuntime, /data-mg-service-view-target="table"/);
  assert.match(servicesRuntime, /data-mg-service-view-target="card"/);
  assert.match(servicesRuntime, /data-mg-service-table/);
  assert.match(servicesRuntime, /data-mg-service-cards/);
  assert.match(html, /function groupedServicesByCategory\(services\)/);
  assert.match(html, /function serviceCategoryKey\(name\)/);
  assert.match(html, /function serviceCategoryRows\(\)/);
  assert.match(html, /var serviceCollapsedCategories = \{\};/);
  assert.match(servicesRuntime, /var serviceCategoryGroups = groupedServicesByCategory\(services\);/);
  assert.match(html, /data-mg-category-manager/);
  assert.match(html, /data-mg-category-name/);
  assert.match(html, /data-mg-category-kind/);
  assert.match(html, /data-mg-category-add/);
  assert.match(html, /data-mg-category-row="/);
  assert.match(html, /data-mg-category-name-edit="/);
  assert.match(html, /data-mg-category-kind-edit="/);
  assert.match(html, /data-mg-category-save="/);
  assert.match(html, /data-mg-category-delete="/);
  assert.match(html, /function saveSalonCategory\(category, message\)/);
  assert.match(html, /function renameSalonCategory\(categoryKey, nextName, nextKind\)/);
  assert.match(html, /function setSalonCategoryActive\(categoryKey, active\)/);
  assert.match(html, /var categoryAdd = e\.target\.closest\('\[data-mg-category-add\]'\);/);
  assert.match(html, /var categorySave = e\.target\.closest\('\[data-mg-category-save\]'\);/);
  assert.match(html, /var categoryDelete = e\.target\.closest\('\[data-mg-category-delete\]'\);/);
  assert.match(servicesRuntime, /serviceCollapsedCategories\[serviceCategoryKey\(group\.name\)\]/);
  assert.match(servicesRuntime, /data-mg-service-category-toggle="/);
  assert.match(servicesRuntime, /data-mg-service-add-category="/);
  assert.match(servicesRuntime, /aria-expanded="/);
  assert.match(servicesRuntime, /data-mg-service-category-group="/);
  assert.match(servicesRuntime, /data-mg-service-card-category="/);
  assert.match(html, /var serviceCategoryAdd = e\.target\.closest\('\[data-mg-service-add-category\]'\);/);
  assert.match(html, /openServiceModal\(null, 'add', serviceCategoryAdd\.getAttribute\('data-mg-service-add-category'\)\);/);
  assert.match(html, /var serviceCategoryToggle = e\.target\.closest\('\[data-mg-service-category-toggle\]'\);/);
  assert.ok(
    html.indexOf("var serviceCategoryAdd = e.target.closest('[data-mg-service-add-category]');") <
      html.indexOf("var serviceCategoryToggle = e.target.closest('[data-mg-service-category-toggle]');"),
    'category Add service click should run before category collapse toggle'
  );
  assert.match(html, /var serviceCategoryStateKey = serviceCategoryKey\(serviceCategoryToggle\.getAttribute\('data-mg-service-category-toggle'\)\);/);
  assert.match(html, /serviceCollapsedCategories\[serviceCategoryStateKey\] = !serviceCollapsedCategories\[serviceCategoryStateKey\];/);
  assert.match(servicesRuntime, /var serviceBodyHtml = serviceViewMode === 'card' \? serviceCardsHtml : serviceTableHtml;/);
  assert.doesNotMatch(servicesRuntime, /data-mg-service-(?:table|cards)[\s\S]{0,120}hidden/);
  assert.match(servicesRuntime, /<th>Service<\/th><th>Price<\/th><th>Minutes<\/th><th>Status<\/th><th>Category<\/th><th>Actions<\/th>/);
  assert.doesNotMatch(servicesRuntime, /<th>Description<\/th>|<th>Includes<\/th>|<th>Skill<\/th>|<th>Type<\/th>/);
  assert.match(servicesRuntime, /data-mg-service-add/);
  assert.match(servicesRuntime, /data-mg-service-view="/);
  assert.match(servicesRuntime, /data-mg-service-edit="/);
  assert.match(servicesRuntime, /data-mg-service-delete="/);
  assert.doesNotMatch(servicesRuntime, /data-mg-service-name="/);
  assert.match(html, /data-mg-service-modal/);
  assert.match(managementPanel, /class="sms-modal service-editor-modal" data-mg-service-modal/);
  assert.match(managementPanel, /class="sms-dialog service-editor-dialog"/);
  assert.match(managementPanel, /data-mg-service-modal-subtitle/);
  assert.match(managementPanel, /data-mg-service-summary/);
  assert.match(managementPanel, /data-mg-service-detail/);
  assert.match(managementPanel, /data-mg-service-form-shell/);
  assert.match(managementPanel, /data-mg-service-cancel-label/);
  assert.match(managementPanel, /class="service-editor-grid service-editor-grid-main"/);
  assert.match(managementPanel, /class="service-editor-grid service-editor-grid-three"/);
  assert.match(managementPanel, /data-mg-service-save-label/);
  assert.match(html, /\.service-editor-dialog\s*\{/);
  assert.match(html, /\.service-editor-body\s*\{/);
  assert.match(html, /function serviceModalSummaryHtml\(service, mode\)/);
  assert.match(html, /function serviceDetailHtml\(service\)/);
  assert.match(html, /function openServiceModal\(id, mode, categoryName\)/);
  assert.match(serviceModalRuntime, /var categoryPrefill = !serviceModalId && categoryName \? categoryName : '';/);
  assert.match(serviceModalRuntime, /categoryEl\.value = service \? service\.categoryName \|\| '' : categoryPrefill;/);
  assert.match(serviceModalRuntime, /modal\.setAttribute\('data-service-modal-mode', serviceModalMode\)/);
  assert.match(serviceModalRuntime, /subtitleEl\.textContent = serviceModalMode === 'add' \? 'Create a new menu service' : \(isReadOnly \? 'Read-only service detail' : 'Update service details'\);/);
  assert.match(serviceModalRuntime, /summaryEl\.innerHTML = serviceModalSummaryHtml\(summaryService, serviceModalMode\);/);
  assert.match(serviceModalRuntime, /detailEl\.innerHTML = isReadOnly \? serviceDetailHtml\(service\) : '';/);
  assert.match(serviceModalRuntime, /detailEl\.hidden = !isReadOnly;/);
  assert.match(serviceModalRuntime, /formShellEl\.hidden = isReadOnly;/);
  assert.match(serviceModalRuntime, /summaryEl\.hidden = isReadOnly;/);
  assert.match(serviceModalRuntime, /serviceModalCancelLabel\.textContent = isReadOnly \? 'Close' : 'Cancel';/);
  assert.match(serviceModalRuntime, /saveLabelEl\.textContent = serviceModalMode === 'add' \? 'Create service' : 'Save changes';/);
  assert.match(html, /openServiceModal\(serviceView\.getAttribute\('data-mg-service-view'\), 'view'\)/);
  assert.match(serviceModalRuntime, /data-mg-service-form-name/);
  assert.match(serviceModalRuntime, /data-mg-service-form-category/);
  assert.match(serviceModalRuntime, /data-mg-service-form-price/);
  assert.match(serviceModalRuntime, /data-mg-service-form-duration/);
  assert.match(serviceModalRuntime, /data-mg-service-form-skill/);
  assert.match(serviceModalRuntime, /data-mg-service-form-description/);
  assert.match(serviceModalRuntime, /data-mg-service-form-includes/);
  assert.match(html, /function serviceIncludesFromText\(value\)/);
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
