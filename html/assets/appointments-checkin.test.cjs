const test = require('node:test');
const assert = require('node:assert/strict');
const store = require('./appointments-store.js');
const salon = require('./salon-data.js');

const catalog = salon.normalizeCatalog(salon.DEFAULT_CATALOG);
const now = '2026-09-15T10:00:00.000Z';

function storage(raw = null) {
  let saved = raw;
  const writes = [];
  return {
    writes,
    getItem(key) { assert.equal(key, store.STORAGE_KEY); return saved; },
    setItem(key, value) { assert.equal(key, store.STORAGE_KEY); writes.push(value); saved = value; },
  };
}

function payload(patch = {}) {
  return {
    id: 'visit-a', mode: 'single', contact: {name: '  Linh  ', phone: '+1 (832) 555-0100'},
    smsConsent: false,
    members: [{id: 'member-a', name: 'Old name', relationship: 'self', tickets: [{id: 'line-a', serviceId: 'pedi', technicianId: 't1'}]}],
    ...patch,
  };
}

function family(patch = {}) {
  return payload({mode: 'family', members: [
    {id: 'member-a', name: 'Old name', relationship: 'self', tickets: [{serviceId: 'pedi', technicianId: 't1'}]},
    {id: 'member-b', name: '', relationship: 'child', tickets: [{serviceId: 'mani', technicianId: 't2'}]},
  ], ...patch});
}

test('check-in creates a persisted member ticket with normalized contact and catalog details', () => {
  const target = storage();
  assert.equal(typeof store.checkIn, 'function');
  const result = store.checkIn(payload(), target, catalog, now);
  assert.equal(result.ok, true);
  assert.equal(result.records.length, 1);
  const record = result.records[0];
  assert.equal(record.customerName, 'Linh');
  assert.equal(record.phone, '8325550100');
  assert.equal(record.status, 'checked-in');
  assert.equal(record.source, 'front-desk');
  assert.deepEqual(record.metadata.checkIn, {
    id: 'visit-a', mode: 'single', contact: {name: 'Linh', phone: '8325550100'},
    memberId: 'member-a', relationship: 'self', ticketNumber: 10, smsConsent: false,
  });
  assert.equal(record.metadata.checkedInAt, now);
  assert.equal(record.tickets[0].serviceName, 'Pedicure');
  assert.equal(record.tickets[0].price, 30);
  assert.equal(record.tickets[0].technicianName, 'Tina');
  assert.equal(record.tickets[0].technicianId, 't1');
  assert.deepEqual(store.loadAll(target, catalog), result.records);
  assert.equal(target.writes.length, 1);
});

test('family check-in saves linked independent members together and supplies unnamed guest labels', () => {
  const target = storage();
  const result = store.checkIn(family({smsConsent: true}), target, catalog, now);
  assert.equal(result.ok, true);
  assert.deepEqual(result.records.map(record => record.customerName), ['Linh', 'Guest 2']);
  assert.deepEqual(result.records.map(record => record.metadata.checkIn.ticketNumber), [10, 11]);
  assert.deepEqual(result.records.map(record => record.tickets[0].technicianId), ['t1', 't2']);
  assert.equal(new Set(result.records.map(record => record.id)).size, 2);
  assert.ok(result.records.every(record => record.metadata.checkIn.id === 'visit-a' && record.metadata.checkIn.smsConsent));
  assert.equal(target.writes.length, 1);
  assert.equal(JSON.parse(target.writes[0]).records.length, 2);
});

test('family check-in can persist the primary guest before any companions are added', () => {
  const target = storage();
  const result = store.checkIn(payload({mode: 'family'}), target, catalog, now);
  assert.equal(result.ok, true);
  assert.equal(result.records.length, 1);
  assert.equal(result.records[0].customerName, 'Linh');
  assert.equal(result.records[0].metadata.checkIn.mode, 'family');
  assert.equal(result.records[0].metadata.checkIn.memberId, 'member-a');
  const saved = store.loadAll(target, catalog);
  assert.equal(saved.length, 1);
  assert.equal(saved[0].metadata.checkIn.mode, 'family');
});

test('family check-in rejects an empty group without persisting a visit', () => {
  const target = storage();
  const result = store.checkIn(family({members: []}), target, catalog, now);
  assert.equal(result.ok, false);
  assert.equal(result.error.code, 'members-invalid');
  assert.equal(target.getItem(store.STORAGE_KEY), null);
  assert.equal(target.writes.length, 0);
});

test('a repeated session returns the existing records without writing or changing the group', () => {
  const target = storage();
  const first = store.checkIn(family(), target, catalog, now);
  const replay = store.checkIn(family(), target, catalog, '2026-09-15T11:00:00.000Z');
  assert.equal(replay.ok, true);
  assert.equal(replay.replayed, true);
  assert.deepEqual(replay.records, first.records);
  assert.equal(target.writes.length, 1);
});

test('check-in accepts no services, duplicate selected services, and catalog prices that need confirmation', () => {
  const target = storage();
  const input = family();
  input.members[0].tickets = [];
  input.members[1].tickets = [{id: 'same', serviceId: 'kid'}, {id: 'same', serviceId: 'kid'}];
  const result = store.checkIn(input, target, catalog, now);
  assert.equal(result.ok, true);
  assert.deepEqual(result.records[0].tickets, []);
  assert.equal(result.records[1].tickets.length, 2);
  assert.ok(result.records[1].tickets.every(line => line.price === null && line.technicianId === null));
  assert.equal(new Set(result.records[1].tickets.map(line => line.id)).size, 2);
});

test('invalid group/contact input is rejected without persisting any members', () => {
  const invalid = [
    payload({id: ''}), payload({mode: 'other'}), payload({contact: {name: ' ', phone: '8325550100'}}),
    payload({contact: {name: 'Linh', phone: '222'}}), payload({contact: {name: 'Linh', phone: '28325550100'}}),
    payload({members: family().members}), payload({members: []}),
    payload({members: [{id: '', tickets: []}]}),
    family({members: [{id: 'same', tickets: []}, {id: 'same', tickets: []}]}),
    payload({members: [{id: 'a', tickets: 'pedi'}]}),
  ];
  for (const input of invalid) {
    const target = storage();
    const result = store.checkIn(input, target, catalog, now);
    assert.equal(result.ok, false, JSON.stringify(input));
    assert.ok(result.error.message);
    assert.equal(target.writes.length, 0);
  }
});

test('an unavailable service or technician in any member rolls back the complete check-in', () => {
  for (const line of [{serviceId: 'missing'}, {serviceId: 'pedi', technicianId: 'missing'}, {serviceId: 'inactive'}, {serviceId: 'pedi', technicianId: 'inactive'}]) {
    const custom = structuredClone(catalog);
    custom.services.push({id: 'inactive', name: 'Retired', active: false});
    custom.technicians.push({id: 'inactive', name: 'Retired', active: false});
    const target = storage();
    const input = family();
    input.members[1].tickets = [line];
    const result = store.checkIn(input, target, custom, now);
    assert.equal(result.ok, false);
    assert.equal(target.getItem(store.STORAGE_KEY), null);
    assert.equal(target.writes.length, 0);
  }
});

test('check-in never reports success for unavailable storage, failed writes, or damaged saved state', () => {
  for (const target of [
    undefined,
    {getItem() { throw new Error('blocked'); }, setItem() { assert.fail('must not write'); }},
    {getItem() { return null; }, setItem() { throw new Error('quota'); }},
    storage('{damaged'), storage(JSON.stringify({records: 'damaged'})),
  ]) {
    const result = store.checkIn(payload(), target, catalog, now);
    assert.equal(result.ok, false);
    assert.ok(result.error.message);
  }
});

test('failed storage write preserves every existing booking and does not create a partial group', () => {
  const target = storage();
  store.create({id: 'existing', phone: '8325550199', startAt: '2026-09-15T15:00:00', metadata: {keep: true}}, target, catalog, now);
  const before = target.getItem(store.STORAGE_KEY);
  const broken = {getItem: target.getItem, setItem() { throw new Error('quota'); }};
  assert.equal(store.checkIn(family(), broken, catalog, now).ok, false);
  assert.equal(target.getItem(store.STORAGE_KEY), before);
});

test('check-in numbers remain unique above seeded tickets and legacy estimates across sessions', () => {
  const target = storage();
  store.create({id: 'estimate-old', phone: '8325550199', status: 'checked-in', metadata: {estimate: {totalCents: 0}}}, target, catalog, now);
  const first = store.checkIn(family(), target, catalog, now);
  assert.deepEqual(first.records.map(record => record.metadata.checkIn.ticketNumber), [11, 12]);
  const later = store.checkIn(payload({id: 'visit-b'}), target, catalog, now);
  assert.ok(later.records[0].metadata.checkIn.ticketNumber > 12);
  assert.deepEqual(store.loadAll(target, catalog).filter(record => record.metadata.checkIn?.id === 'visit-a').map(record => record.metadata.checkIn.ticketNumber), [11, 12]);
});

test('waiting check-in technician preferences neither conflict with bookings nor reserve the calendar', () => {
  const target = storage();
  store.create({id: 'booked', phone: '8325550199', startAt: new Date(now), tickets: [{serviceId: 'pedi', technicianId: 't1'}]}, target, catalog, now);
  const result = store.checkIn(payload(), target, catalog, now);
  assert.equal(result.ok, true);
  const preferenceOnly = storage();
  store.checkIn(payload(), preferenceOnly, catalog, now);
  const booking = store.create({id: 'new-booking', phone: '8325550198', startAt: new Date(now), tickets: [{serviceId: 'pedi', technicianId: 't1'}]}, preferenceOnly, catalog, now);
  assert.equal(booking.ok, true);
  assert.equal(store.hasConflict(store.loadAll(target, catalog), result.records[0]), false);
});

test('an eligible matching appointment becomes the representative check-in without a duplicate booking', () => {
  const target = storage();
  const created = store.create({id: 'booking-a', customerName: 'Booked name', phone: '(832) 555-0100', status: 'confirmed', startAt: '2026-09-15T09:00:00', tickets: [{serviceId: 'gel', technicianId: 't2'}], metadata: {origin: 'online'}, note: 'Keep guest note'}, target, catalog, '2026-09-14T12:00:00.000Z');
  const result = store.checkIn(family({appointmentId: 'booking-a'}), target, catalog, now);
  assert.equal(result.ok, true);
  assert.equal(result.records[0].id, 'booking-a');
  assert.equal(result.records[0].createdAt, created.record.createdAt);
  assert.equal(result.records[0].updatedAt, now);
  assert.equal(result.records[0].metadata.origin, 'online');
  assert.equal(result.records[0].note, 'Keep guest note');
  assert.equal(result.records[0].tickets[0].serviceId, 'pedi');
  assert.equal(result.records[0].tickets[0].technicianId, 't1');
  assert.equal(result.records[0].status, 'checked-in');
  assert.equal(store.loadAll(target, catalog).length, 2);
  assert.equal(target.writes.length, 2);
  const replay = store.checkIn(family({appointmentId: 'booking-a'}), target, catalog, now);
  assert.equal(replay.replayed, true);
  assert.equal(target.writes.length, 2);
});

test('changed, missing, or mismatched appointment stops the whole group before any write', () => {
  for (const booking of [null, {status: 'checked-in'}, {status: 'cancelled'}, {status: 'completed'}, {status: 'confirmed', phone: '8325550199'}]) {
    const target = storage();
    if (booking) store.create({id: 'booking-a', phone: '8325550100', ...booking}, target, catalog, now);
    const before = target.getItem(store.STORAGE_KEY);
    const result = store.checkIn(family({appointmentId: 'booking-a'}), target, catalog, now);
    assert.equal(result.ok, false);
    assert.equal(target.getItem(store.STORAGE_KEY), before);
  }
});

test('invalid companion services leave a matching appointment unchanged', () => {
  const target = storage();
  store.create({id: 'booking-a', phone: '8325550100', status: 'pending'}, target, catalog, now);
  const before = target.getItem(store.STORAGE_KEY);
  const input = family({appointmentId: 'booking-a'});
  input.members[1].tickets = [{serviceId: 'removed'}];
  assert.equal(store.checkIn(input, target, catalog, now).ok, false);
  assert.equal(target.getItem(store.STORAGE_KEY), before);
});

test('checking in a booked service preserves its saved price and duration despite a changed catalog', () => {
  const target = storage();
  store.create({id: 'booking-priced', phone: '8325550100', status: 'confirmed', tickets: [
    {id: 'booked-mani', serviceId: 'mani', price: 18, durationMin: 30, technicianId: 't1'},
  ]}, target, catalog, now);
  const input = payload({appointmentId: 'booking-priced'});
  input.members[0].tickets = [{id: 'booked-mani', serviceId: 'mani', price: 999, durationMin: 1, technicianId: 't2'}];
  const result = store.checkIn(input, target, catalog, now);
  assert.equal(result.ok, true);
  assert.equal(result.records[0].tickets[0].price, 18);
  assert.equal(result.records[0].tickets[0].durationMin, 30);
  assert.equal(result.records[0].tickets[0].technicianId, 't2');
  const saved = store.loadAll(target, catalog)[0];
  assert.equal(saved.tickets[0].price, 18);
  assert.equal(saved.durationMin, 30);
  assert.equal(saved.serviceDetails[0].price, 18);
});

test('new service rows and companions cannot inherit a representative booking line price', () => {
  const target = storage();
  store.create({id: 'booking-priced', phone: '8325550100', status: 'pending', tickets: [
    {id: 'booked-mani', serviceId: 'mani', price: 18, durationMin: 30},
    {id: 'changed-service', serviceId: 'pedi', price: 20, durationMin: 25},
  ]}, target, catalog, now);
  const input = family({appointmentId: 'booking-priced'});
  input.members[0].tickets = [
    {id: 'new-mani', serviceId: 'mani', price: 18, durationMin: 30},
    {id: 'changed-service', serviceId: 'mani', price: 20, durationMin: 25},
  ];
  input.members[1].tickets = [{id: 'booked-mani', serviceId: 'mani', price: 18, durationMin: 30}];
  const result = store.checkIn(input, target, catalog, now);
  assert.equal(result.ok, true);
  assert.deepEqual(result.records.flatMap(record => record.tickets.map(line => ({price: line.price, durationMin: line.durationMin}))), [
    {price: 22, durationMin: 45}, {price: 22, durationMin: 45}, {price: 22, durationMin: 45},
  ]);
});
