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

test('legacy hand-built appointment table is removed', () => {
  assert.doesNotMatch(html, /data-ap-table/);
  assert.doesNotMatch(html, /class="ap-table"/);
});

test('legacy date-column FullCalendar integration is removed', () => {
  assert.doesNotMatch(html, /new FullCalendar\.Calendar/);
  assert.doesNotMatch(html, /timeGridWeek/);
  assert.doesNotMatch(html, /fullcalendar@7\.0\.0/);
});
