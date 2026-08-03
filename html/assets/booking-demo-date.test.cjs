const test = require('node:test');
const assert = require('node:assert/strict');

const demoDate = require('./booking-demo-date.js');

test('booking demo dates roll the static July fixture onto the current operating date', () => {
  assert.equal(demoDate.rollDateKey('2026-07-09', '2026-07-09', '2026-08-03'), '2026-08-03');
  assert.equal(demoDate.rollDateKey('2026-07-17', '2026-07-09', '2026-08-03'), '2026-08-11');
  assert.equal(demoDate.shiftDateTime('2026-07-09T14:30:00', '2026-07-09', '2026-08-03'), '2026-08-03T14:30:00');
});
