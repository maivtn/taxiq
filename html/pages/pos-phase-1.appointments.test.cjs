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

test('POS Booking exposes the full Booking Book workspace contract', () => {
  for (const hook of [
    'data-booking-legacy-appointments',
    'data-booking-table',
    'data-booking-view-target="calendar"',
    'data-booking-filter-toggle="booking"',
    'data-booking-appointment-panel',
    'data-booking-create-modal',
    'data-booking-create-save',
    'data-booking-action="detail"',
    'data-booking-action="send-sms"'
  ]) assert.match(source, new RegExp(hook));
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
  assert.match(source, /booking-service-catalog-draft\.json/);
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

test('POS keeps the shared mode and tab activation contracts', () => {
  assert.match(source, /var TABS = \['dispatch', 'clock', 'management', 'booking'\]/);
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
  const addAppointmentIndex = bookingPanel.indexOf('data-booking-calendar-add');
  const filterIndex = bookingPanel.indexOf('data-booking-filter-toggle="booking"');
  const staffRuntime = source.match(/function mgStaffHtml\(\)[\s\S]*?function mgRolesHtml\(\)/)?.[0] || '';
  const createAccountIndex = staffRuntime.indexOf('data-mg-stadd');
  const staffHintIndex = staffRuntime.indexOf('Techs (with pay and turns)');

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
