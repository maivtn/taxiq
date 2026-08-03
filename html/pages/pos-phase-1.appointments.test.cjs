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
  assert.match(css, /@media\s*\(min-width:\s*1201px\)[\s\S]{0,300}\.app-area/);
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

test('POS Booking starts in Appointments Table mode and opens Calendar on its subtab', () => {
  assert.match(runtime, /function activateBookingSubTab\([\s\S]*target === 'calendar'[\s\S]*initBookingCalendar\(\)/);
  assert.match(runtime, /function initBookingViewMode\([\s\S]*setBookingViewMode\('table'\)/);
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

test('lays out overview KPIs with flex wrapping instead of CSS grid', () => {
  const overviewKpisBlock = css.match(/\.overview-kpis\s*\{[^}]*\}/)?.[0] || '';
  const overviewKpiCardBlock = css.match(/\.overview-kpis\s*>\s*\.kpi-card\s*\{[^}]*\}/)?.[0] || '';
  const callStatsBlock = css.match(/#panel-calllog \.overview-kpis\[data-call-stats\]\s*\{[^}]*\}/)?.[0] || '';
  const overviewKpiScopedBlocks = css.match(/\.overview-kpis(?:\s|>|\[)[^{]*\{[^}]*\}/g) || [];
  const kpiCardLayoutBlock = overviewKpiScopedBlocks.find((block) => (
    /\.overview-kpis\s+\.kpi-card\s*\{/.test(block) && /display:/.test(block)
  )) || '';

  assert.match(overviewKpisBlock, /display:\s*flex;/);
  assert.match(overviewKpisBlock, /flex-wrap:\s*wrap;/);
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

test('POS Booking refreshes from the salon-managed menu service catalog', () => {
  assert.match(runtime, /var APPOINTMENT_SERVICE_CATALOG_URL = '\.\.\/menu\/menu\.json'/);
  assert.match(runtime, /catalogUsesMenuServices\(catalog\)/);
  assert.match(runtime, /var activeSalonServices = catalog\.services\.filter\(function\(service\) \{ return service\.active; \}\)/);
  assert.match(runtime, /render: function\(\) \{[\s\S]*rebuildBookingCatalogViews\(\);/);
});

test('POS keeps the shared mode and tab activation contracts', () => {
  assert.match(source, /var TABS = \['checkin', 'tickets', 'booking', 'customers', 'clock', 'management'\]/);
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

test('POS Booking uses the approved category ticket pickers', () => {
  for (const hook of [
    'data-booking-panel-ticket-service-search',
    'data-booking-panel-ticket-tech-search',
    'data-booking-panel-ticket-add',
    'data-booking-panel-ticket-remove',
    'data-booking-create-ticket-service-search',
    'data-booking-create-ticket-tech-search',
    'data-booking-create-ticket-add'
  ]) assert.match(source, new RegExp(hook));
  assert.doesNotMatch(source, /data-booking-panel-field="duration"/);
});

test('POS Booking labels the appointment time field as Time', () => {
  assert.match(runtime, /<span class="booking-create-label">Time<\/span><input class="booking-input" type="time"[\s\S]*data-booking-panel-field="time"/);
  assert.doesNotMatch(runtime, /<span class="booking-create-label">Start time<\/span>/);
});

test('POS Booking uses native date fields without Flatpickr popup containers', () => {
  assert.match(html, /<input class="booking-input" type="date"[^>]*data-booking-date-from>/);
  assert.match(html, /<input class="booking-input" type="date"[^>]*data-booking-date-to>/);
  assert.match(runtime, /bookingDateFrom\.addEventListener\('change', filterBookingItems\)/);
  assert.match(runtime, /bookingDateTo\.addEventListener\('change', filterBookingItems\)/);
  assert.doesNotMatch(source, /flatpickr/i);
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
