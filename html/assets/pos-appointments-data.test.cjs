const test = require('node:test');
const assert = require('node:assert/strict');

const {
  createSeedBookings,
  formatLocalDateTime,
  hasTechConflict,
} = require('./pos-appointments-data.js');

test('createSeedBookings builds a realistic multi-day appointment dataset', () => {
  const anchor = new Date(2026, 6, 20, 8, 0, 0);
  const bookings = createSeedBookings(anchor);

  assert.ok(bookings.length >= 12);
  assert.equal(new Set(bookings.map((booking) => booking.id)).size, bookings.length);
  assert.ok(bookings.some((booking) => booking.day === 'today'));
  assert.ok(bookings.some((booking) => booking.day === 'tomorrow'));
  assert.ok(bookings.some((booking) => booking.techId === null));
  assert.ok(bookings.every((booking) => new Date(booking.end) > new Date(booking.start)));
  assert.ok(bookings.every((booking) => Array.isArray(booking.serviceIds) && booking.serviceIds.length));
});

test('formatLocalDateTime preserves local calendar fields without a UTC shift', () => {
  const localDate = new Date(2026, 6, 20, 14, 30, 0);

  assert.equal(formatLocalDateTime(localDate), '2026-07-20T14:30:00');
});

test('hasTechConflict detects overlaps for the same technician', () => {
  const bookings = [
    { id: 'existing', techId: 't1', start: '2026-07-20T10:00:00', end: '2026-07-20T11:00:00' },
  ];

  assert.equal(hasTechConflict(bookings, {
    techId: 't1', start: '2026-07-20T10:30:00', end: '2026-07-20T11:30:00',
  }), true);
  assert.equal(hasTechConflict(bookings, {
    techId: 't2', start: '2026-07-20T10:30:00', end: '2026-07-20T11:30:00',
  }), false);
  assert.equal(hasTechConflict(bookings, {
    techId: 't1', start: '2026-07-20T11:00:00', end: '2026-07-20T11:45:00',
  }), false);
});

test('hasTechConflict ignores the booking currently being edited and unassigned work', () => {
  const bookings = [
    { id: 'edit-me', techId: 't3', start: '2026-07-20T13:00:00', end: '2026-07-20T14:00:00' },
  ];

  assert.equal(hasTechConflict(bookings, {
    id: 'edit-me', techId: 't3', start: '2026-07-20T13:15:00', end: '2026-07-20T14:15:00',
  }, 'edit-me'), false);
  assert.equal(hasTechConflict(bookings, {
    techId: null, start: '2026-07-20T13:15:00', end: '2026-07-20T14:15:00',
  }), false);
});
