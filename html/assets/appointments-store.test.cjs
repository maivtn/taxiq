const test = require('node:test');
const assert = require('node:assert/strict');
const catalogApi = require('./salon-data.js');
const store = require('./appointments-store.js');

function storage(seed = {}) {
  const values = new Map(Object.entries(seed));
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); },
  };
}

const catalog = catalogApi.DEFAULT_CATALOG;

test('appointment storage is scoped to the Bitcoin Nail Bar salon', () => {
  assert.equal(store.SALON_ID, 'bitcoin-nail-bar-houston');
  assert.equal(store.STORAGE_KEY, 'nexora:appointments:v1:bitcoin-nail-bar-houston');
});

test('normalizes a POS seed into canonical local date/time fields', () => {
  const record = store.normalizeAppointment({
    id: 'apt-1', name: 'Linh', phone: '(832) 555-0100', techId: 't2',
    serviceIds: ['pedi'], svc: '🦶 Pedicure', status: 'confirmed',
    source: 'Online', start: '2026-07-20T14:30:00', end: '2026-07-20T15:30:00',
  }, catalog, '2026-07-27T00:00:00.000Z');
  assert.equal(record.startAt, '2026-07-20T14:30:00');
  assert.equal(record.endAt, '2026-07-20T15:30:00');
  assert.equal(record.technicianId, 't2');
  assert.equal(record.status, 'confirmed');
  assert.deepEqual(record.serviceIds, ['pedi']);
});

test('normalizes decorative service icons out of service labels', () => {
  const record = store.normalizeAppointment({
    id: 'apt-decorated-service', name: 'Linh', phone: '8325550103',
    svc: '🤲 Manicure + 💅 Gel Service',
    startAt: '2026-07-20T14:30:00', endAt: '2026-07-20T16:15:00',
    status: 'confirmed',
  }, catalog, '2026-07-27T00:00:00.000Z');
  assert.deepEqual(record.serviceNames, ['Manicure', 'Gel Service']);
  assert.deepEqual(record.serviceIds, ['mani', 'gel']);

  const legacyRecord = store.normalizeAppointment({
    id: 'apt-legacy-decorated-service', name: 'Linh', phone: '8325550104',
    serviceNames: ['↗ 🤲 Manicure', '💅 Gel Service'],
    startAt: '2026-07-20T14:30:00', endAt: '2026-07-20T16:15:00',
    status: 'confirmed',
  }, catalog, '2026-07-27T00:00:00.000Z');
  assert.deepEqual(legacyRecord.serviceNames, ['Manicure', 'Gel Service']);
  assert.deepEqual(legacyRecord.serviceIds, ['mani', 'gel']);
});

test('normalizes shared service details with name, price, and duration', () => {
  const record = store.normalizeAppointment({
    id: 'apt-service-details', name: 'Linh', phone: '8325550100', techId: 't2',
    serviceIds: ['pedi', 'addon'], startAt: '2026-07-20T14:30:00', endAt: '2026-07-20T15:30:00',
    status: 'confirmed', source: 'Online',
  }, catalog, '2026-07-27T00:00:00.000Z');
  assert.deepEqual(record.serviceDetails, [
    { id: 'pedi', name: 'Pedicure', price: 30, durationMin: 60, icon: '🦶' },
    { id: 'addon', name: 'Add-on & Extra', price: 5, durationMin: 30, icon: '🎨' },
  ]);
});

test('retains unknown service names and technician names for forward-compatible rendering', () => {
  const record = store.normalizeAppointment({
    id: 'apt-unknown', name: 'Future Guest', phone: '8325550102',
    serviceNames: ['Builder Gel Deluxe'], technicianName: 'Guest Tech',
    startAt: '2026-07-20T14:30:00', endAt: '2026-07-20T15:30:00', status: 'confirmed',
  }, catalog, '2026-07-27T00:00:00.000Z');
  assert.deepEqual(record.serviceIds, []);
  assert.deepEqual(record.serviceNames, ['Builder Gel Deluxe']);
  assert.equal(record.technicianId, null);
  assert.equal(record.technicianName, 'Guest Tech');
});

test('maps Booking Book status separately from SMS state', () => {
  assert.deepEqual(store.mapBookingStatus('new'), { status: 'pending', smsStatus: 'not-sent' });
  assert.deepEqual(store.mapBookingStatus('sms-sent'), { status: 'pending', smsStatus: 'sent' });
  assert.deepEqual(store.mapBookingStatus('done'), { status: 'completed', smsStatus: 'not-sent' });
  assert.deepEqual(store.mapBookingStatus('noshow'), { status: 'no-show', smsStatus: 'not-sent' });
});

test('ensureSource is idempotent and does not overwrite a user edit', () => {
  const target = storage();
  const first = store.ensureSource('booking-book-static-v1', [{
    id: 'booking-1', name: 'Mary', phone: '8325550100', services: ['Pedicure'],
    tech: 'Kim N.', date: '2026-07-09', time: '09:00', duration: 60, status: 'new',
  }], target, catalog, '2026-07-27T00:00:00.000Z');
  assert.equal(first.inserted, 1);
  const edited = store.update('booking-1', { customerName: 'Mary Updated' }, target, catalog, '2026-07-27T00:00:01.000Z');
  assert.equal(edited.ok, true);
  const second = store.ensureSource('booking-book-static-v1', [{
    id: 'booking-1', name: 'Mary', phone: '8325550100', services: ['Pedicure'],
    tech: 'Kim N.', date: '2026-07-09', time: '09:00', duration: 60, status: 'new',
  }], target, catalog, '2026-07-27T00:00:02.000Z');
  assert.equal(second.inserted, 0);
  assert.equal(store.loadAll(target, catalog)[0].customerName, 'Mary Updated');
});

test('conflict detection excludes the edited appointment and ignores unassigned records', () => {
  const records = [{ id: 'existing', technicianId: 't2', startAt: '2026-07-20T10:00:00', endAt: '2026-07-20T11:00:00' }];
  assert.equal(store.hasConflict(records, { technicianId: 't2', startAt: '2026-07-20T10:30:00', endAt: '2026-07-20T11:30:00' }), true);
  assert.equal(store.hasConflict(records, { technicianId: 't2', startAt: '2026-07-20T10:30:00', endAt: '2026-07-20T11:30:00' }, 'existing'), false);
  assert.equal(store.hasConflict(records, { technicianId: null, startAt: '2026-07-20T10:30:00', endAt: '2026-07-20T11:30:00' }), false);
});

test('explicitly unassigning a technician clears the shared technician name', () => {
  const target = storage();
  store.upsert({
    id: 'apt-unassign', name: 'Linh', phone: '8325550100', serviceIds: ['pedi'], techId: 't2',
    start: '2026-07-20T10:00:00', end: '2026-07-20T11:00:00', status: 'confirmed',
  }, target, catalog, '2026-07-27T00:00:00.000Z');
  const result = store.update('apt-unassign', { technicianId: null }, target, catalog, '2026-07-27T00:00:01.000Z');
  assert.equal(result.ok, true);
  assert.equal(result.record.technicianId, null);
  assert.equal(result.record.technicianName, '');
});

test('cancel keeps the record and changes only its status', () => {
  const target = storage();
  store.upsert({
    id: 'apt-1', name: 'Linh', phone: '8325550100', serviceIds: ['pedi'], techId: null,
    start: '2026-07-20T10:00:00', end: '2026-07-20T11:00:00', status: 'confirmed',
  }, target, catalog, '2026-07-27T00:00:00.000Z');
  const result = store.cancel('apt-1', target, catalog, '2026-07-27T00:00:01.000Z');
  assert.equal(result.ok, true);
  assert.equal(store.loadAll(target, catalog)[0].status, 'cancelled');
});

test('invalid storage JSON falls back to an empty state', () => {
  const target = storage({ [store.STORAGE_KEY]: '{invalid' });
  assert.deepEqual(store.loadAll(target, catalog), []);
});

test('upsert keeps a newer record over an older incoming record', () => {
  const target = storage();
  const newer = store.upsert({
    id: 'apt-2', name: 'Newer', phone: '8325550101', serviceIds: ['pedi'], techId: null,
    start: '2026-07-20T10:00:00', end: '2026-07-20T11:00:00',
    updatedAt: '2026-07-27T00:00:02.000Z',
  }, target, catalog, '2026-07-27T00:00:02.000Z');
  assert.equal(newer.ok, true);
  const older = store.upsert({
    id: 'apt-2', name: 'Older', phone: '8325550101', serviceIds: ['pedi'], techId: null,
    start: '2026-07-20T10:00:00', end: '2026-07-20T11:00:00',
    updatedAt: '2026-07-27T00:00:01.000Z',
  }, target, catalog, '2026-07-27T00:00:01.000Z');
  assert.equal(older.skipped, true);
  assert.equal(store.loadAll(target, catalog)[0].customerName, 'Newer');
});

test('subscribe listens only to the appointment key and unsubscribes cleanly', () => {
  const handlers = {};
  const fakeWindow = {
    addEventListener(type, handler) { handlers[type] = handler; },
    removeEventListener(type) { delete handlers[type]; },
  };
  let calls = 0;
  const unsubscribe = store.subscribe(() => { calls += 1; }, fakeWindow);
  handlers.storage({ key: 'other-key' });
  assert.equal(calls, 0);
  handlers.storage({ key: store.STORAGE_KEY });
  assert.equal(calls, 1);
  unsubscribe();
  assert.equal(handlers.storage, undefined);
});
