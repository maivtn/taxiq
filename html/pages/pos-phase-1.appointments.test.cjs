const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, 'pos-phase-1.html'), 'utf8');

test('appointments tab loads DayPilot Lite and the external JavaScript seed data', () => {
  assert.match(html, /@daypilot\/daypilot-lite-javascript@5\.9\.0\/daypilot-javascript\.min\.js/);
  assert.match(html, /pos-appointments-data\.js/);
  assert.match(html, /data-ap-calendar/);
  assert.match(html, /new DayPilot\.Calendar/);
});

test('appointments calendar renders technicians as resource columns with time on the vertical axis', () => {
  assert.match(html, /viewType:\s*'Resources'/);
  assert.match(html, /columns:\s*apResourceColumns\(\)/);
  assert.match(html, /resource:\s*booking\.techId \|\| 'unassigned'/);
  assert.match(html, /onEventMoved/);
  assert.match(html, /onEventResized/);
  assert.match(html, /data-ap-tech-filter/);
});

test('empty appointment cells expose a subtle create affordance that keeps cell selection clickable', () => {
  assert.match(html, /onBeforeCellRender/);
  assert.match(html, /ap-cell-add/);
  assert.match(html, /pointer-events:\s*none/);
  assert.match(html, /onTimeRangeSelected:[\s\S]*apOpenNew/);
});

test('selected time ranges stay highlighted while the new appointment form is open', () => {
  assert.match(html, /onTimeRangeSelected:\s*function \(args\) \{[\s\S]*apOpenNew/);
  assert.doesNotMatch(html, /onTimeRangeSelected:\s*function \(args\) \{[\s\S]{0,260}apCalendar\.clearSelection\(\)/);
  assert.match(html, /data-ap-close\][\s\S]{0,220}apCalendar\.clearSelection\(\)/);
  assert.match(html, /calendar_default_shadow_inner/);
});

test('team calendar applies a polished resource-grid visual treatment', () => {
  assert.match(html, /calendar_default_colheader_inner/);
  assert.match(html, /calendar_default_rowheader_inner/);
  assert.match(html, /calendar_default_event_inner/);
  assert.match(html, /\.ap-cell-add\s*>\s*span/);
});

test('opening a new appointment gives the soft detail card a short loading state', () => {
  assert.match(html, /apPanelLoading/);
  assert.match(html, /ap-panel-loading/);
  assert.match(html, /aria-busy/);
  assert.match(html, /function apBeginNewPanelLoad/);
  assert.match(html, /function apOpenNew[\s\S]{0,900}apBeginNewPanelLoad\(\)/);
});

test('legacy hand-built appointment table is removed', () => {
  assert.doesNotMatch(html, /data-ap-table/);
  assert.doesNotMatch(html, /class="ap-table"/);
});

test('legacy date-column FullCalendar integration is removed', () => {
  assert.doesNotMatch(html, /new FullCalendar\.Calendar/);
  assert.doesNotMatch(html, /timeGridWeek/);
  assert.doesNotMatch(html, /fullcalendar@7\.0\.0/);
});

test('SMS is not exposed as a POS tab because SMS Campaigns lives in Booking Hub', () => {
  assert.doesNotMatch(html, /data-pos-tab="sms"/);
  assert.doesNotMatch(html, /var TABS = \[[^\]]*['"]sms['"]/);
  assert.match(html, /data-pos-tab="appointments"/);
});

test('appointments page loads shared salon catalog and appointment store', () => {
  assert.match(html, /\.\.\/assets\/salon-data\.js/);
  assert.match(html, /\.\.\/assets\/appointments-store\.js/);
});

test('POS migrates seed data into the shared appointment store', () => {
  assert.match(html, /ensureSource\(['"]pos-seed-v1/);
  assert.match(html, /createMigrationSeed\(/);
  assert.match(html, /appointmentStore\.(create|upsert|update)|store\.(create|upsert|update)/);
  assert.match(html, /appointmentStore\.cancel|store\.cancel/);
  assert.match(html, /appointmentStore\.subscribe|store\.subscribe/);
});

test('POS has no independent technician or service catalog literals', () => {
  assert.doesNotMatch(html, /var TECHS = \[\s*{/);
  assert.doesNotMatch(html, /var MENU = \[\s*{/);
});

test('POS derives appointment resources from the shared active roster', () => {
  assert.match(html, /salonCatalog\.technicians/);
  assert.doesNotMatch(html, /var TECHS = \[\s*{/);
});

test('POS retains salon-scoped storage and unknown-record safeguards', () => {
  assert.match(html, /NEXORA_APPOINTMENTS_STORE/);
  assert.match(html, /storage/);
  assert.match(html, /serviceNames/);
  assert.match(html, /cancelled/);
});

test('POS appointment panel exposes shared operational actions', () => {
  assert.match(html, /data-ap-panel/);
  assert.match(html, /data-ap-action="send-sms"/);
  assert.match(html, /data-ap-action="done"/);
  assert.match(html, /data-ap-action="noshow"/);
  assert.match(html, /data-ap-action-group="operational"/);
  assert.match(html, /data-ap-action-group="destructive"/);
  assert.match(html, /appointmentStore\.(update|cancel)/);
  assert.match(html, /function apApplySharedAction\(/);
});

test('POS appointment metadata shows explicit status and source labels', () => {
  assert.match(html, /data-ap-meta="status"[\s\S]*?Status:/);
  assert.match(html, /data-ap-meta="status"[\s\S]*?pos-chip/);
  assert.match(html, /data-ap-meta="source"[\s\S]*?Nguồn:/);
  assert.match(html, /data-ap-meta="source"[\s\S]*?pos-chip/);
});

test('POS appointment card uses the appointment details title', () => {
  assert.match(html, /Appointment details/);
  assert.doesNotMatch(html, /Edit appointment/);
});

test('POS appointment details expose the booking source', () => {
  assert.match(html, /Nguồn:/);
  assert.match(html, /data-ap-source/);
  assert.match(html, /function apSourceLabel\(/);
});

test('POS marks new appointments as front-desk manual additions', () => {
  assert.match(html, /['"]manual-add['"]/);
  assert.match(html, /['"]manual add['"]:\s*'Manual add'/);
});

test('POS calendar events use the shared appointment fields', () => {
  assert.match(html, /function apServiceSummary\(/);
  assert.match(html, /apServiceSummary\([\s\S]*serviceDetails/);
  assert.match(html, /apEvent[\s\S]*booking\.phone/);
  assert.match(html, /apEvent[\s\S]*booking\.note/);
  assert.match(html, /data-apf="note"/);
  assert.match(html, /note:\s*apDraft\.note/);
});

test('POS calendar uses the shared calendar header and status contract', () => {
  assert.match(html, /9:00 AM – 7:00 PM · appointments grouped by technician/);
  assert.match(html, /AP_STATUS = \{ pending: 'Pending', confirmed: 'Confirmed', 'checked-in': 'Checked in', completed: 'Completed', 'no-show': 'No show' \}/);
  assert.match(html, /data-ap-action-group="operational"/);
  assert.match(html, /data-ap-action-group="destructive"/);
});

test('POS action cluster follows the Booking action order and groups Close separately', () => {
  assert.match(html, /data-ap-save[\s\S]*data-ap-action-group="operational"[\s\S]*data-ap-action-group="destructive"[\s\S]*data-ap-action-group="close"/);
  assert.match(html, /data-ap-action-group="operational"[\s\S]*data-ap-action="send-sms"[\s\S]*data-ap-action="done"[\s\S]*data-ap-action="noshow"/);
  assert.match(html, /\.ap-panel-actions \{ display: grid; grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(html, /\.ap-action-destructive, \.ap-action-close \{ margin-top: 8px; padding-top: 8px; border-top: 1px solid var\(--nexora-rule\); \}/);
  assert.match(html, /@media \(max-width: 600px\) \{[\s\S]*\.ap-panel-actions \{ grid-template-columns: 1fr; \}/);
});

test('POS duration is read-only text derived from selected services', () => {
  assert.doesNotMatch(html, /<select class="pos-input" data-apf="duration">/);
  assert.match(html, /class="ap-duration-label" data-apf="duration"/);
  assert.match(html, /function apSelectedServiceDuration\(/);
  assert.match(html, /apDraft\.duration = apSelectedServiceDuration\(\)/);
});

test('POS service chips use the shared name-price-duration format without icons', () => {
  assert.match(html, /data-apsvc="' \+ c\.id \+ '"[^>]*>' \+ esc\(c\.label\) \+ ' · \$'/);
  assert.doesNotMatch(html, /data-apsvc="' \+ c\.id \+ '"[^>]*>' \+ c\.icon/);
  assert.doesNotMatch(html, /return service \? service\.icon \+ ' ' \+ service\.name/);
});

test('POS removes decorative icons from imported service names', () => {
  assert.match(html, /function apServiceDisplayName\(/);
  assert.match(html, /apExternalSvc\.push\(displayName\)/);
  assert.doesNotMatch(html, /title="Imported service">↗ /);
});
