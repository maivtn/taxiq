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
