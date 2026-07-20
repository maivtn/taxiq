const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, 'pos-phase-1.html'), 'utf8');

test('appointments tab loads FullCalendar and the external JavaScript seed data', () => {
  assert.match(html, /fullcalendar@7\.0\.0\/all\/global\.min\.js/);
  assert.match(html, /pos-appointments-data\.js/);
  assert.match(html, /data-ap-calendar/);
  assert.match(html, /new FullCalendar\.Calendar/);
});

test('appointments calendar exposes professional scheduling controls', () => {
  assert.match(html, /timeGridWeek/);
  assert.match(html, /timeGridDay/);
  assert.match(html, /listWeek/);
  assert.match(html, /eventDrop/);
  assert.match(html, /eventResize/);
  assert.match(html, /data-ap-tech-filter/);
});

test('legacy hand-built appointment table is removed', () => {
  assert.doesNotMatch(html, /data-ap-table/);
  assert.doesNotMatch(html, /class="ap-table"/);
});

test('calendar configuration uses FullCalendar 7 option names', () => {
  assert.match(html, /slotHeaderInterval:\s*'01:00:00'/);
  assert.doesNotMatch(html, /themeSystem:/);
  assert.doesNotMatch(html, /buttonText:/);
  assert.doesNotMatch(html, /apCalendar\.updateSize/);
});
