const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, 'pos-phase-1.html'), 'utf8');
const runtime = fs.readFileSync(path.join(__dirname, '..', 'assets', 'pos-booking-runtime.js'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, '..', 'assets', 'pos-booking.css'), 'utf8');
const source = html + '\n' + runtime;

test('POS exposes Booking instead of the legacy Appointments tab', () => {
  assert.match(html, /\.\.\/assets\/pos-booking\.css/);
  assert.match(html, /\.\.\/assets\/pos-booking-runtime\.js/);
  assert.match(source, /data-pos-tab="booking"/);
  assert.match(source, /data-pos-panel="booking"/);
  assert.doesNotMatch(source, /data-pos-tab="appointments"/);
  assert.doesNotMatch(source, /data-pos-panel="appointments"/);
});

test('POS loads the shared shell stylesheet after workspace overrides', () => {
  const bookingCssIndex = html.indexOf('../assets/pos-booking.css');
  const shellCssIndex = html.indexOf('../assets/nexora-shell.css');

  assert.ok(bookingCssIndex >= 0, 'POS Booking stylesheet should be present');
  assert.ok(shellCssIndex > bookingCssIndex, 'shared shell stylesheet must load last');
  assert.doesNotMatch(css, /@media\s*\(min-width:\s*1024px\)[\s\S]{0,300}\.app-area/);
  assert.match(css, /@media\s*\(min-width:\s*1366px\)[\s\S]{0,300}\.app-area/);
});

test('POS Booking exposes the full Booking Book workspace contract', () => {
  for (const hook of [
    'data-booking-legacy-appointments',
    'data-booking-table',
    'data-booking-subtab-target="calendar"',
    'id="booking-subpanel-calendar"',
    'data-booking-filter-toggle="booking"',
    'data-booking-appointment-panel',
    'data-booking-create-modal',
    'data-booking-create-save',
    'data-booking-action="detail"',
    'data-booking-action="send-sms"'
  ]) assert.match(source, new RegExp(hook));
});

test('POS Booking keeps Calendar as a subtab and Table/Card as the Appointments modes', () => {
  assert.match(source, /data-booking-subtab-target="today"[^>]*aria-controls="booking-subpanel-today"/);
  assert.match(source, /data-booking-subtab-target="calendar"[^>]*aria-controls="booking-subpanel-calendar"/);
  assert.doesNotMatch(source, /data-booking-subtab-target="team"/);
  assert.match(source, /id="booking-subpanel-calendar" data-booking-sub-panel="calendar"/);
  assert.match(source, /data-booking-view-target="table"/);
  assert.match(source, /data-booking-view-target="card"/);
  assert.doesNotMatch(source, /data-booking-view-target="calendar"/);
  assert.doesNotMatch(source, /data-booking-view-panel="calendar"/);
  assert.match(source, /data-booking-appointment-panel[^>]*hidden/);
});

test('POS Booking Appointments Overview exposes Upcoming customer filter chip', () => {
  const overviewChips = html.match(/<div class="booking-status-chips" data-booking-status-chips[\s\S]*?<\/div>/)?.[0] || '';

  assert.match(overviewChips, /data-booking-status-chip="upcoming"[^>]*>Upcoming/);
  assert.match(overviewChips, /data-booking-status-count="upcoming"/);
  assert.match(runtime, /function isBookingUpcomingItem\(item\)/);
  assert.match(runtime, /!item\.classList\.contains\(BOOKING_STATUS_CLASS\['checked-out'\]\)/);
  assert.match(runtime, /if \(isBookingUpcomingItem\(item\)\) counts\.upcoming\+\+;/);
  assert.match(runtime, /bookingStatusFilter === 'upcoming'\s*\?\s*isBookingUpcomingItem\(item\)/);
  assert.match(runtime, /var isValid = status === 'all' \|\| status === 'upcoming' \|\| BOOKING_STATUS_CLASS\[status\];/);
});

test('POS Booking starts in Appointments Table mode and opens Calendar on its subtab', () => {
  assert.match(runtime, /function activateBookingSubTab\([\s\S]*target === 'calendar'[\s\S]*initBookingCalendar\(\)/);
  // initBookingViewMode defaults to 'card' on narrow screens (<=1366px) and 'table' otherwise.
  assert.match(runtime, /function initBookingViewMode\([\s\S]*setBookingViewMode\([\s\S]{0,120}'table'/);
  assert.doesNotMatch(runtime, /setBookingViewMode\('calendar'\)/);
  assert.match(runtime, /appointmentPanel\.hidden = target !== 'calendar'/);
});

test('POS Booking View actions open the appointment detail modal', () => {
  assert.match(runtime, /bookingAction\.dataset\.bookingAction === ['"]detail['"][\s\S]*?openBookingDetailModal\(item\)/);
  assert.match(runtime, /window\.openBookingDetailById = function\(id\)/);
  assert.match(runtime, /data-booking-detail-checkin="' \+ escapeHtml\(item\.dataset\.bookingId\)/);
  assert.match(html, /window\.NEXORA_POS_BOOKING_CHECKIN = function \(bookingId\)/);
  assert.match(html, /var bookingDetailCheckin = e\.target\.closest\('\[data-booking-detail-checkin\]'\);/);
});

test('turns the appointment panel into a responsive modal below 1400px', () => {
  assert.match(html, /data-booking-appointment-backdrop/);
  assert.match(runtime, /function syncBookingAppointmentPanelPresentation\(/);
  assert.match(runtime, /booking-appointment-panel-modal-open/);
  assert.match(runtime, /data-booking-appointment-backdrop/);
  assert.match(runtime, /event\.key === 'Escape'[\s\S]*closeBookingAppointmentPanel\(\)/);
  assert.match(css, /@media\s*\(max-width:\s*1399px\)/);
  assert.match(css, /data-booking-panel-presentation="modal"/);
  assert.match(css, /\.booking-appointment-backdrop\s*\{/);
  assert.match(css, /\.booking-appointment-main\s*\{\s*overflow-x:\s*auto/);
  assert.match(source, /data-booking-panel-action="close"[^>]*aria-label="Close appointment details"/);
  const mobileModalBlock = css.match(/@media\s*\(max-width:\s*600px\)\s*\{(?:(?!@media)[\s\S])*?\.booking-appointment-panel\[data-booking-panel-presentation="modal"\]\s*\{([\s\S]*?)\n\s*\}/)?.[1] || '';
  assert.match(mobileModalBlock, /top:\s*50%;/);
  assert.match(mobileModalBlock, /left:\s*50%;/);
  assert.match(mobileModalBlock, /transform:\s*translate\(-50%,\s*-50%\)/);
  assert.doesNotMatch(mobileModalBlock, /bottom:\s*0;/);
});

test('lays out overview KPIs with flex instead of CSS grid', () => {
  const overviewKpisBlock = css.match(/\.overview-kpis\s*\{[^}]*\}/)?.[0] || '';
  const overviewKpiCardBlock = css.match(/\.overview-kpis\s*>\s*\.kpi-card\s*\{[^}]*\}/)?.[0] || '';
  const callStatsBlock = css.match(/#panel-calllog \.overview-kpis\[data-call-stats\]\s*\{[^}]*\}/)?.[0] || '';
  const overviewKpiScopedBlocks = css.match(/\.overview-kpis(?:\s|>|\[)[^{]*\{[^}]*\}/g) || [];
  const kpiCardLayoutBlock = overviewKpiScopedBlocks.find((block) => (
    /\.overview-kpis\s+\.kpi-card\s*\{/.test(block) && /display:/.test(block)
  )) || '';

  assert.match(overviewKpisBlock, /display:\s*flex;/);
  assert.doesNotMatch(overviewKpisBlock, /\/\*\s*flex-wrap:\s*wrap|flex-wrap:\s*wrap/);
  assert.match(overviewKpiCardBlock, /flex:\s*1;/);
  assert.doesNotMatch(overviewKpiCardBlock, /flex:\s*1\s+1\s+220px|min-width:\s*min\(100%,\s*220px\)/);
  assert.match(kpiCardLayoutBlock, /display:\s*flex;/);
  assert.doesNotMatch(overviewKpisBlock, /grid-template-columns/);
  assert.doesNotMatch(callStatsBlock, /grid-template-columns/);
  assert.doesNotMatch(overviewKpiScopedBlocks.join('\n'), /display:\s*grid|grid-template-columns|grid-column|grid-row/);
});

test('POS Booking gives Appointments the full workspace width and reserves a Calendar detail rail', () => {
  assert.match(css, /\.booking-appointment-layout \{[\s\S]*grid-template-columns:\s*1fr/);
  assert.match(css, /\.booking-appointment-layout\[data-booking-layout="calendar"\] \{[\s\S]*grid-template-columns:\s*minmax\(0, 1fr\) 320px/);
  assert.match(runtime, /workspace\.dataset\.bookingLayout = target === 'calendar' \? 'calendar' : 'appointments'/);
});

test('POS Booking CSS closes shared rules before the Booking workspace rules', () => {
  assert.match(css, /\.owner-strip\s*\{[\s\S]*?padding:\s*16px;\s*\}\s*\.booking-toolbar\s*\{/);
  assert.match(css, /\.booking-subtab\s*\{[\s\S]*?border:\s*0;[\s\S]*?\}/);
});

test('POS Booking loads the shared catalog, ticket, store, and approved service catalog', () => {
  assert.match(source, /\.\.\/assets\/salon-data\.js/);
  assert.match(source, /\.\.\/assets\/appointment-service-catalog\.js/);
  assert.match(source, /\.\.\/assets\/appointment-tickets\.js/);
  assert.match(source, /\.\.\/assets\/appointments-store\.js/);
  assert.match(source, /\.\.\/menu\/menu\.json/);
  assert.match(source, /appointmentServiceCatalogLoader\.load/);
});

test('POS Booking uses the shared appointment store and no longer loads the phase-1 legacy seed runtime', () => {
  assert.match(source, /appointmentStore\.ensureSource\(/);
  assert.match(source, /appointmentStore\.subscribe\(/);
  assert.match(source, /appointmentStore\.(create|update|cancel)/);
  assert.doesNotMatch(source, /pos-appointments-data\.js/);
  assert.doesNotMatch(source, /function renderAppt\(/);
  assert.doesNotMatch(source, /data-ap-calendar/);
});

test('POS Booking rolls static demo rows to the current operating date before Check-in ETA reads them', () => {
  const demoDateScriptIndex = html.indexOf('../assets/booking-demo-date.js');
  const runtimeScriptIndex = html.indexOf('../assets/pos-booking-runtime.js');
  assert.ok(demoDateScriptIndex >= 0, 'booking demo date helper should load on POS');
  assert.ok(demoDateScriptIndex < runtimeScriptIndex, 'date helper must load before booking runtime');
  assert.match(runtime, /var BOOKING_STATIC_BASE_DATE = '2026-07-09'/);
  assert.match(runtime, /var BOOKING_TODAY_DATE = bookingDemoDate\.localDateKey\(\)/);
  assert.match(runtime, /normalizeBookingStaticDates\(initialBookingRows\);\s*\n\s*appointmentStore\.ensureSource\('booking-book-static-v1'/);
  assert.match(runtime, /repairBookingStaticDates\(initialBookingRows\);/);
});

test('POS Booking refreshes New appointment services from menu.json first', () => {
  assert.match(runtime, /var APPOINTMENT_SERVICE_CATALOG_URL = '\.\.\/menu\/menu\.json'/);
  assert.match(runtime, /var serviceSource = appointmentServiceCatalog && appointmentServiceCatalog\.services\.length/);
  assert.match(runtime, /\? appointmentServiceCatalog\.services\s*:\s*catalog\.services\.filter\(function\(service\) \{ return service\.active; \}\);/);
  assert.match(runtime, /render: function\(\) \{[\s\S]*rebuildBookingCatalogViews\(\);/);
});

test('POS keeps the shared mode and tab activation contracts', () => {
  assert.match(source, /var TABS = \['checkin', 'todaybooking', 'tickets', 'booking', 'customers', 'clock', 'management', 'printer'\]/);
  assert.match(source, /function activateTab\(id\)/);
  assert.match(source, /if \(id === ['"]booking['"]\)/);
  assert.match(source, /data-pos-mode-modal[^>]*role="dialog"/);
});

test('POS Booking preserves the shared appointment source and action behavior', () => {
  assert.match(runtime, /window\.NEXORA_POS_BOOKING\s*=\s*\{/);
  assert.match(source, /ensureSource\(['"]booking-book-static-v1/);
  assert.match(source, /function renderBookingStoreRows\(/);
  assert.match(source, /function sendBookingSms\(/);
  assert.match(source, /bookingAction\.dataset\.bookingAction === ['"]send-sms['"][\s\S]{0,180}sendBookingSms\(item\)/);
  assert.match(source, /data-booking-panel-action-group="operational"/);
  assert.match(source, /data-booking-panel-action-group="destructive"/);
});

test('POS Booking preserves source badges and selected service totals', () => {
  assert.match(source, /function bookingSourceBadgesFromText\(/);
  assert.match(source, /bookingSourceBadgesFromText\([\s\S]*booking-source-voice/);
  assert.match(source, /appointment-service-summary/);
  assert.match(source, /Total price:/);
  assert.match(source, /Total time:/);
  assert.match(source, /function bookingPanelSelectedServiceTotals\(/);
});

test('POS Booking uses the approved category ticket pickers in the appointment panel', () => {
  for (const hook of [
    'data-booking-panel-ticket-service-search',
    'data-booking-panel-ticket-tech-search',
    'data-booking-panel-ticket-add',
    'data-booking-panel-ticket-remove'
  ]) assert.match(source, new RegExp(hook));
  assert.doesNotMatch(source, /data-booking-panel-field="duration"/);
});

test('POS New appointment shows the full service picker before the technician selector', () => {
  const createModal = html.match(/<div class="booking-create-modal" data-booking-create-modal[\s\S]*?<div class="booking-create-error"/)?.[0] || '';
  const serviceIndex = createModal.indexOf('data-booking-create-field="service"');
  const techIndex = createModal.indexOf('data-booking-create-field="tech"');

  assert.match(createModal, /class="booking-service-chips"[\s\S]{0,120}data-booking-create-field="service"[\s\S]{0,120}aria-label="Select one or more services"/);
  assert.ok(serviceIndex >= 0, 'New appointment should expose a service picker');
  assert.ok(techIndex > serviceIndex, 'New appointment should choose services before technician');
  assert.doesNotMatch(createModal, /data-booking-create-ticket-tech-search|data-booking-create-ticket-add/);
  assert.match(runtime, /bookingCreateField\('service'\)\.innerHTML = bookingServicePickerMarkup\('create', \[\]\);/);
  assert.match(runtime, /function bookingCreateTicketsFromServices\(services\)/);
  assert.match(runtime, /var createTickets = bookingCreateTicketsFromServices\(services\);/);
  assert.match(runtime, /appointmentTicketUtils\.scheduleTickets\(createTickets, formatBookingCalendarDateTime\(start\)\)/);
});

test('POS New appointment services come from menu.json and render category chips', () => {
  const pickerMarkup = runtime.match(/function bookingServicePickerMarkup\(mode, selectedNames\) \{[\s\S]*?\n    \}/)?.[0] || '';

  assert.match(runtime, /var APPOINTMENT_SERVICE_CATALOG_URL = '\.\.\/menu\/menu\.json';/);
  assert.match(runtime, /appointmentServiceCatalogLoader\.load\(APPOINTMENT_SERVICE_CATALOG_URL\)/);
  assert.match(runtime, /function bookingServicePickerCategoryChips\(categories, activeCategoryId\)/);
  assert.doesNotMatch(runtime, /data-booking-service-category-chip="all"/);
  assert.match(runtime, /data-booking-service-category-filter/);
  assert.match(runtime, /class="category-trigger category-chip booking-service-category-chip/);
  assert.match(runtime, /category-chip-list/);
  assert.match(runtime, /aria-expanded="/);
  assert.match(pickerMarkup, /data-booking-service-category-id/);
  assert.match(pickerMarkup, /category-panel-list/);
  assert.match(pickerMarkup, /service-category-grid/);
  assert.doesNotMatch(pickerMarkup, /<details class="booking-service-category"|summary class="booking-service-category-head"/);
});

test('POS New appointment selected service shows a check mark instead of a filled background', () => {
  const pickerMarkup = runtime.match(/function bookingServicePickerMarkup\(mode, selectedNames\) \{[\s\S]*?\n    \}/)?.[0] || '';
  const selectedCardRule = css.match(/\.booking-service-chip-button\.service-card\.is-selected\s*\{([^}]*)\}/)?.[1] || '';

  assert.match(pickerMarkup, /booking-service-selected-check/);
  assert.match(css, /\.booking-service-selected-check/);
  assert.match(css, /\.booking-service-chip-button\.service-card\.is-selected \.booking-service-selected-check/);
  assert.match(selectedCardRule, /background:\s*#fff/);
  assert.doesNotMatch(selectedCardRule, /background:\s*var\(--nexora-brand\)|border-color:\s*transparent|color:\s*#fff/);
});

test('POS New appointment service cards stay compact', () => {
  const serviceCardRule = css.match(/\.booking-service-chip-button\.service-card\s*\{([^}]*)\}/)?.[1] || '';
  const selectedCheckRule = css.match(/\.booking-service-selected-check\s*\{([^}]*)\}/)?.[1] || '';

  assert.match(serviceCardRule, /min-height:\s*48px/);
  assert.match(serviceCardRule, /padding:\s*6px 30px 6px 8px/);
  assert.match(serviceCardRule, /gap:\s*2px/);
  assert.match(selectedCheckRule, /width:\s*18px/);
  assert.match(selectedCheckRule, /height:\s*18px/);
});

test('POS New appointment select arrows are inset from the right edge', () => {
  const selectRule = css.match(/\n\s*\.booking-select\s*\{([^}]*)\}/)?.[1] || '';

  assert.match(selectRule, /appearance:\s*none/);
  assert.match(selectRule, /-webkit-appearance:\s*none/);
  assert.match(selectRule, /padding-right:\s*40px/);
  assert.match(selectRule, /background-image:\s*url\("data:image\/svg\+xml/);
  assert.match(selectRule, /background-position:\s*right 18px center/);
  assert.match(selectRule, /background-size:\s*14px 14px/);
});

test('POS New appointment labels selected services before removable name chips', () => {
  const createModal = html.match(/<div class="booking-create-modal" data-booking-create-modal[\s\S]*?<div class="booking-create-error"/)?.[0] || '';
  const selectedIndex = createModal.indexOf('data-booking-create-selected-services');
  const summaryIndex = createModal.indexOf('class="booking-service-summary"');

  assert.match(createModal, /data-booking-create-field="service"[\s\S]*data-booking-create-selected-services/);
  assert.ok(selectedIndex >= 0, 'selected services list should exist below the picker');
  assert.ok(summaryIndex > selectedIndex, 'selected services should appear before total price and time');
  assert.match(runtime, /function renderBookingCreateSelectedServices\(\)/);
  assert.match(runtime + css, /booking-selected-services-title/);
  assert.match(runtime, />Selected services</);
  assert.match(runtime + css, /booking-selected-service-chip/);
  assert.match(runtime + css, /booking-selected-service-name/);
  assert.match(runtime, /data-booking-create-service-remove/);
  assert.match(runtime, /var bookingCreateServiceRemove = event\.target\.closest\('\[data-booking-create-service-remove\]'\);/);
  assert.match(runtime, /setBookingCreateServiceSelected\(button, false\);/);
  assert.doesNotMatch(runtime + css, /booking-selected-service-row|booking-selected-service-main|booking-selected-service-list/);
});

test('POS New appointment requires only phone', () => {
  const createModal = html.match(/<div class="booking-create-modal" data-booking-create-modal[\s\S]*?<div class="booking-create-error"/)?.[0] || '';
  const saveHandler = runtime.match(/function saveBookingFromCalendar\(\) \{[\s\S]*?\n    \}\n\n    function/)?.[0] || '';

  assert.match(createModal, /<span class="booking-create-label">Phone \*<\/span>[\s\S]*?data-booking-create-field="phone"[^>]*required/);
  assert.match(createModal, /<span class="booking-create-label">Customer name<\/span>/);
  assert.match(createModal, /<span class="booking-create-label">Services <span class="booking-create-hint">/);
  assert.match(createModal, /<span class="booking-create-label">Date<\/span>/);
  assert.match(createModal, /<span class="booking-create-label">Time<\/span>/);
  assert.equal((createModal.match(/\srequired(?=[\s>])/g) || []).length, 1);
  assert.match(saveHandler, /if \(!phone\) \{ setBookingCreateError\('Enter the phone number\.', 'phone'\); return; \}/);
  assert.doesNotMatch(saveHandler, /if \(!name\)|if \(!services\.length\)|if \(!date \|\| !time\)/);
  assert.match(saveHandler, /var name = get\('name'\)\.trim\(\) \|\| 'Guest';/);
});

test('POS responsive New appointment panel requires only phone', () => {
  const panelRenderer = runtime.match(/function renderBookingAppointmentPanel\(\) \{[\s\S]*?\n    \}\n\n    (?:window\.addEventListener|function openBookingAppointmentPanel)/)?.[0] || '';
  const payloadBuilder = runtime.match(/function bookingPanelCanonicalPayload\(\) \{[\s\S]*?\n    \}\n\n    function saveBookingAppointmentPanel/)?.[0] || '';

  assert.match(panelRenderer, /booking-create-label">Phone \*<\/span><input[^>]*data-booking-panel-field="phone"[^>]*required/);
  assert.match(panelRenderer, /booking-create-label">Customer<\/span><input[^>]*data-booking-panel-field="name"/);
  assert.match(payloadBuilder, /if \(!bookingPanelDraft\.phone\) return \{ error: 'Enter the phone number\.', field: 'phone' \};/);
  assert.doesNotMatch(payloadBuilder, /if \(!bookingPanelDraft\.name\)|if \(!bookingPanelTickets\.length\)|if \(!bookingPanelDraft\.date \|\| !bookingPanelDraft\.time\)/);
});

test('POS New appointment shows a red invalid border on failed phone validation', () => {
  const createValidation = runtime.match(/function setBookingCreateFieldInvalid\([\s\S]*?\n    \}\n\n    function setBookingCreateError/)?.[0] || '';
  const saveHandler = runtime.match(/function saveBookingFromCalendar\(\) \{[\s\S]*?\n    \}\n\n    function initBookingCalendar/)?.[0] || '';
  const inputHandler = runtime.match(/document\.addEventListener\('input', function\(event\) \{[\s\S]*?\n    \}\);/)?.[0] || '';

  assert.match(css, /\.booking-input\.is-invalid[\s\S]*?\.phone-input-shell\.is-invalid\s*\{[\s\S]*?border-color:\s*#dc2626/);
  assert.match(createValidation, /field\.classList\.toggle\('is-invalid', invalid\)/);
  assert.match(createValidation, /field\.setAttribute\('aria-invalid', 'true'\)/);
  assert.match(createValidation, /shell\.classList\.toggle\('is-invalid', invalid\)/);
  assert.match(saveHandler, /if \(!phone\) \{ setBookingCreateError\('Enter the phone number\.', 'phone'\); return; \}/);
  assert.match(inputHandler, /clearBookingCreateInvalidField\(createField\)/);
});

test('POS responsive New appointment panel keeps the invalid phone border after rerendering its warning', () => {
  const panelRenderer = runtime.match(/function renderBookingAppointmentPanel\(\) \{[\s\S]*?\n    \}\n\n    (?:window\.addEventListener|function openBookingAppointmentPanel)/)?.[0] || '';
  const payloadBuilder = runtime.match(/function bookingPanelCanonicalPayload\(\) \{[\s\S]*?\n    \}\n\n    function saveBookingAppointmentPanel/)?.[0] || '';
  const savePanel = runtime.match(/function saveBookingAppointmentPanel\(\) \{[\s\S]*?\n    \}\n\n    function setBookingPanelStatus/)?.[0] || '';

  assert.match(panelRenderer, /class="booking-input' \+ bookingPanelInvalidClass\('phone'\) \+ '"/);
  assert.match(panelRenderer, /data-booking-panel-field="phone"[\s\S]{0,120}bookingPanelInvalidAttributes\('phone'\)[\s\S]{0,40}required/);
  assert.match(payloadBuilder, /if \(!bookingPanelDraft\.phone\) return \{ error: 'Enter the phone number\.', field: 'phone' \};/);
  assert.match(savePanel, /bookingPanelSetWarning\(prepared\.error, prepared\.field\)/);
});

test('POS Booking labels the appointment time field as Time', () => {
  assert.match(runtime, /<span class="booking-create-label">Time<\/span><input class="booking-input' \+ bookingPanelInvalidClass\('time'\) \+ '" type="time"[\s\S]*data-booking-panel-field="time"/);
  assert.doesNotMatch(runtime, /<span class="booking-create-label">Start time<\/span>/);
});

test('POS Booking keeps native date fields while Management owns the scoped Flatpickr week picker', () => {
  assert.match(html, /<input class="booking-input" type="date"[^>]*data-booking-date-from>/);
  assert.match(html, /<input class="booking-input" type="date"[^>]*data-booking-date-to>/);
  assert.match(runtime, /bookingDateFrom\.addEventListener\('change', filterBookingItems\)/);
  assert.match(runtime, /bookingDateTo\.addEventListener\('change', filterBookingItems\)/);
  assert.doesNotMatch(runtime, /flatpickr/i);
  assert.match(html, /document\.querySelectorAll\('\[data-mg-week\]'\)[\s\S]{0,400}window\.flatpickr\(input,/);
});

test('POS Booking renders a shared DayPilot resource calendar', () => {
  assert.match(source, /@daypilot\/daypilot-lite-javascript@5\.9\.0\/daypilot-javascript\.min\.js/);
  assert.match(source, /new DayPilot\.Calendar/);
  assert.match(source, /viewType:\s*'Resources'/);
  assert.match(source, /onEventMoved/);
  assert.match(source, /onEventResized/);
  assert.match(source, /data-booking-team-calendar/);
});

test('POS keeps create actions at the right edge of their action rows', () => {
  const bookingPanel = html.match(/id="booking-subpanel-today"[\s\S]*?id="booking-subpanel-team"/)?.[0] || '';
  const addOverviewIndex = bookingPanel.indexOf('data-booking-appointments-add');
  const viewSwitchIndex = bookingPanel.indexOf('data-booking-view-target="table"');
  const addAppointmentIndex = bookingPanel.indexOf('data-booking-calendar-add');
  const filterIndex = bookingPanel.indexOf('data-booking-filter-toggle="booking"');
  const staffRuntime = source.match(/function mgStaffHtml\(\)[\s\S]*?function mgRolesHtml\(\)/)?.[0] || '';
  const createAccountIndex = staffRuntime.indexOf('data-mg-stadd');
  const staffHintIndex = staffRuntime.indexOf('Techs (with pay and turns)');

  assert.ok(addOverviewIndex > viewSwitchIndex, 'POS New appointment should follow the view switch');
  assert.ok(addOverviewIndex > filterIndex, 'POS New appointment should be the rightmost overview action');
  assert.ok(addAppointmentIndex > filterIndex, 'POS New appointment should be the rightmost booking action');
  assert.ok(createAccountIndex > staffHintIndex, 'POS Create account should be the rightmost staff action');
});

test('POS has no independent technician or service catalog literals', () => {
  assert.doesNotMatch(source, /var TECHS = \[\s*{/);
  assert.doesNotMatch(source, /var MENU = \[\s*{/);
  assert.doesNotMatch(source, /var APPOINTMENT_MENU = \[\s*{/);
});

test('POS retains salon-scoped storage and unknown-record safeguards', () => {
  assert.match(source, /NEXORA_APPOINTMENTS_STORE/);
  assert.match(source, /storage/);
  assert.match(source, /serviceNames/);
  assert.match(source, /cancelled/);
});
